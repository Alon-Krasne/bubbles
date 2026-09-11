import { MAGIC_HOUSE_REQUESTS } from './magic-house-content.mjs';
import { SHOP_ART_IDS } from './shop-art-ids.mjs';
import { VOCABULARY } from './vocabulary-catalog.mjs';

const SHOP_ART_SET = new Set(SHOP_ART_IDS);

export const DIFFICULTY_LABELS = Object.freeze({
  1: 'התחלה',
  2: 'קל',
  3: 'מתקדם',
  4: 'מאתגר',
  5: 'אליפות',
});

export const MAGIC_REQUEST_TARGET_IDS = Object.freeze(Object.fromEntries(
  MAGIC_HOUSE_REQUESTS.map((request) => [request.id, Object.freeze(request.targets.map((target) => target.objectId))]),
));

const GAME_ORDER = Object.freeze(['memory', 'shop', 'house']);
const STAGES_PER_CHAPTER = GAME_ORDER.length * 2;
const LEVEL_ID_PREFIX = Object.freeze({ memory: 'trail-memory', shop: 'trail-shop', house: 'trail-house' });

const LEVEL_DIFFICULTY_BY_RANK = Object.freeze({ 1: 'easy', 2: 'medium', 3: 'medium', 4: 'hard', 5: 'hard' });
const SHOP_MODE_BY_RANK = Object.freeze({ 1: 'single', 2: 'single', 3: 'quantity', 4: 'color', 5: 'double' });

// Quantity orders speak recorded plural words, so quantity-mode Shop levels may
// only stock items that already have a committed plural clip.
export const SHOP_PLURAL_ITEM_IDS = Object.freeze([
  'apple', 'ball', 'banana', 'cake', 'carrot', 'cookie', 'doughnut', 'egg',
  'mushroom', 'notebook', 'orange', 'peach', 'pear', 'potato', 'strawberry', 'tomato',
]);

// Percent anchors tracing the winding path of the approved moonlit map art,
// from the lower-left meadow through the market, wood, railway and village up
// to the hilltop finale. Each chapter's six stops interpolate toward the next.
const CHAPTER_ANCHORS = Object.freeze([
  Object.freeze({ x: 15, y: 80 }),
  Object.freeze({ x: 24, y: 44 }),
  Object.freeze({ x: 45, y: 72 }),
  Object.freeze({ x: 60, y: 50 }),
  Object.freeze({ x: 77, y: 62 }),
  Object.freeze({ x: 72, y: 38 }),
  Object.freeze({ x: 84, y: 12 }),
]);

export const TRAIL_CHAPTERS = Object.freeze([
  Object.freeze({ id: 'chapter-1', title: 'עמק החיות', subtitle: 'חיות, קולות ומילים ראשונות', categories: Object.freeze(['animals', 'food']), symbol: '🐾' }),
  Object.freeze({ id: 'chapter-2', title: 'השוק הצבעוני', subtitle: 'אוכל, צבעים וקניות', categories: Object.freeze(['food', 'colors']), symbol: '🍎' }),
  Object.freeze({ id: 'chapter-3', title: 'יער הטבע', subtitle: 'עצים, שמיים והבית', categories: Object.freeze(['nature', 'home']), symbol: '🌳' }),
  Object.freeze({ id: 'chapter-4', title: 'דרך ההרפתקאות', subtitle: 'נסיעות, בגדים וצעצועים', categories: Object.freeze(['transport', 'clothes', 'toys']), symbol: '🚂' }),
  Object.freeze({ id: 'chapter-5', title: 'בית הספר והעיר', subtitle: 'לימודים, מקומות וגוף', categories: Object.freeze(['school', 'places', 'body', 'people']), symbol: '🏫' }),
  Object.freeze({ id: 'chapter-6', title: 'ממלכת הגיבורים', subtitle: 'ספורט, תנועה ואתגר גדול', categories: Object.freeze(['sports', 'actions']), symbol: '🏆' }),
]);

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

