import assert from 'node:assert/strict';
import { GAME_LEVELS } from '../prototype/shared/trail-catalog.mjs';
import { VOCABULARY } from '../prototype/shared/vocabulary-catalog.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';

const words = new Map(VOCABULARY.map(word => [word.id, word]));
for (const level of GAME_LEVELS.reveal) {
  const selections = [level.wordPool, ...[() => 0, () => 0.5, () => 0.999].map(random =>
    drawVocabularyRound({ pool: level.wordPool, count: level.wordCount, state: null, random }).selection)];
  for (const selection of selections) {
    for (const id of selection) {
      const word = words.get(id);
      const en = [...word.english].filter(letter => /[A-Za-z]/.test(letter)).length;
      const he = [...word.hebrew].filter(letter => /[\u05d0-\u05ea]/.test(letter)).length;
      const rank = level.difficultyRank;
      const valid = rank === 1 ? Math.max(en, he) <= 4
        : rank === 2 ? Math.max(en, he) <= 5 && Math.min(en, he) >= 3
        : rank === 3 ? en + he >= 8 && en + he <= 12
        : rank === 4 ? en + he >= 11 && en + he <= 16
        : Math.max(en, he) >= 8;
      assert.ok(valid, `${level.id} rank ${rank} selected ${id} (${en} English, ${he} Hebrew letters)`);
    }
  }
}
console.log('PASS: random Reveal words respect every level difficulty');
