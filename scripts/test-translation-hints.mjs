import assert from 'node:assert/strict';
import { VOCAB_WORDS } from '../src/words.ts';
import {
  MAGIC_HOUSE_OBJECTS,
  MAGIC_HOUSE_REQUESTS,
} from '../prototype/shared/magic-house-content.mjs';
import { MAGIC_HOUSE_ZONES } from '../prototype/shared/magic-house-room.mjs';

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
  assert.deepEqual(
    Object.keys(request.en.translations).sort(),
    [...request.en.keywords].sort(),
    `${request.id} must translate every highlighted English term exactly once`,
  );
  for (const translation of Object.values(request.en.translations)) {
    assert.ok(translation.trim(), `${request.id} contains an empty Hebrew translation hint`);
  }
}

console.log(`Validated Hebrew translation hints for ${VOCAB_WORDS.length} vocabulary words, ${MAGIC_HOUSE_OBJECTS.length} Magic House objects, ${MAGIC_HOUSE_ZONES.length} destinations, and ${MAGIC_HOUSE_REQUESTS.length} requests.`);
