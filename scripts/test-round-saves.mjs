import assert from 'node:assert/strict';
import { snapshotHouseRound, restoreHouseRound } from '../prototype/shared/magic-house-save.mjs';
const requests = [{ id: 'first' }, { id: 'second' }];
const objects = [{ id: 'ball' }];
const state = { requests, objects, requestIndex: 0, completedRequests: 1, helpLevel: 2, mistakes: 1, locked: true,
  placedObjectIds: new Set(['ball']), placedZoneByObjectId: new Map([['ball', 'toy-box']]) };
const restored = restoreHouseRound(JSON.parse(JSON.stringify(snapshotHouseRound(state))), requests, objects);
assert.equal(restored.requestIndex, 1, 'reload during success animation resumes at the next request');
assert.equal(restored.helpLevel, 0);
assert.equal(restored.locked, false);
assert.deepEqual([...restored.placedZoneByObjectId], [['ball', 'toy-box']]);
assert.equal(restored.mistakes, 1);
console.log('PASS: Magic House restores placed objects and advances a completed request before its animation ends.');
