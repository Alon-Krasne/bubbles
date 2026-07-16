const stages = [
  { id: 1, x: 8, y: 90, game: 'memory', available: true, activity: 'memory-garden', level: 'level-1', entry: '../index.html', title: 'חיות ראשונות', description: 'מוצאים זוגות של מילים וחיות' },
  { id: 2, x: 15, y: 82, game: 'shop', available: true, activity: 'listening-shop', level: 'shop-level-1', entry: '../index.html', title: 'הקנייה הראשונה', description: 'מקשיבים ומגישים פריט לקונה' },
  { id: 3, x: 22, y: 70, game: 'house', available: true, activity: 'magic-house', level: 'bedroom-1', entry: './magic-house.html', title: 'חדר השינה הקסום', description: 'מסדרים את החדר לפי משפטים באנגלית ובעברית' },
  { id: 4, x: 18, y: 57, game: 'memory', available: true, activity: 'memory-garden', level: 'level-2', entry: '../index.html', title: 'פירות צבעוניים', description: 'מוצאים זוגות של מילים ופירות' },
  { id: 5, x: 29, y: 47, game: 'shop', available: true, activity: 'listening-shop', level: 'shop-level-2', entry: '../index.html', title: 'החנות מתמלאת', description: 'מקשיבים להזמנה ובוחרים מהמדף' },
  { id: 6, x: 40, y: 45, game: 'memory', available: true, activity: 'memory-garden', level: 'level-3', entry: '../index.html', title: 'טבע ושמיים', description: 'מוצאים שמונה זוגות של מילים מהטבע' },
  { id: 7, x: 50, y: 51, game: 'memory', available: false, title: 'טבע ושמיים', description: 'מחברים מילים מהעולם שסביבנו' },
  { id: 8, x: 59, y: 60, game: 'shop', available: false, title: 'אחת שתיים שלוש', description: 'ממלאים הזמנות עם כמויות' },
  { id: 9, x: 68, y: 67, game: 'bubbles', available: false, title: 'שומעים וכותבים', description: 'שומעים מילה ומוצאים איך כותבים אותה' },
  { id: 10, x: 77, y: 72, game: 'memory', available: false, title: 'דברים בבית', description: 'מגלים מילים שמכירים מהבית' },
  { id: 11, x: 86, y: 66, game: 'shop', available: false, title: 'צבעים בחנות', description: 'מקשיבים לצבע ובוחרים נכון' },
  { id: 12, x: 89, y: 54, game: 'bubbles', available: false, title: 'מבול מילים', description: 'תופסים רצף של מילים נכונות' },
  { id: 13, x: 84, y: 43, game: 'memory', available: false, title: 'נוסעים רחוק', description: 'מחברים מילים של כלי תחבורה' },
  { id: 14, x: 78, y: 35, game: 'shop', available: false, title: 'הזמנה כפולה', description: 'זוכרים שני פריטים בהזמנה אחת' },
  { id: 15, x: 87, y: 28, game: 'bubbles', available: false, symbol: '★', title: 'מסיבת המילים', description: 'משימת הסיום של עולם הבועות' },
];

const availableStages = stages.filter((stage) => stage.available);
const availableStarTotal = availableStages.length * 3;
const lastAvailableStageId = availableStages[availableStages.length - 1].id;

const DEFAULT_PROFILES = [
  { id: 'lotem', name: 'לוטם', character: 'princess', learningLanguage: 'en' },
  { id: 'tom', name: 'תום', character: 'dinosaur', learningLanguage: 'he' },
];

const DEFAULT_ROUTE_PROGRESS = {
  lotem: { currentStage: 3, progress: { 1: 3, 2: 3 } },
  tom: { currentStage: 2, progress: { 1: 3 } },
};

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

const gameLabels = {
  memory: 'גן מילים',
  shop: 'החנות הקטנה',
  bubbles: 'בועות מילים',
  house: 'הבית הקסום',
};

const WORLD_PROFILES_STORAGE_KEY = 'bubble_world_map_profiles_v1';
const WORLD_PROGRESS_STORAGE_KEY = 'bubble_world_map_progress_v1';
const WORLD_ACTIVE_PROFILE_STORAGE_KEY = 'bubble_world_map_profile_v1';
const ACTIVITY_MESSAGE_VERSION = 1;
const PROFILE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

const world = document.getElementById('world');
const route = document.getElementById('route');
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
const lockedRouteMist = document.getElementById('locked-route-mist');
const lockedRouteDashes = document.getElementById('locked-route-dashes');
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

let profiles = loadProfiles();
let routeProgress = loadWorldProgress();
let activeProfileId = loadActiveProfileId();
validateWorldState();
upgradeStageSixProgress();
let selectedStage = stages.find((stage) => stage.id === getRouteProgress(activeProfileId).currentStage);
let editingProfileId = null;
let editorReturnsToGate = true;
let activeLaunch = null;
let launchTimer = null;

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

function upgradeStageSixProgress() {
  let changed = false;

  profiles.forEach((profile) => {
    const progress = getRouteProgress(profile.id);
    if (progress.currentStage === 5 && progress.progress[5] > 0) {
      progress.currentStage = 6;
      changed = true;
    }
  });

  if (changed) {
    saveWorldProgress();
  }
}

