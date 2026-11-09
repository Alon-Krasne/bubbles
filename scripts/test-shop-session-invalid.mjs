import assert from 'node:assert/strict';
import { loadShopSession } from '../src/shopSession.ts';

const snapshot = {
  servedCustomers: 1, mistakes: 0, roundCoins: 2, customerEmoji: '🐻', customerName: 'בוני',
  currentOrder: {
    sentence: 'An apple', audioSources: ['/apple.mp3'], shelfItemIds: ['apple'],
    targets: [{ itemId: 'apple', required: 1, served: 0 }],
  },
};

function load(value) {
  return loadShopSession({ getItem: () => JSON.stringify({ child: { level: value } }) }, 'child', 'level');
}

assert.deepEqual(load(snapshot), snapshot);
for (const invalid of [
  { ...snapshot, servedCustomers: undefined },
  { ...snapshot, mistakes: -1 },
  { ...snapshot, currentOrder: { ...snapshot.currentOrder, targets: [{}] } },
  { ...snapshot, currentOrder: { ...snapshot.currentOrder, shelfItemIds: [null] } },
  { ...snapshot, currentOrder: { ...snapshot.currentOrder, shelfItemIds: ['unknown-item'] } },
  { ...snapshot, currentOrder: { ...snapshot.currentOrder, targets: [{ itemId: 'apple', required: 1, served: 2 }] } },
]) {
  assert.equal(load(invalid), null, 'an incomplete round must not be restored');
}
console.log('PASS: invalid shop snapshots are not restored');
