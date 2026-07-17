import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const openingClipIds = ['can-i-have', 'do-you-have', 'i-want', 'i-would-like'];
const remainingClipIds = ['a', 'an', 'and', 'one', 'please', 'thank-you', 'the', 'three', 'two'];
const clipIds = [...openingClipIds, ...remainingClipIds];

for (const clipId of clipIds) {
  const filePath = resolve(root, `src/assets/audio/vocabulary/en/ui/${clipId}.mp3`);
  assert.ok(existsSync(filePath), `missing Store sentence clip ${clipId}`);
  assert.ok(statSync(filePath).size > 1000, `Store sentence clip is empty ${clipId}`);
}

const shopSource = readFileSync(resolve(root, 'src/shop.ts'), 'utf8');
for (const clipId of openingClipIds) {
  assert.ok(shopSource.includes(`vocabularyUiAudio('${clipId}')`), `Store does not use opening clip ${clipId}`);
}

console.log(JSON.stringify({ storeUiClips: clipIds.length, openingFrames: openingClipIds.length }));
