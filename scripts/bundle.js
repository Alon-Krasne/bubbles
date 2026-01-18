#!/usr/bin/env node

/**
 * Bundle script for בועות! game
 * Creates a single self-contained HTML file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Read source files
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const majorVersion = parseInt((packageJson.version || '1').split('.')[0], 10) || 1;

// Bundle into single HTML
const bundled = html
    .replace(
        '<link rel="stylesheet" href="src/styles.css">',
        `<style>\n${css}\n</style>`
    )
    .replace(
        '<script src="src/game.js"></script>',
        `<script>\n${js}\n</script>`
    );

// Ensure dist folder exists
if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST);
}

// Write bundled file
const outputFileName = `bubbles_v${majorVersion}.html`;
const outputPath = path.join(DIST, outputFileName);
fs.writeFileSync(outputPath, bundled);

console.log(`✅ Bundled game created: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
console.log(`🔖 Version tag: v${majorVersion}`);

if (process.argv.includes('--open')) {
    execSync(`open "${outputPath}"`);
}

console.log(`\n🎮 Send this single file to anyone - it works offline!`);
