import assert from 'node:assert/strict';
import { MAGIC_HOUSE_ZONES, MAGIC_HOUSE_PLACEMENTS } from '../prototype/shared/magic-house-room.mjs';
import { MAGIC_HOUSE_REQUESTS } from '../prototype/shared/magic-house-content.mjs';

// Hand-measured visible interior points on moonlight-room.webp (1585×992).
// Independent from the rectangles consumed by the game.
const visibleSurfaces = {
  bed: [29, 44],
  'toy-box': [85, 54],
  shelf: [86, 28],
  'under-bed': [42, 58],
  'bedside-floor': [55, 57],
  nightstand: [13, 44],
  table: [71, 48],
};
const contains = (zone, x, y) => {
  const { left, top, width, height } = Object.fromEntries(
    Object.entries(zone.layout).map(([key, value]) => [key, Number.parseFloat(value)]),
  );
  return x >= left && x <= left + width && y >= top && y <= top + height;
};
for (const zone of MAGIC_HOUSE_ZONES) {
  assert.ok(contains(zone, ...visibleSurfaces[zone.id]), `${zone.id} must cover its visible moonlit-room surface`);
}
for (const request of MAGIC_HOUSE_REQUESTS) {
  for (const target of request.targets) {
    const placement = MAGIC_HOUSE_PLACEMENTS[`${target.objectId}:${target.zoneId}`];
    const zone = MAGIC_HOUSE_ZONES.find(candidate => candidate.id === target.zoneId);
    assert.ok(contains(zone, Number.parseFloat(placement.left), Number.parseFloat(placement.top)),
      `${target.objectId}:${target.zoneId} must appear on its calibrated destination`);
  }
}
console.log('PASS: all 7 moonlit-room surfaces and all 12 authored placements align with the new artwork.');
