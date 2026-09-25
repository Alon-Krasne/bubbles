import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPECTED_CLIP_COUNTS = { en: 302, he: 281 };

const durations = [];
let decodedClips = 0;

for (const [language, expectedCount] of Object.entries(EXPECTED_CLIP_COUNTS)) {
  const root = resolve(import.meta.dirname, `../src/assets/audio/vocabulary/${language}`);
  const files = readdirSync(root, { recursive: true }).filter((path) => path.endsWith('.mp3')).map((path) => resolve(root, path));
  assert.equal(files.length, expectedCount, `the committed ${language} vocabulary audio set must be complete`);

  for (const file of files) {
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
    durations.push(duration);
    decodedClips += 1;
  }
}

console.log(JSON.stringify({
  decodedClips,
  shortestSeconds: Math.min(...durations),
  longestSeconds: Math.max(...durations),
}));
