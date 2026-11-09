import { openGallery } from './gallery.js';
import { getGalleryKey } from './shared/gallery.mjs';
import { FOREST_CAPTIONS } from './shared/forest-captions.mjs';
import { REEF_CAPTIONS } from './shared/reef-captions.mjs';
import { REEF_CHAPTERS, REEF_STORIES } from './shared/reef-map.mjs';
import { LEGACY_TRAIL_STAGES, REEF_JOURNEY_STAGES, TRAIL_CHAPTERS, TRAIL_STAGES } from './shared/trail-catalog.mjs';
import { createJourneyOrder, applyJourneyOrder } from './shared/journey-order.mjs';
import {
  TRAIL_CONTENT_VERSION,
  createTrackProgress,
  isStageUnlocked,
  normalizeTrackProgress,
} from './shared/track-progress.mjs';
import { getTravellerPosition } from './shared/traveller-position.mjs';
import { completeReefStage, markReefStorySeen, openReefRoute, pendingReefStory, readReefRoute, setReefNextStage } from './shared/reef-progress.mjs';
import { formatStarRating } from './shared/activity-scoring.mjs';
import { saveStorage } from './shared/saves.mjs';
import {
  DESTINATIONS,
  FOREST_CHARACTERS,
  FOREST_MILESTONES,
  getRouteKey,
  createForestProgress,
  getActiveDestination,
  setActiveDestination,
  getForestVideoMedia,
  markVideoSeen,
  unlockForestMilestone,
} from './shared/destinations.mjs';

let stages = TRAIL_STAGES;
let screenStages = stages;
let mapWorld = 'wonder';
let reefProgress = null;
const FIRST_REGION_LENGTH = TRAIL_STAGES.length;
const FOREST_FINALE = FOREST_MILESTONES.at(-1);
const REEF_BRIDGE_ID = REEF_STORIES[0].id;
const MAP_WORLD_TITLES = { wonder: DESTINATIONS.wonder.title, forest: DESTINATIONS.forest.title, reef: 'השונית הזוהרת' };
const JOURNEY_CHAPTERS = [...TRAIL_CHAPTERS, ...REEF_CHAPTERS.map(chapter => ({ ...chapter, subtitle: chapter.topic, symbol: '🐚' }))];
const REEF_MILESTONES = new Map(REEF_STORIES.map(story => [story.id, {
  ...story, videoId: story.id, triggerStage: FIRST_REGION_LENGTH + (story.after ?? 0),
}]));
const JOURNEY_MILESTONES = [...FOREST_MILESTONES, ...REEF_MILESTONES.values()];

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
const mapStage = document.querySelector('.map-stage');
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
const trackResetLegend = document.getElementById('track-reset-legend');
const trackWorldSelect = document.getElementById('track-world-select');
const trackStageSelect = document.getElementById('track-stage-select');
const trackResetButton = document.getElementById('track-reset-button');
const trackResetConfirm = document.getElementById('track-reset-confirm');
const trackResetCopy = document.getElementById('track-reset-copy');
const cancelTrackResetButton = document.getElementById('cancel-track-reset-button');
const confirmTrackResetButton = document.getElementById('confirm-track-reset-button');
const trackResetStatus = document.getElementById('track-reset-status');

const destinationsNavButton = document.getElementById('destinations-nav-button');
const destinationGate = document.getElementById('destination-gate');
const destinationProfilePill = document.getElementById('destination-profile-pill');
const destinationAvatar = document.getElementById('destination-avatar');
const destinationPlayerName = document.getElementById('destination-player-name');
const destinationCardWonder = document.getElementById('destination-card-wonder');
const destinationCardForest = document.getElementById('destination-card-forest');
const wonderStarsCount = document.getElementById('wonder-stars-count');
const wonderStageLabel = document.getElementById('wonder-stage-label');
const forestStarsCount = document.getElementById('forest-stars-count');
const forestStageLabel = document.getElementById('forest-stage-label');
const forestCharacterPicker = document.getElementById('forest-character-picker');
const forestPickerClose = document.getElementById('forest-picker-close');
const forestPickerBackdrop = document.getElementById('forest-picker-backdrop');
const forestFriendCards = [...document.querySelectorAll('.forest-friend-card')];
const forestFriendButton = document.getElementById('forest-friend-button');
const forestMilestoneDialog = document.getElementById('forest-milestone-dialog');
const forestMilestoneTitle = document.getElementById('forest-milestone-title');
const forestMilestoneDesc = document.getElementById('forest-milestone-desc');
const forestMilestonePlayBtn = document.getElementById('forest-milestone-play-btn');
const forestMilestoneVideo = document.getElementById('forest-milestone-video');
const forestMilestonePoster = document.getElementById('forest-milestone-poster');
const forestMilestoneError = document.getElementById('forest-milestone-error');
const forestMilestoneRetryBtn = document.getElementById('forest-milestone-retry-btn');
const forestCaptionLanguage = document.getElementById('forest-caption-language');
const forestStorySelect = document.getElementById('forest-story-select');
const forestStoriesButton = document.getElementById('forest-stories-button');
const forestCaptionTracks = Object.fromEntries(['he','en'].map(lang => [lang, forestMilestoneVideo.addTextTrack('subtitles', lang === 'he' ? 'עברית' : 'English', lang)]));

let activeDestination = getActiveDestination();
let visitingCompletedForest = false;
let destinationGateWasOpen = false;
let activeMilestoneVideoId = null;
let isPendingMilestonePresentation = false;
// The video that opened the dialog as a fresh unlock; switching stories and back keeps it pending.
let pendingMilestoneVideoId = null;

