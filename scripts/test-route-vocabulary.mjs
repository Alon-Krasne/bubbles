import assert from 'node:assert/strict';

import { VOCAB_WORDS } from '../src/words.ts';
import { GAME_LEVELS, TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const activeWordIds = new Set([
  ...TRAIL_STAGES
    .filter((stage) => stage.game === 'memory')
    .flatMap((stage) => getGameLevel(stage.game, stage.level).wordPool),
  ...GAME_LEVELS.shop.flatMap((level) => level.itemPool),
]);
const missingWordIds = VOCAB_WORDS.map((word) => word.id).filter((wordId) => !activeWordIds.has(wordId));

assert.deepEqual(missingWordIds, [], 'every vocabulary word must be reachable through the 15-stage route');

console.log(JSON.stringify({ routedVocabulary: activeWordIds.size, catalogVocabulary: VOCAB_WORDS.length }));
