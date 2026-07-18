export function getTravellerPosition(stage) {
  if (stage.id === 6) {
    return { x: stage.x, y: stage.y + 10 };
  }
  return { x: stage.x + 1, y: stage.y - 8 };
}
