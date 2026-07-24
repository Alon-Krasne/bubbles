export function calculateMasteryStars({ mistakes, challengeSize, solutionHints }) {
  const confidentMistakeLimit = Math.max(1, Math.ceil(challengeSize / 3));
  if (mistakes <= confidentMistakeLimit && solutionHints === 0) {
    return 3;
  }
  if (mistakes <= challengeSize) {
    return 2;
  }
  return 1;
}
