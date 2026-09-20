// Regression: "orange" (the fruit) shares its id with the colour prefix used by
// "orange-book" / "orange-heart". Product art must be chosen by the full id shape,
// never by the colour prefix alone.
import assert from 'node:assert/strict';

globalThis.document = {
  createElement() {
    const classes = [];
    return {
      className: '',
      textContent: '',
      style: { properties: {}, setProperty(name, value) { this.properties[name] = value; } },
      classList: { add(...names) { classes.push(...names); }, contains: name => classes.includes(name) },
      setAttribute() {},
    };
  },
};

const { createShopItemArt, SHOP_ART_IDS } = await import('../src/shop-art.ts');

const orange = createShopItemArt('orange');
assert.equal(orange.classList.contains('shop-colored-item'), false, 'orange must render the fruit sprite, not a colour swatch');
assert.ok(orange.style.backgroundImage.includes('products-'), 'orange must point at a product atlas');

const orangeBook = createShopItemArt('orange-book');
assert.ok(orangeBook.classList.contains('shop-colored-item') && orangeBook.classList.contains('shop-colored-book'), 'orange-book stays a coloured book');
assert.equal(orangeBook.style.properties['--item-color'], '#f59a3d');

const orangeHeart = createShopItemArt('orange-heart');
assert.ok(orangeHeart.classList.contains('shop-colored-heart'));
assert.equal(orangeHeart.textContent, '♥');

for (const id of SHOP_ART_IDS) {
  assert.equal(createShopItemArt(id).classList.contains('shop-colored-item'), false, `${id} is a sprite product`);
}

assert.throws(() => createShopItemArt('no-such-thing-here'), /Missing Shop artwork/);

console.log(`PASS: bare product ids (${SHOP_ART_IDS.length}) render sprites; colour-shape ids render swatches.`);
