import assert from 'node:assert/strict';

import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

const pool = Array.from({ length: 10 }, (_, index) => `word-${index + 1}`);
let state = null;
const selections = [];

for (let round = 0; round < 3; round += 1) {
  const result = drawVocabularyRound({ pool, count: 4, state, random: () => 0.5 });
  assert.equal(new Set(result.selection).size, 4, 'a round cannot repeat a word');
  selections.push(...result.selection);
  state = result.state;
}

assert.equal(new Set(selections.slice(0, 10)).size, 10, 'the pool must be exhausted before a word repeats');
assert.equal(state.previous.length, 4);
assert.throws(() => drawVocabularyRound({ pool, count: 11, state: null }), /Invalid vocabulary draw count/);

console.log(JSON.stringify({ poolSize: pool.length, rounds: 3, uniqueBeforeRepeat: 10 }));
