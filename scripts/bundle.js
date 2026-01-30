#!/usr/bin/env node

/**
 * Bundle script for בועות! game
 * Creates a single self-contained HTML file with embedded images
 * Uses version from package.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(SRC, 'assets');

const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const version = packageJson.version;

// Helper to convert image to base64 data URL
function imageToDataUrl(imagePath) {
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    const mime = mimeTypes[ext] || 'image/png';
    const data = fs.readFileSync(imagePath);
    return `data:${mime};base64,${data.toString('base64')}`;
}

// Read source files
let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(SRC, 'styles.css'), 'utf8');
let js = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');

html = html.replace(/__VERSION__/g, `v${version}`);

// Dynamically find and embed all character figure images (.png files in assets root)
const figureFiles = fs.readdirSync(ASSETS).filter(f => f.endsWith('.png'));
figureFiles.forEach(file => {
    const imagePath = path.join(ASSETS, file);
    const dataUrl = imageToDataUrl(imagePath);
    const relativePath = `src/assets/${file}`;
    // Escape dots for regex
    const escapedPath = relativePath.replace(/\./g, '\\.');
    js = js.replace(new RegExp(escapedPath, 'g'), dataUrl);
    html = html.replace(new RegExp(escapedPath, 'g'), dataUrl);
});

// Dynamically find and embed all theme background images (in assets/themes/)
const themesDir = path.join(ASSETS, 'themes');
const themeFiles = fs.readdirSync(themesDir).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp')
);
themeFiles.forEach(file => {
    const imagePath = path.join(themesDir, file);
    const dataUrl = imageToDataUrl(imagePath);
    const relativePath = `src/assets/themes/${file}`;
    // Escape dots for regex
    const escapedPath = relativePath.replace(/\./g, '\\.');
    js = js.replace(new RegExp(escapedPath, 'g'), dataUrl);
    html = html.replace(new RegExp(escapedPath, 'g'), dataUrl);
});

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
const outputFileName = `bubbles_v${version}.html`;
const outputPath = path.join(DIST, outputFileName);
fs.writeFileSync(outputPath, bundled);

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

console.log(`✅ Bundled game created: ${outputPath}`);
console.log(`📦 File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
console.log(`🔖 Version: v${version}`);
console.log(`🖼️  Embedded images: ${figureFiles.length} figures + ${themeFiles.length} themes`);

if (process.argv.includes('--open')) {
    execSync(`open "${outputPath}"`);
}

console.log(`\n🎮 Send this single file to anyone - it works offline!`);
