import assert from 'node:assert/strict';

import {
  MAGIC_HOUSE_REQUEST_LAYOUTS,
  MAGIC_HOUSE_REQUESTS,
} from '../prototype/shared/magic-house-content.mjs';
import { selectVariedRequestIds } from '../prototype/shared/magic-house-variation.mjs';

const requestById = new Map(MAGIC_HOUSE_REQUESTS.map((request) => [request.id, request]));
assert.ok(MAGIC_HOUSE_REQUEST_LAYOUTS.length >= 2, 'Magic House needs multiple authored room layouts');
assert.deepEqual(
  requestById.get('request-8').targets,
  [{ objectId: 'ball', zoneId: 'bedside-floor' }],
  'the alternate ball request must use the visibly readable floor position beside the bed',
);
assert.match(requestById.get('request-8').en.sentence, /next to the bed/i);
assert.deepEqual(
  requestById.get('request-5').targets,
  [{ objectId: 'yellow-lamp', zoneId: 'bedside-floor' }],
  'next to the bed must resolve to the same unambiguous floor destination in every layout',
);

MAGIC_HOUSE_REQUEST_LAYOUTS.forEach((layout) => {
  assert.equal(layout.length, 6, 'each complete room layout must contain six requests');
  const objectIds = layout.flatMap((requestId) => requestById.get(requestId).targets.map((target) => target.objectId));
  assert.equal(new Set(objectIds).size, objectIds.length, 'a room layout cannot ask for the same object twice');
});

const requestIds = [...new Set(MAGIC_HOUSE_REQUEST_LAYOUTS.flat())];
const first = selectVariedRequestIds({
  requestIds,
  requestLayouts: MAGIC_HOUSE_REQUEST_LAYOUTS,
  count: 6,
  previousIds: null,
  random: () => 0.999,
});
const second = selectVariedRequestIds({
  requestIds,
  requestLayouts: MAGIC_HOUSE_REQUEST_LAYOUTS,
  count: 6,
  previousIds: first,
  random: () => 0.999,
});

const describeRound = (round) => round.flatMap((requestId) => requestById.get(requestId).targets);
assert.notDeepEqual(new Set(second), new Set(first), 'consecutive complete rooms must use different authored layouts');
assert.notDeepEqual(
  new Set(describeRound(second).map((target) => target.objectId)),
  new Set(describeRound(first).map((target) => target.objectId)),
  'consecutive complete rooms must vary their object mix',
);
assert.notDeepEqual(
  new Set(describeRound(second).map((target) => `${target.objectId}:${target.zoneId}`)),
  new Set(describeRound(first).map((target) => `${target.objectId}:${target.zoneId}`)),
  'consecutive complete rooms must vary object destinations',
);

const firstLayout = MAGIC_HOUSE_REQUEST_LAYOUTS[0];
const sameLayoutShuffledFirst = selectVariedRequestIds({
  requestIds,
  requestLayouts: MAGIC_HOUSE_REQUEST_LAYOUTS,
  count: 6,
  previousIds: firstLayout,
  random: () => 0.5,
});
assert.notDeepEqual(
  new Set(sameLayoutShuffledFirst),
  new Set(firstLayout),
  'a reordered copy of the previous full room must not win before a different layout is considered',
);

console.log(JSON.stringify({ layouts: MAGIC_HOUSE_REQUEST_LAYOUTS.length, first, second }));
