import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';

let decodedClips = 0;
for (const language of ['en', 'he']) {
  for (const request of MAGIC_HOUSE_REQUESTS) {
    const path = resolve(import.meta.dirname, `../prototype/assets/magic-house/audio/${language}/${request.id}.wav`);
    const wave = readFileSync(path);
    assert.equal(wave.toString('ascii', 0, 4), 'RIFF', `invalid RIFF header: ${language}/${request.id}`);
    assert.equal(wave.toString('ascii', 8, 12), 'WAVE', `invalid WAVE header: ${language}/${request.id}`);
    assert.equal(wave.readUInt16LE(22), 1, `room speech must be mono: ${language}/${request.id}`);
    assert.equal(wave.readUInt32LE(24), 24000, `room speech must use 24 kHz: ${language}/${request.id}`);
    assert.ok(wave.length > 1000, `room speech clip is empty: ${language}/${request.id}`);
    decodedClips += 1;
  }
}

assert.equal(decodedClips, MAGIC_HOUSE_REQUESTS.length * 2);
console.log(JSON.stringify({ requests: MAGIC_HOUSE_REQUESTS.length, decodedClips }));
