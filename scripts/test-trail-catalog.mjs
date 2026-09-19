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
  gameCount: 4,
  maxStars: 108,
});

assert.equal(TRAIL_STAGES, GENERATED_TRAIL_STAGES, 'the generated trail is the live route');
assert.equal(GAME_LEVELS, GENERATED_GAME_LEVELS, 'the generated levels are the live levels');
assert.equal(TRAIL_CHAPTERS.length, 6);
assert.deepEqual(GENERATED_TRAIL_STAGES.map((stage) => stage.id), Array.from({ length: 36 }, (_, index) => index + 1));

// Stages are shuffled across chapters with a cap of at most 2 consecutive stages of any game
const stageGames = GENERATED_TRAIL_STAGES.map((stage) => stage.game);
let maxConsecutive = 1;
let currentConsecutive = 1;
for (let i = 1; i < stageGames.length; i += 1) {
  if (stageGames[i] === stageGames[i - 1]) {
    currentConsecutive += 1;
    if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
  } else {
    currentConsecutive = 1;
  }
}
assert.ok(maxConsecutive <= 2, `never more than 2 in a row of the same game (max was ${maxConsecutive})`);

// All 4 games appear balanced across the route
for (const game of ['memory', 'shop', 'house', 'reveal']) {
  const count = stageGames.filter((g) => g === game).length;
  assert.equal(count, 9, `${game} must have 9 stages across the route`);
}

// Chapter sequences are varied, not repeating a fixed 1-2-3-4 cycle
const chapterPatterns = Array.from({ length: 6 }, (_, c) => stageGames.slice(c * 6, c * 6 + 6).join('-'));
assert.ok(new Set(chapterPatterns).size > 1, 'chapter game sequences must vary, not repeat 1-2-3-4 all the way');

assert.ok(GENERATED_TRAIL_STAGES.every((stage) => stage.activity && stage.level && stage.entry));
assert.ok(
  GENERATED_TRAIL_STAGES.every((stage) => stage.chapter === TRAIL_CHAPTERS[stage.chapterIndex].id),
  'every generated stage must belong to its chapter',
);

for (const game of ['memory', 'shop', 'house', 'reveal']) {
  const ranks = GENERATED_TRAIL_STAGES
    .filter((stage) => stage.game === game)
    .map((stage) => getGameLevel(stage.game, stage.level).difficultyRank);
  assert.ok(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1]), `${game} difficulty must never drop`);
  assert.equal(ranks.at(-1), 5, `${game} must reach the championship rank`);
}

const enLen = (w) => [...w.english].filter((c) => /[a-z]/i.test(c)).length;
const heLen = (w) => [...w.hebrew].filter((c) => /[א-ת]/.test(c)).length;
const vocabById = new Map(VOCAB_WORDS.map((w) => [w.id, w]));

for (const level of GENERATED_GAME_LEVELS.reveal) {
  const activeWords = level.wordPool.slice(0, level.wordCount).map((id) => vocabById.get(id));
  if (level.difficultyRank === 1) {
    assert.ok(
      activeWords.every((w) => enLen(w) <= 4 && heLen(w) <= 4),
      `Rank 1 reveal level ${level.id} must only use words with 3-4 letters in both languages`,
    );
  } else if (level.difficultyRank === 5) {
    assert.ok(
      activeWords.every((w) => Math.max(enLen(w), heLen(w)) >= 8),
      `Rank 5 reveal level ${level.id} must include championship long words (8+ letters)`,
    );
  }
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
  prompt: 'spoken-hebrew',
  choices: 'semantic-images',
  target: 'hebrew-without-answer-image',
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
for (const game of ['memory', 'shop', 'house', 'reveal']) {
  assert.equal(GENERATED_GAME_LEVELS[game].length, 9, `${game} must generate 9 levels`);
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
