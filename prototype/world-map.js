const stages = [
  { id: 1, x: 8, y: 90, game: 'memory', title: 'חיות ראשונות', description: 'מוצאים זוגות של מילים וחיות' },
  { id: 2, x: 15, y: 82, game: 'shop', title: 'הקנייה הראשונה', description: 'מקשיבים ומגישים פריט לקונה' },
  { id: 3, x: 22, y: 70, game: 'house', activity: 'magic-house', level: 'bedroom-1', title: 'חדר השינה הקסום', description: 'מסדרים את החדר לפי משפטים באנגלית ובעברית' },
  { id: 4, x: 18, y: 57, game: 'memory', title: 'פירות צבעוניים', description: 'מוצאים זוגות של מילים ופירות' },
  { id: 5, x: 29, y: 47, game: 'shop', title: 'החנות מתמלאת', description: 'מקשיבים להזמנה ובוחרים מהמדף' },
  { id: 6, x: 40, y: 45, game: 'bubbles', title: 'שומעים ותופסים', description: 'מוצאים את המילה בין הבועות' },
  { id: 7, x: 50, y: 51, game: 'memory', title: 'טבע ושמיים', description: 'מחברים מילים מהעולם שסביבנו' },
  { id: 8, x: 59, y: 60, game: 'shop', title: 'אחת שתיים שלוש', description: 'ממלאים הזמנות עם כמויות' },
  { id: 9, x: 68, y: 67, game: 'bubbles', title: 'שומעים וכותבים', description: 'שומעים מילה ומוצאים איך כותבים אותה' },
  { id: 10, x: 77, y: 72, game: 'memory', title: 'דברים בבית', description: 'מגלים מילים שמכירים מהבית' },
  { id: 11, x: 86, y: 66, game: 'shop', title: 'צבעים בחנות', description: 'מקשיבים לצבע ובוחרים נכון' },
  { id: 12, x: 89, y: 54, game: 'bubbles', title: 'מבול מילים', description: 'תופסים רצף של מילים נכונות' },
  { id: 13, x: 84, y: 43, game: 'memory', title: 'נוסעים רחוק', description: 'מחברים מילים של כלי תחבורה' },
  { id: 14, x: 78, y: 35, game: 'shop', title: 'הזמנה כפולה', description: 'זוכרים שני פריטים בהזמנה אחת' },
  { id: 15, x: 87, y: 28, game: 'bubbles', symbol: '★', title: 'מסיבת המילים', description: 'משימת הסיום של עולם הבועות' },
];

const profiles = {
  lotem: {
    name: 'לוטם',
    avatar: '🌸',
    language: 'לומדת אנגלית',
    shortLanguage: 'אנגלית',
    currentStage: 3,
    progress: { 1: 3, 2: 3 },
    character: '../src/assets/characters/princess/princess_idle_1.webp',
    walkingCharacter: '../src/assets/characters/princess/princess_walk_1.webp',
    celebratingCharacter: '../src/assets/characters/princess/princess_celebrate_1.webp',
  },
  tom: {
    name: 'תום',
    avatar: '🫧',
    language: 'לומד עברית',
    shortLanguage: 'עברית',
    currentStage: 2,
    progress: { 1: 3 },
    character: '../src/assets/characters/dinosaur/dinosaur_idle_1.webp',
    walkingCharacter: '../src/assets/characters/dinosaur/dinosaur_walk_1.webp',
    celebratingCharacter: '../src/assets/characters/dinosaur/dinosaur_celebrate_1.webp',
  },
};

const gameLabels = {
  memory: 'גן מילים',
  shop: 'החנות הקטנה',
  bubbles: 'בועות מילים',
  house: 'הבית הקסום',
};

