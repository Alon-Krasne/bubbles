import { PAINTER_CHAPTER_WORDS, getPainterWord } from '../prototype/shared/painter-content.mjs';

const HEBREW_NAMES = {
  'ח': 'חית', 'ת': 'תיו', 'ו': 'וו', 'ל': 'למד', 'פ': 'פא', 'ש': 'שין',
  'מ': 'מם', 'ס': 'סמך', 'י': 'יוד', 'ר': 'ריש', 'ה': 'הֵא', 'ד': 'דלת',
};

export function painterAudioClips(language) {
  const letters = [...new Set(PAINTER_CHAPTER_WORDS.flatMap(id =>
    getPainterWord(id, language).letters.map(letter => letter.char)))];
  return [
    { relativePath: 'ui/painter-start.mp3', transcript: language === 'en'
      ? "Let's paint the word! Follow the pink dot to the star."
      : 'בואו נצייר את המילה! עקבו מהנקודה הוורודה עד הכוכב.', painterPrompt: true },
    ...letters.map(char => ({
      relativePath: `letters/${char}.mp3`,
      transcript: language === 'en' ? `Letter ${char}` : `האות ${HEBREW_NAMES[char]}`,
      painterPrompt: true,
    })),
  ];
}
