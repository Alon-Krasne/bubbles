export function afterMemoryCardReveal(cardFront: EventTarget, complete: () => void) {
  const handleTransitionEnd = (event: Event) => {
    if (event.target !== cardFront) {
      return;
    }
    if (typeof TransitionEvent !== 'undefined'
      && event instanceof TransitionEvent
      && event.propertyName !== 'transform') {
      return;
    }
    cardFront.removeEventListener('transitionend', handleTransitionEnd);
    complete();
  };
  cardFront.addEventListener('transitionend', handleTransitionEnd);
}
