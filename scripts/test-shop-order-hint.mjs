// Run npm run build, then scripts/serve-save-test.mjs in a separate terminal.
// Exercises real hosted Shop UI against the isolated local save service.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'shop-order-test', ...args], {
  encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
});
const evaluate = expression => JSON.parse(browser('eval', expression));
const runId = `${process.pid}-${Date.now()}`;
const route = language => `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'listening-shop', level: 'trail-shop-1', stage: '2',
  profile: `order-test-${language}-${runId}`, profileName: 'Test', profileEmoji: '🌸',
  profileCharacter: 'princess', profileLanguage: language,
})}`;
const promptText = () => evaluate('document.querySelector("#shop-order-prompt").firstChild.textContent');
const opacity = value => browser('wait', '--fn',
  `getComputedStyle(document.querySelector('#shop-order-prompt .hebrew-translation-hint')).opacity === '${value}'`);

try {
  browser('open', route('en'));
  browser('wait', '.shop-item-tile');
  const sentence = promptText();
  assert.match(sentence, /^(Can I have|I want|I would like|Do you have) .+[?!.]$/, 'Show the spoken English request, not the Hebrew placeholder');
  assert.equal(evaluate('document.querySelector("#shop-order-prompt").dir'), 'ltr');
  assert.equal(evaluate('document.querySelector("#shop-order-prompt").lang'), 'en');
  browser('hover', '#shop-order-prompt');
  opacity(0);
  browser('click', '#shop-translation-hint');
  browser('hover', '#shop-order-prompt');
  opacity(1);
  assert.match(evaluate('document.querySelector("#shop-order-prompt .hebrew-translation-hint").textContent'), /אפשר בבקשה .+\?/);
  for (const [width, height] of [[1440, 900], [1024, 768], [390, 844]]) {
    browser('set', 'viewport', String(width), String(height));
    browser('hover', '#shop-order-prompt');
    opacity(1);
    assert.equal(evaluate(`(() => {
      const prompt = document.querySelector('#shop-order-prompt');
      const rect = prompt.getBoundingClientRect();
      const tip = prompt.querySelector('.hebrew-translation-hint').getBoundingClientRect();
      return prompt.scrollWidth <= prompt.clientWidth + 1 && rect.left >= 0 && rect.right <= innerWidth
        && tip.left >= 0 && tip.right <= innerWidth && tip.top >= 0 && tip.bottom <= innerHeight;
    })()`), true, `${width}×${height}: English request and Hebrew tip fit the screen`);
  }
  browser('click', '#shop-translation-hint');
  browser('hover', '#shop-order-prompt');
  opacity(0);
  browser('click', '#shop-translation-hint');
  browser('press', 'Tab');
  browser('press', 'Tab');
  // Focus the text itself through its native keyboard affordance.
  evaluate('document.querySelector("#shop-order-prompt").focus(); true');
  opacity(1);
  const target = evaluate(`JSON.stringify([...document.querySelectorAll('.shop-item-tile')]
    .find(tile => ${JSON.stringify(sentence)}.includes(tile.getAttribute('aria-label'))).dataset.itemId)`);
  const before = evaluate('document.querySelector("#shop-served-progress").textContent');
  browser('click', `[data-item-id=${target}]`);
  browser('wait', '--fn', `document.querySelector('#shop-served-progress').textContent !== ${JSON.stringify(before)} && document.querySelector('#shop-translation-hint').getAttribute('aria-pressed') === 'false'`);
  assert.match(promptText(), /^(Can I have|I want|I would like|Do you have) /);
  assert.equal(evaluate('document.querySelectorAll("#shop-order-prompt .hebrew-translation-hint").length'), 1);
  browser('hover', '#shop-order-prompt');
  opacity(0);
  browser('open', route('he'));
  browser('wait', '.shop-item-tile');
  assert.match(promptText(), /^אפשר בבקשה /);
  assert.equal(evaluate('document.querySelector("#shop-order-prompt").dir'), 'rtl');
  assert.equal(evaluate('document.querySelector("#shop-order-prompt").lang'), 'he');
  assert.equal(evaluate('document.querySelector("#shop-translation-hint").hidden'), true);
  assert.equal(evaluate('document.querySelectorAll("#shop-order-prompt .hebrew-translation-hint").length'), 0);
  assert.equal(evaluate('document.querySelectorAll(".shop-item-english-label").length'), 0);
  console.log('PASS: English order, opt-in Hebrew hover/focus, responsive layout, next-customer reset, and unchanged Hebrew mode.');
} finally {
  browser('close');
}
