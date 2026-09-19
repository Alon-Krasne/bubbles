import assert from 'node:assert/strict';
import { getRevealState, getRevealHint, getInitialRevealedLetters } from '../prototype/shared/magic-reveal.mjs';

assert.equal(getRevealState('apple', ['P']).revealed, 2);
assert.equal(getRevealState('apple', ['P', 'P', 'X']).tiles, 4);
assert.equal(getRevealState('apple', ['A','P','L','E']).complete, true);
assert.equal(getRevealState('apple', ['A','P','L']).complete, false);
assert.equal(getRevealState('כלב', ['כ']).revealed, 1);
assert.equal(getRevealState('דג', ['ד','ג']).tiles, 12);
assert.equal(getRevealHint('apple', ['A','P']), 'L');

// Initial revealed letters: 1 for 3-4 letters, 2 for 5+ letters
assert.deepEqual(getInitialRevealedLetters('cat'), ['C']);
assert.deepEqual(getInitialRevealedLetters('bird'), ['B']);
assert.deepEqual(getInitialRevealedLetters('apple'), ['A', 'E']);
assert.deepEqual(getInitialRevealedLetters('banana'), ['B', 'A']);
assert.deepEqual(getInitialRevealedLetters('elephant'), ['E', 'T']);
assert.deepEqual(getInitialRevealedLetters('eagle'), ['E', 'A']);
assert.deepEqual(getInitialRevealedLetters('דג'), []);
assert.deepEqual(getInitialRevealedLetters('דוב'), ['ד']);
assert.deepEqual(getInitialRevealedLetters('ארנב'), ['א']);
assert.deepEqual(getInitialRevealedLetters('ציפור'), ['צ', 'ר']);
assert.deepEqual(getInitialRevealedLetters('עגבנייה'), ['ע', 'ה']);

console.log('PASS: initial letters (1 for 3-4, 2 for 5+), repeated letters, wrong guesses, full-word completion, Hebrew and letter hints.');
