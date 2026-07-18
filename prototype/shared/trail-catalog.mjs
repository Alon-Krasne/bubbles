import { MAGIC_HOUSE_REQUESTS } from './magic-house-content.mjs';

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

export const DIFFICULTY_LABELS = Object.freeze({
  1: 'התחלה',
  2: 'קל',
  3: 'מתקדם',
  4: 'מאתגר',
  5: 'אליפות',
});

const GAME_DEFINITIONS = Object.freeze({
  memory: Object.freeze({ activity: 'memory-garden', entry: '../index.html', label: 'גן מילים' }),
  shop: Object.freeze({ activity: 'listening-shop', entry: '../index.html', label: 'החנות הקטנה' }),
  house: Object.freeze({ activity: 'magic-house', entry: './magic-house.html', label: 'הבית הקסום' }),
});

export const MAGIC_REQUEST_TARGET_IDS = Object.freeze(Object.fromEntries(
  MAGIC_HOUSE_REQUESTS.map((request) => [request.id, Object.freeze(request.targets.map((target) => target.objectId))]),
));

export function getLanguagePolicy(language) {
  if (language === 'en') {
    return LANGUAGE_POLICIES.english;
  }
  if (language === 'he') {
    return LANGUAGE_POLICIES.hebrew;
  }
  throw new Error(`Unknown learning language ${language}`);
}

function requireDifficultyRank(difficultyRank) {
  if (!Number.isInteger(difficultyRank) || !Object.prototype.hasOwnProperty.call(DIFFICULTY_LABELS, difficultyRank)) {
    throw new Error(`Invalid difficulty rank ${difficultyRank}`);
  }
}

function freezeLevel(level) {
  requireDifficultyRank(level.difficultyRank);
  return Object.freeze(level);
}

export function createMemoryLevel({ id, difficulty, difficultyRank, title, subtitle, pairs, icon, wordPool, locked, reward }) {
  if (!id || !['easy', 'medium', 'hard'].includes(difficulty) || !Number.isInteger(pairs) || pairs < 2) {
    throw new Error(`Invalid Memory Garden level ${id}`);
  }
  if (!Array.isArray(wordPool) || wordPool.length < pairs || new Set(wordPool).size !== wordPool.length) {
    throw new Error(`Invalid word pool for ${id}`);
  }
  return freezeLevel({
    id,
    difficulty,
    difficultyRank,
    title,
    subtitle,
    pairs,
    icon,
    wordPool: Object.freeze([...wordPool]),
    locked,
    ...(reward ? { reward } : {}),
  });
}

export function createShopLevel({ id, difficultyRank, title, subtitle, icon, customerCount, shelfSize, mode, itemPool }) {
  if (!id
    || !Number.isInteger(customerCount)
    || customerCount < 1
    || !Number.isInteger(shelfSize)
    || shelfSize < 2
    || !Array.isArray(itemPool)
    || itemPool.length < shelfSize
    || new Set(itemPool).size !== itemPool.length
    || !['single', 'quantity', 'color', 'double'].includes(mode)) {
    throw new Error(`Invalid Store level ${id}`);
  }
  return freezeLevel({ id, difficultyRank, title, subtitle, icon, customerCount, shelfSize, mode, itemPool: Object.freeze([...itemPool]) });
}

function getLargestMagicHouseTargetCount(requestIds, requestCount) {
  let largestTargetCount = 0;

  function visit(startIndex, selectedRequestIds) {
    if (selectedRequestIds.length === requestCount) {
      const targetIds = new Set(selectedRequestIds.flatMap((requestId) => MAGIC_REQUEST_TARGET_IDS[requestId]));
      largestTargetCount = Math.max(largestTargetCount, targetIds.size);
      return;
    }

    for (let index = startIndex; index <= requestIds.length - (requestCount - selectedRequestIds.length); index += 1) {
      visit(index + 1, [...selectedRequestIds, requestIds[index]]);
    }
  }

  visit(0, []);
  return largestTargetCount;
}

