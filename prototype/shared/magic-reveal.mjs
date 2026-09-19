export function getRevealState(word, guesses) {
  const letters = [...word.toLocaleUpperCase()].filter(c => /[A-Zא-ת]/u.test(c));
  const chosen = new Set(guesses.map(c => c.toLocaleUpperCase()));
  const revealed = letters.filter(c => chosen.has(c)).length;
  return { letters, revealed, complete: revealed === letters.length, tiles: Math.floor(12 * revealed / letters.length) };
}

export function getRevealHint(word, guesses, random = Math.random) {
  const state = getRevealState(word, guesses);
  const chosen = new Set(guesses.map(letter => letter.toLocaleUpperCase()));
  const remaining = [...new Set(state.letters)].filter(letter => !chosen.has(letter));
  return remaining[Math.floor(random() * remaining.length)];
}

export function getInitialRevealedLetters(word, random = Math.random) {
  const letters = [...word.toLocaleUpperCase()].filter(c => /[A-Zא-ת]/u.test(c));
  const unique = [...new Set(letters)];
  if (unique.length === 0) return [];
  const targetCount = Math.min(letters.length >= 5 ? 2 : letters.length >= 3 ? 1 : 0, unique.length - 1);
  const chosen = [];
  for (let i = 0; i < targetCount; i += 1) {
    chosen.push(unique.splice(Math.floor(random() * unique.length), 1)[0]);
  }
  return chosen;
}
