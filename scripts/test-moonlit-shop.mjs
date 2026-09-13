import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'moonlit-shop-test', ...args], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});
const evaluate = expression => JSON.parse(browser('eval', expression));
const cases = [
  ['trail-shop-1', 2, 1440, 900, 4],
  ['trail-shop-6', 17, 1024, 768, 6],
  ['trail-shop-7', 20, 1024, 768, 6],
  ['trail-shop-11', 32, 390, 844, 8],
  ['trail-shop-12', 35, 390, 844, 8],
];

const route = (level, stage) => `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'listening-shop', level, stage,
  profile: `moonlit-layout-${level}`, profileName: 'Moonlit', profileEmoji: '🌸',
  profileCharacter: 'princess', profileLanguage: 'en',
})}`;

const inspect = (expectedChoices) => evaluate(`(() => {
  const contains = (outer, inner) => inner.left >= outer.left - 1
    && inner.right <= outer.right + 1 && inner.top >= outer.top - 1
    && inner.bottom <= outer.bottom + 1;
  const screen = document.querySelector('#shop-screen');
  const game = document.querySelector('#shop-game-area');
  const scene = document.querySelector('.shop-scene-art');
  const customer = document.querySelector('.shop-customer-art');
  const prompt = document.querySelector('#shop-order-prompt');
  const shelves = document.querySelector('#shop-shelves');
  const tiles = [...document.querySelectorAll('.shop-item-tile')];
  const controls = [
    document.querySelector('#shop-level-list-btn'),
    document.querySelector('#shop-order-replay-btn'),
    document.querySelector('#shop-translation-hint'),
  ];
  for (const selector of ['#shop-screen', '#shop-game-area', '.shop-scene-art', '.shop-customer-art', '#shop-order-prompt', '#shop-shelves']) {
    if (!document.querySelector(selector)) throw new Error('Missing ' + selector);
  }
  const imageLoaded = element => {
    const image = element.matches('img') ? element : element.querySelector('img');
    if (image) return image.complete && image.naturalWidth > 0;
    const style = getComputedStyle(element);
    return element.textContent.trim().length > 0
      || style.backgroundImage !== 'none'
      || style.backgroundColor !== 'rgba(0, 0, 0, 0)';
  };
  const screenRect = screen.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();
  const customerRect = customer.getBoundingClientRect();
  const promptRect = prompt.getBoundingClientRect();
  const shelvesRect = shelves.getBoundingClientRect();
  return {
    viewport: [innerWidth, innerHeight],
    screen: [screenRect.left, screenRect.top, screenRect.right, screenRect.bottom],
    game: [gameRect.left, gameRect.top, gameRect.right, gameRect.bottom],
    scene: [sceneRect.left, sceneRect.top, sceneRect.right, sceneRect.bottom],
    customer: [customerRect.left, customerRect.top, customerRect.right, customerRect.bottom],
    prompt: [promptRect.left, promptRect.top, promptRect.right, promptRect.bottom],
    choices: tiles.length,
    products: tiles.map(tile => ({
      bounds: [...Object.values(tile.getBoundingClientRect().toJSON())],
      art: imageLoaded(tile.querySelector('.shop-item-art')),
      inShelves: contains(shelvesRect, tile.getBoundingClientRect()),
      touchSize: tile.getBoundingClientRect().width >= 44 && tile.getBoundingClientRect().height >= 44,
    })),
    sceneLoaded: imageLoaded(scene),
    customerLoaded: imageLoaded(customer),
    legacyReplayRemoved: !document.querySelector('#shop-replay-btn'),
    controls: controls.map(control => ({
      visible: !control.hidden,
      touchSize: control.getBoundingClientRect().width >= 44 && control.getBoundingClientRect().height >= 44,
    })),
    inViewport: [customerRect, promptRect].every(rect => contains({ left: 0, top: 0, right: innerWidth, bottom: innerHeight }, rect)),
    fullScreen: [screenRect, gameRect, sceneRect].every(rect => rect.left <= 1 && rect.top <= 1
      && rect.right >= innerWidth - 1 && rect.bottom >= innerHeight - 1),
  };
})()`);

try {
  for (const [level, stage, width, height, expectedChoices] of cases) {
    browser('set', 'viewport', String(width), String(height));
    browser('open', route(level, stage));
    browser('wait', '.shop-item-tile');
    const result = inspect(expectedChoices);
    assert.equal(result.choices, expectedChoices, `${level}: expected ${expectedChoices} live choices`);
    assert.equal(result.fullScreen, true, `${level} ${width}×${height}: Shop scene must cover viewport`);
    assert.equal(result.sceneLoaded, true, `${level}: moonlit scene art must load`);
    assert.equal(result.customerLoaded, true, `${level}: customer art must render`);
    assert.equal(result.legacyReplayRemoved, true, `${level}: redundant replay control must be removed`);
    assert.equal(result.inViewport, true, `${level}: customer and prompt must stay in viewport`);
    assert.ok(result.products.every(product => product.art), `${level}: every product needs loaded art`);
    assert.ok(result.products.every(product => product.inShelves), `${level}: product clips outside shelf`);
    assert.ok(result.products.every(product => product.touchSize), `${level}: product is smaller than 44px`);
    assert.ok(result.controls.every(control => control.visible && control.touchSize), `${level}: control is hidden or smaller than 44px`);
    console.log(`PASS: ${level} ${width}×${height} (${expectedChoices} choices)`);
  }
  console.log('PASS: moonlit Shop fills all required viewports and keeps live choices, art, prompts, and controls usable.');
} finally {
  browser('close');
}
