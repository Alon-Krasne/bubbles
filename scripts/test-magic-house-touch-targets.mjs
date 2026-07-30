import assert from 'node:assert/strict';

import {
  MAGIC_HOUSE_ROOM_MAP,
  MAGIC_HOUSE_ZONES,
} from '../prototype/shared/magic-house-room.mjs';

const MINIMUM_TARGET_SIZE = 44;
const REVIEW_ROOM_SIZES = Object.freeze([
  Object.freeze({ name: 'user screenshot', width: 1640, height: 1094 }),
  Object.freeze({ name: 'user recording', width: 1077, height: 630 }),
  Object.freeze({ name: 'documented tablet', width: 1024, height: 612 }),
]);

for (const viewport of REVIEW_ROOM_SIZES) {
  for (const zone of MAGIC_HOUSE_ZONES) {
    const layout = MAGIC_HOUSE_ROOM_MAP.zones[zone.id];
    const width = viewport.width * Number.parseFloat(layout.width) / 100;
    const height = viewport.height * Number.parseFloat(layout.height) / 100;
    assert.ok(
      width >= MINIMUM_TARGET_SIZE && height >= MINIMUM_TARGET_SIZE,
      `${zone.id} is only ${Math.round(width)}×${Math.round(height)} px at ${viewport.name}`,
    );
  }
}

console.log(JSON.stringify({
  minimumTargetSize: MINIMUM_TARGET_SIZE,
  viewports: REVIEW_ROOM_SIZES.map(({ name }) => name),
}));
