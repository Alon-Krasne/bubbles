import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

import { VOCAB_WORDS } from '../src/words.ts';
import { GAME_LEVELS, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const MODEL = 'gemini-3.1-flash-tts-preview';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const OUTPUT_ROOT = resolve(import.meta.dirname, '../src/assets/audio/vocabulary/en');
const MANIFEST_PATH = resolve(OUTPUT_ROOT, 'generation-manifest.json');
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 4;
const GENERATION_PROFILE = 'v1:Leda:warm-youthful-American-English:slightly-slower:exact-transcript';
const LITERACY_VERB_CONTEXT = {
  read: 'I like to read books',
  write: 'I like to write stories',
};

const UI_TRANSCRIPTS = {
  a: 'a',
  an: 'an',
  and: 'and',
  'can-i-have': 'Can I have',
  'do-you-have': 'Do you have',
  'i-want': 'I want',
  'i-would-like': 'I would like',
  one: 'one',
  please: 'please',
  'thank-you': 'Thank you!',
  the: 'the',
  three: 'three',
  two: 'two',
};

const UI_GUIDANCE = {
  a: 'Pronounce the unstressed article “a” as in “a dog”. Output only the article.',
  an: 'Pronounce the article “an” as in “an apple”. Output only the article.',
  and: 'Pronounce “and” as a connector between two requested items, with gentle continuation intonation.',
  'can-i-have': 'Speak this as the opening of a friendly request. Use continuation intonation because the requested item follows.',
  'do-you-have': 'Speak this as the opening of a friendly question. Use continuation intonation because the requested item follows.',
  'i-want': 'Speak this as the opening of a friendly request. Use continuation intonation because the requested item follows.',
  'i-would-like': 'Speak this as the opening of a polite request. Use continuation intonation because the requested item follows.',
  one: 'Pronounce the quantity word clearly before an item name.',
  please: 'Speak this as the warm, polite ending of a request.',
  'thank-you': 'Speak this as a short, cheerful success response.',
  the: 'Pronounce the definite article “the” as in “the book”. Output only the article.',
  three: 'Pronounce the quantity word clearly before an item name.',
  two: 'Pronounce the quantity word clearly before an item name.',
};

const PLURALS = {
  cherry: 'cherries',
  cherries: 'cherries',
  peach: 'peaches',
  potato: 'potatoes',
  strawberry: 'strawberries',
  tomato: 'tomatoes',
};

function pluralize(english) {
  const compact = english.replace(/\s+/g, '-');
  if (PLURALS[compact]) {
    return PLURALS[compact];
  }
  if (/[^aeiou]y$/i.test(english)) {
    return `${english.slice(0, -1)}ies`;
  }
  if (/(s|x|z|ch|sh)$/i.test(english)) {
    return `${english}es`;
  }
  return `${english}s`;
}

function readApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  const authPath = resolve(homedir(), '.local/share/opencode/auth.json');
  const auth = JSON.parse(readFileSync(authPath, 'utf8'));
  if (auth.google?.type !== 'api' || typeof auth.google.key !== 'string') {
    throw new Error('Google API key is not loaded in OpenCode auth');
  }
  return auth.google.key;
}

function createWaveFile(pcm) {
  const header = Buffer.alloc(44);
  const sampleRate = 24000;
  const channels = 1;
  const bytesPerSample = 2;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
  header.writeUInt16LE(channels * bytesPerSample, 32);
  header.writeUInt16LE(bytesPerSample * 8, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function requestAudio(apiKey, clip) {
  const { transcript } = clip;
  const literacyContext = LITERACY_VERB_CONTEXT[transcript];
  const uiGuidance = clip.uiId ? UI_GUIDANCE[clip.uiId] : null;
  const direction = uiGuidance
    ? [
      'Synthesize speech only. Do not speak these instructions.',
      'Audio profile: a warm, youthful, friendly American English teacher for children.',
      `Director notes: ${uiGuidance} Speak clearly at a slightly slower learning pace, with no added words.`,
      `Transcript: ${transcript}`,
    ]
    : literacyContext
    ? [
      'Synthesize speech only. Do not speak these instructions.',
      'Audio profile: a warm, clear American English language-learning narrator.',
      `Director notes: pronounce the exact single-word transcript as the present-tense verb in “${literacyContext}”, slightly slower than ordinary conversation, with no added words.`,
      `Transcript: ${transcript}`,
    ]
    : [
      'Synthesize speech only. Do not speak these instructions.',
      'Audio profile: a warm, youthful, friendly American English teacher for children.',
      'Director notes: pronounce the exact transcript clearly, slightly slower than ordinary conversation, with no added words.',
      `Transcript: ${transcript}`,
    ];

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        input: direction.join('\n'),
        response_format: { type: 'audio' },
        generation_config: { speech_config: [{ voice: 'Leda' }] },
      }),
    });

    if (response.ok) {
      const interaction = await response.json();
      const audio = interaction.steps?.[0]?.content?.[0];
      if (audio?.type !== 'audio'
        || audio.mime_type !== 'audio/l16'
        || audio.channels !== 1
        || audio.sample_rate !== 24000
        || typeof audio.data !== 'string') {
        throw new Error(`Unexpected Google TTS response for ${JSON.stringify(transcript)}`);
      }
      return Buffer.from(audio.data, 'base64');
    }

    const errorBody = await response.text();
    if (attempt === MAX_ATTEMPTS) {
      throw new Error(`Google TTS failed for ${JSON.stringify(transcript)} (${response.status}): ${errorBody}`);
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1000));
  }

  throw new Error(`Google TTS exhausted attempts for ${JSON.stringify(transcript)}`);
}

