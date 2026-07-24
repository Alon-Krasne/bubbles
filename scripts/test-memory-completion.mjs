import assert from 'node:assert/strict';

import { afterMemoryCardReveal } from '../src/memoryCompletion.ts';

const cardFront = new EventTarget();
let completionCount = 0;

afterMemoryCardReveal(cardFront, () => {
  completionCount += 1;
});

assert.equal(completionCount, 0, 'Memory success must not fire before the final card reveal finishes');
cardFront.dispatchEvent(new Event('transitionend'));
assert.equal(completionCount, 1, 'Memory success must fire when the final card reveal finishes');
cardFront.dispatchEvent(new Event('transitionend'));
assert.equal(completionCount, 1, 'Memory success must fire only once');

console.log(JSON.stringify({ completionCount }));
