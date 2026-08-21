import assert from 'node:assert/strict';

import {
  clearShopSession,
  loadShopSession,
  saveShopSession,
} from '../src/shopSession.ts';

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, value);
  }
}

const storage = new MemoryStorage();
const snapshot = {
  servedCustomers: 1,
  mistakes: 2,
  roundCoins: 1,
  customerEmoji: '🐻',
  customerName: 'בוני',
  currentOrder: {
    sentence: 'I would like a notebook, please.',
    audioSources: ['/audio/i-would-like.mp3', '/audio/a.mp3', '/audio/notebook.mp3', '/audio/please.mp3'],
    shelfItemIds: ['notebook', 'book', 'ruler', 'pencil'],
    targets: [{ itemId: 'notebook', required: 1, served: 0 }],
  },
};

saveShopSession(storage, 'lotem', 'shop-level-2', snapshot);
assert.deepEqual(
  loadShopSession(storage, 'lotem', 'shop-level-2'),
  snapshot,
  'an in-progress customer must round-trip through storage exactly',
);

clearShopSession(storage, 'lotem', 'shop-level-2');
assert.equal(
  loadShopSession(storage, 'lotem', 'shop-level-2'),
  null,
  'a completed level must remove its in-progress session',
);

const corruptStorage = new MemoryStorage();
corruptStorage.setItem('bubble_shop_sessions_v1', '{definitely not json');
assert.equal(
  loadShopSession(corruptStorage, 'lotem', 'shop-level-2'),
  null,
  'corrupt stored json must read as an absent session',
);
saveShopSession(corruptStorage, 'lotem', 'shop-level-2', snapshot);
assert.deepEqual(
  loadShopSession(corruptStorage, 'lotem', 'shop-level-2'),
  snapshot,
  'saving over corrupt storage must recover the round-trip',
);
clearShopSession(corruptStorage, 'lotem', 'shop-level-2');
assert.equal(
  loadShopSession(corruptStorage, 'lotem', 'shop-level-2'),
  null,
  'clearing over corrupt storage must not throw and must remove the session',
);

const malformedStorage = new MemoryStorage();
malformedStorage.setItem(
  'bubble_shop_sessions_v1',
  JSON.stringify({ lotem: { 'shop-level-2': { servedCustomers: 1 } } }),
);
assert.equal(
  loadShopSession(malformedStorage, 'lotem', 'shop-level-2'),
  null,
  'a stored payload without a usable order must read as absent',
);

class RejectingWriteStorage {
  values = new Map([['bubble_shop_sessions_v1', '{}']]);

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem() {
    throw new Error('QuotaExceededError');
  }
}

const rejectingStorage = new RejectingWriteStorage();
saveShopSession(rejectingStorage, 'lotem', 'shop-level-2', snapshot);
clearShopSession(rejectingStorage, 'lotem', 'shop-level-3');
assert.deepEqual(
  loadShopSession(rejectingStorage, 'lotem', 'shop-level-3'),
  null,
  'a failed write must leave other sessions readable',
);

console.log(JSON.stringify({ resumedCustomer: snapshot.customerName, servedCustomers: snapshot.servedCustomers }));
