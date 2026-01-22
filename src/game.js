const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Cached DOM elements (avoid repeated lookups in game loop)
let scoreValEl = null;
let timerValEl = null;

// Game State
let gameState = 'START';
let score = 0;
let timeLeft = 45;
let gameTimer = null;
let p1Name = "לוטם";
let p2Name = "תום";
let animationTime = 0;

// Config
const BUBBLE_SPAWN_RATE = 0.025;
const GROUND_HEIGHT = 120;
const CHARACTER_SIZE = 80;
const CHARACTER_SPEED = 8;

// Performance config
const MAX_PARTICLES = 150;
const PARTICLES_PER_POOF = 15;

// Dev mode - enable with ?dev in URL or localStorage
const DEV_MODE = new URLSearchParams(window.location.search).has('dev') || 
                 localStorage.getItem('bubble_dev_mode') === 'true';

// FPS tracking (dev mode only)
let fpsLastTime = performance.now();
let fpsFrameCount = 0;
let fpsDisplay = 0;

// Background elements
let clouds = [];
let backgroundStars = [];

// Offscreen canvas for static background caching
let bgCanvas = null;
let bgCtx = null;
let bgCacheDirty = true; // Flag to rebuild cache when theme/size changes

// Assets/Entities
let characters = [];
let bubbles = [];

// Theme system - Background worlds
let currentTheme = 'classic';
let isDarkTheme = false; // Keep for backward compatibility

// Background theme definitions
const BACKGROUND_THEMES = {
    classic: {
        name: 'קלאסי',
        icon: '☀️',
        hasImage: false,
        skyTop: '#1e90ff',
        skyMiddle: '#87CEEB', 
        skyBottom: '#E8F4FF',
        grassTop: '#90EE90',
        grassMiddle: '#7EC850',
        grassBottom: '#5a9e3a',
        dynamicElements: 'sparkles', // classic sparkles and sun
        starCount: 15,
        isDark: false
    },
    imagine: {
        name: 'ארץ דמיון',
        icon: '💎',
        hasImage: true,
        imagePath: 'src/assets/themes/imagine.jpg',
        grassTop: '#a8e6cf',
        grassMiddle: '#88d8b0',
        grassBottom: '#6bc5a0',
        dynamicElements: 'diamonds', // floating diamonds and sparkles
        starCount: 20,
        isDark: false
    },
    unicorn: {
        name: 'ארץ החד-קרן',
        icon: '🦄',
        hasImage: true,
        imagePath: 'src/assets/themes/unicorn.jpg',
        grassTop: '#f8bbd9',
        grassMiddle: '#f48fb1',
        grassBottom: '#ec6a9c',
        dynamicElements: 'hearts', // floating hearts and rainbow particles
        starCount: 25,
        isDark: false
    },
    dinosaur: {
        name: 'ארץ הדינוזאורים',
        icon: '🦕',
        hasImage: true,
        imagePath: 'src/assets/themes/dinosaur.jpg',
        grassTop: '#aed581',
        grassMiddle: '#8bc34a',
        grassBottom: '#689f38',
        dynamicElements: 'leaves', // drifting leaves and volcanic wisps
        starCount: 10,
        isDark: false
    },
    castle: {
        name: 'טירת החלומות',
        icon: '🏰',
        hasImage: true,
        imagePath: 'src/assets/themes/castle.jpg',
        grassTop: '#7986cb',
        grassMiddle: '#5c6bc0',
        grassBottom: '#3f51b5',
        dynamicElements: 'lanterns', // floating lanterns and shooting stars
        starCount: 40,
        isDark: true
    }
};

// Theme background images (loaded at init)
const themeBackgroundImages = {};

// Dynamic theme elements
let themeElements = [];

// Colors (will be updated based on theme)
let COLORS = {
    ...BACKGROUND_THEMES.classic,
    pink: '#FF9EB5',
    pinkDark: '#E57A95',
    pinkLight: '#FFD4E0',
    blue: '#7EC8E8',
    blueDark: '#5BA8C8',
    blueLight: '#C5E8F7',
    sun: '#FFE066',
    sunGlow: '#FFF4B8'
};

function loadThemeImages() {
    Object.keys(BACKGROUND_THEMES).forEach(key => {
        const theme = BACKGROUND_THEMES[key];
        if (theme.hasImage) {
            const img = new Image();
            img.src = theme.imagePath;
            themeBackgroundImages[key] = img;
        }
    });
}

function setBackgroundTheme(themeName) {
    if (!BACKGROUND_THEMES[themeName]) return;
    
    currentTheme = themeName;
    const theme = BACKGROUND_THEMES[themeName];
    isDarkTheme = theme.isDark;
    
    // Update colors
    COLORS = { 
        ...COLORS, 
        skyTop: theme.skyTop || COLORS.skyTop,
        skyMiddle: theme.skyMiddle || COLORS.skyMiddle,
        skyBottom: theme.skyBottom || COLORS.skyBottom,
        grassTop: theme.grassTop,
        grassMiddle: theme.grassMiddle,
        grassBottom: theme.grassBottom
    };
    
    localStorage.setItem('bubble_background_theme', themeName);
    
    // Invalidate background cache
    bgCacheDirty = true;
    
    // Regenerate dynamic elements
    initThemeElements();
    initBackgroundStars();
    
    // Update body class for dark themes
    document.body.classList.toggle('dark-theme', theme.isDark);
}

function loadTheme() {
    const saved = localStorage.getItem('bubble_background_theme');
    if (saved && BACKGROUND_THEMES[saved]) {
        setBackgroundTheme(saved);
    }
    
    // Update theme buttons to reflect saved state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === currentTheme);
    });
}

