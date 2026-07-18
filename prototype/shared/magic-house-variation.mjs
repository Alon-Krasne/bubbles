function shuffle(items, random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function selectVariedRequestIds({
  requestIds,
  requestLayouts = [requestIds],
  count,
  previousIds,
  random = Math.random,
}) {
  const allowedIds = new Set(requestIds);
  const eligibleLayouts = requestLayouts.filter(
    (layout) => layout.length >= count && layout.every((requestId) => allowedIds.has(requestId)),
  );
  if (eligibleLayouts.length === 0) {
    throw new Error('Magic House level has no compatible authored request layout');
  }

  const shuffledLayouts = shuffle(eligibleLayouts, random);
  const candidates = shuffledLayouts.map((layout) => shuffle(layout, random).slice(0, count));
  let selected = candidates[0];
  if (!previousIds) {
    return selected;
  }

  const previousSet = new Set(previousIds);
  for (const candidate of candidates) {
    const repeatsPreviousSet = candidate.length === previousIds.length
      && candidate.every((requestId) => previousSet.has(requestId));
    if (!repeatsPreviousSet) {
      return candidate;
    }
  }

  for (const candidate of candidates) {
    const repeatsPreviousOrder = candidate.every((requestId, index) => requestId === previousIds[index]);
    if (!repeatsPreviousOrder) {
      return candidate;
    }
    selected = candidate;
  }

  if (count === requestIds.length) {
    const repeatsPreviousOrder = selected.every((requestId, index) => requestId === previousIds[index]);
    if (!repeatsPreviousOrder) {
      return selected;
    }
    selected.push(selected.shift());
    return selected;
  }

  const repeatsPreviousSet = selected.length === previousIds.length
    && selected.every((requestId) => previousSet.has(requestId));
  if (!repeatsPreviousSet) {
    return selected;
  }

  const replacement = requestIds.find((requestId) => !previousSet.has(requestId));
  if (replacement) {
    selected[selected.length - 1] = replacement;
    return selected;
  }

  throw new Error('Variable room levels require an unused request outside the previous set');
}