let profiles = loadProfiles();
let routeProgress = loadWorldProgress();
let forestProgress = loadForestProgress();
let activeProfileId = loadActiveProfileId();
validateWorldState();
upgradeCompletedFrontier();
let selectedStage = null;
let editingProfileId = null;
let editorReturnsToGate = true;
let editorJourneyWorld = null;
const editorEntryWorlds = new Map();
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
    applyJourneyOrder(TRAIL_STAGES, storedProgress.stageOrder);
    applyJourneyOrder(TRAIL_STAGES, forestProgress[profile.id].stageOrder);

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
    while (progress.progress[progress.currentStage] > 0 && progress.currentStage < FIRST_REGION_LENGTH) {
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
      const progress = { ...createTrackProgress(1, stages.length), stageOrder: createJourneyOrder(TRAIL_STAGES) };
      saveStorage.setItem(key, JSON.stringify({ ...progress, contentVersion: TRAIL_CONTENT_VERSION }));
      return [profile.id, progress];
    }
    const parsed = JSON.parse(saved);
    let progress = normalizeTrackProgress(parsed, {
      stageCount: stages.length,
      legacyStageCount: LEGACY_TRAIL_STAGES.length,
    });
    if (!progress.stageOrder) progress = { ...progress, stageOrder: createJourneyOrder(TRAIL_STAGES) };
    if (progress !== parsed) saveStorage.setItem(key, JSON.stringify(progress));
    return [profile.id, progress];
  }));
}

function loadForestProgress() {
  return Object.fromEntries(profiles.map(profile => {
    const key = getRouteKey(profile.id, 'forest', profile.learningLanguage);
    const saved = saveStorage.getItem(key);
    if (!saved) {
      const progress = createForestProgress();
      saveStorage.setItem(key, JSON.stringify(progress));
      return [profile.id, progress];
    }
    const parsed = JSON.parse(saved);
    if (parsed.stageOrder) return [profile.id, parsed];
    const progress = { ...parsed, stageOrder: createJourneyOrder(TRAIL_STAGES) };
    saveStorage.setItem(key, JSON.stringify(progress));
    return [profile.id, progress];
  }));
}

function saveForestProgress() {
  for (const profile of profiles) {
    const key = getRouteKey(profile.id, 'forest', profile.learningLanguage);
    if (forestProgress && forestProgress[profile.id]) {
      saveStorage.setItem(key, JSON.stringify({
        ...forestProgress[profile.id],
        contentVersion: TRAIL_CONTENT_VERSION,
      }));
    }
  }
}

