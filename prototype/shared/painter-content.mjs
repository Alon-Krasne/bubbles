import { VOCABULARY } from './vocabulary-catalog.mjs';

// Print-letter centerlines. Contiguous bends belong to one stroke.
// Hebrew direction reference: https://www.yo-yoo.co.il/limodim/ (numbered print diagrams).
// ש: https://www.yo-yoo.co.il/coolpics/bg.php?id=60673
// N: https://crane.osu.edu/files/2021/05/ABC_Lessons_V2_Final.pdf (p. 16/263).
// ת / ח / פ / ו retain the reviewed geometry from prototype commit 9b71348.
const PATHS = {
  A: ['M160 55 L75 240', 'M160 55 L245 240', 'M105 170 L215 170'],
  B: ['M100 55 L100 240', 'M100 55 C230 55 230 145 100 145', 'M100 145 C245 145 245 240 100 240'],
  C: ['M235 80 C75 0 35 280 235 225'],
  E: ['M110 55 L110 240', 'M110 55 L215 55', 'M110 148 L195 148', 'M110 240 L215 240'],
  K: ['M100 55 L100 240', 'M225 55 L100 150', 'M100 150 L225 240'],
  L: ['M110 55 L110 240', 'M110 240 L220 240'],
  N: ['M85 60 L85 240', 'M85 60 L235 240', 'M235 240 L235 60'],
  O: ['M160 55 C45 55 45 245 160 245 C275 245 275 55 160 55'],
  P: ['M100 55 L100 245', 'M100 55 C195 55 195 150 100 150'],
  S: ['M225 80 C110 5 35 155 160 150 C285 145 210 305 95 225'],
  T: ['M75 60 L245 60', 'M160 60 L160 240'],
  U: ['M85 55 L85 175 C85 270 235 270 235 175 L235 55'],
  'ת': ['M88 72 L222 72 L222 240', 'M116 72 L116 238 L82 238'],
  'ח': ['M92 72 L222 72 L222 240', 'M92 72 L92 240'],
  'פ': ['M95 72 L185 72 C212 72 222 88 222 114 L222 198 C222 224 212 240 185 240 L88 240', 'M95 72 L95 122 Q95 140 114 140 L134 140'],
  'ו': ['M136 72 L168 72 L168 240'],
  'ל': ['M105 40 L105 110 L225 110 Q245 110 232 140 L170 240'],
  'ש': ['M255 72 L232 210 Q225 240 195 240 L125 240 Q95 240 90 220 L65 72', 'M160 72 L145 238'],
  'מ': ['M75 80 L115 130 L80 240', 'M115 130 Q125 72 170 72 Q220 72 220 115 L220 240 L155 240'],
  'ס': ['M85 72 L180 72 Q230 72 230 125 L230 185 Q230 240 165 240 Q90 240 90 185 L90 72'],
  'י': ['M135 72 L172 72 L172 130'],
  'ר': ['M90 72 L190 72 Q225 72 225 108 L225 240'],
  'ה': ['M90 72 L190 72 Q225 72 225 108 L225 240', 'M95 128 L95 240'],
  'כ': ['M90 72 L180 72 Q230 72 230 125 L230 185 Q230 240 180 240 L90 240'],
  'ד': ['M85 72 L235 72', 'M215 72 L215 240'],
};

function letter(char) {
  const paths = PATHS[char];
  if (!paths) throw new Error(`Missing painter letter ${char}`);
  return Object.freeze({ char, strokes: Object.freeze(paths.map((d, index) => {
    const coordinates = d.match(/-?\d+(?:\.\d+)?/g).map(Number);
    return Object.freeze({ d, from: { x: coordinates[0], y: coordinates[1] },
      to: { x: coordinates.at(-2), y: coordinates.at(-1) }, label: String(index + 1) });
  })) });
}

export const PAINTER_CHAPTER_WORDS = Object.freeze(['cat', 'apple', 'sun', 'boat', 'book', 'ball']);
export const PAINTER_WORDS = Object.freeze(Object.fromEntries(PAINTER_CHAPTER_WORDS.map(id => {
  const vocabulary = VOCABULARY.find(word => word.id === id);
  return [id, Object.freeze({ id, en: vocabulary.english.toUpperCase(), he: vocabulary.hebrew,
    picture: `assets/painter/${id}.webp` })];
})));

export function getPainterWord(id, language) {
  if (!['en', 'he'].includes(language)) throw new Error(`Unknown painter language ${language}`);
  const content = PAINTER_WORDS[id];
  if (!content) throw new Error(`Unknown painter word ${id}`);
  const word = content[language];
  return { id, word, picture: content.picture, letters: [...word].map(letter) };
}
