import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { VOCAB_WORDS } from '../src/words.ts';
import {
  MAGIC_HOUSE_OBJECTS,
  MAGIC_HOUSE_REQUESTS,
} from '../prototype/shared/magic-house-content.mjs';
import { MAGIC_HOUSE_ZONES } from '../prototype/shared/magic-house-room.mjs';
import {
  applyEnglishLearningTranslationHint,
  keepHebrewTranslationFocusable,
  removeHebrewTranslationHint,
} from '../prototype/shared/translation-hint.mjs';

class FakeElement {
  constructor() {
    this.attributes = new Map();
    this.children = [];
    this.dataset = {};
    this.parent = null;
    this.tabIndex = -1;
  }

  append(child) {
    child.parent = this;
    this.children.push(child);
  }

  hasAttribute(name) {
    return name === 'data-hebrew-translation'
      ? this.dataset.hebrewTranslation !== undefined
      : this.attributes.has(name);
  }

  querySelector(selector) {
    if (selector !== ':scope > .hebrew-translation-hint') {
      return null;
    }
    return this.children.find((child) => child.className === 'hebrew-translation-hint') ?? null;
  }

  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((child) => child !== this);
    }
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
}

globalThis.document = {
  createElement: () => new FakeElement(),
};

const englishItem = new FakeElement();
assert.equal(applyEnglishLearningTranslationHint(englishItem, 'en', 'תפוח'), true);
assert.equal(englishItem.dataset.hebrewTranslation, 'תפוח');
assert.equal(englishItem.children[0].attributes.get('role'), 'tooltip');
assert.equal(englishItem.children[0].attributes.get('aria-hidden'), 'true');
assert.equal(englishItem.children[0].lang, 'he');
assert.equal(englishItem.children[0].dir, 'rtl');
assert.equal(englishItem.attributes.get('aria-describedby'), englishItem.children[0].id);

const hebrewItem = new FakeElement();
assert.equal(applyEnglishLearningTranslationHint(hebrewItem, 'he', 'apple'), false);
assert.equal(hebrewItem.children.length, 0, 'Hebrew-learning items must not receive translation affordances');

keepHebrewTranslationFocusable(englishItem);
assert.equal(englishItem.tabIndex, 0, 'Matched translated cards must remain keyboard-focusable');
assert.equal(englishItem.attributes.get('role'), 'group');

const untranslatedItem = new FakeElement();
untranslatedItem.setAttribute('tabindex', '0');
keepHebrewTranslationFocusable(untranslatedItem);
assert.equal(untranslatedItem.attributes.has('tabindex'), false, 'Matched untranslated cards leave the tab order');

removeHebrewTranslationHint(englishItem);
assert.equal(englishItem.children.length, 0, 'Closing a Memory card must remove its translation hint');
assert.equal(englishItem.dataset.hebrewTranslation, undefined);
assert.equal(englishItem.attributes.has('aria-describedby'), false);

for (const word of VOCAB_WORDS) {
  assert.ok(word.english.trim(), `${word.id} needs an English label`);
  assert.ok(word.hebrew.trim(), `${word.id} needs a Hebrew translation hint`);
}

for (const object of MAGIC_HOUSE_OBJECTS) {
  assert.ok(object.labels.en.trim(), `${object.id} needs an English label`);
  assert.ok(object.labels.he.trim(), `${object.id} needs a Hebrew translation hint`);
}

for (const zone of MAGIC_HOUSE_ZONES) {
  assert.ok(zone.labels.en.trim(), `${zone.id} needs an English label`);
  assert.ok(zone.labels.he.trim(), `${zone.id} needs a Hebrew translation hint`);
}

for (const request of MAGIC_HOUSE_REQUESTS) {
  for (const [english, translation] of Object.entries(request.en.translations)) {
    assert.ok(request.en.sentence.toLocaleLowerCase().includes(english), `${request.id} must use ${english}`);
    assert.ok(translation.trim(), `${request.id} contains an empty Hebrew translation hint`);
  }
}

const [memorySource, shopSource, magicHouseSource, mainStyles, magicHouseStyles, translationHintStyles] = await Promise.all([
  readFile(new URL('../src/main.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/shop.ts', import.meta.url), 'utf8'),
  readFile(new URL('../prototype/magic-house.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../prototype/magic-house.css', import.meta.url), 'utf8'),
  readFile(new URL('../prototype/shared/translation-hint.css', import.meta.url), 'utf8'),
]);

assert.match(memorySource, /applyEnglishLearningTranslationHint\(cardButton,/);
assert.match(memorySource, /removeHebrewTranslationHint\(firstCard\)/);
assert.match(memorySource, /keepHebrewTranslationFocusable\(firstCard\)/);
assert.match(shopSource, /applyEnglishLearningTranslationHint\(tile,/);
assert.match(magicHouseSource, /applyEnglishLearningTranslationHint\(button,/);
assert.match(magicHouseSource, /applyEnglishLearningTranslationHint\(term,/);
assert.match(magicHouseSource, /button\.dataset\.hebrewTranslation = zone\.labels\.he/);
assert.doesNotMatch(magicHouseSource, /`\$\{zone\.labels\.en\}\s+—\s+\$\{zone\.labels\.he\}`/);
assert.match(magicHouseSource, /profile\.primary === 'en'\s*\? zone\.labels\.en\s*:\s*zone\.labels\.he/);
assert.match(magicHouseSource, /button\.setAttribute\('aria-describedby', supportingLabel\.id\)/);

assert.match(translationHintStyles, /\.hebrew-translation-hint[\s\S]*?pointer-events:\s*none/);
assert.ok(mainStyles.includes("@import '../prototype/shared/translation-hint.css'"));
assert.ok(magicHouseStyles.includes("@import './shared/translation-hint.css'"));
assert.match(translationHintStyles, /\[data-hebrew-translation\]:hover\s*>\s*\.hebrew-translation-hint/);
assert.match(translationHintStyles, /\[data-hebrew-translation\]:focus-visible\s*>\s*\.hebrew-translation-hint/);
assert.match(magicHouseStyles, /\.drop-zone\[data-hebrew-translation\]:hover\s+\.drop-zone-label/);
assert.match(magicHouseStyles, /\.drop-zone\[data-hebrew-translation\]:focus-visible\s+\.drop-zone-label/);

console.log(`Validated Hebrew translation behavior and catalog coverage for ${VOCAB_WORDS.length} vocabulary words, ${MAGIC_HOUSE_OBJECTS.length} Magic House objects, ${MAGIC_HOUSE_ZONES.length} destinations, and ${MAGIC_HOUSE_REQUESTS.length} requests.`);
