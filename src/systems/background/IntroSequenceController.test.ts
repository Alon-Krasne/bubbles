import test from 'node:test';
import assert from 'node:assert/strict';
import { IntroSequenceController } from './IntroSequenceController';

test('IntroSequenceController completes after duration and fires callback once', () => {
  const intro = new IntroSequenceController(10);
  let completed = 0;

  intro.start(() => {
    completed++;
  });

  for (let i = 0; i < 12; i++) {
    intro.update(1);
  }

  assert.equal(intro.isPlaying(), false);
  assert.equal(completed, 1);
});

test('IntroSequenceController skip ends sequence immediately', () => {
  const intro = new IntroSequenceController(100);
  let completed = 0;

  intro.start(() => {
    completed++;
  });

  intro.skip();

  assert.equal(intro.isPlaying(), false);
  assert.equal(completed, 1);
  assert.equal(intro.getProgress(), 0);
});
