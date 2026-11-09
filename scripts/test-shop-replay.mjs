// Run against the local save test server after building the app.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'shop-replay', ...args], { encoding: 'utf8' });
const read = expression => JSON.parse(browser('eval', expression));
const runId = Date.now();
const base = process.env.SHOP_TEST_URL || 'http://127.0.0.1:8788';
assert.equal(new URL(base).hostname, '127.0.0.1');

try {
  for (const language of ['en', 'he']) {
    const profileId = `replay-${language}-${runId}`;
    const params = new URLSearchParams({ host: 'world-map', activity: 'listening-shop', level: 'trail-shop-1', stage: '2',
      profile: profileId, profileName: 'Test', profileEmoji: '🌸', profileCharacter: 'princess',
      profileLanguage: language, destination: 'wonder' });
    const choices = [];
    for (let visit = 0; visit < 3; visit++) {
      browser('open', `${base}/index.html?${params}`);
      browser('wait', '.shop-item-tile');
      choices.push(read('JSON.parse(window.render_game_to_text()).targets[0].itemId'));
    }
    assert.equal(new Set(choices).size, 3, `${language} shop replays should use different items`);
    const stores = read('({local: Object.keys(localStorage), cloud: window.bubblesSaveClient.keys()})');
    assert.ok(stores.local.some(key => key.startsWith('shop-decks-') && key.includes(profileId)));
    assert.ok(!stores.cloud.some(key => key.startsWith('shop-decks-') && key.includes(profileId)));
    console.log(`PASS: ${language} shop replays vary and keep history on this device`);
  }
} finally {
  browser('close');
}