function loadProfiles() {
  const saved = localStorage.getItem(WORLD_PROFILES_STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const initialProfiles = structuredClone(DEFAULT_PROFILES);
  localStorage.setItem(WORLD_PROFILES_STORAGE_KEY, JSON.stringify(initialProfiles));
  return initialProfiles;
}

function saveProfiles() {
  localStorage.setItem(WORLD_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
}

function loadWorldProgress() {
  const saved = localStorage.getItem(WORLD_PROGRESS_STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }

  const initialProgress = structuredClone(DEFAULT_ROUTE_PROGRESS);
  localStorage.setItem(WORLD_PROGRESS_STORAGE_KEY, JSON.stringify(initialProgress));
  return initialProgress;
}

function saveWorldProgress() {
  localStorage.setItem(WORLD_PROGRESS_STORAGE_KEY, JSON.stringify(routeProgress));
}

function loadActiveProfileId() {
  const saved = localStorage.getItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY);
  if (saved) {
    return saved;
  }

  localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, DEFAULT_PROFILES[0].id);
  return DEFAULT_PROFILES[0].id;
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
  renderLockedRoute();
  const progress = getRouteProgress();

  stages.forEach((stage) => {
    const stars = progress.progress[stage.id] || 0;
    const state = !stage.available
      ? 'locked'
      : stars > 0
        ? 'complete'
        : stage.id === progress.currentStage
          ? 'current'
          : 'locked';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `world-stage is-${state}`;
    button.classList.toggle('is-selected', selectedStage?.id === stage.id);
    button.dataset.stage = String(stage.id);
    button.dataset.game = stage.game;
    button.style.left = `${stage.x}%`;
    button.style.top = `${stage.y}%`;
    button.disabled = state === 'locked';
    button.setAttribute('aria-label', state === 'locked'
      ? `שלב ${stage.id}, ${stage.title}, נעול`
      : `שלב ${stage.id}, ${stage.title}, ${stars} כוכבים`);

    const icon = document.createElement('span');
    icon.className = 'stage-icon';
    icon.setAttribute('aria-hidden', 'true');
    renderActivityIcon(icon, stage);

    const number = document.createElement('span');
    number.className = 'stage-number';
    number.textContent = String(stage.id);
    button.append(icon, number);

    if (stars > 0) {
      const starLabel = document.createElement('span');
      starLabel.className = 'stage-stars';
      starLabel.setAttribute('aria-hidden', 'true');
      starLabel.textContent = '★'.repeat(stars);
      button.append(starLabel);
    }

    if (state === 'locked') {
      const lock = document.createElement('span');
      lock.className = 'stage-lock';
      lock.setAttribute('aria-hidden', 'true');
      lock.textContent = '🔒';
      button.append(lock);
    } else {
      button.addEventListener('click', () => selectStage(stage));
    }

    route.append(button);
  });
}

function renderLockedRoute() {
  const firstLockedStage = stages.find((stage) => !stage.available);
  const previousStage = stages.find((stage) => stage.id === firstLockedStage.id - 1);
  const lockedPoints = [previousStage, ...stages.filter((stage) => !stage.available)];
  const path = lockedPoints.reduce((result, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    if (index === lockedPoints.length - 1) {
      return `${result} L ${point.x} ${point.y}`;
    }
    const next = lockedPoints[index + 1];
    const midpointX = (point.x + next.x) / 2;
    const midpointY = (point.y + next.y) / 2;
    return `${result} Q ${point.x} ${point.y} ${midpointX} ${midpointY}`;
  }, '');
  lockedRouteMist.setAttribute('d', path);
  lockedRouteDashes.setAttribute('d', path);
}

function selectStage(stage) {
  selectedStage = stage;
  const profile = getProfile();
  const progress = getRouteProgress();
  const stars = progress.progress[stage.id] || 0;
  renderActivityIcon(panelIcon, stage);
  panelKicker.textContent = `${gameLabels[stage.game]} · שלב ${stage.id} · ${languageOptions[profile.learningLanguage].label}`;
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
  traveller.style.left = `${stage.x + 1}%`;
  traveller.style.top = `${stage.y - 8}%`;
  selectedStage = stage;
  renderRoute();
  selectStage(stage);
  renderProfileMenu();
  closeProfileMenu();
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
  profileEditor.hidden = false;
  profileEditor.setAttribute('aria-hidden', 'false');
  profileNameInput.focus();
}

function closeProfileEditor() {
  deleteConfirm.hidden = true;
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
    routeProgress[profile.id] = { currentStage: 1, progress: {} };
    activeProfileId = profile.id;
    saveWorldProgress();
    saveProfiles();
    localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
  } else {
    const profile = getProfile(editingProfileId);
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
  deleteConfirm.hidden = false;
  cancelDeleteButton.focus();
}

function confirmProfileDeletion() {

  const deletedIndex = profiles.findIndex((profile) => profile.id === editingProfileId);
  const deletedId = profiles[deletedIndex].id;
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

  launchTimer = window.setTimeout(() => openActivity(launch, stage.entry), 650);
}

function openActivity(launch, entry) {
  launchTimer = null;
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
  activityFrame.src = `${entry}?${params}`;
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
  traveller.style.left = `${nextStage.x + 1}%`;
  traveller.style.top = `${nextStage.y - 8}%`;
  traveller.setAttribute('aria-label', `${profile.name} בשלב ${progress.currentStage}`);

  window.setTimeout(() => {
    travellerImage.src = getCharacterAsset(profile.character, 'idle');
    selectStage(nextStage);
  }, 760);
  return { worldComplete: false };
}

function showWorldComplete(profile, progress) {
  worldCompleteCharacter.src = getCharacterAsset(profile.character, 'celebrate');
  document.getElementById('world-complete-stage-copy').textContent = `סיימתם את כל ${availableStages.length} השלבים שפתוחים עכשיו.`;
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
profileNameInput.addEventListener('input', () => profileNameInput.setCustomValidity(''));
panelClose.addEventListener('click', () => stagePanel.classList.remove('is-open'));
playButton.addEventListener('click', launchSelectedStage);
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
setProfile(activeProfileId);
openGate();
