import { getRouteKey } from './destinations.mjs';
import { REEF_STORIES, getReefStage } from './reef-map.mjs';

export function readReefRoute(profile, storage) {
  return JSON.parse(storage.getItem(getRouteKey(profile.id, 'reef', profile.learningLanguage)));
}

export function isReefUnlocked(profile, storage) {
  const forest = JSON.parse(storage.getItem(getRouteKey(profile.id, 'forest', profile.learningLanguage)));
  return readReefRoute(profile, storage)?.unlocked === true || forest?.progress[36] > 0;
}

export function openReefRoute(profile, storage) {
  if (!isReefUnlocked(profile, storage)) throw new Error('Reef world is locked until Forest stage 36 is completed');
  const key = getRouteKey(profile.id, 'reef', profile.learningLanguage);
  const saved = readReefRoute(profile, storage);
  if (saved) return saved;
  const route = {
    currentStage: 1,
    progress: {},
    unlocked: true,
    unlockedVideos: REEF_STORIES.filter(story => story.after === null || story.after === 0).map(story => story.id),
    seenVideos: [],
    contentVersion: 1,
  };
  storage.setItem(key, JSON.stringify(route));
  return route;
}

export function completeReefStage(profile, stageId, stars, storage) {
  getReefStage(stageId);
  if (!Number.isInteger(stars) || stars < 1 || stars > 3) throw new Error('Invalid Reef stars');
  const route = openReefRoute(profile, storage);
  if (stageId > route.currentStage) throw new Error(`Reef stage ${stageId} is locked`);
  const previousStars = route.progress[stageId] || 0;
  route.progress[stageId] = Math.max(previousStars, stars);
  if (stageId === route.currentStage && stageId < 36) route.currentStage++;
  if (previousStars === 0) {
    const story = REEF_STORIES.find(item => item.after === stageId);
    if (story && !route.unlockedVideos.includes(story.id)) route.unlockedVideos.push(story.id);
  }
  storage.setItem(getRouteKey(profile.id, 'reef', profile.learningLanguage), JSON.stringify(route));
  return route;
}

export function pendingReefStory(route) {
  return REEF_STORIES.find(story => route.unlockedVideos.includes(story.id) && !route.seenVideos.includes(story.id));
}

export function markReefStorySeen(profile, storyId, storage) {
  const route = openReefRoute(profile, storage);
  if (!route.unlockedVideos.includes(storyId)) throw new Error(`Reef story ${storyId} is locked`);
  if (route.seenVideos.includes(storyId)) return route;
  route.seenVideos.push(storyId);
  storage.setItem(getRouteKey(profile.id, 'reef', profile.learningLanguage), JSON.stringify(route));
  return route;
}
