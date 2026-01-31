import { Container, Graphics, Sprite, Text, Texture, Assets, AnimatedSprite } from 'pixi.js';
import { GlowFilter, DropShadowFilter } from 'pixi-filters';
import { CHARACTER_SIZE, CHARACTER_SPEED, GROUND_HEIGHT } from '../game/config';

// Figure sprite imports (static fallbacks)
import unicornImg from '../assets/unicorn.png';
import dinosaurImg from '../assets/dinosaur.png';
import puppyImg from '../assets/puppy.png';
import princessImg from '../assets/princess.png';

// Animated unicorn frames
import unicornIdle1 from '../assets/characters/unicorn/unicorn_idle_1.png';
import unicornIdle2 from '../assets/characters/unicorn/unicorn_idle_2.png';
import unicornWalk1 from '../assets/characters/unicorn/unicorn_walk_1.png';
import unicornWalk2 from '../assets/characters/unicorn/unicorn_walk_2.png';
import unicornWalk3 from '../assets/characters/unicorn/unicorn_walk_3.png';
import unicornCelebrate1 from '../assets/characters/unicorn/unicorn_celebrate_1.png';
import unicornCelebrate2 from '../assets/characters/unicorn/unicorn_celebrate_2.png';

// Animated puppy frames
import puppyIdle1 from '../assets/characters/puppy/puppy_idle_1.png';
import puppyIdle2 from '../assets/characters/puppy/puppy_idle_2.png';
import puppyWalk1 from '../assets/characters/puppy/puppy_walk_1.png';
import puppyWalk2 from '../assets/characters/puppy/puppy_walk_2.png';
import puppyWalk3 from '../assets/characters/puppy/puppy_walk_3.png';
import puppyCelebrate1 from '../assets/characters/puppy/puppy_celebrate_1.png';
import puppyCelebrate2 from '../assets/characters/puppy/puppy_celebrate_2.png';

// Animated dinosaur frames
import dinosaurIdle1 from '../assets/characters/dinosaur/dinosaur_idle_1.png';
import dinosaurIdle2 from '../assets/characters/dinosaur/dinosaur_idle_2.png';
import dinosaurWalk1 from '../assets/characters/dinosaur/dinosaur_walk_1.png';
import dinosaurWalk2 from '../assets/characters/dinosaur/dinosaur_walk_2.png';
import dinosaurWalk3 from '../assets/characters/dinosaur/dinosaur_walk_3.png';
import dinosaurCelebrate1 from '../assets/characters/dinosaur/dinosaur_celebrate_1.png';
import dinosaurCelebrate2 from '../assets/characters/dinosaur/dinosaur_celebrate_2.png';

// Animated princess frames
import princessIdle1 from '../assets/characters/princess/princess_idle_1.png';
import princessIdle2 from '../assets/characters/princess/princess_idle_2.png';
import princessWalk1 from '../assets/characters/princess/princess_walk_1.png';
import princessWalk2 from '../assets/characters/princess/princess_walk_2.png';
import princessWalk3 from '../assets/characters/princess/princess_walk_3.png';
import princessCelebrate1 from '../assets/characters/princess/princess_celebrate_1.png';
import princessCelebrate2 from '../assets/characters/princess/princess_celebrate_2.png';

export type FigureType = 'blob' | 'unicorn' | 'dinosaur' | 'puppy' | 'princess';

const FIGURE_PATHS: Record<string, string> = {
  unicorn: unicornImg,
  dinosaur: dinosaurImg,
  puppy: puppyImg,
  princess: princessImg,
};

// Animation frame definitions for animated characters
const ANIMATED_FRAMES: Record<string, { idle: string[]; walk: string[]; celebrate: string[] }> = {
  unicorn: {
    idle: [unicornIdle1, unicornIdle2, unicornIdle1],
    walk: [unicornWalk1, unicornWalk2, unicornWalk3, unicornWalk2],
    celebrate: [unicornCelebrate1, unicornCelebrate2],
  },
  puppy: {
    idle: [puppyIdle1, puppyIdle2, puppyIdle1],
    walk: [puppyWalk1, puppyWalk2, puppyWalk3, puppyWalk2],
    celebrate: [puppyCelebrate1, puppyCelebrate2],
  },
  dinosaur: {
    idle: [dinosaurIdle1, dinosaurIdle2, dinosaurIdle1],
    walk: [dinosaurWalk1, dinosaurWalk2, dinosaurWalk3, dinosaurWalk2],
    celebrate: [dinosaurCelebrate1, dinosaurCelebrate2],
  },
  princess: {
    idle: [princessIdle1, princessIdle2, princessIdle1],
    walk: [princessWalk1, princessWalk2, princessWalk3, princessWalk2],
    celebrate: [princessCelebrate1, princessCelebrate2],
  },
};

