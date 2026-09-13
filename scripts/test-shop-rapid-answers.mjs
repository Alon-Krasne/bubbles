// Regression: answering a two-item Hebrew order before the delayed request
// prompt fires must not strand the round. The prompt used to replace the queued
// confirmation sequence, discarding the callback that advances the customer.
// The same run then completes the whole Hebrew level and asserts real playback,
// closing the gap where the spoken-Hebrew check only looked at labels/pictures.
// Run with an isolated local save service (scripts/run-shop-rapid-answers.mjs).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'shop-rapid-test', ...args], {
  encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
});
const runId = `${process.pid}-${Date.now()}`;
const profileId = `rapid-${runId}`;
const route = `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'listening-shop', level: 'trail-shop-11', stage: '32',
  profile: profileId, profileName: 'Test', profileEmoji: '🫧',
  profileCharacter: 'dinosaur', profileLanguage: 'he',
})}`;

const helpers = `
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const prompt = () => document.querySelector('#shop-order-prompt')?.textContent ?? '';
  const tiles = () => [...document.querySelectorAll('.shop-item-tile')];
  const served = () => document.querySelector('#shop-served-progress')?.textContent ?? '';
  const replay = () => document.querySelector('#shop-order-replay-btn');
  const celebrating = () => document.querySelector('#shop-celebration')?.classList.contains('is-visible') ?? false;
  if (!window.__speechLog) {
    window.__speechLog = { srcs: [], errors: [] };
    document.addEventListener('playing', (event) => {
      if (event.target?.id === 'recorded-speech' && event.target.src) window.__speechLog.srcs.push(event.target.src);
    }, true);
    document.addEventListener('error', (event) => {
      if (event.target?.id === 'recorded-speech') window.__speechLog.errors.push(event.target.error?.code ?? -1);
    }, true);
  }
`;

const rapidScript = `(async () => {
  ${helpers}
  const started = Date.now();
  while (tiles().length === 0 && Date.now() - started < 15000) await sleep(10);
  const correct = tiles().filter((tile) => prompt().includes(tile.getAttribute('aria-label')));
  const before = served();
  if (correct.length > 0) correct[0].click();
  if (correct.length > 1) { await sleep(150); correct[1].click(); }
  const deadline = Date.now() + 8000;
  while (served() === before && !celebrating() && Date.now() < deadline) await sleep(25);
  while (replay().disabled && !celebrating() && Date.now() < deadline) await sleep(25);
  return {
    correctCount: correct.length,
    served: served(),
    replayDisabled: replay().disabled,
  };
})()`;

const answerOneScript = `(async () => {
  ${helpers}
  if (celebrating()) return { celebrating: true, advanced: true, served: served() };
  const correct = tiles().filter((tile) => prompt().includes(tile.getAttribute('aria-label')));
  const before = served();
  const promptText = prompt();
  const replayAtStart = replay().disabled;
  if (correct.length > 0) correct[0].click();
  if (correct.length > 1) { await sleep(150); correct[1].click(); }
  const deadline = Date.now() + 8000;
  while (served() === before && !celebrating() && Date.now() < deadline) await sleep(25);
  while (replay().disabled && !celebrating() && Date.now() < deadline) await sleep(25);
  return {
    celebrating: celebrating(),
    advanced: served() !== before || celebrating(),
    served: served(),
    correctCount: correct.length,
    clicked: correct.map((tile) => tile.dataset.itemId),
    promptText,
    replayAtStart,
    basket: document.querySelector('#shop-basket-progress')?.textContent ?? '',
    feedback: document.querySelector('#shop-feedback')?.textContent ?? '',
  };
})()`;

const summaryScript = `(() => ({
  celebrating: document.querySelector('#shop-celebration')?.classList.contains('is-visible') ?? false,
  served: document.querySelector('#shop-served-progress')?.textContent ?? '',
  audioSrcs: window.__speechLog.srcs.map((url) => url.split('/').pop()),
  audioErrors: window.__speechLog.errors,
}))()`;

try {
  browser('open', route);
  // The world map creates the profile's route before launching an activity;
  // seed it here so the final customer's completion can record its stage.
  browser('eval', `window.bubblesSaveClient.setItem(${JSON.stringify(`route-${profileId}`)}, JSON.stringify({ progress: {}, currentStage: 1, contentVersion: 1 }))`);
  const rapid = JSON.parse(browser('eval', rapidScript));
  assert.equal(rapid.correctCount, 2, `rapid fixture must resolve two requested pictures: ${JSON.stringify(rapid)}`);
  assert.equal(rapid.replayDisabled, false, `a rapid correct answer must not lock the round: ${JSON.stringify(rapid)}`);

  let guard = 0;
  let completed = false;
  while (guard < 10 && !completed) {
    const step = JSON.parse(browser('eval', answerOneScript));
    completed = step.celebrating;
    assert.equal(step.advanced, true, `every Hebrew customer must advance: ${JSON.stringify(step)}`);
    guard += 1;
  }

  const summary = JSON.parse(browser('eval', summaryScript));
  assert.equal(summary.celebrating, true, `the full Hebrew round must reach its celebration: ${JSON.stringify(summary)}`);
  assert.ok(summary.audioSrcs.length > 0, `Hebrew speech must actually play: ${JSON.stringify(summary)}`);
  assert.ok(summary.audioSrcs.every((name) => name.endsWith('.mp3')), `played audio must be committed clips: ${JSON.stringify(summary.audioSrcs)}`);
  assert.deepEqual(summary.audioErrors, [], `Hebrew speech must play without errors: ${JSON.stringify(summary.audioErrors)}`);
  console.log(`PASS: a two-item Hebrew order answered within 150ms advances, and the full level completes with real Hebrew playback. ${JSON.stringify({ rapid, summary })}`);
} finally {
  browser('close');
}
