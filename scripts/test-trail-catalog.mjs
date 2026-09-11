import assert from 'node:assert/strict';

import { VOCAB_WORDS } from '../src/words.ts';
import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';
import { SHOP_ART_IDS } from '../prototype/shared/shop-art-ids.mjs';
import { VOCABULARY } from '../prototype/shared/vocabulary-catalog.mjs';
import { buildCatalogEntries } from './generate-vocabulary-catalog.mjs';
import {
  GAME_LEVELS,
  GENERATED_GAME_LEVELS,
  GENERATED_TRAIL_STAGES,
  LANGUAGE_POLICIES,
  TRAIL_CHAPTERS,
  TRAIL_STAGES,
  createMagicHouseLevel,
  createTrailStage,
  getGameLevel,
  getLanguagePolicy,
  validateGeneratedTrail,
  validateTrailCatalog,
} from '../prototype/shared/trail-catalog.mjs';

const vocabularyIds = new Set(VOCAB_WORDS.map((word) => word.id));
const magicRequestIds = new Set(MAGIC_HOUSE_REQUESTS.map((request) => request.id));

// The legacy 15-stage route is retained as a reference and must stay valid.
const legacyReport = validateTrailCatalog({ vocabularyIds, magicRequestIds });
assert.deepEqual(legacyReport, {
  stageCount: 15,
  playableStageCount: 15,
  gameCount: 3,
  maxStars: 45,
});

const generatedReport = validateGeneratedTrail({ vocabularyIds, magicRequestIds });
assert.deepEqual(generatedReport, {
  chapterCount: 6,
  stageCount: 36,
  playableStageCount: 36,
  gameCount: 3,
  maxStars: 108,
});

assert.equal(TRAIL_STAGES, GENERATED_TRAIL_STAGES, 'the generated trail is the live route');
assert.equal(GAME_LEVELS, GENERATED_GAME_LEVELS, 'the generated levels are the live levels');
assert.equal(TRAIL_CHAPTERS.length, 6);
assert.deepEqual(GENERATED_TRAIL_STAGES.map((stage) => stage.id), Array.from({ length: 36 }, (_, index) => index + 1));
assert.deepEqual(
  GENERATED_TRAIL_STAGES.slice(0, 6).map((stage) => stage.game),
  ['memory', 'shop', 'house', 'memory', 'shop', 'house'],
  'every chapter must contain Memory, Store, then Magic House twice',
);
assert.ok(GENERATED_TRAIL_STAGES.every((stage) => stage.activity && stage.level && stage.entry));
assert.ok(
  GENERATED_TRAIL_STAGES.every((stage) => stage.chapter === TRAIL_CHAPTERS[stage.chapterIndex].id),
  'every generated stage must belong to its chapter',
);

for (const game of ['memory', 'shop', 'house']) {
  const ranks = GENERATED_TRAIL_STAGES
    .filter((stage) => stage.game === game)
    .map((stage) => getGameLevel(stage.game, stage.level).difficultyRank);
  assert.ok(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1]), `${game} difficulty must never drop`);
  assert.equal(ranks.at(-1), 5, `${game} must reach the championship rank`);
}

for (const level of GENERATED_GAME_LEVELS.house) {
  assert.ok(
    level.requestIds.length > level.requestCount,
    `${level.id} must choose from more room requests than it plays so consecutive sessions can vary objects and destinations`,
  );
}

assert.throws(() => createMagicHouseLevel({
  id: 'invalid-two-object-request',
  difficultyRank: 1,
  title: 'Invalid',
  requestIds: ['request-6'],
  requestCount: 1,
  drawerSize: 1,
  maxHelpLevel: 3,
}), /Invalid Magic House level/);

assert.deepEqual(LANGUAGE_POLICIES.english, {
  prompt: 'spoken-english',
  choices: 'semantic-images',
  target: 'english-without-answer-image',
});
assert.deepEqual(LANGUAGE_POLICIES.hebrew, {
  prompt: 'written-hebrew',
  choices: 'written-hebrew',
  target: 'hebrew-without-answer-image-or-pre-answer-speech',
});
assert.equal(getLanguagePolicy('en'), LANGUAGE_POLICIES.english);
assert.equal(getLanguagePolicy('he'), LANGUAGE_POLICIES.hebrew);
assert.throws(() => getLanguagePolicy('fr'), /Unknown learning language/);

assert.ok(GAME_LEVELS.memory.every((level) => level.pairs <= level.wordPool.length));
assert.ok(GAME_LEVELS.memory.flatMap((level) => level.wordPool).every((wordId) => vocabularyIds.has(wordId)));

const generatedStage = createTrailStage({
  id: 16,
  x: 50,
  y: 20,
  game: 'memory',
  level: 'trail-memory-1',
  title: 'Generated stage',
  description: 'Generated from the shared catalog',
});
assert.equal(generatedStage.activity, 'memory-garden');
assert.equal(generatedStage.entry, '../index.html');
assert.equal(generatedStage.available, true);

assert.deepEqual(VOCABULARY, buildCatalogEntries(), 'the vocabulary catalog must stay in sync with src/words.ts');

const shopArtIds = new Set(SHOP_ART_IDS);
for (const level of GENERATED_GAME_LEVELS.shop) {
  if (level.mode === 'color') continue;
  assert.ok(
    level.itemPool.every((itemId) => shopArtIds.has(itemId)),
    `generated Shop level ${level.id} must only stock items with committed artwork`,
  );
}
for (const game of ['memory', 'shop', 'house']) {
  assert.equal(GENERATED_GAME_LEVELS[game].length, 12, `${game} must generate 12 levels`);
}

// Magic House difficulty must live in its parameters, not only in the rank
// label: every step up must add requests, add objects, or take help away.
const houseByRank = new Map();
for (const level of GENERATED_GAME_LEVELS.house) {
  houseByRank.set(level.difficultyRank, level);
}
const houseRanks = [...houseByRank.keys()].sort((a, b) => a - b);
for (let index = 1; index < houseRanks.length; index += 1) {
  const previous = houseByRank.get(houseRanks[index - 1]);
  const current = houseByRank.get(houseRanks[index]);
  const harder = current.requestCount > previous.requestCount
    || current.drawerSize > previous.drawerSize
    || current.maxHelpLevel < previous.maxHelpLevel;
  assert.ok(harder, `Magic House rank ${houseRanks[index]} must be harder than rank ${houseRanks[index - 1]}`);
}
assert.ok(
  houseByRank.get(5).maxHelpLevel < houseByRank.get(4).maxHelpLevel,
  'the championship Magic House round must remove help that rank 4 still offers',
);

// Stage markers are laid out in percentage space on a map that is wider than it
// is tall, so weight Y before checking that no two stops can visually overlap.
const STAGE_Y_WEIGHT = 0.72;
let closestStages = Infinity;
for (let i = 0; i < GENERATED_TRAIL_STAGES.length; i += 1) {
  for (let j = i + 1; j < GENERATED_TRAIL_STAGES.length; j += 1) {
    const a = GENERATED_TRAIL_STAGES[i];
    const b = GENERATED_TRAIL_STAGES[j];
    closestStages = Math.min(closestStages, Math.hypot(a.x - b.x, (a.y - b.y) * STAGE_Y_WEIGHT));
  }
}
assert.ok(
  closestStages >= 3.4,
  `generated stage markers must stay separated (closest pair is ${closestStages.toFixed(2)})`,
);

console.log(JSON.stringify({ legacy: legacyReport, generated: generatedReport }));
