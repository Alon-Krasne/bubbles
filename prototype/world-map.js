import { LEGACY_TRAIL_STAGES, TRAIL_CHAPTERS, TRAIL_STAGES } from './shared/trail-catalog.mjs';
import {
  TRAIL_CONTENT_VERSION,
  createTrackProgress,
  isStageUnlocked,
  normalizeTrackProgress,
} from './shared/track-progress.mjs';
import { getTravellerPosition } from './shared/traveller-position.mjs';
import { formatStarRating } from './shared/activity-scoring.mjs';
import { saveStorage } from './shared/saves.mjs';

const stages = TRAIL_STAGES;
const availableStages = stages.filter((stage) => stage.available);
const availableStarTotal = availableStages.length * 3;
const lastAvailableStageId = availableStages[availableStages.length - 1].id;

const DEFAULT_PROFILES = [
  { id: 'lotem', name: 'לוטם', character: 'princess', learningLanguage: 'en' },
  { id: 'tom', name: 'תום', character: 'dinosaur', learningLanguage: 'he' },
];

const characterOptions = {
  princess: { emoji: '🌸', label: 'נסיכה', directory: 'princess' },
  dinosaur: { emoji: '🫧', label: 'דינוזאור', directory: 'dinosaur' },
  puppy: { emoji: '🐶', label: 'כלבלב', directory: 'puppy' },
  unicorn: { emoji: '🦄', label: 'חד קרן', directory: 'unicorn' },
};

const languageOptions = {
  en: { label: 'אנגלית', learningLabel: 'לומדים אנגלית' },
  he: { label: 'עברית', learningLabel: 'לומדים עברית' },
};

const WORLD_PROFILES_STORAGE_KEY = 'bubble_world_map_profiles_v1';
const WORLD_ACTIVE_PROFILE_STORAGE_KEY = 'bubble_world_map_profile_v1';
const ACTIVITY_MESSAGE_VERSION = 1;
const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

const world = document.getElementById('world');
const route = document.getElementById('route');
const mapScroll = document.querySelector('.map-scroll');
const chapterLabels = document.getElementById('chapter-labels');
const stagePanel = document.getElementById('stage-panel');
const panelClose = document.getElementById('panel-close');
const panelIcon = document.getElementById('panel-icon');
const panelKicker = document.getElementById('panel-kicker');
const panelTitle = document.getElementById('panel-title');
const panelDescription = document.getElementById('panel-description');
const panelStars = document.getElementById('panel-stars');
const playButton = document.getElementById('play-button');
const profileButton = document.getElementById('profile-button');
const profileMenu = document.getElementById('profile-menu');
const profileMenuList = document.getElementById('profile-menu-list');
const editProfileButton = document.getElementById('edit-profile-button');
const chooseProfileButton = document.getElementById('choose-profile-button');
const launchOverlay = document.getElementById('launch-overlay');
const launchCharacter = document.getElementById('launch-character');
const worldCompleteOverlay = document.getElementById('world-complete-overlay');
const worldCompleteCharacter = document.getElementById('world-complete-character');
const worldCompleteButton = document.getElementById('world-complete-button');
const traveller = document.getElementById('traveller');
const travellerImage = document.getElementById('traveller-image');
const activityOverlay = document.getElementById('activity-overlay');
const activityFrame = document.getElementById('activity-frame');
const trailRouteShadow = document.getElementById('trail-route-shadow');
const trailRouteBase = document.getElementById('trail-route-base');
const trailRouteBaseCore = document.getElementById('trail-route-base-core');
const trailRouteDust = document.getElementById('trail-route-dust');
const trailRouteGlow = document.getElementById('trail-route-glow');
const trailRouteProgress = document.getElementById('trail-route-progress');
const trailRouteSparkle = document.getElementById('trail-route-sparkle');
const profileGate = document.getElementById('profile-gate');
const gateProfileList = document.getElementById('gate-profile-list');
const addProfileButton = document.getElementById('add-profile-button');
const profileEditor = document.getElementById('profile-editor');
const profileForm = document.getElementById('profile-form');
const editorTitle = document.getElementById('editor-title');
const editorClose = document.getElementById('editor-close');
const profileNameInput = document.getElementById('profile-name-input');
const deleteProfileButton = document.getElementById('delete-profile-button');
const deleteConfirm = document.getElementById('delete-confirm');
const deleteConfirmCopy = document.getElementById('delete-confirm-copy');
const cancelDeleteButton = document.getElementById('cancel-delete-button');
const confirmDeleteButton = document.getElementById('confirm-delete-button');
const trackResetSection = document.getElementById('track-reset-section');
const trackStageSelect = document.getElementById('track-stage-select');
const trackResetButton = document.getElementById('track-reset-button');
const trackResetConfirm = document.getElementById('track-reset-confirm');
const trackResetCopy = document.getElementById('track-reset-copy');
const cancelTrackResetButton = document.getElementById('cancel-track-reset-button');
const confirmTrackResetButton = document.getElementById('confirm-track-reset-button');
const trackResetStatus = document.getElementById('track-reset-status');

