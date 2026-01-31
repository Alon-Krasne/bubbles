import { Container, Graphics, Sprite, Texture, Assets } from 'pixi.js';
import { GROUND_HEIGHT } from '../game/config';
import { getTheme, ThemeDefinition } from '../game/themes';

interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  brightness: number;
}

export class BackgroundScene extends Container {
  private skyGraphics: Graphics;
  private themeSprite: Sprite | null = null;
  private sunContainer: Container;
  private cloudsContainer: Container;
  private starsContainer: Container;
  private grassGraphics: Graphics;

  private clouds: Cloud[] = [];
  private stars: Star[] = [];
  private animationTime = 0;

  private currentTheme: ThemeDefinition;
  private screenWidth = 800;
  private screenHeight = 600;

  constructor() {
    super();

    this.currentTheme = getTheme('classic');

    // Create layers in order (back to front)
    this.skyGraphics = new Graphics();
    this.addChild(this.skyGraphics);

    this.sunContainer = new Container();
    this.addChild(this.sunContainer);

    this.cloudsContainer = new Container();
    this.addChild(this.cloudsContainer);

    this.starsContainer = new Container();
    this.addChild(this.starsContainer);

    this.grassGraphics = new Graphics();
    this.addChild(this.grassGraphics);
  }

  resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.initClouds();
    this.initStars();
    this.draw();
  }

  setTheme(themeName: string) {
    this.currentTheme = getTheme(themeName);

    // Load theme background image if needed
    if (this.currentTheme.hasImage && this.currentTheme.imagePath) {
      this.loadThemeImage(this.currentTheme.imagePath);
    } else {
      if (this.themeSprite) {
        this.themeSprite.visible = false;
      }
    }

    this.initStars();
    this.draw();
  }

  private async loadThemeImage(path: string) {
    try {
      const texture = await Assets.load(path);
      if (!this.themeSprite) {
        this.themeSprite = new Sprite(texture);
        this.addChildAt(this.themeSprite, 1); // After sky, before sun
      } else {
        this.themeSprite.texture = texture;
        this.themeSprite.visible = true;
      }
      this.positionThemeSprite();
    } catch (e) {
      console.warn('Failed to load theme image:', path, e);
    }
  }

  private positionThemeSprite() {
    if (!this.themeSprite || !this.themeSprite.texture) return;

    const targetHeight = this.screenHeight - GROUND_HEIGHT;
    const tex = this.themeSprite.texture;
    const scale = Math.max(this.screenWidth / tex.width, targetHeight / tex.height);

    this.themeSprite.scale.set(scale);
    this.themeSprite.x = (this.screenWidth - tex.width * scale) / 2;
    this.themeSprite.y = targetHeight - tex.height * scale;
  }

  private initClouds() {
    this.clouds = [];
    for (let i = 0; i < 8; i++) {
      this.clouds.push({
        x: Math.random() * this.screenWidth,
        y: 50 + Math.random() * 200,
        size: 40 + Math.random() * 80,
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.4 + Math.random() * 0.4,
      });
    }
  }

  private initStars() {
    this.stars = [];
    const count = this.currentTheme.isDark ? 60 : this.currentTheme.starCount;
    const maxSize = this.currentTheme.isDark ? 3 : 4;

    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.screenWidth,
        y: Math.random() * (this.screenHeight - GROUND_HEIGHT - 100),
        size: 1 + Math.random() * maxSize,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinkleOffset: Math.random() * Math.PI * 2,
        brightness: 0.5 + Math.random() * 0.5,
      });
    }
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime;

    // Update clouds
    this.clouds.forEach((cloud, i) => {
      const depthFactor = 0.5 + (i % 3) * 0.3;
      cloud.x += cloud.speed * depthFactor * deltaTime;
      if (cloud.x > this.screenWidth + cloud.size * 2) {
        cloud.x = -cloud.size * 2;
      }
    });

    this.draw();
  }

  private draw() {
    this.drawSky();
    this.positionThemeSprite();
    this.drawSun();
    this.drawClouds();
    this.drawStars();
    this.drawGrass();
  }

  private drawSky() {
    const theme = this.currentTheme;
    const skyHeight = this.screenHeight - GROUND_HEIGHT;

    this.skyGraphics.clear();

    // Simple gradient approximation using multiple rects
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const y = t * skyHeight;
      const h = skyHeight / steps + 1;

      // Interpolate colors
      let color: number;
      if (t < 0.5) {
        color = this.lerpColor(theme.skyTop, theme.skyMiddle, t * 2);
      } else {
        color = this.lerpColor(theme.skyMiddle, theme.skyBottom, (t - 0.5) * 2);
      }

      this.skyGraphics.rect(0, y, this.screenWidth, h);
      this.skyGraphics.fill(color);
    }
  }

  private drawSun() {
    this.sunContainer.removeChildren();

    // Only draw sun/moon for classic theme (theme images have their own)
    if (this.currentTheme.hasImage) return;

    const sunX = this.screenWidth - 120;
    const sunY = 100;
    const sunRadius = 50;
    const pulse = Math.sin(this.animationTime * 0.03) * 0.15 + 1;

    const sunGraphics = new Graphics();

    if (this.currentTheme.isDark) {
      // Moon
      // Glow
      sunGraphics.circle(sunX, sunY, sunRadius * 2 * pulse);
      sunGraphics.fill({ color: 0xdce6ff, alpha: 0.2 });

      // Moon body
      sunGraphics.circle(sunX, sunY, sunRadius);
      sunGraphics.fill(0xfffff8);

      // Craters
      sunGraphics.circle(sunX - 12, sunY - 8, 8);
      sunGraphics.fill({ color: 0xc8c8be, alpha: 0.3 });
      sunGraphics.circle(sunX + 15, sunY + 5, 6);
      sunGraphics.fill({ color: 0xc8c8be, alpha: 0.3 });
    } else {
      // Sun glow
      sunGraphics.circle(sunX, sunY, sunRadius * 2.5 * pulse);
      sunGraphics.fill({ color: 0xfffadc, alpha: 0.3 });

      sunGraphics.circle(sunX, sunY, sunRadius * 1.8 * pulse);
      sunGraphics.fill({ color: 0xfff0b4, alpha: 0.4 });

      // Sun body
      sunGraphics.circle(sunX, sunY, sunRadius);
      sunGraphics.fill(0xffe066);

      // Sun rays (as triangular shapes instead of strokes)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + this.animationTime * 0.004;
        const rayLength = sunRadius * 1.2;
        const rayWidth = 6;

        const x1 = sunX + Math.cos(angle) * (sunRadius + 5);
        const y1 = sunY + Math.sin(angle) * (sunRadius + 5);
        const x2 = sunX + Math.cos(angle) * (sunRadius + rayLength);
        const y2 = sunY + Math.sin(angle) * (sunRadius + rayLength);

        // Triangle ray
        const perpAngle = angle + Math.PI / 2;
        const px = Math.cos(perpAngle) * rayWidth;
        const py = Math.sin(perpAngle) * rayWidth;

        sunGraphics.moveTo(x1 - px, y1 - py);
        sunGraphics.lineTo(x2, y2);
        sunGraphics.lineTo(x1 + px, y1 + py);
        sunGraphics.closePath();
        sunGraphics.fill({ color: 0xfff5b4, alpha: 0.35 });
      }

      // Kawaii face - use separate Graphics for strokes
      const faceGraphics = new Graphics();

      // Eyes (happy arcs) - draw as filled crescents instead
      faceGraphics.arc(sunX - 15, sunY - 5, 8, Math.PI * 0.2, Math.PI * 0.8);
      faceGraphics.stroke({ color: 0xe8940f, width: 3 });

      faceGraphics.arc(sunX + 15, sunY - 5, 8, Math.PI * 0.2, Math.PI * 0.8);
      faceGraphics.stroke({ color: 0xe8940f, width: 3 });

      this.sunContainer.addChild(faceGraphics);

      // Rosy cheeks
      sunGraphics.circle(sunX - 28, sunY + 8, 6);
      sunGraphics.fill({ color: 0xff9696, alpha: 0.4 });
      sunGraphics.circle(sunX + 28, sunY + 8, 6);
      sunGraphics.fill({ color: 0xff9696, alpha: 0.4 });

      // Smile - add to faceGraphics
      faceGraphics.arc(sunX, sunY + 8, 12, Math.PI * 0.15, Math.PI * 0.85);
      faceGraphics.stroke({ color: 0xe8940f, width: 2.5 });
    }

    this.sunContainer.addChild(sunGraphics);
  }

  private drawClouds() {
    this.cloudsContainer.removeChildren();

    // Only draw clouds for classic theme
    if (this.currentTheme.hasImage) return;

    const cloudGraphics = new Graphics();

    this.clouds.forEach((cloud, index) => {
      const cx = cloud.x;
      const bobY = cloud.y + Math.sin(this.animationTime * 0.015 + index * 2) * 3;
      const s = cloud.size;

      // Simplified cloud shape using circles
      cloudGraphics.circle(cx, bobY, s * 0.4);
      cloudGraphics.fill({ color: 0xffffff, alpha: cloud.opacity });

      cloudGraphics.circle(cx + s * 0.3, bobY - s * 0.1, s * 0.35);
      cloudGraphics.fill({ color: 0xffffff, alpha: cloud.opacity });

      cloudGraphics.circle(cx + s * 0.6, bobY, s * 0.3);
      cloudGraphics.fill({ color: 0xffffff, alpha: cloud.opacity });

      cloudGraphics.circle(cx - s * 0.25, bobY + s * 0.05, s * 0.25);
      cloudGraphics.fill({ color: 0xffffff, alpha: cloud.opacity });
    });

    this.cloudsContainer.addChild(cloudGraphics);
  }

  private drawStars() {
    this.starsContainer.removeChildren();

    const starGraphics = new Graphics();

    this.stars.forEach((star) => {
      const twinkle = (Math.sin(this.animationTime * star.twinkleSpeed + star.twinkleOffset) + 1) * 0.5;
      const size = star.size * (0.8 + twinkle * 0.5);
      const alpha = (this.currentTheme.isDark ? 0.6 : 0.4) + twinkle * 0.4;

      // Simple star/sparkle
      starGraphics.circle(star.x, star.y, size);
      starGraphics.fill({ color: 0xffffff, alpha: alpha * star.brightness });

      // Glow
      starGraphics.circle(star.x, star.y, size * 2);
      starGraphics.fill({ color: 0xffffff, alpha: alpha * 0.2 });
    });

    this.starsContainer.addChild(starGraphics);
  }

  private drawGrass() {
    const groundY = this.screenHeight - GROUND_HEIGHT;
    const theme = this.currentTheme;

    this.grassGraphics.clear();

    // Grass gradient (using strips)
    const strips = 10;
    for (let i = 0; i < strips; i++) {
      const t = i / strips;
      const y = groundY + t * GROUND_HEIGHT;
      const h = GROUND_HEIGHT / strips + 1;

      let color: number;
      if (t < 0.3) {
        color = this.lerpColor(theme.grassTop, theme.grassMiddle, t / 0.3);
      } else {
        color = this.lerpColor(theme.grassMiddle, theme.grassBottom, (t - 0.3) / 0.7);
      }

      this.grassGraphics.rect(0, y, this.screenWidth, h);
      this.grassGraphics.fill(color);
    }

    // Wavy top edge
    this.grassGraphics.moveTo(0, groundY);
    for (let x = 0; x <= this.screenWidth; x += 20) {
      const waveY = groundY + Math.sin(x * 0.05 + this.animationTime * 0.02) * 5;
      this.grassGraphics.lineTo(x, waveY);
    }
    this.grassGraphics.lineTo(this.screenWidth, groundY + 20);
    this.grassGraphics.lineTo(0, groundY + 20);
    this.grassGraphics.closePath();
    this.grassGraphics.fill(theme.grassTop);

    // Grass blades
    for (let x = 10; x < this.screenWidth; x += 30) {
      const bladeHeight = 15 + Math.sin(x) * 8;
      const sway = Math.sin(this.animationTime * 0.03 + x * 0.1) * 3;

      this.grassGraphics.moveTo(x, groundY + 5);
      this.grassGraphics.quadraticCurveTo(
        x + sway,
        groundY - bladeHeight / 2,
        x + sway * 1.5,
        groundY - bladeHeight
      );
      this.grassGraphics.stroke({ color: theme.grassBottom, width: 2 });

      // Second blade
      this.grassGraphics.moveTo(x + 10, groundY + 5);
      this.grassGraphics.quadraticCurveTo(
        x + 10 - sway * 0.5,
        groundY - bladeHeight / 2 + 3,
        x + 10 - sway,
        groundY - bladeHeight + 5
      );
      this.grassGraphics.stroke({ color: theme.grassBottom, width: 2 });
    }

    // Flowers
    const flowerColors = [0xffb6c1, 0x87ceeb, 0xffd700, 0xdda0dd];
    for (let x = 50; x < this.screenWidth; x += 150) {
      const flowerY = groundY + 15;
      const bobble = Math.sin(this.animationTime * 0.05 + x) * 2;

      // Stem
      this.grassGraphics.moveTo(x, flowerY + 10);
      this.grassGraphics.quadraticCurveTo(x + bobble, flowerY, x + bobble * 2, flowerY - 15);
      this.grassGraphics.stroke({ color: 0x5a9e3a, width: 2 });

      // Petals
      const color = flowerColors[Math.floor(x / 150) % flowerColors.length];
      for (let p = 0; p < 5; p++) {
        const angle = (p / 5) * Math.PI * 2 + this.animationTime * 0.01;
        const petalX = x + bobble * 2 + Math.cos(angle) * 6;
        const petalY = flowerY - 15 + Math.sin(angle) * 6;
        this.grassGraphics.circle(petalX, petalY, 4);
        this.grassGraphics.fill(color);
      }

      // Center
      this.grassGraphics.circle(x + bobble * 2, flowerY - 15, 3);
      this.grassGraphics.fill(0xffd700);
    }
  }

  private lerpColor(c1: number, c2: number, t: number): number {
    const r1 = (c1 >> 16) & 0xff;
    const g1 = (c1 >> 8) & 0xff;
    const b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff;
    const g2 = (c2 >> 8) & 0xff;
    const b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return (r << 16) | (g << 8) | b;
  }
}
