// Run after npm run build, with scripts/serve-save-test.mjs running locally.
// Stages are measured from real rendered bounds, so the check fails on any
// viewport where touch targets shrink or the trail markers collide.
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'world-map-layout-test', ...args], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const checkLayout = async () => {
  await document.fonts.ready;
  const nodes = [...document.querySelectorAll('.world-stage')];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  check(nodes.length > 0, 'No stages rendered');
  const rects = nodes.map((node) => ({ id: node.dataset.stage, rect: node.getBoundingClientRect() }));
  for (const { id, rect } of rects) {
    check(rect.width >= 44 && rect.height >= 44, `Stage ${id} is not touch-sized (${rect.width}×${rect.height})`);
  }
  const overlaps = (a, b) => Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
    && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      check(!overlaps(rects[i].rect, rects[j].rect), `Stages ${rects[i].id} and ${rects[j].id} overlap`);
    }
  }
  return `PASS: ${rects.length} stages are ≥44px and never overlap.`;
};

try {
  browser('open', 'http://127.0.0.1:8788/prototype/world-map.html');
  browser('eval', "(() => { const card = document.querySelector('.gate-profile-choice'); if (card) card.click(); return true; })()");
  browser('wait', '.world-stage');
  for (const [width, height] of [[390, 844], [820, 1180], [1024, 768], [1440, 900]]) {
    browser('set', 'viewport', String(width), String(height));
    const result = browser('eval', `(${checkLayout.toString()})()`);
    console.log(`${width}×${height}: ${result.trim()}`);
  }
} finally {
  browser('close');
}
