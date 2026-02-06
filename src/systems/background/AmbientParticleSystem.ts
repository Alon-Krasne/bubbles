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

  update(deltaTime: number) {
    this.particles.update(deltaTime);
  }

  burst(x: number, y: number) {
    this.particles.burst(x, y);
  }

  getActiveCount(): number {
    return this.particles.getActiveCount();
  }
}
