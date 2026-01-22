#!/usr/bin/env node

/**
 * Bundle script for בועות! game
 * Creates a single self-contained HTML file with embedded images
 * Auto-increments version based on existing files in dist/
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const ASSETS = path.join(SRC, 'assets');

// Auto-detect next version from existing dist files
function getNextVersion() {
    if (!fs.existsSync(DIST)) return 1;
    
    const files = fs.readdirSync(DIST);
    const versionPattern = /_v(\d+)\.html$/i;
    
    let maxVersion = 0;
    files.forEach(file => {
        const match = file.match(versionPattern);
        if (match) {
            const version = parseInt(match[1], 10);
            if (version > maxVersion) maxVersion = version;
        }
    });
    
    return maxVersion + 1;
}

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
// Auto-increment version based on dist folder contents
const nextVersion = getNextVersion();

// Embed character figure images in JS
const figureTypes = ['unicorn', 'dinosaur', 'puppy', 'princess'];
figureTypes.forEach(type => {
    const imagePath = path.join(ASSETS, `${type}.png`);
    if (fs.existsSync(imagePath)) {
        const dataUrl = imageToDataUrl(imagePath);
        // Replace the image path in JS
        js = js.replace(
            new RegExp(`src/assets/${type}\\.png`, 'g'),
            dataUrl
        );
        // Replace the image path in HTML
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
        // Replace the image path in JS
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
const outputFileName = `bubbles_v${nextVersion}.html`;
const outputPath = path.join(DIST, outputFileName);
fs.writeFileSync(outputPath, bundled);

const fileSizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);

console.log(`✅ Bundled game created: ${outputPath}`);
console.log(`📦 File size: ${fileSizeKB} KB (${fileSizeMB} MB)`);
console.log(`🔖 Version: v${nextVersion}`);
console.log(`🖼️  Embedded images: ${figureTypes.length} figures + ${themeImages.length} themes`);

if (process.argv.includes('--open')) {
    execSync(`open "${outputPath}"`);
}

console.log(`\n🎮 Send this single file to anyone - it works offline!`);
