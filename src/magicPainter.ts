import { mountPainter } from './painter.mjs';
import template from './magic-painter.html?raw';
import './magic-painter.css';
import { getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { playRecordedSequence, stopRecordedSpeech, vocabularyWordAudio, hebrewWordAudio, painterStartAudio, painterLetterAudio } from './recordedSpeech';
import type { HostedActivityContext, HostedActivitySession } from './hostedActivity';
import { getPainterWordPool } from '../prototype/shared/painter-content.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

export function openMagicPainter(context: HostedActivityContext, session: HostedActivitySession) {
  const level = getGameLevel('painter', context.levelId);
  const root = document.getElementById('magic-painter-screen')!;
  root.innerHTML = template;
  const language = context.profileLanguage;
  const deckKey = `painter-deck-${context.profileId}-${context.destination}-${language}-${level.id}`;
  const savedDeck = localStorage.getItem(deckKey);
  const round = drawVocabularyRound({ pool: getPainterWordPool(level, language), count: level.wordCount,
    state: savedDeck ? JSON.parse(savedDeck) : null });
  localStorage.setItem(deckKey, JSON.stringify(round.state));
  const wordRecording = (wordId: string) => language === 'en' ? vocabularyWordAudio(wordId) : hebrewWordAudio(wordId);
  const playNow = (sources: string[]) => {
    stopRecordedSpeech();
    playRecordedSequence(sources);
  };
  mountPainter(root, {
    wordIds: round.selection,
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
