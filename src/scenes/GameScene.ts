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

interface MovementProfile {
  accel: number;
  decel: number;
}

const PROFILE_BY_FIGURE: Record<FigureType, MovementProfile> = {
  blob: { accel: 0.12, decel: 0.2 },
  unicorn: { accel: 0.1, decel: 0.18 },
  dinosaur: { accel: 0.16, decel: 0.24 },
  puppy: { accel: 0.14, decel: 0.2 },
  princess: { accel: 0.11, decel: 0.19 },
};

export class GameScene extends Container {
  private characters: Character[] = [];
  private bubbles: Bubble[] = [];
  private particles: ParticleSystem;

  private screenWidth = 800;
  private screenHeight = 600;
  private animationTime = 0;
  private fallingItemsMode: FallingItemMode = 'bubbles';

  private movementTargets = [0, 0];
  private movementCurrent = [0, 0];
  private movementProfiles: MovementProfile[] = [
    PROFILE_BY_FIGURE.blob,
    PROFILE_BY_FIGURE.blob,
  ];

  private revealFramesRemaining = 0;
  private readonly revealDuration = 24;

  public score = 0;

  // Callback for weather particle burst on catch
  public onBubbleCatch?: (x: number, y: number) => void;

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

    this.revealFramesRemaining = this.revealDuration;
    this.characters.forEach((character) => {
      character.alpha = 0;
      character.scale.set(0.86);
    });

    this.movementTargets = [0, 0];
    this.movementCurrent = [0, 0];
    this.movementProfiles = [
      PROFILE_BY_FIGURE[p1Config.figureType],
      PROFILE_BY_FIGURE[p2Config.figureType],
    ];
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
          // Trigger weather particle burst
          this.onBubbleCatch?.(b.x, b.y);
          // Play celebrate animation on the catching character
          c.playCelebrate();
          b.destroy();
          this.bubbles.splice(i, 1);
          break;
        }
      }
    }

    this.applyMovementSmoothing(deltaTime);
    this.updateCharacterReveal(deltaTime);

    // Update characters
    this.characters.forEach((c) => {
      c.update(deltaTime, this.screenWidth, this.screenHeight);
    });

    // Update particles
    this.particles.update(deltaTime);

    return this.score;
  }

  setPlayerVelocity(playerIndex: number, vx: number) {
    if (!this.characters[playerIndex]) return;
    this.movementTargets[playerIndex] = Math.max(-1, Math.min(1, vx));
  }

  private applyMovementSmoothing(deltaTime: number) {
    for (let i = 0; i < this.characters.length; i++) {
      const profile = this.movementProfiles[i] ?? PROFILE_BY_FIGURE.blob;
      const target = this.movementTargets[i] ?? 0;
      const current = this.movementCurrent[i] ?? 0;

      const accel = target === 0 ? profile.decel : profile.accel;
      const next = current + (target - current) * accel * deltaTime;

      this.movementCurrent[i] = Math.abs(next) < 0.01 ? 0 : next;
      this.characters[i].setVelocity(this.movementCurrent[i]);
    }
  }

  private updateCharacterReveal(deltaTime: number) {
    if (this.revealFramesRemaining <= 0) return;

    this.revealFramesRemaining = Math.max(0, this.revealFramesRemaining - deltaTime);
    const progress = 1 - this.revealFramesRemaining / this.revealDuration;
    const eased = 1 - (1 - progress) * (1 - progress);

    this.characters.forEach((character) => {
      character.alpha = eased;
      const settle = Math.sin(progress * Math.PI) * 0.04 * (1 - progress);
      const pop = 0.86 + eased * 0.14 + settle;
      character.scale.set(pop);
    });
  }

  clear() {
    this.characters.forEach((c) => c.destroy());
    this.characters = [];
    this.bubbles.forEach((b) => b.destroy());
    this.bubbles = [];
    this.movementTargets = [0, 0];
    this.movementCurrent = [0, 0];
    this.revealFramesRemaining = 0;
  }

  getBubbleCount(): number {
    return this.bubbles.length;
  }

  getParticleCount(): number {
    return this.particles.getActiveCount();
  }
}
