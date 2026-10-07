import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PAINTER_WORDS, PAINTER_CHAPTER_WORD_POOLS, getPainterWord } from '../prototype/shared/painter-content.mjs';
import { TRAIL_STAGES, getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { VOCABULARY } from '../prototype/shared/vocabulary-catalog.mjs';
import { painterAudioClips } from './painter-audio-clips.mjs';

const lowercaseCat = getPainterWord('cat', 'en', 'lowercase');
assert.equal(lowercaseCat.word, 'cat', 'English words can be traced in lowercase print letters');
assert.equal(lowercaseCat.letters.map(letter => letter.char).join(''), 'cat');
assert.notDeepEqual(lowercaseCat.letters[0].strokes, getPainterWord('cat', 'en', 'uppercase').letters[0].strokes,
  'lowercase letters have their own formation paths');

const chapterCategories = ['animals', 'food', 'nature', 'transport', 'school', 'sports'];
assert.equal(PAINTER_CHAPTER_WORD_POOLS.length, 6);
for (const [chapterIndex, pool] of PAINTER_CHAPTER_WORD_POOLS.entries()) {
  assert.equal(pool.length, 2, 'every chapter offers two words to trace');
  for (const id of pool) {
    assert.equal(VOCABULARY.find(word => word.id === id).category, chapterCategories[chapterIndex]);
  }
}
assert.equal(painterAudioClips('he').find(clip => clip.relativePath === 'letters/פ.mp3').transcript,
  'האות פֵּא', 'פ letter-name recording must request peh with a P sound');

const stages = TRAIL_STAGES.filter(stage => stage.game === 'painter');
assert.equal(stages.length, 6, 'one painter activity per chapter');
assert.equal(new Set(stages.map(stage => stage.chapterIndex)).size, 6);
assert.equal(new Set(stages.flatMap(stage => getGameLevel('painter', stage.level).wordPool)).size, 12);
for (const stage of stages) {
  assert.equal(stage.activity, 'magic-painter');
  const level = getGameLevel('painter', stage.level);
  assert.deepEqual(level.wordPool, PAINTER_CHAPTER_WORD_POOLS[stage.chapterIndex]);
  for (const wordId of level.wordPool) for (const [language, letterCase] of [['en', 'lowercase'], ['en', 'uppercase'], ['he', 'uppercase']]) {
    const word = getPainterWord(wordId, language, letterCase);
    assert.ok(word.letters.length >= 3);
    assert.equal(word.letters.map(letter => letter.char).join(''), word.word);
    assert.ok(existsSync(new URL(`../prototype/${word.picture}`, import.meta.url)), word.picture);
    assert.ok(existsSync(new URL(`../src/assets/audio/vocabulary/${language}/words/${word.id}.mp3`, import.meta.url)));
    assert.ok(existsSync(new URL(`../src/assets/audio/vocabulary/${language}/ui/painter-start.mp3`, import.meta.url)));
    for (const letter of word.letters) {
      const recordingLetter = language === 'en' ? letter.char.toUpperCase() : letter.char;
      assert.ok(existsSync(new URL(`../src/assets/audio/vocabulary/${language}/letters/${recordingLetter}.mp3`, import.meta.url)),
        `${language} letter name ${letter.char}`);
      assert.ok(letter.strokes.length > 0, letter.char);
      for (const stroke of letter.strokes) {
        assert.match(stroke.d, /^M/);
        assert.ok([stroke.from.x, stroke.from.y, stroke.to.x, stroke.to.y].every(Number.isFinite));
      }
    }
  }
}
assert.equal(Object.keys(PAINTER_WORDS).length, 12);
// Ohio State ABC Lessons, p. 16/263: N starts at the top and pulls down.
const nFirstStroke = getPainterWord('sun', 'en').letters[2].strokes[0];
assert.equal(nFirstStroke.from.x, nFirstStroke.to.x);
assert.ok(nFirstStroke.from.y < nFirstStroke.to.y, 'N begins with a downward left leg');
const tStrokes = getPainterWord('cat', 'en').letters[2].strokes;
assert.ok(tStrokes[0].from.y < tStrokes[0].to.y && tStrokes[0].from.x === tStrokes[0].to.x,
  'T starts with a downward center stem before its crossbar');
assert.ok(tStrokes[1].from.x < tStrokes[1].to.x, 'T top bar runs left to right');
// Yo-yoo print worksheet 60673: ש goes down the right leg, around, then up the left.
const shinStrokes = getPainterWord('sun', 'he').letters[0].strokes;
assert.ok(shinStrokes[0].from.x > shinStrokes[0].to.x, 'ש outer stroke starts on the right');
assert.equal(shinStrokes[0].from.y, shinStrokes[0].to.y, 'ש outer stroke ends at the top of the left leg');
assert.ok(shinStrokes[1].from.y < shinStrokes[1].to.y, 'ש middle stroke goes down last');
// Yo-yoo print worksheet 60679: ס runs across the roof to the right, loops down,
// then ends by moving up its left edge to meet the roof.
const samekh = getPainterWord('boat', 'he').letters.find(letter => letter.char === 'ס').strokes;
assert.equal(samekh.length, 1);
const roof = samekh[0].d.match(/^M(\d+) (\d+) L(\d+) (\d+)/).slice(1).map(Number);
assert.ok(roof[0] < roof[2] && roof[1] === roof[3], 'ס starts across the roof to the right');
assert.ok(Math.abs(samekh[0].from.x - samekh[0].to.x) < 15, 'ס closes at the left side');
assert.equal(samekh[0].from.y, samekh[0].to.y, 'ס closes at the roof');
// Yo-yoo print worksheet 60681: מ starts at the lower left, rises into its
// arch, then draws the right leg, base, and small side branch in that order.
const mem = getPainterWord('map', 'he').letters[0].strokes;
assert.equal(mem.length, 4);
assert.ok(mem[0].from.y > mem[0].to.y, 'מ arch rises from the lower left');
assert.ok(mem[1].from.y < mem[1].to.y, 'מ right leg goes down second');
assert.ok(mem[2].from.x > mem[2].to.x, 'מ base goes left third');
assert.ok(mem[3].from.y < mem[3].to.y, 'מ short branch goes down last');
// Yo-yoo print worksheets 60682, 60684, 60674, 60689 and 60690.
const hebrew = id => getPainterWord(id, 'he').letters;
const lamed = hebrew('cat').find(letter => letter.char === 'ל').strokes[0];
assert.ok(lamed.from.y < lamed.to.y, 'ל descends from the top before the hook');
const yod = hebrew('boat').find(letter => letter.char === 'י').strokes[0];
assert.ok(yod.from.x < yod.to.x && yod.from.y < yod.to.y, 'י goes right, then down');
const resh = hebrew('boat').find(letter => letter.char === 'ר').strokes[0];
assert.ok(resh.from.x < resh.to.x && resh.from.y < resh.to.y, 'ר goes right, then down');
const he = hebrew('map').find(letter => letter.char === 'ה').strokes;
assert.equal(he.length, 2);
assert.ok(he[1].from.y < he[1].to.y, 'ה left leg goes down last');
const dalet = hebrew('medal').find(letter => letter.char === 'ד').strokes;
assert.equal(dalet.length, 2);
assert.ok(dalet[0].from.x < dalet[0].to.x && dalet[1].from.y < dalet[1].to.y,
  'ד roof goes right, then leg goes down');
// Montgomery County K-2 verbal paths: M pulls down first; D pulls down, then
// returns to the top and curves around.
const mStrokes = getPainterWord('map', 'en').letters[0].strokes;
assert.equal(mStrokes.length, 4);
assert.ok(mStrokes[0].from.y < mStrokes[0].to.y, 'M starts with a downward left leg');
const dStrokes = getPainterWord('medal', 'en').letters[2].strokes;
assert.equal(dStrokes.length, 2);
assert.ok(dStrokes[0].from.y < dStrokes[0].to.y, 'D starts with a downward left leg');
assert.deepEqual(dStrokes[1].from, dStrokes[0].from, 'D curve starts again at the top');
assert.notDeepEqual(getPainterWord('apple', 'he').letters[0].strokes, getPainterWord('apple', 'he').letters[3].strokes);
assert.throws(() => getPainterWord('missing', 'en'), /Unknown painter word/);
assert.throws(() => getPainterWord('apple', 'fr'), /Unknown painter language/);
assert.throws(() => getPainterWord('cat', 'en', 'cursive'), /Unknown painter letter case/);
console.log('PASS: six Painter stages offer 12 bilingual words, lowercase and uppercase paths, pictures, and committed recordings.');
