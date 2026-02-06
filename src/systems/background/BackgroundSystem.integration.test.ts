import test from 'node:test';
import assert from 'node:assert/strict';
import { getTheme } from '../../game/themes';
import { BackgroundSystem } from './BackgroundSystem';
import { Cloud } from './CloudLayerSystem';

test('BackgroundSystem updates cloud motion and particle config together', () => {
  const system = new BackgroundSystem();
  system.resize(1200, 700);
  system.setWeatherConfig(getTheme('classic').weather);

  const cloud: Cloud = {
    x: 100,
    y: 100,
    size: 90,
    speed: 0.2,
    opacity: 0.4,
    layer: 1,
    bobPhase: 0,
  };

  system.update([cloud], 2, 1200, 700);

  assert.ok(cloud.x > 100);
  assert.ok(system.getParticleCount() >= 0);
  assert.ok(system.getWindStrength() >= 0.1);
});

test('BackgroundSystem respects cloud toggle', () => {
  const system = new BackgroundSystem();
  const cloud: Cloud = {
    x: 100,
    y: 120,
    size: 70,
    speed: 0.4,
    opacity: 0.5,
    layer: 2,
    bobPhase: 0,
  };

  system.setToggles({ clouds: false });
  system.update([cloud], 3, 1200, 700);

  assert.equal(cloud.x, 100);
});

test('BackgroundSystem excitement increases on burst and decays over time', () => {
  const system = new BackgroundSystem();

  system.burstAt(100, 100);
  const afterBurst = system.getExcitement();

  for (let i = 0; i < 120; i++) {
    system.update([], 1, 1200, 700);
  }

  const afterDecay = system.getExcitement();

  assert.ok(afterBurst > 0);
  assert.ok(afterDecay < afterBurst);
});