export interface CharacterConfig {
  x: number;
  color: number;
  name: string;
  isGirl: boolean;
  figureType: FigureType;
  screenHeight: number;
}

function hexToRgb(hex: number): { r: number; g: number; b: number } {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}

function rgbToHex(r: number, g: number, b: number): number {
  return (Math.max(0, Math.min(255, r)) << 16) | (Math.max(0, Math.min(255, g)) << 8) | Math.max(0, Math.min(255, b));
}

function adjustColor(hex: number, amount: number): number {
  const { r, g, b } = hexToRgb(hex);
  const shift = Math.round(255 * amount);
  return rgbToHex(r + shift, g + shift, b + shift);
}

type AnimationState = 'idle' | 'walk' | 'celebrate';

export class Character extends Container {
  private body: Container;
  private nameTag: Text;
  private shadow: Graphics;

  private baseColor: number;
  private colorDark: number;
  private colorLight: number;
  private colorAccent: number;

  private isGirl: boolean;
  private figureType: FigureType;
  private figureSprite: Sprite | null = null;

  // Animated sprite support
  private animatedSprite: AnimatedSprite | null = null;
  private animations: Record<AnimationState, Texture[]> | null = null;
  private currentAnim: AnimationState = 'idle';
  private glowFilter: GlowFilter | null = null;

  public vx = 0;
  private bounceOffset = 0;
  private squish = 1;
  private targetSquish = 1;
  private animationTime = 0;

  readonly charWidth = CHARACTER_SIZE;
  readonly charHeight = CHARACTER_SIZE;

  constructor(config: CharacterConfig) {
    super();

    this.baseColor = config.color;
    this.colorDark = adjustColor(config.color, -0.22);
    this.colorLight = adjustColor(config.color, 0.22);
    this.colorAccent = adjustColor(config.color, -0.12);
    this.isGirl = config.isGirl;
    this.figureType = config.figureType;

    this.x = config.x;
    this.y = config.screenHeight - GROUND_HEIGHT - CHARACTER_SIZE + 10;

    // Shadow
    this.shadow = new Graphics();
    this.addChild(this.shadow);

    // Body container (for squish transform)
    this.body = new Container();
    this.body.x = this.charWidth / 2;
    this.body.y = this.charHeight / 2;
    this.addChild(this.body);

    // Name tag
    this.nameTag = new Text({
      text: config.name,
      style: {
        fontFamily: 'Rubik, Assistant, Arial, sans-serif',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0x2d3436,
      },
    });
    this.nameTag.anchor.set(0.5);
    this.nameTag.y = -15;
    this.nameTag.x = this.charWidth / 2;
    this.addChild(this.nameTag);

    // Build the body
    if (this.figureType === 'blob') {
      this.buildBlobBody();
    } else if (ANIMATED_FRAMES[this.figureType]) {
      this.loadAnimatedSprite();
    } else {
      this.loadFigureSprite();
    }

    this.drawShadow();
  }

