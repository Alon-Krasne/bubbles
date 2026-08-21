import { createLatestPlaybackQueue } from './audioPlaybackQueue';

const AUDIO_ELEMENT_ID = 'recorded-speech';
const RECORDED_SPEECH_PLAYBACK_RATE = 1.5;
const VOCABULARY_AUDIO = import.meta.glob('./assets/audio/vocabulary/en/**/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function getAudioElement() {
  const existing = document.getElementById(AUDIO_ELEMENT_ID);
  if (existing) {
    return existing as HTMLAudioElement;
  }

  const audio = document.createElement('audio');
  audio.id = AUDIO_ELEMENT_ID;
  audio.hidden = true;
  audio.preload = 'auto';
  document.body.append(audio);
  return audio;
}

export function vocabularyWordAudio(wordId: string) {
  return requireVocabularyAudio(`./assets/audio/vocabulary/en/words/${wordId}.mp3`);
}

export function vocabularyPluralAudio(wordId: string) {
  return requireVocabularyAudio(`./assets/audio/vocabulary/en/plurals/${wordId}.mp3`);
}

export function vocabularyUiAudio(clipId: string) {
  return requireVocabularyAudio(`./assets/audio/vocabulary/en/ui/${clipId}.mp3`);
}

function requireVocabularyAudio(path: string) {
  const source = VOCABULARY_AUDIO[path];
  if (!source) {
    throw new Error(`Missing committed vocabulary audio ${path}`);
  }
  return source;
}

export function playRecordedSequence(sources: string[]) {
  requestRecordedSequence(sources, null);
}

export function playRecordedSequenceWithCompletion(
  sources: string[],
  onCompleted: () => void,
  onFailed?: (error: unknown) => void,
) {
  requestRecordedSequence(sources, onCompleted, onFailed ?? null);
}

function requestRecordedSequence(
  sources: string[],
  onCompleted: (() => void) | null,
  onFailed?: ((error: unknown) => void) | null,
) {
  if (sources.length === 0) {
    throw new Error('Recorded speech requires at least one audio source');
  }

  playbackQueue.request([...sources], onCompleted, onFailed);
}

function playSources(sources: string[], signal: AbortSignal) {
  const audio = getAudioElement();
  let sourceIndex = 0;

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      signal.removeEventListener('abort', stopPlayback);
    };

    const finish = () => {
      cleanup();
      resolve();
    };

    const fail = (error: unknown) => {
      cleanup();
      reject(error);
    };

    const stopPlayback = () => {
      cleanup();
      audio.pause();
      resolve();
    };

    const playNext = () => {
      if (signal.aborted) {
        stopPlayback();
        return;
      }
      if (sourceIndex >= sources.length) {
        finish();
        return;
      }

      audio.src = sources[sourceIndex];
      audio.playbackRate = RECORDED_SPEECH_PLAYBACK_RATE;
      audio.dataset.sequenceIndex = String(sourceIndex);
      audio.dataset.sequenceLength = String(sources.length);
      sourceIndex += 1;
      void audio.play().catch((error) => {
        if (signal.aborted) {
          return;
        }
        fail(error);
      });
    };

    audio.onended = playNext;
    audio.onerror = () => fail(audio.error ?? new Error('Recorded audio playback failed'));
    signal.addEventListener('abort', stopPlayback, { once: true });
    playNext();
  });
}

const playbackQueue = createLatestPlaybackQueue(playSources, (error) => {
  console.error('Unable to play committed audio', error);
});

export function stopRecordedSpeech() {
  playbackQueue.clear();
}
