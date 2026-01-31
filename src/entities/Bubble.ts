import { Container, Graphics } from 'pixi.js';
import { GROUND_HEIGHT } from '../game/config';

export type FallingItemMode = 'bubbles' | 'vegetables';

const VEGETABLE_TYPES = ['carrot', 'broccoli', 'cucumber', 'tomato', 'corn', 'eggplant'] as const;
type VegetableType = (typeof VEGETABLE_TYPES)[number];

export class Bubble extends Container {
  public radius: number;
  private hue: number;
  private drift: number;
  private wobble: number;
  private wobbleSpeed: number;
  private shimmer = 0;
  private rotationAngle: number;
  private rotationSpeed: number;
  private vegType: VegetableType;
  private mode: FallingItemMode;

  private graphics: Graphics;
  public speed: number;

  constructor(screenWidth: number, mode: FallingItemMode = 'bubbles') {
    super();

    this.mode = mode;
    this.radius = mode === 'bubbles' ? 20 + Math.random() * 30 : 25 + Math.random() * 25;
    this.x = this.radius + Math.random() * (screenWidth - this.radius * 2);
    this.y = -this.radius - Math.random() * 50;
    this.speed = 1.5 + Math.random() * 2;
    this.hue = Math.random() * 360;
    this.drift = (Math.random() - 0.5) * 1.5;
    this.wobble = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.02;
    this.rotationAngle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    this.vegType = VEGETABLE_TYPES[Math.floor(Math.random() * VEGETABLE_TYPES.length)];

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.draw();
  }

  update(deltaTime: number, screenWidth: number, animationTime: number): boolean {
    this.y += this.speed * deltaTime;
    this.wobble += this.wobbleSpeed * deltaTime;
    this.x += Math.sin(this.wobble) * this.drift * deltaTime;
    this.shimmer = (Math.sin(animationTime * 0.1 + this.wobble) + 1) * 0.5;

    if (this.mode === 'vegetables') {
      this.rotationAngle += this.rotationSpeed * deltaTime;
    }

    // Keep in bounds
    if (this.x < this.radius) this.x = this.radius;
    if (this.x > screenWidth - this.radius) this.x = screenWidth - this.radius;

    this.draw();
    return true;
  }

  isOffScreen(screenHeight: number): boolean {
    return this.y > screenHeight - GROUND_HEIGHT + this.radius;
  }

  getHue(): number {
    return this.hue;
  }

  private draw() {
    this.graphics.clear();

    if (this.mode === 'bubbles') {
      this.drawBubble();
    } else {
      this.drawVegetable();
    }
  }

  private drawBubble() {
    const g = this.graphics;

    // Convert hue to RGB for coloring
    const color = this.hslToHex(this.hue, 70, 70);
    const colorLight = this.hslToHex(this.hue, 80, 85);

    // Outer glow
    g.circle(0, 0, this.radius * 1.2);
    g.fill({ color: color, alpha: 0.2 });

    // Main bubble
    g.circle(0, 0, this.radius);
    g.fill({ color: colorLight, alpha: 0.5 });
    g.stroke({ color: color, alpha: 0.4 + this.shimmer * 0.3, width: 2 });

    // Shine highlight
    g.ellipse(-this.radius * 0.35, -this.radius * 0.35, this.radius * 0.25, this.radius * 0.15);
    g.fill({ color: 0xffffff, alpha: 0.6 + this.shimmer * 0.2 });

    // Secondary shine
    g.circle(-this.radius * 0.15, -this.radius * 0.5, this.radius * 0.08);
    g.fill({ color: 0xffffff, alpha: 0.4 + this.shimmer * 0.2 });
  }

  private drawVegetable() {
    const g = this.graphics;
    g.rotation = this.rotationAngle;

    const size = this.radius;

    switch (this.vegType) {
      case 'carrot':
        this.drawCarrot(g, size);
        break;
      case 'broccoli':
        this.drawBroccoli(g, size);
        break;
      case 'cucumber':
        this.drawCucumber(g, size);
        break;
      case 'tomato':
        this.drawTomato(g, size);
        break;
      case 'corn':
        this.drawCorn(g, size);
        break;
      case 'eggplant':
        this.drawEggplant(g, size);
        break;
    }
  }

