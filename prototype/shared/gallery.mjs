import { FOREST_MILESTONES, getForestVideoMedia, getRouteKey } from './destinations.mjs';

export const REVEAL_PICTURES = [
  ['strawberry-island', 'אי התותים'], ['pearl-village', 'כפר הפנינים'],
  ['moon-garden', 'גן הירח'], ['woodland-bakery', 'מאפיית היער'],
  ['rainbow-railway', 'רכבת הקשת'], ['snowy-village', 'כפר השלג'],
  ['butterfly-garden', 'גן הפרפרים'], ['dragon-library', 'ספריית הדרקון'],
  ['seaside-bubble-workshop', 'סדנת הבועות על הים'],
].map(([id, title]) => ({ id, title, src: `assets/reveal/${id}.webp` }));

export const getGalleryKey = profileId => `gallery-${profileId}`;

export function getCollectedPictures(profileId, storage) {
  const saved = storage.getItem(getGalleryKey(profileId));
  return saved === null ? [] : JSON.parse(saved);
}

export function collectPicture(profileId, pictureId, storage) {
  if (!REVEAL_PICTURES.some(picture => picture.id === pictureId)) throw new Error(`Unknown picture ${pictureId}`);
  const collected = getCollectedPictures(profileId, storage);
  if (!collected.includes(pictureId)) storage.setItem(getGalleryKey(profileId), JSON.stringify([...collected, pictureId]));
}

export function getGalleryItems(profileId, storage) {
  const pictures = getCollectedPictures(profileId, storage);
  const videos = new Set();
  for (const language of ['en', 'he']) {
    const saved = storage.getItem(getRouteKey(profileId, 'forest', language));
    if (saved !== null) for (const id of JSON.parse(saved).unlockedVideos) videos.add(id);
  }
  return [
    ...REVEAL_PICTURES.map(picture => ({ ...picture, type: 'picture', unlocked: pictures.includes(picture.id), hint: 'מגלים מילה במשחק התמונה הקסומה' })),
    ...FOREST_MILESTONES.map(milestone => ({
      id: milestone.videoId, title: milestone.title, type: 'video',
      ...getForestVideoMedia(milestone.videoId), unlocked: videos.has(milestone.videoId),
      hint: milestone.triggerStage === 0 ? 'יוצאים למסע ביער הלוחש' : `מסיימים את שלב ${milestone.triggerStage} ביער הלוחש`,
    })),
  ];
}

export function getPictureOrder(collected, random = Math.random) {
  const pictures = [...REVEAL_PICTURES];
  for (let i = pictures.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pictures[i], pictures[j]] = [pictures[j], pictures[i]];
  }
  return [...pictures.filter(item => !collected.includes(item.id)), ...pictures.filter(item => collected.includes(item.id))];
}
