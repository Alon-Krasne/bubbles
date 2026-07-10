const OBJECTS = [
  { id: 'pillow', labels: { en: 'pillow', he: 'כרית' }, sprite: ['0%', '0%'] },
  { id: 'ball', labels: { en: 'ball', he: 'כדור' }, sprite: ['33.333%', '0%'] },
  { id: 'book', labels: { en: 'blue book', he: 'ספר כחול' }, sprite: ['66.667%', '0%'] },
  { id: 'shoes', labels: { en: 'shoes', he: 'נעליים' }, sprite: ['100%', '0%'] },
  { id: 'yellow-lamp', labels: { en: 'yellow lamp', he: 'מנורה צהובה' }, sprite: ['0%', '100%'] },
  { id: 'apple', labels: { en: 'red apple', he: 'תפוח אדום' }, sprite: ['33.333%', '100%'] },
  { id: 'teddy', labels: { en: 'teddy bear', he: 'דובי' }, sprite: ['66.667%', '100%'] },
  { id: 'blue-lamp', labels: { en: 'blue lamp', he: 'מנורה כחולה' }, sprite: ['100%', '100%'] },
];

const ZONES = [
  { id: 'bed', labels: { en: 'bed', he: 'מיטה' } },
  { id: 'toy-box', labels: { en: 'toy box', he: 'קופסת צעצועים' } },
  { id: 'shelf', labels: { en: 'shelf', he: 'מדף' } },
  { id: 'under-bed', labels: { en: 'under the bed', he: 'מתחת למיטה' } },
  { id: 'nightstand', labels: { en: 'next to the bed', he: 'ליד המיטה' } },
  { id: 'table', labels: { en: 'table', he: 'שולחן' } },
];

const REQUESTS = [
  {
    id: 'request-1',
    targets: [{ objectId: 'pillow', zoneId: 'bed' }],
    en: { sentence: 'Put the pillow on the bed.', keywords: ['pillow', 'on', 'bed'] },
    he: {
      male: 'שים את הכרית על המיטה.',
      female: 'שימי את הכרית על המיטה.',
      keywords: ['הכרית', 'על', 'המיטה'],
    },
  },
  {
    id: 'request-2',
    targets: [{ objectId: 'ball', zoneId: 'toy-box' }],
    en: { sentence: 'Put the ball in the toy box.', keywords: ['ball', 'in', 'toy box'] },
    he: {
      male: 'שים את הכדור בקופסת הצעצועים.',
      female: 'שימי את הכדור בקופסת הצעצועים.',
      keywords: ['הכדור', 'בקופסת הצעצועים'],
    },
  },
  {
    id: 'request-3',
    targets: [{ objectId: 'book', zoneId: 'shelf' }],
    en: { sentence: 'Put the blue book on the shelf.', keywords: ['blue book', 'on', 'shelf'] },
    he: {
      male: 'שים את הספר הכחול על המדף.',
      female: 'שימי את הספר הכחול על המדף.',
      keywords: ['הספר הכחול', 'על', 'המדף'],
    },
  },
  {
    id: 'request-4',
    targets: [{ objectId: 'shoes', zoneId: 'under-bed' }],
    en: { sentence: 'Put the shoes under the bed.', keywords: ['shoes', 'under', 'bed'] },
    he: {
      male: 'שים את הנעליים מתחת למיטה.',
      female: 'שימי את הנעליים מתחת למיטה.',
      keywords: ['הנעליים', 'מתחת', 'למיטה'],
    },
  },
  {
    id: 'request-5',
    targets: [{ objectId: 'yellow-lamp', zoneId: 'nightstand' }],
    en: { sentence: 'Put the yellow lamp next to the bed.', keywords: ['yellow lamp', 'next to', 'bed'] },
    he: {
      male: 'שים את המנורה הצהובה ליד המיטה.',
      female: 'שימי את המנורה הצהובה ליד המיטה.',
      keywords: ['המנורה הצהובה', 'ליד', 'המיטה'],
    },
  },
  {
    id: 'request-6',
    targets: [
      { objectId: 'apple', zoneId: 'table' },
      { objectId: 'teddy', zoneId: 'bed' },
    ],
    en: {
      sentence: 'Put the red apple on the table and the teddy bear on the bed.',
      keywords: ['red apple', 'table', 'teddy bear', 'bed'],
    },
    he: {
      male: 'שים את התפוח האדום על השולחן ואת הדובי על המיטה.',
      female: 'שימי את התפוח האדום על השולחן ואת הדובי על המיטה.',
      keywords: ['התפוח האדום', 'השולחן', 'הדובי', 'המיטה'],
    },
  },
];

