import assert from 'node:assert/strict';
import { GAME_LEVELS } from '../prototype/shared/trail-catalog.mjs';
import { getPainterWord } from '../prototype/shared/painter-content.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';
import { MAGIC_HOUSE_REQUEST_LAYOUTS, MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';
import { selectVariedRequestIds } from '../prototype/shared/magic-house-variation.mjs';

for (const level of GAME_LEVELS.painter) {
  assert.equal(level.wordCount, Math.ceil(level.difficultyRank / 2), 'tracing grows from one to two to three words');
}

const { getPainterWordPool } = await import('../prototype/shared/painter-content.mjs');
for (const language of ['en', 'he']) {
  for (const level of GAME_LEVELS.painter) {
    const pool = getPainterWordPool(level, language);
    assert.ok(pool.length > level.wordCount, 'even championship sessions need spare words to vary their word set');
    const minimumLength = [0, 3, 3, 4, 4, 5][level.difficultyRank];
    const maximumLength = [0, 4, 5, 6, Infinity, Infinity][level.difficultyRank];
    assert.ok(pool.every(id => getPainterWord(id, language).letters.length >= minimumLength));
    assert.ok(pool.every(id => getPainterWord(id, language).letters.length <= maximumLength));
    let state = null;
    const orders = new Set();
    for (let seed = 1; seed <= 30; seed++) {
      let value = seed;
      const random = () => ((value = (Math.imul(value, 1664525) + 1013904223) >>> 0) / 2 ** 32);
      const result = drawVocabularyRound({ pool, count: level.wordCount, state, random });
      assert.equal(new Set(result.selection).size, level.wordCount, 'a tracing session has distinct words');
      orders.add(result.selection.join(','));
      state = result.state;
    }
    assert.ok(orders.size > 1, `${level.id}/${language} must vary across sessions`);
  }
}

for (const level of GAME_LEVELS.reveal) {
  assert.ok(level.wordPool.length > level.wordCount, 'Reveal needs spare difficulty-matched words to vary its word set');
  const first = drawVocabularyRound({ pool: level.wordPool, count: level.wordCount, state: null, random: () => 0.99 });
  const second = drawVocabularyRound({ pool: level.wordPool, count: level.wordCount, state: first.state, random: () => 0.99 });
  assert.notDeepEqual(first.selection, second.selection, 'Reveal replays draw different words');
}
assert.equal(MAGIC_HOUSE_REQUEST_LAYOUTS.length, 10, 'the room must offer more than the two original fixed arrangements');
for (const level of GAME_LEVELS.house) {
  let previousIds = null;
  const sets = new Set();
  for (let seed=1; seed<=100; seed++) {
    let value=seed;
    const random = () => ((value = (Math.imul(value, 1664525) + 1013904223) >>> 0) / 2 ** 32);
    const selected = selectVariedRequestIds({ requestIds:level.requestIds, requestLayouts:MAGIC_HOUSE_REQUEST_LAYOUTS,
      count:level.requestCount, previousIds, random });
    const objects = selected.flatMap(id => MAGIC_HOUSE_REQUESTS.find(request=>request.id===id).targets.map(target=>target.objectId));
    assert.equal(new Set(objects).size, objects.length, 'room requests must never reuse an already placed object');
    sets.add([...selected].sort().join(','));
    previousIds=selected;
  }
  assert.ok(sets.size>2, `${level.id} must draw more than two room combinations`);
}
console.log('PASS: randomized tracing sessions grow to three longer words; Reveal draws varied word sets.');
