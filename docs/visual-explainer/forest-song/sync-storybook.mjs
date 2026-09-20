// Keep the scene content in the agent brief and visual book in sync with JSON.
// Usage: node docs/visual-explainer/forest-song/sync-storybook.mjs --write | --check
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const directory = path.dirname(fileURLToPath(import.meta.url));
const briefPath = path.resolve(directory, '../../STORYBOOK.md');
const mode = process.argv[2];
assert.ok(['--write', '--check'].includes(mode), 'Use --write or --check');
const book = JSON.parse(fs.readFileSync(path.join(directory, 'storybook-v2.json'), 'utf8'));
const { scenes } = book;
assert.deepEqual(scenes.map(scene => scene.milestone), [0, 5, 10, 15, 20, 25, 30, 35, 36]);
assert.equal(new Set(scenes.map(scene => scene.videoId)).size, 9);
assert.equal(scenes.reduce((sum, scene) => sum + scene.shots.length, 0), 21);
assert.equal(scenes.reduce((sum, scene) => sum + scene.duration, 0), 126);
for (const [index, scene] of scenes.entries()) {
  assert.equal(scene.videoId, `forest-video-${String(index + 1).padStart(2, '0')}`);
  assert.equal(scene.shots.reduce((sum, shot) => sum + shot.seconds, 0), scene.duration);
  for (const field of ['title', 'he', 'when', 'tone', 'learn', 'change', 'hook', 'budget']) {
    assert.ok(scene[field], `Missing ${field} in ${scene.videoId}`);
  }
  for (const shot of scene.shots) assert.ok(shot.see && shot.hear);
}

const section = '## Nine production video scripts\n\n'
  + 'Stable IDs below are independent of the selected character or language. Target edited runtime: 126 seconds in 21 shots. Six seconds per shot is an editorial target; select native model durations after the pilot. Opening draft exists; later production must follow the revised scripts.\n\n'
  + scenes.map(scene => `### ${scene.videoId} — ${scene.title} / ${scene.he}\n\n`
    + `**Trigger:** ${scene.when}. **Target:** ${scene.duration} seconds. **Feeling:** ${scene.tone}.\n\n`
    + scene.shots.map((shot, index) => `**Shot ${index + 1} / ${shot.seconds}s**\n\n- See: ${shot.see}\n- Hear: ${shot.hear}`).join('\n\n')
    + `\n\n**Learning connection:** ${scene.learn}\n\n**Lasting change:** ${scene.change}\n\n**Anticipation:** ${scene.hook}\n\n**Production constraint:** ${scene.budget}\n`).join('\n') + '\n';

const brief = fs.readFileSync(briefPath, 'utf8');
const start = brief.indexOf('## Nine production video scripts\n');
const end = brief.indexOf('## Destination and progress behavior\n', start);
assert.ok(start >= 0 && end > start, 'Missing brief section boundaries');
const updatedBrief = brief.slice(0, start) + section + brief.slice(end);
const htmlPath = path.join(directory, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const sceneStart = html.indexOf('const scenes=');
const sceneEnd = html.indexOf(';const $=', sceneStart);
assert.ok(sceneStart >= 0 && sceneEnd > sceneStart, 'Missing HTML scene boundaries');
const updatedHtml = html.slice(0, sceneStart) + 'const scenes=' + JSON.stringify(scenes) + html.slice(sceneEnd);
new vm.Script(updatedHtml.match(/<script>([\s\S]*?)<\/script>/)[1]);

for (const [file, expected] of [
  [briefPath, updatedBrief],
  [htmlPath, updatedHtml],
  [path.join(directory, 'storybook-v2.html'), updatedHtml],
  [path.join(directory, 'script.json'), JSON.stringify(scenes, null, 2) + '\n'],
]) {
  if (mode === '--write') fs.writeFileSync(file, expected);
  else assert.equal(fs.readFileSync(file, 'utf8'), expected, `Stale storybook artifact: ${file}`);
}
for (const [, target] of updatedBrief.matchAll(/\]\(([^)]+)\)/g)) {
  assert.ok(fs.existsSync(path.resolve(path.dirname(briefPath), target)), `Broken local brief link: ${target}`);
}
console.log(`${mode}: nine videos / 21 shots / 126 seconds; scene copies, local links and JavaScript syntax valid.`);
