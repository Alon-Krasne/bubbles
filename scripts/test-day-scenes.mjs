// Run against scripts/serve-save-test.mjs after npm run build.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const browser = (...args) => execFileSync('agent-browser', ['--session', 'day-scenes-test', ...args], { encoding: 'utf8' });
const origin = 'http://127.0.0.1:8788';
const profile = { host: 'world-map', profile: 'day-scenes', profileName: 'Test', profileEmoji: '🫧', profileCharacter: 'dinosaur', profileLanguage: 'he' };
const scenes = [
  ['memory', `/index.html?${new URLSearchParams({ ...profile, activity: 'memory-garden', level: 'trail-memory-1', stage: '1' })}`, '#memory-screen', 'backgroundImage', '.memory-card', 'sunlit-garden'],
  ['shop', `/index.html?${new URLSearchParams({ ...profile, activity: 'listening-shop', level: 'trail-shop-11', stage: '32' })}`, '.shop-scene-art', 'content', '.shop-game-area:not(.hidden)', 'sunlit-shop'],
  ['house', '/prototype/magic-house.html', '.room-canvas', 'backgroundImage', '.room-canvas', 'sunlit-room'],
];
try {
  browser('open', `${origin}/prototype/world-map.html`);
  browser('click', '.profile-gate [data-time-toggle=day]');
  for (const [name, route, selector, property, ready, asset] of scenes) {
    browser('open', origin + route);
    browser('wait', ready);
    const result = JSON.parse(browser('eval', `(async () => {
      const css = getComputedStyle(document.querySelector(${JSON.stringify(selector)}))[${JSON.stringify(property)}];
      const url = css.match(/url\\(["']?([^"')]+)["']?\\)/)[1];
      const image = new Image(); image.src = url; await image.decode();
      return { theme: document.documentElement.dataset.timeOfDay, url, width: image.naturalWidth };
    })()`));
    assert.equal(result.theme, 'day');
    assert.match(result.url, new RegExp(asset));
    assert.ok(result.width > 1000);
    console.log(`PASS: ${name} inherits day and its daytime artwork loads (${result.width}px).`);
  }
} finally { browser('close'); }
