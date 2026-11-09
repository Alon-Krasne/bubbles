import { VOCABULARY } from '../prototype/shared/vocabulary-catalog.mjs';

export interface StoredShopOrder {
  sentence: string;
  audioSources: string[];
  shelfItemIds: string[];
  targets: Array<{
    itemId: string;
    required: number;
    served: number;
  }>;
}

export interface ShopSessionSnapshot {
  servedCustomers: number;
  mistakes: number;
  roundCoins: number;
  customerEmoji: string;
  customerName: string;
  currentOrder: StoredShopOrder;
}

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

type StoredShopSessions = Record<string, Record<string, ShopSessionSnapshot>>;

const SHOP_SESSION_STORAGE_KEY = 'bubble_shop_sessions_v1';
const SHOP_ITEM_IDS = new Set(VOCABULARY.filter((word: { shoppable: boolean }) => word.shoppable).map((word: { id: string }) => word.id));

export function loadShopSession(
  storage: StorageLike,
  profileId: string,
  levelId: string,
): ShopSessionSnapshot | null {
  const session = readSessions(storage)[profileId]?.[levelId];
  return isShopSessionSnapshot(session) ? session : null;
}

export function saveShopSession(
  storage: StorageLike,
  profileId: string,
  levelId: string,
  snapshot: ShopSessionSnapshot,
) {
  const sessions = readSessions(storage);
  const profileSessions = sessions[profileId] ?? {};
  profileSessions[levelId] = snapshot;
  sessions[profileId] = profileSessions;
  writeSessions(storage, sessions);
}

export function clearShopSession(storage: StorageLike, profileId: string, levelId: string) {
  const stored = storage.getItem(SHOP_SESSION_STORAGE_KEY);
  if (stored === null) {
    return;
  }
  const sessions = readSessions(storage);
  delete sessions[profileId]?.[levelId];
  writeSessions(storage, sessions);
}

function readSessions(storage: StorageLike): StoredShopSessions {
  const stored = storage.getItem(SHOP_SESSION_STORAGE_KEY);
  if (stored === null) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!isPlainRecord(parsed)) {
      return {};
    }
    return parsed as StoredShopSessions;
  } catch {
    return {};
  }
}

function writeSessions(storage: StorageLike, sessions: StoredShopSessions) {
  try {
    storage.setItem(SHOP_SESSION_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    return;
  }
}

function isShopSessionSnapshot(value: unknown): value is ShopSessionSnapshot {
  if (!isPlainRecord(value)) {
    return false;
  }
  const order = value.currentOrder;
  if (!isPlainRecord(order)) {
    return false;
  }
  const shelfItemIds = order.shelfItemIds;
  return (
    isNonNegativeInteger(value.servedCustomers)
    && isNonNegativeInteger(value.mistakes)
    && isNonNegativeInteger(value.roundCoins)
    && typeof value.customerEmoji === 'string'
    && typeof value.customerName === 'string'
    && typeof order.sentence === 'string'
    && Array.isArray(order.audioSources)
    && order.audioSources.every((source: unknown) => typeof source === 'string')
    && Array.isArray(shelfItemIds)
    && shelfItemIds.length > 0
    && shelfItemIds.every((id: unknown) => typeof id === 'string' && SHOP_ITEM_IDS.has(id))
    && Array.isArray(order.targets)
    && order.targets.length > 0
    && order.targets.every((target: unknown) => isPlainRecord(target)
      && typeof target.itemId === 'string' && SHOP_ITEM_IDS.has(target.itemId)
      && shelfItemIds.includes(target.itemId)
      && typeof target.required === 'number' && Number.isInteger(target.required) && target.required > 0
      && isNonNegativeInteger(target.served) && target.served <= target.required)
  );
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
