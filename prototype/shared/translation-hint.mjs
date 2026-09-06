let translationHintSequence = 0;

function addHebrewTranslationHint(element, translation) {
  translationHintSequence += 1;
  const hint = document.createElement('span');
  hint.id = `hebrew-translation-hint-${translationHintSequence}`;
  hint.className = 'hebrew-translation-hint';
  hint.lang = 'he';
  hint.dir = 'rtl';
  hint.setAttribute('role', 'tooltip');
  hint.setAttribute('aria-hidden', 'true');
  hint.textContent = translation;
  element.dataset.hebrewTranslation = translation;
  element.setAttribute('aria-describedby', hint.id);
  element.append(hint);
}

export function applyEnglishLearningTranslationHint(element, learningLanguage, translation) {
  if (learningLanguage !== 'en') {
    return false;
  }
  addHebrewTranslationHint(element, translation);
  return true;
}

export function removeHebrewTranslationHint(element) {
  element.querySelector(':scope > .hebrew-translation-hint')?.remove();
  delete element.dataset.hebrewTranslation;
  element.removeAttribute('aria-describedby');
}

export function keepHebrewTranslationFocusable(element) {
  if (element.hasAttribute('data-hebrew-translation')) {
    element.tabIndex = 0;
    element.setAttribute('role', 'group');
    return;
  }
  element.removeAttribute('tabindex');
}
