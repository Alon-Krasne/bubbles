import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const projectRoot = resolve('.');
const sourceRoot = join(projectRoot, 'src/assets/processed');
const outputRoot = join(projectRoot, 'src/assets/atlases');

if (!existsSync(sourceRoot)) {
  console.log('No src/assets/processed directory found. Skipping atlas build.');
  process.exit(0);
}

mkdirSync(outputRoot, { recursive: true });

const entries = readdirSync(sourceRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory());

if (entries.length === 0) {
  console.log('No processed asset packs found.');
  process.exit(0);
}

for (const entry of entries) {
  const packName = entry.name;
  const input = join(sourceRoot, packName);
  const output = join(outputRoot, packName);

  mkdirSync(output, { recursive: true });

  const command = [
    'npx free-tex-packer-cli',
    `--project ${input}`,
    '--format pixijs',
    '--trim-mode Trim',
    '--max-size 2048',
    '--allow-rotation false',
    `--output ${output}`,
  ].join(' ');

  console.log(`Building atlas: ${packName}`);
  execSync(command, { stdio: 'inherit' });
}

console.log('Atlas build complete.');
