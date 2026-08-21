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

console.log(JSON.stringify({ resumedCustomer: snapshot.customerName, servedCustomers: snapshot.servedCustomers }));