const WORLD_PROGRESS_STORAGE_KEY = 'bubble_world_map_progress_v1';
const WORLD_ACTIVE_PROFILE_STORAGE_KEY = 'bubble_world_map_profile_v1';
const ACTIVITY_MESSAGE_VERSION = 1;

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
const settingsButton = document.getElementById('settings-button');
const settingsPopover = document.getElementById('settings-popover');
const soundButton = document.getElementById('sound-button');
const launchOverlay = document.getElementById('launch-overlay');
const launchCharacter = document.getElementById('launch-character');
const traveller = document.getElementById('traveller');
const travellerImage = document.getElementById('traveller-image');
const activityOverlay = document.getElementById('activity-overlay');
const activityFrame = document.getElementById('activity-frame');

loadWorldProgress();
let activeProfileId = localStorage.getItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY) || 'lotem';
let selectedStage = stages.find((stage) => stage.id === profiles[activeProfileId].currentStage);
let soundEnabled = true;
let activeLaunch = null;

function loadWorldProgress() {
  const saved = localStorage.getItem(WORLD_PROGRESS_STORAGE_KEY);
  if (!saved) {
    return;
  }

  const storedProfiles = JSON.parse(saved);
  Object.keys(profiles).forEach((profileId) => {
    const stored = storedProfiles[profileId];
    profiles[profileId].currentStage = stored.currentStage;
    profiles[profileId].progress = stored.progress;
  });
}

function saveWorldProgress() {
  const storedProfiles = Object.fromEntries(Object.entries(profiles).map(([profileId, profile]) => [profileId, {
    currentStage: profile.currentStage,
    progress: profile.progress,
  }]));
  localStorage.setItem(WORLD_PROGRESS_STORAGE_KEY, JSON.stringify(storedProfiles));
}

