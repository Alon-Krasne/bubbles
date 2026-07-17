import assert from 'node:assert/strict';

import { createTrackProgress, migrateTrackProgress } from '../prototype/shared/track-progress.mjs';

assert.deepEqual(createTrackProgress(1, 15), {
  currentStage: 1,
  progress: {},
});

assert.deepEqual(createTrackProgress(6, 15), {
  currentStage: 6,
  progress: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 },
});

assert.deepEqual(createTrackProgress(15, 15), {
  currentStage: 15,
  progress: {
    1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3,
    8: 3, 9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3,
  },
});

assert.throws(() => createTrackProgress(0, 15), /Invalid track stage/);
assert.throws(() => createTrackProgress(16, 15), /Invalid track stage/);
assert.throws(() => createTrackProgress(2, 0), /Invalid track stage count/);

assert.deepEqual(
  migrateTrackProgress({ currentStage: 6, progress: { 1: 2, 2: 3, 3: 1, 4: 3, 5: 2 } }, 6, 15),
  { currentStage: 6, progress: { 1: 2, 2: 3, 3: 1, 4: 3, 5: 2 } },
  'a profile at a remapped stage must restart that stage without inherited credit',
);
assert.deepEqual(
  migrateTrackProgress({ currentStage: 4, progress: { 1: 3, 2: 2, 3: 1 } }, 6, 15),
  { currentStage: 4, progress: { 1: 3, 2: 2, 3: 1 } },
  'progress before the remapped stage must remain unchanged',
);

console.log(JSON.stringify({ resetStages: [1, 6, 15], stageCount: 15 }));
