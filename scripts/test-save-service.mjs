import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare } from 'miniflare';
import { handleSaveRequest } from '../services/save-service.mjs';
import { onRequest as authenticate } from '../functions/api/_middleware.js';

const domain = 'https://access.example';
const env = { ACCESS_DOMAIN: domain, ACCESS_AUD: 'game' };
const context = (token) => ({
  request: new Request('https://game.example/api/saves/test', { headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {} }),
  env, data: {}, functionPath: '/api', waitUntil() {}, passThroughOnException() {},
  next: () => new Response('private save'),
});
assert.equal((await authenticate(context())).status, 403);
assert.equal((await authenticate(context('forged'))).status, 403);
assert.equal((await authenticate({ ...context(), env: {} })).status, 503);
const signingKey = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const jwk = { ...await crypto.subtle.exportKey('jwk', signingKey.publicKey), kid: 'test-key', alg: 'RS256' };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.equal(url, `${domain}/cdn-cgi/access/certs`);
  return Response.json({ keys: [jwk] });
};
async function token(claims) {
  const payload = [ { alg: 'RS256', kid: 'test-key' }, claims ].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', signingKey.privateKey, new TextEncoder().encode(payload));
  return `${payload}.${Buffer.from(signature).toString('base64url')}`;
}
try {
  const claims = { iss: domain, aud: ['game'], exp: Math.floor(Date.now() / 1000) + 60 };
  assert.equal((await authenticate(context(await token(claims)))).status, 200);
  for (const invalid of [{ ...claims, aud: ['another-app'] }, { ...claims, exp: 1 }, { aud: ['game'] }]) {
    assert.equal((await authenticate(context(await token(invalid)))).status, 403);
  }
} finally {
  globalThis.fetch = originalFetch;
}
console.log('PASS: Access rejects missing, forged, expired, wrong-audience, and incomplete tokens; valid signed token accepted.');

const directory = await mkdtemp(join(tmpdir(), 'bubbles-save-test-'));
const options = {
  resourcePersistencePath: directory,
  workers: [{
    config: {
      name: 'save-test', type: 'worker', compatibilityDate: '2026-09-08',
      env: { SAVES: { type: 'd1', id: 'save-test' } },
      manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: 'export default { fetch() { return new Response("test"); } };' } } },
    },
  }],
};
let runtime = new Miniflare(options);
try {
  const SAVES = await runtime.getD1Database('SAVES');
  await SAVES.exec((await readFile(new URL('../migrations/0001_saves.sql', import.meta.url), 'utf8')).replaceAll('\n', ' '));
  const call = (method, body) => handleSaveRequest(new Request('https://game.example/api/saves/round-lotem-house', {
    method,
    ...(body ? { headers: { 'content-type': 'application/json', origin: 'https://game.example' }, body: JSON.stringify(body) } : {}),
  }), SAVES, 'round-lotem-house');
  assert.equal((await call('GET')).status, 404);
  const value = { requestIndex: 1, placedObjects: { ball: 'toy-box' } };
  const saved = await call('PUT', { revision: 0, value });
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { revision: 1, value });
  assert.deepEqual(await (await call('GET')).json(), { revision: 1, value });
  assert.equal((await call('PUT', { revision: 0, value: { requestIndex: 0 } })).status, 409);
  assert.equal((await call('PUT', { revision: 0, value })).status, 200, 'retry after a lost acknowledgement must succeed without another write');
  const results = await Promise.all([
    call('PUT', { revision: 1, value: { requestIndex: 2 } }),
    call('PUT', { revision: 1, value: { requestIndex: 3 } }),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409], 'only one device can replace the same revision');
  const latest = await (await call('GET')).json();
  await runtime.dispose();
  runtime = new Miniflare(options);
  const restartedDatabase = await runtime.getD1Database('SAVES');
  const restored = await handleSaveRequest(new Request('https://game.example/api/saves/round-lotem-house'), restartedDatabase, 'round-lotem-house');
  assert.deepEqual(await restored.json(), latest, 'saved progress survives replacing the service runtime');
  const invalidOrigin = await handleSaveRequest(new Request('https://game.example/api/saves/round-lotem-house', {
    method: 'PUT', headers: { 'content-type': 'application/json', origin: 'https://another.example' }, body: '{}',
  }), restartedDatabase, 'round-lotem-house');
  assert.equal(invalidOrigin.status, 403);
  assert.equal((await handleSaveRequest(new Request('https://game.example/api/saves/bad'), restartedDatabase, '../bad')).status, 400);
  console.log('PASS: D1 save/read, lost-ack retry, stale-write rejection, simultaneous writes, service restart, and origin/key validation.');
} finally {
  await runtime.dispose();
  await rm(directory, { recursive: true });
}
