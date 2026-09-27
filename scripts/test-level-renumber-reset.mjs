import assert from 'node:assert/strict';
import {
  RENUMBERED_LEVEL_IDS,
  LOCAL_RESET_MARKER_KEY,
  CLOUD_RESET_MARKER_KEY,
  clearRenumberedLevelSaves,
} from '../prototype/shared/level-renumber-reset.mjs';
import { GAME_LEVELS } from '../prototype/shared/trail-catalog.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

// Browser-like localStorage (length/key/getItem/setItem/removeItem)
function createLocal(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    get length() { return map.size; },
    key: index => [...map.keys()][index] ?? null,
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, String(value)); },
    removeItem: key => { map.delete(key); },
    dump: () => Object.fromEntries(map),
  };
}

// Save-client-like cloud storage (getItem/setItem/removeItem/keys)
function createCloud(entries = {}) {
  const map = new Map(Object.entries(entries));
  return {
    keys: () => [...map.keys()],
    getItem: key => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); },
    removeItem: key => { map.delete(key); },
    dump: () => Object.fromEntries(map),
  };
}

const json = value => JSON.stringify(value);
const read = (store, key) => JSON.parse(store.getItem(key));

// Level ids whose content changed or disappeared when six painter stages took trail slots.
assert.deepEqual([...RENUMBERED_LEVEL_IDS].sort(), [
  'trail-house-6', 'trail-house-7', 'trail-house-8', 'trail-house-9',
  'trail-memory-2', 'trail-memory-3', 'trail-memory-4', 'trail-memory-5',
  'trail-memory-6', 'trail-memory-7', 'trail-memory-8', 'trail-memory-9',
  'trail-shop-5', 'trail-shop-6', 'trail-shop-7', 'trail-shop-8', 'trail-shop-9',
].sort());

// Stale deck saved on the previous trail: a word the current pool no longer has.
const memory3 = GAME_LEVELS.memory.find(level => level.id === 'trail-memory-3');
const staleDeck = { remaining: ['not-in-current-pool'], previous: [] };
assert.throws(
  () => drawVocabularyRound({ pool: memory3.wordPool, count: memory3.pairs, state: staleDeck }),
  /Invalid vocabulary deck state/,
  'precondition: a stale deck crashes the renumbered Memory level',
);

const keptDeck = { remaining: ['kept'], previous: [] };
const local = createLocal({
  bubble_memory_word_decks_v1: json({
    lotem: { 'trail-memory-1': keptDeck, 'trail-memory-3': staleDeck, 'trail-memory-9': staleDeck },
    tom: { 'trail-memory-2': staleDeck },
  }),
  bubble_memory_garden_levels: json({ lotem: { 'trail-memory-1': 3, 'trail-memory-5': 2 } }),
  'magic-house-previous-requests-v1:lotem:trail-house-5': json(['kept-request']),
  'magic-house-previous-requests-v1:lotem:trail-house-7': json(['stale-request']),
  unrelated_local_key: 'untouched',
});
const cloud = createCloud({
  'lotem-bubble_shop_word_decks_v1': json({ lotem: { 'trail-shop-4': keptDeck, 'trail-shop-7': staleDeck } }),
  'lotem-bubble_shop_levels': json({ lotem: { 'trail-shop-1': 3, 'trail-shop-9': 1 } }),
  'lotem-bubble_shop_sessions_v1': json({ lotem: { 'trail-shop-5': { servedCustomers: 2 } } }),
  'forest-tom-he-bubble_shop_word_decks_v1': json({ tom: { 'trail-shop-8': staleDeck } }),
  'route-lotem': json({ currentStage: 12, progress: { 5: 3 } }),
  'lotem-bubble_shop_coins': json({ lotem: 40 }),
});

clearRenumberedLevelSaves({ local, cloud });

assert.deepEqual(read(local, 'bubble_memory_word_decks_v1'), { lotem: { 'trail-memory-1': keptDeck }, tom: {} });
assert.deepEqual(read(local, 'bubble_memory_garden_levels'), { lotem: { 'trail-memory-1': 3 } });
assert.equal(local.getItem('magic-house-previous-requests-v1:lotem:trail-house-7'), null);
assert.equal(local.getItem('magic-house-previous-requests-v1:lotem:trail-house-5'), json(['kept-request']));
assert.equal(local.getItem('unrelated_local_key'), 'untouched');

assert.deepEqual(read(cloud, 'lotem-bubble_shop_word_decks_v1'), { lotem: { 'trail-shop-4': keptDeck } });
assert.deepEqual(read(cloud, 'lotem-bubble_shop_levels'), { lotem: { 'trail-shop-1': 3 } });
assert.deepEqual(read(cloud, 'lotem-bubble_shop_sessions_v1'), { lotem: {} });
assert.deepEqual(read(cloud, 'forest-tom-he-bubble_shop_word_decks_v1'), { tom: {} });
assert.equal(cloud.getItem('route-lotem'), json({ currentStage: 12, progress: { 5: 3 } }), 'route stars are not level saves');
assert.equal(cloud.getItem('lotem-bubble_shop_coins'), json({ lotem: 40 }));

assert.ok(local.getItem(LOCAL_RESET_MARKER_KEY));
assert.ok(cloud.getItem(CLOUD_RESET_MARKER_KEY));

// After the reset the renumbered Memory level draws normally again.
const cleared = read(local, 'bubble_memory_word_decks_v1').lotem['trail-memory-3'] ?? null;
drawVocabularyRound({ pool: memory3.wordPool, count: memory3.pairs, state: cleared });

// Runs once: progress saved after the reset survives later loads.
const freshDeck = drawVocabularyRound({ pool: memory3.wordPool, count: memory3.pairs, state: null }).state;
local.setItem('bubble_memory_word_decks_v1', json({ lotem: { 'trail-memory-3': freshDeck } }));
cloud.setItem('lotem-bubble_shop_levels', json({ lotem: { 'trail-shop-9': 2 } }));
const localBefore = local.dump();
const cloudBefore = cloud.dump();
clearRenumberedLevelSaves({ local, cloud });
assert.deepEqual(local.dump(), localBefore);
assert.deepEqual(cloud.dump(), cloudBefore);

// A second device: the cloud was already reset elsewhere (and has fresh shop progress),
// but this browser still holds its own stale Memory deck.
const secondLocal = createLocal({
  bubble_memory_word_decks_v1: json({ lotem: { 'trail-memory-3': staleDeck } }),
});
const sharedCloud = createCloud({
  [CLOUD_RESET_MARKER_KEY]: cloud.getItem(CLOUD_RESET_MARKER_KEY),
  'lotem-bubble_shop_levels': json({ lotem: { 'trail-shop-9': 2 } }),
});
clearRenumberedLevelSaves({ local: secondLocal, cloud: sharedCloud });
assert.deepEqual(read(secondLocal, 'bubble_memory_word_decks_v1'), { lotem: {} });
assert.deepEqual(read(sharedCloud, 'lotem-bubble_shop_levels'), { lotem: { 'trail-shop-9': 2 } });

console.log('Renumbered level saves are cleared once per browser and once per cloud save.');
