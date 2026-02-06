import test from 'node:test';
import assert from 'node:assert/strict';
import { CloudLayerSystem } from './CloudLayerSystem';

test('CloudLayerSystem creates expected layer mix on init', () => {
  const system = new CloudLayerSystem();
  const clouds = system.createInitialClouds(1200, 700);

  assert.equal(clouds.length, 9);
  assert.ok(clouds.some((c) => c.layer === 0));
  assert.ok(clouds.some((c) => c.layer === 1));
  assert.ok(clouds.some((c) => c.layer === 2));
});

test('CloudLayerSystem respawns cloud to the left after exiting right bound', () => {
  const system = new CloudLayerSystem();
  const [cloud] = system.createInitialClouds(1000, 600);

  cloud.x = 1400;
  cloud.size = 90;

  system.update([cloud], 1, 1000, 600, 0.5);

  assert.ok(cloud.x < 0);
});
