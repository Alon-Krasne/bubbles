// Magic Brush Painter took six trail slots. Level ids are numbered by each game's
// appearance order, so these ids now point at different content (or no longer exist).
// Saves keyed by them are cleared once, by owner decision. Reveal keeps no live
// per-level saves; route stars are keyed by stage and stay in place.
export const RENUMBERED_LEVEL_IDS = Object.freeze([
  'trail-memory-2', 'trail-memory-3', 'trail-memory-4', 'trail-memory-5',
  'trail-memory-6', 'trail-memory-7', 'trail-memory-8', 'trail-memory-9',
  'trail-shop-5', 'trail-shop-6', 'trail-shop-7', 'trail-shop-8', 'trail-shop-9',
  'trail-house-6', 'trail-house-7', 'trail-house-8', 'trail-house-9',
]);

// Local-only saves are reset once per browser; cloud saves once per account, so a
// second device neither keeps stale local decks nor wipes progress made since.
export const LOCAL_RESET_MARKER_KEY = 'bubble_painter_level_renumber_reset_v1';
export const CLOUD_RESET_MARKER_KEY = 'painter-level-renumber-reset-v1';

// Stores shaped { profileId: { levelId: value } }
const LOCAL_LEVEL_MAPS = Object.freeze(['bubble_memory_word_decks_v1', 'bubble_memory_garden_levels']);
const CLOUD_LEVEL_MAP_SUFFIXES = Object.freeze([
  '-bubble_shop_word_decks_v1',
  '-bubble_shop_levels',
  '-bubble_shop_sessions_v1',
]);
const HOUSE_VARIATION_PREFIX = 'magic-house-previous-requests-v1:';

const renumbered = new Set(RENUMBERED_LEVEL_IDS);

function removeRenumberedLevels(storage, key) {
  const stored = storage.getItem(key);
  if (stored === null) return;
  const byProfile = JSON.parse(stored);
  for (const levels of Object.values(byProfile)) {
    for (const levelId of Object.keys(levels)) {
      if (renumbered.has(levelId)) delete levels[levelId];
    }
  }
  storage.setItem(key, JSON.stringify(byProfile));
}

function clearLocal(local) {
  if (local.getItem(LOCAL_RESET_MARKER_KEY) !== null) return;
  LOCAL_LEVEL_MAPS.forEach(key => removeRenumberedLevels(local, key));
  const keys = Array.from({ length: local.length }, (_, index) => local.key(index));
  for (const key of keys) {
    if (key.startsWith(HOUSE_VARIATION_PREFIX) && renumbered.has(key.split(':').at(-1))) {
      local.removeItem(key);
    }
  }
  local.setItem(LOCAL_RESET_MARKER_KEY, new Date().toISOString());
}

function clearCloud(cloud) {
  if (cloud.getItem(CLOUD_RESET_MARKER_KEY) !== null) return;
  for (const key of cloud.keys()) {
    if (CLOUD_LEVEL_MAP_SUFFIXES.some(suffix => key.endsWith(suffix))) removeRenumberedLevels(cloud, key);
  }
  cloud.setItem(CLOUD_RESET_MARKER_KEY, new Date().toISOString());
}

export function clearRenumberedLevelSaves({ local, cloud }) {
  clearLocal(local);
  clearCloud(cloud);
}
