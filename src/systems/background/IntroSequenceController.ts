export class IntroSequenceController {
  private active = false;
  private elapsed = 0;
  private onComplete: (() => void) | null = null;

  constructor(private readonly duration: number = 140) {}

  start(onComplete: () => void) {
    this.active = true;
    this.elapsed = 0;
    this.onComplete = onComplete;
  }

  skip() {
    if (!this.active) return;
    this.finish();
  }

  update(deltaTime: number) {
    if (!this.active) return;

    this.elapsed += deltaTime;
    if (this.elapsed < this.duration) return;

    this.finish();
  }

  isPlaying(): boolean {
    return this.active;
  }

  getProgress(): number {
    if (!this.active) return 0;
    return Math.max(0, Math.min(1, this.elapsed / this.duration));
  }

  private finish() {
    this.active = false;
    this.elapsed = this.duration;

    if (!this.onComplete) return;

    const callback = this.onComplete;
    this.onComplete = null;
    callback();
  }
}
