import assert from 'node:assert/strict';

import { createLatestPlaybackQueue } from '../src/audioPlaybackQueue.ts';

const started = [];
const completions = [];
const errors = [];
const queue = createLatestPlaybackQueue(
  async (request) => {
    started.push(request);
    await new Promise((resolve) => completions.push(resolve));
  },
  (error) => errors.push(error),
);

for (let requestIndex = 0; requestIndex < 40; requestIndex += 1) {
  queue.request(`request-${requestIndex}`);
}

assert.deepEqual(started, ['request-0'], 'the active request must not be interrupted');

completions.shift()();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(started, ['request-0', 'request-39'], 'only the latest pending request should play next');

completions.shift()();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(errors, [], 'the burst must not report playback errors');

const cancellationStarted = [];
const cancellationAborted = [];
const cancellationErrors = [];
const cancellationQueue = createLatestPlaybackQueue(
  (request, signal) => new Promise((resolve) => {
    cancellationStarted.push(request);
    signal.addEventListener('abort', () => {
      cancellationAborted.push(request);
      resolve();
    }, { once: true });
  }),
  (error) => cancellationErrors.push(error),
);

cancellationQueue.request('active');
cancellationQueue.request('discarded-pending');
cancellationQueue.clear();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(cancellationStarted, ['active'], 'clear must discard the pending request');
assert.deepEqual(cancellationAborted, ['active'], 'clear must abort active playback');

cancellationQueue.request('after-clear');
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(cancellationStarted, ['active', 'after-clear'], 'the queue must accept requests after clear');

cancellationQueue.clear();
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(cancellationAborted, ['active', 'after-clear'], 'the restarted request must remain cancellable');
assert.deepEqual(cancellationErrors, [], 'cancellation must not report playback errors');

const playbackFailure = new Error('playback failed');
const reportedErrors = [];
const failingQueue = createLatestPlaybackQueue(
  async () => { throw playbackFailure; },
  (error) => reportedErrors.push(error),
);
failingQueue.request('failure');
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(reportedErrors, [playbackFailure], 'playback failures must reach the required error handler');

console.log(JSON.stringify({
  started,
  errors,
  cancellationStarted,
  cancellationAborted,
  cancellationErrors,
  reportedErrorCount: reportedErrors.length,
}));
