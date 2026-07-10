const { mkdirSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required');
}

const lines = {
  en: [
    'Put the pillow on the bed.',
    'Put the ball in the toy box.',
    'Put the blue book on the shelf.',
    'Put the shoes under the bed.',
    'Put the yellow lamp next to the bed.',
    'Put the red apple on the table and the teddy bear on the bed.',
  ],
  he: [
    'שים את הכרית על המיטה.',
    'שים את הכדור בקופסת הצעצועים.',
    'שים את הספר הכחול על המדף.',
    'שים את הנעליים מתחת למיטה.',
    'שים את המנורה הצהובה ליד המיטה.',
    'שים את התפוח האדום על השולחן ואת הדובי על המיטה.',
  ],
};

const voices = {
  en: 'Leda',
  he: 'Puck',
};

async function generateLine(language, transcript, index) {
  const languageDirection = language === 'en'
    ? 'Use clear American English pronunciation.'
    : 'Use natural Israeli Hebrew pronunciation.';
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'gemini-3.1-flash-tts-preview',
      input: [
        'Synthesize speech only. Do not speak these instructions.',
        'Use a warm, playful, encouraging voice for a young child.',
        'Speak clearly at a slightly slower learning pace, with natural pauses.',
        languageDirection,
        `Transcript: ${transcript}`,
      ].join(' '),
      response_format: { type: 'audio' },
      generation_config: {
        speech_config: [{ voice: voices[language] }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Google TTS request failed (${response.status}): ${await response.text()}`);
  }

  const interaction = await response.json();
  const audio = interaction.steps[0].content[0];
  if (audio.type !== 'audio' || audio.mime_type !== 'audio/l16' || audio.channels !== 1 || audio.sample_rate !== 24000) {
    throw new Error(`Unexpected Google TTS response for ${language} request ${index + 1}`);
  }

  const directory = resolve(__dirname, `../prototype/assets/magic-house/audio/${language}`);
  mkdirSync(directory, { recursive: true });
  const output = resolve(directory, `request-${index + 1}.wav`);
  const pcm = Buffer.from(audio.data, 'base64');
  writeFileSync(output, createWaveFile(pcm, audio.sample_rate, audio.channels));
  console.log(`Generated ${language}/request-${index + 1}.wav`);
}

function createWaveFile(pcm, sampleRate, channels) {
  const header = Buffer.alloc(44);
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

async function main() {
  for (const [language, transcripts] of Object.entries(lines)) {
    for (const [index, transcript] of transcripts.entries()) {
      await generateLine(language, transcript, index);
    }
  }
}

main();
