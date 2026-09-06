import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyEnglishLearningTranslationHint } from '../prototype/shared/translation-hint.mjs';

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
  }

  append(child) {
    this.children.push(child);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

globalThis.document = {
  createElement: () => new FakeElement(),
};

const translatedItem = new FakeElement();
applyEnglishLearningTranslationHint(translatedItem, 'en', 'מיטה');
const visualHint = translatedItem.children[0];
assert.equal(
  visualHint.attributes.get('aria-hidden'),
  'true',
  'Visual tooltip text must stay out of parent live-region and accessible-name content',
);
assert.equal(
  translatedItem.attributes.get('aria-describedby'),
  visualHint.id,
  'Focused learning items must still reference the Hebrew tooltip description',
);

const magicHouseStyles = await readFile(new URL('../prototype/magic-house.css', import.meta.url), 'utf8');
assert.match(
  magicHouseStyles,
  /\.drop-zone\[data-hebrew-translation\]:hover\s+\.drop-zone-label/,
  'Destination hover labels must be restricted to translated English-learning zones',
);
assert.match(
  magicHouseStyles,
  /\.drop-zone\[data-hebrew-translation\]:focus-visible\s+\.drop-zone-label/,
  'Destination focus labels must be restricted to translated English-learning zones',
);

console.log(JSON.stringify({ liveRegionSafe: true, englishDestinationsOnly: true }));
