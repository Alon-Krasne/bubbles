const AUDIO_ELEMENT_ID = 'recorded-speech';
const VOCABULARY_AUDIO = import.meta.glob('./assets/audio/vocabulary/en/**/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

let playbackId = 0;

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
  if (sources.length === 0) {
    throw new Error('Recorded speech requires at least one audio source');
  }

  const audio = getAudioElement();
  const currentPlaybackId = ++playbackId;
  let sourceIndex = 0;

  const playNext = () => {
    if (currentPlaybackId !== playbackId) {
      return;
    }
    if (sourceIndex >= sources.length) {
      audio.onended = null;
      return;
    }

    audio.src = sources[sourceIndex];
    audio.dataset.sequenceIndex = String(sourceIndex);
    audio.dataset.sequenceLength = String(sources.length);
    sourceIndex += 1;
    void audio.play().catch((error) => {
      console.error(`Unable to play committed audio ${audio.src}`, error);
    });
  };

  audio.pause();
  audio.onended = playNext;
  playNext();
}

export function stopRecordedSpeech() {
  playbackId += 1;
  const audio = document.getElementById(AUDIO_ELEMENT_ID) as HTMLAudioElement | null;
  if (!audio) {
    return;
  }
  audio.pause();
  audio.onended = null;
}