let profiles = loadProfiles();
let routeProgress = loadWorldProgress();
let activeProfileId = loadActiveProfileId();
validateWorldState();
upgradeCompletedFrontier();
let selectedStage = stages.find((stage) => stage.id === getRouteProgress(activeProfileId).currentStage);
let editingProfileId = null;
let editorReturnsToGate = true;
let activeLaunch = null;
let launchTimer = null;
let launchStartedAt = 0;
const MIN_LAUNCH_CELEBRATION_MS = 350;

function validateWorldState() {
  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('World profiles must be a non-empty array');
  }

  const profileIds = new Set();
  profiles.forEach((profile) => {
    const isValidProfile = profile
      && typeof profile.id === 'string'
      && profile.id.length > 0
      && profile.id.length <= 64
      && PROFILE_ID_PATTERN.test(profile.id)
      && typeof profile.name === 'string'
      && profile.name.length > 0
      && profile.name.length <= 12
      && profile.name === profile.name.trim()
      && Object.prototype.hasOwnProperty.call(characterOptions, profile.character)
      && Object.prototype.hasOwnProperty.call(languageOptions, profile.learningLanguage);
    if (!isValidProfile || profileIds.has(profile.id)) {
      throw new Error('Invalid persisted world profile');
    }
    profileIds.add(profile.id);

    const storedProgress = routeProgress[profile.id];
    if (!storedProgress
      || !Number.isInteger(storedProgress.currentStage)
      || !stages.some((stage) => stage.id === storedProgress.currentStage && stage.available)
      || !storedProgress.progress
      || typeof storedProgress.progress !== 'object'
      || Array.isArray(storedProgress.progress)) {
      throw new Error(`Invalid route progress for ${profile.id}`);
    }

    Object.entries(storedProgress.progress).forEach(([stageId, stars]) => {
      const stage = stages.find((candidate) => candidate.id === Number(stageId));
      if (!stage || !stage.available || !Number.isInteger(stars) || stars < 1 || stars > 3) {
        throw new Error(`Invalid stage progress for ${profile.id}`);
      }
    });
  });

  if (!profileIds.has(activeProfileId)) {
    throw new Error(`Invalid active world profile ${activeProfileId}`);
  }
}

function upgradeCompletedFrontier() {
  let changed = false;

  profiles.forEach((profile) => {
    const progress = getRouteProgress(profile.id);
    while (progress.progress[progress.currentStage] > 0 && progress.currentStage < lastAvailableStageId) {
      progress.currentStage += 1;
      changed = true;
    }
  });

  if (changed) {
    saveWorldProgress();
  }
}

