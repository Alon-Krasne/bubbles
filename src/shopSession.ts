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
  const stored = storage.getItem(SHOP_SESSION_STORAGE_KEY);
  if (stored === null) {
    return null;
  }
  const sessions = JSON.parse(stored) as StoredShopSessions;
  return sessions[profileId]?.[levelId] ?? null;
}

export function saveShopSession(
  storage: StorageLike,
  profileId: string,
  levelId: string,
  snapshot: ShopSessionSnapshot,
) {
  const stored = storage.getItem(SHOP_SESSION_STORAGE_KEY);
  const sessions = stored === null ? {} : JSON.parse(stored) as StoredShopSessions;
  const profileSessions = sessions[profileId] ?? {};
  profileSessions[levelId] = snapshot;
  sessions[profileId] = profileSessions;
  storage.setItem(SHOP_SESSION_STORAGE_KEY, JSON.stringify(sessions));
}

export function clearShopSession(storage: StorageLike, profileId: string, levelId: string) {
  const stored = storage.getItem(SHOP_SESSION_STORAGE_KEY);
  if (stored === null) {
    return;
  }
  const sessions = JSON.parse(stored) as StoredShopSessions;
  delete sessions[profileId]?.[levelId];
  storage.setItem(SHOP_SESSION_STORAGE_KEY, JSON.stringify(sessions));
}
