const { cpSync, mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const copies = [
  ['prototype', 'dist/prototype'],
  ['src/assets/fonts', 'dist/src/assets/fonts'],
  ['src/assets/memory/memory-garden-map-bg-v2.png', 'dist/src/assets/memory/memory-garden-map-bg-v2.png'],
  ['src/assets/characters/princess', 'dist/src/assets/characters/princess'],
  ['src/assets/characters/dinosaur', 'dist/src/assets/characters/dinosaur'],
];

copies.forEach(([source, destination]) => {
  const target = resolve(root, destination);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(root, source), target, { recursive: true });
});

console.log('Copied unified world map prototype into dist.');
