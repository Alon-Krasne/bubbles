import { MAGIC_HOUSE_REQUESTS } from './magic-house-content.mjs';
import {
  DIFFICULTY_LABELS,
  GENERATED_TRAIL,
  MAGIC_REQUEST_TARGET_IDS,
  TRAIL_CHAPTERS,
  createMagicHouseLevel,
  createMemoryLevel,
  createShopLevel,
  generateTrail,
} from './trail-recipes.mjs';

export {
  DIFFICULTY_LABELS,
  GENERATED_TRAIL,
  MAGIC_REQUEST_TARGET_IDS,
  TRAIL_CHAPTERS,
  createMagicHouseLevel,
  createMemoryLevel,
  createShopLevel,
  generateTrail,
};

export const LANGUAGE_POLICIES = Object.freeze({
  english: Object.freeze({
    prompt: 'spoken-english',
    choices: 'semantic-images',
    target: 'english-without-answer-image',
  }),
  hebrew: Object.freeze({
    prompt: 'written-hebrew',
    choices: 'written-hebrew',
    target: 'hebrew-without-answer-image-or-pre-answer-speech',
  }),
});

const GAME_DEFINITIONS = Object.freeze({
  memory: Object.freeze({ activity: 'memory-garden', entry: '../index.html', label: 'גן מילים' }),
  shop: Object.freeze({ activity: 'listening-shop', entry: '../index.html', label: 'החנות הקטנה' }),
  house: Object.freeze({ activity: 'magic-house', entry: './magic-house.html', label: 'הבית הקסום' }),
});

export function getLanguagePolicy(language) {
  if (language === 'en') {
    return LANGUAGE_POLICIES.english;
  }
  if (language === 'he') {
    return LANGUAGE_POLICIES.hebrew;
  }
  throw new Error(`Unknown learning language ${language}`);
}

