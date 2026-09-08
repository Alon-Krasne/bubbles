import assert from 'node:assert/strict';
import { handleSaveRequest } from '../services/save-service.mjs';

let cancelled = false;
const body = new ReadableStream({
  start(controller) { controller.enqueue(new Uint8Array(65537)); },
  pull() { throw new Error('Must stop reading once the save exceeds its limit'); },
  cancel() { cancelled = true; },
}, { highWaterMark: 0 });
const request = new Request('https://game.example/api/saves/test', {
  method: 'PUT', duplex: 'half', body,
  headers: { origin: 'https://game.example', 'content-type': 'application/json' },
});
const result = await handleSaveRequest(request, null, 'test');
assert.equal(result.status, 413);
assert.equal(cancelled, true);
console.log('PASS: oversized save streams are cancelled before buffering the rest.');
