export function calculateMasteryStars({ mistakes, challengeSize }) {
  const confidentMistakeLimit = Math.max(1, Math.ceil(challengeSize / 2));
  if (mistakes <= confidentMistakeLimit) {
    return 3;
  }
  if (mistakes <= challengeSize * 2) {
    return 2;
  }
  return 1;
}

export function formatStarRating(stars) {
  return `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
}