function initThemeElements() {
    themeElements = [];
    const theme = BACKGROUND_THEMES[currentTheme];
    const count = theme.dynamicElements === 'lanterns' ? 12 : 
                  theme.dynamicElements === 'diamonds' ? 15 :
                  theme.dynamicElements === 'hearts' ? 18 :
                  theme.dynamicElements === 'leaves' ? 20 : 10;
    
    for (let i = 0; i < count; i++) {
        themeElements.push({
            x: Math.random() * (canvas?.width || 800),
            y: Math.random() * ((canvas?.height || 600) - GROUND_HEIGHT - 100),
            size: 10 + Math.random() * 20,
            speed: 0.3 + Math.random() * 0.5,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.03,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.01 + Math.random() * 0.02,
            alpha: 0.6 + Math.random() * 0.4,
            hue: Math.random() * 60 - 30 // Color variation
        });
    }
}

const PLAYER_COLOR_DEFAULTS = {
    p1: '#FF9EB5',
    p2: '#7EC8E8'
};

const PLAYER_FIGURE_DEFAULTS = {
    p1: 'blob',
    p2: 'blob'
};

let p1Color = PLAYER_COLOR_DEFAULTS.p1;
let p2Color = PLAYER_COLOR_DEFAULTS.p2;
let p1Figure = PLAYER_FIGURE_DEFAULTS.p1;
let p2Figure = PLAYER_FIGURE_DEFAULTS.p2;

// Figure images
const figureImages = {};
const FIGURE_TYPES = ['unicorn', 'dinosaur', 'puppy', 'princess'];

function loadFigureImages() {
    FIGURE_TYPES.forEach(type => {
        const img = new Image();
        img.src = `src/assets/${type}.png`;
        figureImages[type] = img;
    });
}

function clampColor(value) {
    return Math.max(0, Math.min(255, value));
}

function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    const number = parseInt(normalized, 16);

    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255
    };
}

function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

function adjustColor(hex, amount) {
    const { r, g, b } = hexToRgb(hex);
    const shift = Math.round(255 * amount);

    return rgbToHex(
        clampColor(r + shift),
        clampColor(g + shift),
        clampColor(b + shift)
    );
}

function createColorVariants(baseColor) {
    return {
        base: baseColor,
        dark: adjustColor(baseColor, -0.22),
        light: adjustColor(baseColor, 0.22),
        accent: adjustColor(baseColor, -0.12)
    };
}

function savePlayerColors() {
    localStorage.setItem('bubble_colors', JSON.stringify({ p1: p1Color, p2: p2Color }));
}

function savePlayerFigures() {
    localStorage.setItem('bubble_figures', JSON.stringify({ p1: p1Figure, p2: p2Figure }));
}

function savePlayerNames() {
    localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
}

function loadPlayerNames() {
    const savedNames = JSON.parse(localStorage.getItem('bubble_names') || '{}');
    p1Name = savedNames.p1 || "לוטם";
    p2Name = savedNames.p2 || "תום";
    
    const p1Input = document.getElementById('p1-name');
    const p2Input = document.getElementById('p2-name');
    
    if (p1Input) p1Input.value = p1Name;
    if (p2Input) p2Input.value = p2Name;
    
    // Save names on input change
    p1Input?.addEventListener('input', () => {
        p1Name = p1Input.value || "לוטם";
        savePlayerNames();
    });
    p2Input?.addEventListener('input', () => {
        p2Name = p2Input.value || "תום";
        savePlayerNames();
    });
}

function applyPickerColor(picker, color) {
    const { r, g, b } = hexToRgb(color);

    picker.style.setProperty('--player-color', color);
    picker.style.setProperty('--player-color-soft', `rgba(${r}, ${g}, ${b}, 0.25)`);

    picker.querySelectorAll('.color-petal').forEach(petal => {
        petal.classList.toggle('is-selected', petal.dataset.color === color);
    });
}

function setupColorPickers() {
    const savedColors = JSON.parse(localStorage.getItem('bubble_colors') || '{}');
    p1Color = savedColors.p1 || PLAYER_COLOR_DEFAULTS.p1;
    p2Color = savedColors.p2 || PLAYER_COLOR_DEFAULTS.p2;

    document.querySelectorAll('.player-customizer').forEach(picker => {
        const player = picker.dataset.player;
        const initialColor = player === '1' ? p1Color : p2Color;

        applyPickerColor(picker, initialColor);

        picker.querySelectorAll('.color-petal').forEach(petal => {
            petal.addEventListener('click', () => {
                const color = petal.dataset.color;

                if (player === '1') {
                    p1Color = color;
                } else {
                    p2Color = color;
                }

                applyPickerColor(picker, color);
                savePlayerColors();
            });
        });
    });
}

function setupFigurePickers() {
    const savedFigures = JSON.parse(localStorage.getItem('bubble_figures') || '{}');
    p1Figure = savedFigures.p1 || PLAYER_FIGURE_DEFAULTS.p1;
    p2Figure = savedFigures.p2 || PLAYER_FIGURE_DEFAULTS.p2;

    document.querySelectorAll('.player-customizer').forEach(customizer => {
        const player = customizer.dataset.player;
        const initialFigure = player === '1' ? p1Figure : p2Figure;

        // Set initial selection
        customizer.querySelectorAll('.figure-btn').forEach(btn => {
            btn.classList.toggle('is-selected', btn.dataset.figure === initialFigure);
        });

        // Handle clicks
        customizer.querySelectorAll('.figure-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const figure = btn.dataset.figure;

                if (player === '1') {
                    p1Figure = figure;
                } else {
                    p2Figure = figure;
                }

                // Update selection UI
                customizer.querySelectorAll('.figure-btn').forEach(b => {
                    b.classList.toggle('is-selected', b.dataset.figure === figure);
                });

                savePlayerFigures();
            });
        });
    });
}

// Initialize clouds
function initClouds() {
    clouds = [];
    for (let i = 0; i < 8; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: 50 + Math.random() * 200,
            size: 40 + Math.random() * 80,
            speed: 0.2 + Math.random() * 0.3,
            opacity: 0.4 + Math.random() * 0.4
        });
    }
}

// Initialize decorative floating elements
function initBackgroundStars() {
    backgroundStars = [];
    const starCount = isDarkTheme ? 60 : 15;
    const maxSize = isDarkTheme ? 3 : 4;
    
    for (let i = 0; i < starCount; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - GROUND_HEIGHT - 100),
            size: 1 + Math.random() * maxSize,
            twinkleSpeed: 0.02 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2,
            brightness: 0.5 + Math.random() * 0.5
        });
    }
}

