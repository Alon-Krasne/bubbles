import { Container, Graphics, Text } from 'pixi.js';
import { GROUND_HEIGHT } from '../../game/config';

export class IntroEffectRenderer {
  private readonly graphics = new Graphics();
  private readonly skipHint = new Text({
    text: 'לחצו על כל מקש כדי לדלג',
    style: {
      fontFamily: 'Rubik, Assistant, Arial, sans-serif',
      fontSize: 16,
      fill: 0xffffff,
      stroke: { color: 0x2d3436, width: 3 },
    },
  });

  constructor(parent: Container) {
    this.skipHint.anchor.set(0.5);
    parent.addChild(this.graphics);
    parent.addChild(this.skipHint);
  }

  render(progress: number, animationTime: number, screenWidth: number, screenHeight: number) {
    this.graphics.clear();

    const comet = this.getCometPosition(progress, screenWidth, screenHeight);
    this.drawCometTrail(comet.x, comet.y);
    this.drawCometHead(comet.x, comet.y);

    if (progress > 0.72) {
      const landing = (progress - 0.72) / 0.28;
      this.drawLandingBurst(landing, animationTime, screenWidth, screenHeight);
    }

    this.skipHint.x = screenWidth * 0.5;
    this.skipHint.y = screenHeight - 42;
    this.skipHint.alpha = 0.35 + Math.sin(animationTime * 0.08) * 0.2;
  }

  clear() {
    this.graphics.clear();
    this.skipHint.alpha = 0;
  }

  private getCometPosition(progress: number, screenWidth: number, screenHeight: number) {
    const startX = screenWidth + 140;
    const endX = screenWidth * 0.45;
    const startY = -90;
    const endY = screenHeight * 0.27;

    return {
      x: startX + (endX - startX) * progress,
      y: startY + (endY - startY) * progress,
    };
  }

  private drawCometTrail(cometX: number, cometY: number) {
    const trailCount = 8;

    for (let i = 0; i < trailCount; i++) {
      const t = i / trailCount;
      const tx = cometX + t * 160;
      const ty = cometY - t * 80;

      this.graphics.circle(tx, ty, 18 - t * 13);
      this.graphics.fill({ color: 0xfff8dd, alpha: (1 - t) * 0.22 });
    }
  }

  private drawCometHead(cometX: number, cometY: number) {
    this.graphics.circle(cometX, cometY, 15);
    this.graphics.fill({ color: 0xffffff, alpha: 0.94 });

    this.graphics.circle(cometX, cometY, 30);
    this.graphics.fill({ color: 0xffdbff, alpha: 0.34 });
  }

  private drawLandingBurst(landing: number, animationTime: number, screenWidth: number, screenHeight: number) {
    const pulse = 1 + Math.sin(animationTime * 0.25) * 0.1;
    const centerX = screenWidth * 0.5;
    const centerY = screenHeight - GROUND_HEIGHT - 22;

    this.graphics.circle(centerX, centerY, 42 * landing * pulse);
    this.graphics.fill({ color: 0xfff7c7, alpha: 0.35 * (1 - landing * 0.4) });

    this.graphics.circle(centerX, centerY, 20 * landing);
    this.graphics.fill({ color: 0xffffff, alpha: 0.45 * (1 - landing * 0.5) });

    const rays = 10;
    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2 + animationTime * 0.015;
      const inner = 14 * landing;
      const outer = (36 + Math.sin(animationTime * 0.08 + i) * 4) * landing;

      const ix = centerX + Math.cos(angle) * inner;
      const iy = centerY + Math.sin(angle) * inner;
      const ox = centerX + Math.cos(angle) * outer;
      const oy = centerY + Math.sin(angle) * outer;

      this.graphics.moveTo(ix, iy);
      this.graphics.lineTo(ox, oy);
      this.graphics.stroke({ color: 0xffefad, alpha: 0.35 * landing, width: 2 });
    }
  }
}