const LEGACY_MEMORY_LEVELS = Object.freeze([
  createMemoryLevel({
    id: 'level-1', difficulty: 'easy', difficultyRank: 1, title: 'שלב 1', subtitle: 'חיות קלות', pairs: 4, icon: '🐶',
    wordPool: ['dog', 'cat', 'bird', 'rabbit', 'fish', 'bear', 'fox', 'frog', 'cow', 'pig', 'sheep', 'duck', 'panda', 'monkey', 'lion', 'tiger', 'horse', 'chicken', 'bee', 'snail', 'koala', 'penguin', 'elephant', 'giraffe', 'zebra', 'turtle', 'whale', 'dolphin', 'butterfly', 'unicorn'], locked: false,
  }),
  createMemoryLevel({
    id: 'level-2', difficulty: 'medium', difficultyRank: 2, title: 'שלב 2', subtitle: 'אוכל ופירות', pairs: 6, icon: '🍎',
    wordPool: ['apple', 'banana', 'orange', 'strawberry', 'grapes', 'pear', 'watermelon', 'peach', 'pineapple', 'lemon', 'cherries', 'tomato', 'carrot', 'corn', 'potato', 'mushroom', 'bread', 'egg', 'cheese', 'milk', 'water', 'cake', 'cookie', 'honey', 'hamburger', 'fries', 'rice', 'spaghetti', 'soup', 'candy', 'chocolate'], locked: false,
  }),
  createMemoryLevel({
    id: 'level-3', difficulty: 'hard', difficultyRank: 3, title: 'שלב 3', subtitle: 'טבע ושמיים', pairs: 8, icon: '☀️',
    wordPool: ['sun', 'moon', 'tree', 'flower', 'star', 'cloud', 'rainbow', 'mountain', 'rain', 'leaf', 'snowflake', 'fire', 'volcano', 'ocean', 'cactus', 'car', 'bus', 'train', 'airplane', 'boat', 'bicycle', 'scooter', 'tractor', 'taxi', 'rocket'], locked: false, reward: '🎁',
  }),
  createMemoryLevel({
    id: 'level-4', difficulty: 'easy', difficultyRank: 1, title: 'שלב 4', subtitle: 'אוכל בסיסי', pairs: 4, icon: '🥛',
    wordPool: ['bread', 'milk', 'egg', 'cheese', 'water', 'rice', 'soup', 'honey', 'sandwich', 'corn', 'potato', 'carrot'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-5', difficulty: 'medium', difficultyRank: 2, title: 'שלב 5', subtitle: 'צעצועים ולימודים', pairs: 6, icon: '⚽',
    wordPool: ['ball', 'book', 'pencil', 'crayon', 'backpack', 'balloon', 'kite', 'teddy-bear'], locked: true, reward: '🎁',
  }),
  createMemoryLevel({
    id: 'level-6', difficulty: 'medium', difficultyRank: 2, title: 'שלב 6', subtitle: 'נסיעות', pairs: 6, icon: '🚗',
    wordPool: ['car', 'bus', 'train', 'airplane', 'boat', 'bicycle', 'scooter', 'tractor', 'taxi', 'rocket'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-7', difficulty: 'hard', difficultyRank: 3, title: 'שלב 7', subtitle: 'חיות גדולות', pairs: 8, icon: '🐘',
    wordPool: ['elephant', 'giraffe', 'zebra', 'lion', 'tiger', 'panda', 'monkey', 'bear', 'horse', 'cow', 'whale', 'dolphin', 'penguin', 'turtle'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-8', difficulty: 'easy', difficultyRank: 1, title: 'שלב 8', subtitle: 'בגדים', pairs: 4, icon: '👕',
    wordPool: ['hat', 'shirt', 'shoe', 'sock', 'dress', 'pants', 'coat', 'scarf', 'glove'], locked: true, reward: '🎁',
  }),
  createMemoryLevel({
    id: 'level-9', difficulty: 'medium', difficultyRank: 2, title: 'שלב 9', subtitle: 'דברים בבית', pairs: 6, icon: '🏠',
    wordPool: ['house', 'door', 'bed', 'chair', 'couch', 'lamp', 'key', 'clock', 'cup', 'plate', 'spoon', 'fork', 'toothbrush', 'soap', 'scissors', 'phone', 'umbrella', 'radio'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-10', difficulty: 'hard', difficultyRank: 4, title: 'שלב 10', subtitle: 'בית ספר והעיר', pairs: 9, icon: '🎒',
    wordPool: ['classroom', 'desk', 'notebook', 'ruler', 'eraser', 'marker', 'glue', 'paper', 'computer', 'calculator', 'paintbrush', 'camera', 'map', 'calendar', 'dictionary', 'park', 'playground', 'school', 'library', 'hospital', 'supermarket', 'beach', 'zoo', 'farm', 'cinema', 'restaurant', 'bakery', 'station', 'airport', 'bridge', 'house', 'door', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'hand', 'foot', 'brain', 'baby', 'child', 'girl', 'boy', 'teacher'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-11', difficulty: 'easy', difficultyRank: 1, title: 'שלב 11', subtitle: 'גוף', pairs: 4, icon: '👁️',
    wordPool: ['eye', 'ear', 'nose', 'mouth', 'tooth', 'hand', 'foot', 'brain'], locked: true, reward: '🎁',
  }),
  createMemoryLevel({
    id: 'level-12', difficulty: 'medium', difficultyRank: 2, title: 'שלב 12', subtitle: 'אנשים וגוף', pairs: 6, icon: '🧒',
    wordPool: ['baby', 'child', 'girl', 'boy', 'teacher', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'hand', 'foot', 'brain'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-13', difficulty: 'hard', difficultyRank: 4, title: 'שלב 13', subtitle: 'פינוקים', pairs: 8, icon: '🍰',
    wordPool: ['cake', 'cookie', 'ice-cream', 'pizza', 'hamburger', 'fries', 'sandwich', 'candy', 'chocolate', 'doughnut', 'honey', 'spaghetti', 'soup', 'rice'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-14', difficulty: 'medium', difficultyRank: 3, title: 'שלב 14', subtitle: 'צבעים וחפצים', pairs: 6, icon: '💙',
    wordPool: ['red-heart', 'blue-heart', 'yellow-heart', 'green-heart', 'purple-heart', 'red-book', 'blue-book', 'orange-book', 'green-book', 'red-square', 'blue-square', 'yellow-square', 'green-square'], locked: true,
  }),
  createMemoryLevel({
    id: 'level-15', difficulty: 'hard', difficultyRank: 5, title: 'שלב 15', subtitle: 'ספורט ופעולות', pairs: 10, icon: '👑',
    wordPool: ['basketball', 'tennis', 'baseball', 'volleyball', 'football', 'badminton', 'table-tennis', 'swimming', 'running', 'cycling', 'gymnastics', 'goal', 'medal', 'trophy', 'skateboard', 'run', 'walk', 'jump', 'swim', 'dance', 'sing', 'read', 'write', 'draw', 'eat', 'drink', 'sleep', 'laugh', 'cry', 'listen'], locked: true, reward: '🏆',
  }),
]);

const LEGACY_SHOP_LEVELS = Object.freeze([
  createShopLevel({ id: 'shop-level-1', difficultyRank: 1, title: 'קונים ראשונים', subtitle: '5 קונים, 4 פריטים', icon: '🍌', customerCount: 5, shelfSize: 4, mode: 'single', itemPool: ['banana', 'apple', 'milk', 'bread', 'egg', 'cheese', 'water', 'orange', 'strawberry', 'carrot', 'cookie', 'cup'] }),
  createShopLevel({ id: 'shop-level-2', difficultyRank: 2, title: 'החנות מתמלאת', subtitle: '6 קונים, 6 פריטים', icon: '🥛', customerCount: 6, shelfSize: 6, mode: 'single', itemPool: ['ball', 'book', 'hat', 'shoe', 'plate', 'spoon', 'fork', 'toothbrush', 'soap', 'scissors', 'notebook', 'ruler', 'shirt', 'dress', 'backpack', 'paper', 'computer', 'calculator', 'paintbrush', 'camera'] }),
  createShopLevel({ id: 'shop-level-3', difficultyRank: 3, title: 'אחת, שתיים, שלוש', subtitle: 'כמויות של 1-3', icon: '🍎', customerCount: 6, shelfSize: 6, mode: 'quantity', itemPool: ['banana', 'apple', 'egg', 'cake', 'cookie', 'orange', 'strawberry', 'carrot', 'tomato', 'potato', 'mushroom', 'pear', 'peach', 'doughnut', 'ball', 'notebook'] }),
  createShopLevel({ id: 'shop-level-4', difficultyRank: 4, title: 'צבעים בחנות', subtitle: 'מקשיבים לצבע', icon: '💙', customerCount: 6, shelfSize: 8, mode: 'color', itemPool: ['red-heart', 'blue-heart', 'yellow-heart', 'green-heart', 'purple-heart', 'orange-heart', 'red-book', 'blue-book', 'orange-book', 'green-book', 'red-square', 'blue-square', 'yellow-square', 'green-square', 'brown-circle', 'white-circle'] }),
  createShopLevel({ id: 'shop-level-5', difficultyRank: 5, title: 'הזמנה כפולה', subtitle: 'שני פריטים לקונה', icon: '🛒', customerCount: 7, shelfSize: 8, mode: 'double', itemPool: ['banana', 'apple', 'milk', 'bread', 'egg', 'cheese', 'water', 'cake', 'cookie', 'ice-cream', 'orange', 'strawberry', 'carrot', 'tomato', 'corn', 'pizza', 'sandwich', 'ball', 'book', 'hat', 'shoe', 'cup', 'notebook', 'ruler', 'marker', 'computer', 'camera', 'basketball', 'baseball', 'volleyball', 'medal', 'trophy', 'hamburger', 'fries', 'rice', 'spaghetti', 'soup', 'candy', 'chocolate', 'bed', 'chair', 'couch', 'lamp', 'key', 'clock', 'phone', 'umbrella', 'radio', 'shirt', 'dress', 'pants', 'sock', 'coat', 'scarf', 'glove', 'pencil', 'crayon', 'backpack', 'balloon', 'kite', 'teddy-bear'] }),
]);

const MAGIC_REQUEST_IDS = Object.freeze(MAGIC_HOUSE_REQUESTS.map((request) => request.id));
const LEGACY_MAGIC_HOUSE_LEVELS = Object.freeze([
  createMagicHouseLevel({ id: 'bedroom-practice', difficultyRank: 1, title: 'חדר אימון', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-1', difficultyRank: 1, title: 'החדר הראשון', requestIds: MAGIC_REQUEST_IDS, requestCount: 3, drawerSize: 5, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-2', difficultyRank: 2, title: 'עוד סדר בחדר', requestIds: MAGIC_REQUEST_IDS, requestCount: 4, drawerSize: 6, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-3', difficultyRank: 3, title: 'משפטים ארוכים', requestIds: MAGIC_REQUEST_IDS, requestCount: 5, drawerSize: 7, maxHelpLevel: 2 }),
  createMagicHouseLevel({ id: 'bedroom-4', difficultyRank: 4, title: 'אלופי החדר', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 2 }),
  createMagicHouseLevel({ id: 'bedroom-5', difficultyRank: 5, title: 'אלופי הבית הקסום', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 1 }),
]);

export const LEGACY_GAME_LEVELS = Object.freeze({
  memory: LEGACY_MEMORY_LEVELS,
  shop: LEGACY_SHOP_LEVELS,
  house: LEGACY_MAGIC_HOUSE_LEVELS,
});

// Standalone Magic House (opened without a world-map host) keeps the full practice room.
export const MAGIC_HOUSE_PRACTICE_LEVEL = LEGACY_MAGIC_HOUSE_LEVELS[0];

export function getLegacyGameLevel(game, levelId) {
  const levels = LEGACY_GAME_LEVELS[game];
  if (!levels) {
    throw new Error(`Unknown trail game ${game}`);
  }
  const level = levels.find((candidate) => candidate.id === levelId);
  if (!level) {
    throw new Error(`Unknown ${game} level ${levelId}`);
  }
  return level;
}

export function createTrailStage({ id, x, y, game, level, title, description, symbol, chapter, chapterIndex }, resolveLevel = getGameLevel) {
  if (!Number.isInteger(id) || id < 1 || !Number.isFinite(x) || !Number.isFinite(y) || !title || !description) {
    throw new Error(`Invalid trail stage ${id}`);
  }
  const definition = GAME_DEFINITIONS[game];
  if (!definition) {
    throw new Error(`Unknown trail game ${game}`);
  }
  const gameLevel = resolveLevel(game, level);
  return Object.freeze({
    id,
    x,
    y,
    game,
    level,
    title,
    description,
    activity: definition.activity,
    entry: definition.entry,
    gameLabel: definition.label,
    difficultyRank: gameLevel.difficultyRank,
    difficultyLabel: DIFFICULTY_LABELS[gameLevel.difficultyRank],
    available: true,
    ...(symbol ? { symbol } : {}),
    ...(chapter ? { chapter } : {}),
    ...(Number.isInteger(chapterIndex) ? { chapterIndex } : {}),
  });
}

const createLegacyTrailStage = (spec) => createTrailStage(spec, getLegacyGameLevel);

export const LEGACY_TRAIL_STAGES = Object.freeze([
  createLegacyTrailStage({ id: 1, x: 8, y: 90, game: 'memory', level: 'level-1', title: 'חיות ראשונות', description: 'מוצאים זוגות של מילים וחיות' }),
  createLegacyTrailStage({ id: 2, x: 15, y: 82, game: 'shop', level: 'shop-level-1', title: 'הקנייה הראשונה', description: 'מקשיבים ומגישים פריט לקונה' }),
  createLegacyTrailStage({ id: 3, x: 22, y: 70, game: 'house', level: 'bedroom-1', title: 'החדר הראשון', description: 'מסדרים שלושה חפצים לפי משפטים' }),
  createLegacyTrailStage({ id: 4, x: 18, y: 57, game: 'memory', level: 'level-2', title: 'אוכל צבעוני', description: 'מוצאים שישה זוגות מתוך מאגר אוכל ופירות משתנה' }),
  createLegacyTrailStage({ id: 5, x: 29, y: 47, game: 'shop', level: 'shop-level-2', title: 'החנות מתמלאת', description: 'בוחרים מתוך מדף גדול ומגוון יותר' }),
  createLegacyTrailStage({ id: 6, x: 40, y: 45, game: 'house', level: 'bedroom-2', title: 'עוד סדר בחדר', description: 'מסדרים ארבעה חפצים מתוך מגירה גדולה יותר' }),
  createLegacyTrailStage({ id: 7, x: 50, y: 51, game: 'memory', level: 'level-3', title: 'טבע ושמיים', description: 'מוצאים שמונה זוגות של מילים מהטבע' }),
  createLegacyTrailStage({ id: 8, x: 59, y: 60, game: 'shop', level: 'shop-level-3', title: 'אחת, שתיים, שלוש', description: 'קוראים או שומעים כמויות וממלאים את הסל' }),
  createLegacyTrailStage({ id: 9, x: 68, y: 67, game: 'house', level: 'bedroom-3', title: 'משפטים ארוכים', description: 'מסדרים חמישה חפצים עם פחות עזרה' }),
  createLegacyTrailStage({ id: 10, x: 77, y: 72, game: 'memory', level: 'level-10', title: 'בית ספר והעיר', description: 'מחברים מילים של מקומות וציוד לימודי' }),
  createLegacyTrailStage({ id: 11, x: 86, y: 66, game: 'shop', level: 'shop-level-4', title: 'צבעים בחנות', description: 'מבדילים בין צבעים וחפצים על מדף מלא' }),
  createLegacyTrailStage({ id: 12, x: 89, y: 54, game: 'house', level: 'bedroom-4', title: 'אלופי החדר', description: 'משלימים את כל משימות החדר עם פחות עזרה' }),
  createLegacyTrailStage({ id: 13, x: 84, y: 43, game: 'memory', level: 'level-15', title: 'זזים ומשחקים', description: 'מחברים מילים של פעולות וספורט' }),
  createLegacyTrailStage({ id: 14, x: 78, y: 35, game: 'shop', level: 'shop-level-5', title: 'הזמנה כפולה', description: 'זוכרים שני פריטים בכל הזמנה' }),
  createLegacyTrailStage({ id: 15, x: 87, y: 28, game: 'house', level: 'bedroom-5', title: 'אלופי הבית הקסום', description: 'אתגר הסיום בלי רמז שמגלה את התשובה', symbol: '★' }),
]);

export function getTrailStage(stageId) {
  const stage = TRAIL_STAGES.find((candidate) => candidate.id === stageId);
  if (!stage) {
    throw new Error(`Unknown trail stage ${stageId}`);
  }
  return stage;
}

export const GENERATED_GAME_LEVELS = GENERATED_TRAIL.levels;

const GENERATED_LEVEL_MAPS = Object.freeze(Object.fromEntries(
  Object.entries(GENERATED_GAME_LEVELS).map(([game, levels]) => [game, new Map(levels.map((level) => [level.id, level]))]),
));

export function getGeneratedGameLevel(game, levelId) {
  const level = GENERATED_LEVEL_MAPS[game]?.get(levelId);
  if (!level) {
    throw new Error(`Unknown generated ${game} level ${levelId}`);
  }
  return level;
}

export const GENERATED_TRAIL_STAGES = Object.freeze(GENERATED_TRAIL.stages.map((stage) => createTrailStage({
  id: stage.id,
  x: stage.x,
  y: stage.y,
  game: stage.game,
  level: stage.level,
  title: stage.title,
  description: stage.description,
  symbol: TRAIL_CHAPTERS.find((chapter) => chapter.id === stage.chapter)?.symbol,
  chapter: stage.chapter,
  chapterIndex: stage.chapterIndex,
}, getGeneratedGameLevel)));

// The generated trail is canonical: the world map route and every game read these.
export const GAME_LEVELS = GENERATED_GAME_LEVELS;
export const TRAIL_STAGES = GENERATED_TRAIL_STAGES;

export function getGameLevel(game, levelId) {
  return getGeneratedGameLevel(game, levelId);
}

export function validateTrailCatalog({ vocabularyIds, magicRequestIds }) {
  const expectedIds = Array.from({ length: LEGACY_TRAIL_STAGES.length }, (_, index) => index + 1);
  const actualIds = LEGACY_TRAIL_STAGES.map((stage) => stage.id);
  if (actualIds.some((id, index) => id !== expectedIds[index])) {
    throw new Error('Trail stage ids must be sequential');
  }
  if (new Set(actualIds).size !== actualIds.length) {
    throw new Error('Trail stage ids must be unique');
  }

  for (const stage of LEGACY_TRAIL_STAGES) {
    getLegacyGameLevel(stage.game, stage.level);
    if (!stage.available || !stage.activity || !stage.entry) {
      throw new Error(`Trail stage ${stage.id} is not playable`);
    }
  }

  for (const level of LEGACY_MEMORY_LEVELS) {
    for (const wordId of level.wordPool) {
      if (!vocabularyIds.has(wordId)) {
        throw new Error(`Memory level ${level.id} references unknown word ${wordId}`);
      }
    }
  }

  for (const level of LEGACY_MAGIC_HOUSE_LEVELS) {
    for (const requestId of level.requestIds) {
      if (!magicRequestIds.has(requestId)) {
        throw new Error(`Magic House level ${level.id} references unknown request ${requestId}`);
      }
    }
  }

  for (const game of Object.keys(LEGACY_GAME_LEVELS)) {
    const routeRanks = LEGACY_TRAIL_STAGES
      .filter((stage) => stage.game === game)
      .map((stage) => getLegacyGameLevel(game, stage.level).difficultyRank);
    if (routeRanks.some((rank, index) => index > 0
      && (rank < routeRanks[index - 1] || (rank === routeRanks[index - 1] && rank !== 5)))) {
      throw new Error(`${game} difficulty must increase until the championship rank`);
    }
  }

  return {
    stageCount: LEGACY_TRAIL_STAGES.length,
    playableStageCount: LEGACY_TRAIL_STAGES.filter((stage) => stage.available).length,
    gameCount: new Set(LEGACY_TRAIL_STAGES.map((stage) => stage.game)).size,
    maxStars: LEGACY_TRAIL_STAGES.length * 3,
  };
}

export function validateGeneratedTrail({ vocabularyIds, magicRequestIds }) {
  const expectedIds = Array.from({ length: GENERATED_TRAIL_STAGES.length }, (_, index) => index + 1);
  const actualIds = GENERATED_TRAIL_STAGES.map((stage) => stage.id);
  if (actualIds.some((id, index) => id !== expectedIds[index])) {
    throw new Error('Generated trail stage ids must be sequential');
  }

  const positions = new Set();
  for (const stage of GENERATED_TRAIL_STAGES) {
    const level = getGeneratedGameLevel(stage.game, stage.level);
    if (!stage.available || !stage.activity || !stage.entry) {
      throw new Error(`Generated trail stage ${stage.id} is not playable`);
    }
    if (!TRAIL_CHAPTERS.some((chapter) => chapter.id === stage.chapter)) {
      throw new Error(`Generated trail stage ${stage.id} has an unknown chapter`);
    }
    const position = `${stage.x},${stage.y}`;
    if (positions.has(position)) {
      throw new Error(`Generated trail stage ${stage.id} duplicates position ${position}`);
    }
    positions.add(position);
    if (level.difficultyRank !== GENERATED_TRAIL.stages[stage.id - 1].rank) {
      throw new Error(`Generated trail stage ${stage.id} rank does not match its level`);
    }
  }

  for (const level of GENERATED_GAME_LEVELS.memory) {
    for (const wordId of level.wordPool) {
      if (!vocabularyIds.has(wordId)) {
        throw new Error(`Generated Memory level ${level.id} references unknown word ${wordId}`);
      }
    }
  }

  for (const level of GENERATED_GAME_LEVELS.house) {
    for (const requestId of level.requestIds) {
      if (!magicRequestIds.has(requestId)) {
        throw new Error(`Generated Magic House level ${level.id} references unknown request ${requestId}`);
      }
    }
  }

  for (const game of Object.keys(GENERATED_GAME_LEVELS)) {
    const ranks = GENERATED_TRAIL_STAGES
      .filter((stage) => stage.game === game)
      .map((stage) => getGeneratedGameLevel(stage.game, stage.level).difficultyRank);
    if (ranks.some((rank, index) => index > 0 && rank < ranks[index - 1])) {
      throw new Error(`${game} generated difficulty must never decrease`);
    }
  }

  return {
    chapterCount: TRAIL_CHAPTERS.length,
    stageCount: GENERATED_TRAIL_STAGES.length,
    playableStageCount: GENERATED_TRAIL_STAGES.filter((stage) => stage.available).length,
    gameCount: new Set(GENERATED_TRAIL_STAGES.map((stage) => stage.game)).size,
    maxStars: GENERATED_TRAIL_STAGES.length * 3,
  };
}
