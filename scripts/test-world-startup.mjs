// Build first and run scripts/serve-save-test.mjs; all requests stay local.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const browser = async (...args) => (await exec('agent-browser', [
  '--session', `world-startup-${process.pid}`, ...args,
])).stdout;
const evaluate = async expression => JSON.parse(await browser('eval', expression));
let delayedPath;
let release;
let requested;
let failSaves = false;
const server = createServer(async (incoming, outgoing) => {
  if (incoming.url === delayedPath) {
    await new Promise(resolve => { release = resolve; requested(); });
  }
  if (failSaves && incoming.url === '/api/saves') {
    outgoing.writeHead(503);
    outgoing.end('Save service unavailable');
    return;
  }
  const chunks = [];
  for await (const chunk of incoming) chunks.push(chunk);
  const response = await fetch(new URL(incoming.url, 'http://127.0.0.1:8788'), {
    method: incoming.method,
    headers: incoming.headers,
    ...(chunks.length ? { body: Buffer.concat(chunks) } : {}),
  });
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
const visible = selector => `(() => {
  const element = document.querySelector(${JSON.stringify(selector)});
  return Boolean(element && element.getClientRects().length
    && getComputedStyle(element).visibility === 'visible');
})()`;

try {
  for (const path of ['/api/saves', '/prototype/world-map.js']) {
    delayedPath = path;
    const requestStarted = new Promise(resolve => { requested = resolve; });
    await browser('open', `${base}/prototype/world-map.html`);
    await requestStarted;
    assert.equal(await evaluate(visible('#world')), false, `Placeholder stays hidden while ${path} is pending`);
    assert.equal(await evaluate(visible('.world-loading')), true, 'A neutral loading message is visible');
    assert.equal(await evaluate(visible('#profile-gate')), false, 'Profile choices wait for initialization');
    release();
    await browser('wait', '.gate-profile-choice');
    assert.equal(await evaluate(visible('#profile-gate')), true, 'The real profile picker appears');
    assert.equal(await evaluate(visible('.world-loading')), false, 'Loading message disappears');
    assert.equal(await evaluate('document.body.hasAttribute("data-loading")'), false);
    await browser('close');
  }

  delayedPath = null;
  failSaves = true;
  await browser('open', `${base}/prototype/world-map.html`);
  await browser('wait', '--fn', 'document.body.textContent.includes("לא ניתן לטעון את השמירה")');
  assert.equal(await evaluate(visible('#world')), false, 'Save errors never reveal the placeholder');
  assert.equal(await evaluate(`(() => {
    const retry = [...document.querySelectorAll('button')].find(button => button.textContent === 'נסו שוב');
    const rect = retry.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === retry;
  })()`), true, 'The save-error Retry button remains usable');
  failSaves = false;
  await browser('find', 'role', 'button', 'click', '--name', 'נסו שוב');
  await browser('wait', '.gate-profile-choice');
  assert.equal(await evaluate('document.body.hasAttribute("data-loading")'), false, 'Retry completes initialization');

  await browser('open', `${base}/`);
  await browser('wait', '.gate-profile-choice');
  assert.equal(await evaluate('location.pathname'), '/prototype/world-map.html', 'Root link reaches the real picker');
  console.log('PASS: slow saves and app import show only loading; save errors remain usable; Retry and root links reach the profile picker.');
} finally {
  release?.();
  await browser('close');
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
