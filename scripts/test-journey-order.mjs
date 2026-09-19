import assert from 'node:assert/strict';
import { TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';
import { createJourneyOrder, applyJourneyOrder } from '../prototype/shared/journey-order.mjs';

const random = seed => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

const orders = Array.from({ length: 100 }, (_, seed) => createJourneyOrder(TRAIL_STAGES, random(seed + 1)));
assert.ok(new Set(orders.map(order => order.join(','))).size > 90, 'different journeys should receive different orders');

for (const order of orders) {
  const stages = applyJourneyOrder(TRAIL_STAGES, order);
  assert.deepEqual(stages.map(stage => stage.id), TRAIL_STAGES.map(stage => stage.id));
  assert.equal(new Set(stages.map(stage => stage.level)).size, TRAIL_STAGES.length, 'each challenge plays exactly once');
  assert.ok(stages.every((stage, index) => stage.chapter === TRAIL_STAGES[index].chapter), 'chapter content stays in its chapter');
  assert.ok(stages.every((stage, index) => stage.x === TRAIL_STAGES[index].x && stage.y === TRAIL_STAGES[index].y), 'map positions stay put');
  assert.ok(stages.every((stage, index) => index < 2 || stage.game !== stages[index - 1].game || stage.game !== stages[index - 2].game), 'at most two consecutive stages of one game');
  for (const game of ['memory', 'shop', 'house', 'reveal']) {
    const ranks = stages.filter(stage => stage.game === game).map(stage => stage.difficultyRank);
    assert.ok(ranks.every((rank, index) => index === 0 || rank >= ranks[index - 1]), `${game} difficulty must not drop`);
  }
  assert.deepEqual(applyJourneyOrder(TRAIL_STAGES, order), stages, 'saved order must restore exactly');
}

assert.throws(() => applyJourneyOrder(TRAIL_STAGES, orders[0].slice(1)), /Invalid journey order/);
console.log('PASS: 100 varied journeys keep chapter content, stable stages, rising difficulty, and a two-game repetition cap.');
