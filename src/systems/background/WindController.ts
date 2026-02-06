export interface WindControllerConfig {
  minStrength?: number;
  maxStrength?: number;
  driftSpeed?: number;
  retargetIntervalMs?: number;
}

const DEFAULT_CONFIG: Required<WindControllerConfig> = {
  minStrength: 0.1,
  maxStrength: 1,
  driftSpeed: 0.015,
  retargetIntervalMs: 4000,
};

export class WindController {
  private readonly config: Required<WindControllerConfig>;
  private targetStrength = 0.5;
  private currentStrength = 0.5;
  private elapsedMs = 0;
  private gustBoost = 0;

  constructor(config: WindControllerConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentStrength = this.randomStrength();
    this.targetStrength = this.randomStrength();
  }

  update(deltaTime: number): number {
    this.elapsedMs += deltaTime * (1000 / 60);

    if (this.elapsedMs >= this.config.retargetIntervalMs) {
      this.targetStrength = this.randomStrength();
      this.elapsedMs = 0;
    }

    const delta = this.targetStrength - this.currentStrength;
    this.currentStrength += delta * this.config.driftSpeed * deltaTime;
    this.gustBoost = Math.max(0, this.gustBoost - 0.012 * deltaTime);

    const boostedStrength = this.currentStrength + this.gustBoost;
    return Math.max(this.config.minStrength, Math.min(this.config.maxStrength, boostedStrength));
  }

  triggerGust(amount = 0.22) {
    this.gustBoost = Math.min(0.45, this.gustBoost + amount);
  }

  getStrength(): number {
    const boostedStrength = this.currentStrength + this.gustBoost;
    return Math.max(this.config.minStrength, Math.min(this.config.maxStrength, boostedStrength));
  }

  private randomStrength(): number {
    const { minStrength, maxStrength } = this.config;
    return minStrength + Math.random() * (maxStrength - minStrength);
  }
}
