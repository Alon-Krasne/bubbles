import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { GAME_LEVELS, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const root = resolve(import.meta.dirname, '..');
const memoryWordIds = TRAIL_STAGES
  .filter((stage) => stage.game === 'memory')
  .flatMap((stage) => getGameLevel(stage.game, stage.level).wordPool);
const shopWordIds = GAME_LEVELS.shop.flatMap((level) => level.itemPool);
const activeWordIds = [...new Set([...memoryWordIds, ...shopWordIds])];
const quantityWordIds = getGameLevel('shop', 'shop-level-3').itemPool;
const uiClipIds = ['a', 'an', 'and', 'can-i-have', 'one', 'please', 'thank-you', 'the', 'three', 'two'];

const expectedFiles = [
  ...activeWordIds.map((wordId) => `src/assets/audio/vocabulary/en/words/${wordId}.mp3`),
  ...quantityWordIds.map((wordId) => `src/assets/audio/vocabulary/en/plurals/${wordId}.mp3`),
  ...uiClipIds.map((clipId) => `src/assets/audio/vocabulary/en/ui/${clipId}.mp3`),
];

for (const relativePath of expectedFiles) {
  const filePath = resolve(root, relativePath);
  assert.ok(existsSync(filePath), `missing committed vocabulary audio ${relativePath}`);
  assert.ok(statSync(filePath).size > 1000, `vocabulary audio is empty ${relativePath}`);
}

for (const sourcePath of ['src/main.ts', 'src/shop.ts']) {
  const source = readFileSync(resolve(root, sourcePath), 'utf8');
  assert.ok(!source.includes('SpeechSynthesisUtterance'), `${sourcePath} still uses device speech synthesis`);
  assert.ok(!source.includes('speechSynthesis'), `${sourcePath} still uses device speech synthesis`);
}

console.log(JSON.stringify({
  committedClips: expectedFiles.length,
  activeWords: activeWordIds.length,
  pluralForms: quantityWordIds.length,
  uiClips: uiClipIds.length,
}));
