import assert from 'node:assert/strict';

import { VOCAB_WORDS } from '../src/words.ts';
import { GAME_LEVELS, createParkLevel, getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

const vocabularyIds = new Set(VOCAB_WORDS.map((word) => word.id));

assert.equal(GAME_LEVELS.park.length, 5, 'Park must have exactly 5 difficulty levels');

const ranks = GAME_LEVELS.park.map((level) => level.difficultyRank);
assert.deepEqual(ranks, [1, 2, 3, 4, 5], 'Park difficulty ranks must be 1, 2, 3, 4, 5');

for (const level of GAME_LEVELS.park) {
  assert.ok(level.id.startsWith('park-level-'), `${level.id} must follow park-level- naming`);
  assert.ok(level.findCount >= 4 && level.findCount <= 8, `${level.id} findCount must be 4..8`);
  assert.ok(level.sceneSize >= level.findCount, `${level.id} sceneSize must be >= findCount`);
  assert.ok(level.itemPool.length >= level.sceneSize, `${level.id} itemPool must be >= sceneSize`);
  assert.equal(new Set(level.itemPool).size, level.itemPool.length, `${level.id} itemPool must be unique`);

  for (const wordId of level.itemPool) {
    assert.ok(vocabularyIds.has(wordId), `${level.id} references unknown vocabulary ${wordId}`);
  }
}

// Validation failure cases
assert.throws(() => createParkLevel({
  id: 'invalid-small-pool',
  difficultyRank: 1,
  title: 'Invalid',
  subtitle: 'Bad',
  icon: '🌳',
  findCount: 6,
  sceneSize: 6,
  itemPool: ['dog', 'cat'],
}), /Invalid Park level/);

assert.throws(() => createParkLevel({
  id: 'invalid-rank',
  difficultyRank: 99,
  title: 'Invalid',
  subtitle: 'Bad',
  icon: '🌳',
  findCount: 4,
  sceneSize: 6,
  itemPool: ['dog', 'cat', 'bird', 'fish', 'bear', 'frog'],
}), /Invalid difficulty rank/);

// Vocabulary deck coverage exhaustion test for Park
const level1 = getGameLevel('park', 'park-level-1');
const pool = level1.itemPool;
let deckState = null;
const seenWords = new Set();

// Draw rounds until we've drawn more than the entire pool size
const drawsNeeded = Math.ceil(pool.length / level1.findCount);
for (let round = 0; round < drawsNeeded; round++) {
  const result = drawVocabularyRound({
    pool,
    count: level1.findCount,
    state: deckState,
  });
  deckState = result.state;
  for (const word of result.selection) {
    seenWords.add(word);
  }
}

assert.equal(
  seenWords.size,
  pool.length,
  'Park coverage deck must draw every item in the pool before recycling words',
);

console.log(JSON.stringify({
  parkLevelCount: GAME_LEVELS.park.length,
  findCounts: GAME_LEVELS.park.map((level) => level.findCount),
  sceneSizes: GAME_LEVELS.park.map((level) => level.sceneSize),
  poolSizes: GAME_LEVELS.park.map((level) => level.itemPool.length),
}));
