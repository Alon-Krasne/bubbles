import { calculateMasteryStars, formatStarRating } from './shared/activity-scoring.mjs';
import {
  MAGIC_HOUSE_OBJECTS,
  MAGIC_HOUSE_REQUEST_LAYOUTS,
  MAGIC_HOUSE_REQUESTS,
} from './shared/magic-house-content.mjs';
import {
  MAGIC_HOUSE_PLACEMENTS,
  MAGIC_HOUSE_ZONES,
} from './shared/magic-house-room.mjs';
import { selectVariedRequestIds } from './shared/magic-house-variation.mjs';
import { TRAIL_STAGES, getGameLevel, getLanguagePolicy } from './shared/trail-catalog.mjs';
import { applyEnglishLearningTranslationHint } from './shared/translation-hint.mjs';
import { saveStorage, recordStageCompletion } from './shared/saves.mjs';
import { snapshotHouseRound, restoreHouseRound } from './shared/magic-house-save.mjs';
import { configureTranslationHintButton } from './shared/translation-hint-control.mjs';

const OBJECTS = MAGIC_HOUSE_OBJECTS;

const REQUESTS = MAGIC_HOUSE_REQUESTS;

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

const CHARACTER_ASSETS = Object.freeze({
  princess: {
    idleCharacter: '../src/assets/characters/princess/princess_idle_1.webp',
    happyCharacter: '../src/assets/characters/princess/princess_celebrate_1.webp',
  },
  dinosaur: {
    idleCharacter: '../src/assets/characters/dinosaur/dinosaur_idle_1.webp',
    happyCharacter: '../src/assets/characters/dinosaur/dinosaur_celebrate_1.webp',
  },
  puppy: {
    idleCharacter: '../src/assets/characters/puppy/puppy_idle_1.webp',
    happyCharacter: '../src/assets/characters/puppy/puppy_celebrate_1.webp',
  },
  unicorn: {
    idleCharacter: '../src/assets/characters/unicorn/unicorn_idle_1.webp',
    happyCharacter: '../src/assets/characters/unicorn/unicorn_celebrate_1.webp',
  },
});

const LANGUAGE_LABELS = Object.freeze({
  en: 'אנגלית',
  he: 'עברית',
});

const HEBREW_GRAMMAR_BY_CHARACTER = Object.freeze({
  princess: 'female',
  dinosaur: 'male',
  puppy: 'male',
  unicorn: 'female',
});

const CHARACTER_EMOJIS = Object.freeze({
  princess: '🌸',
  dinosaur: '🫧',
  puppy: '🐶',
  unicorn: '🦄',
});

const ACTIVITY_MESSAGE_VERSION = 1;
const PREVIOUS_REQUESTS_STORAGE_PREFIX = 'magic-house-previous-requests-v1';
const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const hostContext = readHostContext();
const magicHouseLevel = getGameLevel('house', hostContext ? hostContext.levelId : 'bedroom-practice');
const activeProfiles = hostContext
  ? { [hostContext.profileId]: hostContext.profile }
  : PROFILES;

const objectById = new Map(OBJECTS.map((object) => [object.id, object]));
const profileStates = new Map(Object.keys(activeProfiles).map((profileId) => [profileId, createProfileState(profileId)]));
const timers = new Set();

let activeProfileId = hostContext ? hostContext.profileId : 'lotem';
let selectedObjectId = null;
let feedbackTimer = null;
let trailResultSent = false;

const roomCanvas = requireElement('room-canvas');
const magicHouse = document.querySelector('.magic-house');
const trailBackButton = requireElement('trail-back-button');
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
const successToast = requireElement('success-toast');
const celebration = requireElement('celebration');
const sentenceAudio = requireElement('sentence-audio');

if (hostContext) {
  trailBackButton.hidden = false;
  profileButton.disabled = true;
}

