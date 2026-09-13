// Regression: the Hebrew Memory Garden board must be readable without reading.
// Target cards carry the spoken Hebrew word; matching cards are pictures only,
// so no English words appear on a Hebrew board.
// Run with an isolated local save service (scripts/run-memory-hebrew-board.mjs).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'memory-hebrew-test', ...args], {
  encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
});
const runId = `${process.pid}-${Date.now()}`;
const route = `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'memory-garden', level: 'trail-memory-1', stage: '1',
  profile: `memory-${runId}`, profileName: 'Test', profileEmoji: '🫧',
  profileCharacter: 'dinosaur', profileLanguage: 'he',
})}`;

try {
  browser('open', route);
  browser('wait', '.memory-card');
  const result = JSON.parse(browser('eval', `(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const cards = () => [...document.querySelectorAll('.memory-card')];
    const hebrew = cards().filter((card) => card.dataset.kind === 'hebrew');
    const english = cards().filter((card) => card.dataset.kind === 'english');
    const latin = /[A-Za-z]/;
    const firstHebrew = hebrew[0];
    if (firstHebrew) firstHebrew.click();
    await sleep(900);
    const audio = document.getElementById('recorded-speech');
    return {
      hebrewCount: hebrew.length,
      englishCount: english.length,
      hebrewWithSpeaker: hebrew.filter((card) => card.querySelector('.memory-card-sound')).length,
      hebrewWordsAreHebrew: hebrew.every((card) => !latin.test(card.querySelector('.memory-card-word')?.textContent ?? '')),
      englishHaveNoWord: english.every((card) => !card.querySelector('.memory-card-word')),
      englishHaveDrawing: english.every((card) => !!card.querySelector('.memory-card-drawing')?.textContent),
      anyLatinOnBoard: cards().some((card) => latin.test(card.querySelector('.memory-card-front')?.textContent ?? '')),
      audioSrc: audio?.src?.split('/').pop() ?? null,
      audioError: audio?.error?.code ?? null,
    };
  })()`));

  assert.ok(result.hebrewCount > 0, `Hebrew board must include spoken target cards: ${JSON.stringify(result)}`);
  assert.equal(result.hebrewWithSpeaker, result.hebrewCount, `every Hebrew card needs a speaker: ${JSON.stringify(result)}`);
  assert.equal(result.hebrewWordsAreHebrew, true, `Hebrew target cards must show Hebrew: ${JSON.stringify(result)}`);
  assert.equal(result.englishHaveNoWord, true, `Hebrew matching cards must be pictures only: ${JSON.stringify(result)}`);
  assert.equal(result.englishHaveDrawing, true, `Hebrew matching cards need a picture: ${JSON.stringify(result)}`);
  assert.equal(result.anyLatinOnBoard, false, `a Hebrew board must show no English words: ${JSON.stringify(result)}`);
  assert.ok(result.audioSrc && result.audioSrc.endsWith('.mp3'), `revealing a Hebrew card must play a committed clip: ${JSON.stringify(result)}`);
  assert.equal(result.audioError, null, `Hebrew playback must have no error: ${JSON.stringify(result)}`);

  // Even with reduced motion (no flip transition) the finished board must stay
  // on screen for a beat before the celebration covers it.
  browser('set', 'media', 'light', 'reduced-motion');
  browser('reload');
  browser('wait', '.memory-card');
  const win = JSON.parse(browser('eval', `(async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const cards = () => [...document.querySelectorAll('.memory-card')];
    const byWord = {};
    cards().forEach((card) => { (byWord[card.dataset.wordId] ||= []).push(card); });
    const pairs = Object.values(byWord);
    for (let index = 0; index < pairs.length - 1; index += 1) {
      pairs[index].find((card) => card.dataset.kind === 'hebrew').click();
      await sleep(40);
      pairs[index].find((card) => card.dataset.kind === 'english').click();
      await sleep(120);
    }
    const lastPair = pairs[pairs.length - 1];
    lastPair.find((card) => card.dataset.kind === 'hebrew').click();
    await sleep(40);
    lastPair.find((card) => card.dataset.kind === 'english').click();
    const started = performance.now();
    let celebrationAt = null;
    while (performance.now() - started < 4000) {
      if (document.querySelector('#memory-celebration')?.classList.contains('is-visible')) {
        celebrationAt = Math.round(performance.now() - started);
        break;
      }
      await sleep(3);
    }
    return {
      celebrationAt,
      total: cards().length,
      faceUp: cards().filter((card) => card.classList.contains('is-face-up')).length,
    };
  })()`));

  assert.ok(win.celebrationAt !== null, `the reduced-motion round must still win: ${JSON.stringify(win)}`);
  assert.ok(win.celebrationAt >= 500, `the finished board must hold before celebrating: ${JSON.stringify(win)}`);
  assert.equal(win.faceUp, win.total, `every card must be open before the hold ends: ${JSON.stringify(win)}`);
  console.log(`PASS: the Hebrew Memory board shows spoken Hebrew targets and picture-only matches with no English words, and holds the finished board before celebrating. ${JSON.stringify({ result, win })}`);
} finally {
  browser('close');
}
