// Run after building, with the temporary localhost save server running.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { REEF_JOURNEY_STAGES, TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'journey-difficulty', ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const state = () => evaluate('JSON.parse(window.render_game_to_text())');
const origin = 'http://127.0.0.1:8788';
const profileId = `difficulty-qa-${Date.now()}`;
const openStage = (id, language = 'en') => {
  const stage = [...TRAIL_STAGES, ...REEF_JOURNEY_STAGES].find(item => item.id === id);
  const params = new URLSearchParams({
    host: 'world-map', activity: stage.activity, level: stage.level, stage: String(id),
    profile: profileId, profileName: 'Difficulty', profileEmoji: '🌸', profileCharacter: 'princess',
    profileLanguage: language, destination: id > 36 ? 'reef' : 'forest',
  });
  const path = stage.game === 'house' ? '/prototype/magic-house.html' : '/index.html';
  browser('open', `${origin}${path}?${params}`);
};

try {
  browser('open', `${origin}/prototype/world-map.html`);
  browser('wait', '.gate-profile-choice');
  const oldDeck = { remaining: ['red-heart'], previous: [] };
  const oldShop = { [profileId]: { 'trail-shop-6': oldDeck } };
  evaluate(`(() => {
    localStorage.setItem('shop-decks-forest-en-${profileId}', ${JSON.stringify(JSON.stringify(oldShop))});
    localStorage.setItem('painter-deck-${profileId}-forest-en-trail-painter-5', '{"remaining":["moon"],"previous":[]}');
    localStorage.setItem('reveal-deck-${profileId}-reef-en-reef-reveal-1', '{"remaining":["lion"],"previous":[]}');
    return true;
  })()`);
  openStage(25);
  browser('wait', '.shop-item-tile');
  assert.equal(state().targets.length, 2);
  openStage(29);
  browser('wait', '#paint-canvas');
  assert.equal(state().wordCount, 3);
  openStage(40);
  browser('wait', '#reveal-keyboard button');
  assert.match(evaluate("document.querySelector('#reveal-progress').textContent"), /6$/);

  for (const [language, width, height] of [['en', '390', '844'], ['he', '844', '390']]) {
    browser('set', 'viewport', width, height);
    openStage(69, language);
    browser('wait', '#memory-board[data-pairs="12"] .memory-card');
    assert.equal(browser('get', 'count', '.memory-card').trim(), '24');
    browser('click', '.memory-card:last-child');
    browser('wait', '.memory-card:last-child.is-face-up');
    assert.ok(evaluate(`[...document.querySelectorAll('.memory-card')].every(card => {
      const rect = card.getBoundingClientRect();
      return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.right <= innerWidth;
    })`));
    openStage(71, language);
    browser('wait', '.shop-item-tile');
    assert.equal(state().targets.length, 2);
    assert.match(evaluate("document.querySelector('#shop-served-progress').textContent"), /0\/10$/);
    openStage(67, language);
    browser('wait', '#reveal-keyboard button');
    assert.match(evaluate("document.querySelector('#reveal-progress').textContent"), /8$/);
    openStage(65, language);
    browser('wait', '#paint-canvas');
    assert.equal(state().wordCount, 6);
    openStage(72, language);
    browser('wait', '.object-button');
    assert.match(state().requestIds[0], /^request-(6|12)$/);
    assert.equal(browser('get', 'count', '.object-button').trim(), '8');
  }
  assert.equal(browser('errors').trim(), '');
  console.log('PASS: saved decks, playable 24-card Memory on phones, and late Reef Shop, Reveal, Painter and House in both languages.');
} finally {
  browser('close');
}
