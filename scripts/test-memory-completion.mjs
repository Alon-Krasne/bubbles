import assert from 'node:assert/strict';

import { waitForMemoryBoardReveal } from '../src/memoryCompletion.ts';

function createDeferred() {
  let resolve;
  const promise = new Promise((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function createCard({ faceUp = true, matched = true, animation = null } = {}) {
  const front = {
    getAnimations: () => animation ? [{ finished: animation.promise }] : [],
  };

  return {
    classList: {
      contains: (className) => className === 'is-face-up' ? faceUp : className === 'is-matched' && matched,
    },
    querySelector: (selector) => selector === '.memory-card-front' ? front : null,
  };
}

const firstFinalReveal = createDeferred();
const secondFinalReveal = createDeferred();
const cards = [
  createCard(),
  createCard(),
  createCard({ animation: firstFinalReveal }),
  createCard({ animation: secondFinalReveal }),
];

let completionCount = 0;
const completion = waitForMemoryBoardReveal(cards, 2).then(() => {
  completionCount += 1;
});

secondFinalReveal.resolve();
await secondFinalReveal.promise;
await Promise.resolve();
assert.equal(completionCount, 0, 'Memory success must wait while any matched card is still revealing');

firstFinalReveal.resolve();
await completion;
assert.equal(completionCount, 1, 'Memory success must fire after every matched card finishes revealing');

await assert.rejects(
  waitForMemoryBoardReveal([createCard(), createCard({ faceUp: false })], 1),
  /matched and face-up/,
  'Memory success must reject a board that still contains a closed card',
);

await assert.rejects(
  waitForMemoryBoardReveal(cards, 3),
  /6 cards but rendered 4/,
  'Memory success must require exactly two rendered cards per pair',
);

console.log(JSON.stringify({ completionCount, allCardsRevealed: true }));
