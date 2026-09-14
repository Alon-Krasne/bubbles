// Run after npm run build with scripts/serve-save-test.mjs serving dist.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const browser = (...args) => execFileSync('agent-browser', ['--session', 'time-of-day-test', ...args], { encoding: 'utf8' });
const evaluate = (code) => JSON.parse(browser('eval', code));
const url = 'http://127.0.0.1:8788/prototype/world-map.html';
try {
  browser('open', url);
  browser('wait', '.gate-profile-choice');
  assert.equal(evaluate('document.querySelectorAll("[data-time-toggle=day]").length'), 2, 'Day controls must exist on the gate and map');
  browser('click', '.profile-gate [data-time-toggle=day]');
  assert.equal(evaluate('document.documentElement.dataset.timeOfDay'), 'day');
  assert.match(evaluate('getComputedStyle(document.querySelector(".map-stage")).backgroundImage'), /sunlit-trail/);
  assert.equal(evaluate('document.querySelector("[data-time-toggle=day]").getAttribute("aria-pressed")'), 'true');
  browser('reload');
  browser('wait', '.gate-profile-choice');
  assert.equal(evaluate('document.documentElement.dataset.timeOfDay'), 'day', 'Choice survives reload');
  browser('click', '.gate-profile-choice >> nth=0');
  for (const [width, height] of [[390, 844], [820, 1180], [1440, 900]]) {
    browser('set', 'viewport', String(width), String(height));
    assert.equal(evaluate(`(() => {
      const buttons = [...document.querySelectorAll('.world-actions [data-time-toggle]')];
      return buttons.every(button => {
        const r = button.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth && r.top >= 0;
      });
    })()`), true, `Toggle touch targets fit at ${width}x${height}`);
  }
  browser('click', '.world-actions [data-time-toggle=night]');
  assert.equal(evaluate('document.documentElement.dataset.timeOfDay'), 'night');
  assert.match(evaluate('getComputedStyle(document.querySelector(".map-stage")).backgroundImage'), /moonlit-trail/);
  browser('reload');
  assert.equal(evaluate('document.documentElement.dataset.timeOfDay'), 'night', 'Night persists too');
  console.log('PASS: day/night switching, artwork, pressed state, reload persistence, and touch controls at 3 viewport sizes.');
} finally { browser('close'); }