export function createMagicHouseLevel({ id, difficultyRank, title, requestIds, requestCount, drawerSize, maxHelpLevel }) {
  if (!id
    || !Array.isArray(requestIds)
    || new Set(requestIds).size !== requestIds.length
    || requestIds.some((requestId) => !Object.prototype.hasOwnProperty.call(MAGIC_REQUEST_TARGET_IDS, requestId))
    || !Number.isInteger(requestCount)
    || requestCount < 1
    || requestCount > requestIds.length
    || !Number.isInteger(drawerSize)
    || drawerSize < getLargestMagicHouseTargetCount(requestIds, requestCount)
    || !Number.isInteger(maxHelpLevel)
    || maxHelpLevel < 1
    || maxHelpLevel > 3) {
    throw new Error(`Invalid Magic House level ${id}`);
  }
  return freezeLevel({
    id,
    difficultyRank,
    title,
    requestIds: Object.freeze([...requestIds]),
    requestCount,
    drawerSize,
    maxHelpLevel,
  });
}

const MEMORY_LEVELS = Object.freeze([
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

const SHOP_LEVELS = Object.freeze([
  createShopLevel({ id: 'shop-level-1', difficultyRank: 1, title: 'קונים ראשונים', subtitle: '5 קונים, 4 פריטים', icon: '🍌', customerCount: 5, shelfSize: 4, mode: 'single', itemPool: ['banana', 'apple', 'milk', 'bread', 'egg', 'cheese', 'water', 'orange', 'strawberry', 'carrot', 'cookie', 'cup'] }),
  createShopLevel({ id: 'shop-level-2', difficultyRank: 2, title: 'החנות מתמלאת', subtitle: '6 קונים, 6 פריטים', icon: '🥛', customerCount: 6, shelfSize: 6, mode: 'single', itemPool: ['ball', 'book', 'hat', 'shoe', 'plate', 'spoon', 'fork', 'toothbrush', 'soap', 'scissors', 'notebook', 'ruler', 'shirt', 'dress', 'backpack', 'paper', 'computer', 'calculator', 'paintbrush', 'camera'] }),
  createShopLevel({ id: 'shop-level-3', difficultyRank: 3, title: 'אחת, שתיים, שלוש', subtitle: 'כמויות של 1-3', icon: '🍎', customerCount: 6, shelfSize: 6, mode: 'quantity', itemPool: ['banana', 'apple', 'egg', 'cake', 'cookie', 'orange', 'strawberry', 'carrot', 'tomato', 'potato', 'mushroom', 'pear', 'peach', 'doughnut', 'ball', 'notebook'] }),
  createShopLevel({ id: 'shop-level-4', difficultyRank: 4, title: 'צבעים בחנות', subtitle: 'מקשיבים לצבע', icon: '💙', customerCount: 6, shelfSize: 8, mode: 'color', itemPool: ['red-heart', 'blue-heart', 'yellow-heart', 'green-heart', 'purple-heart', 'orange-heart', 'red-book', 'blue-book', 'orange-book', 'green-book', 'red-square', 'blue-square', 'yellow-square', 'green-square', 'brown-circle', 'white-circle'] }),
  createShopLevel({ id: 'shop-level-5', difficultyRank: 5, title: 'הזמנה כפולה', subtitle: 'שני פריטים לקונה', icon: '🛒', customerCount: 7, shelfSize: 8, mode: 'double', itemPool: ['banana', 'apple', 'milk', 'bread', 'egg', 'cheese', 'water', 'cake', 'cookie', 'ice-cream', 'orange', 'strawberry', 'carrot', 'tomato', 'corn', 'pizza', 'sandwich', 'ball', 'book', 'hat', 'shoe', 'cup', 'notebook', 'ruler', 'marker', 'computer', 'camera', 'basketball', 'baseball', 'volleyball', 'medal', 'trophy', 'hamburger', 'fries', 'rice', 'spaghetti', 'soup', 'candy', 'chocolate', 'bed', 'chair', 'couch', 'lamp', 'key', 'clock', 'phone', 'umbrella', 'radio', 'shirt', 'dress', 'pants', 'sock', 'coat', 'scarf', 'glove', 'pencil', 'crayon', 'backpack', 'balloon', 'kite', 'teddy-bear'] }),
]);

const MAGIC_REQUEST_IDS = Object.freeze(MAGIC_HOUSE_REQUESTS.map((request) => request.id));
const MAGIC_HOUSE_LEVELS = Object.freeze([
  createMagicHouseLevel({ id: 'bedroom-practice', difficultyRank: 1, title: 'חדר אימון', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-1', difficultyRank: 1, title: 'החדר הראשון', requestIds: MAGIC_REQUEST_IDS, requestCount: 3, drawerSize: 5, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-2', difficultyRank: 2, title: 'עוד סדר בחדר', requestIds: MAGIC_REQUEST_IDS, requestCount: 4, drawerSize: 6, maxHelpLevel: 3 }),
  createMagicHouseLevel({ id: 'bedroom-3', difficultyRank: 3, title: 'משפטים ארוכים', requestIds: MAGIC_REQUEST_IDS, requestCount: 5, drawerSize: 7, maxHelpLevel: 2 }),
  createMagicHouseLevel({ id: 'bedroom-4', difficultyRank: 4, title: 'אלופי החדר', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 2 }),
  createMagicHouseLevel({ id: 'bedroom-5', difficultyRank: 5, title: 'אלופי הבית הקסום', requestIds: MAGIC_REQUEST_IDS, requestCount: 6, drawerSize: 8, maxHelpLevel: 1 }),
]);

export const GAME_LEVELS = Object.freeze({
  memory: MEMORY_LEVELS,
  shop: SHOP_LEVELS,
  house: MAGIC_HOUSE_LEVELS,
});

export function getGameLevel(game, levelId) {
  const levels = GAME_LEVELS[game];
  if (!levels) {
    throw new Error(`Unknown trail game ${game}`);
  }
  const level = levels.find((candidate) => candidate.id === levelId);
  if (!level) {
    throw new Error(`Unknown ${game} level ${levelId}`);
  }
  return level;
}

export function createTrailStage({ id, x, y, game, level, title, description, symbol }) {
  if (!Number.isInteger(id) || id < 1 || !Number.isFinite(x) || !Number.isFinite(y) || !title || !description) {
    throw new Error(`Invalid trail stage ${id}`);
  }
  const definition = GAME_DEFINITIONS[game];
  if (!definition) {
    throw new Error(`Unknown trail game ${game}`);
  }
  const gameLevel = getGameLevel(game, level);
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
  });
}