const PROFILES = {
  lotem: {
    name: 'לוטם',
    avatar: '🌸',
    primary: 'en',
    gender: 'female',
    languageLabel: 'אנגלית',
    idleCharacter: '../src/assets/characters/princess/princess_idle_1.webp',
    happyCharacter: '../src/assets/characters/princess/princess_celebrate_1.webp',
  },
  tom: {
    name: 'תום',
    avatar: '🫧',
    primary: 'he',
    gender: 'male',
    languageLabel: 'עברית',
    idleCharacter: '../src/assets/characters/dinosaur/dinosaur_idle_1.webp',
    happyCharacter: '../src/assets/characters/dinosaur/dinosaur_celebrate_1.webp',
  },
};

const PLACEMENTS = {
  pillow: { left: '56%', top: '48%', width: '12%' },
  ball: { left: '34%', top: '62%', width: '8%' },
  book: { left: '36%', top: '34%', width: '7%' },
  shoes: { left: '52%', top: '69%', width: '12%' },
  'yellow-lamp': { left: '78%', top: '52%', width: '8%' },
  apple: { left: '57%', top: '71%', width: '7%' },
  teddy: { left: '64%', top: '46%', width: '10%' },
};

const objectById = new Map(OBJECTS.map((object) => [object.id, object]));
const profileStates = new Map(Object.keys(PROFILES).map((profileId) => [profileId, createProfileState()]));
const timers = new Set();

let activeProfileId = 'lotem';
let selectedObjectId = null;
let feedbackTimer = null;
let audioCompletionHandler = null;

const roomCanvas = requireElement('room-canvas');
const magicHouse = document.querySelector('.magic-house');
const dropLayer = requireElement('drop-layer');
const placedLayer = requireElement('placed-layer');
const objectList = requireElement('object-list');
const instructionPanel = requireElement('instruction-panel');
const sentenceElement = requireElement('sentence');
const translationElement = requireElement('translation');
const feedbackElement = requireElement('feedback');
const helpButton = requireElement('help-button');
const profileButton = requireElement('profile-button');
const profileMenu = requireElement('profile-menu');
const guideCharacter = requireElement('guide-character');
const celebration = requireElement('celebration');
const sentenceAudio = requireElement('sentence-audio');

function createProfileState() {
  return {
    requestIndex: 0,
    completedRequests: 0,
    helpLevel: 0,
    placedObjectIds: new Set(),
    locked: false,
  };
}

function getProfile() {
  return PROFILES[activeProfileId];
}

function getState() {
  return profileStates.get(activeProfileId);
}

function getRequest() {
  return REQUESTS[getState().requestIndex];
}

function getPrimarySentence(request = getRequest()) {
  const profile = getProfile();
  return profile.primary === 'en' ? request.en.sentence : request.he[profile.gender];
}

function getTranslation(request = getRequest()) {
  const profile = getProfile();
  return profile.primary === 'en' ? request.he[profile.gender] : request.en.sentence;
}

function getKeywords(request = getRequest()) {
  const profile = getProfile();
  return profile.primary === 'en' ? request.en.keywords : request.he.keywords;
}

function render() {
  renderProfile();
  renderDropZones();
  renderPlacedObjects();
  renderObjectDrawer();
  renderInstruction();
  updateStars();
}

function renderProfile() {
  const profile = getProfile();
  magicHouse.classList.toggle('is-rtl', profile.primary === 'he');
  requireElement('profile-avatar').textContent = profile.avatar;
  requireElement('profile-name').textContent = profile.name;
  requireElement('profile-language').textContent = profile.languageLabel;
  guideCharacter.src = profile.idleCharacter;
  requireElement('celebration-character').src = profile.happyCharacter;
}

