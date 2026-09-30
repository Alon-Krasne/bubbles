import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';

const cwd = new URL('../', import.meta.url);
const server = spawn(process.execPath, ['scripts/serve-save-test.mjs'], {
  cwd, stdio: ['ignore', 'pipe', 'inherit'],
});
const lines = createInterface({ input: server.stdout });
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', (code, signal) => reject(new Error(`Painter test server exited: ${signal ?? code}`)));
    lines.on('line', line => {
      if (line === 'Local D1 browser acceptance: http://127.0.0.1:8788') resolve();
    });
  });
  const test = spawn(process.execPath, ['scripts/test-painter-browser.mjs'], { cwd, stdio: 'inherit' });
  const [code, signal] = await once(test, 'exit');
  if (code !== 0) throw new Error(`Painter browser acceptance failed: ${signal ?? code}`);
} finally {
  lines.close();
  if (server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit');
    server.kill('SIGINT');
    await stopped;
  }
}
