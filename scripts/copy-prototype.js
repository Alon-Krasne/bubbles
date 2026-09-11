const { cpSync, mkdirSync } = require('node:fs');
const { dirname, resolve } = require('node:path');

const root = resolve(__dirname, '..');
const copies = [
  ['prototype', 'dist/prototype'],
  ['src/assets/fonts', 'dist/src/assets/fonts'],
  ['src/assets/memory/memory-garden-map-bg-v2.png', 'dist/src/assets/memory/memory-garden-map-bg-v2.png'],
  ['src/assets/memory/moonlit-trail-map.webp', 'dist/src/assets/memory/moonlit-trail-map.webp'],
  ['src/assets/characters/princess', 'dist/src/assets/characters/princess'],
  ['src/assets/characters/dinosaur', 'dist/src/assets/characters/dinosaur'],
  ['src/assets/characters/puppy', 'dist/src/assets/characters/puppy'],
  ['src/assets/characters/unicorn', 'dist/src/assets/characters/unicorn'],
];

copies.forEach(([source, destination]) => {
  const target = resolve(root, destination);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(resolve(root, source), target, { recursive: true });
});

console.log('Copied educational game prototypes into dist.');