function saveWorldProgress(destination = activeDestination) {
  if (destination === 'forest') {
    saveForestProgress();
    return;
  }
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

function getRouteProgress(profileId = activeProfileId, destination = activeDestination) {
  if (destination === 'forest') {
    const progress = forestProgress[profileId];
    if (!progress) {
      throw new Error(`Missing forest route progress for ${profileId}`);
    }
    return progress;
  }
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

function hasFinishedWorldHandoff(forest, reef) {
  return Boolean(reef?.seenVideos.includes(REEF_BRIDGE_ID))
    && forest.progress[FIRST_REGION_LENGTH] > 0
    && forest.seenVideos.includes(FOREST_FINALE.videoId);
}

function loadJourneyStages() {
  const progress = getRouteProgress();
  stages = applyJourneyOrder(TRAIL_STAGES, progress.stageOrder);
  reefProgress = activeDestination === 'forest' && progress.progress[FIRST_REGION_LENGTH] > 0
    ? openReefRoute(getProfile(), saveStorage)
    : null;
  mapWorld = !visitingCompletedForest && progress.character && hasFinishedWorldHandoff(progress, reefProgress)
    ? 'reef' : activeDestination;
  screenStages = mapWorld === 'reef' ? REEF_JOURNEY_STAGES : stages;
  world.dataset.mapWorld = mapWorld;
  const hash = mapWorld === 'reef' ? '#reef' : '';
  if (location.hash !== hash) history.replaceState(null, '', location.pathname + location.search + hash);
}

function getCurrentStage() {
  const progress = mapWorld === 'reef' ? reefProgress : getRouteProgress();
  return screenStages[progress.currentStage - 1];
}

function isReefStage(stage) {
  return stage.id > FIRST_REGION_LENGTH;
}

function stageStars(stage) {
  return (isReefStage(stage) ? reefProgress.progress[stage.id - FIRST_REGION_LENGTH] : getRouteProgress().progress[stage.id]) || 0;
}

function canPlayStage(stage) {
  if (isReefStage(stage)) {
    return mapWorld === 'reef' && isStageUnlocked(stage, FIRST_REGION_LENGTH + reefProgress.currentStage);
  }
  const progress = getRouteProgress();
  return mapWorld !== 'reef' && isStageUnlocked(stage, progress.currentStage);
}

function renderRoute() {
  route.innerHTML = '';
  renderTrail();
  const current = getCurrentStage();

  screenStages.forEach((stage) => {
    const stars = stageStars(stage);
    // A stage opens once the player has cleared every stage before it, so the
    // frontier is the current stage and everything past it stays locked.
    const unlocked = canPlayStage(stage);
    const state = !unlocked
      ? 'locked'
      : stars > 0
        ? 'complete'
        : stage.id === current.id
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
    const inside = rect.left >= bounds.left + 6 && rect.right <= bounds.right - 6
      && rect.top >= bounds.top + 6 && rect.bottom <= bounds.bottom - 6;
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
  JOURNEY_CHAPTERS.forEach((chapter, index) => {
    const chapterStages = screenStages.filter((stage) => stage.chapterIndex === index);
    if (chapterStages.length === 0) {
      return;
    }
    const positionsY = chapterStages.map(stage => stage.y);
    const rects = {
      centerX: chapterStages.reduce((total, stage) => total + stage.x, 0) / chapterStages.length,
      centerY: positionsY.reduce((total, y) => total + y, 0) / chapterStages.length,
      topY: Math.min(...positionsY),
      bottomY: Math.max(...positionsY),
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
  const fullPath = smoothTrailPath(screenStages);
  trailRouteShadow.setAttribute('d', fullPath);
  trailRouteBase.setAttribute('d', fullPath);
  trailRouteBaseCore.setAttribute('d', fullPath);
  trailRouteDust.setAttribute('d', fullPath);

  const travelledPoints = screenStages.slice(0, screenStages.indexOf(getCurrentStage()) + 1);
  const travelledPath = smoothTrailPath(travelledPoints);
  trailRouteGlow.setAttribute('d', travelledPath);
  trailRouteProgress.setAttribute('d', travelledPath);
  trailRouteSparkle.setAttribute('d', travelledPath);
}

function selectStage(stage) {
  selectedStage = stage;
  const profile = getProfile();
  const stars = stageStars(stage);
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

function setCompanionPortrait(container, characterId) {
  container.dataset.friend = characterId;
}

function updateWorldDestinationChrome() {
  const profile = getProfile();
  world.dataset.destination = activeDestination;
  forestStoriesButton.hidden = activeDestination !== 'forest';
  forestFriendButton.hidden = activeDestination !== 'forest';
  const titleEl = document.querySelector('.world-title strong');
  const journeyEl = document.getElementById('journey-label');
  if (titleEl) {
    titleEl.textContent = MAP_WORLD_TITLES[mapWorld];
  }
  if (journeyEl) {
    if (activeDestination === 'forest') {
      const friendId = forestProgress[profile.id]?.character;
      const friend = friendId ? FOREST_CHARACTERS[friendId] : null;
      journeyEl.textContent = friend
        ? `המסע של ${profile.name} · ${friend.name} ${friend.emoji}`
        : `המסע של ${profile.name}`;
    } else {
      journeyEl.textContent = `המסע של ${profile.name}`;
    }
  }
}

function setJourneyCharacter(image, profile, destination) {
  let portrait = image.parentElement.querySelector('.journey-portrait');
  if (!portrait) { portrait = document.createElement('span'); portrait.className = 'forest-portrait journey-portrait'; portrait.setAttribute('aria-hidden', 'true'); image.after(portrait); }
  const isForest = destination === 'forest';
  image.hidden = isForest; portrait.hidden = !isForest;
  if (isForest) setCompanionPortrait(portrait, forestProgress[profile.id].character);
  else if (destination === 'reef') image.src = `./assets/reef/${forestProgress[profile.id].character}.webp`;
  else image.src = getCharacterAsset(profile.character, 'celebrate');
}

function updateTravellerAsset(pose = 'idle') {
  const profile = getProfile();
  const reef = mapWorld === 'reef';
  traveller.classList.toggle('reef-portrait', reef);
  if (activeDestination === 'forest') {
    const friendId = forestProgress[profile.id].character;
    travellerImage.hidden = !reef;
    traveller.classList.toggle('forest-portrait', !reef);
    if (reef) travellerImage.src = `./assets/reef/${friendId}.webp`;
    else setCompanionPortrait(traveller, friendId);
  } else {
    travellerImage.hidden = false;
    traveller.classList.remove('forest-portrait');
    travellerImage.src = getCharacterAsset(profile.character, pose);
  }
}

function openDestinationGate() {
  closeProfileMenu();
  stagePanel.classList.remove('is-open');
  destinationGate.hidden = false;
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  profileGate.hidden = true;

  const profile = getProfile(activeProfileId);
  destinationPlayerName.textContent = profile.name;
  destinationAvatar.src = getCharacterAsset(profile.character, 'idle');

  // Update Wonder stats
  const wonderProg = getRouteProgress(profile.id, 'wonder');
  const wonderStars = Object.values(wonderProg.progress).reduce((total, stars) => total + stars, 0);
  wonderStarsCount.textContent = String(wonderStars);
  wonderStageLabel.textContent = `שלב ${wonderProg.currentStage}`;

  // Update Forest stats
  const forestProg = getRouteProgress(profile.id, 'forest');
  const reef = readReefRoute(profile, saveStorage);
  const reachedReef = hasFinishedWorldHandoff(forestProg, reef);
  forestStarsCount.textContent = String(getEarnedStarTotal(forestProg) + (reachedReef ? getEarnedStarTotal(reef) : 0));
  const forestStage = reachedReef ? FIRST_REGION_LENGTH + reef.currentStage : forestProg.currentStage;
  forestStageLabel.textContent = forestProg.character || forestStage > 1 ? `שלב ${forestStage}` : 'מסע חדש';
}

function closeDestinationGate() {
  destinationGate.hidden = true;
  world.inert = false;
  world.removeAttribute('aria-hidden');
  destinationsNavButton.focus();
}

function chooseDestination(destId, requestedWorld = null) {
  visitingCompletedForest = false;
  if (destId === 'forest') {
    const profile = getProfile(activeProfileId);
    visitingCompletedForest = requestedWorld === 'forest'
      && hasFinishedWorldHandoff(forestProgress[profile.id], readReefRoute(profile, saveStorage));
    if (!forestProgress[profile.id].character) {
      openDestinationGate();
      openForestCharacterPicker();
      return;
    }
  }

  activeDestination = destId;
  setActiveDestination(destId);
  closeDestinationGate();
  renderJourneyFrontier();
  if (destId === 'forest') showPendingJourneyStory();
}

function renderJourneyFrontier() {
  loadJourneyStages();
  updateWorldDestinationChrome();
  updateStarTotal();
  updateTravellerAsset();
  const stage = getCurrentStage();
  renderRoute();
  positionTraveller(stage);
  selectStage(stage);
  renderChapterLabels();
}

// 'onboarding' opens over the destination gate before the forest starts;
// 'switch' opens over the forest map to change the companion mid-journey.
let forestPickerMode = 'onboarding';

function openForestCharacterPicker(mode = 'onboarding') {
  forestPickerMode = mode;
  const currentFriend = mode === 'switch' ? forestProgress[activeProfileId].character : null;
  forestFriendCards.forEach((card) => {
    card.setAttribute('aria-pressed', String(card.dataset.character === currentFriend));
  });
  forestCharacterPicker.hidden = false;
  if (mode === 'switch') {
    world.inert = true;
    world.setAttribute('aria-hidden', 'true');
    forestFriendCards.find((card) => card.dataset.character === currentFriend).focus();
  } else {
    destinationGate.inert = true;
    forestFriendCards[0].focus();
  }
}

function closeForestCharacterPicker() {
  forestCharacterPicker.hidden = true;
  if (forestPickerMode === 'switch') {
    world.inert = false;
    world.removeAttribute('aria-hidden');
    profileButton.focus();
  } else {
    destinationGate.inert = false;
    destinationCardForest.focus();
  }
}

function chooseForestCompanion(characterId) {
  const mode = forestPickerMode;
  forestProgress[activeProfileId].character = characterId;
  saveForestProgress();
  closeForestCharacterPicker();
  if (mode === 'switch') {
    // Only the companion changes; stars, stage and story progress stay as they are.
    updateWorldDestinationChrome();
    updateTravellerAsset('idle');
  } else {
    if (visitingCompletedForest) chooseDestination('forest', 'forest');
    else chooseDestination('forest');
  }
}

function showForestMilestone(milestone, isPending = false) {
  const reefStory = REEF_MILESTONES.has(milestone.videoId);
  isPendingMilestonePresentation = isPending;
  if (isPending) pendingMilestoneVideoId = milestone.videoId;
  activeMilestoneVideoId = milestone.videoId;
  forestMilestoneDialog.setAttribute('aria-label', isPending ? 'סרטון מסע חדש נפתח' : 'סיפורי המסע');
  forestMilestoneTitle.textContent = milestone.title;
  if (isPending) {
    forestMilestoneDesc.textContent = milestone.triggerStage > 0
      ? `סיפור חדש נפתח לאחר סיום שלב ${milestone.triggerStage}!`
      : 'מוכנים לגלות מה קרה בתחילת המסע?';
  } else {
    forestMilestoneDesc.textContent = 'צפייה חוזרת בסיפור מהמסע. אפשר לבחור סיפור אחר למעלה.';
  }
  const media = reefStory ? milestone : getForestVideoMedia(milestone.videoId);
  forestMilestoneVideo.hidden = false;
  forestMilestoneVideo.poster = media.poster;
  forestMilestoneVideo.src = media.src;
  forestMilestoneVideo.load();
  if (forestMilestonePoster) {
    forestMilestonePoster.src = media.poster;
    forestMilestonePoster.hidden = true;
  }
  if (forestMilestoneError) {
    forestMilestoneError.hidden = true;
  }
  for (const [lang, track] of Object.entries(forestCaptionTracks)) {
    while (track.cues.length) track.removeCue(track.cues[0]);
    const captions = reefStory ? REEF_CAPTIONS : FOREST_CAPTIONS;
    for (const cue of captions[milestone.videoId]) track.addCue(new VTTCue(cue.start, cue.end, cue[lang]));
  }
  forestCaptionLanguage.value = getProfile().learningLanguage;
  updateForestCaptions();
  forestStorySelect.hidden = isPending && (reefStory || milestone.triggerStage === FIRST_REGION_LENGTH);
  forestStorySelect.replaceChildren(...getUnlockedJourneyMilestones().map((m, index) => {
    const option = document.createElement('option'); option.value = m.videoId; option.textContent = `${index + 1}. ${m.title}`; return option;
  }));
  forestStorySelect.value = milestone.videoId;
  forestMilestonePlayBtn.textContent = isPending ? 'דלגו והמשיכו למסע ←' : 'חזרה למפה ←';
  world.inert = true;
  forestMilestoneDialog.hidden = false;
  forestMilestoneDialog.querySelector('.forest-milestone-content').scrollTop = 0;
  forestMilestonePlayBtn.focus({ preventScroll: true });
}

function getUnlockedJourneyMilestones() {
  const unlocked = new Set(getRouteProgress().unlockedVideos);
  const savedReef = activeDestination === 'forest' ? readReefRoute(getProfile(), saveStorage) : null;
  if (savedReef?.seenVideos.includes(REEF_BRIDGE_ID)) {
    for (const id of savedReef.unlockedVideos) unlocked.add(id);
  }
  return JOURNEY_MILESTONES.filter(milestone => unlocked.has(milestone.videoId));
}

function showPendingJourneyStory() {
  const forest = getRouteProgress();
  // The finale belongs to the handoff, even if an earlier run earned it before a Forest reset.
  const forestStories = reefProgress ? [FOREST_FINALE] : FOREST_MILESTONES.slice(0, -1);
  const forestStory = forestStories.find(milestone =>
    forest.unlockedVideos.includes(milestone.videoId) && !forest.seenVideos.includes(milestone.videoId));
  const reefStory = reefProgress && !visitingCompletedForest && pendingReefStory(reefProgress);
  const milestone = forestStory || (reefStory && REEF_MILESTONES.get(reefStory.id));
  if (!milestone) return false;
  showForestMilestone(milestone, true);
  return true;
}

function acknowledgePendingMilestone() {
  if (!isPendingMilestonePresentation) return;
  const profile = getProfile();
  if (REEF_MILESTONES.has(activeMilestoneVideoId)) {
    reefProgress = markReefStorySeen(profile, activeMilestoneVideoId, saveStorage);
    return;
  }
  const forest = getRouteProgress();
  if (!forest.seenVideos.includes(activeMilestoneVideoId)) {
    markVideoSeen(profile.id, profile.learningLanguage, activeMilestoneVideoId, saveStorage);
    forest.seenVideos.push(activeMilestoneVideoId);
  }
}

function closeForestMilestone() {
  forestMilestoneVideo.pause();
  forestMilestoneVideo.removeAttribute('src');
  forestMilestoneVideo.load();
  const finishedVideoId = activeMilestoneVideoId;
  const wasPending = isPendingMilestonePresentation;
  acknowledgePendingMilestone();
  activeMilestoneVideoId = null;
  isPendingMilestonePresentation = false;
  pendingMilestoneVideoId = null;

  forestMilestoneDialog.hidden = true;
  world.inert = false;

  if (wasPending && reefProgress) {
    if (mapWorld === 'forest' && hasFinishedWorldHandoff(getRouteProgress(), reefProgress)) {
      renderJourneyFrontier();
    }
    if (finishedVideoId === REEF_STORIES.at(-1).id) {
      showWorldComplete(getProfile());
      return;
    }
    if (showPendingJourneyStory()) return;
  }

  (wasPending ? playButton : forestStoriesButton).focus({ preventScroll: true });
}

function updateForestCaptions() {
  // 'hidden' (not 'disabled') keeps each track's cue list alive across video.load(),
  // so re-showing a milestone can clear and repopulate cues without hitting null.
  for (const [lang, track] of Object.entries(forestCaptionTracks)) track.mode = forestCaptionLanguage.value === lang ? 'showing' : 'hidden';
}

function setProfile(profileId) {
  if (profileId !== activeProfileId) visitingCompletedForest = false;
  activeProfileId = profileId;
  localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, profileId);
  const profile = getProfile();
  document.getElementById('profile-avatar').src = getCharacterAsset(profile.character, 'idle');
  document.getElementById('profile-name').textContent = profile.name;
  document.getElementById('profile-language').textContent = languageOptions[profile.learningLanguage].label;
  renderJourneyFrontier();
  renderProfileMenu();
  closeProfileMenu();
}

function positionTraveller(stage) {
  const position = getTravellerPosition(stage);
  traveller.dataset.stage = String(stage.id);
  traveller.setAttribute('aria-label', `${getProfile().name} בשלב ${stage.id}`);
  traveller.style.left = `${position.x + (isReefStage(stage) ? 4 : 0)}%`;
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
  const left = (stage.x / 100) * mapStage.clientWidth - mapScroll.clientWidth / 2;
  const top = (stage.y / 100) * mapStage.clientHeight - mapScroll.clientHeight / 2;
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
    button.addEventListener('click', () => enterTrail(profile.id));
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
    chooseButton.dataset.profile = profile.id;
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
  destinationGate.hidden = true;
  world.inert = true;
  world.setAttribute('aria-hidden', 'true');
  renderGateProfiles();
}

function getEditorEntryWorld(profileId) {
  const selection = editorEntryWorlds.get(profileId);
  if (!selection || (selection.world !== 'wonder' && selection.language !== getProfile(profileId).learningLanguage)) return null;
  return selection.world;
}

function enterTrail(profileId) {
  setProfile(profileId);
  profileGate.hidden = true;
  const requestedWorld = getEditorEntryWorld(profileId);
  editorEntryWorlds.delete(profileId);
  if (requestedWorld) {
    destinationGateWasOpen = false;
    chooseDestination(requestedWorld === 'reef' ? 'forest' : requestedWorld, requestedWorld);
    return;
  }
  if (destinationGateWasOpen) {
    destinationGateWasOpen = false;
    openDestinationGate();
    return;
  }
  chooseDestination(activeDestination, mapWorld);
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
  closeProfileMenu();
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
  editorJourneyWorld = editorReturnsToGate ? activeDestination : mapWorld;
  if (!isCreating) {
    const profile = getProfile(profileId);
    if (editorReturnsToGate) {
      const requestedWorld = getEditorEntryWorld(profileId);
      if (requestedWorld) editorJourneyWorld = requestedWorld;
      else if (activeDestination === 'forest' && hasFinishedWorldHandoff(forestProgress[profileId], readReefRoute(profile, saveStorage))) {
        editorJourneyWorld = 'reef';
      }
    }
    trackWorldSelect.value = editorJourneyWorld;
    renderTrackResetOptions();
  }
  profileEditor.hidden = false;
  profileEditor.setAttribute('aria-hidden', 'false');
  profileNameInput.focus();
}

function closeProfileEditor(resumeJourney = true) {
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
  } else if (resumeJourney) {
    chooseDestination(editorJourneyWorld === 'reef' ? 'forest' : editorJourneyWorld, editorJourneyWorld);
  }
}

function getEditedTrack() {
  const profile = getProfile(editingProfileId);
  const world = trackWorldSelect.value;
  if (world === 'reef') {
    const reef = readReefRoute(profile, saveStorage);
    return {
      profile, world, stages: REEF_JOURNEY_STAGES, offset: FIRST_REGION_LENGTH,
      progress: reef ?? createTrackProgress(1, REEF_JOURNEY_STAGES.length),
      needsHandoff: !hasFinishedWorldHandoff(forestProgress[profile.id], reef),
    };
  }
  const progress = getRouteProgress(profile.id, world);
  return { profile, world, stages: applyJourneyOrder(TRAIL_STAGES, progress.stageOrder), offset: 0, progress, needsHandoff: false };
}

function renderTrackResetOptions() {
  const { profile, world, stages, progress, offset } = getEditedTrack();
  const language = world === 'wonder' ? 'כל שפות הלימוד' : languageOptions[profile.learningLanguage].label;
  trackResetLegend.textContent = `התקדמות במסלול · ${language}`;
  const currentStage = progress.currentStage + offset;
  trackStageSelect.replaceChildren(...stages.map((stage) => {
    const option = document.createElement('option');
    option.value = String(stage.id);
    option.textContent = `שלב ${stage.id}: ${stage.title}${stage.id === currentStage ? ' (השלב הנוכחי)' : ''}`;
    return option;
  }));
  trackStageSelect.value = String(currentStage);
  syncTrackResetControls();
}

function getTrackResetSelection() {
  const track = getEditedTrack();
  const { stages, offset, progress } = track;
  const stageId = Number(trackStageSelect.value);
  const reset = createTrackProgress(stageId - offset, stages.length);
  const hasSameStars = stages.every((stage) => (
    (progress.progress[stage.id - offset] || 0) === (reset.progress[stage.id - offset] || 0)
  ));
  const switchesWorld = track.world !== editorJourneyWorld;
  const changesProgress = progress.currentStage !== reset.currentStage || (!switchesWorld && !hasSameStars);
  return { ...track, reset, stageId, changesProgress, switchesWorld };
}

function updateTrackResetAvailability() {
  const { changesProgress, needsHandoff, switchesWorld } = getTrackResetSelection();
  trackResetButton.disabled = !changesProgress && !needsHandoff && !switchesWorld;
}

function updateTrackResetCopy() {
  const { world, stageId, offset, reset, changesProgress, needsHandoff } = getTrackResetSelection();
  const title = MAP_WORLD_TITLES[world];
  const handoffCopy = needsHandoff ? ' היער יסומן כהושלם וקטעי המעבר יהיו זמינים לצפייה חוזרת.' : '';
  const resetsWorld = changesProgress && reset.currentStage === 1;
  confirmTrackResetButton.classList.toggle('is-destructive', resetsWorld);
  if (resetsWorld) {
    trackResetButton.textContent = 'איפוס להתחלה';
    confirmTrackResetButton.textContent = 'כן, מאפסים עכשיו';
    trackResetCopy.textContent = `הכוכבים בעולם ״${title}״ יימחקו והמסלול יתחיל משלב ${stageId}.${handoffCopy}`;
    return;
  }
  const advancesTrack = changesProgress || needsHandoff;
  trackResetButton.textContent = advancesTrack ? 'עדכון ההתקדמות' : 'מעבר לעולם';
  confirmTrackResetButton.textContent = advancesTrack ? 'כן, מעדכנים עכשיו' : 'כן, עוברים עכשיו';
  const starsCopy = changesProgress && reset.currentStage > 1
    ? ` שלבים ${offset + 1} עד ${stageId - 1} יקבלו 3 כוכבים. כוכבים משלב ${stageId} והלאה יימחקו.` : '';
  trackResetCopy.textContent = `השלב הבא בעולם ״${title}״ יהיה ${stageId}.${starsCopy}${handoffCopy}`;
}

function requestTrackReset() {
  updateTrackResetCopy();
  deleteConfirm.hidden = true;
  trackResetConfirm.hidden = false;
  trackResetButton.disabled = true;
  profileForm.classList.add('is-confirming-track-reset');
  confirmTrackResetButton.focus();
}

function prepareForestForReef(profile) {
  const previous = forestProgress[profile.id];
  const completed = createTrackProgress(FIRST_REGION_LENGTH, FIRST_REGION_LENGTH);
  const stories = FOREST_MILESTONES.map(milestone => milestone.videoId);
  forestProgress[profile.id] = {
    ...previous,
    currentStage: completed.currentStage,
    progress: { ...completed.progress, [FIRST_REGION_LENGTH]: 3, ...previous.progress },
    unlockedVideos: stories,
    seenVideos: stories,
  };
  saveStorage.setItem(getRouteKey(profile.id, 'forest', profile.learningLanguage), JSON.stringify(forestProgress[profile.id]));
}

function resetEditedProfileTrack() {
  const { profile, world, stageId, reset, progress, changesProgress, needsHandoff } = getTrackResetSelection();
  if (changesProgress) clearProfileRounds(profile.id, world, profile.learningLanguage);
  if (world === 'reef') {
    if (needsHandoff) prepareForestForReef(profile);
    if (changesProgress || needsHandoff) setReefNextStage(profile, changesProgress ? reset : progress, saveStorage);
  } else if (changesProgress) {
    const next = { ...progress, ...reset, contentVersion: TRAIL_CONTENT_VERSION };
    if (reset.currentStage === 1) next.stageOrder = createJourneyOrder(TRAIL_STAGES);
    if (world === 'forest') {
      const hadFinale = progress.progress[FIRST_REGION_LENGTH] > 0 || progress.unlockedVideos.includes(FOREST_FINALE.videoId);
      next.unlockedVideos = FOREST_MILESTONES
        .filter(m => m.triggerStage < stageId || (m === FOREST_FINALE && hadFinale)).map(m => m.videoId);
      next.seenVideos = progress.seenVideos
        .filter(id => next.unlockedVideos.includes(id) && (stageId !== 1 || id === FOREST_FINALE.videoId));
      forestProgress[profile.id] = next;
    } else {
      routeProgress[profile.id] = next;
    }
    saveStorage.setItem(getRouteKey(profile.id, world, profile.learningLanguage), JSON.stringify(next));
  }
  if (editorReturnsToGate) editorEntryWorlds.set(profile.id, { world, language: profile.learningLanguage });
  editorJourneyWorld = world;
  trackResetConfirm.hidden = true;
  profileForm.classList.remove('is-confirming-track-reset');
  renderTrackResetOptions();
  trackResetStatus.textContent = changesProgress || needsHandoff
    ? `ההתקדמות בעולם ״${MAP_WORLD_TITLES[world]}״ נשמרה מיד. אין צורך ללחוץ על שמירה.`
    : `המסע ימשיך בעולם ״${MAP_WORLD_TITLES[world]}״.`;
  trackStageSelect.focus();
}

function clearProfileRounds(profileId, destination = null, language = null) {
  const destinations = destination === null ? ['wonder', 'forest', 'reef'] : [destination];
  const languages = language === null ? Object.keys(languageOptions) : [language];
  const localKeys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
  const houseHistoryPrefix = `magic-house-previous-requests-v1:${profileId}:`;
  for (const key of localKeys) {
    const isActivityDeck = destinations.some(place => languages.some(lang => (
      key === `shop-decks-${place}-${lang}-${profileId}`
      || key.startsWith(`painter-deck-${profileId}-${place}-${lang}-`)
      || key.startsWith(`reveal-deck-${profileId}-${place}-${lang}-`)
      || (place === 'reef' && key.startsWith(`${houseHistoryPrefix}reef-house-`) && key.endsWith(`:${lang}`))
    )));
    if (isActivityDeck || (destination === null && key.startsWith(houseHistoryPrefix))) localStorage.removeItem(key);
  }
  if (destinations.includes('reef')) {
    const deckKey = 'bubble_memory_word_decks_v1';
    const decks = JSON.parse(localStorage.getItem(deckKey));
    const profileDecks = decks?.[profileId];
    if (profileDecks) {
      if (destination === null) delete decks[profileId];
      else {
        for (const key of Object.keys(profileDecks)) {
          if (key.startsWith('reef-memory-') && languages.some(lang => key.endsWith(`:${lang}`))) delete profileDecks[key];
        }
      }
      localStorage.setItem(deckKey, JSON.stringify(decks));
    }
  }
  if (destination === 'reef') return;
  for (const key of saveStorage.keys()) {
    if (key.startsWith(`magic-reveal-forest-${profileId}-`) || key.startsWith(`magic-reveal-wonder-${profileId}-`)) {
      const matchDestination = destination === null || key.startsWith(`magic-reveal-${destination}-${profileId}-`);
      const matchLanguage = language === null || key.startsWith(`magic-reveal-${destination ?? 'forest'}-${profileId}-${language}-`) || key.startsWith(`magic-reveal-${destination ?? 'wonder'}-${profileId}-${language}-`);
      if (matchDestination && matchLanguage) saveStorage.removeItem(key);
      continue;
    }
    const isForest = key.startsWith(`house-round-forest-${profileId}-`)
      || key.startsWith(`memory-round-forest-${profileId}-`)
      || key.startsWith(`forest-${profileId}-`);
    if (destination === 'wonder' && isForest) continue;
    if (destination === 'forest' && !(key.startsWith(`house-round-forest-${profileId}-${language}-`)
      || key.startsWith(`memory-round-forest-${profileId}-${language}-`)
      || key.startsWith(`forest-${profileId}-${language}-`))) continue;
    if (key.startsWith(`house-round-${profileId}-`)
      || key.startsWith(`house-round-forest-${profileId}-`)
      || key.startsWith(`memory-round-${profileId}-`)
      || key.startsWith(`memory-round-forest-${profileId}-`)
      || key === `${profileId}-bubble_shop_sessions_v1`
      || key.startsWith(`forest-${profileId}-`)) {
      saveStorage.removeItem(key);
    }
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
    routeProgress[profile.id] = { ...createTrackProgress(1, FIRST_REGION_LENGTH), stageOrder: createJourneyOrder(TRAIL_STAGES) };
    forestProgress[profile.id] = createForestProgress();
    activeProfileId = profile.id;
    saveWorldProgress('wonder');
    saveWorldProgress('forest');
    saveProfiles();
    localStorage.setItem(WORLD_ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
  } else {
    const profile = getProfile(editingProfileId);
    if (profile.learningLanguage !== learningLanguage) clearProfileRounds(profile.id, 'wonder');
    profile.name = name;
    profile.character = character;
    profile.learningLanguage = learningLanguage;
    forestProgress = loadForestProgress();
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
  editorEntryWorlds.delete(deletedId);
  clearProfileRounds(deletedId);
  saveStorage.removeItem(`route-${deletedId}`);
  saveStorage.removeItem(getGalleryKey(deletedId));
  for (const lang of Object.keys(languageOptions)) {
    saveStorage.removeItem(getRouteKey(deletedId, 'forest', lang));
    saveStorage.removeItem(getRouteKey(deletedId, 'reef', lang));
  }
  profiles.splice(deletedIndex, 1);
  delete routeProgress[deletedId];
  delete forestProgress[deletedId];
  const nextProfileId = activeProfileId === deletedId
    ? profiles[Math.min(deletedIndex, profiles.length - 1)].id : activeProfileId;
  saveProfiles();
  saveWorldProgress('wonder');
  saveWorldProgress('forest');
  setProfile(nextProfileId);
  closeProfileEditor(false);
  openGate();
}

function launchSelectedStage() {
  if (!selectedStage || !canPlayStage(selectedStage)) {
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
    destination: isReefStage(stage) ? 'reef' : activeDestination,
  };
  const launch = activeLaunch;
  setWorldInteractionLocked(true);
  setJourneyCharacter(launchCharacter, profile, launch.destination);
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
    destination: launch.destination,
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
  playButton.focus({ preventScroll: true });
}

function setWorldInteractionLocked(locked) {
  [document.querySelector('.world-chrome'), route, stagePanel].forEach((element) => {
    element.inert = locked;
  });
}

function completeLaunchedStage(launch, stars = 3) {
  const profile = getProfile(launch.profileId);
  const destination = launch.destination;
  if (destination === 'reef') {
    const stageId = launch.stageId - FIRST_REGION_LENGTH;
    const worldComplete = stageId === REEF_JOURNEY_STAGES.length && !reefProgress.progress[stageId];
    completeReefStage(profile, stageId, stars, saveStorage);
    renderJourneyFrontier();
    const showingStory = showPendingJourneyStory();
    return { worldComplete: worldComplete && !showingStory };
  }
  const progress = getRouteProgress(launch.profileId, destination);
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
    && completedStage.id === FIRST_REGION_LENGTH
    && !nextStage;

  let unlockedMilestone = null;
  if (destination === 'forest' && previousStars === 0) {
    unlockedMilestone = unlockForestMilestone(progress, completedStage.id);
  }

  if (!nextStage) {
    saveWorldProgress(destination);
    if (worldComplete && destination === 'forest') {
      renderJourneyFrontier();
      showPendingJourneyStory();
      return { worldComplete: false };
    }
    if (launch.profileId === activeProfileId) {
      updateStarTotal();
      renderRoute();
      selectStage(completedStage);
    }
    if (unlockedMilestone) showForestMilestone(unlockedMilestone, true);
    return { worldComplete: worldComplete && destination === 'wonder' };
  }

  progress.currentStage = nextStage.id;
  saveWorldProgress(destination);
  if (launch.profileId !== activeProfileId) {
    return { worldComplete: false };
  }
  updateStarTotal();
  renderRoute();

  updateTravellerAsset('walk');
  positionTraveller(nextStage);

  window.setTimeout(() => {
    updateTravellerAsset('idle');
    selectStage(nextStage);
    if (unlockedMilestone) showForestMilestone(unlockedMilestone, true);
  }, 760);
  return { worldComplete: false };
}

function showWorldComplete(profile) {
  const stageTotal = screenStages.at(-1).id;
  setJourneyCharacter(worldCompleteCharacter, profile, mapWorld);
  document.getElementById('world-complete-title').textContent = mapWorld === 'reef' ? 'המסע הושלם!' : 'הפרק הראשון הושלם!';
  document.getElementById('world-complete-stage-copy').textContent = `סיימתם את כל ${stageTotal} שלבי המסלול.`;
  document.getElementById('world-complete-score').textContent = `${getJourneyStarTotal()} / ${stageTotal * 3}`;
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
    const exitedStage = screenStages.find((stage) => stage.id === activeLaunch.stageId);
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
    showWorldComplete(getProfile(completedLaunch.profileId));
    return;
  }
  if (!forestMilestoneDialog.hidden) return;

  setJourneyCharacter(launchCharacter, getProfile(completedLaunch.profileId), completedLaunch.destination);
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

function getJourneyStarTotal() {
  return getEarnedStarTotal(getRouteProgress()) + (mapWorld === 'reef' ? getEarnedStarTotal(reefProgress) : 0);
}

function updateStarTotal() {
  const earnedStars = getJourneyStarTotal();
  const availableStarTotal = screenStages.at(-1).id * 3;
  document.getElementById('star-total').textContent = String(earnedStars);
  document.getElementById('star-total-max').textContent = `/${availableStarTotal}`;
  document.querySelector('.star-total').setAttribute('aria-label', `${earnedStars} מתוך ${availableStarTotal} כוכבים`);
}

profileButton.addEventListener('click', toggleProfileMenu);
editProfileButton.addEventListener('click', () => openProfileEditor(activeProfileId));
chooseProfileButton.addEventListener('click', openGate);
addProfileButton.addEventListener('click', () => openProfileEditor(null));
profileForm.addEventListener('submit', saveProfileFromEditor);
editorClose.addEventListener('click', () => closeProfileEditor());
deleteProfileButton.addEventListener('click', deleteEditedProfile);
cancelDeleteButton.addEventListener('click', () => {
  deleteConfirm.hidden = true;
  deleteProfileButton.focus();
});
confirmDeleteButton.addEventListener('click', confirmProfileDeletion);
function syncTrackResetControls() {
  updateTrackResetCopy();
  trackResetConfirm.hidden = true;
  updateTrackResetAvailability();
  profileForm.classList.remove('is-confirming-track-reset');
  trackResetStatus.textContent = '';
}
trackWorldSelect.replaceChildren(...Object.entries(MAP_WORLD_TITLES).map(([world, title]) => new Option(title, world)));
trackWorldSelect.addEventListener('change', renderTrackResetOptions);
trackStageSelect.addEventListener('change', syncTrackResetControls);
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


destinationsNavButton.addEventListener('click', openDestinationGate);
destinationProfilePill.addEventListener('click', () => {
  destinationGateWasOpen = true;
  openGate();
});
destinationCardWonder.addEventListener('click', () => chooseDestination('wonder'));
destinationCardForest.addEventListener('click', () => chooseDestination('forest'));

forestFriendCards.forEach((btn) => {
  btn.addEventListener('click', () => chooseForestCompanion(btn.dataset.character));
});
forestFriendButton.addEventListener('click', () => {
  closeProfileMenu();
  openForestCharacterPicker('switch');
});
forestPickerClose.addEventListener('click', closeForestCharacterPicker);
forestPickerBackdrop.addEventListener('click', closeForestCharacterPicker);

forestMilestonePlayBtn.addEventListener('click', () => {
  closeForestMilestone();
});

forestCaptionLanguage.addEventListener('change', updateForestCaptions);
forestMilestoneVideo.addEventListener('ended', () => {
  if (isPendingMilestonePresentation && activeMilestoneVideoId === REEF_BRIDGE_ID) {
    closeForestMilestone();
    return;
  }
  acknowledgePendingMilestone();
  forestMilestonePlayBtn.textContent = isPendingMilestonePresentation ? 'ממשיכים במסע ←' : 'חזרה למפה ←';
});
forestMilestoneVideo.addEventListener('error', () => {
  forestMilestoneVideo.hidden = true;
  if (forestMilestonePoster) {
    forestMilestonePoster.hidden = false;
  }
  if (forestMilestoneError) {
    forestMilestoneError.hidden = false;
  }
});
if (forestMilestoneRetryBtn) {
  forestMilestoneRetryBtn.addEventListener('click', () => {
    if (forestMilestoneError) forestMilestoneError.hidden = true;
    if (forestMilestonePoster) forestMilestonePoster.hidden = true;
    forestMilestoneVideo.hidden = false;
    forestMilestoneVideo.load();
  });
}
forestStorySelect.addEventListener('change', () => {
  const milestone = getUnlockedJourneyMilestones().find(m => m.videoId === forestStorySelect.value);
  if (milestone) showForestMilestone(milestone, milestone.videoId === pendingMilestoneVideoId);
});
forestStoriesButton.addEventListener('click', () => {
  const milestone = getUnlockedJourneyMilestones().at(-1);
  if (milestone) showForestMilestone(milestone, false);
});

document.addEventListener('keydown', (event) => {
  if (document.querySelector('.collection-gallery[open]')) return;
  const modal = !forestMilestoneDialog.hidden ? forestMilestoneDialog : !forestCharacterPicker.hidden ? forestCharacterPicker : null;
  if (modal && event.key === 'Tab') {
    const controls = [...modal.querySelectorAll('button, select, video[controls]')].filter(control => control.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  if (event.key === 'Escape') {
    if (!forestMilestoneDialog.hidden) {
      closeForestMilestone();
      return;
    }
    if (!forestCharacterPicker.hidden) {
      closeForestCharacterPicker();
      return;
    }
    if (!destinationGate.hidden) {
      chooseDestination(activeDestination, mapWorld);
      return;
    }
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
    const currentStage = getCurrentStage();
    if (currentStage) centerStageInMap(currentStage);
  });
});
setProfile(activeProfileId);
destinationGateWasOpen = true;
openGate();

for (const id of ['gallery-button', 'destination-gallery-button']) {
  document.getElementById(id).addEventListener('click', () => openGallery(getProfile(), saveStorage));
}
