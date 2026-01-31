import { Container, Graphics, Sprite, Text, Texture, Assets } from 'pixi.js';
import { CHARACTER_SIZE, CHARACTER_SPEED, GROUND_HEIGHT } from '../game/config';

// Figure sprite imports
import unicornImg from '../assets/unicorn.png';
import dinosaurImg from '../assets/dinosaur.png';
import puppyImg from '../assets/puppy.png';
import princessImg from '../assets/princess.png';

export type FigureType = 'blob' | 'unicorn' | 'dinosaur' | 'puppy' | 'princess';

const FIGURE_PATHS: Record<string, string> = {
  unicorn: unicornImg,
  dinosaur: dinosaurImg,
  puppy: puppyImg,
  princess: princessImg,
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
  }

  setVelocity(vx: number) {
    this.vx = vx * CHARACTER_SPEED;
  }
}
