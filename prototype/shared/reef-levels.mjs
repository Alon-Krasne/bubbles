import { TRAIL_GAME_SEQUENCE, buildVocabularyIndex, createMemoryLevelRecipe, createShopLevelRecipe, createMagicHouseLevelRecipe, createRevealLevelRecipe } from './trail-recipes.mjs';
import { PAINTER_CHAPTER_WORD_POOLS } from './painter-content.mjs';
import { VOCABULARY } from './vocabulary-catalog.mjs';
import { REEF_STAGES, REEF_CHAPTERS } from './reef-map.mjs';

// Use authored, recorded vocabulary only. Tier-2 additions must join the catalog
// with their audio and artwork before a recipe can refer to them.
const categories = [
  ['animals', 'nature'], ['food', 'home'], ['colors', 'nature', 'school'],
  ['nature', 'clothes', 'transport'], ['people', 'places', 'school'],
  [...new Set(VOCABULARY.map(word => word.category))],
];
const index = buildVocabularyIndex(VOCABULARY);
const levels = { memory: [], shop: [], house: [], reveal: [], painter: [] };
const appearances = { memory: 0, shop: 0, house: 0, reveal: 0, painter: 0 };
export const REEF_LEVEL_STAGES = Object.freeze(REEF_STAGES.map(stage => {
  const chapter = REEF_CHAPTERS[stage.chapter - 1];
  const game = stage.activity;
  const id = `reef-${game}-${++appearances[game]}`;
  const title = `${chapter.title} · ${TRAIL_GAME_SEQUENCE.length + stage.id}`;
  const recipe = { levelId: id, rank: chapter.rank, title, categories: categories[stage.chapter - 1], index, offset: stage.id - 1 };
  let level;
  if (game === 'memory') level = createMemoryLevelRecipe(recipe);
  else if (game === 'shop') level = createShopLevelRecipe(recipe);
  else if (game === 'house') level = createMagicHouseLevelRecipe(recipe);
  else if (game === 'reveal') level = createRevealLevelRecipe(recipe);
  else level = Object.freeze({ id, title, difficultyRank: chapter.rank, wordPool: PAINTER_CHAPTER_WORD_POOLS[stage.chapter - 1] });
  levels[game].push(level);
  return Object.freeze({ id: stage.id, x: stage.position.x, y: stage.position.y, game, level: id, title, description: chapter.topic, chapter: `reef-chapter-${stage.chapter}`, chapterIndex: stage.chapter - 1 });
}));
export const REEF_GAME_LEVELS = Object.freeze(Object.fromEntries(Object.entries(levels).map(([game, items]) => [game, Object.freeze(items)])));
