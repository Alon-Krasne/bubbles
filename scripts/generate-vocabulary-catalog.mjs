// Generates prototype/shared/vocabulary-catalog.mjs from the app's vocabulary
// source of truth (src/words.ts). The catalog is a compact, runtime-friendly
// mirror used by the trail generator and validation. Run:
//   node --experimental-strip-types scripts/generate-vocabulary-catalog.mjs
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { VOCAB_WORDS } from '../src/words.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, '../prototype/shared/vocabulary-catalog.mjs');

export function buildCatalogEntries(words = VOCAB_WORDS) {
  const seen = new Set();
  return words.map((word) => {
    if (!word || typeof word.id !== 'string' || !word.id) {
      throw new Error('Every vocabulary word needs an id');
    }
    if (seen.has(word.id)) {
      throw new Error(`Duplicate vocabulary id ${word.id}`);
    }
    seen.add(word.id);
    return {
      id: word.id,
      category: word.category,
      shoppable: Boolean(word.shoppable),
    };
  });
}

export function renderCatalogModule(entries) {
  const body = entries
    .map((entry) => `  Object.freeze({ id: ${JSON.stringify(entry.id)}, category: ${JSON.stringify(entry.category)}, shoppable: ${entry.shoppable} }),`)
    .join('\n');
  return `// AUTO-GENERATED FILE. Do not edit by hand.
// Source: src/words.ts
// Regenerate: node --experimental-strip-types scripts/generate-vocabulary-catalog.mjs
export const VOCABULARY = Object.freeze([
${body}
]);
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const entries = buildCatalogEntries();
  writeFileSync(outputPath, renderCatalogModule(entries));
  console.log(`Wrote ${entries.length} vocabulary entries to ${outputPath}`);
}
