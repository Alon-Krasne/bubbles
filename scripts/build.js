#!/usr/bin/env node

/**
 * Build script for Cloudflare Pages deployment.
 * Creates dist/index.html with embedded assets.
 */

const fs = require('fs');
const path = require('path');

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

// Embed character figure images in JS and HTML
const figureTypes = ['unicorn', 'dinosaur', 'puppy', 'princess'];
figureTypes.forEach(type => {
    const imagePath = path.join(ASSETS, `${type}.png`);
    if (fs.existsSync(imagePath)) {
        const dataUrl = imageToDataUrl(imagePath);
        js = js.replace(
            new RegExp(`src/assets/${type}\\.png`, 'g'),
            dataUrl
        );
        html = html.replace(
            new RegExp(`src/assets/${type}\\.png`, 'g'),
            dataUrl
        );
    }
});

// Embed theme background images in JS (JPG format for smaller bundle)
const themeImages = ['imagine', 'unicorn', 'dinosaur', 'castle'];
themeImages.forEach(theme => {
    const imagePath = path.join(ASSETS, 'themes', `${theme}.jpg`);
    if (fs.existsSync(imagePath)) {
        const dataUrl = imageToDataUrl(imagePath);
        js = js.replace(
            new RegExp(`src/assets/themes/${theme}\\.jpg`, 'g'),
            dataUrl
        );
    }
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
const outputPath = path.join(DIST, 'index.html');
fs.writeFileSync(outputPath, bundled);

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

console.log(`Build complete: ${outputPath}`);
console.log(`File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
console.log(`Version: v${version}`);
console.log(`Embedded images: ${figureTypes.length} figures + ${themeImages.length} themes`);
console.log('\nDeploy dist/index.html to Cloudflare Pages.');
