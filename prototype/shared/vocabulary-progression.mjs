import { VOCABULARY } from './vocabulary-catalog.mjs';

const words = new Map(VOCABULARY.map(word => [word.id, word]));
// Foundations → everyday vocabulary → extended vocabulary → specialist/compound terms.
// Early chapters introduce new grades; the Reef gradually retires the basics.
const bands = [[1, 1], [1, 2], [1, 3], [1, 3], [1, 4], [2, 4], [2, 4], [3, 4]];

export function getVocabularyPool({ pool, rank, language, activity }) {
  if (!Number.isInteger(rank) || rank < 1 || rank > 8 || !['en', 'he'].includes(language)
    || !['memory', 'shop', 'shop-shelf', 'painter', 'reveal'].includes(activity)) {
    throw new Error('Invalid vocabulary progression context');
  }
  const [minimum, maximum] = bands[rank - 1];
  // Spelling/tracing and shelf distractors retain review; spoken Shop targets advance.
  const floor = ['painter', 'reveal', 'shop-shelf'].includes(activity) ? 1 : minimum;
  return pool.filter(id => {
    const grade = words.get(id).difficulty[language];
    return grade >= floor && grade <= maximum;
  });
}