function clipHash(clip) {
  const profile = clip.uiId
    ? `v2:Leda:store-fragment:${clip.uiId}:${UI_GUIDANCE[clip.uiId]}`
    : LITERACY_VERB_CONTEXT[clip.transcript]
    ? `v1:Leda:neutral-American-English:${clip.transcript}-present-tense:exact-transcript`
    : GENERATION_PROFILE;
  return createHash('sha256')
    .update(JSON.stringify({ model: MODEL, profile, transcript: clip.transcript }))
    .digest('hex');
}

function saveManifest(manifest) {
  mkdirSync(OUTPUT_ROOT, { recursive: true });
  const temporaryManifest = `${MANIFEST_PATH}.tmp`;
  writeFileSync(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`);
  renameSync(temporaryManifest, MANIFEST_PATH);
}

async function generateClip(apiKey, clip, manifest) {
  const output = resolve(OUTPUT_ROOT, clip.relativePath);
  const hash = clipHash(clip);
  if (existsSync(output) && manifest[clip.relativePath] === hash) {
    return `cached ${clip.relativePath}`;
  }

  mkdirSync(resolve(output, '..'), { recursive: true });
  const temporaryWave = `${output}.wav`;
  const temporaryMp3 = `${output}.tmp.mp3`;
  const pcm = await requestAudio(apiKey, clip);
  writeFileSync(temporaryWave, createWaveFile(pcm));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', temporaryWave, '-codec:a', 'libmp3lame', '-b:a', '64k', temporaryMp3]);
  renameSync(temporaryMp3, output);
  unlinkSync(temporaryWave);
  manifest[clip.relativePath] = hash;
  saveManifest(manifest);
  return `generated ${clip.relativePath}`;
}

async function runPool(items, worker) {
  let nextIndex = 0;
  async function runWorker() {
    while (nextIndex < items.length) {
      const item = items[nextIndex];
      nextIndex += 1;
      console.log(await worker(item));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, runWorker));
}

async function main() {
  const wordById = new Map(VOCAB_WORDS.map((word) => [word.id, word]));
  const memoryWordIds = TRAIL_STAGES
    .filter((stage) => stage.game === 'memory')
    .flatMap((stage) => getGameLevel(stage.game, stage.level).wordPool);
  const shopWordIds = GAME_LEVELS.shop.flatMap((level) => level.itemPool);
  const activeWordIds = [...new Set([...memoryWordIds, ...shopWordIds])];
  const quantityWordIds = getGameLevel('shop', 'shop-level-3').itemPool;
  const clips = [
    ...activeWordIds.map((wordId) => ({ relativePath: `words/${wordId}.mp3`, transcript: wordById.get(wordId).english })),
    ...quantityWordIds.map((wordId) => ({ relativePath: `plurals/${wordId}.mp3`, transcript: pluralize(wordById.get(wordId).english) })),
    ...Object.entries(UI_TRANSCRIPTS).map(([id, transcript]) => ({ relativePath: `ui/${id}.mp3`, transcript, uiId: id })),
  ];

  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  const apiKey = readApiKey();
  const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
  await runPool(clips, (clip) => generateClip(apiKey, clip, manifest));
  console.log(JSON.stringify({ model: MODEL, clips: clips.length, activeWords: activeWordIds.length }));
}

await main();
