import assert from 'node:assert/strict';
import { getRevealState, getRevealHint, getInitialRevealedLetters } from '../prototype/shared/magic-reveal.mjs';

assert.equal(getRevealState('apple', ['P']).revealed, 2);
assert.equal(getRevealState('apple', ['P', 'P', 'X']).tiles, 4);
assert.equal(getRevealState('apple', ['A','P','L','E']).complete, true);
assert.equal(getRevealState('apple', ['A','P','L']).complete, false);
assert.equal(getRevealState('כלב', ['כ']).revealed, 1);
assert.equal(getRevealState('דג', ['ד','ג']).tiles, 12);
assert.equal(getRevealHint('apple', ['A','P'], () => 0), 'L');
assert.equal(getRevealHint('apple', ['A','P'], () => 0.99), 'E');

// Starter letters vary, preserve the age-based count, and never solve the word.
assert.deepEqual(getInitialRevealedLetters('cat', () => 0), ['C']);
assert.deepEqual(getInitialRevealedLetters('cat', () => 0.99), ['T']);
assert.equal(getInitialRevealedLetters('bird', () => 0.5).length, 1);
assert.equal(getInitialRevealedLetters('apple', () => 0.5).length, 2);
assert.equal(getInitialRevealedLetters('banana', () => 0.5).length, 2);
assert.equal(getRevealState('banana', getInitialRevealedLetters('banana', () => 0.5)).complete, false);
assert.equal(getRevealState('aaaaa', getInitialRevealedLetters('aaaaa', () => 0.5)).complete, false);
assert.deepEqual(getInitialRevealedLetters('דג'), []);
assert.equal(getInitialRevealedLetters('דוב', () => 0.5).length, 1);
assert.equal(getInitialRevealedLetters('ארנב', () => 0.5).length, 1);
assert.equal(getInitialRevealedLetters('ציפור', () => 0.5).length, 2);
assert.equal(getInitialRevealedLetters('עגבנייה', () => 0.5).length, 2);

console.log('PASS: varied initial letters (1 for 3-4, 2 for 5+), repeated letters, wrong guesses, full-word completion, Hebrew and letter hints.');

// A picture opens in a stable shuffled order, never re-covering earlier tiles.
const { createRevealTileOrder } = await import('../prototype/shared/magic-reveal.mjs');
const order = createRevealTileOrder(() => 0.5);
assert.equal(new Set(order).size, 12);
assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length: 12 }, (_, i) => i));
assert.notDeepEqual(order.slice(0, 4), [0, 1, 2, 3]);
assert.notDeepEqual(order, createRevealTileOrder(() => 0));

const { getRevealChoices } = await import('../prototype/shared/magic-reveal.mjs');
for (const [word, alphabet] of [['APPLE', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], ['כלב', 'אבגדהוזחטיכךלמםנןסעפףצץקרשת']]) {
  const guesses = getInitialRevealedLetters(word, () => 0.5);
  while (!getRevealState(word, guesses).complete) {
    const choices = getRevealChoices(word, guesses, alphabet, () => 0.5);
    assert.ok(choices.length > 0 && choices.length <= 3);
    assert.equal(new Set(choices).size, choices.length);
    assert.ok(choices.every(letter => !guesses.includes(letter) && alphabet.includes(letter)));
    const answer = choices.find(letter => word.includes(letter));
    assert.ok(answer, 'Every turn offers a remaining correct letter');
    guesses.push(answer);
  }
  assert.deepEqual(getRevealChoices(word, guesses, alphabet), []);
}
const positions = [0, 0.5, 0.99].map(value => getRevealChoices('CAT', [], 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', () => value).findIndex(letter => 'CAT'.includes(letter)));
assert.ok(new Set(positions).size > 1, 'Correct choice changes position');
assert.deepEqual(getInitialRevealedLetters('CAT', () => 0.5), ['A']);
assert.deepEqual(getInitialRevealedLetters('כלב', () => 0.99), ['ב']);
console.log('PASS: shuffled tiles, three playable choices, random answer positions and middle/end starter letters.');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const offered = getRevealChoices('BEAR', ['B'], alphabet, () => 0.5);
const wrong = offered.find(letter => !'BEAR'.includes(letter));
assert.ok(!getRevealChoices('BEAR', ['B', wrong], alphabet, () => 0.5).includes(wrong));
assert.equal(getRevealState('BEAR', ['B', wrong]).tiles, getRevealState('BEAR', ['B']).tiles);
