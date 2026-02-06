import { Graphics } from 'pixi.js';

export function drawHeart(
  graphics: Graphics,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  color: number,
  alpha: number
) {
  const s = size * 0.8;
  const rotate = createRotatePoint(cx, cy, rotation);

  const [topX, topY] = rotate(0, -s * 0.3);
  const [leftTopX, leftTopY] = rotate(-s, -s * 0.8);
  const [leftMidX, leftMidY] = rotate(-s, 0);
  const [bottomX, bottomY] = rotate(0, s);
  const [rightMidX, rightMidY] = rotate(s, 0);
  const [rightTopX, rightTopY] = rotate(s, -s * 0.8);

  graphics.moveTo(topX, topY);
  graphics.bezierCurveTo(leftTopX, leftTopY, leftMidX, leftMidY, bottomX, bottomY);
  graphics.bezierCurveTo(rightMidX, rightMidY, rightTopX, rightTopY, topX, topY);
  graphics.fill({ color, alpha });
}

export function drawLeaf(
  graphics: Graphics,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  color: number,
  alpha: number
) {
  const w = size * 0.4;
  const h = size;
  const rotate = createRotatePoint(cx, cy, rotation);

  const [topX, topY] = rotate(0, -h);
  const [rightX, rightY] = rotate(w, 0);
  const [bottomX, bottomY] = rotate(0, h);
  const [leftX, leftY] = rotate(-w, 0);

  graphics.moveTo(topX, topY);
  graphics.quadraticCurveTo(rightX, rightY, bottomX, bottomY);
  graphics.quadraticCurveTo(leftX, leftY, topX, topY);
  graphics.fill({ color, alpha });
}

export function drawDiamond(
  graphics: Graphics,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  color: number,
  alpha: number
) {
  const rotate = createRotatePoint(cx, cy, rotation);

  const [topX, topY] = rotate(0, -size);
  const [rightX, rightY] = rotate(size * 0.6, 0);
  const [bottomX, bottomY] = rotate(0, size);
  const [leftX, leftY] = rotate(-size * 0.6, 0);

  graphics.moveTo(topX, topY);
  graphics.lineTo(rightX, rightY);
  graphics.lineTo(bottomX, bottomY);
  graphics.lineTo(leftX, leftY);
  graphics.closePath();
  graphics.fill({ color, alpha });
}

function createRotatePoint(cx: number, cy: number, rotation: number) {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  return (x: number, y: number): [number, number] => [
    cx + x * cos - y * sin,
    cy + x * sin + y * cos,
  ];
}
