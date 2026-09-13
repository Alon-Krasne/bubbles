import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'shop-art-test', ...args], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});
const evaluate = expression => JSON.parse(browser('eval', expression));
const route = `http://127.0.0.1:8788/index.html?${new URLSearchParams({
  host: 'world-map', activity: 'listening-shop', level: 'trail-shop-12', stage: '35',
  profile: 'shop-art-test', profileName: 'Art', profileEmoji: '🌸',
  profileCharacter: 'princess', profileLanguage: 'en',
})}`;

try {
  browser('set', 'viewport', '844', '390');
  browser('open', route);
  browser('wait', '.shop-item-tile');
  const result = evaluate(`(async () => {
    const urls = [
      '/prototype/assets/shop/moonlit-shop.webp',
      '/prototype/assets/shop/customers.webp',
      ...Array.from({ length: 5 }, (_, index) => '/prototype/assets/shop/products-' + (index + 1) + '.webp'),
    ];
    const images = await Promise.all(urls.map(url => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to decode ' + url));
      image.src = url;
    })));
    const alphaAtCorner = image => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, 1, 1).data[3];
    };
    const tiles = [...document.querySelectorAll('.shop-item-tile')];
    return {
      dimensions: images.map(image => [image.naturalWidth, image.naturalHeight]),
      transparentCorners: images.slice(1).map(alphaAtCorner),
      englishLabels: tiles.map(tile => ({
        visibleText: tile.querySelector('.shop-item-english-label')?.textContent?.trim() ?? '',
        accessibleText: tile.getAttribute('aria-label'),
        contained: (() => {
          const label = tile.querySelector('.shop-item-english-label');
          const illustration = tile.querySelector('.shop-item-illustration');
          if (!label || !illustration) return false;
          const tileRect = tile.getBoundingClientRect();
          const labelRect = label.getBoundingClientRect();
          const illustrationRect = illustration.getBoundingClientRect();
          return labelRect.width > 0 && labelRect.height > 0
            && labelRect.left >= tileRect.left - 1 && labelRect.right <= tileRect.right + 1
            && labelRect.top >= illustrationRect.bottom - 1 && labelRect.bottom <= tileRect.bottom + 1
            && label.scrollWidth <= label.clientWidth + 1;
        })(),
      })),
      tileSizes: tiles.map(tile => {
        const rect = tile.getBoundingClientRect();
        return [rect.width, rect.height];
      }),
    };
  })()`);
  assert.deepEqual(result.dimensions[0], [1586, 992], 'Moonlit scene must decode at its authored size');
  assert.deepEqual(result.dimensions[1], [1774, 887], 'Customer atlas must decode at its authored size');
  assert.ok(result.dimensions.slice(2).every(([width, height]) => width === 1254 && height === 1254), 'Every product atlas must decode at its authored size');
  assert.ok(result.transparentCorners.every(alpha => alpha === 0), 'Customer and product atlases need genuine transparent backgrounds');
  assert.ok(result.englishLabels.every(({ visibleText, accessibleText }) => visibleText === accessibleText), 'Every English product needs its matching visible word');
  assert.ok(result.englishLabels.every(({ contained }) => contained), 'English product labels must sit below the artwork without clipping or overflow');
  assert.ok(result.tileSizes.every(([width, height]) => width >= 44 && height >= 44), 'Short-landscape product choices must remain 44px touch targets');
  console.log('PASS: Shop art decodes with transparent sprite backgrounds and 44px short-landscape choices.');
} finally {
  browser('close');
}