class Character {
    constructor(x, color, name, isGirl, figureType = 'blob') {
        this.x = x;
        this.y = 0;
        const variants = createColorVariants(color);
        this.color = variants.base;
        this.colorDark = variants.dark;
        this.colorLight = variants.light;
        this.colorAccent = variants.accent;
        this.name = name;
        this.width = CHARACTER_SIZE;
        this.height = CHARACTER_SIZE;
        this.vx = 0;
        this.isGirl = isGirl;
        this.figureType = figureType;
        this.bounceOffset = 0;
        this.squish = 1;
        this.targetSquish = 1;
    }

    update() {
        // Movement
        this.x += this.vx;
        if (this.x < 20) this.x = 20;
        if (this.x > canvas.width - this.width - 20) this.x = canvas.width - this.width - 20;
        
        // Bounce animation when moving
        if (Math.abs(this.vx) > 0) {
            this.bounceOffset = Math.sin(animationTime * 0.3) * 5;
            this.targetSquish = 0.9 + Math.abs(Math.sin(animationTime * 0.3)) * 0.1;
        } else {
            this.bounceOffset = Math.sin(animationTime * 0.08) * 2;
            this.targetSquish = 1;
        }
        this.squish += (this.targetSquish - this.squish) * 0.2;
    }

    draw() {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + this.bounceOffset;
        
        ctx.translate(centerX, centerY);
        ctx.scale(1 / this.squish, this.squish);
        
        // Ground shadow
        ctx.save();
        ctx.scale(this.squish, 1 / this.squish);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(0, this.height / 2 + 10 - this.bounceOffset, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (this.figureType === 'blob') {
            this.drawBlob();
        } else {
            this.drawFigureImage();
        }

        ctx.restore();
        
        // Name tag (drawn outside of transform)
        this.drawNameTag(centerX, this.y - 15);
    }
    
    drawFigureImage() {
        const img = figureImages[this.figureType];
        if (img && img.complete) {
            const imgSize = this.width + 40;
            
            // Animated pulsing aura in player's color
            const pulse = 0.8 + Math.sin(animationTime * 0.08) * 0.2;
            const auraSize = imgSize * 0.55 * pulse;
            
            // Outer glow ring
            const outerGlow = ctx.createRadialGradient(0, 5, auraSize * 0.3, 0, 5, auraSize);
            outerGlow.addColorStop(0, this.color + '40'); // 25% opacity
            outerGlow.addColorStop(0.5, this.color + '20'); // 12% opacity
            outerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 5, auraSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner colored glow behind sprite
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 30 * pulse;
            
            // Draw the sprite
            ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            
            ctx.shadowBlur = 0;
        } else {
            // Fallback to blob if image not loaded
            this.drawBlob();
        }
    }
    
    drawBlob() {
        // Body glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 20;
        
        // Main body
        const bodyGrad = ctx.createRadialGradient(-15, -15, 5, 0, 0, this.width / 2);
        bodyGrad.addColorStop(0, this.colorLight);
        bodyGrad.addColorStop(0.5, this.color);
        bodyGrad.addColorStop(1, this.colorDark);
        
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;

        // Body outline
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cheeks (blush)
        ctx.fillStyle = this.isGirl ? 'rgba(255,150,150,0.5)' : 'rgba(150,200,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-20, 8, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(20, 8, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        // Eye whites
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(-12, -5, 10, 12, 0, 0, Math.PI * 2);
        ctx.ellipse(12, -5, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = '#2d3436';
        ctx.beginPath();
        ctx.arc(-12, -3, 5, 0, Math.PI * 2);
        ctx.arc(12, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-14, -6, 2, 0, Math.PI * 2);
        ctx.arc(10, -6, 2, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 5, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Little arms (raised up to catch bubbles!)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 2;
        
        // Left arm
        ctx.beginPath();
        ctx.ellipse(-this.width / 2 - 5, -10, 12, 8, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.ellipse(this.width / 2 + 5, -10, 12, 8, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Little feet
        ctx.beginPath();
        ctx.ellipse(-15, this.height / 2 - 5, 10, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(15, this.height / 2 - 5, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Bow for girl
        if (this.isGirl) {
            ctx.fillStyle = this.colorAccent;
            ctx.strokeStyle = this.colorDark;
            ctx.lineWidth = 2;
            
            // Left ribbon
            ctx.beginPath();
            ctx.moveTo(-5, -this.height / 2 + 5);
            ctx.quadraticCurveTo(-25, -this.height / 2 - 10, -20, -this.height / 2 + 15);
            ctx.quadraticCurveTo(-10, -this.height / 2 + 5, -5, -this.height / 2 + 5);
            ctx.fill();
            ctx.stroke();
            
            // Right ribbon
            ctx.beginPath();
            ctx.moveTo(5, -this.height / 2 + 5);
            ctx.quadraticCurveTo(25, -this.height / 2 - 10, 20, -this.height / 2 + 15);
            ctx.quadraticCurveTo(10, -this.height / 2 + 5, 5, -this.height / 2 + 5);
            ctx.fill();
            ctx.stroke();
            
            // Center knot
            ctx.beginPath();
            ctx.arc(0, -this.height / 2 + 8, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    }
    
    drawNameTag(x, y) {
        ctx.save();
        
        const padding = 12;
        ctx.font = 'bold 18px Assistant, Arial';
        const textWidth = ctx.measureText(this.name).width;
        const tagWidth = textWidth + padding * 2;
        const tagHeight = 28;
        
        // Tag background
        const tagGrad = ctx.createLinearGradient(x - tagWidth/2, y - tagHeight/2, x - tagWidth/2, y + tagHeight/2);
        tagGrad.addColorStop(0, 'rgba(255,255,255,0.95)');
        tagGrad.addColorStop(1, 'rgba(240,240,240,0.95)');
        
        ctx.fillStyle = tagGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        
        ctx.beginPath();
        ctx.roundRect(x - tagWidth/2, y - tagHeight/2, tagWidth, tagHeight, 14);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = this.colorDark;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#2d3436';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, x, y + 1);
        
        ctx.restore();
    }
}

class Bubble {
    constructor() {
        this.radius = 20 + Math.random() * 30;
        this.x = this.radius + Math.random() * (canvas.width - this.radius * 2);
        this.y = -this.radius - Math.random() * 50;
        this.speed = 1.5 + Math.random() * 2;
        this.hue = Math.random() * 360;
        this.drift = (Math.random() - 0.5) * 1.5;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.02;
        this.shimmer = 0;
    }

    update() {
        this.y += this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * this.drift;
        this.shimmer = (Math.sin(animationTime * 0.1 + this.wobble) + 1) * 0.5;
        
        // Keep in bounds
        if (this.x < this.radius) this.x = this.radius;
        if (this.x > canvas.width - this.radius) this.x = canvas.width - this.radius;
    }

    draw() {
        ctx.save();
        
        // Outer glow
        ctx.shadowColor = `hsla(${this.hue}, 70%, 70%, 0.5)`;
        ctx.shadowBlur = 15;
        
        // Main bubble gradient
        const grad = ctx.createRadialGradient(
            this.x - this.radius * 0.3, 
            this.y - this.radius * 0.3, 
            this.radius * 0.1,
            this.x, 
            this.y, 
            this.radius
        );
        grad.addColorStop(0, `hsla(${this.hue}, 80%, 95%, 0.9)`);
        grad.addColorStop(0.3, `hsla(${this.hue}, 70%, 80%, 0.6)`);
        grad.addColorStop(0.7, `hsla(${this.hue}, 60%, 70%, 0.4)`);
        grad.addColorStop(1, `hsla(${this.hue}, 50%, 60%, 0.2)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubble rim
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `hsla(${this.hue}, 60%, 80%, ${0.4 + this.shimmer * 0.3})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Main shine (top-left)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + this.shimmer * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(
            this.x - this.radius * 0.35, 
            this.y - this.radius * 0.35, 
            this.radius * 0.25, 
            this.radius * 0.15, 
            -Math.PI / 4, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        // Secondary shine (smaller)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + this.shimmer * 0.2})`;
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.15, 
            this.y - this.radius * 0.5, 
            this.radius * 0.08, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        // Rainbow rim effect
        ctx.strokeStyle = `hsla(${(this.hue + 60) % 360}, 70%, 70%, ${0.2 + this.shimmer * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Particle pool for object reuse (avoids GC pauses)
const particlePool = [];

class Particle {
    constructor() {
        // Initialize with defaults - actual values set in reset()
        this.x = 0;
        this.y = 0;
        this.hue = 0;
        this.size = 0;
        this.vx = 0;
        this.vy = 0;
        this.life = 0;
        this.decay = 0;
        this.type = 'circle';
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.active = false;
    }
    
    reset(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.size = 3 + Math.random() * 6;
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = 0.015 + Math.random() * 0.02;
        this.type = Math.random() > 0.5 ? 'star' : 'circle';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;
        this.vx *= 0.98;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw() {
        if (!this.active) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Simplified drawing - no gradient for better performance
        // Use solid color with slight transparency based on life
        const lightness = 65 + this.life * 15;
        ctx.fillStyle = `hsla(${this.hue}, 75%, ${lightness}%, ${this.life})`;
        
        if (this.type === 'star') {
            this.drawStar(0, 0, 5, this.size, this.size * 0.5);
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}

// Get a particle from the pool or create a new one
function getParticle(x, y, hue) {
    // First, try to find an inactive particle in the pool
    for (let i = 0; i < particlePool.length; i++) {
        if (!particlePool[i].active) {
            particlePool[i].reset(x, y, hue);
            return particlePool[i];
        }
    }
    
    // If pool is at max capacity, don't create more
    if (particlePool.length >= MAX_PARTICLES) {
        return null;
    }
    
    // Create new particle and add to pool
    const particle = new Particle();
    particle.reset(x, y, hue);
    particlePool.push(particle);
    return particle;
}

// Background Drawing
function drawBackground() {
    const theme = BACKGROUND_THEMES[currentTheme];
    
    // Check if we have a theme background image
    if (theme.hasImage && themeBackgroundImages[currentTheme]?.complete) {
        // Draw the theme background image, scaled to cover full screen
        const img = themeBackgroundImages[currentTheme];
        const targetHeight = canvas.height - GROUND_HEIGHT;
        const scale = Math.max(canvas.width / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (canvas.width - scaledWidth) / 2;
        // Align bottom of image with top of grass
        const y = targetHeight - scaledHeight;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
    } else {
        // Classic theme: draw sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - GROUND_HEIGHT);
        skyGrad.addColorStop(0, COLORS.skyTop);
        skyGrad.addColorStop(0.5, COLORS.skyMiddle);
        skyGrad.addColorStop(1, COLORS.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height - GROUND_HEIGHT);
        
        // Sun or Moon (only for classic theme)
        if (isDarkTheme) {
            drawMoon();
        } else {
            drawSun();
        }
        
        // Clouds (only for classic theme)
        drawClouds();
    }
    
    // Draw theme-specific dynamic elements
    drawThemeElements();
    
    // Floating sparkles/stars
    drawBackgroundStars();
    
    // Grass
    drawGrass();
}

// Draw theme-specific animated elements
function drawThemeElements() {
    const theme = BACKGROUND_THEMES[currentTheme];
    if (!theme.dynamicElements || theme.dynamicElements === 'sparkles') return;
    
    themeElements.forEach((el, i) => {
        // Update element position
        el.wobble += el.wobbleSpeed;
        el.rotation += el.rotationSpeed;
        el.y -= el.speed * 0.3; // Slow float upward
        el.x += Math.sin(el.wobble) * 0.5; // Gentle side-to-side
        
        // Wrap around
        if (el.y < -50) {
            el.y = canvas.height - GROUND_HEIGHT - 50;
            el.x = Math.random() * canvas.width;
        }
        if (el.x < -50) el.x = canvas.width + 50;
        if (el.x > canvas.width + 50) el.x = -50;
        
        const pulse = 0.8 + Math.sin(animationTime * 0.05 + i) * 0.2;
        
        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.globalAlpha = el.alpha * pulse;
        
        switch (theme.dynamicElements) {
            case 'diamonds':
                drawDiamond(0, 0, el.size, el.hue);
                break;
            case 'hearts':
                drawHeart(0, 0, el.size, el.hue);
                break;
            case 'leaves':
                drawLeaf(0, 0, el.size, el.hue);
                break;
            case 'lanterns':
                drawLantern(0, 0, el.size, el.hue);
                break;
        }
        
        ctx.restore();
    });
}

// Floating diamond for "Imagine Lands" theme
function drawDiamond(x, y, size, hueShift) {
    const colors = [
        `hsla(${180 + hueShift}, 70%, 80%, 0.9)`,
        `hsla(${200 + hueShift}, 80%, 90%, 1)`,
        `hsla(${160 + hueShift}, 60%, 70%, 0.8)`
    ];
    
    // Diamond glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    glow.addColorStop(0, `hsla(${180 + hueShift}, 100%, 90%, 0.4)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Diamond shape
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.7, y);
    ctx.lineTo(x, y + size * 0.5);
    ctx.lineTo(x - size * 0.7, y);
    ctx.closePath();
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.lineTo(x, y);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
}

// Floating heart for "Unicorn Land" theme
function drawHeart(x, y, size, hueShift) {
    const hue = 330 + hueShift; // Pink/magenta range
    
    // Heart glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    glow.addColorStop(0, `hsla(${hue}, 100%, 85%, 0.5)`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Heart shape
    ctx.fillStyle = `hsla(${hue}, 80%, 75%, 0.9)`;
    ctx.beginPath();
    const s = size * 0.6;
    ctx.moveTo(x, y + s);
    ctx.bezierCurveTo(x - s * 2, y - s * 0.5, x - s * 2, y - s * 2, x, y - s);
    ctx.bezierCurveTo(x + s * 2, y - s * 2, x + s * 2, y - s * 0.5, x, y + s);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = `hsla(${hue}, 90%, 90%, 0.6)`;
    ctx.beginPath();
    ctx.arc(x - s * 0.4, y - s * 0.6, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// Drifting leaf for "Dinosaur Land" theme
function drawLeaf(x, y, size, hueShift) {
    const hue = 100 + hueShift; // Green range
    
    ctx.fillStyle = `hsla(${hue}, 60%, 50%, 0.8)`;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size, y - size * 0.3, x + size * 0.5, y + size * 0.3);
    ctx.quadraticCurveTo(x, y + size * 0.5, x - size * 0.5, y + size * 0.3);
    ctx.quadraticCurveTo(x - size, y - size * 0.3, x, y - size);
    ctx.fill();
    
    // Leaf vein
    ctx.strokeStyle = `hsla(${hue - 20}, 50%, 35%, 0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.8);
    ctx.lineTo(x, y + size * 0.3);
    ctx.stroke();
}

// Floating lantern for "Dream Castle" theme
function drawLantern(x, y, size, hueShift) {
    const pulse = Math.sin(animationTime * 0.08 + hueShift) * 0.3 + 0.7;
    
    // Lantern glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 3 * pulse);
    glow.addColorStop(0, `rgba(255, 200, 100, ${0.6 * pulse})`);
    glow.addColorStop(0.5, `rgba(255, 180, 80, ${0.3 * pulse})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, size * 3 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Lantern body
    ctx.fillStyle = `rgba(255, 220, 150, ${0.9 * pulse})`;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Lantern top
    ctx.fillStyle = 'rgba(139, 69, 19, 0.7)';
    ctx.fillRect(x - size * 0.3, y - size, size * 0.6, size * 0.3);
    
    // Inner flame
    ctx.fillStyle = `rgba(255, 255, 200, ${pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
}

function drawSun() {
    const sunX = canvas.width - 120;
    const sunY = 100;
    const sunRadius = 50;
    const pulse = Math.sin(animationTime * 0.03) * 0.15 + 1;
    
    // Simplified: Single outer glow (was 4 halo rings)
    const glowGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.3, sunX, sunY, sunRadius * 2.5 * pulse);
    glowGrad.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
    glowGrad.addColorStop(0.3, 'rgba(255, 240, 180, 0.5)');
    glowGrad.addColorStop(0.6, 'rgba(255, 220, 130, 0.2)');
    glowGrad.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Simplified: 8 rays instead of 16 (no individual gradients)
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(animationTime * 0.004);
    ctx.fillStyle = 'rgba(255, 245, 180, 0.35)';
    
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const rayLength = sunRadius * 1.8;
        const rayWidth = 6;
        
        ctx.save();
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(-rayWidth, -sunRadius + 5);
        ctx.lineTo(0, -sunRadius - rayLength);
        ctx.lineTo(rayWidth, -sunRadius + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    ctx.restore();
    
    // Sun body with layered gradients for depth
    const sunGrad = ctx.createRadialGradient(sunX - 20, sunY - 20, 5, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, '#FFFEF5');
    sunGrad.addColorStop(0.3, '#FFF4C4');
    sunGrad.addColorStop(0.7, '#FFE566');
    sunGrad.addColorStop(1, '#FFCC00');
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight (makes it look 3D/spherical)
    const highlightGrad = ctx.createRadialGradient(sunX - 18, sunY - 18, 2, sunX - 10, sunY - 10, sunRadius * 0.6);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    highlightGrad.addColorStop(0.3, 'rgba(255, 255, 240, 0.4)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 200, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Cute kawaii face on the sun
    ctx.fillStyle = '#F5A623';
    // Closed happy eyes (curved lines)
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#E8940F';
    
    // Left eye (happy arc)
    ctx.beginPath();
    ctx.arc(sunX - 15, sunY - 5, 8, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    
    // Right eye (happy arc)  
    ctx.beginPath();
    ctx.arc(sunX + 15, sunY - 5, 8, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
    
    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(sunX - 28, sunY + 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sunX + 28, sunY + 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#E8940F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(sunX, sunY + 8, 12, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
}

function drawMoon() {
    const moonX = canvas.width - 120;
    const moonY = 100;
    const moonRadius = 45;
    const pulse = Math.sin(animationTime * 0.02) * 0.08 + 1;
    
    // Simplified: Single glow (was 5 halo rings + separate glow)
    const glowGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.3, moonX, moonY, moonRadius * 2.5 * pulse);
    glowGrad.addColorStop(0, 'rgba(220, 230, 255, 0.5)');
    glowGrad.addColorStop(0.4, 'rgba(180, 200, 240, 0.2)');
    glowGrad.addColorStop(1, 'rgba(150, 180, 220, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.5 * pulse, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon body
    const moonGrad = ctx.createRadialGradient(moonX - 15, moonY - 15, 5, moonX, moonY, moonRadius);
    moonGrad.addColorStop(0, '#FFFFF8');
    moonGrad.addColorStop(0.3, '#F5F5F0');
    moonGrad.addColorStop(0.7, '#E8E8E0');
    moonGrad.addColorStop(1, '#D8D8D0');
    
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters (subtle)
    ctx.fillStyle = 'rgba(200, 200, 190, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX - 12, moonY - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 15, moonY + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 5, moonY + 15, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 8, moonY - 18, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    const highlightGrad = ctx.createRadialGradient(moonX - 18, moonY - 18, 2, moonX - 10, moonY - 10, moonRadius * 0.5);
    highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sleepy kawaii face
    ctx.strokeStyle = 'rgba(180, 180, 170, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // Closed sleepy eyes (downward arcs)
    ctx.beginPath();
    ctx.arc(moonX - 12, moonY - 3, 6, Math.PI * 0.3, Math.PI * 0.7);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(moonX + 12, moonY - 3, 6, Math.PI * 0.3, Math.PI * 0.7);
    ctx.stroke();
    
    // Soft blush
    ctx.fillStyle = 'rgba(255, 180, 200, 0.25)';
    ctx.beginPath();
    ctx.ellipse(moonX - 22, moonY + 5, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(moonX + 22, moonY + 5, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Gentle smile
    ctx.strokeStyle = 'rgba(180, 180, 170, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(moonX, moonY + 8, 8, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
}

function drawClouds() {
    clouds.forEach((cloud, index) => {
        // Parallax - clouds at different depths move at different speeds
        const depthFactor = 0.5 + (index % 3) * 0.3;
        cloud.x += cloud.speed * depthFactor;
        if (cloud.x > canvas.width + cloud.size * 2) {
            cloud.x = -cloud.size * 2;
        }
        
        const cx = cloud.x;
        const cy = cloud.y;
        const s = cloud.size;
        
        // Gentle bobbing animation
        const bobY = cy + Math.sin(animationTime * 0.015 + index * 2) * 3;
        
        // Cloud shadow (offset below)
        ctx.fillStyle = `rgba(180, 200, 220, ${cloud.opacity * 0.12})`;
        ctx.beginPath();
        ctx.ellipse(cx + s * 0.5, bobY + s * 0.4, s * 0.8, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Main cloud body with gradient for depth
        const cloudGrad = ctx.createRadialGradient(cx + s * 0.3, bobY - s * 0.2, s * 0.1, cx + s * 0.5, bobY + s * 0.1, s);
        cloudGrad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity})`);
        cloudGrad.addColorStop(0.5, `rgba(250, 252, 255, ${cloud.opacity * 0.95})`);
        cloudGrad.addColorStop(1, `rgba(235, 245, 255, ${cloud.opacity * 0.7})`);
        ctx.fillStyle = cloudGrad;
        
        // Draw organic cloud shape with bezier curves
        ctx.beginPath();
        ctx.moveTo(cx - s * 0.3, bobY + s * 0.15);
        
        // Left bulge
        ctx.bezierCurveTo(
            cx - s * 0.5, bobY + s * 0.1,
            cx - s * 0.5, bobY - s * 0.2,
            cx - s * 0.2, bobY - s * 0.25
        );
        
        // First top bump
        ctx.bezierCurveTo(
            cx - s * 0.1, bobY - s * 0.45,
            cx + s * 0.15, bobY - s * 0.5,
            cx + s * 0.3, bobY - s * 0.35
        );
        
        // Second top bump (tallest)
        ctx.bezierCurveTo(
            cx + s * 0.4, bobY - s * 0.55,
            cx + s * 0.7, bobY - s * 0.5,
            cx + s * 0.8, bobY - s * 0.3
        );
        
        // Third top bump
        ctx.bezierCurveTo(
            cx + s * 0.95, bobY - s * 0.4,
            cx + s * 1.15, bobY - s * 0.25,
            cx + s * 1.1, bobY - s * 0.05
        );
        
        // Right side down
        ctx.bezierCurveTo(
            cx + s * 1.2, bobY + s * 0.1,
            cx + s * 1.1, bobY + s * 0.25,
            cx + s * 0.9, bobY + s * 0.2
        );
        
        // Bottom (flatter, gentle curves)
        ctx.bezierCurveTo(
            cx + s * 0.7, bobY + s * 0.28,
            cx + s * 0.4, bobY + s * 0.25,
            cx + s * 0.2, bobY + s * 0.22
        );
        
        ctx.bezierCurveTo(
            cx, bobY + s * 0.25,
            cx - s * 0.15, bobY + s * 0.22,
            cx - s * 0.3, bobY + s * 0.15
        );
        
        ctx.closePath();
        ctx.fill();
        
        // Highlight on top-left area
        const shineGrad = ctx.createRadialGradient(cx + s * 0.1, bobY - s * 0.25, 0, cx + s * 0.2, bobY - s * 0.1, s * 0.5);
        shineGrad.addColorStop(0, `rgba(255, 255, 255, ${cloud.opacity * 0.7})`);
        shineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${cloud.opacity * 0.2})`);
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shineGrad;
        ctx.beginPath();
        ctx.ellipse(cx + s * 0.15, bobY - s * 0.2, s * 0.35, s * 0.25, -0.3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawBackgroundStars() {
    backgroundStars.forEach((star, i) => {
        const twinkle = (Math.sin(animationTime * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5;
        const size = star.size * (0.8 + twinkle * 0.5);
        const baseAlpha = isDarkTheme ? 0.6 : 0.4;
        const alpha = baseAlpha + twinkle * (isDarkTheme ? 0.4 : 0.6);
        const brightness = star.brightness || 1;
        
        if (isDarkTheme) {
            // Night mode: simple glowing dots with color tints
            const colors = [
                [255, 255, 255],    // white
                [200, 220, 255],    // blue-white
                [255, 240, 200],    // warm white
                [220, 200, 255],    // purple tint
            ];
            const color = colors[i % colors.length];
            
            // Soft glow
            const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 4);
            glowGrad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * brightness * 0.4})`);
            glowGrad.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * brightness * 0.1})`);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Star core
            ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Day mode: sparkle shapes
            // Outer glow
            const glowGrad = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
            glowGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
            glowGrad.addColorStop(0.5, `rgba(255, 250, 220, ${alpha * 0.2})`);
            glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw 4-point sparkle shape
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate(animationTime * 0.01 + i);
            
            // Vertical spike
            ctx.beginPath();
            ctx.moveTo(0, -size * 1.5);
            ctx.quadraticCurveTo(size * 0.3, 0, 0, size * 1.5);
            ctx.quadraticCurveTo(-size * 0.3, 0, 0, -size * 1.5);
            ctx.fill();
            
            // Horizontal spike
            ctx.beginPath();
            ctx.moveTo(-size * 1.5, 0);
            ctx.quadraticCurveTo(0, size * 0.3, size * 1.5, 0);
            ctx.quadraticCurveTo(0, -size * 0.3, -size * 1.5, 0);
            ctx.fill();
            
            // Center bright dot
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.3)})`;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    });
}

function drawGrass() {
    const groundY = canvas.height - GROUND_HEIGHT;
    
    // Main grass gradient
    const grassGrad = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    grassGrad.addColorStop(0, COLORS.grassTop);
    grassGrad.addColorStop(0.3, COLORS.grassMiddle);
    grassGrad.addColorStop(1, COLORS.grassBottom);
    
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, groundY, canvas.width, GROUND_HEIGHT);
    
    // Grass texture - wavy top
    ctx.fillStyle = COLORS.grassTop;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    
    for (let x = 0; x <= canvas.width; x += 20) {
        const waveY = groundY + Math.sin(x * 0.05 + animationTime * 0.02) * 5;
        ctx.lineTo(x, waveY);
    }
    ctx.lineTo(canvas.width, groundY + 20);
    ctx.lineTo(0, groundY + 20);
    ctx.closePath();
    ctx.fill();
    
    // Grass blades
    ctx.strokeStyle = COLORS.grassBottom;
    ctx.lineWidth = 2;
    
    for (let x = 10; x < canvas.width; x += 30) {
        const bladeHeight = 15 + Math.sin(x) * 8;
        const sway = Math.sin(animationTime * 0.03 + x * 0.1) * 3;
        
        ctx.beginPath();
        ctx.moveTo(x, groundY + 5);
        ctx.quadraticCurveTo(x + sway, groundY - bladeHeight / 2, x + sway * 1.5, groundY - bladeHeight);
        ctx.stroke();
        
        // Second blade
        ctx.beginPath();
        ctx.moveTo(x + 10, groundY + 5);
        ctx.quadraticCurveTo(x + 10 - sway * 0.5, groundY - bladeHeight / 2 + 3, x + 10 - sway, groundY - bladeHeight + 5);
        ctx.stroke();
    }
    
    // Small flowers
    for (let x = 50; x < canvas.width; x += 150) {
        const flowerY = groundY + 15;
        const bobble = Math.sin(animationTime * 0.05 + x) * 2;
        
        // Stem
        ctx.strokeStyle = '#5a9e3a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, flowerY + 10);
        ctx.quadraticCurveTo(x + bobble, flowerY, x + bobble * 2, flowerY - 15);
        ctx.stroke();
        
        // Flower
        const flowerColors = ['#FFB6C1', '#87CEEB', '#FFD700', '#DDA0DD'];
        ctx.fillStyle = flowerColors[Math.floor(x / 150) % flowerColors.length];
        
        for (let p = 0; p < 5; p++) {
            const angle = (p / 5) * Math.PI * 2 + animationTime * 0.01;
            const petalX = x + bobble * 2 + Math.cos(angle) * 6;
            const petalY = flowerY - 15 + Math.sin(angle) * 6;
            ctx.beginPath();
            ctx.arc(petalX, petalY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + bobble * 2, flowerY - 15, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createPoof(x, y, hue) {
    for (let i = 0; i < PARTICLES_PER_POOF; i++) {
        getParticle(x, y, hue);
    }
}

// Initialization
function init() {
    // Cache DOM elements for game loop
    scoreValEl = document.getElementById('score-val');
    timerValEl = document.getElementById('timer-val');
    
    loadThemeImages();
    loadTheme();
    loadFigureImages();
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
    }
    resize();
    initClouds();
    initBackgroundStars();
    initThemeElements();
    window.addEventListener('resize', () => {
        resize();
        initClouds();
        initBackgroundStars();
        initThemeElements();
    });
    setupControls();
    setupColorPickers();
    setupFigurePickers();
    setupThemeSelector();
    loadPlayerNames();
    loadHighScores();
    requestAnimationFrame(gameLoop);
}

// Setup theme selector buttons
function setupThemeSelector() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setBackgroundTheme(btn.dataset.theme);
        });
    });
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Resize/create offscreen background canvas
    if (!bgCanvas) {
        bgCanvas = document.createElement('canvas');
        bgCtx = bgCanvas.getContext('2d');
    }
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCacheDirty = true; // Force redraw of cached background
    
    if (characters.length > 0) {
        characters.forEach(c => {
            c.y = canvas.height - GROUND_HEIGHT - CHARACTER_SIZE + 10;
        });
    }
}

function setupControls() {
    const keys = {};
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        // Only prevent default during gameplay (allow typing in inputs)
        if (gameState === 'PLAYING') {
            e.preventDefault();
        }
    });
    window.addEventListener('keyup', e => keys[e.code] = false);

