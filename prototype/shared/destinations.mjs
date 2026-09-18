import { TRAIL_STAGES } from './trail-catalog.mjs';
import { TRAIL_CONTENT_VERSION } from './track-progress.mjs';

export const ACTIVE_DESTINATION_STORAGE_KEY = 'bubble_active_destination_v1';

export const DESTINATIONS = {
  wonder: {
    id: 'wonder',
    title: 'עולם הפלאים',
  },
  forest: {
    id: 'forest',
    title: 'היער הלוחש',
  },
};

export const FOREST_CHARACTERS = {
  nevet: {
    id: 'nevet',
    name: 'נבט',
    description: 'סקרן, מקשיב ומגלה דברים חדשים',
    color: '#7ba647',
    emoji: '🌱',
  },
  adva: {
    id: 'adva',
    name: 'אדוה',
    description: 'עליזה, אוהבת לצחוק ולשחק יחד',
    color: '#4a82d2',
    emoji: '💧',
  },
  zohar: {
    id: 'zohar',
    name: 'זוהר',
    description: 'אוהב לעזור ולחשוב על מה שחברים צריכים',
    color: '#d4881f',
    emoji: '✨',
  },
};

export const FOREST_MILESTONES = [
  { milestone: 0, videoId: 'forest-video-01', title: 'מה החבר מבקש?', triggerStage: 0 },
  { milestone: 5, videoId: 'forest-video-02', title: 'הכפר שמאחורי המפל', triggerStage: 5 },
  { milestone: 10, videoId: 'forest-video-03', title: 'הגשר מתעורר', triggerStage: 10 },
  { milestone: 15, videoId: 'forest-video-04', title: 'המפה שבסדנה', triggerStage: 15 },
  { milestone: 20, videoId: 'forest-video-05', title: 'אור מעבר למים', triggerStage: 20 },
  { milestone: 25, videoId: 'forest-video-06', title: 'העץ פותח את הדלתות', triggerStage: 25 },
  { milestone: 30, videoId: 'forest-video-07', title: 'כל השבילים נפגשים', triggerStage: 30 },
  { milestone: 35, videoId: 'forest-video-08', title: 'האור האחרון', triggerStage: 35 },
  { milestone: 36, videoId: 'forest-video-09', title: 'היער שוב שר', triggerStage: 36 },
];

// Shared wordless masters, reused for both learning languages.
export const FOREST_VIDEO_MEDIA = Object.fromEntries(
  FOREST_MILESTONES.map((item, index) => {
    const number = String(index + 1).padStart(2, '0');
    return [item.videoId, {
      src: `./assets/forest/forest-video-${number}.mp4`,
      poster: `./assets/forest/forest-video-${number}.jpg`,
    }];
  }),
);

export function getForestVideoMedia(videoId) {
  const media = FOREST_VIDEO_MEDIA[videoId];
  if (!media) {
    throw new Error(`Unknown forest video ${videoId}`);
  }
  return media;
}

export function getRouteKey(profileId, destination = 'wonder', language = 'en') {
  if (destination === 'forest') {
    return `forest-route-${profileId}-${language}`;
  }
  return `route-${profileId}`;
}

export function createForestProgress(character = null) {
  return {
    currentStage: 1,
    progress: {},
    character,
    unlockedVideos: ['forest-video-01'],
    seenVideos: [],
    contentVersion: TRAIL_CONTENT_VERSION,
  };
}

export function unlockForestMilestone(route, stageId) {
  const milestone = FOREST_MILESTONES.find(m => m.triggerStage === stageId);
  if (milestone && !route.unlockedVideos.includes(milestone.videoId)) {
    route.unlockedVideos.push(milestone.videoId);
    return milestone;
  }
  return null;
}

export function recordDestinationStageCompletion(context, stars, storage) {
  const destination = context.destination;
  const language = context.profileLanguage;
  const key = getRouteKey(context.profileId, destination, language);

  const stored = storage.getItem(key);
  let route;
  if (stored) {
    route = JSON.parse(stored);
  } else {
    route = destination === 'forest'
      ? createForestProgress()
      : { progress: {}, currentStage: 1 };
  }

  const previousStars = route.progress[context.stageId] || 0;
  route.progress[context.stageId] = Math.max(previousStars, stars);

  const totalStages = TRAIL_STAGES.length;
  while (route.progress[route.currentStage] && route.currentStage < totalStages) {
    route.currentStage += 1;
  }

  let unlockedMilestone = null;
  if (destination === 'forest' && previousStars === 0) {
    unlockedMilestone = unlockForestMilestone(route, context.stageId);
  }

  storage.setItem(key, JSON.stringify({ ...route, contentVersion: TRAIL_CONTENT_VERSION }));
  route.unlockedMilestone = unlockedMilestone;
  return route;
}

export function markVideoSeen(profileId, language, videoId, storage) {
  const key = getRouteKey(profileId, 'forest', language);
  const stored = storage.getItem(key);
  if (!stored) return;

  const route = JSON.parse(stored);
  if (!route.seenVideos.includes(videoId)) {
    route.seenVideos.push(videoId);
    storage.setItem(key, JSON.stringify(route));
  }
}

export function getActiveDestination(storage = localStorage) {
  const saved = storage.getItem(ACTIVE_DESTINATION_STORAGE_KEY);
  if (saved && Object.prototype.hasOwnProperty.call(DESTINATIONS, saved)) {
    return saved;
  }
  return 'wonder';
}

export function setActiveDestination(destination, storage = localStorage) {
  if (!Object.prototype.hasOwnProperty.call(DESTINATIONS, destination)) {
    throw new Error(`Invalid destination: ${destination}`);
  }
  storage.setItem(ACTIVE_DESTINATION_STORAGE_KEY, destination);
}

export function getPendingForestMilestone(progress) {
  return FOREST_MILESTONES.find(m => progress.unlockedVideos.includes(m.videoId) && !progress.seenVideos.includes(m.videoId));
}

export function getActivitySavePrefix(profileId, destination, language) {
  return destination === 'forest' ? `forest-${profileId}-${language}` : profileId;
}
