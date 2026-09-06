import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const magicHouseSource = await readFile(new URL('../prototype/magic-house.js', import.meta.url), 'utf8');

assert.doesNotMatch(
  magicHouseSource,
  /`\$\{zone\.labels\.en\}\s+—\s+\$\{zone\.labels\.he\}`/,
  'English destination names must not duplicate the Hebrew aria-describedby text',
);
assert.match(
  magicHouseSource,
  /profile\.primary === 'en'\s*\? zone\.labels\.en\s*:\s*zone\.labels\.he/,
  'Destination aria-labels must use only the active learning language',
);
assert.match(
  magicHouseSource,
  /button\.setAttribute\('aria-describedby', supportingLabel\.id\)/,
  'English destinations must expose the Hebrew translation exactly once as a description',
);

console.log(JSON.stringify({ englishNameOnly: true, hebrewDescriptionOnce: true }));
