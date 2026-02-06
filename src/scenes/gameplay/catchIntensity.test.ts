import test from 'node:test';
import assert from 'node:assert/strict';
import { registerCatchAndComputeIntensity } from './catchIntensity';

test('registerCatchAndComputeIntensity increases intensity with more catches in window', () => {
  const first = registerCatchAndComputeIntensity({ catchMoments: [], now: 100 });
  const second = registerCatchAndComputeIntensity({ catchMoments: first.catchMoments, now: 120 });
  const third = registerCatchAndComputeIntensity({ catchMoments: second.catchMoments, now: 130 });

  assert.ok(second.intensity > first.intensity);
  assert.ok(third.intensity > second.intensity);
});

test('registerCatchAndComputeIntensity drops stale catches outside window', () => {
  const result = registerCatchAndComputeIntensity({ catchMoments: [10, 20, 30], now: 150, windowSize: 40 });

  assert.equal(result.catchMoments.length, 1);
  assert.equal(result.catchMoments[0], 150);
  assert.equal(result.intensity, 1.12);
});
