import { Container, Graphics } from 'pixi.js';
import { GROUND_HEIGHT } from '../game/config';

export type ParticleBehavior = 'float-up' | 'fall-down' | 'drift' | 'wander' | 'spiral' | 'rise-wobble';
export type ParticleShape = 'circle' | 'star' | 'heart' | 'leaf' | 'diamond';

export interface WeatherConfig {
  particleCount: number;
  colors: number[];
  sizeRange: [number, number];
  behavior: ParticleBehavior;
  speed: [number, number];
  opacity: [number, number];
  glow: boolean;
  shape: ParticleShape | ParticleShape[];
  rotates: boolean;
  pulseGlow?: boolean;
  hueCycle?: boolean;
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  alpha: number;
  targetAlpha: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
  active: boolean;
  age: number;
  lifetime: number; // 0 = infinite (ambient), >0 = burst particle
  wanderAngle: number;
  spiralAngle: number;
  wobbleOffset: number;
  hue: number; // for hue cycling
  glowPulseOffset: number;
}

const MAX_WEATHER_PARTICLES = 150;
const BURST_PARTICLE_COUNT = 10;

export class WeatherParticles extends Container {
  private particles: WeatherParticle[] = [];
  private graphics: Graphics;
  private config: WeatherConfig | null = null;

  private screenWidth = 800;
  private screenHeight = 600;
  private animationTime = 0;

