import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const distIndex = resolve(root, 'dist/index.html');
const distAssets = resolve(root, 'dist/assets');
const sourceAudio = resolve(root, 'src/assets/audio/vocabulary/en');
const worldMapSource = readFileSync(resolve(root, 'prototype/world-map.js'), 'utf8');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

const indexBytes = statSync(distIndex).size;
const indexHtml = readFileSync(distIndex, 'utf8');
const sourceAudioCount = listFiles(sourceAudio).filter((path) => path.endsWith('.mp3')).length;
const builtAudioPaths = listFiles(distAssets).filter((path) => path.endsWith('.mp3'));
const builtAudioCount = builtAudioPaths.length;

assert.ok(indexBytes < 2_000_000, `online entrypoint must stay below 2 MB; received ${indexBytes} bytes`);
assert.equal(builtAudioCount, sourceAudioCount, 'online build must emit every recorded vocabulary clip as a lazy asset');
const missingAssetPrefixes = builtAudioPaths
  .map((path) => basename(path))
  .filter((filename) => !indexHtml.includes(`assets/${filename}`));
assert.deepEqual(
  missingAssetPrefixes,
  [],
  'every emitted recording must retain its assets/ URL after the JavaScript chunk is inlined',
);
assert.match(
  worldMapSource,
  /activityFrame\.addEventListener\('load', revealLoadedActivity\)/,
  'the trail must load an activity behind the launch celebration and reveal it when ready',
);
assert.doesNotMatch(
  worldMapSource,
  /setTimeout\(\(\) => openActivity\([^\n]+650\)/,
  'activity loading must not wait for the launch celebration to finish',
);

console.log(JSON.stringify({ indexBytes, builtAudioCount }));
