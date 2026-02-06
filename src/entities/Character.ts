import { Container, Graphics, Sprite, Text, Texture, Assets, AnimatedSprite } from 'pixi.js';
import { GlowFilter, DropShadowFilter } from 'pixi-filters';
import { CHARACTER_SIZE, CHARACTER_SPEED, GROUND_HEIGHT } from '../game/config';

// Figure sprite imports (static fallbacks)
import unicornImg from '../assets/unicorn.webp';
import dinosaurImg from '../assets/dinosaur.webp';
import puppyImg from '../assets/puppy.webp';
import princessImg from '../assets/princess.webp';

// Animated unicorn frames
import unicornIdle1 from '../assets/characters/unicorn/unicorn_idle_1.webp';
import unicornIdle2 from '../assets/characters/unicorn/unicorn_idle_2.webp';
import unicornWalk1 from '../assets/characters/unicorn/unicorn_walk_1.webp';
import unicornWalk2 from '../assets/characters/unicorn/unicorn_walk_2.webp';
import unicornWalk3 from '../assets/characters/unicorn/unicorn_walk_3.webp';
import unicornCelebrate1 from '../assets/characters/unicorn/unicorn_celebrate_1.webp';
import unicornCelebrate2 from '../assets/characters/unicorn/unicorn_celebrate_2.webp';

// Animated puppy frames
import puppyIdle1 from '../assets/characters/puppy/puppy_idle_1.webp';
import puppyIdle2 from '../assets/characters/puppy/puppy_idle_2.webp';
import puppyWalk1 from '../assets/characters/puppy/puppy_walk_1.webp';
import puppyWalk2 from '../assets/characters/puppy/puppy_walk_2.webp';
import puppyWalk3 from '../assets/characters/puppy/puppy_walk_3.webp';
import puppyCelebrate1 from '../assets/characters/puppy/puppy_celebrate_1.webp';
import puppyCelebrate2 from '../assets/characters/puppy/puppy_celebrate_2.webp';

// Animated dinosaur frames
import dinosaurIdle1 from '../assets/characters/dinosaur/dinosaur_idle_1.webp';
import dinosaurIdle2 from '../assets/characters/dinosaur/dinosaur_idle_2.webp';
import dinosaurWalk1 from '../assets/characters/dinosaur/dinosaur_walk_1.webp';
import dinosaurWalk2 from '../assets/characters/dinosaur/dinosaur_walk_2.webp';
import dinosaurWalk3 from '../assets/characters/dinosaur/dinosaur_walk_3.webp';
import dinosaurCelebrate1 from '../assets/characters/dinosaur/dinosaur_celebrate_1.webp';
import dinosaurCelebrate2 from '../assets/characters/dinosaur/dinosaur_celebrate_2.webp';

// Animated princess frames
import princessIdle1 from '../assets/characters/princess/princess_idle_1.webp';
import princessIdle2 from '../assets/characters/princess/princess_idle_2.webp';
import princessWalk1 from '../assets/characters/princess/princess_walk_1.webp';
import princessWalk2 from '../assets/characters/princess/princess_walk_2.webp';
import princessWalk3 from '../assets/characters/princess/princess_walk_3.webp';
import princessCelebrate1 from '../assets/characters/princess/princess_celebrate_1.webp';
import princessCelebrate2 from '../assets/characters/princess/princess_celebrate_2.webp';