  constructor() {
    super();
    this.graphics = new Graphics();
    this.addChild(this.graphics);

    // Pre-allocate particle pool
    for (let i = 0; i < MAX_WEATHER_PARTICLES; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): WeatherParticle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 4,
      color: 0xffffff,
      alpha: 0,
      targetAlpha: 1,
      rotation: 0,
      rotationSpeed: 0,
      shape: 'circle',
      active: false,
      age: 0,
      lifetime: 0,
      wanderAngle: Math.random() * Math.PI * 2,
      spiralAngle: Math.random() * Math.PI * 2,
      wobbleOffset: Math.random() * Math.PI * 2,
      hue: 0,
      glowPulseOffset: Math.random() * Math.PI * 2,
    };
  }

  resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;

    // Reposition ambient particles on resize
    if (this.config) {
      this.initAmbientParticles();
    }
  }

  setConfig(config: WeatherConfig) {
    this.config = config;
    this.initAmbientParticles();
  }

  private initAmbientParticles() {
    if (!this.config) return;

    // Deactivate all first
    this.particles.forEach((p) => (p.active = false));

    // Activate ambient particles
    const count = Math.min(this.config.particleCount, MAX_WEATHER_PARTICLES - BURST_PARTICLE_COUNT);

    for (let i = 0; i < count; i++) {
      const p = this.particles[i];
      this.resetAmbientParticle(p, true);
    }
  }

  private resetAmbientParticle(p: WeatherParticle, randomY = false) {
    if (!this.config) return;

    const skyHeight = this.screenHeight - GROUND_HEIGHT;

    // Position
    p.x = Math.random() * this.screenWidth;
    p.y = randomY ? Math.random() * skyHeight : this.getSpawnY();

    // Size
    const [minSize, maxSize] = this.config.sizeRange;
    p.size = minSize + Math.random() * (maxSize - minSize);

    // Color
    const colors = this.config.colors;
    p.color = colors[Math.floor(Math.random() * colors.length)];
    p.hue = Math.random() * 360;

    // Opacity
    const [minAlpha, maxAlpha] = this.config.opacity;
    p.targetAlpha = minAlpha + Math.random() * (maxAlpha - minAlpha);
    p.alpha = randomY ? p.targetAlpha : 0; // Fade in if spawning at edge

    // Velocity based on behavior
    const [minSpeed, maxSpeed] = this.config.speed;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    this.setParticleVelocity(p, speed);

    // Shape
    const shapes = Array.isArray(this.config.shape) ? this.config.shape : [this.config.shape];
    p.shape = shapes[Math.floor(Math.random() * shapes.length)];

    // Rotation
    p.rotation = Math.random() * Math.PI * 2;
    p.rotationSpeed = this.config.rotates ? (Math.random() - 0.5) * 0.05 : 0;

    // Reset state
    p.active = true;
    p.age = 0;
    p.lifetime = 0; // Ambient = infinite
    p.wanderAngle = Math.random() * Math.PI * 2;
    p.spiralAngle = Math.random() * Math.PI * 2;
    p.wobbleOffset = Math.random() * Math.PI * 2;
    p.glowPulseOffset = Math.random() * Math.PI * 2;
  }

  private getSpawnY(): number {
    if (!this.config) return 0;

    const skyHeight = this.screenHeight - GROUND_HEIGHT;

    switch (this.config.behavior) {
      case 'float-up':
      case 'spiral':
        return skyHeight + 20; // Spawn below, float up
      case 'fall-down':
        return -20; // Spawn above, fall down
      case 'rise-wobble':
        return skyHeight + 20;
      default:
        return Math.random() * skyHeight; // Random position
    }
  }

  private setParticleVelocity(p: WeatherParticle, speed: number) {
    if (!this.config) return;

    switch (this.config.behavior) {
      case 'float-up':
        p.vy = -speed;
        p.vx = (Math.random() - 0.5) * speed * 0.3;
        break;
      case 'fall-down':
        p.vy = speed;
        p.vx = (Math.random() - 0.5) * speed * 0.5;
        break;
      case 'drift':
        p.vx = speed * (Math.random() > 0.5 ? 1 : -1);
        p.vy = (Math.random() - 0.5) * speed * 0.2;
        break;
      case 'wander':
        p.vx = 0;
        p.vy = 0;
        break;
      case 'spiral':
        p.vy = -speed * 0.5;
        p.vx = 0;
        break;
      case 'rise-wobble':
        p.vy = -speed;
        p.vx = 0;
        break;
    }
  }

  // Burst effect when bubble is caught
  burst(x: number, y: number) {
    if (!this.config) return;

    let emitted = 0;
    const colors = this.config.colors;
    const shapes = Array.isArray(this.config.shape) ? this.config.shape : [this.config.shape];

    for (let i = 0; i < this.particles.length && emitted < BURST_PARTICLE_COUNT; i++) {
      const p = this.particles[i];
      if (!p.active || p.lifetime > 0) {
        // Reuse inactive or find burst slot
        if (p.active && p.lifetime === 0) continue; // Don't steal ambient particles

        p.x = x;
        p.y = y;
        p.size = this.config.sizeRange[0] + Math.random() * (this.config.sizeRange[1] - this.config.sizeRange[0]);
        p.color = colors[Math.floor(Math.random() * colors.length)];
        p.shape = shapes[Math.floor(Math.random() * shapes.length)];

        // Radial burst velocity
        const angle = (emitted / BURST_PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.3;
        const speed = 3 + Math.random() * 4;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;

        p.alpha = 1;
        p.targetAlpha = 1;
        p.rotation = Math.random() * Math.PI * 2;
        p.rotationSpeed = (Math.random() - 0.5) * 0.2;
        p.active = true;
        p.age = 0;
        p.lifetime = 0.5; // Burst particles fade after 0.5s
        p.hue = Math.random() * 360;

        emitted++;
      }
    }
  }

  update(deltaTime: number) {
    if (!this.config) return;

    this.animationTime += deltaTime;
    const dt = deltaTime / 60; // Normalize to ~60fps
    const skyHeight = this.screenHeight - GROUND_HEIGHT;

    for (const p of this.particles) {
      if (!p.active) continue;

      p.age += dt;

      // Burst particle fadeout
      if (p.lifetime > 0) {
        const progress = p.age / p.lifetime;
        p.alpha = 1 - progress;
        p.vy += 0.1 * deltaTime; // Gravity on burst particles

        if (progress >= 1) {
          p.active = false;
          continue;
        }
      } else {
        // Ambient particle - fade in
        if (p.alpha < p.targetAlpha) {
          p.alpha = Math.min(p.alpha + 0.02 * deltaTime, p.targetAlpha);
        }
      }

      // Update position based on behavior
      this.updateParticlePosition(p, deltaTime, dt);

      // Rotation
      p.rotation += p.rotationSpeed * deltaTime;

      // Hue cycling for rainbow theme
      if (this.config.hueCycle) {
        p.hue = (p.hue + deltaTime * 2) % 360;
        p.color = this.hslToHex(p.hue, 80, 70);
      }

      // Check bounds and recycle ambient particles
      if (p.lifetime === 0) {
        const outOfBounds =
          p.y < -50 || p.y > skyHeight + 50 || p.x < -50 || p.x > this.screenWidth + 50;

        if (outOfBounds) {
          this.resetAmbientParticle(p, false);
        }
      }
    }

    this.draw();
  }

  private updateParticlePosition(p: WeatherParticle, deltaTime: number, dt: number) {
    if (!this.config) return;

    switch (this.config.behavior) {
      case 'float-up':
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        // Gentle horizontal drift
        p.x += Math.sin(this.animationTime * 0.02 + p.wobbleOffset) * 0.3;
        break;

      case 'fall-down':
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        // Sway side to side
        p.x += Math.sin(this.animationTime * 0.03 + p.wobbleOffset) * 0.5;
        break;

      case 'drift':
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        // Slow vertical bob
        p.y += Math.sin(this.animationTime * 0.01 + p.wobbleOffset) * 0.2;
        // Wrap horizontally
        if (p.x < -20) p.x = this.screenWidth + 20;
        if (p.x > this.screenWidth + 20) p.x = -20;
        break;

      case 'wander':
        // Firefly-like wandering
        p.wanderAngle += (Math.random() - 0.5) * 0.1 * deltaTime;
        const wanderSpeed = 0.3;
        p.vx += Math.cos(p.wanderAngle) * wanderSpeed * dt;
        p.vy += Math.sin(p.wanderAngle) * wanderSpeed * dt;
        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        // Keep in bounds
        const margin = 50;
        const skyH = this.screenHeight - GROUND_HEIGHT;
        if (p.x < margin) p.vx += 0.1;
        if (p.x > this.screenWidth - margin) p.vx -= 0.1;
        if (p.y < margin) p.vy += 0.1;
        if (p.y > skyH - margin) p.vy -= 0.1;
        break;

      case 'spiral':
        p.spiralAngle += 0.05 * deltaTime;
        const spiralRadius = 15 + Math.sin(p.age * 2) * 5;
        p.x += Math.cos(p.spiralAngle) * spiralRadius * 0.05 * deltaTime;
        p.y += p.vy * deltaTime;
        break;

      case 'rise-wobble':
        p.y += p.vy * deltaTime;
        // Wobble side to side
        p.x += Math.sin(this.animationTime * 0.04 + p.wobbleOffset) * 0.8;
        break;
    }
  }

  private draw() {
    this.graphics.clear();

    for (const p of this.particles) {
      if (!p.active || p.alpha <= 0) continue;

      const glow = this.config?.glow ?? false;
      const pulseGlow = this.config?.pulseGlow ?? false;

      // Draw glow effect first (behind particle)
      if (glow) {
        let glowAlpha = p.alpha * 0.3;
        if (pulseGlow) {
          glowAlpha *= 0.5 + Math.sin(this.animationTime * 0.05 + p.glowPulseOffset) * 0.5;
        }
        this.graphics.circle(p.x, p.y, p.size * 2.5);
        this.graphics.fill({ color: p.color, alpha: glowAlpha });
      }

      // Draw particle shape
      this.drawShape(p);
    }
  }

  private drawShape(p: WeatherParticle) {
    const g = this.graphics;

    switch (p.shape) {
      case 'circle':
        g.circle(p.x, p.y, p.size);
        g.fill({ color: p.color, alpha: p.alpha });
        break;

      case 'star':
        g.star(p.x, p.y, 5, p.size, p.size * 0.5, p.rotation);
        g.fill({ color: p.color, alpha: p.alpha });
        break;

      case 'heart':
        this.drawHeart(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
        break;

      case 'leaf':
        this.drawLeaf(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
        break;

      case 'diamond':
        this.drawDiamond(p.x, p.y, p.size, p.rotation, p.color, p.alpha);
        break;
    }
  }

  private drawHeart(cx: number, cy: number, size: number, rotation: number, color: number, alpha: number) {
    const g = this.graphics;
    const s = size * 0.8;

    // Save transform state by calculating rotated points
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const rotate = (x: number, y: number): [number, number] => [
      cx + x * cos - y * sin,
      cy + x * sin + y * cos,
    ];

    // Heart shape using bezier curves
    const [topX, topY] = rotate(0, -s * 0.3);
    const [leftTopX, leftTopY] = rotate(-s, -s * 0.8);
    const [leftMidX, leftMidY] = rotate(-s, 0);
    const [bottomX, bottomY] = rotate(0, s);
    const [rightMidX, rightMidY] = rotate(s, 0);
    const [rightTopX, rightTopY] = rotate(s, -s * 0.8);

    g.moveTo(topX, topY);
    g.bezierCurveTo(leftTopX, leftTopY, leftMidX, leftMidY, bottomX, bottomY);
    g.bezierCurveTo(rightMidX, rightMidY, rightTopX, rightTopY, topX, topY);
    g.fill({ color, alpha });
  }

  private drawLeaf(cx: number, cy: number, size: number, rotation: number, color: number, alpha: number) {
    const g = this.graphics;

    // Simple oval leaf
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    // Ellipse approximation with bezier
    const w = size * 0.4;
    const h = size;

    const rotate = (x: number, y: number): [number, number] => [
      cx + x * cos - y * sin,
      cy + x * sin + y * cos,
    ];

    const [topX, topY] = rotate(0, -h);
    const [rightX, rightY] = rotate(w, 0);
    const [bottomX, bottomY] = rotate(0, h);
    const [leftX, leftY] = rotate(-w, 0);

    g.moveTo(topX, topY);
    g.quadraticCurveTo(rightX, rightY, bottomX, bottomY);
    g.quadraticCurveTo(leftX, leftY, topX, topY);
    g.fill({ color, alpha });
  }

  private drawDiamond(cx: number, cy: number, size: number, rotation: number, color: number, alpha: number) {
    const g = this.graphics;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const rotate = (x: number, y: number): [number, number] => [
      cx + x * cos - y * sin,
      cy + x * sin + y * cos,
    ];

    const [topX, topY] = rotate(0, -size);
    const [rightX, rightY] = rotate(size * 0.6, 0);
    const [bottomX, bottomY] = rotate(0, size);
    const [leftX, leftY] = rotate(-size * 0.6, 0);

    g.moveTo(topX, topY);
    g.lineTo(rightX, rightY);
    g.lineTo(bottomX, bottomY);
    g.lineTo(leftX, leftY);
    g.closePath();
    g.fill({ color, alpha });
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

  getActiveCount(): number {
    return this.particles.filter((p) => p.active).length;
  }
}