export function getLargestMagicHouseTargetCount(requestIds, requestCount) {
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

function difficultyRankForStage(stageIndex) {
  return Math.max(1, Math.min(5, 1 + Math.floor(stageIndex / 7.2)));
}

function rotate(items, offset) {
  if (items.length === 0) {
    return items;
  }
  const shift = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function unique(ids) {
  return [...new Set(ids)];
}

export function buildVocabularyIndex(vocabulary = VOCABULARY) {
  const byCategory = new Map();
  for (const word of vocabulary) {
    if (!byCategory.has(word.category)) {
      byCategory.set(word.category, []);
    }
    byCategory.get(word.category).push(word.id);
  }
  return {
    byCategory,
    shoppable: vocabulary.filter((word) => word.shoppable).map((word) => word.id),
    shopArt: vocabulary.filter((word) => word.shoppable && SHOP_ART_SET.has(word.id)).map((word) => word.id),
  };
}

function poolForCategories(index, categories, minimum, offset) {
  const combined = unique(categories.flatMap((category) => index.byCategory.get(category) ?? []));
  const rotated = rotate(combined, offset);
  if (rotated.length < minimum) {
    throw new Error(`Vocabulary categories ${categories.join(', ')} provide ${rotated.length} words but ${minimum} are required`);
  }
  return rotated;
}

export function createMemoryLevelRecipe({ levelId, rank, title, categories, index, offset }) {
  const pairs = 3 + rank;
  const pool = poolForCategories(index, categories, pairs, offset);
  return createMemoryLevel({
    id: levelId,
    difficulty: LEVEL_DIFFICULTY_BY_RANK[rank],
    difficultyRank: rank,
    title,
    subtitle: `${pairs} זוגות`,
    pairs,
    icon: '🧩',
    wordPool: pool,
    locked: false,
  });
}

export function createShopLevelRecipe({ levelId, rank, title, categories, index, offset, vocabulary = VOCABULARY }) {
  const mode = SHOP_MODE_BY_RANK[rank];
  const shelfSize = Math.min(8, 3 + rank);
  const customerCount = Math.min(7, 3 + rank);
  const shoppableSet = new Set(index.shopArt);
  const colorIds = vocabulary.filter((word) => word.category === 'colors').map((word) => word.id);
  let source;
  if (mode === 'color') {
    source = colorIds;
  } else if (mode === 'quantity') {
    source = SHOP_PLURAL_ITEM_IDS.filter((id) => shoppableSet.has(id));
  } else {
    const preferred = poolForCategories(index, categories, shelfSize, offset).filter((id) => shoppableSet.has(id));
    source = preferred.length >= shelfSize ? preferred : index.shopArt;
  }
  if (source.length < shelfSize) {
    throw new Error(`Shop level ${levelId} has only ${source.length} items for a shelf of ${shelfSize}`);
  }
  const itemPool = rotate(source, offset);
  if (itemPool.length < shelfSize) {
    throw new Error(`Shop level ${levelId} cannot fill a shelf of ${shelfSize}`);
  }
  return createShopLevel({
    id: levelId,
    difficultyRank: rank,
    title,
    subtitle: `${customerCount} קונים`,
    icon: '🛒',
    customerCount,
    shelfSize,
    mode,
    itemPool,
  });
}

export function createMagicHouseLevelRecipe({ levelId, rank, title, magicRequests = MAGIC_HOUSE_REQUESTS }) {
  // Every level draws from the whole authored request pool so the two six-request
  // room layouts stay compatible; difficulty comes from requestCount and help.
  const requestIds = unique(magicRequests.map((request) => request.id));
  const requestCount = Math.min(6, 2 + rank, requestIds.length);
  const drawerSize = Math.min(8, Math.max(getLargestMagicHouseTargetCount(requestIds, requestCount), requestCount + 2));
  return createMagicHouseLevel({
    id: levelId,
    difficultyRank: rank,
    title,
    requestIds,
    requestCount,
    drawerSize,
    maxHelpLevel: rank >= 4 ? 1 : rank >= 3 ? 2 : 3,
  });
}

// Distributes stages evenly by arc length along the anchor path so no chapter
// crowds its stops, then nudges alternate stops sideways to keep them legible.
function buildRoutePoints(totalStages) {
  const segments = [];
  let totalLength = 0;
  for (let index = 0; index < CHAPTER_ANCHORS.length - 1; index += 1) {
    const from = CHAPTER_ANCHORS[index];
    const to = CHAPTER_ANCHORS[index + 1];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    segments.push({ from, to, start: totalLength, length });
    totalLength += length;
  }

  function pointAt(distance) {
    const clamped = Math.min(Math.max(distance, 0), totalLength);
    const segment = segments.find((candidate) => clamped <= candidate.start + candidate.length) ?? segments.at(-1);
    const t = segment.length === 0 ? 0 : (clamped - segment.start) / segment.length;
    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * t,
      y: segment.from.y + (segment.to.y - segment.from.y) * t,
      angle: Math.atan2(segment.to.y - segment.from.y, segment.to.x - segment.from.x),
    };
  }

  const spacing = totalLength / totalStages;
  return Array.from({ length: totalStages }, (_, index) => {
    const point = pointAt((index + 0.5) * spacing);
    const side = index % 2 === 0 ? -1 : 1;
    const wobble = side * 2.1;
    return {
      x: point.x + Math.cos(point.angle + Math.PI / 2) * wobble,
      y: point.y + Math.sin(point.angle + Math.PI / 2) * wobble,
    };
  });
}

export function generateTrail({ vocabulary = VOCABULARY, magicRequests = MAGIC_HOUSE_REQUESTS } = {}) {
  const index = buildVocabularyIndex(vocabulary);
  const levels = { memory: [], shop: [], house: [] };
  const stages = [];
  const appearanceCount = { memory: 0, shop: 0, house: 0 };
  const totalStages = TRAIL_CHAPTERS.length * STAGES_PER_CHAPTER;
  const routePoints = buildRoutePoints(totalStages);

  TRAIL_CHAPTERS.forEach((chapter, chapterIndex) => {
    for (let slot = 0; slot < STAGES_PER_CHAPTER; slot += 1) {
      const stageIndex = chapterIndex * STAGES_PER_CHAPTER + slot;
      const stageId = stageIndex + 1;
      const game = GAME_ORDER[slot % GAME_ORDER.length];
      const rank = difficultyRankForStage(stageIndex);
      appearanceCount[game] += 1;
      const levelId = `${LEVEL_ID_PREFIX[game]}-${appearanceCount[game]}`;
      const title = `${chapter.title} · ${stageId}`;
      const recipe = { levelId, rank, title, offset: stageIndex };
      let level;
      if (game === 'memory') {
        level = createMemoryLevelRecipe({ ...recipe, categories: chapter.categories, index });
      } else if (game === 'shop') {
        level = createShopLevelRecipe({ ...recipe, categories: chapter.categories, index, vocabulary });
      } else {
        level = createMagicHouseLevelRecipe({ ...recipe, magicRequests });
      }
      levels[game].push(level);

      const { x, y } = routePoints[stageIndex];
      stages.push(Object.freeze({
        id: stageId,
        chapter: chapter.id,
        chapterIndex,
        game,
        level: levelId,
        title,
        description: chapter.subtitle,
        rank,
        x,
        y,
      }));
    }
  });

  if (stages.length !== totalStages) {
    throw new Error(`Expected ${totalStages} generated stages but produced ${stages.length}`);
  }
  return { chapters: TRAIL_CHAPTERS, levels, stages };
}

export const GENERATED_TRAIL = Object.freeze(generateTrail());
