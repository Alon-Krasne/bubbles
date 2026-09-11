// Run npm run build and scripts/serve-save-test.mjs first (isolated local D1).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'memory-saves', ...args], { encoding: 'utf8' });
const evaluate = expression => JSON.parse(browser('eval', expression));
const profile = `memory-save-test-${Date.now()}`;
const routeKey = `route-${profile}`;
const url = `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'memory-garden', level: 'level-1', stage: '1',
  profile, profileName: 'Test', profileEmoji: '🌸', profileCharacter: 'princess', profileLanguage: 'en',
})}`;
const cards = () => evaluate(`[...document.querySelectorAll('.memory-card')].map(c => ({id:c.dataset.cardId, word:c.dataset.wordId}))`);
const click = id => browser('click', `[data-card-id="${id}"]`);
const flush = () => evaluate('window.bubblesSaveClient.flush().then(() => true)');
const writes = () => evaluate(`performance.getEntriesByType('resource').filter(e => new URL(e.name).pathname.startsWith('/api/saves/')).length`);
const resetMeter = () => { flush(); evaluate('performance.clearResourceTimings(); true'); };

try {
  browser('open', url);
  browser('wait', '.memory-card');
  evaluate(`window.bubblesSaveClient.setItem(${JSON.stringify(routeKey)}, JSON.stringify({currentStage:1,progress:{}})); true`);
  resetMeter();
  let deck = cards();
  click(deck[0].id);
  flush();
  assert.equal(writes(), 0, 'Opening one card must not write to the database');
  click(deck.find(c => c.word !== deck[0].word).id);
  click(deck[0].id); // Dismiss the mismatch.
  flush();
  assert.equal(writes(), 0, 'Mismatch and dismissal must not write');
  for (const card of deck.filter(c => c.word === deck[0].word)) click(card.id);
  flush();
  assert.equal(writes(), 0, 'An individual matched pair must not write');
  browser('reload');
  browser('wait', '.memory-card');
  assert.equal(evaluate('document.querySelectorAll(".memory-card.is-face-up, .memory-card.is-matched").length'), 0, 'Reload starts a closed, unmatched board');
  resetMeter();
  browser('click', '#memory-new-garden-btn');
  flush();
  assert.equal(writes(), 0, 'Reshuffling must not write');
  deck = cards();
  for (const word of new Set(deck.map(c => c.word))) {
    for (const card of deck.filter(c => c.word === word)) click(card.id);
  }
  flush();
  assert.equal(writes(), 1, 'Completing the board writes progress once');
  const saved = evaluate(`fetch('/api/saves').then(r=>r.json())`);
  assert.equal(JSON.parse(saved[routeKey].value).progress[1], 3, 'Completed stars reach the real save service');
  assert.equal(JSON.parse(saved[routeKey].value).currentStage, 2);
  assert.ok(!Object.keys(saved).some(key => key.startsWith(`memory-round-${profile}-`)), 'No board snapshot is created');
  browser('reload');
  browser('wait', '.memory-card');
  assert.equal(evaluate(`JSON.parse(window.bubblesSaveClient.getItem(${JSON.stringify(routeKey)})).progress[1]`), 3, 'Completed progress survives reload');
  console.log('PASS: flips, mismatches, pairs and reshuffles produce 0 database writes; completion produces 1; reload closes cards and retains stars.');
} finally {
  browser('close');
}
