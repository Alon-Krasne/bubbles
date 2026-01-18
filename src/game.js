const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

// Background elements
let clouds = [];
let backgroundStars = [];

// Assets/Entities
let characters = [];
let bubbles = [];
let particles = [];

// Colors
const COLORS = {
    skyTop: '#1e90ff',
    skyMiddle: '#87CEEB', 
    skyBottom: '#E8F4FF',
    grassTop: '#90EE90',
    grassMiddle: '#7EC850',
    grassBottom: '#5a9e3a',
    pink: '#FF9EB5',
    pinkDark: '#E57A95',
    pinkLight: '#FFD4E0',
    blue: '#7EC8E8',
    blueDark: '#5BA8C8',
    blueLight: '#C5E8F7',
    sun: '#FFE066',
    sunGlow: '#FFF4B8'
};

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
    for (let i = 0; i < 15; i++) {
        backgroundStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - GROUND_HEIGHT - 100),
            size: 2 + Math.random() * 4,
            twinkleSpeed: 0.02 + Math.random() * 0.03,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
}

class Character {
    constructor(x, color, name, isGirl) {
        this.x = x;
        this.y = 0;
        this.color = isGirl ? COLORS.pink : COLORS.blue;
        this.colorDark = isGirl ? COLORS.pinkDark : COLORS.blueDark;
        this.colorLight = isGirl ? COLORS.pinkLight : COLORS.blueLight;
        this.name = name;
        this.width = CHARACTER_SIZE;
        this.height = CHARACTER_SIZE;
        this.vx = 0;
        this.isGirl = isGirl;
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
            ctx.fillStyle = '#FF6B8A';
            ctx.strokeStyle = '#D94A6A';
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

        ctx.restore();
        
        // Name tag (drawn outside of transform)
        this.drawNameTag(centerX, this.y - 15);
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

class Particle {
    constructor(x, y, hue) {
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
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15;
        this.vx *= 0.98;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0, `hsla(${this.hue}, 80%, 70%, 1)`);
        grad.addColorStop(0.5, `hsla(${this.hue}, 70%, 60%, 0.8)`);
        grad.addColorStop(1, `hsla(${this.hue}, 60%, 50%, 0)`);
        
        ctx.fillStyle = grad;
        
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
        let step = Math.PI / spikes;
        
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

// Background Drawing
function drawBackground() {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - GROUND_HEIGHT);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(0.5, COLORS.skyMiddle);
    skyGrad.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height - GROUND_HEIGHT);
    
    // Sun
    drawSun();
    
    // Clouds
    drawClouds();
    
    // Floating sparkles
    drawBackgroundStars();
    
    // Grass
    drawGrass();
}

function drawSun() {
    const sunX = canvas.width - 120;
    const sunY = 100;
    const sunRadius = 50;
    
    // Sun glow
    const glowGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.5, sunX, sunY, sunRadius * 3);
    glowGrad.addColorStop(0, 'rgba(255, 244, 184, 0.8)');
    glowGrad.addColorStop(0.3, 'rgba(255, 224, 102, 0.3)');
    glowGrad.addColorStop(1, 'rgba(255, 224, 102, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(sunX - sunRadius * 3, sunY - sunRadius * 3, sunRadius * 6, sunRadius * 6);
    
    // Sun rays
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(animationTime * 0.005);
    
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = 'rgba(255, 240, 150, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, -sunRadius - 10);
        ctx.lineTo(-8, -sunRadius - 40);
        ctx.lineTo(8, -sunRadius - 40);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();
    
    // Sun body
    const sunGrad = ctx.createRadialGradient(sunX - 15, sunY - 15, 5, sunX, sunY, sunRadius);
    sunGrad.addColorStop(0, '#FFF9E0');
    sunGrad.addColorStop(0.5, COLORS.sun);
    sunGrad.addColorStop(1, '#FFD700');
    
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawClouds() {
    clouds.forEach(cloud => {
        cloud.x += cloud.speed;
        if (cloud.x > canvas.width + cloud.size * 2) {
            cloud.x = -cloud.size * 2;
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
        
        // Draw fluffy cloud
        const cx = cloud.x;
        const cy = cloud.y;
        const s = cloud.size;
        
        ctx.beginPath();
        ctx.arc(cx, cy, s * 0.5, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.4, cy - s * 0.1, s * 0.4, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.8, cy, s * 0.35, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.3, cy + s * 0.2, s * 0.3, 0, Math.PI * 2);
        ctx.arc(cx + s * 0.6, cy + s * 0.15, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawBackgroundStars() {
    backgroundStars.forEach(star => {
        const twinkle = (Math.sin(animationTime * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + twinkle * 0.5})`;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
        ctx.fill();
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
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, hue));
    }
}

// Initialization
function init() {
    resize();
    initClouds();
    initBackgroundStars();
    window.addEventListener('resize', () => {
        resize();
        initClouds();
        initBackgroundStars();
    });
    setupControls();
    loadHighScores();
    requestAnimationFrame(gameLoop);
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
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
        e.preventDefault();
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
    particles = [];
    
    characters = [
        new Character(canvas.width * 0.3, COLORS.pink, p1Name, true),
        new Character(canvas.width * 0.6, COLORS.blue, p2Name, false)
    ];
    resize();

    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('end-screen').classList.remove('active');
    document.getElementById('game-hud').classList.add('active');
    
    gameState = 'PLAYING';
    
    document.getElementById('score-val').innerText = '0';
    document.getElementById('timer-val').innerText = timeLeft;

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-val').innerText = timeLeft;
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
                    document.getElementById('score-val').innerText = score;
                    createPoof(b.x, b.y, b.hue);
                    bubbles.splice(i, 1);
                    break;
                }
            }
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);
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

init();