function readHostContext() {
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host');
  if (!host) {
    return null;
  }

  const activityId = params.get('activity');
  const levelId = params.get('level');
  const profileId = params.get('profile');
  const profileName = params.get('profileName');
  const profileEmoji = params.get('profileEmoji');
  const profileLanguage = params.get('profileLanguage');
  const profileCharacter = params.get('profileCharacter');
  const stageId = Number(params.get('stage'));
  const stage = TRAIL_STAGES.find((candidate) => candidate.id === stageId);
  const characterAssets = CHARACTER_ASSETS[profileCharacter];
  if (host !== 'world-map'
    || activityId !== 'magic-house'
    || stage?.activity !== activityId
    || stage?.level !== levelId
    || !profileId
    || profileId.length > 64
    || !PROFILE_ID_PATTERN.test(profileId)
    || !profileName
    || profileName.length > 12
    || profileName !== profileName.trim()
    || !profileEmoji
    || !Object.prototype.hasOwnProperty.call(LANGUAGE_LABELS, profileLanguage)
    || !Object.prototype.hasOwnProperty.call(CHARACTER_ASSETS, profileCharacter)
    || CHARACTER_EMOJIS[profileCharacter] !== profileEmoji) {
    throw new Error('Invalid Magic House host context');
  }

  return {
    activityId,
    levelId,
    profileId,
    stageId,
    profile: {
      name: profileName,
      avatar: profileEmoji,
      primary: profileLanguage,
      gender: HEBREW_GRAMMAR_BY_CHARACTER[profileCharacter],
      languageLabel: LANGUAGE_LABELS[profileLanguage],
      ...characterAssets,
    },
  };
}

function createProfileState(profileId) {
  const key = `house-round-${profileId}-${magicHouseLevel.id}`;
  const saved = saveStorage.getItem(key);
  if (saved) {
    const snapshot = JSON.parse(saved);
    if (snapshot.completedRequests < snapshot.requestIds.length) return restoreHouseRound(snapshot, REQUESTS, OBJECTS);
    if (hostContext && !JSON.parse(saveStorage.getItem(`route-${profileId}`)).progress[hostContext.stageId]) {
      recordStageCompletion(hostContext, calculateMasteryStars({ mistakes: snapshot.mistakes, challengeSize: snapshot.requestIds.length }));
      return restoreHouseRound(snapshot, REQUESTS, OBJECTS);
    }
  }
  const requests = selectLevelRequests(magicHouseLevel, profileId);
  const state = {
    requests,
    objects: selectLevelObjects(requests, magicHouseLevel.drawerSize),
    requestIndex: 0,
    completedRequests: 0,
    helpLevel: 0,
    mistakes: 0,
    placedObjectIds: new Set(),
    placedZoneByObjectId: new Map(),
    locked: false,
  };
  saveStorage.setItem(key, JSON.stringify(snapshotHouseRound(state)));
  return state;
}

function saveRound() {
  saveStorage.setItem(`house-round-${activeProfileId}-${magicHouseLevel.id}`, JSON.stringify(snapshotHouseRound(getState())));
}

function selectLevelRequests(level, profileId) {
  const allowedIds = new Set(level.requestIds);
  const allowedRequests = REQUESTS.filter((request) => allowedIds.has(request.id));
  if (allowedRequests.length !== level.requestIds.length) {
    throw new Error(`Magic House level ${level.id} has missing requests`);
  }
  const storageKey = `${PREVIOUS_REQUESTS_STORAGE_PREFIX}:${profileId}:${level.id}`;
  const savedPreviousIds = localStorage.getItem(storageKey);
  const previousIds = savedPreviousIds ? JSON.parse(savedPreviousIds) : null;
  const selectedIds = selectVariedRequestIds({
    requestIds: level.requestIds,
    requestLayouts: MAGIC_HOUSE_REQUEST_LAYOUTS,
    count: level.requestCount,
    previousIds,
  });
  localStorage.setItem(storageKey, JSON.stringify(selectedIds));
  const requestById = new Map(allowedRequests.map((request) => [request.id, request]));
  return selectedIds.map((requestId) => requestById.get(requestId));
}

function selectLevelObjects(requests, drawerSize) {
  const targetIds = new Set(requests.flatMap((request) => request.targets.map((target) => target.objectId)));
  const targetObjects = OBJECTS.filter((object) => targetIds.has(object.id));
  if (targetObjects.length !== targetIds.size || targetObjects.length > drawerSize) {
    throw new Error(`Magic House drawer cannot fit ${targetIds.size} target objects`);
  }

  const distractors = shuffle(OBJECTS.filter((object) => !targetIds.has(object.id)))
    .slice(0, drawerSize - targetObjects.length);
  return shuffle([...targetObjects, ...distractors]);
}

function getProfile() {
  return activeProfiles[activeProfileId];
}

