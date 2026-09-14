import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';

// English has one clip per request; Hebrew has a male and a female recording so
// the spoken sentence matches the child's grammatical gender.
const clips = [
  ...MAGIC_HOUSE_REQUESTS.map((request) => ({ relativePath: `en/${request.id}.wav` })),
  ...MAGIC_HOUSE_REQUESTS.map((request) => ({ relativePath: `he/${request.id}.wav` })),
  ...MAGIC_HOUSE_REQUESTS.map((request) => ({ relativePath: `he/${request.id}-female.wav` })),
];

let decodedClips = 0;
for (const { relativePath } of clips) {
  const wave = readFileSync(resolve(import.meta.dirname, `../prototype/assets/magic-house/audio/${relativePath}`));
  assert.equal(wave.toString('ascii', 0, 4), 'RIFF', `invalid RIFF header: ${relativePath}`);
  assert.equal(wave.toString('ascii', 8, 12), 'WAVE', `invalid WAVE header: ${relativePath}`);
  assert.equal(wave.readUInt16LE(22), 1, `room speech must be mono: ${relativePath}`);
  assert.equal(wave.readUInt32LE(24), 24000, `room speech must use 24 kHz: ${relativePath}`);
  assert.ok(wave.length > 1000, `room speech clip is empty: ${relativePath}`);
  decodedClips += 1;
}

assert.equal(decodedClips, clips.length);
console.log(JSON.stringify({ requests: MAGIC_HOUSE_REQUESTS.length, decodedClips }));
