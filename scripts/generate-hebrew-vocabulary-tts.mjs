import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

import { VOCAB_WORDS } from '../src/words.ts';
import { GAME_LEVELS, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const MODEL = 'gemini-3.1-flash-tts-preview';
const VERIFIER_MODEL = 'gemini-3.8-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const OUTPUT_ROOT = resolve(import.meta.dirname, '../src/assets/audio/vocabulary/he');
const MANIFEST_PATH = resolve(OUTPUT_ROOT, 'generation-manifest.json');
const MAX_ATTEMPTS = 3;
const CONCURRENCY = 4;
const VOICE = 'Leda';
const GENERATION_PROFILE = `v1:${VOICE}:warm-youthful-Israeli-Hebrew:exact-transcript`;

// Spoken Hebrew fragments used to assemble Store requests and praise from the
// same recorded clips as the vocabulary words. Spelling matches the on-screen
// Hebrew sentence in src/shop.ts.
const UI_TRANSCRIPTS = {
  'can-i-have': 'אפשר בבקשה',
  and: 'וגם',
  quantity: 'בכמות',
  one: 'אחת',
  two: 'שתיים',
  three: 'שלוש',
  'thank-you': 'תודה',
  'great-job': 'כל הכבוד',
};

const UI_GUIDANCE = {
  'can-i-have': 'Speak this as the warm opening of a friendly request; the requested item follows, so use continuation intonation.',
  and: 'Pronounce this as the Hebrew connector between two requested items, with gentle continuation intonation.',
  quantity: 'Speak this as the phrase before a spoken quantity, with continuation intonation.',
  one: 'Pronounce the Hebrew number one clearly.',
  two: 'Pronounce the Hebrew number two clearly.',
  three: 'Pronounce the Hebrew number three clearly.',
  'thank-you': 'Speak this as a short, cheerful thank you.',
  'great-job': 'Speak this as a warm, encouraging praise for a child.',
};

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

function readAudioPayload(interaction, label) {
  const audio = interaction.steps?.[0]?.content?.[0];
  if (audio?.type !== 'audio'
    || typeof audio.mime_type !== 'string'
    || !audio.mime_type.startsWith('audio/l16')
    || audio.channels !== 1
    || Number(audio.sample_rate) !== 24000
    || typeof audio.data !== 'string') {
    throw new Error(`Unexpected Google TTS response for ${JSON.stringify(label)}`);
  }
  return Buffer.from(audio.data, 'base64');
}

async function requestAudio(apiKey, clip) {
  const { transcript } = clip;
  const uiGuidance = clip.uiId ? UI_GUIDANCE[clip.uiId] : null;
  const direction = uiGuidance
    ? [
      'Synthesize speech only. Do not speak these instructions.',
      'Audio profile: a native Israeli Hebrew speaker and warm teacher for children.',
      `Director notes: ${uiGuidance} Speak clearly at a slightly slower learning pace, with no added words.`,
      `Transcript: ${transcript}`,
    ]
    : [
      'Synthesize speech only. Do not speak these instructions.',
      'Audio profile: a native Israeli Hebrew speaker and warm teacher for children.',
      `Director notes: The transcript is the Hebrew word for "${clip.english}". Read the exact Hebrew transcript aloud with natural Israeli Hebrew pronunciation, slightly slower than ordinary conversation, with no added words.`,
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
        generation_config: { speech_config: [{ voice: VOICE }] },
      }),
    });

    if (response.ok) {
      const interaction = await response.json();
      return readAudioPayload(interaction, transcript);
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
    ? `${GENERATION_PROFILE}:${clip.uiId}:${UI_GUIDANCE[clip.uiId]}`
    : `${GENERATION_PROFILE}:word:${clip.english}`;
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

function readManifestHash(entry) {
  return typeof entry === 'string' ? entry : entry?.hash;
}

// Short isolated Hebrew words are unstable across TTS samples, so every clip is
// listened to by a verifier model and regenerated until it pronounces the
// transcript. A clip only counts as done once it has passed.
async function verifyClip(apiKey, audio, expected, mimeType) {
  const prompt = `Listen to this audio. Does the speaker say exactly the Hebrew word/phrase ${JSON.stringify(expected)} (ignoring niqqud and punctuation)? Answer only YES or NO.`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${VERIFIER_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: audio.toString('base64') } },
            { text: prompt },
          ],
        }],
      }),
    });

    if (response.status === 429) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1500));
      continue;
    }
    if (!response.ok) {
      throw new Error(`Hebrew audio verification failed (${response.status}): ${await response.text()}`);
    }

    const body = await response.json();
    const verdict = body.candidates?.[0]?.content?.parts?.map((part) => part.text).join('')?.trim() ?? '';
    if (/^YES/i.test(verdict)) {
      return true;
    }
    if (verdict) {
      return false;
    }
  }

  throw new Error(`Hebrew audio verifier throttled for ${JSON.stringify(expected)}`);
}

