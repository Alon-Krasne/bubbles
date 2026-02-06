export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  layer: 0 | 1 | 2;
  bobPhase: number;
}

interface CloudLayerConfig {
  count: number;
  minSize: number;
  maxSize: number;
  minSpeed: number;
  maxSpeed: number;
  minOpacity: number;
  maxOpacity: number;
  minY: number;
  maxY: number;
}

const LAYERS: CloudLayerConfig[] = [
  { count: 2, minSize: 90, maxSize: 150, minSpeed: 0.08, maxSpeed: 0.16, minOpacity: 0.22, maxOpacity: 0.34, minY: 45, maxY: 130 },
  { count: 3, minSize: 70, maxSize: 120, minSpeed: 0.18, maxSpeed: 0.3, minOpacity: 0.32, maxOpacity: 0.46, minY: 70, maxY: 180 },
  { count: 4, minSize: 45, maxSize: 90, minSpeed: 0.32, maxSpeed: 0.5, minOpacity: 0.45, maxOpacity: 0.65, minY: 95, maxY: 240 },
];

export class CloudLayerSystem {
  private animationTime = 0;
  private rngState = 0x2f6e2b1;

  createInitialClouds(screenWidth: number, screenHeight: number): Cloud[] {
    const clouds: Cloud[] = [];

    LAYERS.forEach((layerConfig, index) => {
      for (let i = 0; i < layerConfig.count; i++) {
        clouds.push(this.createCloud(index as 0 | 1 | 2, screenWidth, screenHeight, true));
      }
    });

    return clouds;
  }

  update(clouds: Cloud[], deltaTime: number, screenWidth: number, screenHeight: number, windStrength: number) {
    this.animationTime += deltaTime;

    clouds.forEach((cloud) => {
      const windBoost = 0.85 + windStrength * 0.5;
      cloud.x += cloud.speed * windBoost * deltaTime;

      if (cloud.x > screenWidth + cloud.size * 2) {
        const replacement = this.createCloud(cloud.layer, screenWidth, screenHeight, false);
        cloud.x = replacement.x;
        cloud.y = replacement.y;
        cloud.size = replacement.size;
        cloud.speed = replacement.speed;
        cloud.opacity = replacement.opacity;
        cloud.bobPhase = replacement.bobPhase;
      }
    });
  }

  getBobbingOffset(cloud: Cloud): number {
    const bobAmplitude = 1.5 + cloud.layer * 1.3;
    const bobSpeed = 0.008 + cloud.layer * 0.004;
    return Math.sin(this.animationTime * bobSpeed + cloud.bobPhase) * bobAmplitude;
  }

  private createCloud(layer: 0 | 1 | 2, screenWidth: number, screenHeight: number, onScreen: boolean): Cloud {
    const cfg = LAYERS[layer];
    const maxY = Math.min(cfg.maxY, screenHeight * 0.45);

    const size = this.randomBetween(cfg.minSize, cfg.maxSize);
    const x = onScreen
      ? this.randomBetween(-size * 1.2, screenWidth + size * 1.2)
      : -size * this.randomBetween(1.4, 2.2);

    return {
      x,
      y: this.randomBetween(cfg.minY, maxY),
      size,
      speed: this.randomBetween(cfg.minSpeed, cfg.maxSpeed),
      opacity: this.randomBetween(cfg.minOpacity, cfg.maxOpacity),
      layer,
      bobPhase: this.randomBetween(0, Math.PI * 2),
    };
  }

  private randomBetween(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  private random(): number {
    this.rngState = (1664525 * this.rngState + 1013904223) >>> 0;
    return this.rngState / 0xffffffff;
  }
}
