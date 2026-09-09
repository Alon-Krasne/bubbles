// Run after npm run build, with scripts/serve-save-test.mjs running locally.
// Layout fixtures use real rendered choices and CSS, not game-state mocks.
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'house-inventory-test', ...args], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});
const checkLayout = async () => {
  await document.fonts.ready;
  const drawer = document.querySelector('.object-drawer');
  const list = document.querySelector('.object-list');
  const choices = [...list.children];
  const contains = (outer, inner) => inner.left >= outer.left - 1 && inner.right <= outer.right + 1
    && inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  check(choices.length === 8, 'Practice fixture must supply all eight choices');
  for (const count of [5, 6, 8]) {
    list.replaceChildren(...choices.slice(0, count));
    await new Promise(requestAnimationFrame);
    const bounds = drawer.getBoundingClientRect();
    check(contains(bounds, list.getBoundingClientRect()), `${count} choices: inventory overflows drawer`);
    for (const button of list.children) {
      const rect = button.getBoundingClientRect();
      check(contains(bounds, rect), `${count} choices: button clips outside drawer`);
      check(rect.width >= 44 && rect.height >= 44, 'Choices must remain touch-sized');
      const art = button.querySelector('.object-art');
      if (art) {
        const sprite = art.getBoundingClientRect();
        check(contains(rect, sprite), `${count} choices: sprite overflows button`);
        check(Math.abs(sprite.width - sprite.height) <= 1, 'Sprite cells must remain square');
      } else {
        check(contains(rect, button.querySelector('.object-label').getBoundingClientRect()), 'Hebrew label clips');
      }
    }
  }
  list.replaceChildren(...choices);
  return 'PASS: 5, 6, and 8 choices fit the drawer; sprites/labels fit touch-sized buttons.';
};

try {
  browser('open', 'http://127.0.0.1:8788/prototype/magic-house.html');
  browser('wait', '.object-button');
  for (const language of ['English', 'Hebrew']) {
    if (language === 'Hebrew') {
      browser('click', '#profile-button');
      browser('click', '[data-profile="tom"]');
    }
    for (const [width, height] of [[1024, 768], [1440, 900]]) {
      browser('set', 'viewport', String(width), String(height));
      const result = browser('eval', `(${checkLayout.toString()})()`);
      console.log(`${language} ${width}×${height}: ${result.trim()}`);
    }
  }
} finally {
  browser('close');
}
