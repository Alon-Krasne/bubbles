import assert from 'node:assert/strict';
import {
  normalizeWordLetters,
  getAnchorIndices,
  createMagicLettersRound,
  placeTrayItem,
  returnSlotItem,
  checkWordCompletion,
  getLetterHint,
  resetRound,
  dropLetter,
} from '../prototype/shared/magic-letters.mjs';

// 1. normalizeWordLetters
assert.deepEqual(normalizeWordLetters('apple', 'en'), ['A', 'P', 'P', 'L', 'E']);
assert.deepEqual(normalizeWordLetters('תפוח', 'he'), ['ת', 'פ', 'ו', 'ח']);
assert.deepEqual(normalizeWordLetters('פַּרְפַּר', 'he'), ['פ', 'ר', 'פ', 'ר']); // strips niqqud

// 2. getAnchorIndices
assert.deepEqual(getAnchorIndices(4, 1), [0]); // rank 1, 4 chars -> 1st letter
assert.deepEqual(getAnchorIndices(5, 1), [0, 4]); // rank 1, 5 chars -> 1st and last
assert.deepEqual(getAnchorIndices(5, 2), [0]); // rank 2 -> 1st only
assert.deepEqual(getAnchorIndices(5, 3), []); // rank 3 -> full shuffle
assert.deepEqual(getAnchorIndices(3, 1), []); // < 4 chars -> none

// 3. createMagicLettersRound (Rank 1 with anchor letters)
const wordApple = { id: 'apple', english: 'apple', hebrew: 'תפוח' };
const round1 = createMagicLettersRound({
  word: wordApple,
  language: 'en',
  rank: 1,
});
assert.equal(round1.letters.length, 5);
assert.equal(round1.slots[0].locked, true);
assert.equal(round1.slots[0].currentChar, 'A');
assert.equal(round1.slots[4].locked, true);
assert.equal(round1.slots[4].currentChar, 'E');
assert.equal(round1.slots[1].currentChar, null);
assert.equal(round1.tray.length, 3); // P, P, L in tray

// 4. Placing and returning items
const firstTray = round1.tray[0];
const placed = placeTrayItem(round1, firstTray.id);
assert.equal(placed, true);
assert.equal(round1.slots[1].currentChar, firstTray.char);
assert.equal(firstTray.used, true);

// Return item
const returned = returnSlotItem(round1, 1);
assert.equal(returned, true);
assert.equal(round1.slots[1].currentChar, null);
assert.equal(firstTray.used, false);

// 5. Completion check
const roundHebrew = createMagicLettersRound({
  word: wordApple,
  language: 'he',
  rank: 3, // full shuffle
});
assert.equal(roundHebrew.slots.filter(s => s.locked).length, 0);
assert.equal(roundHebrew.tray.length, 4);

// Fill with correct letters using hint
while (true) {
  const hint = getLetterHint(roundHebrew);
  if (!hint || hint.type !== 'place') break;
  placeTrayItem(roundHebrew, hint.trayItemId, hint.slotIndex);
}

const completion = checkWordCompletion(roundHebrew);
assert.equal(completion.isFilled, true);
assert.equal(completion.isCorrect, true);
assert.equal(completion.misplacedIndices.length, 0);

// 6. Test wrong placement and hint to remove
const roundWrong = createMagicLettersRound({
  word: wordApple,
  language: 'en',
  rank: 3,
});
// Deliberately place wrong letter if available
const trayNonA = roundWrong.tray.find(t => t.char !== 'A') || roundWrong.tray[0];
placeTrayItem(roundWrong, trayNonA.id, 0); // place non-A into slot 0
if (trayNonA.char !== 'A') {
  const wrongHint = getLetterHint(roundWrong);
  assert.equal(wrongHint.type, 'remove');
  assert.equal(wrongHint.slotIndex, 0);
}

// 7. Test rejection of short words
assert.throws(() => {
  createMagicLettersRound({
    word: { id: 'cat', english: 'cat', hebrew: 'חתול' },
    language: 'en', // only 3 letters in English
  });
}, /Magic Letters requires at least 4 letters/);

// 8. Test Rank 2 anchor logic (only first letter locked)
const roundRank2 = createMagicLettersRound({
  word: wordApple,
  language: 'en',
  rank: 2,
});
assert.equal(roundRank2.slots[0].locked, true);
assert.equal(roundRank2.slots[0].currentChar, 'A');
assert.equal(roundRank2.slots[4].locked, false);
assert.equal(roundRank2.slots[4].currentChar, null);
assert.equal(roundRank2.tray.length, 4);