    function handleInput() {
        if (gameState !== 'PLAYING') return;

        characters[0].vx = 0;
        if (keys['KeyA']) characters[0].vx = -CHARACTER_SPEED;
        if (keys['KeyD']) characters[0].vx = CHARACTER_SPEED;

        characters[1].vx = 0;
        if (keys['ArrowLeft']) characters[1].vx = -CHARACTER_SPEED;
        if (keys['ArrowRight']) characters[1].vx = CHARACTER_SPEED;
    }
    
    window.handleInput = handleInput;
}

function startGame() {
    p1Name = document.getElementById('p1-name').value || "לוטם";
    p2Name = document.getElementById('p2-name').value || "תום";
    
    const activeTimeBtn = document.querySelector('.timer-btn.active');
    timeLeft = parseInt(activeTimeBtn.dataset.time);
    
    score = 0;
    bubbles = [];
    // Reset all particles in pool (mark inactive, don't deallocate)
    for (let i = 0; i < particlePool.length; i++) {
        particlePool[i].active = false;
    }
    
    characters = [
        new Character(canvas.width * 0.3, p1Color, p1Name, true, p1Figure),
        new Character(canvas.width * 0.6, p2Color, p2Name, false, p2Figure)
    ];
    resize();

    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('end-screen').classList.remove('active');
    document.getElementById('game-hud').classList.add('active');
    
    gameState = 'PLAYING';
    
    scoreValEl.innerText = '0';
    timerValEl.innerText = timeLeft;

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        timerValEl.innerText = timeLeft;
        if (timeLeft <= 0) endGame();
    }, 1000);
}

