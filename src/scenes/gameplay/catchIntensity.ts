export interface CatchIntensityInput {
  catchMoments: number[];
  now: number;
  windowSize?: number;
}

export interface CatchIntensityResult {
  catchMoments: number[];
  intensity: number;
  streakCount: number;
}

export function registerCatchAndComputeIntensity(input: CatchIntensityInput): CatchIntensityResult {
  const windowSize = input.windowSize ?? 90;
  const cutoff = input.now - windowSize;
  const nextCatchMoments = [...input.catchMoments, input.now].filter((moment) => moment >= cutoff);
  const streakCount = nextCatchMoments.length;

  return {
    catchMoments: nextCatchMoments,
    intensity: Math.min(1.8, 1 + streakCount * 0.12),
    streakCount,
  };
}
