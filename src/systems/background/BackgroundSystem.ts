import { WeatherConfig } from '../../scenes/WeatherParticles';
import { AmbientParticleSystem } from './AmbientParticleSystem';
import { Cloud, CloudLayerSystem } from './CloudLayerSystem';
import { GrassSwaySystem } from './GrassSwaySystem';
import { WindController } from './WindController';

interface ToggleState {
  clouds: boolean;
  grass: boolean;
  particles: boolean;
}

export type QualityTier = 'high' | 'medium' | 'low';

const PARTICLE_QUALITY_MULTIPLIER: Record<QualityTier, number> = {
  high: 1.2,
  medium: 0.85,
  low: 0.55,
};

export class BackgroundSystem {
  private readonly cloudLayerSystem = new CloudLayerSystem();
  private readonly grassSwaySystem = new GrassSwaySystem();
  private readonly ambientParticleSystem = new AmbientParticleSystem();
  private readonly windController = new WindController();

  private toggles: ToggleState = {
    clouds: true,
    grass: true,
    particles: true,
  };

  private windStrength = 0.5;
  private excitement = 0;
  private qualityTier: QualityTier = 'high';
  private baseWeatherConfig: WeatherConfig | null = null;

  get cloudSystem(): CloudLayerSystem {
    return this.cloudLayerSystem;
  }

  get grassSystem(): GrassSwaySystem {
    return this.grassSwaySystem;
  }

  get particles(): AmbientParticleSystem {
    return this.ambientParticleSystem;
  }

  getWindStrength(): number {
    return this.windStrength;
  }

  getExcitement(): number {
    return this.excitement;
  }

  resize(width: number, height: number) {
    this.ambientParticleSystem.resize(width, height);
  }

  setWeatherConfig(config: WeatherConfig) {
    this.baseWeatherConfig = config;
    this.applyWeatherConfig();
  }

  setQualityTier(tier: QualityTier) {
    this.qualityTier = tier;
    this.applyWeatherConfig();
  }

  getQualityTier(): QualityTier {
    return this.qualityTier;
  }

  update(clouds: Cloud[], deltaTime: number, screenWidth: number, screenHeight: number) {
    const baseWind = this.windController.update(deltaTime);
    this.excitement = Math.max(0, this.excitement - 0.004 * deltaTime);
    this.windStrength = Math.min(1.2, baseWind + this.excitement * 0.18);

    if (this.toggles.clouds) {
      this.cloudLayerSystem.update(clouds, deltaTime, screenWidth, screenHeight, this.windStrength);
    }

    if (this.toggles.grass) {
      this.grassSwaySystem.update(deltaTime);
    }

    if (this.toggles.particles) {
      this.ambientParticleSystem.update(deltaTime, this.windStrength);
    }
  }

  burstAt(x: number, y: number) {
    this.windController.triggerGust();
    this.excitement = Math.min(1, this.excitement + 0.18);

    if (!this.toggles.particles) return;
    this.ambientParticleSystem.burst(x, y);
  }

  getParticleCount(): number {
    return this.ambientParticleSystem.getActiveCount();
  }

  setToggles(next: Partial<ToggleState>) {
    this.toggles = { ...this.toggles, ...next };
  }

  private applyWeatherConfig() {
    if (!this.baseWeatherConfig) return;

    const multiplier = PARTICLE_QUALITY_MULTIPLIER[this.qualityTier];
    this.ambientParticleSystem.setConfig({
      ...this.baseWeatherConfig,
      particleCount: Math.max(8, Math.round(this.baseWeatherConfig.particleCount * multiplier)),
    });
  }
}
