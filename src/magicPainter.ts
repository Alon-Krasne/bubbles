import { mountPainter } from './painter.mjs';
import template from './magic-painter.html?raw';
import './magic-painter.css';
import { getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { playRecordedSequence, stopRecordedSpeech, vocabularyWordAudio, hebrewWordAudio, painterStartAudio, painterLetterAudio } from './recordedSpeech';
import type { HostedActivityContext, HostedActivitySession } from './hostedActivity';
import { drawSavedVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

export function openMagicPainter(context: HostedActivityContext, session: HostedActivitySession) {
  const level = getGameLevel('painter', context.levelId);
  const deckKey = `painter-deck-${context.destination}-${context.profileLanguage}-${context.profileId}-${level.id}`;
  const [initialWord] = drawSavedVocabularyRound({ storage: localStorage,
    key: deckKey,
    pool: level.wordPool, count: 1 });
  const root = document.getElementById('magic-painter-screen')!;
  root.innerHTML = template;
  const language = context.profileLanguage;
  const wordRecording = (wordId: string) => language === 'en' ? vocabularyWordAudio(wordId) : hebrewWordAudio(wordId);
  const playNow = (sources: string[]) => {
    stopRecordedSpeech();
    playRecordedSequence(sources);
  };
  mountPainter(root, {
    wordPool: level.wordPool,
    initialWord,
    onWordChange: (wordId: string) => {
      const deck = JSON.parse(localStorage.getItem(deckKey)!);
      const remaining = [...deck.remaining, ...deck.previous].filter((id: string) => id !== wordId);
      localStorage.setItem(deckKey, JSON.stringify({ remaining, previous: [wordId] }));
    },
    language,
    speakWord: (wordId: string) => playNow([wordRecording(wordId)]),
    speakGuidance: (wordId: string, letter: string) => playNow([
      painterStartAudio(language), wordRecording(wordId), painterLetterAudio(language, letter),
    ]),
    speakLetter: (letter: string) => playNow([painterLetterAudio(language, letter)]),
    onExit: () => { stopRecordedSpeech(); session.exit(); },
    onComplete: (stars: number) => { stopRecordedSpeech(); session.complete(stars); },
  });
}
