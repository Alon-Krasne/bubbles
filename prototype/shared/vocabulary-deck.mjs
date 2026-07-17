function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function validateState(state, poolIds) {
  if (state === null) {
    return;
  }
  if (!state
    || !Array.isArray(state.remaining)
    || !Array.isArray(state.previous)
    || new Set(state.remaining).size !== state.remaining.length
    || new Set(state.previous).size !== state.previous.length
    || [...state.remaining, ...state.previous].some((wordId) => !poolIds.has(wordId))) {
    throw new Error('Invalid vocabulary deck state');
  }
}

export function drawVocabularyRound({ pool, count, state, random = Math.random }) {
  if (!Array.isArray(pool) || pool.length === 0 || new Set(pool).size !== pool.length) {
    throw new Error('Invalid vocabulary pool');
  }
  if (!Number.isInteger(count) || count < 1 || count > pool.length) {
    throw new Error(`Invalid vocabulary draw count ${count}`);
  }
  if (typeof random !== 'function') {
    throw new Error('Invalid vocabulary random source');
  }

  const poolIds = new Set(pool);
  validateState(state, poolIds);
  const previous = state?.previous ?? [];
  let remaining = shuffle(state ? state.remaining : pool, random);
  const selection = [];

  while (selection.length < count) {
    if (remaining.length === 0) {
      const selectedIds = new Set(selection);
      const previousIds = new Set(previous);
      const available = pool.filter((wordId) => !selectedIds.has(wordId));
      const fresh = available.filter((wordId) => !previousIds.has(wordId));
      const recentlySeen = available.filter((wordId) => previousIds.has(wordId));
      remaining = [...shuffle(fresh, random), ...shuffle(recentlySeen, random)];
    }
    selection.push(remaining.shift());
  }

  return {
    selection,
    state: {
      remaining,
      previous: [...selection],
    },
  };
}