function getState() {
  return profileStates.get(activeProfileId);
}

function getRequest() {
  return getState().requests[getState().requestIndex];
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
  return profile.primary === 'en' ? request.en.helpKeywords : request.he.keywords;
}

function getTranslationTerms(request = getRequest()) {
  return getProfile().primary === 'en' ? Object.keys(request.en.translations) : [];
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
  const learningPolicy = getLanguagePolicy(profile.primary);
  magicHouse.classList.toggle('is-rtl', profile.primary === 'he');
  magicHouse.classList.toggle('is-hebrew-learning', profile.primary === 'he');
  requireElement('profile-avatar').textContent = profile.avatar;
  requireElement('profile-name').textContent = profile.name;
  requireElement('profile-language').textContent = profile.languageLabel;
  requireElement('room-level-title').textContent = magicHouseLevel.title;
  guideCharacter.src = profile.idleCharacter;
  requireElement('celebration-character').src = profile.happyCharacter;
  requireElement('sound-button').hidden = learningPolicy.prompt !== 'spoken-english';
}

function renderDropZones() {
  const profile = getProfile();
  dropLayer.innerHTML = '';

  MAGIC_HOUSE_ZONES.forEach((zone) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'drop-zone';
    button.dataset.zone = zone.id;
    button.setAttribute(
      'aria-label',
      profile.primary === 'en'
        ? zone.labels.en
        : zone.labels.he,
    );
    Object.assign(button.style, zone.layout);
    button.style.setProperty('--zone-cue-color', zone.cue.color);
    button.style.setProperty('--zone-cue-fill', zone.cue.fill);

    const label = document.createElement('span');
    label.className = 'drop-zone-label';

    const primaryLabel = document.createElement('strong');
    primaryLabel.lang = profile.primary;
    primaryLabel.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
    primaryLabel.textContent = zone.labels[profile.primary];

    label.append(primaryLabel);
    if (profile.primary === 'en') {
      const supportingLabel = document.createElement('small');
      supportingLabel.id = `drop-zone-translation-${zone.id}`;
      supportingLabel.lang = 'he';
      supportingLabel.dir = 'rtl';
      supportingLabel.setAttribute('role', 'tooltip');
      supportingLabel.textContent = zone.labels.he;
      button.dataset.hebrewTranslation = zone.labels.he;
      button.setAttribute('aria-describedby', supportingLabel.id);
      label.append(supportingLabel);
    }
    button.append(label);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      attemptPlacement(selectedObjectId, zone.id);
    });
    dropLayer.append(button);
  });

  refreshPlacementCues();
}

function renderObjectDrawer() {
  const state = getState();
  const profile = getProfile();
  const learningPolicy = getLanguagePolicy(profile.primary);
  removeDragGhosts();
  objectList.innerHTML = '';

  state.objects.forEach((object) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'object-button';
    button.dataset.objectId = object.id;
    button.draggable = false;
    button.disabled = state.placedObjectIds.has(object.id);
    button.classList.toggle('is-placed', state.placedObjectIds.has(object.id));
    button.classList.toggle('is-selected', selectedObjectId === object.id);
    button.classList.add(learningPolicy.choices === 'written-hebrew' ? 'is-word-choice' : 'is-image-choice');
    button.setAttribute('aria-pressed', String(selectedObjectId === object.id));
    button.setAttribute('aria-label', object.labels[profile.primary]);

    if (learningPolicy.choices === 'semantic-images') {
      const art = document.createElement('span');
      art.className = 'object-art';
      setSpritePosition(art, object);
      button.append(art);
    } else {
      const label = document.createElement('span');
      label.className = 'object-label';
      label.textContent = object.labels.he;
      label.dir = 'rtl';
      button.append(label);
    }
    applyEnglishLearningTranslationHint(button, profile.primary, object.labels.he);
    button.addEventListener('click', () => selectObject(object.id));
    attachPointerDrag(button, object);
    objectList.append(button);
  });

  applyHelpState();
}

