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
