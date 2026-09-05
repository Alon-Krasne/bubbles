let translationHintSequence = 0;

export function addHebrewTranslationHint(element, translation) {
  translationHintSequence += 1;
  const hint = document.createElement('span');
  hint.id = `hebrew-translation-hint-${translationHintSequence}`;
  hint.className = 'hebrew-translation-hint';
  hint.lang = 'he';
  hint.dir = 'rtl';
  hint.setAttribute('role', 'tooltip');
  hint.textContent = translation;
  element.dataset.hebrewTranslation = translation;
  element.setAttribute('aria-describedby', hint.id);
  element.append(hint);
}

export function removeHebrewTranslationHint(element) {
  element.querySelector(':scope > .hebrew-translation-hint')?.remove();
  delete element.dataset.hebrewTranslation;
  element.removeAttribute('aria-describedby');
}
