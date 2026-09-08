import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { configureTranslationHintButton } from '../prototype/shared/translation-hint-control.mjs';

const classes = new Set();
const root = { classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } } };
const button = { ownerDocument: { documentElement: root }, attributes: {}, setAttribute(k, v) { this.attributes[k] = v; } };
configureTranslationHintButton(button, 'en');
assert.equal(button.hidden, false);
assert.equal(button.attributes['aria-pressed'], 'false');
assert.equal(classes.has('translation-help-enabled'), false, 'translations start disabled');
button.onclick();
assert.equal(classes.has('translation-help-enabled'), true, 'explicit hint click enables translation');
assert.equal(button.attributes['aria-pressed'], 'true');
button.onclick();
assert.equal(classes.has('translation-help-enabled'), false, 'second click hides translation');
button.onclick();
configureTranslationHintButton(button, 'en');
assert.equal(classes.has('translation-help-enabled'), false, 'a new question resets hint help');
configureTranslationHintButton(button, 'he');
assert.equal(button.hidden, true, 'Hebrew mode has no translation button');

const [html, magicHouseCss] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../prototype/magic-house.css', import.meta.url), 'utf8'),
]);
assert.match(html, /id="memory-translation-hint"/);
assert.match(html, /id="shop-translation-hint"/);
assert.match(await readFile(new URL('../prototype/magic-house.html', import.meta.url), 'utf8'), /id="house-translation-hint"/);
assert.match(magicHouseCss, /\.drop-zone-label small \{\s*display: none;/);
assert.match(magicHouseCss, /\.translation-help-enabled \.drop-zone-label small \{\s*display: block;/);
console.log('PASS: translation help requires a hint click, toggles off, resets for each question, and stays hidden in Hebrew mode.');
