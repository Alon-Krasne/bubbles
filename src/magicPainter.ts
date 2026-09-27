import { mountPainter } from './painter.mjs';
import template from './magic-painter.html?raw';
import './magic-painter.css';
import { getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import { playRecordedSequence, stopRecordedSpeech, vocabularyWordAudio, hebrewWordAudio } from './recordedSpeech';
import type { HostedActivityContext, HostedActivitySession } from './hostedActivity';

export function openMagicPainter(context: HostedActivityContext, session: HostedActivitySession) {
  const level = getGameLevel('painter', context.levelId);
  const root = document.getElementById('magic-painter-screen')!;
  root.innerHTML = template;
  const speak = () => playRecordedSequence([
    context.profileLanguage === 'en' ? vocabularyWordAudio(level.wordId) : hebrewWordAudio(level.wordId),
  ]);
  mountPainter(root, {
    wordId: level.wordId,
    language: context.profileLanguage,
    speak,
    onExit: () => { stopRecordedSpeech(); session.exit(); },
    onComplete: (stars: number) => { stopRecordedSpeech(); session.complete(stars); },
  });
}
