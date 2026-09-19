export function getRevealState(word, guesses) {
  const letters = [...word.toLocaleUpperCase()].filter(c => /[A-Zא-ת]/u.test(c));
  const chosen = new Set(guesses.map(c => c.toLocaleUpperCase()));
  const revealed = letters.filter(c => chosen.has(c)).length;
  return { letters, revealed, complete: revealed === letters.length, tiles: Math.floor(12 * revealed / letters.length) };
}

export function getRevealHint(word, guesses) {
  const state = getRevealState(word, guesses);
  const chosen = new Set(guesses);
  return state.letters.find(letter => !chosen.has(letter));
}

export function getInitialRevealedLetters(word) {
  const letters = [...word.toLocaleUpperCase()].filter(c => /[A-Zא-ת]/u.test(c));
  const unique = [...new Set(letters)];
  if (unique.length === 0) return [];
  const targetCount = letters.length >= 5 ? 2 : letters.length >= 3 ? 1 : 0;
  const chosen = [];
  if (targetCount >= 1 && unique.length >= 1) {
    chosen.push(letters[0]);
  }
  if (targetCount >= 2 && unique.length >= 2) {
    const last = letters[letters.length - 1];
    if (last !== letters[0]) {
      chosen.push(last);
    } else {
      const other = unique.find(c => c !== letters[0]);
      if (other) chosen.push(other);
    }
  }
  return chosen;
}
