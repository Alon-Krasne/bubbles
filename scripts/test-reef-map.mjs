import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { REEF_ACTIVITIES, REEF_CHAPTERS, REEF_STAGES, REEF_STORIES, getReefStage, getStoryBeforeReefStage } from '../prototype/shared/reef-map.mjs';
import { TRAIL_GAME_SEQUENCE } from '../prototype/shared/trail-recipes.mjs';

assert.equal(REEF_CHAPTERS.length, 6);
assert.equal(REEF_STAGES.length, 36);
assert.deepEqual(REEF_STAGES.map(stage => stage.id), Array.from({ length: 36 }, (_, i) => i + 1));
assert.deepEqual(REEF_STAGES.slice(0, 33).map(stage => stage.activity), TRAIL_GAME_SEQUENCE.slice(0, 33));
assert.deepEqual(REEF_STAGES.slice(33).map(stage => stage.activity), ['memory', 'shop', 'house'], 'Reef finale must match the storybook');
for (const stage of REEF_STAGES) {
  assert(stage.position && Number.isFinite(stage.position.x) && Number.isFinite(stage.position.y), `Stage ${stage.id}: finite position`);
  assert(stage.position.x > 3 && stage.position.x < 97 && stage.position.y > 3 && stage.position.y < 97);
  assert(REEF_ACTIVITIES[stage.activity]);
  assert.equal(stage.playable, false, 'Map preview must not enable unfinished activities');
  assert.equal(getReefStage(stage.id), stage);
}
for (const chapter of REEF_CHAPTERS) assert.equal(REEF_STAGES.filter(stage => stage.chapter === chapter.id).length, 6);
for (let i = 0; i < REEF_STAGES.length; i++) {
  for (let j = i + 1; j < REEF_STAGES.length; j++) {
    const a = REEF_STAGES[i].position;
    const b = REEF_STAGES[j].position;
    const distance = Math.hypot((a.x - b.x) * 14, (a.y - b.y) * 14 * 1073 / 1600);
    assert(distance >= 60, `Stages ${i + 1}/${j + 1}: targets overlap at minimum map width (${distance.toFixed(1)}px)`);
  }
}
assert.throws(() => getReefStage(0), /Unknown Reef stage/);
assert.throws(() => getStoryBeforeReefStage(37), /Unknown Reef stage/);
assert.equal(getStoryBeforeReefStage(1).id, 'reef-video-01');
assert.equal(getStoryBeforeReefStage(6).id, 'reef-video-02');
assert.equal(getStoryBeforeReefStage(36).id, 'reef-video-08', 'Finale belongs after stage 36, not before its gameplay');
assert.deepEqual(REEF_STORIES.map(story => story.after), [null, 0, 5, 10, 15, 20, 25, 30, 35, 36]);
assert.equal(REEF_STORIES.length, 10);
for (const story of REEF_STORIES) {
  for (const file of [story.src, story.poster]) {
    const url = new URL(`../prototype/${file}`, import.meta.url);
    assert(fs.statSync(url).size > 0, `Missing media: ${file}`);
  }
}
const screen = fs.readFileSync(fileURLToPath(new URL('../prototype/reef-map.js', import.meta.url)), 'utf8');
assert(!/localStorage|saveStorage|sessionStorage|postMessage/.test(screen), 'Isolated preview must not write saves or post gameplay completions');
console.log('Reef map: 36 spaced stops, six chapters, shared rotation with Reef finale, ten local stories and preview isolation passed.');
