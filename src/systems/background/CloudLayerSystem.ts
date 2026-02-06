export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

export class CloudLayerSystem {
  private animationTime = 0;

  update(clouds: Cloud[], deltaTime: number, screenWidth: number) {
    this.animationTime += deltaTime;

    clouds.forEach((cloud, i) => {
      const depthFactor = 0.5 + (i % 3) * 0.3;
      cloud.x += cloud.speed * depthFactor * deltaTime;

      if (cloud.x > screenWidth + cloud.size * 2) {
        cloud.x = -cloud.size * 2;
      }
    });
  }

  getBobbingOffset(index: number): number {
    return Math.sin(this.animationTime * 0.015 + index * 2) * 3;
  }
}
