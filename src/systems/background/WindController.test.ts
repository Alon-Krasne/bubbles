import test from 'node:test';
import assert from 'node:assert/strict';
import { WindController } from './WindController';

test('WindController keeps wind strength within configured bounds', () => {
  const wind = new WindController({ minStrength: 0.2, maxStrength: 0.8, driftSpeed: 0.03, retargetIntervalMs: 300 });

  for (let i = 0; i < 1200; i++) {
    wind.update(1);
    const strength = wind.getStrength();
    assert.ok(strength >= 0.2);
    assert.ok(strength <= 0.8);
  }
});

test('WindController gust boosts wind temporarily', () => {
  const wind = new WindController({ minStrength: 0.2, maxStrength: 0.8, driftSpeed: 0, retargetIntervalMs: 10000 });

  wind.update(1);
  const before = wind.getStrength();

  wind.triggerGust(0.3);
  wind.update(1);
  const boosted = wind.getStrength();

  for (let i = 0; i < 100; i++) {
    wind.update(1);
  }

  const settled = wind.getStrength();

  assert.ok(boosted >= before);
  assert.ok(settled <= boosted);
});
