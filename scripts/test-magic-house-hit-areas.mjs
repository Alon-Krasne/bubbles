import assert from 'node:assert/strict';

import {
  MAGIC_HOUSE_ROOM_MAP,
  MAGIC_HOUSE_ZONES,
} from '../prototype/shared/magic-house-room.mjs';

const toNumber = (percentage) => Number.parseFloat(percentage);

const rectangles = MAGIC_HOUSE_ZONES.map((zone) => {
  const layout = MAGIC_HOUSE_ROOM_MAP.zones[zone.id];
  assert.ok(layout, `zone ${zone.id} needs an authored room position`);
  assert.ok(zone.labels.en, `zone ${zone.id} needs an English label`);
  assert.ok(zone.labels.he, `zone ${zone.id} needs a Hebrew label`);

  const left = toNumber(layout.left);
  const top = toNumber(layout.top);
  return {
    id: zone.id,
    left,
    top,
    right: left + toNumber(layout.width),
    bottom: top + toNumber(layout.height),
  };
});

for (let index = 0; index < rectangles.length; index += 1) {
  for (let otherIndex = index + 1; otherIndex < rectangles.length; otherIndex += 1) {
    const first = rectangles[index];
    const second = rectangles[otherIndex];
    const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
    const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);

    assert.ok(
      overlapWidth <= 0 || overlapHeight <= 0,
      `drop zones ${first.id} and ${second.id} overlap by ${overlapWidth}% × ${overlapHeight}%`,
    );
  }
}

console.log(JSON.stringify({ zones: rectangles.length, overlaps: 0, bilingualLabels: true }));