function renderDropZones() {
  const profile = getProfile();
  dropLayer.innerHTML = '';

  ZONES.forEach((zone) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'drop-zone';
    button.dataset.zone = zone.id;
    button.setAttribute('aria-label', zone.labels[profile.primary]);
    button.addEventListener('click', () => attemptPlacement(selectedObjectId, zone.id));
    button.addEventListener('dragover', (event) => {
      event.preventDefault();
      button.classList.add('is-ready');
    });
    button.addEventListener('dragleave', () => button.classList.remove('is-ready'));
    button.addEventListener('drop', (event) => {
      event.preventDefault();
      button.classList.remove('is-ready');
      attemptPlacement(event.dataTransfer.getData('text/plain'), zone.id);
    });
    dropLayer.append(button);
  });
}

function renderObjectDrawer() {
  const state = getState();
  const profile = getProfile();
  objectList.innerHTML = '';

  OBJECTS.forEach((object) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-button';
    button.dataset.objectId = object.id;
    button.draggable = !state.placedObjectIds.has(object.id);
    button.disabled = state.placedObjectIds.has(object.id);
    button.classList.toggle('is-placed', state.placedObjectIds.has(object.id));
    button.classList.toggle('is-selected', selectedObjectId === object.id);
    button.setAttribute('aria-pressed', String(selectedObjectId === object.id));
    button.setAttribute('aria-label', object.labels[profile.primary]);

    const art = document.createElement('span');
    art.className = 'object-art';
    setSpritePosition(art, object);

    const label = document.createElement('span');
    label.className = 'object-label';
    label.textContent = object.labels[profile.primary];
    label.dir = profile.primary === 'en' ? 'ltr' : 'rtl';

    button.append(art, label);
    button.addEventListener('click', () => selectObject(object.id));
    button.addEventListener('dragstart', (event) => {
      selectObject(object.id);
      event.dataTransfer.setData('text/plain', object.id);
      event.dataTransfer.effectAllowed = 'move';
    });
    attachPointerDrag(button, object);
    objectList.append(button);
  });

  applyHelpState();
}

function renderPlacedObjects() {
  placedLayer.innerHTML = '';

  getState().placedObjectIds.forEach((objectId) => {
    const object = objectById.get(objectId);
    const placement = PLACEMENTS[objectId];
    const placed = document.createElement('span');
    placed.className = 'placed-object';
    placed.dataset.objectId = objectId;
    placed.setAttribute('aria-hidden', 'true');
    placed.style.left = placement.left;
    placed.style.top = placement.top;
    placed.style.setProperty('--placed-width', placement.width);
    setSpritePosition(placed, object);
    placedLayer.append(placed);
  });
}

function renderInstruction() {
  const state = getState();
  const profile = getProfile();
  const request = getRequest();
  instructionPanel.classList.remove('is-success', 'show-keywords');
  sentenceElement.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
  translationElement.dir = profile.primary === 'en' ? 'rtl' : 'ltr';
  sentenceElement.innerHTML = highlightSentence(getPrimarySentence(request), getKeywords(request));
  translationElement.textContent = getTranslation(request);
  translationElement.hidden = true;
  requireElement('request-progress').textContent = `${state.requestIndex + 1} / ${REQUESTS.length}`;
  prepareSentenceAudio();
  updateHelpDots();
}

function highlightSentence(sentence, keywords) {
  const sortedKeywords = [...keywords].sort((left, right) => right.length - left.length);
  const pattern = new RegExp(`(${sortedKeywords.map(escapeRegExp).join('|')})`, 'gi');
  return sentence.split(pattern).map((part) => {
    const isKeyword = sortedKeywords.some((keyword) => keyword.toLocaleLowerCase() === part.toLocaleLowerCase());
    return isKeyword ? `<span class="keyword">${part}</span>` : part;
  }).join('');
}

