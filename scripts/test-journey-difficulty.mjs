import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { applyJourneyOrder, createJourneyOrder } from '../prototype/shared/journey-order.mjs';
import { selectMagicHouseLevelRequests } from '../prototype/shared/magic-house-variation.mjs';
import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';
import { getPainterWord, getPainterWordPool } from '../prototype/shared/painter-content.mjs';
import { REEF_JOURNEY_STAGES, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { drawVocabularyRound, vocabularyDeckKey } from '../prototype/shared/vocabulary-deck.mjs';

const route = [...TRAIL_STAGES, ...REEF_JOURNEY_STAGES];
const expectedRanks = [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8].flatMap(rank => Array(6).fill(rank));
const gameLevels = game => route.filter(stage => stage.game === game).map(stage => getGameLevel(game, stage.level));
const nondecreasing = values => values.every((value, i) => i === 0 || value >= values[i - 1]);
const seeded = seed => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);

for (let seed = 1; seed <= 100; seed++) {
  const forest = applyJourneyOrder(TRAIL_STAGES, createJourneyOrder(TRAIL_STAGES, seeded(seed)));
  const journey = [...forest, ...REEF_JOURNEY_STAGES];
  assert.deepEqual(journey.map(stage => stage.difficultyRank), expectedRanks);
  assert.deepEqual(journey.map(stage => getGameLevel(stage.game, stage.level).difficultyRank), expectedRanks);
}

const memoryPairs = gameLevels('memory').map(level => level.pairs);
assert.ok(nondecreasing(memoryPairs));
assert.deepEqual([...new Set(memoryPairs.slice(-8))], [9, 10, 12]);
assert.equal(getGameLevel('memory', REEF_JOURNEY_STAGES[0].level).pairs, 9);

const shops = gameLevels('shop');
assert.ok(nondecreasing(shops.map(level => level.shelfSize)));
assert.ok(nondecreasing(shops.map(level => level.customerCount)));
assert.deepEqual([...new Set(shops.filter(level => level.difficultyRank > 5).map(level => level.customerCount))], [8, 9, 10]);
assert.ok(shops.filter(level => level.difficultyRank > 5).every(level => level.mode === 'double'));

const reveals = gameLevels('reveal');
assert.ok(nondecreasing(reveals.map(level => level.wordCount)));
assert.deepEqual([...new Set(reveals.filter(level => level.difficultyRank > 5).map(level => level.wordCount))], [6, 7, 8]);

for (const language of ['en', 'he']) {
  const painter = gameLevels('painter');
  assert.ok(nondecreasing(painter.map(level => level.wordCount)));
  const minimumStrokes = painter.map(level => getPainterWordPool(level, language)
    .map(id => getPainterWord(id, language, 'titlecase').letters.reduce((strokes, letter) => strokes + letter.strokes.length, 0))
    .sort((a, b) => a - b).slice(0, level.wordCount).reduce((total, count) => total + count, 0));
  assert.ok(nondecreasing(minimumStrokes), `${language} Painter tracing workload must keep growing`);
  for (const level of painter) {
    const pool = getPainterWordPool(level, language);
    assert.ok(pool.length > level.wordCount, `${level.id}/${language} needs vocabulary variation`);
    assert.equal(drawVocabularyRound({ pool, count: level.wordCount, state: null }).selection.length, level.wordCount);
  }
}

const requests = new Map(MAGIC_HOUSE_REQUESTS.map(request => [request.id, request]));
const isCompound = id => requests.get(id).targets.length > 1;
for (const level of gameLevels('house').filter(level => level.difficultyRank > 5)) {
  let previousIds = null;
  for (let seed = 1; seed <= 30; seed++) {
    const selected = selectMagicHouseLevelRequests(level, previousIds, seeded(seed));
    assert.equal(selected.length, 6);
    assert.ok(selected.some(isCompound));
    if (level.difficultyRank >= 7) assert.ok(selected.some(id => ['request-8', 'request-9', 'request-10'].includes(id)));
    if (level.difficultyRank === 8) assert.ok(isCompound(selected[0]));
    const targets = selected.flatMap(id => requests.get(id).targets);
    assert.equal(new Set(targets.map(target => target.objectId)).size, targets.length);
    previousIds = selected;
  }
}

const poolIds = new Set(route.flatMap(stage => {
  const level = getGameLevel(stage.game, stage.level);
  return level.wordPool ?? level.itemPool ?? [];
}));
for (const id of poolIds) for (const language of ['en', 'he']) {
  assert.ok(existsSync(new URL(`../src/assets/audio/vocabulary/${language}/words/${id}.mp3`, import.meta.url)), `${language}/${id}`);
}
assert.equal(vocabularyDeckKey('level', ['cat', 'moon']), vocabularyDeckKey('level', ['moon', 'cat']));
assert.notEqual(vocabularyDeckKey('level', ['cat', 'moon']), vocabularyDeckKey('level', ['moon', 'boat']));
console.log('PASS: all 72 stages follow eight difficulty tiers across shuffles, with real activity progression and recorded bilingual vocabulary.');