  private buildBlobBody() {
    const blob = new Graphics();

    // Main body circle
    blob.circle(0, 0, this.charWidth / 2);
    blob.fill(this.baseColor);
    blob.stroke({ color: this.colorDark, width: 3 });

    // Cheeks (blush)
    const blushColor = this.isGirl ? 0xff9696 : 0x96c8ff;
    blob.ellipse(-20, 8, 8, 5);
    blob.fill({ color: blushColor, alpha: 0.5 });
    blob.ellipse(20, 8, 8, 5);
    blob.fill({ color: blushColor, alpha: 0.5 });

    // Eye whites
    blob.ellipse(-12, -5, 10, 12);
    blob.fill(0xffffff);
    blob.ellipse(12, -5, 10, 12);
    blob.fill(0xffffff);

    // Pupils
    blob.circle(-12, -3, 5);
    blob.fill(0x2d3436);
    blob.circle(12, -3, 5);
    blob.fill(0x2d3436);

    // Eye shine
    blob.circle(-14, -6, 2);
    blob.fill(0xffffff);
    blob.circle(10, -6, 2);
    blob.fill(0xffffff);

    // Smile
    blob.arc(0, 5, 10, 0.1 * Math.PI, 0.9 * Math.PI);
    blob.stroke({ color: 0x2d3436, width: 2.5 });

    // Arms
    blob.ellipse(-this.charWidth / 2 - 5, -10, 12, 8);
    blob.fill(this.baseColor);
    blob.stroke({ color: this.colorDark, width: 2 });

    blob.ellipse(this.charWidth / 2 + 5, -10, 12, 8);
    blob.fill(this.baseColor);
    blob.stroke({ color: this.colorDark, width: 2 });

    // Feet
    blob.ellipse(-15, this.charHeight / 2 - 5, 10, 6);
    blob.fill(this.baseColor);
    blob.stroke({ color: this.colorDark, width: 2 });

    blob.ellipse(15, this.charHeight / 2 - 5, 10, 6);
    blob.fill(this.baseColor);
    blob.stroke({ color: this.colorDark, width: 2 });

    // Bow for girl
    if (this.isGirl) {
      // Left ribbon
      blob.moveTo(-5, -this.charHeight / 2 + 5);
      blob.quadraticCurveTo(-25, -this.charHeight / 2 - 10, -20, -this.charHeight / 2 + 15);
      blob.quadraticCurveTo(-10, -this.charHeight / 2 + 5, -5, -this.charHeight / 2 + 5);
      blob.fill(this.colorAccent);
      blob.stroke({ color: this.colorDark, width: 2 });

      // Right ribbon
      blob.moveTo(5, -this.charHeight / 2 + 5);
      blob.quadraticCurveTo(25, -this.charHeight / 2 - 10, 20, -this.charHeight / 2 + 15);
      blob.quadraticCurveTo(10, -this.charHeight / 2 + 5, 5, -this.charHeight / 2 + 5);
      blob.fill(this.colorAccent);
      blob.stroke({ color: this.colorDark, width: 2 });

      // Center knot
      blob.circle(0, -this.charHeight / 2 + 8, 6);
      blob.fill(this.colorAccent);
      blob.stroke({ color: this.colorDark, width: 2 });
    }

    this.body.addChild(blob);
  }

  private async loadAnimatedSprite() {
    const frameDefs = ANIMATED_FRAMES[this.figureType];
    if (!frameDefs) {
      this.loadFigureSprite();
      return;
    }

    try {
      // Load all textures
      const loadTextures = async (paths: string[]): Promise<Texture[]> => {
        const textures: Texture[] = [];
        for (const path of paths) {
          const texture = await Assets.load(path);
          textures.push(texture);
        }
        return textures;
      };

      const [idleTextures, walkTextures, celebrateTextures] = await Promise.all([
        loadTextures(frameDefs.idle),
        loadTextures(frameDefs.walk),
        loadTextures(frameDefs.celebrate),
      ]);

      this.animations = {
        idle: idleTextures,
        walk: walkTextures,
        celebrate: celebrateTextures,
      };

      // Create AnimatedSprite with idle animation
      this.animatedSprite = new AnimatedSprite(idleTextures);
      this.animatedSprite.anchor.set(0.5);
      this.animatedSprite.width = this.charWidth + 40;
      this.animatedSprite.height = this.charWidth + 40;
      this.animatedSprite.animationSpeed = 0.08;
      this.animatedSprite.play();

      // Add magical glow filter
      this.glowFilter = new GlowFilter({
        distance: 15,
        outerStrength: 1.5,
        innerStrength: 0,
        color: this.baseColor,
        quality: 0.3,
      });

      // Add drop shadow filter
      const shadowFilter = new DropShadowFilter({
        offset: { x: 0, y: 8 },
        blur: 3,
        alpha: 0.3,
        color: 0x000000,
      });

      this.animatedSprite.filters = [shadowFilter, this.glowFilter];

      this.body.addChild(this.animatedSprite);
      this.currentAnim = 'idle';
    } catch (e) {
      console.warn('Failed to load animated sprite, falling back to static:', this.figureType, e);
      this.loadFigureSprite();
    }
  }