function endGame() {
    gameState = 'END';
    clearInterval(gameTimer);
    
    document.getElementById('game-hud').classList.remove('active');
    document.getElementById('end-screen').classList.add('active');
    document.getElementById('final-score-val').innerText = score;
    
    saveHighScore(score, p1Name, p2Name);
    loadHighScores();
}

function gameLoop() {
    animationTime++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();

    if (gameState === 'PLAYING') {
        window.handleInput();

        if (Math.random() < BUBBLE_SPAWN_RATE) {
            bubbles.push(new Bubble());
        }

        // Draw bubbles behind characters
        bubbles.forEach(b => {
            b.update();
            b.draw();
        });

        characters.forEach(c => {
            c.update();
            c.draw();
        });

        // Collision detection
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i];

            if (b.y > canvas.height - GROUND_HEIGHT + b.radius) {
                bubbles.splice(i, 1);
                continue;
            }

            for (const c of characters) {
                const dx = b.x - (c.x + c.width / 2);
                const dy = b.y - (c.y + c.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < b.radius + c.width / 2) {
                    score++;
                    scoreValEl.innerText = score;
                    createPoof(b.x, b.y, b.hue);
                    bubbles.splice(i, 1);
                    break;
                }
            }
        }

        // Particles (using object pool - no splice needed)
        for (let i = 0; i < particlePool.length; i++) {
            const p = particlePool[i];
            if (p.active) {
                p.update();
                p.draw();
            }
        }
    }

    // FPS counter (dev mode only)
    if (DEV_MODE) {
        drawDevOverlay();
    }

    requestAnimationFrame(gameLoop);
}