async function generateClip(apiKey, clip, manifest) {
  const output = resolve(OUTPUT_ROOT, clip.relativePath);
  const hash = clipHash(clip);
  const cachedEntry = manifest[clip.relativePath];
  const isVerified = typeof cachedEntry === 'object' && cachedEntry?.verified === true;

  mkdirSync(resolve(output, '..'), { recursive: true });

  if (existsSync(output) && readManifestHash(cachedEntry) === hash) {
    if (isVerified) {
      return `cached ${clip.relativePath}`;
    }
    if (await verifyClip(apiKey, readFileSync(output), clip.transcript, 'audio/mpeg')) {
      manifest[clip.relativePath] = { hash, verified: true };
      saveManifest(manifest);
      return `verified ${clip.relativePath}`;
    }
    console.log(`rejected cached ${clip.relativePath} (${VERIFIER_MODEL} heard something else)`);
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const pcm = await requestAudio(apiKey, clip);
    const wave = createWaveFile(pcm);
    if (!await verifyClip(apiKey, wave, clip.transcript, 'audio/wav')) {
      console.log(`rejected ${clip.relativePath} attempt ${attempt} (${VERIFIER_MODEL} heard something else)`);
      continue;
    }

    const temporaryWave = `${output}.wav`;
    const temporaryMp3 = `${output}.tmp.mp3`;
    writeFileSync(temporaryWave, wave);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', temporaryWave, '-codec:a', 'libmp3lame', '-b:a', '64k', temporaryMp3]);
    renameSync(temporaryMp3, output);
    unlinkSync(temporaryWave);
    manifest[clip.relativePath] = { hash, verified: true };
    saveManifest(manifest);
    return `generated ${clip.relativePath}`;
  }

  throw new Error(`Hebrew TTS could not pronounce ${JSON.stringify(clip.transcript)} after ${MAX_ATTEMPTS} attempts`);
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

export function buildHebrewClips(vocabulary = VOCAB_WORDS) {
  const wordById = new Map(vocabulary.map((word) => [word.id, word]));
  const memoryWordIds = TRAIL_STAGES
    .filter((stage) => stage.game === 'memory')
    .flatMap((stage) => getGameLevel(stage.game, stage.level).wordPool);
  const shopWordIds = GAME_LEVELS.shop.flatMap((level) => level.itemPool);
  const activeWordIds = [...new Set([...memoryWordIds, ...shopWordIds])];

  return [
    ...activeWordIds.map((wordId) => ({
      relativePath: `words/${wordId}.mp3`,
      transcript: wordById.get(wordId).hebrew,
      english: wordById.get(wordId).english,
    })),
    ...Object.entries(UI_TRANSCRIPTS).map(([id, transcript]) => ({ relativePath: `ui/${id}.mp3`, transcript, uiId: id })),
  ];
}

async function main() {
  const clips = buildHebrewClips();
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  const apiKey = readApiKey();
  const manifest = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) : {};
  await runPool(clips, (clip) => generateClip(apiKey, clip, manifest));
  console.log(JSON.stringify({ model: MODEL, voice: VOICE, clips: clips.length }));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  await main();
}
