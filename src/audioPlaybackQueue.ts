export interface LatestPlaybackQueue<T> {
  request(
    value: T,
    onCompleted: (() => void) | null,
    onFailed?: ((error: unknown) => void) | null,
  ): void;
  clear(): void;
}

type Playback<T> = (value: T, signal: AbortSignal) => Promise<void>;

export function createLatestPlaybackQueue<T>(
  play: Playback<T>,
  onError: (error: unknown) => void,
): LatestPlaybackQueue<T> {
  let activeController: AbortController | null = null;
  let generation = 0;
  let hasPendingRequest = false;
  let pendingOnCompleted: (() => void) | null = null;
  let pendingOnFailed: ((error: unknown) => void) | null = null;
  let pendingRequest: T;
  let running = false;

  async function drain(runGeneration: number) {
    running = true;

    try {
      while (runGeneration === generation && hasPendingRequest) {
        const request = pendingRequest;
        const onCompleted = pendingOnCompleted;
        const onFailed = pendingOnFailed;
        hasPendingRequest = false;
        pendingOnCompleted = null;
        pendingOnFailed = null;
        const controller = new AbortController();
        activeController = controller;

        try {
          await play(request, controller.signal);
          if (!controller.signal.aborted && onCompleted) {
            onCompleted();
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            onError(error);
            onFailed?.(error);
          }
        } finally {
          if (activeController === controller) {
            activeController = null;
          }
        }
      }
    } finally {
      running = false;
      if (hasPendingRequest) {
        void drain(generation);
      }
    }
  }

  return {
    request(
      value: T,
      onCompleted: (() => void) | null,
      onFailed?: ((error: unknown) => void) | null,
    ) {
      pendingRequest = value;
      pendingOnCompleted = onCompleted;
      pendingOnFailed = onFailed ?? null;
      hasPendingRequest = true;
      if (!running) {
        void drain(generation);
      }
    },

    clear() {
      generation += 1;
      hasPendingRequest = false;
      pendingOnCompleted = null;
      pendingOnFailed = null;
      activeController?.abort();
    },
  };
}
