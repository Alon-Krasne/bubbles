export interface LatestPlaybackQueue<T> {
  request(value: T): void;
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
  let pendingRequest: T;
  let running = false;

  async function drain(runGeneration: number) {
    running = true;

    try {
      while (runGeneration === generation && hasPendingRequest) {
        const request = pendingRequest;
        hasPendingRequest = false;
        const controller = new AbortController();
        activeController = controller;

        try {
          await play(request, controller.signal);
        } catch (error) {
          if (!controller.signal.aborted) {
            onError(error);
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
    request(value: T) {
      pendingRequest = value;
      hasPendingRequest = true;
      if (!running) {
        void drain(generation);
      }
    },

    clear() {
      generation += 1;
      hasPendingRequest = false;
      activeController?.abort();
    },
  };
}