function renderRoute() {
  route.innerHTML = '';

  stages.forEach((stage) => {
    const profile = profiles[activeProfileId];
    const stars = profile.progress[stage.id] || 0;
    const state = stars > 0 ? 'complete' : stage.id === profile.currentStage ? 'current' : 'locked';
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
      const stars = document.createElement('span');
      stars.className = 'stage-stars';
      stars.setAttribute('aria-hidden', 'true');
      stars.textContent = '★'.repeat(profile.progress[stage.id]);
      button.append(stars);
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

function selectStage(stage) {
  selectedStage = stage;
  const profile = profiles[activeProfileId];
  const stars = profile.progress[stage.id] || 0;
  renderActivityIcon(panelIcon, stage);
  panelKicker.textContent = `${gameLabels[stage.game]} · שלב ${stage.id} · ${profile.shortLanguage}`;
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
  const profile = profiles[profileId];
  document.getElementById('profile-avatar').textContent = profile.avatar;
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-language').textContent = profile.language;
  document.getElementById('journey-label').textContent = `המסע של ${profile.name}`;
  updateStarTotal(profile);
  travellerImage.src = profile.character;
  traveller.setAttribute('aria-label', `${profile.name} נמצא/ת בשלב ${profile.currentStage}`);

  const stage = stages.find((candidate) => candidate.id === profile.currentStage);
  traveller.style.left = `${stage.x + 1}%`;
  traveller.style.top = `${stage.y - 8}%`;
  renderRoute();
  selectStage(stage);
  profileMenu.hidden = true;
  profileButton.setAttribute('aria-expanded', 'false');
}

function toggleProfileMenu() {
  const willOpen = profileMenu.hidden;
  profileMenu.hidden = !willOpen;
  profileButton.setAttribute('aria-expanded', String(willOpen));
  settingsPopover.hidden = true;
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundButton.querySelector('.sound-symbol').classList.toggle('is-muted', !soundEnabled);
  soundButton.setAttribute('aria-label', soundEnabled ? 'השתקת צלילים' : 'הפעלת צלילים');
}

function launchSelectedStage() {
  if (!selectedStage) {
    return;
  }

  const profile = profiles[activeProfileId];
  launchCharacter.src = profile.celebratingCharacter;
  document.getElementById('launch-title').textContent = selectedStage.title;
  launchOverlay.classList.add('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'false');

  if (selectedStage.activity === 'magic-house') {
    window.setTimeout(() => openMagicHouse(selectedStage), 650);
    return;
  }

  window.setTimeout(() => {
    document.getElementById('launch-title').textContent = 'כל הכבוד!';
  }, 520);

  window.setTimeout(() => {
    launchOverlay.classList.remove('is-visible');
    launchOverlay.setAttribute('aria-hidden', 'true');
    completeSelectedStage();
  }, 1250);
}

function openMagicHouse(stage) {
  activeLaunch = {
    stageId: stage.id,
    activityId: stage.activity,
    levelId: stage.level,
    profileId: activeProfileId,
  };
  const params = new URLSearchParams({
    host: 'world-map',
    activity: stage.activity,
    level: stage.level,
    stage: String(stage.id),
    profile: activeProfileId,
  });
  activityFrame.src = `./magic-house.html?${params}`;
  activityOverlay.classList.add('is-visible');
  activityOverlay.setAttribute('aria-hidden', 'false');
  launchOverlay.classList.remove('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'true');
}

function closeActivity() {
  activityOverlay.classList.remove('is-visible');
  activityOverlay.setAttribute('aria-hidden', 'true');
  activityFrame.removeAttribute('src');
  activeLaunch = null;
}

function completeSelectedStage(stars = 3) {
  const profile = profiles[activeProfileId];
  if (selectedStage.id !== profile.currentStage) {
    selectStage(selectedStage);
    return;
  }

  profile.progress[selectedStage.id] = stars;
  profile.currentStage = Math.min(selectedStage.id + 1, stages.length);
  saveWorldProgress();
  const nextStage = stages.find((stage) => stage.id === profile.currentStage);
  updateStarTotal(profile);
  renderRoute();

  travellerImage.src = profile.walkingCharacter;
  traveller.style.left = `${nextStage.x + 1}%`;
  traveller.style.top = `${nextStage.y - 8}%`;
  traveller.setAttribute('aria-label', `${profile.name} נמצא/ת בשלב ${profile.currentStage}`);

  window.setTimeout(() => {
    travellerImage.src = profile.character;
    selectStage(nextStage);
  }, 760);
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
    closeActivity();
    selectStage(selectedStage);
    return;
  }

  if (message.type !== 'bubbles.activity.complete' || !Number.isInteger(message.stars) || message.stars < 1 || message.stars > 3) {
    throw new Error('Invalid activity result');
  }

  closeActivity();
  launchCharacter.src = profiles[activeProfileId].celebratingCharacter;
  document.getElementById('launch-title').textContent = 'כל הכבוד!';
  launchOverlay.classList.add('is-visible');
  launchOverlay.setAttribute('aria-hidden', 'false');
  completeSelectedStage(message.stars);
  window.setTimeout(() => {
    launchOverlay.classList.remove('is-visible');
    launchOverlay.setAttribute('aria-hidden', 'true');
  }, 1250);
}

function updateStarTotal(profile) {
  const earnedStars = Object.values(profile.progress).reduce((total, stars) => total + stars, 0);
  document.getElementById('star-total').textContent = String(earnedStars);
  document.querySelector('.star-total').setAttribute('aria-label', `${earnedStars} מתוך 45 כוכבים`);
}

profileButton.addEventListener('click', toggleProfileMenu);
panelClose.addEventListener('click', () => stagePanel.classList.remove('is-open'));
playButton.addEventListener('click', launchSelectedStage);
soundButton.addEventListener('click', toggleSound);
settingsButton.addEventListener('click', () => {
  settingsPopover.hidden = !settingsPopover.hidden;
  profileMenu.hidden = true;
  profileButton.setAttribute('aria-expanded', 'false');
});

document.querySelectorAll('[data-profile]').forEach((button) => {
  button.addEventListener('click', () => setProfile(button.dataset.profile));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (activeLaunch) {
      closeActivity();
      return;
    }
    profileMenu.hidden = true;
    settingsPopover.hidden = true;
    stagePanel.classList.remove('is-open');
  }
});

window.addEventListener('message', handleActivityMessage);
setProfile(activeProfileId);
