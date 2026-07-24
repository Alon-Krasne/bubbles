import assert from 'node:assert/strict';

import { selectVariedRequestIds } from '../prototype/shared/magic-house-variation.mjs';

const requestIds = ['request-1', 'request-2', 'request-3', 'request-4'];
const first = selectVariedRequestIds({ requestIds, count: 3, previousIds: null, random: () => 0.999 });
const second = selectVariedRequestIds({ requestIds, count: 3, previousIds: first, random: () => 0.999 });

assert.equal(first.length, 3);
assert.equal(second.length, 3);
assert.notDeepEqual(
  [...second].sort(),
  [...first].sort(),
  'consecutive variable-room sessions must not repeat the same objects and destinations',
);

console.log(JSON.stringify({ first, second }));
