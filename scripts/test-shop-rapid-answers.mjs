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
  destination: 'wonder', profileCharacter: 'dinosaur', profileLanguage: 'he',
})}`;
const requestProfileId = `request-${runId}`;
const requestRoute = `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'listening-shop', level: 'trail-shop-11', stage: '32',
  profile: requestProfileId, profileName: 'Test', profileEmoji: '🫧',
  destination: 'wonder', profileCharacter: 'dinosaur', profileLanguage: 'he',
})}`;

const helpers = `
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const prompt = () => document.querySelector('#shop-order-prompt')?.textContent ?? '';
  const tiles = () => [...document.querySelectorAll('.shop-item-tile')];
  const served = () => document.querySelector('#shop-served-progress')?.textContent ?? '';
  const replay = () => document.querySelector('#shop-order-replay-btn');
  const celebrating = () => document.querySelector('#shop-celebration')?.classList.contains('is-visible') ?? false;
  if (!window.__speechLog) {
    window.__speechLog = { srcs: [], meta: [], errors: [] };
    document.addEventListener('playing', (event) => {
      if (event.target?.id === 'recorded-speech' && event.target.src) {
        window.__speechLog.srcs.push(event.target.src);
        window.__speechLog.meta.push({
          name: event.target.src.split('/').pop(),
          index: Number(event.target.dataset.sequenceIndex),
          length: Number(event.target.dataset.sequenceLength),
        });
      }
    }, true);
    document.addEventListener('error', (event) => {
      if (event.target?.id === 'recorded-speech') window.__speechLog.errors.push(event.target.error?.code ?? -1);
    }, true);
  }
`;

const requestScript = `(async () => {
  ${helpers}
  const started = Date.now();
  // Wait until the spoken request reaches its last clip. Clips are spaced by
  // >1s, so we track the sequence index rather than guessing at quiet gaps.
  while (Date.now() - started < 12000) {
    const last = window.__speechLog.meta.at(-1);
    if (last && last.length >= 3 && last.index === last.length - 1) break;
    await sleep(20);
  }
  const names = window.__speechLog.srcs.map((url) => url.split('/').pop());
  return { names, promptText: prompt() };
})()`;

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
  // No seeded route: a deep-linked activity must still record completion by
  // starting a fresh route instead of stranding the child on the last customer.
  browser('open', route);
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

  const savedRoute = JSON.parse(browser('eval', `JSON.parse(window.bubblesSaveClient.getItem(${JSON.stringify(`route-${profileId}`)}) || 'null')`));
  assert.ok(savedRoute, `completing without a seeded route must create one: ${JSON.stringify(savedRoute)}`);
  assert.ok(savedRoute.progress?.['32'] > 0, `the completed stage must be recorded in the fresh route: ${JSON.stringify(savedRoute)}`);

  // The spoken request itself must be the composed Hebrew sequence, not just
  // "some committed clip": can-i-have + item + and + item for a double order.
  browser('open', requestRoute);
  const request = JSON.parse(browser('eval', requestScript));
  assert.ok(request.names.length >= 3, `a Hebrew double order must speak multiple clips: ${JSON.stringify(request)}`);
  assert.ok(request.names[0].startsWith('can-i-have'), `the request must open with can-i-have: ${JSON.stringify(request)}`);
  assert.ok(request.names.some((name) => name.startsWith('and-')), `a double request must include and: ${JSON.stringify(request)}`);
  assert.ok(request.names.every((name) => name.endsWith('.mp3')), `the request clips must be committed audio: ${JSON.stringify(request)}`);

  console.log(`PASS: a two-item Hebrew order answered within 150ms advances, the full level completes with real Hebrew playback and creates a fresh route, and the spoken request is the composed Hebrew sequence. ${JSON.stringify({ rapid, summary, request })}`);
} finally {
  browser('close');
}
