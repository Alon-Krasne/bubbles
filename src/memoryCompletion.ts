interface MemoryRevealAnimation {
  finished: Promise<unknown>;
}

interface MemoryRevealFront {
  getAnimations(): MemoryRevealAnimation[];
}

interface MemoryRevealCard {
  classList: {
    contains(className: string): boolean;
  };
  querySelector(selector: string): MemoryRevealFront | null;
}

function assertCompleteMemoryBoard(cards: readonly MemoryRevealCard[], pairCount: number) {
  const expectedCardCount = pairCount * 2;
  if (cards.length !== expectedCardCount) {
    throw new Error(`Memory completion expected ${expectedCardCount} cards but rendered ${cards.length}`);
  }

  if (cards.some((card) => !card.classList.contains('is-face-up') || !card.classList.contains('is-matched'))) {
    throw new Error('Memory completion requires every card to be matched and face-up');
  }
}

export async function waitForMemoryBoardReveal(cards: readonly MemoryRevealCard[], pairCount: number) {
  assertCompleteMemoryBoard(cards, pairCount);

  const fronts = cards.map((card) => {
    const front = card.querySelector('.memory-card-front');
    if (!front) {
      throw new Error('Memory card is missing its front face');
    }
    return front;
  });

  const revealAnimations = fronts.flatMap((front) => front.getAnimations());
  await Promise.all(revealAnimations.map((animation) => animation.finished));

  assertCompleteMemoryBoard(cards, pairCount);
}