// 8b. resetRound clears every unlocked letter, keeps anchors, and frees all tiles
const roundReset = createMagicLettersRound({ word: wordApple, language: 'en', rank: 1 });
const trayOrder = roundReset.tray.map((t) => t.id);
// Fill every open slot with a wrong arrangement: tiles in tray order
for (const tile of roundReset.tray) placeTrayItem(roundReset, tile.id);
assert.equal(roundReset.tray.every((t) => t.used), true);
resetRound(roundReset);
assert.equal(roundReset.slots[0].currentChar, 'A', 'locked first letter survives reset');
assert.equal(roundReset.slots[4].currentChar, 'E', 'locked last letter survives reset');
assert.deepEqual(roundReset.slots.filter((s) => !s.locked).map((s) => s.currentChar), [null, null, null]);
assert.equal(roundReset.slots.every((s) => s.locked || s.trayItemId === null), true);
assert.equal(roundReset.tray.every((t) => !t.used), true, 'every tile is back in the tray');
assert.deepEqual(roundReset.tray.map((t) => t.id), trayOrder, 'tray order is kept');
assert.equal(checkWordCompletion(roundReset).isFilled, false);

// 8c. dropLetter: every drag outcome
const fresh = () => createMagicLettersRound({ word: wordApple, language: 'en', rank: 1 }); // A _ _ _ E
const tileFor = (round, char, used = false) => round.tray.find((t) => t.char === char && t.used === used);

// Tray tile to an empty slot
let r = fresh();
const pTile = tileFor(r, 'P');
assert.equal(dropLetter(r, { trayItemId: pTile.id }, 2), true);
assert.equal(r.slots[2].currentChar, 'P');
assert.equal(pTile.used, true);

// Tray tile onto a FILLED slot replaces it; the old letter returns to the tray
const lTile = tileFor(r, 'L');
assert.equal(dropLetter(r, { trayItemId: lTile.id }, 2), true);
assert.equal(r.slots[2].currentChar, 'L');
assert.equal(r.slots[2].trayItemId, lTile.id);
assert.equal(pTile.used, false, 'replaced letter goes back to the tray');
assert.equal(lTile.used, true);

// Placed letter to an empty slot moves it
assert.equal(dropLetter(r, { slotIndex: 2 }, 3), true);
assert.equal(r.slots[2].currentChar, null);
assert.equal(r.slots[3].currentChar, 'L');
assert.equal(lTile.used, true);

// Placed letter onto another filled slot: it moves, the old occupant returns to the tray
dropLetter(r, { trayItemId: pTile.id }, 1);
assert.equal(dropLetter(r, { slotIndex: 3 }, 1), true);
assert.equal(r.slots[1].currentChar, 'L');
assert.equal(r.slots[3].currentChar, null);
assert.equal(pTile.used, false);

// Rejected drops change nothing
const before = JSON.stringify(r);
assert.equal(dropLetter(r, { trayItemId: pTile.id }, 0), false, 'locked slot rejects drops');
assert.equal(dropLetter(r, { slotIndex: 1 }, 1), false, 'dropping a letter on its own slot is a no-op');
assert.equal(dropLetter(r, { slotIndex: 0 }, 2), false, 'locked letters cannot be dragged');
assert.equal(dropLetter(r, { slotIndex: 2 }, 3), false, 'an empty slot has nothing to drag');
assert.equal(dropLetter(r, { trayItemId: lTile.id }, 2), false, 'a tile already on the board cannot come from the tray');
assert.equal(dropLetter(r, { trayItemId: pTile.id }, 9), false, 'unknown slot');
assert.equal(JSON.stringify(r), before);

// 8d. Hints describe the move but never perform it, and carry no UI text
r = fresh();
const hint = getLetterHint(r);
assert.deepEqual(Object.keys(hint).sort(), ['slotIndex', 'trayItemId', 'type']);
assert.equal(hint.type, 'place');
assert.equal(hint.slotIndex, 1);
assert.equal(r.tray.find((t) => t.id === hint.trayItemId).char, 'P');
assert.equal(r.slots[1].currentChar, null, 'getLetterHint does not place');
dropLetter(r, { trayItemId: tileFor(r, 'L').id }, 1);
assert.deepEqual(getLetterHint(r), { type: 'remove', slotIndex: 1 });

// 9. Activity scoring integration
import { calculateMasteryStars } from '../prototype/shared/activity-scoring.mjs';
assert.equal(calculateMasteryStars({ mistakes: 0, challengeSize: 3 }), 3);
assert.equal(calculateMasteryStars({ mistakes: 1, challengeSize: 3 }), 3);
assert.equal(calculateMasteryStars({ mistakes: 3, challengeSize: 3 }), 2);
assert.equal(calculateMasteryStars({ mistakes: 7, challengeSize: 3 }), 1);

console.log('PASS: magic-letters unit tests passed successfully.');
