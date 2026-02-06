import { WeatherConfig, WeatherParticles } from '../../scenes/WeatherParticles';

export class AmbientParticleSystem {
  private readonly particles = new WeatherParticles();

  getContainer() {
    return this.particles;
  }

  resize(width: number, height: number) {
    this.particles.resize(width, height);
  }

  setConfig(config: WeatherConfig) {
    this.particles.setConfig(config);
  }

  update(deltaTime: number, windStrength: number, excitement: number) {
    this.particles.setWindStrength(windStrength);
    this.particles.setExcitement(excitement);
    this.particles.update(deltaTime);
  }

  burst(x: number, y: number, intensity = 1) {
    this.particles.burst(x, y, intensity);
  }

  getActiveCount(): number {
    return this.particles.getActiveCount();
  }
}
