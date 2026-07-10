const { cpSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const root = resolve(__dirname, '..');

function copy(relativeSource, relativeDestination) {
  const source = resolve(root, relativeSource);
  const destination = resolve(root, relativeDestination);
  mkdirSync(resolve(destination, '..'), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

copy('prototype', 'dist/prototype');
copy('src/assets/fonts', 'dist/src/assets/fonts');
copy('src/assets/characters/princess', 'dist/src/assets/characters/princess');
copy('src/assets/characters/dinosaur', 'dist/src/assets/characters/dinosaur');
