import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  DESTINATIONS,
  FOREST_CHARACTERS,
  FOREST_MILESTONES,
  getRouteKey,
  createForestProgress,
  recordDestinationStageCompletion,
  markVideoSeen,
  getActiveDestination,
  setActiveDestination,
  FOREST_VIDEO_MEDIA,
  getForestVideoMedia,
  getPendingForestMilestone,
  getActivitySavePrefix,
} from '../prototype/shared/destinations.mjs';

// 1. Destination definitions & kid-friendly Hebrew names
assert.equal(DESTINATIONS.wonder.id, 'wonder');
assert.equal(DESTINATIONS.wonder.title, 'עולם הפלאים');
assert.equal(DESTINATIONS.forest.id, 'forest');
assert.equal(DESTINATIONS.forest.title, 'היער הלוחש');

// No developer/version jargon in child-facing copy
for (const dest of Object.values(DESTINATIONS)) {
  assert.ok(!dest.title.includes('גרסה'), 'no version wording in title');
  assert.ok(!dest.title.includes('ישן') && !dest.title.includes('חדש'), 'no old/new in title');
  assert.ok(!dest.title.toLowerCase().includes('legacy'), 'no legacy in title');
}

// 2. Forest Characters (Nabat, Adva, Zohar)
assert.deepEqual(Object.keys(FOREST_CHARACTERS), ['nabat', 'adva', 'zohar']);
assert.equal(FOREST_CHARACTERS.nabat.name, 'נבט');
assert.equal(FOREST_CHARACTERS.adva.name, 'אדוה');
assert.equal(FOREST_CHARACTERS.zohar.name, 'זוהר');

// 3. Milestones (0, 5, 10, 15, 20, 25, 30, 35, 36)
assert.equal(FOREST_MILESTONES.length, 9);
assert.deepEqual(
  FOREST_MILESTONES.map(m => m.milestone),
  [0, 5, 10, 15, 20, 25, 30, 35, 36],
);
assert.equal(FOREST_MILESTONES[0].videoId, 'forest-video-01');
assert.equal(FOREST_MILESTONES[8].videoId, 'forest-video-09');

// 4. Save key isolation
assert.equal(getRouteKey('lotem', 'wonder'), 'route-lotem', 'wonder destination keeps exact existing save key');
assert.equal(getRouteKey('lotem', 'forest', 'en'), 'forest-route-lotem-en', 'forest en route key');
assert.equal(getRouteKey('lotem', 'forest', 'he'), 'forest-route-lotem-he', 'forest he route key');

// 5. Fresh forest progress
const initialForest = createForestProgress();
assert.equal(initialForest.currentStage, 1);
assert.deepEqual(initialForest.progress, {});
assert.equal(initialForest.character, null, 'no character chosen on creation');
assert.deepEqual(initialForest.unlockedVideos, ['forest-video-01'], 'opening video unlocked by default');
assert.deepEqual(initialForest.seenVideos, []);

// 6. Mock storage for recordDestinationStageCompletion
const mockStorage = new Map();
const storageAdapter = {
  getItem: key => mockStorage.get(key) ?? null,
  setItem: (key, val) => mockStorage.set(key, val),
  keys: () => Array.from(mockStorage.keys()),
  removeItem: key => mockStorage.delete(key),
};

// Seed wonder progress for Lotem (stage 4, 9 stars)
mockStorage.set('route-lotem', JSON.stringify({
  currentStage: 4,
  progress: { 1: 3, 2: 3, 3: 3 },
  contentVersion: 2,
}));

// Complete stage 1 in Forest for Lotem
const forestContext = {
  profileId: 'lotem',
  stageId: 1,
  destination: 'forest',
  profileLanguage: 'en',
};
recordDestinationStageCompletion(forestContext, 3, storageAdapter);

// Verify Forest progress was created and advanced
const forestSaved = JSON.parse(mockStorage.get('forest-route-lotem-en'));
assert.equal(forestSaved.currentStage, 2);
assert.equal(forestSaved.progress[1], 3);

