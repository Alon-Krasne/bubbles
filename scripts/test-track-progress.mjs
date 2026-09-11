import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createTrackProgress, isStageUnlocked, migrateTrackProgress } from '../prototype/shared/track-progress.mjs';

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

const worldMapHtml = readFileSync(new URL('../prototype/world-map.html', import.meta.url), 'utf8');
const worldMapCss = readFileSync(new URL('../prototype/world-map.css', import.meta.url), 'utf8');
const worldMapJs = readFileSync(new URL('../prototype/world-map.js', import.meta.url), 'utf8');

assert.match(worldMapHtml, /השלב הבא למשחק/, 'progress selector must describe the selected stage');
assert.match(worldMapHtml, /מחיקת פרופיל/, 'the destructive action must name the object being deleted');
assert.match(worldMapCss, /\.delete-profile-button[\s\S]*background: #c84352;/, 'profile deletion must use destructive styling');
assert.match(worldMapCss, /\.language-options span[\s\S]*border: 2px solid #d2e5e0;/, 'both language states must look interactive');
assert.match(worldMapCss, /\.language-options input:checked \+ span[\s\S]*background: #d35f8b;[\s\S]*box-shadow: inset/, 'the selected language must look active and depressed');
assert.match(worldMapCss, /\.confirm-track-reset-button \{[\s\S]*background: #3bbf75;/, 'ordinary progress updates must use positive confirmation styling');
assert.match(worldMapCss, /\.confirm-track-reset-button\.is-destructive[\s\S]*background: #c84352;/, 'a real stage-1 reset must retain destructive styling');
assert.match(worldMapCss, /\.track-reset-status:not\(:empty\)::before[\s\S]*content: '✓';/, 'saved progress feedback must have a success icon');
assert.match(worldMapCss, /\.editor-dialog\.is-confirming-track-reset \.track-reset-confirm[\s\S]*margin-bottom: 8px;[\s\S]*padding: 12px 24px 15px;/, 'confirmation controls must have room inside and below the panel');
assert.match(worldMapCss, /#track-reset-button:disabled/, 'the pending update action must have a distinct disabled state');
assert.match(worldMapCss, /#track-reset-button:disabled[\s\S]*box-shadow: none;/, 'the disabled update action must lose its clickable elevation');
assert.match(worldMapJs, /איפוס להתחלה/, 'stage 1 must be identified as a real reset');
assert.match(worldMapJs, /נשמרה מיד\. אין צורך ללחוץ על שמירה/, 'an immediate progress update must explain its save state');
assert.match(worldMapJs, /trackResetButton\.disabled = true;/, 'the update action must be disabled while confirmation is pending');
assert.match(worldMapJs, /const hasSameStars = stages\.every/, 'a redundant reset must be detected from the complete saved progression');

assert.equal(isStageUnlocked({ id: 3, available: true }, 3), true, 'the frontier stage must be open');
assert.equal(isStageUnlocked({ id: 2, available: true }, 3), true, 'cleared stages must stay replayable');
assert.equal(isStageUnlocked({ id: 4, available: true }, 3), false, 'stages past the frontier must stay locked');
assert.equal(isStageUnlocked({ id: 3, available: false }, 3), false, 'an unavailable stage must stay locked');
assert.match(worldMapJs, /isStageUnlocked\(stage, progress\.currentStage\)/, 'the map must lock stages using the shared frontier rule');

console.log(JSON.stringify({ resetStages: [1, 6, 15], stageCount: 15 }));
