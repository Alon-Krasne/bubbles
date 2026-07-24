import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../src/assets/audio/vocabulary/en');

function collectMp3Files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return collectMp3Files(path);
    }
    return entry.name.endsWith('.mp3') ? [path] : [];
  });
}

const files = collectMp3Files(root);
const durations = files.map((file) => {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, `ffprobe could not decode ${file}: ${result.stderr}`);
  const duration = Number(result.stdout.trim());
  assert.ok(Number.isFinite(duration), `missing audio duration for ${file}`);
  assert.ok(duration >= 0.25 && duration <= 5, `unexpected ${duration}s duration for ${file}`);
  return duration;
});

assert.equal(files.length, 243, 'the committed vocabulary audio set must be complete');

console.log(JSON.stringify({
  decodedClips: files.length,
  shortestSeconds: Math.min(...durations),
  longestSeconds: Math.max(...durations),
}));
