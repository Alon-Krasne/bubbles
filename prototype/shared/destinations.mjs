import { TRAIL_STAGES } from './trail-catalog.mjs';
import { TRAIL_CONTENT_VERSION } from './track-progress.mjs';

export const ACTIVE_DESTINATION_STORAGE_KEY = 'bubble_active_destination_v1';

export const DESTINATIONS = {
  wonder: {
    id: 'wonder',
    title: 'עולם הפלאים',
    kicker: 'המסע הקסום',
    description: 'הגנים הקסומים, החנות והבית המתוק',
    art: '../src/assets/memory/moonlit-trail-map.webp',
  },
  forest: {
    id: 'forest',
    title: 'היער הלוחש',
    kicker: 'הרפתקה ביער',
    description: 'מגלים את שפת היער ועוזרים לחברים להתחבר מחדש',
    art: './assets/destinations/forest-preview.jpg',
  },
};

export const FOREST_CHARACTERS = {
  nabat: {
    id: 'nabat',
    name: 'נבט',
    role: 'The curious friend',
    description: 'סקרן, מקשיב ומגלה דברים חדשים',
    color: '#7ba647',
    emoji: '🌱',
  },
  adva: {
    id: 'adva',
    name: 'אדוה',
    role: 'The playful friend',
    description: 'עליזה, אוהבת לצחוק ולשחק יחד',
    color: '#4a82d2',
    emoji: '💧',
  },
  zohar: {
    id: 'zohar',
    name: 'זוהר',
    role: 'The thoughtful friend',
    description: 'אוהב לעזור ולחשוב על מה שחברים צריכים',
    color: '#d4881f',
    emoji: '✨',
  },
};

export const FOREST_MILESTONES = [
  { milestone: 0, videoId: 'forest-video-01', title: 'מה החבר מבקש?', triggerStage: 0 },
  { milestone: 5, videoId: 'forest-video-02', title: 'הנה התפוח והמים!', triggerStage: 5 },
  { milestone: 10, videoId: 'forest-video-03', title: 'עוברים את הנהר', triggerStage: 10 },
  { milestone: 15, videoId: 'forest-video-04', title: 'פוגשים את שוכני השורש', triggerStage: 15 },
  { milestone: 20, videoId: 'forest-video-05', title: 'קולות במערה', triggerStage: 20 },
  { milestone: 25, videoId: 'forest-video-06', title: 'האולם הגדול בעץ', triggerStage: 25 },
  { milestone: 30, videoId: 'forest-video-07', title: 'החברים מגיעים', triggerStage: 30 },
  { milestone: 35, videoId: 'forest-video-08', title: 'עוד עזרה קטנה', triggerStage: 35 },
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

export function recordDestinationStageCompletion(context, stars, storage) {
  const destination = context.destination || 'wonder';
  const language = context.profileLanguage || 'en';
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

  route.progress ??= {};
  route.progress[context.stageId] = Math.max(route.progress[context.stageId] || 0, stars);

  const totalStages = TRAIL_STAGES.length;
  while (route.progress[route.currentStage] && route.currentStage < totalStages) {
    route.currentStage += 1;
  }

  if (destination === 'forest') {
    route.unlockedVideos ??= ['forest-video-01'];
    route.seenVideos ??= [];

    // Check milestones for newly unlocked videos based on completed stages
    for (const item of FOREST_MILESTONES) {
      if (item.triggerStage > 0 && route.progress[item.triggerStage] > 0) {
        if (!route.unlockedVideos.includes(item.videoId)) {
          route.unlockedVideos.push(item.videoId);
        }
      }
    }
  }

  storage.setItem(key, JSON.stringify({ ...route, contentVersion: TRAIL_CONTENT_VERSION }));
  return route;
}

export function markVideoSeen(profileId, language, videoId, storage) {
  const key = getRouteKey(profileId, 'forest', language);
  const stored = storage.getItem(key);
  if (!stored) return;

  const route = JSON.parse(stored);
  route.seenVideos ??= [];
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
