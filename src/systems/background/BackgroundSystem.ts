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

  resize(width: number, height: number) {
    this.ambientParticleSystem.resize(width, height);
  }

  setWeatherConfig(config: WeatherConfig) {
    this.ambientParticleSystem.setConfig(config);
  }

  update(clouds: Cloud[], deltaTime: number, screenWidth: number, screenHeight: number) {
    this.windStrength = this.windController.update(deltaTime);

    if (this.toggles.clouds) {
      this.cloudLayerSystem.update(clouds, deltaTime, screenWidth, screenHeight, this.windStrength);
    }

    if (this.toggles.grass) {
      this.grassSwaySystem.update(deltaTime);
    }

    if (this.toggles.particles) {
      this.ambientParticleSystem.update(deltaTime);
    }
  }

  burstAt(x: number, y: number) {
    if (!this.toggles.particles) return;
    this.ambientParticleSystem.burst(x, y);
  }

  getParticleCount(): number {
    return this.ambientParticleSystem.getActiveCount();
  }

  setToggles(next: Partial<ToggleState>) {
    this.toggles = { ...this.toggles, ...next };
  }
}
