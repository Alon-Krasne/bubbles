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

const report = validateTrailCatalog({ vocabularyIds, magicRequestIds });

assert.deepEqual(report, {
  stageCount: 15,
  playableStageCount: 15,
  gameCount: 3,
  maxStars: 45,
});

assert.deepEqual(TRAIL_STAGES.map((stage) => stage.id), Array.from({ length: 15 }, (_, index) => index + 1));
assert.equal(new Set(TRAIL_STAGES.map((stage) => stage.game)).size, 3);
assert.ok(TRAIL_STAGES.every((stage) => stage.activity && stage.level && stage.entry));
assert.deepEqual(
  TRAIL_STAGES.map((stage) => stage.game),
  Array.from({ length: 5 }, () => ['memory', 'shop', 'house']).flat(),
  'each difficulty tier must contain Memory, Store, then Magic House',
);

for (const game of ['memory', 'shop', 'house']) {
  const ranks = TRAIL_STAGES
    .filter((stage) => stage.game === game)
    .map((stage) => getGameLevel(stage.game, stage.level).difficultyRank);
  assert.deepEqual(ranks, [1, 2, 3, 4, 5], `${game} difficulty must increase at every appearance`);
}

for (const levelId of ['bedroom-1', 'bedroom-2', 'bedroom-3']) {
  const level = getGameLevel('house', levelId);
  assert.ok(
    level.requestIds.length > level.requestCount,
    `${levelId} must choose from more room requests than it plays so consecutive sessions can vary objects and destinations`,
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
  level: 'level-1',
  title: 'Generated stage',
  description: 'Generated from the shared catalog',
});
assert.equal(generatedStage.activity, 'memory-garden');
assert.equal(generatedStage.entry, '../index.html');
assert.equal(generatedStage.available, true);

assert.deepEqual(VOCABULARY, buildCatalogEntries(), 'the vocabulary catalog must stay in sync with src/words.ts');

const generatedReport = validateGeneratedTrail({ vocabularyIds, magicRequestIds });
assert.deepEqual(generatedReport, {
  chapterCount: 6,
  stageCount: 36,
  playableStageCount: 36,
  gameCount: 3,
  maxStars: 108,
});
assert.equal(TRAIL_CHAPTERS.length, 6);
assert.deepEqual(GENERATED_TRAIL_STAGES.map((stage) => stage.id), Array.from({ length: 36 }, (_, index) => index + 1));
assert.deepEqual(
  GENERATED_TRAIL_STAGES.slice(0, 6).map((stage) => stage.game),
  ['memory', 'shop', 'house', 'memory', 'shop', 'house'],
);
assert.ok(
  GENERATED_TRAIL_STAGES.every((stage) => stage.chapter === TRAIL_CHAPTERS[stage.chapterIndex].id),
  'every generated stage must belong to its chapter',
);

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

console.log(JSON.stringify({ legacy: report, generated: generatedReport }));
