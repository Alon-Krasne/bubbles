export class GrassSwaySystem {
  private animationTime = 0;

  update(deltaTime: number) {
    this.animationTime += deltaTime;
  }

  getTopEdgeWave(x: number): number {
    return Math.sin(x * 0.05 + this.animationTime * 0.02) * 5;
  }

  getBladeSway(x: number, windStrength: number): number {
    return Math.sin(this.animationTime * 0.03 + x * 0.1) * 3 * windStrength;
  }

  getFlowerBob(x: number): number {
    return Math.sin(this.animationTime * 0.05 + x) * 2;
  }
}