// Verify Wonder progress was NOT touched
const wonderSaved = JSON.parse(mockStorage.get('route-lotem'));
assert.equal(wonderSaved.currentStage, 4);
assert.deepEqual(wonderSaved.progress, { 1: 3, 2: 3, 3: 3 });

// Progress in Forest to stage 5 (milestone trigger)
recordDestinationStageCompletion({ ...forestContext, stageId: 2 }, 3, storageAdapter);
recordDestinationStageCompletion({ ...forestContext, stageId: 3 }, 3, storageAdapter);
recordDestinationStageCompletion({ ...forestContext, stageId: 4 }, 3, storageAdapter);
const forestBeforeStage5 = JSON.parse(mockStorage.get('forest-route-lotem-en'));
assert.equal(forestBeforeStage5.currentStage, 5);
assert.ok(!forestBeforeStage5.unlockedVideos.includes('forest-video-02'));

// Complete stage 5 -> unlocks forest-video-02
recordDestinationStageCompletion({ ...forestContext, stageId: 5 }, 2, storageAdapter);
const forestAfterStage5 = JSON.parse(mockStorage.get('forest-route-lotem-en'));
assert.equal(forestAfterStage5.currentStage, 6);
assert.ok(forestAfterStage5.unlockedVideos.includes('forest-video-02'));

// Replaying stage 5 does not duplicate unlock or regress stars
recordDestinationStageCompletion({ ...forestContext, stageId: 5 }, 1, storageAdapter);
const forestAfterReplay = JSON.parse(mockStorage.get('forest-route-lotem-en'));
assert.equal(forestAfterReplay.progress[5], 2, 'stars not regressed');
assert.equal(
  forestAfterReplay.unlockedVideos.filter(id => id === 'forest-video-02').length,
  1,
  'no duplicate video unlock',
);

// 7. Video presentation tracking
markVideoSeen('lotem', 'en', 'forest-video-01', storageAdapter);
const forestAfterSeen = JSON.parse(mockStorage.get('forest-route-lotem-en'));
assert.deepEqual(forestAfterSeen.seenVideos, ['forest-video-01']);

// 8. Active destination preference
const mockLocal = new Map();
const localAdapter = {
  getItem: k => mockLocal.get(k) ?? null,
  setItem: (k, v) => mockLocal.set(k, v),
};
assert.equal(getActiveDestination(localAdapter), 'wonder', 'default destination is wonder');
setActiveDestination('forest', localAdapter);
assert.equal(getActiveDestination(localAdapter), 'forest');
setActiveDestination('wonder', localAdapter);
assert.equal(getActiveDestination(localAdapter), 'wonder');

// 9. Milestone theater media: every video resolves to a .mp4 + poster pair
assert.equal(Object.keys(FOREST_VIDEO_MEDIA).length, 9);
FOREST_MILESTONES.forEach((item, index) => {
  const number = String(index + 1).padStart(2, '0');
  const media = getForestVideoMedia(item.videoId);
  assert.equal(media.src, `./assets/forest/forest-video-${number}.mp4`);
  assert.equal(media.poster, `./assets/forest/forest-video-${number}.jpg`);
  assert.ok(
    existsSync(new URL(`../prototype${media.poster.slice(1)}`, import.meta.url)),
    `poster ships with the prototype: ${media.poster}`,
  );
});
assert.throws(() => getForestVideoMedia('forest-video-99'), /Unknown forest video/);

console.log('PASS: Destination definitions, save isolation, milestone triggers, and active destination switching.');

assert.equal(getPendingForestMilestone(forestAfterSeen).videoId, 'forest-video-02', 'a completed milestone remains pending after reload until viewed or skipped');
assert.equal(getActivitySavePrefix('lotem','forest','he'),'forest-lotem-he');
assert.equal(getActivitySavePrefix('lotem','wonder','he'),'lotem');
for(const media of Object.values(FOREST_VIDEO_MEDIA)) assert.ok(existsSync(new URL('../prototype'+media.src.slice(1),import.meta.url)), 'real video ships');
