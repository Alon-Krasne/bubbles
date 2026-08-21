import assert from 'node:assert/strict';

import { createLatestPlaybackQueue } from '../src/audioPlaybackQueue.ts';

const started = [];
const completions = [];
const completed = [];
const errors = [];
const queue = createLatestPlaybackQueue(
  async (request) => {
    started.push(request);
    await new Promise((resolve) => completions.push(resolve));
  },
  (error) => errors.push(error),
);

for (let requestIndex = 0; requestIndex < 40; requestIndex += 1) {
  const request = `request-${requestIndex}`;
  queue.request(request, () => completed.push(request));
}

assert.deepEqual(started, ['request-0'], 'the active request must not be interrupted');

completions.shift()();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(completed, ['request-0'], 'completion must fire only after active playback ends');
assert.deepEqual(started, ['request-0', 'request-39'], 'only the latest pending request should play next');

completions.shift()();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(completed, ['request-0', 'request-39'], 'superseded pending requests must not complete');
assert.deepEqual(errors, [], 'the burst must not report playback errors');

const cancellationStarted = [];
const cancellationAborted = [];
const cancellationCompleted = [];
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

cancellationQueue.request('active', () => cancellationCompleted.push('active'));
cancellationQueue.request('discarded-pending', () => cancellationCompleted.push('discarded-pending'));
cancellationQueue.clear();
await new Promise((resolve) => setImmediate(resolve));

assert.deepEqual(cancellationStarted, ['active'], 'clear must discard the pending request');
assert.deepEqual(cancellationAborted, ['active'], 'clear must abort active playback');
assert.deepEqual(cancellationCompleted, [], 'cancelled requests must not complete');

cancellationQueue.request('after-clear', () => cancellationCompleted.push('after-clear'));
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(cancellationStarted, ['active', 'after-clear'], 'the queue must accept requests after clear');

cancellationQueue.clear();
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(cancellationAborted, ['active', 'after-clear'], 'the restarted request must remain cancellable');
assert.deepEqual(cancellationCompleted, [], 'aborted restarted playback must not complete');
assert.deepEqual(cancellationErrors, [], 'cancellation must not report playback errors');

const playbackFailure = new Error('playback failed');
const reportedErrors = [];
const completedAfterFailure = [];
const notifiedFailures = [];
const failingQueue = createLatestPlaybackQueue(
  async () => { throw playbackFailure; },
  (error) => reportedErrors.push(error),
);
failingQueue.request(
  'failure',
  () => completedAfterFailure.push('failure'),
  (error) => notifiedFailures.push(error),
);
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(reportedErrors, [playbackFailure], 'playback failures must reach the required error handler');
assert.deepEqual(notifiedFailures, [playbackFailure], 'playback failures must reach the per-request failure handler');
assert.deepEqual(completedAfterFailure, [], 'failed playback must never complete');

const recoveredCompletions = [];
failingQueue.request('recovery', () => recoveredCompletions.push('recovery'));
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(recoveredCompletions, [], 'the failing play function cannot complete');

const supersededFailures = [];
const latestFailures = [];
const supersedingQueue = createLatestPlaybackQueue(
  async (request) => {
    if (request === 'doomed') {
      throw playbackFailure;
    }
  },
  () => {},
);
supersedingQueue.request('superseded', null, () => supersededFailures.push('superseded'));
supersedingQueue.request('doomed', null, (error) => latestFailures.push(error));
await new Promise((resolve) => setImmediate(resolve));
assert.deepEqual(supersededFailures, [], 'a superseded pending request must not be notified of failure');
assert.deepEqual(latestFailures, [playbackFailure], 'only the playing request receives its failure');

console.log(JSON.stringify({
  started,
  completed,
  errors,
  cancellationStarted,
  cancellationAborted,
  cancellationErrors,
  reportedErrorCount: reportedErrors.length,
}));