export const TRAIL_STAGES = Object.freeze([
  createTrailStage({ id: 1, x: 8, y: 90, game: 'memory', level: 'level-1', title: 'חיות ראשונות', description: 'מוצאים זוגות של מילים וחיות' }),
  createTrailStage({ id: 2, x: 15, y: 82, game: 'shop', level: 'shop-level-1', title: 'הקנייה הראשונה', description: 'מקשיבים ומגישים פריט לקונה' }),
  createTrailStage({ id: 3, x: 22, y: 70, game: 'house', level: 'bedroom-1', title: 'החדר הראשון', description: 'מסדרים שלושה חפצים לפי משפטים' }),
  createTrailStage({ id: 4, x: 18, y: 57, game: 'memory', level: 'level-2', title: 'אוכל צבעוני', description: 'מוצאים שישה זוגות מתוך מאגר אוכל ופירות משתנה' }),
  createTrailStage({ id: 5, x: 29, y: 47, game: 'shop', level: 'shop-level-2', title: 'החנות מתמלאת', description: 'בוחרים מתוך מדף גדול ומגוון יותר' }),
  createTrailStage({ id: 6, x: 40, y: 45, game: 'house', level: 'bedroom-2', title: 'עוד סדר בחדר', description: 'מסדרים ארבעה חפצים מתוך מגירה גדולה יותר' }),
  createTrailStage({ id: 7, x: 50, y: 51, game: 'memory', level: 'level-3', title: 'טבע ושמיים', description: 'מוצאים שמונה זוגות של מילים מהטבע' }),
  createTrailStage({ id: 8, x: 59, y: 60, game: 'shop', level: 'shop-level-3', title: 'אחת, שתיים, שלוש', description: 'קוראים או שומעים כמויות וממלאים את הסל' }),
  createTrailStage({ id: 9, x: 68, y: 67, game: 'house', level: 'bedroom-3', title: 'משפטים ארוכים', description: 'מסדרים חמישה חפצים עם פחות עזרה' }),
  createTrailStage({ id: 10, x: 77, y: 72, game: 'memory', level: 'level-10', title: 'בית ספר והעיר', description: 'מחברים מילים של מקומות וציוד לימודי' }),
  createTrailStage({ id: 11, x: 86, y: 66, game: 'shop', level: 'shop-level-4', title: 'צבעים בחנות', description: 'מבדילים בין צבעים וחפצים על מדף מלא' }),
  createTrailStage({ id: 12, x: 89, y: 54, game: 'house', level: 'bedroom-4', title: 'אלופי החדר', description: 'משלימים את כל משימות החדר עם פחות עזרה' }),
  createTrailStage({ id: 13, x: 84, y: 43, game: 'memory', level: 'level-15', title: 'זזים ומשחקים', description: 'מחברים מילים של פעולות וספורט' }),
  createTrailStage({ id: 14, x: 78, y: 35, game: 'shop', level: 'shop-level-5', title: 'הזמנה כפולה', description: 'זוכרים שני פריטים בכל הזמנה' }),
  createTrailStage({ id: 15, x: 87, y: 28, game: 'house', level: 'bedroom-5', title: 'אלופי הבית הקסום', description: 'אתגר הסיום בלי רמז שמגלה את התשובה', symbol: '★' }),
]);