  private async loadFigureSprite() {
    const path = FIGURE_PATHS[this.figureType];
    if (!path) {
      this.buildBlobBody();
      return;
    }

    try {
      const texture = await Assets.load(path);
      this.figureSprite = new Sprite(texture);
      this.figureSprite.anchor.set(0.5);
      this.figureSprite.width = this.charWidth + 40;
      this.figureSprite.height = this.charWidth + 40;
      this.body.addChild(this.figureSprite);

      // Add colored aura
      const aura = new Graphics();
      aura.circle(0, 5, (this.charWidth + 40) * 0.5);
      aura.fill({ color: this.baseColor, alpha: 0.25 });
      this.body.addChildAt(aura, 0);
    } catch (e) {
      console.warn('Failed to load figure sprite:', this.figureType, e);
      this.buildBlobBody();
    }
  }

  private drawShadow() {
    this.shadow.clear();
    this.shadow.ellipse(this.charWidth / 2, this.charHeight + 10, 35, 12);
    this.shadow.fill({ color: 0x000000, alpha: 0.15 });
  }

  private setAnimation(anim: AnimationState) {
    if (!this.animatedSprite || !this.animations || this.currentAnim === anim) return;

    this.animatedSprite.textures = this.animations[anim];
    this.animatedSprite.loop = anim !== 'celebrate';
    this.animatedSprite.gotoAndPlay(0);
    this.currentAnim = anim;

    // When celebrate finishes, return to idle
    if (anim === 'celebrate') {
      this.animatedSprite.onComplete = () => {
        this.setAnimation('idle');
      };
    } else {
      this.animatedSprite.onComplete = undefined;
    }
  }

  /** Play the celebration animation (called when catching a bubble) */
  playCelebrate() {
    if (this.animations) {
      this.setAnimation('celebrate');
    }
  }

  update(deltaTime: number, screenWidth: number, screenHeight: number) {
    this.animationTime += deltaTime;

    // Movement
    this.x += this.vx * deltaTime;
    if (this.x < 20) this.x = 20;
    if (this.x > screenWidth - this.charWidth - 20) this.x = screenWidth - this.charWidth - 20;

    // Update Y position based on screen height
    this.y = screenHeight - GROUND_HEIGHT - CHARACTER_SIZE + 10;

    // Bounce animation
    if (Math.abs(this.vx) > 0) {
      this.bounceOffset = Math.sin(this.animationTime * 0.3) * 5;
      this.targetSquish = 0.9 + Math.abs(Math.sin(this.animationTime * 0.3)) * 0.1;
    } else {
      this.bounceOffset = Math.sin(this.animationTime * 0.08) * 2;
      this.targetSquish = 1;
    }
    this.squish += (this.targetSquish - this.squish) * 0.2;

    // Apply squish transform
    this.body.scale.set(1 / this.squish, this.squish);
    this.body.y = this.charHeight / 2 + this.bounceOffset;

    // Update shadow position
    this.shadow.y = -this.bounceOffset;

    // Update animation state based on velocity (only if not celebrating)
    if (this.animatedSprite && this.animations && this.currentAnim !== 'celebrate') {
      const isMoving = Math.abs(this.vx) > 10;
      if (isMoving && this.currentAnim !== 'walk') {
        this.setAnimation('walk');
      } else if (!isMoving && this.currentAnim !== 'idle') {
        this.setAnimation('idle');
      }

      // Flip sprite based on direction
      if (this.vx < -10) {
        this.animatedSprite.scale.x = -Math.abs(this.animatedSprite.scale.x);
      } else if (this.vx > 10) {
        this.animatedSprite.scale.x = Math.abs(this.animatedSprite.scale.x);
      }
    }

    // Animate glow pulse
    if (this.glowFilter) {
      this.glowFilter.outerStrength = 1.2 + Math.sin(this.animationTime * 0.1) * 0.6;
    }
  }

  setVelocity(vx: number) {
    this.vx = vx * CHARACTER_SPEED;
  }
}