// Dev overlay with FPS and stats
function drawDevOverlay() {
    // Update FPS every 500ms
    fpsFrameCount++;
    const now = performance.now();
    if (now - fpsLastTime >= 500) {
        fpsDisplay = Math.round(fpsFrameCount / ((now - fpsLastTime) / 1000));
        fpsFrameCount = 0;
        fpsLastTime = now;
    }
    
    // Count active particles
    let activeParticles = 0;
    for (let i = 0; i < particlePool.length; i++) {
        if (particlePool[i].active) activeParticles++;
    }
    
    // Draw overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 180, 70);
    
    ctx.font = '14px monospace';
    ctx.fillStyle = fpsDisplay >= 55 ? '#4ade80' : fpsDisplay >= 30 ? '#fbbf24' : '#f87171';
    ctx.fillText(`FPS: ${fpsDisplay}`, 20, 30);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(`Particles: ${activeParticles}/${particlePool.length}`, 20, 48);
    ctx.fillText(`Bubbles: ${bubbles.length}`, 20, 66);
    
    ctx.restore();
}

// Persistence
function saveHighScore(s, n1, n2) {
    let scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');
    scores.push({ score: s, names: `${n1} & ${n2}`, date: new Date().toLocaleDateString('he-IL') });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);
    localStorage.setItem('bubble_scores', JSON.stringify(scores));
}

function loadHighScores() {
    const scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');
    const list = document.getElementById('scores-list');
    const tableBody = document.querySelector('#full-scores-table tbody');
    
    if (list) list.innerHTML = scores.map(s => `<li>${s.names}: ${s.score}</li>`).join('');

    if (tableBody) {
        const medalEmojis = ['🥇', '🥈', '🥉'];
        const medalClasses = ['medal-gold', 'medal-silver', 'medal-bronze'];

        tableBody.innerHTML = scores.map((s, i) => {
            const medal = medalEmojis[i] || (i + 1);
            const rowClass = medalClasses[i] || '';

            return `
                <tr class="${rowClass}">
                    <td>${medal}</td>
                    <td>${s.names}</td>
                    <td>${s.score}</td>
                </tr>
            `;
        }).join('');
    }
}

// UI Handlers
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('end-screen').classList.remove('active');
    document.getElementById('start-screen').classList.add('active');
});

document.querySelectorAll('.timer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Theme selection is now handled via setupThemeSelector() in init()

init();
