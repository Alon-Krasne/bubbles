import { Container, Graphics } from 'pixi.js';
import { MAX_PARTICLES, PARTICLES_PER_POOF } from '../game/config';

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  life: number;
  decay: number;
  type: 'star' | 'circle';
  rotation: number;
  rotationSpeed: number;
  active: boolean;
}

export class ParticleSystem extends Container {
  private particles: ParticleData[] = [];
  private graphics: Graphics;

  constructor() {
    super();
    this.graphics = new Graphics();
    this.addChild(this.graphics);

    // Pre-allocate particle pool
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push(this.createParticleData());
    }
  }

  private createParticleData(): ParticleData {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      hue: 0,
      life: 0,
      decay: 0,
      type: 'circle',
      rotation: 0,
      rotationSpeed: 0,
      active: false,
    };
  }

  emitPoof(x: number, y: number, hue: number) {
    let emitted = 0;

    for (let i = 0; i < this.particles.length && emitted < PARTICLES_PER_POOF; i++) {
      const p = this.particles[i];
      if (!p.active) {
        this.resetParticle(p, x, y, hue);
        emitted++;
      }
    }
  }

  private resetParticle(p: ParticleData, x: number, y: number, hue: number) {
    p.x = x;
    p.y = y;
    p.hue = hue;
    p.size = 3 + Math.random() * 6;

    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;

    p.life = 1.0;
    p.decay = 0.015 + Math.random() * 0.02;
    p.type = Math.random() > 0.5 ? 'star' : 'circle';
    p.rotation = Math.random() * Math.PI * 2;
    p.rotationSpeed = (Math.random() - 0.5) * 0.3;
    p.active = true;
  }

  update(deltaTime: number) {
    for (const p of this.particles) {
      if (!p.active) continue;

      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 0.15 * deltaTime;
      p.vx *= Math.pow(0.98, deltaTime);
      p.life -= p.decay * deltaTime;
      p.rotation += p.rotationSpeed * deltaTime;

      if (p.life <= 0) {
        p.active = false;
      }
    }

    this.draw();
  }

  private draw() {
    this.graphics.clear();

    for (const p of this.particles) {
      if (!p.active) continue;

      const color = this.hslToHex(p.hue, 75, 65 + p.life * 15);

      if (p.type === 'star') {
        this.drawStar(p.x, p.y, p.size, p.rotation, color, p.life);
      } else {
        this.graphics.circle(p.x, p.y, p.size);
        this.graphics.fill({ color, alpha: p.life });
      }
    }
  }

  private drawStar(cx: number, cy: number, size: number, rotation: number, color: number, alpha: number) {
    const g = this.graphics;
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;

    g.moveTo(cx + Math.cos(rotation - Math.PI / 2) * outerRadius, cy + Math.sin(rotation - Math.PI / 2) * outerRadius);

    for (let i = 0; i < spikes; i++) {
      const outerAngle = rotation + (i / spikes) * Math.PI * 2 - Math.PI / 2;
      const innerAngle = rotation + ((i + 0.5) / spikes) * Math.PI * 2 - Math.PI / 2;

      g.lineTo(cx + Math.cos(outerAngle) * outerRadius, cy + Math.sin(outerAngle) * outerRadius);
      g.lineTo(cx + Math.cos(innerAngle) * innerRadius, cy + Math.sin(innerAngle) * innerRadius);
    }

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
