import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';

const cwd = new URL('../', import.meta.url);
execFileSync('npm', ['run', 'build'], { cwd, stdio: 'inherit' });
const server = spawn(process.execPath, ['scripts/serve-save-test.mjs'], {
  cwd, stdio: ['ignore', 'pipe', 'inherit'],
});
const lines = createInterface({ input: server.stdout });
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', (code, signal) => reject(new Error(`Inventory test server exited: ${signal ?? code}`)));
    lines.on('line', line => {
      if (line === 'Local D1 browser acceptance: http://127.0.0.1:8788') resolve();
    });
  });
  execFileSync(process.execPath, ['scripts/test-magic-house-inventory.mjs'], { cwd, stdio: 'inherit' });
} finally {
  lines.close();
  if (server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit');
    server.kill('SIGINT');
    await stopped;
  }
}
