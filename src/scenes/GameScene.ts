import { Container } from 'pixi.js';
import { Character, FigureType } from '../entities/Character';
import { Bubble, FallingItemMode } from '../entities/Bubble';
import { ParticleSystem } from '../entities/Particle';
import { BUBBLE_SPAWN_RATE } from '../game/config';

export interface PlayerConfig {
  name: string;
  color: number;
  figureType: FigureType;
  isGirl: boolean;
}

export class GameScene extends Container {
  private characters: Character[] = [];
  private bubbles: Bubble[] = [];
  private particles: ParticleSystem;

  private screenWidth = 800;
  private screenHeight = 600;
  private animationTime = 0;
  private fallingItemsMode: FallingItemMode = 'bubbles';

  public score = 0;

  constructor() {
    super();

    this.particles = new ParticleSystem();
    this.addChild(this.particles);
  }

  resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  startGame(p1Config: PlayerConfig, p2Config: PlayerConfig) {
    // Clear existing entities
    this.characters.forEach((c) => c.destroy());
    this.characters = [];
    this.bubbles.forEach((b) => b.destroy());
    this.bubbles = [];
    this.score = 0;

    // Create characters
    const p1 = new Character({
      x: this.screenWidth * 0.3,
      color: p1Config.color,
      name: p1Config.name,
      isGirl: p1Config.isGirl,
      figureType: p1Config.figureType,
      screenHeight: this.screenHeight,
    });

    const p2 = new Character({
      x: this.screenWidth * 0.6,
      color: p2Config.color,
      name: p2Config.name,
      isGirl: p2Config.isGirl,
      figureType: p2Config.figureType,
      screenHeight: this.screenHeight,
    });

    this.characters.push(p1, p2);
    this.addChild(p1);
    this.addChild(p2);
  }

  setFallingItemsMode(mode: FallingItemMode) {
    this.fallingItemsMode = mode;
  }

  update(deltaTime: number): number {
    this.animationTime += deltaTime;

    // Spawn bubbles
    if (Math.random() < BUBBLE_SPAWN_RATE * deltaTime) {
      const bubble = new Bubble(this.screenWidth, this.fallingItemsMode);
      this.bubbles.push(bubble);
      this.addChildAt(bubble, 0); // Behind characters
    }

    // Update bubbles
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.update(deltaTime, this.screenWidth, this.animationTime);

      // Remove if off screen
      if (b.isOffScreen(this.screenHeight)) {
        b.destroy();
        this.bubbles.splice(i, 1);
        continue;
      }

      // Collision detection with characters
      for (const c of this.characters) {
        const dx = b.x - (c.x + c.charWidth / 2);
        const dy = b.y - (c.y + c.charHeight / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < b.radius + c.charWidth / 2) {
          this.score++;
          this.particles.emitPoof(b.x, b.y, b.getHue());
          b.destroy();
          this.bubbles.splice(i, 1);
          break;
        }
      }
    }

    // Update characters
    this.characters.forEach((c) => {
      c.update(deltaTime, this.screenWidth, this.screenHeight);
    });

    // Update particles
    this.particles.update(deltaTime);

    return this.score;
  }

  setPlayerVelocity(playerIndex: number, vx: number) {
    if (this.characters[playerIndex]) {
      this.characters[playerIndex].setVelocity(vx);
    }
  }

  clear() {
    this.characters.forEach((c) => c.destroy());
    this.characters = [];
    this.bubbles.forEach((b) => b.destroy());
    this.bubbles = [];
  }

  getBubbleCount(): number {
    return this.bubbles.length;
  }

  getParticleCount(): number {
    return this.particles.getActiveCount();
  }
}
