#!/usr/bin/env node

/**
 * Bundle script for בועות! game
 * Creates a single self-contained HTML file
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// Read source files
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');

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
const outputPath = path.join(DIST, 'bubbles.html');
fs.writeFileSync(outputPath, bundled);

console.log(`✅ Bundled game created: ${outputPath}`);
console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
console.log(`\n🎮 Send this single file to anyone - it works offline!`);
