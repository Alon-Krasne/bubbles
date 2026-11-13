import { STAGES_PER_CHAPTER, TRAIL_GAME_SEQUENCE, difficultyRankForStage } from './trail-recipes.mjs';

// Map geometry and story ordering. Activity recipes live in reef-levels.mjs.
export const REEF_MAP_SIZE = Object.freeze({ width: 1600, height: 1073 });
// Reef storybook locks its final three gameplay beats to Memory → Shop → House.
export const REEF_MAP_GAME_SEQUENCE = Object.freeze([...TRAIL_GAME_SEQUENCE.slice(0, 33), 'memory', 'shop', 'house']);
export const REEF_ACTIVITIES = Object.freeze({
  memory: { title: 'משחק הזיכרון', description: 'מגלים מילים ומוצאים זוגות.', color: 'mint' },
  shop: { title: 'החנות של החברים', description: 'מקשיבים, סופרים ועוזרים לחברים.', color: 'peach' },
  house: { title: 'הבית הקסום', description: 'מקשיבים לבקשה ומוצאים לכל דבר מקום.', color: 'lavender' },
  reveal: { title: 'מגלים תמונה', description: 'מילה אחר מילה, השונית מתגלה.', color: 'lemon' },
  painter: { title: 'הצייר הקסום', description: 'מציירים, צובעים ומגלים מילים.', color: 'rose' },
});

export const REEF_CHAPTERS = Object.freeze([
  { id: 1, title: 'שונית החברים', topic: 'ים וחיות', label: { x: 88, y: 75 }, curve: [[88, 82], [81, 78], [71, 74], [66, 60]] },
  { id: 2, title: 'המזווה של הספינה', topic: 'מטבח ואוכל', label: { x: 47, y: 94 }, curve: [[66, 60], [56, 58], [43, 66], [32, 62]] },
  { id: 3, title: 'סמטת הפנסים', topic: 'מוזיקה וצבעים', label: { x: 17, y: 76 }, curve: [[32, 62], [26, 54], [31, 42], [48, 37]] },
  { id: 4, title: 'מזג האוויר בים', topic: 'מזג אוויר, טבע ובגדים', label: { x: 49, y: 57 }, curve: [[48, 37], [60, 34], [63, 53], [74, 57]] },
  { id: 5, title: 'כיכר הרגשות', topic: 'רגשות, מקצועות ואנשים', label: { x: 29, y: 34 }, curve: [[74, 57], [83, 47], [74, 21], [57, 22]] },
  { id: 6, title: 'מגדלור הפנינה', topic: 'כל המילים שכבר הכרנו', label: { x: 87, y: 13 }, curve: [[57, 22], [43, 8], [77, 8], [84, 34]] },
].map((chapter, index) => Object.freeze({
  ...chapter,
  rank: difficultyRankForStage(TRAIL_GAME_SEQUENCE.length + index * STAGES_PER_CHAPTER + 1),
})));

export const REEF_STORIES = Object.freeze([
  { id: 'bridge-forest-reef', title: 'הדרך אל הים', after: null },
  ...['בועות על החוף', 'הכפר שבספינה הטבועה', 'הזרם מתעורר', 'המפה שבחדר הקברניט', 'אור מעבר לתהום', 'המגדלור פותח את שעריו', 'כל הזרמים נפגשים', 'הפנינה כמעט מאירה', 'השונית שוב זוהרת'].map((title, i) => ({
    id: `reef-video-${String(i + 1).padStart(2, '0')}`, title, after: [0, 5, 10, 15, 20, 25, 30, 35, 36][i],
  })),
].map(story => Object.freeze({ ...story, src: `./assets/reef/${story.id}.mp4`, poster: `./assets/reef/${story.id}.jpg` })));

function curvePoint(points, t) {
  const u = 1 - t;
  return {
    x: u ** 3 * points[0][0] + 3 * u ** 2 * t * points[1][0] + 3 * u * t ** 2 * points[2][0] + t ** 3 * points[3][0],
    y: u ** 3 * points[0][1] + 3 * u ** 2 * t * points[1][1] + 3 * u * t ** 2 * points[2][1] + t ** 3 * points[3][1],
  };
}

// Equal-distance placement keeps the touch targets apart even on tight bends.
function spacedPoints(curve, includeEnd) {
  const samples = Array.from({ length: 121 }, (_, i) => curvePoint(curve, i / 120));
  const distances = [0];
  for (let i = 1; i < samples.length; i++) {
    distances.push(distances[i - 1] + Math.hypot((samples[i].x - samples[i - 1].x) * REEF_MAP_SIZE.width / 100, (samples[i].y - samples[i - 1].y) * REEF_MAP_SIZE.height / 100));
  }
  return Array.from({ length: 6 }, (_, i) => {
    const target = distances.at(-1) * (i / (includeEnd ? 5 : 6));
    const index = distances.findIndex(distance => distance >= target);
    return samples[index];
  });
}

export const REEF_STAGES = Object.freeze(REEF_CHAPTERS.flatMap((chapter, chapterIndex) =>
  spacedPoints(chapter.curve, chapterIndex === 5).map((position, i) => {
    const id = chapterIndex * 6 + i + 1;
    return Object.freeze({ id, chapter: chapter.id, activity: REEF_MAP_GAME_SEQUENCE[id - 1], position: Object.freeze(position), playable: true });
  }),
));

export function getReefStage(id) {
  const stage = REEF_STAGES.find(item => item.id === id);
  if (!stage) throw new Error(`Unknown Reef stage: ${id}`);
  return stage;
}

export function getStoryBeforeReefStage(id) {
  getReefStage(id);
  return REEF_STORIES.filter(story => story.after !== null && story.after < id).at(-1);
}