function renderPlacedObjects() {
  placedLayer.innerHTML = '';

  getState().placedZoneByObjectId.forEach((zoneId, objectId) => {
    const object = objectById.get(objectId);
    const placement = MAGIC_HOUSE_PLACEMENTS[`${objectId}:${zoneId}`];
    if (!object || !placement) {
      throw new Error(`Missing room placement for ${objectId}:${zoneId}`);
    }
    const placed = document.createElement('span');
    placed.className = 'placed-object';
    placed.dataset.objectId = objectId;
    placed.dataset.zoneId = zoneId;
    placed.setAttribute('aria-hidden', 'true');
    placed.style.left = placement.left;
    placed.style.top = placement.top;
    placed.style.setProperty('--placed-width', placement.width);
    setSpritePosition(placed, object);
    placedLayer.append(placed);
  });
}

function renderInstruction() {
  configureTranslationHintButton(requireElement('house-translation-hint'), getProfile().primary);
  const state = getState();
  const profile = getProfile();
  const request = getRequest();
  instructionPanel.classList.remove('is-success', 'show-keywords');
  sentenceElement.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
  translationElement.dir = profile.primary === 'en' ? 'rtl' : 'ltr';
  sentenceElement.innerHTML = highlightSentence(
    getPrimarySentence(request),
    getKeywords(request),
    getTranslationTerms(request),
  );
  if (profile.primary === 'en') {
    sentenceElement.querySelectorAll('.translation-term').forEach((term) => {
      const english = term.textContent.toLocaleLowerCase();
      term.tabIndex = 0;
      applyEnglishLearningTranslationHint(term, profile.primary, request.en.translations[english]);
    });
  }
  translationElement.textContent = getTranslation(request);
  translationElement.hidden = true;
  requireElement('request-progress').textContent = `${state.requestIndex + 1} / ${state.requests.length}`;
  prepareSentenceAudio();
  updateHelpDots();
}

