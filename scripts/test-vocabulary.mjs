import assert from 'node:assert/strict';

import { VOCAB_WORDS } from '../src/words.ts';
import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';
import { GAME_LEVELS, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const vocabularyIds = new Set(VOCAB_WORDS.map((word) => word.id));
const englishWords = new Set(VOCAB_WORDS.map((word) => word.english));
const hebrewWords = new Set(VOCAB_WORDS.map((word) => word.hebrew));
const niqqudPattern = /[\u0591-\u05bd\u05bf-\u05c7]/;

assert.ok(VOCAB_WORDS.length >= 210, `expected at least 210 vocabulary entries, received ${VOCAB_WORDS.length}`);
assert.equal(vocabularyIds.size, VOCAB_WORDS.length, 'vocabulary ids must be unique');
assert.equal(englishWords.size, VOCAB_WORDS.length, 'English vocabulary text must be unique');
assert.equal(hebrewWords.size, VOCAB_WORDS.length, 'Hebrew vocabulary text must be unique');
assert.ok(VOCAB_WORDS.every((word) => !niqqudPattern.test(word.hebrew)), 'Hebrew learning material must not contain niqqud');

const calculator = VOCAB_WORDS.find((word) => word.id === 'calculator');
assert.equal(calculator?.drawing, '🖩', 'calculator vocabulary must use the pocket-calculator symbol, not the abacus emoji');
assert.ok(!niqqudPattern.test(JSON.stringify(MAGIC_HOUSE_REQUESTS)), 'Magic House learning material must not contain niqqud');
assert.ok(!niqqudPattern.test(JSON.stringify(TRAIL_STAGES)), 'Trail learning material must not contain niqqud');

const routedMemoryLevels = TRAIL_STAGES
  .filter((stage) => stage.game === 'memory')
  .map((stage) => getGameLevel(stage.game, stage.level));
const routedMemoryPairs = routedMemoryLevels.map((level) => level.pairs);
assert.ok(
  routedMemoryPairs.every((pairs, index) => index === 0 || pairs >= routedMemoryPairs[index - 1]),
  'routed Memory board size must never shrink along the trail',
);
assert.ok(routedMemoryPairs.at(-1) > routedMemoryPairs[0], 'routed Memory must get bigger before the finale');

for (const level of routedMemoryLevels) {
  assert.ok(level.pairs >= 4, `${level.id} must have a real board`);
  assert.ok(level.wordPool.length >= level.pairs, `${level.id} word pool is too small`);
  assert.equal(new Set(level.wordPool).size, level.wordPool.length, `${level.id} repeats a word in its pool`);
}

for (const level of GAME_LEVELS.shop) {
  assert.ok(Array.isArray(level.itemPool), `${level.id} must declare its generated item pool`);
  assert.ok(level.itemPool.length >= level.shelfSize, `${level.id} item pool is smaller than its shelf`);
  assert.ok(level.itemPool.every((wordId) => vocabularyIds.has(wordId)), `${level.id} references unknown vocabulary`);
  assert.ok(
    level.itemPool.every((wordId) => VOCAB_WORDS.find((word) => word.id === wordId)?.shoppable),
    `${level.id} contains a non-shoppable item`,
  );
}

console.log(JSON.stringify({
  vocabularyCount: VOCAB_WORDS.length,
  routedMemoryLevels: routedMemoryLevels.length,
  routedMemoryPairs,
  shopPoolSizes: GAME_LEVELS.shop.map((level) => level.itemPool.length),
}));
