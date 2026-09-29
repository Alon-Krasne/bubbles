import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PAINTER_WORDS, getPainterWord } from '../prototype/shared/painter-content.mjs';
import { TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';

const stages = TRAIL_STAGES.filter(stage => stage.game === 'painter');
assert.equal(stages.length, 6, 'one painter activity per chapter');
assert.equal(new Set(stages.map(stage => stage.chapterIndex)).size, 6);
assert.equal(new Set(stages.map(stage => getGameLevel('painter', stage.level).wordId)).size, 6);
for (const stage of stages) {
  assert.equal(stage.activity, 'magic-painter');
  const level = getGameLevel('painter', stage.level);
  for (const language of ['en', 'he']) {
    const word = getPainterWord(level.wordId, language);
    assert.ok(word.letters.length >= 3);
    assert.equal(word.letters.map(letter => letter.char).join(''), word.word);
    assert.ok(existsSync(new URL(`../prototype/${word.picture}`, import.meta.url)), word.picture);
    assert.ok(existsSync(new URL(`../src/assets/audio/vocabulary/${language}/words/${word.id}.mp3`, import.meta.url)));
    for (const letter of word.letters) {
      assert.ok(letter.strokes.length > 0, letter.char);
      for (const stroke of letter.strokes) {
        assert.match(stroke.d, /^M/);
        assert.ok([stroke.from.x, stroke.from.y, stroke.to.x, stroke.to.y].every(Number.isFinite));
      }
    }
  }
}
assert.equal(Object.keys(PAINTER_WORDS).length, 6);
// Ohio State ABC Lessons, p. 16/263: N starts at the top and pulls down.
const nFirstStroke = getPainterWord('sun', 'en').letters[2].strokes[0];
assert.equal(nFirstStroke.from.x, nFirstStroke.to.x);
assert.ok(nFirstStroke.from.y < nFirstStroke.to.y, 'N begins with a downward left leg');
// Yo-yoo print worksheet 60673: ש goes down the right leg, around, then up the left.
const shinStrokes = getPainterWord('sun', 'he').letters[0].strokes;
assert.ok(shinStrokes[0].from.x > shinStrokes[0].to.x, 'ש outer stroke starts on the right');
assert.equal(shinStrokes[0].from.y, shinStrokes[0].to.y, 'ש outer stroke ends at the top of the left leg');
assert.ok(shinStrokes[1].from.y < shinStrokes[1].to.y, 'ש middle stroke goes down last');
assert.notDeepEqual(getPainterWord('apple', 'he').letters[0].strokes, getPainterWord('apple', 'he').letters[3].strokes);
assert.throws(() => getPainterWord('missing', 'en'), /Unknown painter word/);
assert.throws(() => getPainterWord('apple', 'fr'), /Unknown painter language/);
console.log('PASS: six bilingual painter stages have traceable words, pictures, and committed word recordings.');