function loadProfiles() {
  const saved = saveStorage.getItem(WORLD_PROFILES_STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const initialProfiles = structuredClone(DEFAULT_PROFILES);
  saveStorage.setItem(WORLD_PROFILES_STORAGE_KEY, JSON.stringify(initialProfiles));
  return initialProfiles;
}

function saveProfiles() {
  saveStorage.setItem(WORLD_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

function loadWorldProgress() {
  return Object.fromEntries(profiles.map(profile => {
    const key = `route-${profile.id}`;
    const saved = saveStorage.getItem(key);
    if (!saved) {
      const progress = createTrackProgress(1, stages.length);
      saveStorage.setItem(key, JSON.stringify({ ...progress, contentVersion: TRAIL_CONTENT_VERSION }));
      return [profile.id, progress];
    }
    const parsed = JSON.parse(saved);
    const progress = normalizeTrackProgress(parsed, {
      stageCount: stages.length,
      legacyStageCount: LEGACY_TRAIL_STAGES.length,
    });
    if (progress !== parsed) saveStorage.setItem(key, JSON.stringify(progress));
    return [profile.id, progress];
  }));
}

function saveWorldProgress() {
  for (const profile of profiles) {
    saveStorage.setItem(`route-${profile.id}`, JSON.stringify({
      ...routeProgress[profile.id],
      contentVersion: TRAIL_CONTENT_VERSION,
    }));
  }
}

function loadActiveProfileId() {
  const saved = localStorage.getItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY);
  if (saved && profiles.some(profile => profile.id === saved)) {
    return saved;
  }

  localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, profiles[0].id);
  return profiles[0].id;
}

function getProfile(profileId = activeProfileId) {
  const profile = profiles.find((candidate) => candidate.id === profileId);
  if (!profile) {
    throw new Error(`Missing world profile ${profileId}`);
  }
  return profile;
}

function getRouteProgress(profileId = activeProfileId) {
  const progress = routeProgress[profileId];
  if (!progress) {
    throw new Error(`Missing route progress for ${profileId}`);
  }
  return progress;
}

function getCharacterAsset(character, pose) {
  const option = characterOptions[character];
  if (!option) {
    throw new Error(`Unknown character ${character}`);
  }
  return `../src/assets/characters/${option.directory}/${option.directory}_${pose}_1.webp`;
}

function renderRoute() {
  route.innerHTML = '';
  renderTrail();
  const progress = getRouteProgress();

  stages.forEach((stage) => {
    const stars = progress.progress[stage.id] || 0;
    // A stage opens once the player has cleared every stage before it, so the
    // frontier is the current stage and everything past it stays locked.
    const unlocked = isStageUnlocked(stage, progress.currentStage);
    const state = !unlocked
      ? 'locked'
      : stars > 0
        ? 'complete'
        : stage.id === progress.currentStage
          ? 'current'
          : 'future';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `world-stage is-${state}`;
    button.classList.toggle('is-selected', selectedStage?.id === stage.id);
    button.dataset.stage = String(stage.id);
    button.dataset.game = stage.game;
    button.dataset.activity = stage.activity;
    button.dataset.level = stage.level;
    button.dataset.difficulty = String(stage.difficultyRank);
    button.style.left = `${stage.x}%`;
    button.style.top = `${stage.y}%`;
    button.disabled = !unlocked;
    button.setAttribute('aria-label', state === 'locked'
      ? `שלב ${stage.id}, ${stage.title}, נעול`
      : `שלב ${stage.id}, ${stage.title}, ${stars} כוכבים`);

    const number = document.createElement('span');
    number.className = 'stage-number';
    number.textContent = String(stage.id);
    button.append(number);

    if (stars > 0) {
      const starLabel = document.createElement('span');
      starLabel.className = 'stage-stars';
      starLabel.setAttribute('aria-hidden', 'true');
      starLabel.textContent = formatStarRating(stars);
      button.append(starLabel);
    }

    if (unlocked) {
      button.addEventListener('click', () => selectStage(stage));
    } else {
      const lock = document.createElement('span');
      lock.className = 'stage-lock';
      lock.setAttribute('aria-hidden', 'true');
      lock.textContent = '🔒';
      button.append(lock);
    }

    route.append(button);
  });
}

function rectanglesOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Finds a spot for each chapter banner that clears every stage marker and the
// banners already placed, trying above, left, right and below the cluster.
function placeChapterLabel(label, rects, bounds, placed) {
  const width = (label.offsetWidth / bounds.width) * 100;
  const height = (label.offsetHeight / bounds.height) * 100;
  const gap = 2;
  const candidates = [
    { x: rects.centerX, y: rects.topY - height / 2 - gap },
    { x: rects.leftX - width / 2 - gap, y: rects.centerY },
    { x: rects.rightX + width / 2 + gap, y: rects.centerY },
    { x: rects.centerX, y: rects.bottomY + height / 2 + gap },
  ];
  for (const candidate of candidates) {
    label.style.left = `${candidate.x}%`;
    label.style.top = `${candidate.y}%`;
    const rect = label.getBoundingClientRect();
    const inside = rect.left >= 6 && rect.right <= bounds.width - 6
      && rect.top >= 6 && rect.bottom <= bounds.height - 6;
    const clear = !rects.nodes.some((node) => rectanglesOverlap(rect, node))
      && !placed.some((other) => rectanglesOverlap(rect, other));
    if (inside && clear) {
      placed.push(rect);
      return;
    }
  }
  placed.push(label.getBoundingClientRect());
}

function renderChapterLabels() {
  if (!chapterLabels) {
    return;
  }
  chapterLabels.replaceChildren();
  const bounds = chapterLabels.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0) {
    return;
  }
  const nodes = [...route.querySelectorAll('.world-stage')].map((node) => node.getBoundingClientRect());
  const placed = [];
  TRAIL_CHAPTERS.forEach((chapter, index) => {
    const chapterStages = stages.filter((stage) => stage.chapterIndex === index);
    if (chapterStages.length === 0) {
      return;
    }
    const rects = {
      centerX: chapterStages.reduce((total, stage) => total + stage.x, 0) / chapterStages.length,
      centerY: chapterStages.reduce((total, stage) => total + stage.y, 0) / chapterStages.length,
      topY: Math.min(...chapterStages.map((stage) => stage.y)),
      bottomY: Math.max(...chapterStages.map((stage) => stage.y)),
      leftX: Math.min(...chapterStages.map((stage) => stage.x)),
      rightX: Math.max(...chapterStages.map((stage) => stage.x)),
      nodes,
    };

    const label = document.createElement('div');
    label.className = `chapter-label chapter-label-${index + 1}`;
    label.style.visibility = 'hidden';

    const symbol = document.createElement('span');
    symbol.className = 'chapter-symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = chapter.symbol;

    const copy = document.createElement('span');
    copy.className = 'chapter-copy';
    const title = document.createElement('strong');
    title.textContent = chapter.title;
    const subtitle = document.createElement('small');
    subtitle.textContent = chapter.subtitle;
    copy.append(title, subtitle);

    label.append(symbol, copy);
    chapterLabels.append(label);
    label.style.visibility = '';
    placeChapterLabel(label, rects, bounds, placed);
  });
}

