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
  const order = (value as { currentOrder?: unknown }).currentOrder;
  if (!isPlainRecord(order)) {
    return false;
  }
  return (
    typeof order.sentence === 'string'
    && Array.isArray(order.audioSources)
    && Array.isArray(order.shelfItemIds)
    && Array.isArray(order.targets)
  );
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
