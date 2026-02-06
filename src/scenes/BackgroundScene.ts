import { Container, Graphics, Sprite, Assets } from 'pixi.js';
import { GROUND_HEIGHT } from '../game/config';
import { getTheme, ThemeDefinition } from '../game/themes';
import { BackgroundSystem, QualityTier } from '../systems/background/BackgroundSystem';
import { Cloud } from '../systems/background/CloudLayerSystem';
import { IntroSequenceController } from '../systems/background/IntroSequenceController';
import { IntroEffectRenderer } from './background/IntroEffectRenderer';

export class BackgroundScene extends Container {
  private skyGraphics: Graphics;
  private atmosphereGraphics: Graphics;
  private themeSprite: Sprite | null = null;
  private sunContainer: Container;
  private cloudsContainer: Container;
  private grassGraphics: Graphics;
  private introContainer: Container;

  private clouds: Cloud[] = [];
  private animationTime = 0;

  private readonly systems: BackgroundSystem;
  private readonly introController = new IntroSequenceController();
  private readonly introRenderer: IntroEffectRenderer;

  private introSettlingFrames = 0;
  private readonly introSettlingDuration = 42;
  private currentTheme: ThemeDefinition;
  private screenWidth = 800;
  private screenHeight = 600;

  constructor() {
    super();

    this.currentTheme = getTheme('classic');
    this.systems = new BackgroundSystem();

    // Create layers in order (back to front)
    this.skyGraphics = new Graphics();
    this.addChild(this.skyGraphics);

    this.atmosphereGraphics = new Graphics();
    this.addChild(this.atmosphereGraphics);

    this.sunContainer = new Container();
    this.addChild(this.sunContainer);

    this.cloudsContainer = new Container();
    this.addChild(this.cloudsContainer);

    this.addChild(this.systems.particles.getContainer());

    this.grassGraphics = new Graphics();
    this.addChild(this.grassGraphics);

    this.introContainer = new Container();
    this.addChild(this.introContainer);
    this.introRenderer = new IntroEffectRenderer(this.introContainer);

    this.applyDevToggles();
  }

  resize(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.initClouds();
    this.systems.resize(width, height);
    this.systems.setWeatherConfig(this.currentTheme.weather);
    this.draw();
  }

  setTheme(themeName: string) {
    this.currentTheme = getTheme(themeName);

    // Load theme background image if needed
    if (this.currentTheme.hasImage && this.currentTheme.imagePath) {
      this.loadThemeImage(this.currentTheme.imagePath);
    } else if (this.themeSprite) {
      this.themeSprite.visible = false;
    }

    this.systems.setWeatherConfig(this.currentTheme.weather);
    this.draw();
  }

  setQualityTier(tier: QualityTier) {
    this.systems.setQualityTier(tier);
  }

  getQualityTier(): QualityTier {
    return this.systems.getQualityTier();
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
    this.clouds = this.systems.cloudSystem.createInitialClouds(this.screenWidth, this.screenHeight);
  }

  startIntro(onComplete: () => void) {
    this.introSettlingFrames = 0;
    this.introRenderer.setVariant(Math.random() > 0.5 ? 1 : 0);

    this.introController.start(() => {
      this.introSettlingFrames = this.introSettlingDuration;
      onComplete();
    });
  }

  skipIntro() {
    this.introController.skip();
  }

  isIntroPlaying(): boolean {
    return this.introController.isPlaying();
  }

  update(deltaTime: number) {
    this.animationTime += deltaTime;
    this.systems.update(this.clouds, deltaTime, this.screenWidth, this.screenHeight);
    this.introController.update(deltaTime);

    if (this.introSettlingFrames > 0) {
      this.introSettlingFrames = Math.max(0, this.introSettlingFrames - deltaTime);
    }

    this.draw();
  }