  private drawCarrot(g: Graphics, size: number) {
    // Orange body
    g.moveTo(0, size);
    g.quadraticCurveTo(-size * 0.5, 0, -size * 0.35, -size * 0.6);
    g.quadraticCurveTo(0, -size * 0.8, size * 0.35, -size * 0.6);
    g.quadraticCurveTo(size * 0.5, 0, 0, size);
    g.fill(0xff6b1a);

    // Green top
    g.ellipse(0, -size * 0.7, size * 0.15, size * 0.3);
    g.fill(0x4caf50);
  }

  private drawBroccoli(g: Graphics, size: number) {
    // Brown stem
    g.roundRect(-size * 0.15, size * 0.1, size * 0.3, size * 0.6, 5);
    g.fill(0x8d6e63);

    // Green florets
    const positions = [
      { x: 0, y: -size * 0.3, r: size * 0.4 },
      { x: -size * 0.35, y: -size * 0.15, r: size * 0.3 },
      { x: size * 0.35, y: -size * 0.15, r: size * 0.3 },
    ];

    positions.forEach((p) => {
      g.circle(p.x, p.y, p.r);
      g.fill(0x4caf50);
    });
  }

  private drawCucumber(g: Graphics, size: number) {
    // Green body
    g.ellipse(0, 0, size * 0.35, size * 0.9);
    g.fill(0x4caf50);

    // Bumps
    for (let i = 0; i < 4; i++) {
      const by = -size * 0.5 + i * size * 0.35;
      g.circle(size * 0.15, by, size * 0.06);
      g.fill(0x388e3c);
    }
  }

  private drawTomato(g: Graphics, size: number) {
    // Red body
    g.circle(0, 0, size * 0.85);
    g.fill(0xf44336);

    // Green stem
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      g.ellipse(Math.cos(angle) * size * 0.15, -size * 0.7 + Math.sin(angle) * size * 0.1, size * 0.08, size * 0.2);
      g.fill(0x4caf50);
    }

    // Shine
    g.ellipse(-size * 0.3, -size * 0.3, size * 0.2, size * 0.12);
    g.fill({ color: 0xffffff, alpha: 0.4 });
  }

  private drawCorn(g: Graphics, size: number) {
    // Yellow body
    g.ellipse(0, 0, size * 0.4, size * 0.85);
    g.fill(0xffeb3b);

    // Kernels
    for (let row = -2; row <= 2; row++) {
      for (let col = -1; col <= 1; col++) {
        const kx = col * size * 0.2;
        const ky = row * size * 0.25;
        g.ellipse(kx, ky, size * 0.08, size * 0.07);
        g.fill(0xffb300);
      }
    }

    // Green husk
    g.moveTo(-size * 0.3, size * 0.7);
    g.quadraticCurveTo(-size * 0.4, size * 1, 0, size * 0.85);
    g.quadraticCurveTo(size * 0.4, size * 1, size * 0.3, size * 0.7);
    g.fill(0x8bc34a);
  }

  private drawEggplant(g: Graphics, size: number) {
    // Purple body
    g.moveTo(0, size * 0.9);
    g.quadraticCurveTo(-size * 0.6, size * 0.3, -size * 0.5, -size * 0.2);
    g.quadraticCurveTo(-size * 0.4, -size * 0.6, 0, -size * 0.65);
    g.quadraticCurveTo(size * 0.4, -size * 0.6, size * 0.5, -size * 0.2);
    g.quadraticCurveTo(size * 0.6, size * 0.3, 0, size * 0.9);
    g.fill(0x7b1fa2);

    // Green cap
    g.ellipse(0, -size * 0.6, size * 0.35, size * 0.15);
    g.fill(0x4caf50);

    // Stem
    g.roundRect(-size * 0.08, -size * 0.9, size * 0.16, size * 0.35, 3);
    g.fill(0x388e3c);
  }

  private hslToHex(h: number, s: number, l: number): number {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color);
    };
    return (f(0) << 16) | (f(8) << 8) | f(4);
  }
}
