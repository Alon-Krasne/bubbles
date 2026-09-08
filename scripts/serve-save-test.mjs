// Local browser acceptance only. Production always uses the Access middleware.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { Miniflare } from 'miniflare';
import { handleSaveRequest } from '../services/save-service.mjs';
import { onRequestGet } from '../functions/api/saves/index.js';
const runtime = new Miniflare({ workers: [{ config: {
  name: 'browser-test', type: 'worker', compatibilityDate: '2026-09-08',
  env: { SAVES: { type: 'd1', id: 'browser-test' } },
  manifest: { mainModule: 'index.js', modules: { 'index.js': { type: 'esm', contents: 'export default {fetch(){return new Response("test")}}' } } },
} }] });
const SAVES = await runtime.getD1Database('SAVES');
await SAVES.exec((await readFile('migrations/0001_saves.sql', 'utf8')).replaceAll('\n', ' '));
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.mp3': 'audio/mpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, 'http://127.0.0.1:8788');
    let response;
    if (url.pathname.startsWith('/api/saves')) {
      const chunks = [];
      for await (const chunk of incoming) chunks.push(chunk);
      const request = new Request(url, { method: incoming.method, headers: incoming.headers,
        ...(incoming.method === 'PUT' ? { body: Buffer.concat(chunks) } : {}) });
      response = url.pathname === '/api/saves'
        ? await onRequestGet({ env: { SAVES } })
        : await handleSaveRequest(request, SAVES, decodeURIComponent(url.pathname.split('/').at(-1)));
    } else {
      const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!path.startsWith(root + '/')) throw new Error('Invalid path');
      response = new Response(await readFile(path), { headers: { 'content-type': mime[extname(path)] || 'application/octet-stream' } });
    }
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch { outgoing.writeHead(404); outgoing.end('Not found'); }
});
server.listen(8788, '127.0.0.1', () => console.log('Local D1 browser acceptance: http://127.0.0.1:8788'));
process.on('SIGINT', async () => { server.close(); await runtime.dispose(); process.exit(); });