  private draw() {
    this.drawSky();
    this.positionThemeSprite();
    this.drawAtmosphere();
    this.drawSun();
    this.drawClouds();
    this.drawGrass();
    this.drawIntroEffects();
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

  private drawAtmosphere() {
    this.atmosphereGraphics.clear();

    if (this.currentTheme.hasImage) return;

    const skyHeight = this.screenHeight - GROUND_HEIGHT;
    const windStrength = this.systems.getWindStrength();
    const excitement = this.systems.getExcitement();
    const breath = 0.5 + Math.sin(this.animationTime * 0.012) * 0.5;

    const topGlowAlpha = 0.04 + breath * 0.03 + excitement * 0.05;
    this.atmosphereGraphics.circle(this.screenWidth * 0.78, 90, 180 + windStrength * 40);
    this.atmosphereGraphics.fill({ color: this.currentTheme.isDark ? 0xc9dcff : 0xfff6d9, alpha: topGlowAlpha });

    const horizonAlpha = 0.05 + windStrength * 0.04 + breath * 0.03 + excitement * 0.05;
    const strips = 10;
    for (let i = 0; i < strips; i++) {
      const t = i / strips;
      const y = skyHeight * (0.72 + t * 0.28);
      const h = (skyHeight * 0.28) / strips + 1;
      const alpha = horizonAlpha * (1 - t) * 0.9;
      this.atmosphereGraphics.rect(0, y, this.screenWidth, h);
      this.atmosphereGraphics.fill({ color: this.currentTheme.isDark ? 0xb3c8ff : 0xfff0d4, alpha });
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

    const layerAlpha = [0.78, 0.9, 1.05] as const;
    const windPulse = 0.94 + Math.sin(this.animationTime * 0.01) * 0.06;

    this.clouds.forEach((cloud) => {
      const cx = cloud.x;
      const bobY = cloud.y + this.systems.cloudSystem.getBobbingOffset(cloud);
      const s = cloud.size;
      const alpha = cloud.opacity * layerAlpha[cloud.layer] * windPulse;

      cloudGraphics.circle(cx, bobY + s * 0.1, s * 0.42);
      cloudGraphics.fill({ color: 0xdde7ff, alpha: alpha * 0.2 });

      cloudGraphics.circle(cx, bobY, s * 0.4);
      cloudGraphics.fill({ color: 0xffffff, alpha });

      cloudGraphics.circle(cx + s * 0.3, bobY - s * 0.1, s * 0.35);
      cloudGraphics.fill({ color: 0xffffff, alpha });

      cloudGraphics.circle(cx + s * 0.6, bobY, s * 0.3);
      cloudGraphics.fill({ color: 0xffffff, alpha });

      cloudGraphics.circle(cx - s * 0.25, bobY + s * 0.05, s * 0.25);
      cloudGraphics.fill({ color: 0xffffff, alpha });
    });

    this.cloudsContainer.addChild(cloudGraphics);
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

    const windStrength = this.systems.getWindStrength();

    // Wavy top edge
    this.grassGraphics.moveTo(0, groundY);
    for (let x = 0; x <= this.screenWidth; x += 20) {
      const waveY = groundY + this.systems.grassSystem.getTopEdgeWave(x);
      this.grassGraphics.lineTo(x, waveY);
    }
    this.grassGraphics.lineTo(this.screenWidth, groundY + 20);
    this.grassGraphics.lineTo(0, groundY + 20);
    this.grassGraphics.closePath();
    this.grassGraphics.fill(theme.grassTop);

    // Grass blades
    for (let x = 10; x < this.screenWidth; x += 30) {
      const bladeHeight = 15 + Math.sin(x) * 8;
      const sway = this.systems.grassSystem.getBladeSway(x, windStrength);

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
      const bobble = this.systems.grassSystem.getFlowerBob(x);

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

  private drawIntroEffects() {
    if (this.introController.isPlaying()) {
      this.introRenderer.render(
        this.introController.getProgress(),
        this.animationTime,
        this.screenWidth,
        this.screenHeight
      );
      return;
    }

    if (this.introSettlingFrames > 0) {
      const progress = 1 - this.introSettlingFrames / this.introSettlingDuration;
      this.introRenderer.renderSettlingPulse(progress, this.animationTime, this.screenWidth, this.screenHeight);
      return;
    }

    this.introRenderer.clear();
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

  // Burst weather particles at a position (called when bubble is caught)
  burstAt(x: number, y: number) {
    this.systems.burstAt(x, y);
  }

  getWeatherParticleCount(): number {
    return this.systems.getParticleCount();
  }

  private applyDevToggles() {
    const params = new URLSearchParams(window.location.search);
    const disableClouds = params.get('bgClouds') === '0' || localStorage.getItem('bubble_bg_clouds') === '0';
    const disableGrass = params.get('bgGrass') === '0' || localStorage.getItem('bubble_bg_grass') === '0';
    const disableParticles = params.get('bgParticles') === '0' || localStorage.getItem('bubble_bg_particles') === '0';

    this.systems.setToggles({
      clouds: !disableClouds,
      grass: !disableGrass,
      particles: !disableParticles,
    });

    const qualityParam = params.get('quality') ?? localStorage.getItem('bubble_quality');
    if (qualityParam === 'high' || qualityParam === 'medium' || qualityParam === 'low') {
      this.setQualityTier(qualityParam);
    }
  }
}
