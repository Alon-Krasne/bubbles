import assert from 'node:assert/strict';
import { VOCABULARY } from '../prototype/shared/vocabulary-catalog.mjs';
import { TRAIL_STAGES, REEF_JOURNEY_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { getPainterWordPool } from '../prototype/shared/painter-content.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

const words = new Map(VOCABULARY.map(word => [word.id, word]));
for (const word of VOCABULARY) for (const language of ['en', 'he']) {
  assert.ok([1, 2, 3, 4].includes(word.difficulty?.[language]), `${word.id} needs an authored ${language} vocabulary grade`);
}
assert.equal(words.get('strawberry').difficulty.en, 3);
assert.equal(words.get('strawberry').difficulty.he, 1, 'A familiar short Hebrew word has its own grade');
assert.equal(words.get('elephant').difficulty.he, 1);
assert.equal(words.get('ladybug').difficulty.he, 4, 'A long Hebrew expression is introduced later');

const { getVocabularyPool } = await import('../prototype/shared/vocabulary-progression.mjs');
const firstMemory = getGameLevel('memory', TRAIL_STAGES[0].level);
const firstPool = language => getVocabularyPool({ pool: firstMemory.wordPool, rank: 1, language, activity: 'memory' });
assert.equal(firstPool('en').includes('strawberry'), false);
assert.equal(firstPool('he').includes('strawberry'), true, 'The same picture follows the active language’s grade');
assert.throws(() => getVocabularyPool({ pool: ['cat'], rank: 9, language: 'en', activity: 'memory' }), /Invalid/);
const route = [...TRAIL_STAGES, ...REEF_JOURNEY_STAGES];
for (const language of ['en', 'he']) {
  const reachable = new Set();
  for (const stage of route) {
    if (stage.game === 'house') continue;
    const level = getGameLevel(stage.game, stage.level);
    const pool = stage.game === 'painter' ? getPainterWordPool(level, language) : getVocabularyPool({
      pool: stage.game === 'shop' ? level.itemPool : level.wordPool,
      rank: level.difficultyRank, language, activity: stage.game,
    });
    const count = stage.game === 'memory' ? level.pairs : stage.game === 'shop' ? (level.mode === 'double' ? 2 : 1) : level.wordCount;
    assert.ok(pool.length > count, `${language} stage ${stage.id} needs enough graded words and replay variety`);
    if (stage.game === 'shop') {
      const shelf = getVocabularyPool({ pool: level.itemPool, rank: level.difficultyRank, language, activity: 'shop-shelf' });
      assert.ok(shelf.length >= level.shelfSize, `Stage ${stage.id} can fill its shelf`);
      assert.ok(pool.every(id => shelf.includes(id)), 'Every requested word has a shelf picture');
    }
    const grades = pool.map(id => words.get(id).difficulty[language]);
    if (stage.id <= 6) assert.ok(grades.every(grade => grade === 1), `Stage ${stage.id} uses only foundational vocabulary`);
    if (stage.id <= 12) assert.ok(grades.every(grade => grade <= 2), 'Extended vocabulary waits until later chapters');
    if (stage.id <= 24) assert.ok(grades.every(grade => grade <= 3), 'Specialist vocabulary waits until the final Forest chapters');
    if (stage.id > 36 && ['memory', 'shop'].includes(stage.game)) {
      assert.ok(grades.every(grade => grade >= 2), `Stage ${stage.id} continues past foundational vocabulary`);
    }
    if (stage.id > 60 && ['memory', 'shop'].includes(stage.game)) {
      assert.ok(grades.every(grade => grade >= 3), `Late stage ${stage.id} uses advanced vocabulary`);
    }
    let state = null;
    for (let replay = 0; replay < 8; replay++) {
      const round = drawVocabularyRound({ pool, count, state });
      assert.equal(new Set(round.selection).size, count);
      assert.ok(round.selection.every(id => pool.includes(id)));
      state = round.state;
    }
    if (stage.game === 'memory') for (const id of pool) reachable.add(id);
  }
  assert.deepEqual(VOCABULARY.filter(word => !reachable.has(word.id)).map(word => word.id), [], `All words remain reachable across the 72-stage ${language} journey`);
}
console.log('PASS: authored bilingual grades, language differences, all 72 graded stages, replay variety, and full vocabulary coverage.');