function selectObject(objectId) {
  if (!objectId || getState().locked || getState().placedObjectIds.has(objectId)) {
    return;
  }

  selectedObjectId = objectId;
  document.querySelectorAll('.object-button').forEach((button) => {
    const isSelected = button.dataset.objectId === objectId;
    button.classList.toggle('is-selected', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

function attemptPlacement(objectId, zoneId) {
  const state = getState();
  if (!objectId || state.locked || state.placedObjectIds.has(objectId)) {
    return;
  }

  const target = getRequest().targets.find((candidate) => candidate.objectId === objectId && candidate.zoneId === zoneId);
  if (!target) {
    showGentleRetry(objectId);
    return;
  }

  state.placedObjectIds.add(objectId);
  selectedObjectId = null;
  renderPlacedObjects();
  renderObjectDrawer();
  celebratePlacement();

  const requestComplete = getRequest().targets.every((candidate) => state.placedObjectIds.has(candidate.objectId));
  if (requestComplete) {
    completeRequest();
  } else {
    showFeedback(getProfile().primary === 'en' ? 'One more thing!' : 'עוד דבר אחד!');
  }
}

function completeRequest() {
  const state = getState();
  state.locked = true;
  state.completedRequests += 1;
  instructionPanel.classList.add('is-success', 'show-keywords');
  translationElement.hidden = false;
  updateStars();
  showFeedback(getProfile().primary === 'en' ? 'Great job!' : 'כל הכבוד!');
  speakSentence();

  waitForSentenceToFinish(() => {
    if (state.completedRequests === REQUESTS.length) {
      showCelebration();
      return;
    }

    state.requestIndex += 1;
    state.helpLevel = 0;
    state.locked = false;
    renderInstruction();
    applyHelpState();
    speakSentence();
  });
}

function celebratePlacement() {
  const profile = getProfile();
  guideCharacter.src = profile.happyCharacter;
  guideCharacter.classList.remove('is-happy');
  void guideCharacter.offsetWidth;
  guideCharacter.classList.add('is-happy');
  schedule(() => {
    guideCharacter.src = profile.idleCharacter;
    guideCharacter.classList.remove('is-happy');
  }, 720);
}

function showGentleRetry(objectId) {
  const button = document.querySelector(`[data-object-id="${objectId}"]`);
  button?.classList.remove('is-returning');
  void button?.offsetWidth;
  button?.classList.add('is-returning');
  showFeedback(getProfile().primary === 'en' ? 'Try another spot' : 'ננסה מקום אחר');
  speakSentence();
}

function useHelp() {
  const state = getState();
  if (state.locked) {
    return;
  }

  state.helpLevel = Math.min(3, state.helpLevel + 1);
  if (state.helpLevel === 1) {
    speakSentence();
  }
  applyHelpState();
}

function applyHelpState() {
  const state = getState();
  const request = getRequest();
  instructionPanel.classList.toggle('show-keywords', state.helpLevel >= 2);

  document.querySelectorAll('.object-button').forEach((button) => {
    const isTarget = request.targets.some((target) => target.objectId === button.dataset.objectId && !state.placedObjectIds.has(target.objectId));
    button.classList.toggle('is-hinted', state.helpLevel >= 2 && isTarget);
  });

  document.querySelectorAll('.drop-zone').forEach((zone) => {
    const isTarget = request.targets.some((target) => target.zoneId === zone.dataset.zone && !state.placedObjectIds.has(target.objectId));
    zone.classList.toggle('is-current', isTarget);
    zone.classList.toggle('is-hinted', state.helpLevel >= 3 && isTarget);
  });

  updateHelpDots();
}

function updateHelpDots() {
  const level = getState().helpLevel;
  requireElement('help-level').textContent = `${'●'.repeat(level)}${'○'.repeat(3 - level)}`;
}

function updateStars() {
  const completed = getState().completedRequests;
  const count = completed >= 6 ? 3 : completed >= 5 ? 2 : completed >= 4 ? 1 : 0;
  const stars = requireElement('stars').querySelectorAll('span');
  stars.forEach((star, index) => {
    star.classList.toggle('is-filled', index < count);
    star.textContent = index < count ? '★' : '☆';
  });
  requireElement('stars').setAttribute('aria-label', `${count} מתוך 3 כוכבים`);
}

function speakSentence() {
  sentenceAudio.currentTime = 0;
  void sentenceAudio.play();
}

function prepareSentenceAudio() {
  sentenceAudio.src = `./assets/magic-house/audio/${getProfile().primary}/request-${getState().requestIndex + 1}.wav`;
  sentenceAudio.load();
}

function stopSentenceAudio() {
  sentenceAudio.pause();
  sentenceAudio.currentTime = 0;
}

function waitForSentenceToFinish(callback) {
  clearAudioCompletionHandler();
  audioCompletionHandler = () => {
    audioCompletionHandler = null;
    callback();
  };
  sentenceAudio.addEventListener('ended', audioCompletionHandler, { once: true });
}

function clearAudioCompletionHandler() {
  if (!audioCompletionHandler) {
    return;
  }
  sentenceAudio.removeEventListener('ended', audioCompletionHandler);
  audioCompletionHandler = null;
}

function switchProfile(profileId) {
  clearTimers();
  stopSentenceAudio();
  activeProfileId = profileId;
  selectedObjectId = null;
  profileButton.setAttribute('aria-expanded', 'false');
  profileMenu.hidden = true;
  celebration.classList.remove('is-visible');
  celebration.setAttribute('aria-hidden', 'true');
  magicHouse.classList.remove('is-celebrating');
  render();
  speakSentence();
}

function showCelebration() {
  const profile = getProfile();
  celebration.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
  requireElement('celebration-title').textContent = profile.primary === 'en' ? 'The room is ready!' : 'החדר מוכן!';
  requireElement('celebration-copy').textContent = profile.primary === 'en' ? 'You built a magical bedroom!' : 'בנית חדר שינה קסום!';
  requireElement('replay-button').textContent = profile.primary === 'en' ? 'Play again' : 'שחקו שוב';
  magicHouse.classList.add('is-celebrating');
  celebration.classList.add('is-visible');
  celebration.setAttribute('aria-hidden', 'false');
}

function resetActiveProfile() {
  clearTimers();
  stopSentenceAudio();
  profileStates.set(activeProfileId, createProfileState());
  selectedObjectId = null;
  celebration.classList.remove('is-visible');
  celebration.setAttribute('aria-hidden', 'true');
  magicHouse.classList.remove('is-celebrating');
  render();
  speakSentence();
}

function showFeedback(message) {
  feedbackElement.textContent = message;
  feedbackElement.classList.add('is-visible');
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
  }
  feedbackTimer = window.setTimeout(() => feedbackElement.classList.remove('is-visible'), 1100);
}

function attachPointerDrag(button, object) {
  let pointerState = null;
  let ghost = null;

  button.addEventListener('pointerdown', (event) => {
    if (button.disabled) {
      return;
    }
    pointerState = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', (event) => {
    if (!pointerState || pointerState.id !== event.pointerId) {
      return;
    }

    const distance = Math.hypot(event.clientX - pointerState.x, event.clientY - pointerState.y);
    if (!pointerState.moved && distance > 8) {
      pointerState.moved = true;
      selectObject(object.id);
      ghost = document.createElement('span');
      ghost.className = 'drag-ghost';
      setSpritePosition(ghost, object);
      document.body.append(ghost);
    }

    if (ghost) {
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    }
  });

  button.addEventListener('pointerup', (event) => {
    if (!pointerState || pointerState.id !== event.pointerId) {
      return;
    }

    if (pointerState.moved) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop-zone');
      ghost?.remove();
      ghost = null;
      if (target) {
        attemptPlacement(object.id, target.dataset.zone);
      }
    }

    pointerState = null;
  });
}

function setSpritePosition(element, object) {
  element.style.setProperty('--sprite-x', object.sprite[0]);
  element.style.setProperty('--sprite-y', object.sprite[1]);
}

function schedule(callback, delayMs) {
  const timer = window.setTimeout(() => {
    timers.delete(timer);
    callback();
  }, delayMs);
  timers.add(timer);
}

function clearTimers() {
  clearAudioCompletionHandler();
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function requireElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element;
}

profileButton.addEventListener('click', () => {
  const willOpen = profileMenu.hidden;
  profileMenu.hidden = !willOpen;
  profileButton.setAttribute('aria-expanded', String(willOpen));
});

document.querySelectorAll('[data-profile]').forEach((button) => {
  button.addEventListener('click', () => switchProfile(button.dataset.profile));
});

requireElement('sound-button').addEventListener('click', speakSentence);
helpButton.addEventListener('click', useHelp);
requireElement('replay-button').addEventListener('click', resetActiveProfile);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    profileMenu.hidden = true;
    profileButton.setAttribute('aria-expanded', 'false');
  }
});

render();
