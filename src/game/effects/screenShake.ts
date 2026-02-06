export interface ScreenShakeState {
  framesRemaining: number;
  magnitude: number;
  x: number;
  y: number;
}

interface StartScreenShakeInput {
  state: ScreenShakeState;
  intensity: number;
}

interface StepScreenShakeInput {
  state: ScreenShakeState;
  deltaTime: number;
  random?: () => number;
}

export function startScreenShake(input: StartScreenShakeInput): ScreenShakeState {
  const normalized = Math.max(0, Math.min(2, input.intensity));
  if (normalized <= 0) return input.state;

  return {
    ...input.state,
    framesRemaining: Math.max(input.state.framesRemaining, 8 + normalized * 7),
    magnitude: Math.max(input.state.magnitude, 0.8 + normalized * 1.4),
  };
}

export function stepScreenShake(input: StepScreenShakeInput): ScreenShakeState {
  if (input.state.framesRemaining <= 0 || input.state.magnitude <= 0.01) {
    return { ...input.state, framesRemaining: 0, magnitude: 0, x: 0, y: 0 };
  }

  const random = input.random ?? Math.random;
  const framesRemaining = Math.max(0, input.state.framesRemaining - input.deltaTime);
  const magnitude = Math.max(0, input.state.magnitude - 0.1 * input.deltaTime);
  const x = (random() * 2 - 1) * magnitude;
  const y = (random() * 2 - 1) * magnitude;

  if (framesRemaining === 0) {
    return { ...input.state, framesRemaining: 0, magnitude: 0, x: 0, y: 0 };
  }

  return { framesRemaining, magnitude, x, y };
}
