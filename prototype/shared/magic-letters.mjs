// Pure game logic for "Magic Letters" (אותיות הקסם) - Word spelling & letter ordering puzzle

export function normalizeWordLetters(wordText, language) {
  if (!wordText) return [];
  if (language === 'en') {
    return [...wordText.toUpperCase()].filter((ch) => /[A-Z]/.test(ch));
  }
  // Hebrew: remove niqqud and whitespace, keep Hebrew alphabet
  return [...wordText].filter((ch) => !/[\u0591-\u05C7\s]/.test(ch) && /[\u05D0-\u05EA]/.test(ch));
}

export function getAnchorIndices(letterCount, rank = 1) {
  if (letterCount < 4) return [];
  if (rank <= 1) {
    // Rank 1: First letter (and last letter if word is 5+ chars) stays in place
    return letterCount >= 5 ? [0, letterCount - 1] : [0];
  }
  if (rank === 2) {
    // Rank 2: Only first letter stays in place
    return [0];
  }
  // Rank 3+: All letters shuffled
  return [];
}

function shuffleArray(array, random = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createMagicLettersRound({
  word,
  language = 'he',
  rank = 1,
  random = Math.random,
}) {
  const rawText = language === 'en' ? word.english : word.hebrew;
  const letters = normalizeWordLetters(rawText, language);

  if (letters.length < 4) {
    throw new Error(`Magic Letters requires at least 4 letters, got ${letters.length} for "${rawText}"`);
  }

  const anchorIndices = new Set(getAnchorIndices(letters.length, rank));

  const slots = letters.map((targetChar, index) => {
    const isLocked = anchorIndices.has(index);
    return {
      index,
      targetChar,
      currentChar: isLocked ? targetChar : null,
      locked: isLocked,
      trayItemId: null,
    };
  });

  const trayPool = letters
    .map((char, index) => ({ char, index }))
    .filter(({ index }) => !anchorIndices.has(index))
    .map(({ char, index }) => ({
      id: `tile-${index}`,
      char,
      originalIndex: index,
      used: false,
    }));

  let tray = shuffleArray(trayPool, random);

  // If shuffle happened to produce the exact original order and there's >1 tile, swap first two
  if (
    tray.length > 1 &&
    tray.every((item, i) => item.originalIndex === trayPool[i].originalIndex)
  ) {
    [tray[0], tray[1]] = [tray[1], tray[0]];
  }

  return {
    wordId: word.id,
    language,
    rank,
    letters,
    slots,
    tray,
    targetWord: letters.join(''),
  };
}

export function placeTrayItem(round, trayItemId, targetSlotIndex = null) {
  const item = round.tray.find((t) => t.id === trayItemId);
  if (!item || item.used) return false;

  let targetSlot;
  if (targetSlotIndex !== null) {
    targetSlot = round.slots[targetSlotIndex];
    if (!targetSlot || targetSlot.locked || targetSlot.currentChar !== null) {
      return false;
    }
  } else {
    // Find first empty, unlocked slot
    targetSlot = round.slots.find((s) => !s.locked && s.currentChar === null);
    if (!targetSlot) return false;
  }

  targetSlot.currentChar = item.char;
  targetSlot.trayItemId = item.id;
  item.used = true;
  return true;
}

export function returnSlotItem(round, slotIndex) {
  const slot = round.slots[slotIndex];
  if (!slot || slot.locked || slot.currentChar === null) return false;

  const item = round.tray.find((t) => t.id === slot.trayItemId);
  if (item) {
    item.used = false;
  }

  slot.currentChar = null;
  slot.trayItemId = null;
  return true;
}

// Drop a dragged letter on a slot. The source is a tray tile ({ trayItemId }) or a placed
// letter ({ slotIndex }). A filled target is replaced and its letter returns to the tray.
export function dropLetter(round, source, targetIndex) {
  const target = round.slots[targetIndex];
  if (!target || target.locked) return false;

  let tileId;
  if (source.slotIndex !== undefined) {
    const from = round.slots[source.slotIndex];
    if (!from || from.locked || from.currentChar === null || source.slotIndex === targetIndex) return false;
    tileId = from.trayItemId;
    returnSlotItem(round, source.slotIndex);
  } else {
    const item = round.tray.find((t) => t.id === source.trayItemId);
    if (!item || item.used) return false;
    tileId = item.id;
  }

  if (target.currentChar !== null) returnSlotItem(round, targetIndex);
  return placeTrayItem(round, tileId, targetIndex);
}

export function resetRound(round) {
  for (const slot of round.slots) {
    if (slot.locked) continue;
    slot.currentChar = null;
    slot.trayItemId = null;
  }
  for (const item of round.tray) {
    item.used = false;
  }
}

export function checkWordCompletion(round) {
  const isFilled = round.slots.every((s) => s.currentChar !== null);
  const isCorrect = round.slots.every((s) => s.currentChar === s.targetChar);
  const misplacedIndices = round.slots
    .filter((s) => s.currentChar !== null && s.currentChar !== s.targetChar)
    .map((s) => s.index);

  return {
    isFilled,
    isCorrect,
    misplacedIndices,
    currentWord: round.slots.map((s) => s.currentChar || '_').join(''),
  };
}

export function getLetterHint(round) {
  // 1. If any non-locked slot contains an incorrect letter, the hint is to remove it
  const wrongSlot = round.slots.find((s) => !s.locked && s.currentChar !== null && s.currentChar !== s.targetChar);
  if (wrongSlot) {
    return { type: 'remove', slotIndex: wrongSlot.index };
  }

  // 2. Find the first empty slot
  const emptySlot = round.slots.find((s) => s.currentChar === null);
  if (!emptySlot) return null;

  // Find an available tray item that matches emptySlot.targetChar
  const matchingItem = round.tray.find((t) => !t.used && t.char === emptySlot.targetChar);
  if (matchingItem) {
    return { type: 'place', slotIndex: emptySlot.index, trayItemId: matchingItem.id };
  }

  return null;
}