// Rounded polyline: each stop becomes the control point of a quadratic that
// ends at the midpoint toward the next stop. Consecutive quadratics share those
// midpoints, so the joins stay smooth and every bend reads as a soft arc.
function smoothTrailPath(points) {
  if (points.length < 2) {
    return '';
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const midX = (points[index].x + points[index + 1].x) / 2;
    const midY = (points[index].y + points[index + 1].y) / 2;
    path += ` Q ${points[index].x} ${points[index].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  path += ` L ${last.x} ${last.y}`;
  return path;
}

function renderTrail() {
  if (!trailRouteBase) {
    return;
  }
  const allPoints = stages.map((stage) => ({ x: stage.x, y: stage.y }));
  const fullPath = smoothTrailPath(allPoints);
  trailRouteShadow.setAttribute('d', fullPath);
  trailRouteBase.setAttribute('d', fullPath);
  trailRouteBaseCore.setAttribute('d', fullPath);
  trailRouteDust.setAttribute('d', fullPath);

  const progress = getRouteProgress();
  const travelledPoints = stages
    .filter((stage) => stage.id <= progress.currentStage)
    .map((stage) => ({ x: stage.x, y: stage.y }));
  const travelledPath = smoothTrailPath(travelledPoints);
  trailRouteGlow.setAttribute('d', travelledPath);
  trailRouteProgress.setAttribute('d', travelledPath);
  trailRouteSparkle.setAttribute('d', travelledPath);
}

function selectStage(stage) {
  selectedStage = stage;
  const profile = getProfile();
  const progress = getRouteProgress();
  const stars = progress.progress[stage.id] || 0;
  renderActivityIcon(panelIcon, stage);
  panelKicker.textContent = `${stage.gameLabel} · ${stage.difficultyLabel} · שלב ${stage.id} · ${languageOptions[profile.learningLanguage].label}`;
  panelTitle.textContent = stage.title;
  panelDescription.textContent = stage.description;
  panelStars.textContent = `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`;
  panelStars.setAttribute('aria-label', `${stars} מתוך 3 כוכבים`);
  document.querySelectorAll('.world-stage').forEach((node) => {
    node.classList.toggle('is-selected', Number(node.dataset.stage) === stage.id);
  });
  stagePanel.classList.add('is-open');
}

function renderActivityIcon(container, stage) {
  container.replaceChildren();
  const symbol = document.createElement('span');
  symbol.className = `activity-symbol activity-symbol-${stage.game}`;
  container.append(symbol);
}

function setProfile(profileId) {
  activeProfileId = profileId;
  localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, profileId);
  const profile = getProfile();
  const progress = getRouteProgress();
  document.getElementById('profile-avatar').src = getCharacterAsset(profile.character, 'idle');
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-language').textContent = languageOptions[profile.learningLanguage].label;
  document.getElementById('journey-label').textContent = `המסע של ${profile.name}`;
  updateStarTotal(progress);
  travellerImage.src = getCharacterAsset(profile.character, 'idle');
  traveller.setAttribute('aria-label', `${profile.name} בשלב ${progress.currentStage}`);

  const stage = stages.find((candidate) => candidate.id === progress.currentStage);
  positionTraveller(stage);
  selectedStage = stage;
  renderRoute();
  selectStage(stage);
  renderProfileMenu();
  closeProfileMenu();
  renderChapterLabels();
}

function positionTraveller(stage) {
  const position = getTravellerPosition(stage);
  traveller.dataset.stage = String(stage.id);
  traveller.style.left = `${position.x}%`;
  traveller.style.top = `${position.y}%`;
  centerStageInMap(stage);
}

// On small screens the map can be larger than the viewport, so keep the
// discovered frontier on screen instead of stranding the player at the origin.
function centerStageInMap(stage) {
  if (!mapScroll) {
    return;
  }
  const canScrollX = mapScroll.scrollWidth > mapScroll.clientWidth + 1;
  const canScrollY = mapScroll.scrollHeight > mapScroll.clientHeight + 1;
  if (!canScrollX && !canScrollY) {
    return;
  }
  const left = (stage.x / 100) * mapScroll.scrollWidth - mapScroll.clientWidth / 2;
  const top = (stage.y / 100) * mapScroll.scrollHeight - mapScroll.clientHeight / 2;
  mapScroll.scrollTo({
    left: canScrollX ? Math.max(0, left) : mapScroll.scrollLeft,
    top: canScrollY ? Math.max(0, top) : mapScroll.scrollTop,
    behavior: 'auto',
  });
}

function renderProfileMenu() {
  profileMenuList.replaceChildren();
  profiles.forEach((profile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-menu-option';
    button.classList.toggle('is-active', profile.id === activeProfileId);
    button.dataset.profile = profile.id;

    const image = document.createElement('img');
    image.src = getCharacterAsset(profile.character, 'idle');
    image.alt = '';
    const copy = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = profile.name;
    const language = document.createElement('small');
    language.textContent = languageOptions[profile.learningLanguage].label;
    copy.append(name, language);
    button.append(image, copy);
    button.addEventListener('click', () => setProfile(profile.id));
    profileMenuList.append(button);
  });
}

function renderGateProfiles() {
  gateProfileList.replaceChildren();
  profiles.forEach((profile) => {
    const card = document.createElement('article');
    card.className = 'gate-profile-card';

    const chooseButton = document.createElement('button');
    chooseButton.type = 'button';
    chooseButton.className = 'gate-profile-choice';
    chooseButton.setAttribute('aria-label', `למסלול של ${profile.name}`);
    const image = document.createElement('img');
    image.src = getCharacterAsset(profile.character, 'idle');
    image.alt = '';
    const name = document.createElement('strong');
    name.textContent = profile.name;
    const language = document.createElement('span');
    language.textContent = languageOptions[profile.learningLanguage].learningLabel;
    chooseButton.append(image, name, language);
    chooseButton.addEventListener('click', () => enterTrail(profile.id));

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'gate-profile-edit';
    editButton.title = `עריכת הפרופיל של ${profile.name}`;
    editButton.setAttribute('aria-label', `עריכת הפרופיל של ${profile.name}`);
    editButton.textContent = '✎';
    editButton.addEventListener('click', () => openProfileEditor(profile.id));
    card.append(chooseButton, editButton);
    gateProfileList.append(card);
  });
}

function openGate() {
  closeProfileMenu();
  profileGate.hidden = false;
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  renderGateProfiles();
}

function enterTrail(profileId) {
  setProfile(profileId);
  profileGate.hidden = true;
  world.inert = false;
  world.removeAttribute('aria-hidden');
  profileButton.focus();
}

function toggleProfileMenu() {
  const willOpen = profileMenu.hidden;
  profileMenu.hidden = !willOpen;
  profileButton.setAttribute('aria-expanded', String(willOpen));
}

function closeProfileMenu() {
  profileMenu.hidden = true;
  profileButton.setAttribute('aria-expanded', 'false');
}

function openProfileEditor(profileId) {
  editingProfileId = profileId;
  editorReturnsToGate = !profileGate.hidden;
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  if (editorReturnsToGate) {
    profileGate.inert = true;
    profileGate.setAttribute('aria-hidden', 'true');
  }
  const isCreating = profileId === null;
  editorTitle.textContent = isCreating ? 'פרופיל חדש' : 'עריכת פרופיל';
  profileNameInput.value = isCreating ? '' : getProfile(profileId).name;

  const character = isCreating ? 'puppy' : getProfile(profileId).character;
  profileForm.elements.character.value = character;
  const learningLanguage = isCreating ? 'en' : getProfile(profileId).learningLanguage;
  profileForm.elements.learningLanguage.value = learningLanguage;
  deleteProfileButton.hidden = isCreating || profiles.length === 1;
  deleteConfirm.hidden = true;
  profileForm.classList.remove('is-confirming-track-reset');
  trackResetSection.hidden = isCreating;
  trackResetConfirm.hidden = true;
  trackResetButton.disabled = false;
  trackResetStatus.textContent = '';
  if (!isCreating) {
    renderTrackResetOptions(profileId);
  }
  profileEditor.hidden = false;
  profileEditor.setAttribute('aria-hidden', 'false');
  profileNameInput.focus();
}

function closeProfileEditor() {
  deleteConfirm.hidden = true;
  trackResetConfirm.hidden = true;
  profileForm.classList.remove('is-confirming-track-reset');
  profileEditor.hidden = true;
  profileEditor.setAttribute('aria-hidden', 'true');
  editingProfileId = null;
  if (editorReturnsToGate) {
    profileGate.inert = false;
    profileGate.removeAttribute('aria-hidden');
    addProfileButton.focus();
  } else {
    world.inert = false;
    world.removeAttribute('aria-hidden');
    profileButton.focus();
  }
}

function renderTrackResetOptions(profileId) {
  const currentStage = getRouteProgress(profileId).currentStage;
  trackStageSelect.replaceChildren(...stages.map((stage) => {
    const option = document.createElement('option');
    option.value = String(stage.id);
    option.textContent = `שלב ${stage.id}: ${stage.title}${stage.id === currentStage ? ' (השלב הנוכחי)' : ''}`;
    return option;
  }));
  trackStageSelect.value = String(currentStage);
  updateTrackResetCopy();
  updateTrackResetAvailability();
}

function updateTrackResetAvailability() {
  if (editingProfileId === null) {
    trackResetButton.disabled = true;
    return;
  }
  const stageId = Number(trackStageSelect.value);
  const current = getRouteProgress(editingProfileId);
  const reset = createTrackProgress(stageId, stages.length);
  const hasSameStars = stages.every((stage) => (
    (current.progress[stage.id] || 0) === (reset.progress[stage.id] || 0)
  ));
  trackResetButton.disabled = current.currentStage === reset.currentStage && hasSameStars;
}

function updateTrackResetCopy() {
  const stageId = Number(trackStageSelect.value);
  confirmTrackResetButton.classList.toggle('is-destructive', stageId === 1);
  if (stageId === 1) {
    trackResetButton.textContent = 'איפוס להתחלה';
    confirmTrackResetButton.textContent = 'כן, מאפסים עכשיו';
    trackResetCopy.textContent = 'כל הכוכבים יימחקו והמסלול יתחיל משלב 1.';
    return;
  }
  trackResetButton.textContent = 'עדכון ההתקדמות';
  confirmTrackResetButton.textContent = 'כן, מעדכנים עכשיו';
  trackResetCopy.textContent = `שלבים 1 עד ${stageId - 1} יקבלו 3 כוכבים, ושלב ${stageId} ייפתח למשחק.`;
}

function requestTrackReset() {
  updateTrackResetCopy();
  deleteConfirm.hidden = true;
  trackResetConfirm.hidden = false;
  trackResetButton.disabled = true;
  profileForm.classList.add('is-confirming-track-reset');
  confirmTrackResetButton.focus();
}

function resetEditedProfileTrack() {
  if (editingProfileId === null) {
    throw new Error('Cannot reset a profile before it is created');
  }
  const stageId = Number(trackStageSelect.value);
  clearProfileRounds(editingProfileId);
  routeProgress[editingProfileId] = createTrackProgress(stageId, stages.length);
  saveWorldProgress();
  if (editingProfileId === activeProfileId) {
    setProfile(editingProfileId);
  }
  trackResetConfirm.hidden = true;
  trackResetButton.disabled = false;
  profileForm.classList.remove('is-confirming-track-reset');
  renderTrackResetOptions(editingProfileId);
  trackResetStatus.textContent = stageId === 1
    ? 'המסלול אופס ונשמר מיד. אין צורך ללחוץ על שמירה.'
    : `ההתקדמות עד שלב ${stageId} נשמרה מיד. אין צורך ללחוץ על שמירה.`;
  trackResetButton.focus();
}

function clearProfileRounds(profileId) {
  for (const key of saveStorage.keys()) {
    if (key.startsWith(`house-round-${profileId}-`) || key.startsWith(`memory-round-${profileId}-`)
      || key === `${profileId}-bubble_shop_sessions_v1`) saveStorage.removeItem(key);
  }
}

function readProfileName() {
  return profileNameInput.value.trim().replace(/[\u0591-\u05c7]/g, '').slice(0, 12);
}

function saveProfileFromEditor(event) {
  event.preventDefault();
  const name = readProfileName();
  if (!name) {
    profileNameInput.setCustomValidity('צריך לכתוב שם');
    profileNameInput.reportValidity();
    return;
  }

  profileNameInput.setCustomValidity('');
  const formData = new FormData(profileForm);
  const character = formData.get('character');
  const learningLanguage = formData.get('learningLanguage');
  if (typeof character !== 'string'
    || !Object.prototype.hasOwnProperty.call(characterOptions, character)
    || typeof learningLanguage !== 'string'
    || !Object.prototype.hasOwnProperty.call(languageOptions, learningLanguage)) {
    throw new Error('Invalid profile editor selection');
  }

  if (editingProfileId === null) {
    const profile = {
      id: `profile-${crypto.randomUUID()}`,
      name,
      character,
      learningLanguage,
    };
    profiles.push(profile);
    routeProgress[profile.id] = createTrackProgress(1, stages.length);
    activeProfileId = profile.id;
    saveWorldProgress();
    saveProfiles();
    localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
  } else {
    const profile = getProfile(editingProfileId);
    if (profile.learningLanguage !== learningLanguage) clearProfileRounds(profile.id);
    profile.name = name;
    profile.character = character;
    profile.learningLanguage = learningLanguage;
    saveProfiles();
    setProfile(profile.id);
  }

  const returnToGate = editorReturnsToGate;
  closeProfileEditor();
  renderGateProfiles();
  renderProfileMenu();
  if (!returnToGate) {
    setProfile(activeProfileId);
  }
}

function deleteEditedProfile() {
  if (profiles.length === 1) {
    throw new Error('The only world profile cannot be deleted');
  }
  deleteConfirmCopy.textContent = `למחוק את הפרופיל של ${getProfile(editingProfileId).name}?`;
  trackResetConfirm.hidden = true;
  profileForm.classList.remove('is-confirming-track-reset');
  deleteConfirm.hidden = false;
  cancelDeleteButton.focus();
}

function confirmProfileDeletion() {

  const deletedIndex = profiles.findIndex((profile) => profile.id === editingProfileId);
  const deletedId = profiles[deletedIndex].id;
  clearProfileRounds(deletedId);
  saveStorage.removeItem(`route-${deletedId}`);
  profiles.splice(deletedIndex, 1);
  delete routeProgress[deletedId];
  if (activeProfileId === deletedId) {
    activeProfileId = profiles[Math.min(deletedIndex, profiles.length - 1)].id;
    localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
  }
  saveProfiles();
  saveWorldProgress();
  setProfile(activeProfileId);
  closeProfileEditor();
  openGate();
}

function launchSelectedStage() {
  if (!selectedStage) {
    return;
  }

  const stage = selectedStage;
  const profile = getProfile();
  activeLaunch = {
    stageId: stage.id,
    activityId: stage.activity,
    levelId: stage.level,
    profileId: activeProfileId,
    profileName: profile.name,
    profileEmoji: characterOptions[profile.character].emoji,
    profileLanguage: profile.learningLanguage,
    profileCharacter: profile.character,
  };
  const launch = activeLaunch;
  setWorldInteractionLocked(true);
  launchCharacter.src = getCharacterAsset(profile.character, 'celebrate');
  document.getElementById('launch-title').textContent = stage.title;
  launchOverlay.classList.add('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'false');

  if (!stage.activity || !stage.level || !stage.entry) {
    throw new Error(`Stage ${stage.id} has no playable activity`);
  }

  loadActivity(launch, stage.entry);
}

function loadActivity(launch, entry) {
  if (launch !== activeLaunch) {
    return;
  }
  const params = new URLSearchParams({
    host: 'world-map',
    activity: launch.activityId,
    level: launch.levelId,
    stage: String(launch.stageId),
    profile: launch.profileId,
    profileName: launch.profileName,
    profileEmoji: launch.profileEmoji,
    profileLanguage: launch.profileLanguage,
    profileCharacter: launch.profileCharacter,
  });
  launchStartedAt = performance.now();
  activityFrame.src = `${entry}?${params}`;
}

function revealLoadedActivity() {
  const launch = activeLaunch;
  if (!launch) {
    return;
  }

  const elapsed = performance.now() - launchStartedAt;
  const remainingCelebration = Math.max(0, MIN_LAUNCH_CELEBRATION_MS - elapsed);
  launchTimer = window.setTimeout(() => openActivity(launch), remainingCelebration);
}

function openActivity(launch) {
  launchTimer = null;
  if (launch !== activeLaunch) {
    return;
  }
  activityOverlay.classList.add('is-visible');
  activityOverlay.setAttribute('aria-hidden', 'false');
  launchOverlay.classList.remove('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'true');
}

function closeActivity() {
  if (launchTimer !== null) {
    window.clearTimeout(launchTimer);
    launchTimer = null;
  }
  activityOverlay.classList.remove('is-visible');
  activityOverlay.setAttribute('aria-hidden', 'true');
  activityFrame.removeAttribute('src');
  activeLaunch = null;
  setWorldInteractionLocked(false);
}

function setWorldInteractionLocked(locked) {
  [document.querySelector('.world-chrome'), route, stagePanel].forEach((element) => {
    element.inert = locked;
  });
}

function completeLaunchedStage(launch, stars = 3) {
  const profile = getProfile(launch.profileId);
  const progress = getRouteProgress(launch.profileId);
  const completedStage = stages.find((stage) => stage.id === launch.stageId);
  if (!completedStage) {
    throw new Error(`Missing completed stage ${launch.stageId}`);
  }
  const previousStars = progress.progress[completedStage.id] || 0;
  progress.progress[completedStage.id] = Math.max(previousStars, stars);
  const isCurrentStage = completedStage.id === progress.currentStage;
  const nextStage = isCurrentStage
    ? stages.find((stage) => stage.id === completedStage.id + 1 && stage.available)
    : null;
  const worldComplete = previousStars === 0
    && isCurrentStage
    && completedStage.id === lastAvailableStageId
    && !nextStage;

  if (!nextStage) {
    saveWorldProgress();
    if (launch.profileId === activeProfileId) {
      updateStarTotal(progress);
      renderRoute();
      selectStage(completedStage);
    }
    return { worldComplete };
  }

  progress.currentStage = nextStage.id;
  saveWorldProgress();
  if (launch.profileId !== activeProfileId) {
    return { worldComplete: false };
  }
  updateStarTotal(progress);
  renderRoute();

  travellerImage.src = getCharacterAsset(profile.character, 'walk');
  positionTraveller(nextStage);
  traveller.setAttribute('aria-label', `${profile.name} בשלב ${progress.currentStage}`);

  window.setTimeout(() => {
    travellerImage.src = getCharacterAsset(profile.character, 'idle');
    selectStage(nextStage);
  }, 760);
  return { worldComplete: false };
}

function showWorldComplete(profile, progress) {
  worldCompleteCharacter.src = getCharacterAsset(profile.character, 'celebrate');
  document.getElementById('world-complete-stage-copy').textContent = `סיימתם את כל ${availableStages.length} שלבי המסלול.`;
  document.getElementById('world-complete-score').textContent = `${getEarnedStarTotal(progress)} / ${availableStarTotal}`;
  setWorldInteractionLocked(true);
  worldCompleteOverlay.inert = false;
  worldCompleteOverlay.classList.add('is-visible');
  worldCompleteOverlay.setAttribute('aria-hidden', 'false');
  worldCompleteButton.focus();
}

function closeWorldComplete() {
  worldCompleteOverlay.classList.remove('is-visible');
  worldCompleteOverlay.setAttribute('aria-hidden', 'true');
  worldCompleteOverlay.inert = true;
  setWorldInteractionLocked(false);
  document.querySelector(`[data-stage="${selectedStage.id}"]`).focus();
}

function handleActivityMessage(event) {
  if (!activeLaunch || event.origin !== window.location.origin || event.source !== activityFrame.contentWindow) {
    return;
  }

  const message = event.data;
  const matchesLaunch = message.version === ACTIVITY_MESSAGE_VERSION
    && message.stageId === activeLaunch.stageId
    && message.activityId === activeLaunch.activityId
    && message.levelId === activeLaunch.levelId
    && message.profileId === activeLaunch.profileId;
  if (!matchesLaunch) {
    throw new Error('Activity result does not match the active world-map stage');
  }

  if (message.type === 'bubbles.activity.exit') {
    const exitedStage = stages.find((stage) => stage.id === activeLaunch.stageId);
    if (!exitedStage) {
      throw new Error(`Missing exited stage ${activeLaunch.stageId}`);
    }
    closeActivity();
    selectStage(exitedStage);
    return;
  }

  if (message.type !== 'bubbles.activity.complete' || !Number.isInteger(message.stars) || message.stars < 1 || message.stars > 3) {
    throw new Error('Invalid activity result');
  }

  const completedLaunch = activeLaunch;
  closeActivity();
  const result = completeLaunchedStage(completedLaunch, message.stars);
  if (result.worldComplete) {
    showWorldComplete(getProfile(completedLaunch.profileId), getRouteProgress(completedLaunch.profileId));
    return;
  }

  launchCharacter.src = getCharacterAsset(completedLaunch.profileCharacter, 'celebrate');
  document.getElementById('launch-title').textContent = 'כל הכבוד!';
  launchOverlay.classList.add('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'false');
  window.setTimeout(() => {
    launchOverlay.classList.remove('is-visible');
    launchOverlay.setAttribute('aria-hidden', 'true');
  }, 1250);
}

function getEarnedStarTotal(progress) {
  return Object.values(progress.progress).reduce((total, stars) => total + stars, 0);
}

function updateStarTotal(progress) {
  const earnedStars = getEarnedStarTotal(progress);
  document.getElementById('star-total').textContent = String(earnedStars);
  document.getElementById('star-total-max').textContent = `/${availableStarTotal}`;
  document.querySelector('.star-total').setAttribute('aria-label', `${earnedStars} מתוך ${availableStarTotal} כוכבים`);
}

profileButton.addEventListener('click', toggleProfileMenu);
editProfileButton.addEventListener('click', () => openProfileEditor(activeProfileId));
chooseProfileButton.addEventListener('click', openGate);
addProfileButton.addEventListener('click', () => openProfileEditor(null));
profileForm.addEventListener('submit', saveProfileFromEditor);
editorClose.addEventListener('click', closeProfileEditor);
deleteProfileButton.addEventListener('click', deleteEditedProfile);
cancelDeleteButton.addEventListener('click', () => {
  deleteConfirm.hidden = true;
  deleteProfileButton.focus();
});
confirmDeleteButton.addEventListener('click', confirmProfileDeletion);
trackStageSelect.addEventListener('change', () => {
  updateTrackResetCopy();
  trackResetConfirm.hidden = true;
  updateTrackResetAvailability();
  profileForm.classList.remove('is-confirming-track-reset');
  trackResetStatus.textContent = '';
});
trackResetButton.addEventListener('click', requestTrackReset);
cancelTrackResetButton.addEventListener('click', () => {
  trackResetConfirm.hidden = true;
  updateTrackResetAvailability();
  profileForm.classList.remove('is-confirming-track-reset');
  trackResetButton.focus();
});
confirmTrackResetButton.addEventListener('click', resetEditedProfileTrack);
profileNameInput.addEventListener('input', () => profileNameInput.setCustomValidity(''));
panelClose.addEventListener('click', () => stagePanel.classList.remove('is-open'));
playButton.addEventListener('click', launchSelectedStage);
activityFrame.addEventListener('load', revealLoadedActivity);
worldCompleteButton.addEventListener('click', closeWorldComplete);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (worldCompleteOverlay.classList.contains('is-visible')) {
      closeWorldComplete();
      return;
    }
    if (!profileEditor.hidden) {
      closeProfileEditor();
      return;
    }
    if (activeLaunch) {
      closeActivity();
      return;
    }
    closeProfileMenu();
    stagePanel.classList.remove('is-open');
  }
});

window.addEventListener('message', handleActivityMessage);
let labelLayoutFrame = 0;
window.addEventListener('resize', () => {
  cancelAnimationFrame(labelLayoutFrame);
  labelLayoutFrame = requestAnimationFrame(() => {
    renderChapterLabels();
    const currentStage = stages.find((stage) => stage.id === routeProgress[activeProfileId].currentStage);
    if (currentStage) centerStageInMap(currentStage);
  });
});
setProfile(activeProfileId);
openGate();
