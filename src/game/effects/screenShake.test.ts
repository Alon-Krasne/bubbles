import test from 'node:test';
import assert from 'node:assert/strict';
import { startScreenShake, stepScreenShake, ScreenShakeState } from './screenShake';

const idleState: ScreenShakeState = { framesRemaining: 0, magnitude: 0, x: 0, y: 0 };

test('startScreenShake increases shake values from idle', () => {
  const next = startScreenShake({ state: idleState, intensity: 1.2 });

  assert.ok(next.framesRemaining > 0);
  assert.ok(next.magnitude > 0);
});

test('stepScreenShake decays and eventually settles', () => {
  let state = startScreenShake({ state: idleState, intensity: 1.2 });

  for (let i = 0; i < 50; i++) {
    state = stepScreenShake({ state, deltaTime: 1, random: () => 0.75 });
  }

  assert.equal(state.framesRemaining, 0);
  assert.equal(state.magnitude, 0);
  assert.equal(state.x, 0);
  assert.equal(state.y, 0);
});