export function getTrailStage(stageId) {
  const stage = TRAIL_STAGES.find((candidate) => candidate.id === stageId);
  if (!stage) {
    throw new Error(`Unknown trail stage ${stageId}`);
  }
  return stage;
}

export function validateTrailCatalog({ vocabularyIds, magicRequestIds }) {
  const expectedIds = Array.from({ length: TRAIL_STAGES.length }, (_, index) => index + 1);
  const actualIds = TRAIL_STAGES.map((stage) => stage.id);
  if (actualIds.some((id, index) => id !== expectedIds[index])) {
    throw new Error('Trail stage ids must be sequential');
  }
  if (new Set(actualIds).size !== actualIds.length) {
    throw new Error('Trail stage ids must be unique');
  }

  for (const stage of TRAIL_STAGES) {
    getGameLevel(stage.game, stage.level);
    if (!stage.available || !stage.activity || !stage.entry) {
      throw new Error(`Trail stage ${stage.id} is not playable`);
    }
  }

  for (const level of MEMORY_LEVELS) {
    for (const wordId of level.wordPool) {
      if (!vocabularyIds.has(wordId)) {
        throw new Error(`Memory level ${level.id} references unknown word ${wordId}`);
      }
    }
  }

  for (const level of MAGIC_HOUSE_LEVELS) {
    for (const requestId of level.requestIds) {
      if (!magicRequestIds.has(requestId)) {
        throw new Error(`Magic House level ${level.id} references unknown request ${requestId}`);
      }
    }
  }

  for (const game of Object.keys(GAME_LEVELS)) {
    const routeRanks = TRAIL_STAGES
      .filter((stage) => stage.game === game)
      .map((stage) => getGameLevel(game, stage.level).difficultyRank);
    if (routeRanks.some((rank, index) => index > 0
      && (rank < routeRanks[index - 1] || (rank === routeRanks[index - 1] && rank !== 5)))) {
      throw new Error(`${game} difficulty must increase until the championship rank`);
    }
  }

  return {
    stageCount: TRAIL_STAGES.length,
    playableStageCount: TRAIL_STAGES.filter((stage) => stage.available).length,
    gameCount: new Set(TRAIL_STAGES.map((stage) => stage.game)).size,
    maxStars: TRAIL_STAGES.length * 3,
  };
}