// Animated blob-pink frames (24-frame smooth walk cycle from Veo 3.1)
import blobPinkIdle1 from '../assets/characters/blob-pink/blob_pink_idle_1.png';
import blobPinkIdle2 from '../assets/characters/blob-pink/blob_pink_idle_2.png';
import blobPinkWalk01 from '../assets/characters/blob-pink/blob_pink_walk_01.png';
import blobPinkWalk02 from '../assets/characters/blob-pink/blob_pink_walk_02.png';
import blobPinkWalk03 from '../assets/characters/blob-pink/blob_pink_walk_03.png';
import blobPinkWalk04 from '../assets/characters/blob-pink/blob_pink_walk_04.png';
import blobPinkWalk05 from '../assets/characters/blob-pink/blob_pink_walk_05.png';
import blobPinkWalk06 from '../assets/characters/blob-pink/blob_pink_walk_06.png';
import blobPinkWalk07 from '../assets/characters/blob-pink/blob_pink_walk_07.png';
import blobPinkWalk08 from '../assets/characters/blob-pink/blob_pink_walk_08.png';
import blobPinkWalk09 from '../assets/characters/blob-pink/blob_pink_walk_09.png';
import blobPinkWalk10 from '../assets/characters/blob-pink/blob_pink_walk_10.png';
import blobPinkWalk11 from '../assets/characters/blob-pink/blob_pink_walk_11.png';
import blobPinkWalk12 from '../assets/characters/blob-pink/blob_pink_walk_12.png';
import blobPinkWalk13 from '../assets/characters/blob-pink/blob_pink_walk_13.png';
import blobPinkWalk14 from '../assets/characters/blob-pink/blob_pink_walk_14.png';
import blobPinkWalk15 from '../assets/characters/blob-pink/blob_pink_walk_15.png';
import blobPinkWalk16 from '../assets/characters/blob-pink/blob_pink_walk_16.png';
import blobPinkWalk17 from '../assets/characters/blob-pink/blob_pink_walk_17.png';
import blobPinkWalk18 from '../assets/characters/blob-pink/blob_pink_walk_18.png';
import blobPinkWalk19 from '../assets/characters/blob-pink/blob_pink_walk_19.png';
import blobPinkWalk20 from '../assets/characters/blob-pink/blob_pink_walk_20.png';
import blobPinkWalk21 from '../assets/characters/blob-pink/blob_pink_walk_21.png';
import blobPinkWalk22 from '../assets/characters/blob-pink/blob_pink_walk_22.png';
import blobPinkWalk23 from '../assets/characters/blob-pink/blob_pink_walk_23.png';
import blobPinkWalk24 from '../assets/characters/blob-pink/blob_pink_walk_24.png';
import blobPinkCelebrate1 from '../assets/characters/blob-pink/blob_pink_celebrate_1.png';
import blobPinkCelebrate2 from '../assets/characters/blob-pink/blob_pink_celebrate_2.png';

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
  blob: {
    idle: [blobPinkIdle1, blobPinkIdle2, blobPinkIdle1],
    walk: [
      blobPinkWalk01, blobPinkWalk02, blobPinkWalk03, blobPinkWalk04,
      blobPinkWalk05, blobPinkWalk06, blobPinkWalk07, blobPinkWalk08,
      blobPinkWalk09, blobPinkWalk10, blobPinkWalk11, blobPinkWalk12,
      blobPinkWalk13, blobPinkWalk14, blobPinkWalk15, blobPinkWalk16,
      blobPinkWalk17, blobPinkWalk18, blobPinkWalk19, blobPinkWalk20,
      blobPinkWalk21, blobPinkWalk22, blobPinkWalk23, blobPinkWalk24,
    ],
    celebrate: [blobPinkCelebrate1, blobPinkCelebrate2],
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

const ANIM_SPEEDS: Record<AnimationState, number> = {
  idle: 0.03,
  walk: 0.06,
  celebrate: 0.12,
};

const COLOR_KEY_TOLERANCE = 34;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function hexToHue(hex: number): number {
  const { r, g, b } = hexToRgb(hex);
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;
  if (delta === 0) return 0;

  let hue = 0;
  if (max === nr) hue = ((ng - nb) / delta) % 6;
  else if (max === ng) hue = (nb - nr) / delta + 2;
  else hue = (nr - ng) / delta + 4;

  return Math.round((hue * 60 + 360) % 360);
}

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
  private ghostSprites: Sprite[] = [];

  public vx = 0;
  private bounceOffset = 0;
  private bodyScaleX = 1;
  private bodyScaleY = 1;
  private animationTime = 0;
  private wasMoving = false;
  private prevDirection: 1 | -1 = 1;
  private directionChangeCooldown = 0;
  private startImpulse = 0;
  private stopImpulse = 0;
  private transitionPulse = 0;
  private lean = 0;
  private celebrateBoost = 0;
  private celebrateJump = 0;
  private celebrateLoopsRemaining = 0;
  private movingDirection: 1 | -1 = 1;

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
    if (ANIMATED_FRAMES[this.figureType]) {
      this.loadAnimatedSprite();
    } else {
      this.loadFigureSprite();
    }

    this.drawShadow(1, 1, 0.15);
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
      const useBlobKeying = this.figureType === 'blob';
      const loadTextures = async (paths: string[]): Promise<Texture[]> => {
        const textures: Texture[] = [];
        for (const path of paths) {
          const texture = useBlobKeying ? await this.loadBlobTexture(path) : await Assets.load(path);
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
      this.animatedSprite.animationSpeed = ANIM_SPEEDS.idle;
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

      this.setupGhostTrail();
      this.body.addChild(this.animatedSprite);
      this.currentAnim = 'idle';
    } catch (e) {
      console.warn('Failed to load animated sprite, falling back to static:', this.figureType, e);
      this.loadFigureSprite();
    }
  }

  private async loadBlobTexture(path: string): Promise<Texture> {
    const source = await this.loadImage(path);
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return Assets.load(path);
    }

    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const background = this.sampleBackgroundColor(data, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - background.r;
      const dg = data[i + 1] - background.g;
      const db = data[i + 2] - background.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      if (dist < COLOR_KEY_TOLERANCE) {
        data[i + 3] = 0;
      } else if (dist < COLOR_KEY_TOLERANCE + 18) {
        const softness = clamp((dist - COLOR_KEY_TOLERANCE) / 18, 0, 1);
        data[i + 3] = Math.round(data[i + 3] * softness);
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const cropped = this.cropToOpaqueBounds(canvas, ctx);
    const output = document.createElement('canvas');
    output.width = 256;
    output.height = 256;
    const outCtx = output.getContext('2d');
    if (!outCtx) {
      return Texture.from(canvas);
    }

    const padding = 14;
    const scale = Math.min((output.width - padding * 2) / cropped.width, (output.height - padding * 2) / cropped.height);
    const targetW = cropped.width * scale;
    const targetH = cropped.height * scale;
    const targetX = (output.width - targetW) / 2;
    const targetY = (output.height - targetH) / 2;
    outCtx.drawImage(cropped.canvas, cropped.x, cropped.y, cropped.width, cropped.height, targetX, targetY, targetW, targetH);

    return Texture.from(output);
  }

  private async loadImage(path: string): Promise<HTMLImageElement> {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed loading image: ${path}`));
      image.src = path;
    });
  }

  private sampleBackgroundColor(data: Uint8ClampedArray, width: number, height: number) {
    const samples = [
      0,
      (width - 1) * 4,
      (height - 1) * width * 4,
      ((height - 1) * width + (width - 1)) * 4,
      ((Math.floor(height * 0.1) * width + Math.floor(width * 0.5)) * 4),
    ];

    let r = 0;
    let g = 0;
    let b = 0;
    for (const index of samples) {
      r += data[index];
      g += data[index + 1];
      b += data[index + 2];
    }

    return {
      r: Math.round(r / samples.length),
      g: Math.round(g / samples.length),
      b: Math.round(b / samples.length),
    };
  }

  private cropToOpaqueBounds(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const { width, height } = canvas;
    const pixels = ctx.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = pixels[(y * width + x) * 4 + 3];
        if (alpha < 12) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX <= minX || maxY <= minY) {
      return { canvas, x: 0, y: 0, width, height };
    }

    return {
      canvas,
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }

  private setupGhostTrail() {
    this.ghostSprites.forEach((ghost) => ghost.destroy());
    this.ghostSprites = [];

    if (!this.animatedSprite) return;

    for (let i = 0; i < 2; i++) {
      const ghost = new Sprite(this.animatedSprite.texture);
      ghost.anchor.set(0.5);
      ghost.width = this.animatedSprite.width;
      ghost.height = this.animatedSprite.height;
      ghost.alpha = 0;
      this.body.addChild(ghost);
      this.body.setChildIndex(ghost, 0);
      this.ghostSprites.push(ghost);
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

  private drawShadow(scaleX: number, scaleY: number, alpha: number) {
    this.shadow.clear();
    this.shadow.ellipse(this.charWidth / 2, this.charHeight + 10, 35 * scaleX, 12 * scaleY);
    this.shadow.fill({ color: 0x000000, alpha });
  }

  private setAnimation(anim: AnimationState) {
    if (!this.animatedSprite || !this.animations || this.currentAnim === anim) return;

    this.transitionPulse = 1;
    this.animatedSprite.textures = this.animations[anim];
    this.animatedSprite.animationSpeed = ANIM_SPEEDS[anim];
    this.animatedSprite.loop = anim !== 'celebrate';
    this.animatedSprite.gotoAndPlay(0);
    this.currentAnim = anim;

    if (anim === 'celebrate') {
      this.animatedSprite.onComplete = () => {
        this.celebrateLoopsRemaining--;
        if (this.celebrateLoopsRemaining > 0) {
          this.animatedSprite?.gotoAndPlay(0);
          return;
        }
        this.setAnimation('idle');
      };
    } else {
      this.animatedSprite.onComplete = undefined;
    }
  }

  playCelebrate() {
    if (this.animations) {
      this.celebrateLoopsRemaining = 2 + Math.floor(Math.random() * 2);
      this.celebrateBoost = 1;
      this.celebrateJump = 1;
      this.setAnimation('celebrate');
    }
  }

  update(deltaTime: number, screenWidth: number, screenHeight: number) {
    this.animationTime += deltaTime;

    this.x += this.vx * deltaTime;
    if (this.x < 20) this.x = 20;
    if (this.x > screenWidth - this.charWidth - 20) this.x = screenWidth - this.charWidth - 20;

    this.y = screenHeight - GROUND_HEIGHT - CHARACTER_SIZE + 10;

    const speedNorm = clamp(Math.abs(this.vx) / CHARACTER_SPEED, 0, 1.2);
    const isMoving = speedNorm > 0.08;

    // Detect direction change vs genuine start/stop
    if (Math.abs(this.vx) > 0.5) {
      const newDir: 1 | -1 = this.vx >= 0 ? 1 : -1;
      if (newDir !== this.prevDirection) {
        this.directionChangeCooldown = 18; // suppress impulses during direction flip
        this.prevDirection = newDir;
      }
      this.movingDirection = newDir;
    }

    this.directionChangeCooldown = Math.max(0, this.directionChangeCooldown - deltaTime);
    const suppressImpulse = this.directionChangeCooldown > 0;

    if (isMoving && !this.wasMoving && !suppressImpulse) this.startImpulse = 1;
    if (!isMoving && this.wasMoving && !suppressImpulse) this.stopImpulse = 1;
    this.wasMoving = isMoving;

    this.startImpulse = Math.max(0, this.startImpulse - 0.04 * deltaTime);
    this.stopImpulse = Math.max(0, this.stopImpulse - 0.035 * deltaTime);
    this.transitionPulse = Math.max(0, this.transitionPulse - 0.06 * deltaTime);
    this.celebrateBoost = Math.max(0, this.celebrateBoost - 0.04 * deltaTime);
    this.celebrateJump = Math.max(0, this.celebrateJump - 0.035 * deltaTime);

    const walkFrequency = 0.12 + speedNorm * 0.1;
    const walkPhase = this.animationTime * walkFrequency;
    const walkLift = Math.abs(Math.sin(walkPhase));

    if (isMoving) {
      this.bounceOffset = Math.sin(walkPhase) * (1.5 + speedNorm * 1.5);
    } else {
      this.bounceOffset = Math.sin(this.animationTime * 0.06) * 1.2;
    }

    const breathe = 1 + Math.sin(this.animationTime * 0.04) * 0.012;
    let targetScaleX = isMoving ? 1 + walkLift * 0.035 : breathe;
    let targetScaleY = isMoving ? 1 - walkLift * 0.035 : 1 / breathe;

    targetScaleX += this.startImpulse * 0.06;
    targetScaleY -= this.startImpulse * 0.05;
    targetScaleX -= this.stopImpulse * 0.04;
    targetScaleY += this.stopImpulse * 0.06;

    const pulse = Math.sin(this.animationTime * 0.25) * 0.02;
    targetScaleX += this.transitionPulse * pulse;
    targetScaleY -= this.transitionPulse * pulse;

    const celebratePop = this.celebrateBoost > 0 ? Math.sin((1 - this.celebrateBoost) * Math.PI) * 0.14 : 0;
    targetScaleX += celebratePop;
    targetScaleY += celebratePop;
    this.bounceOffset -= this.celebrateJump * 5;

    this.bodyScaleX = lerp(this.bodyScaleX, targetScaleX, 0.1);
    this.bodyScaleY = lerp(this.bodyScaleY, targetScaleY, 0.1);

    this.body.scale.set(this.bodyScaleX, this.bodyScaleY);
    this.body.y = this.charHeight / 2 + this.bounceOffset;

    const targetLean = clamp((this.vx / CHARACTER_SPEED) * 0.06, -0.06, 0.06);
    this.lean = lerp(this.lean, targetLean, 0.08);
    this.body.rotation = this.lean;

    this.shadow.y = -this.bounceOffset;
    const airborne = clamp(-this.bounceOffset / 9, 0, 0.9);
    const shadowScaleX = 1 + speedNorm * 0.3 + airborne * 0.22;
    const shadowScaleY = 1 - airborne * 0.32;
    const shadowAlpha = clamp(0.16 - airborne * 0.08 + speedNorm * 0.03, 0.06, 0.2);
    this.drawShadow(shadowScaleX, shadowScaleY, shadowAlpha);

    if (this.animatedSprite && this.animations && this.currentAnim !== 'celebrate') {
      if (isMoving && this.currentAnim !== 'walk') {
        this.setAnimation('walk');
      } else if (!isMoving && this.currentAnim !== 'idle') {
        this.setAnimation('idle');
      }

      if (this.currentAnim === 'walk') {
        this.animatedSprite.animationSpeed = ANIM_SPEEDS.walk * (0.7 + Math.min(1, speedNorm) * 0.5);
      } else if (this.currentAnim === 'idle') {
        this.animatedSprite.animationSpeed = ANIM_SPEEDS.idle;
      }

      this.animatedSprite.scale.x = this.movingDirection >= 0 ? Math.abs(this.animatedSprite.scale.x) : -Math.abs(this.animatedSprite.scale.x);
      this.updateGhostTrail(speedNorm);
    }

    if (this.glowFilter) {
      const excitement = this.currentAnim === 'celebrate' ? 0.95 : 0.4;
      this.glowFilter.outerStrength = 1.1 + Math.sin(this.animationTime * 0.1) * 0.45 + excitement + this.celebrateBoost * 0.9;
    }

    if (this.animatedSprite) {
      const tintStrength = this.currentAnim === 'celebrate' ? 0.14 : 0;
      const tint = this.currentAnim === 'celebrate' ? adjustColor(this.baseColor, 0.2) : 0xffffff;
      if (tintStrength > 0) {
        this.animatedSprite.tint = tint;
      } else {
        this.animatedSprite.tint = 0xffffff;
      }
    }
  }

  private updateGhostTrail(speedNorm: number) {
    if (!this.animatedSprite || this.ghostSprites.length === 0) return;

    const direction = this.movingDirection;
    const active = speedNorm > 0.45;
    for (let i = 0; i < this.ghostSprites.length; i++) {
      const ghost = this.ghostSprites[i];
      const strength = (1 - i * 0.4) * clamp((speedNorm - 0.35) / 0.8, 0, 1);
      ghost.texture = this.animatedSprite.texture;
      ghost.rotation = this.animatedSprite.rotation;
      const offset = (i + 1) * (7 + speedNorm * 12);
      ghost.x = active ? -direction * offset : 0;
      ghost.y = active ? (i + 1) * 2.5 : 0;
      const sx = this.animatedSprite.scale.x >= 0 ? 1 : -1;
      const scale = 1 - (i + 1) * 0.08;
      ghost.scale.set(sx * scale, scale);
      ghost.alpha = active ? 0.2 * strength : Math.max(0, ghost.alpha - 0.04);
      ghost.tint = this.baseColor;
    }
  }

  setVelocity(vx: number) {
    this.vx = vx * CHARACTER_SPEED;
  }

  getColorHue(): number {
    return hexToHue(this.baseColor);
  }
}