function highlightSentence(sentence, keywords, translationTerms) {
  const allTerms = [...new Set([...keywords, ...translationTerms])];
  const sortedTerms = allTerms.sort((left, right) => right.length - left.length);
  const pattern = new RegExp(`(${sortedTerms.map(escapeRegExp).join('|')})`, 'gi');
  return sentence.split(pattern).map((part) => {
    const normalizedPart = part.toLocaleLowerCase();
    const isKeyword = keywords.some((keyword) => keyword.toLocaleLowerCase() === normalizedPart);
    const hasTranslation = translationTerms.some((term) => term.toLocaleLowerCase() === normalizedPart);
    if (!isKeyword && !hasTranslation) {
      return part;
    }
    const classes = [isKeyword ? 'keyword' : '', hasTranslation ? 'translation-term' : '']
      .filter(Boolean)
      .join(' ');
    return `<span class="${classes}">${part}</span>`;
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
  refreshPlacementCues();
}

function refreshPlacementCues() {
  dropLayer.classList.toggle('is-placement-cue', selectedObjectId !== null);
}

function attemptPlacement(objectId, zoneId) {
  const state = getState();
  if (!objectId || state.locked || state.placedObjectIds.has(objectId)) {
    return;
  }

  const target = getRequest().targets.find((candidate) => candidate.objectId === objectId && candidate.zoneId === zoneId);
  if (!target) {
    rejectPlacement(objectId);
    return;
  }

  state.placedObjectIds.add(objectId);
  state.placedZoneByObjectId.set(objectId, zoneId);
  selectedObjectId = null;
  renderDropZones();
  renderPlacedObjects();
  renderObjectDrawer();
  applyHelpState();
  celebratePlacement();

  const requestComplete = getRequest().targets.every((candidate) => state.placedObjectIds.has(candidate.objectId));
  if (requestComplete) {
    completeRequest();
  } else {
    saveRound();
    showFeedback(getProfile().primary === 'en' ? 'One more thing!' : 'עוד דבר אחד!');
  }
}

function completeRequest() {
  const state = getState();
  state.locked = true;
  state.completedRequests += 1;
  saveRound();
  if (hostContext && state.completedRequests === state.requests.length) recordStageCompletion(hostContext, getFinalStars());
  instructionPanel.classList.add('is-success', 'show-keywords');
  translationElement.hidden = false;
  updateStars();
  stopSentenceAudio();
  showSuccessToast(getRequest());

  schedule(() => {
    hideSuccessToast();
    if (state.completedRequests === state.requests.length) {
      showCelebration();
      return;
    }

    state.requestIndex += 1;
    state.helpLevel = 0;
    state.locked = false;
    renderInstruction();
    renderDropZones();
    applyHelpState();
    speakSentence();
  }, 2200);
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
  selectedObjectId = null;
  renderObjectDrawer();
  refreshPlacementCues();
  const button = document.querySelector(`[data-object-id="${objectId}"]`);
  button.classList.remove('is-returning');
  void button.offsetWidth;
  button.classList.add('is-returning');
  showFeedback(getProfile().primary === 'en' ? 'Try another spot' : 'ננסה מקום אחר');
  speakSentence();
}

function rejectPlacement(objectId) {
  getState().mistakes += 1;
  saveRound();
  showGentleRetry(objectId);
}

function showSuccessToast(request) {
  const profile = getProfile();
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  feedbackElement.classList.remove('is-visible');
  successToast.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
  requireElement('success-toast-character').src = profile.happyCharacter;
  requireElement('success-toast-title').textContent = profile.primary === 'en' ? 'Great job!' : 'כל הכבוד!';
  requireElement('success-toast-message').textContent = request.success[profile.primary];
  successToast.classList.remove('is-visible');
  void successToast.offsetWidth;
  magicHouse.classList.add('is-showing-success');
  successToast.classList.add('is-visible');
  successToast.setAttribute('aria-hidden', 'false');
}

function hideSuccessToast() {
  magicHouse.classList.remove('is-showing-success');
  successToast.classList.remove('is-visible');
  successToast.setAttribute('aria-hidden', 'true');
}

function useHelp() {
  const state = getState();
  if (state.locked || state.helpLevel >= magicHouseLevel.maxHelpLevel) {
    return;
  }

  state.helpLevel = Math.min(magicHouseLevel.maxHelpLevel, state.helpLevel + 1);
  saveRound();
  if (state.helpLevel === 1 && getProfile().primary === 'en') {
    speakSentence();
  }
  applyHelpState();
}

function applyHelpState() {
  const state = getState();
  const request = getRequest();
  const keywordHelpLevel = getProfile().primary === 'he' ? 1 : 2;
  instructionPanel.classList.toggle('show-keywords', state.helpLevel >= keywordHelpLevel);
  translationElement.hidden = state.helpLevel < 3;

  document.querySelectorAll('.object-button').forEach((button) => {
    const isTarget = request.targets.some((target) => target.objectId === button.dataset.objectId && !state.placedObjectIds.has(target.objectId));
    button.classList.toggle('is-hinted', state.helpLevel >= 2 && isTarget);
  });

  document.querySelectorAll('.drop-zone').forEach((zone) => {
    const isTarget = request.targets.some((target) => (
      target.zoneId === zone.dataset.zone && !state.placedObjectIds.has(target.objectId)
    ));
    zone.classList.toggle('is-hinted', state.helpLevel >= 2 && isTarget);
  });

  refreshPlacementCues();

  updateHelpDots();
}

function updateHelpDots() {
  const level = getState().helpLevel;
  requireElement('help-level').textContent = `${'●'.repeat(level)}${'○'.repeat(magicHouseLevel.maxHelpLevel - level)}`;
  helpButton.disabled = level >= magicHouseLevel.maxHelpLevel;
}

function updateStars() {
  const count = getFinalStars();
  const stars = requireElement('stars').querySelectorAll('span');
  stars.forEach((star, index) => {
    star.classList.toggle('is-filled', index < count);
    star.textContent = index < count ? '★' : '☆';
  });
  requireElement('stars').setAttribute('aria-label', `${count} מתוך 3 כוכבים`);
}

function getFinalStars() {
  const state = getState();
  return calculateMasteryStars({
    mistakes: state.mistakes,
    challengeSize: state.requests.length,
  });
}

function speakSentence() {
  if (getLanguagePolicy(getProfile().primary).prompt !== 'spoken-english') {
    return;
  }
  sentenceAudio.currentTime = 0;
  void sentenceAudio.play();
}

function prepareSentenceAudio() {
  if (getLanguagePolicy(getProfile().primary).prompt !== 'spoken-english') {
    stopSentenceAudio();
    sentenceAudio.removeAttribute('src');
    return;
  }
  sentenceAudio.src = `./assets/magic-house/audio/${getProfile().primary}/${getRequest().id}.wav`;
  sentenceAudio.load();
}

function stopSentenceAudio() {
  sentenceAudio.pause();
  sentenceAudio.currentTime = 0;
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
  hideSuccessToast();
  render();
  speakSentence();
}

function showCelebration() {
  const profile = getProfile();
  celebration.dir = profile.primary === 'en' ? 'ltr' : 'rtl';
  requireElement('celebration-title').textContent = profile.primary === 'en' ? 'The room is ready!' : 'החדר מוכן!';
  requireElement('celebration-copy').textContent = profile.primary === 'en' ? 'You built a magical bedroom!' : 'בנית חדר שינה קסום!';
  requireElement('celebration-stars').textContent = formatStarRating(getFinalStars());
  requireElement('replay-button').textContent = hostContext
    ? 'חזרה למסלול'
    : (profile.primary === 'en' ? 'Play again' : 'שחקו שוב');
  magicHouse.classList.add('is-celebrating');
  celebration.classList.add('is-visible');
  celebration.setAttribute('aria-hidden', 'false');

  if (hostContext) {
    schedule(completeTrailStage, 2600);
  }
}

function postTrailMessage(type, stars) {
  window.parent.postMessage({
    type,
    version: ACTIVITY_MESSAGE_VERSION,
    stageId: hostContext.stageId,
    activityId: hostContext.activityId,
    levelId: hostContext.levelId,
    profileId: hostContext.profileId,
    ...(stars ? { stars } : {}),
  }, window.location.origin);
}

function completeTrailStage() {
  if (!hostContext || trailResultSent) {
    return;
  }

  trailResultSent = true;
  postTrailMessage('bubbles.activity.complete', getFinalStars());
}

function exitToTrail() {
  if (!hostContext || trailResultSent) {
    return;
  }

  trailResultSent = true;
  postTrailMessage('bubbles.activity.exit');
}

function handleCelebrationAction() {
  if (hostContext) {
    completeTrailStage();
    return;
  }

  resetActiveProfile();
}

function resetActiveProfile() {
  clearTimers();
  stopSentenceAudio();
  saveStorage.removeItem(`house-round-${activeProfileId}-${magicHouseLevel.id}`);
  profileStates.set(activeProfileId, createProfileState(activeProfileId));
  selectedObjectId = null;
  celebration.classList.remove('is-visible');
  celebration.setAttribute('aria-hidden', 'true');
  magicHouse.classList.remove('is-celebrating');
  hideSuccessToast();
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
      removeDragGhosts();
      ghost = document.createElement('span');
      ghost.className = 'drag-ghost';
      if (getProfile().primary === 'he') {
        ghost.classList.add('is-word');
        ghost.textContent = object.labels.he;
        ghost.dir = 'rtl';
      } else {
        setSpritePosition(ghost, object);
      }
      document.body.append(ghost);
    }

    if (ghost) {
      event.preventDefault();
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    }
  });

  button.addEventListener('pointerup', (event) => {
    if (!pointerState || pointerState.id !== event.pointerId) {
      return;
    }

    const didMove = pointerState.moved;
    if (didMove) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop-zone');
      cleanupPointerDrag();
      if (target) {
        attemptPlacement(object.id, target.dataset.zone);
      } else {
        rejectPlacement(object.id);
      }
      return;
    }

    cleanupPointerDrag();
  });

  button.addEventListener('pointercancel', cancelPointerDrag);
  button.addEventListener('lostpointercapture', cancelPointerDrag);

  function cleanupPointerDrag() {
    ghost?.remove();
    ghost = null;
    pointerState = null;
  }

  function cancelPointerDrag() {
    if (!pointerState) {
      return;
    }
    cleanupPointerDrag();
    selectedObjectId = null;
    renderObjectDrawer();
  }
}

function removeDragGhosts() {
  document.querySelectorAll('.drag-ghost').forEach((ghost) => ghost.remove());
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
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
trailBackButton.addEventListener('click', exitToTrail);
requireElement('replay-button').addEventListener('click', handleCelebrationAction);
roomCanvas.addEventListener('click', (event) => {
  if (selectedObjectId && !event.target.closest('.drop-zone')) {
    rejectPlacement(selectedObjectId);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    profileMenu.hidden = true;
    profileButton.setAttribute('aria-expanded', 'false');
    if (selectedObjectId) {
      selectedObjectId = null;
      renderObjectDrawer();
    }
  }
});

render();
if (getState().completedRequests === getState().requests.length) showCelebration();
else speakSentence();
