import { VOCAB_WORDS, type VocabWord } from './words';
import type { HostedActivitySession } from './hostedActivity';
import { calculateMasteryStars, formatStarRating } from '../prototype/shared/activity-scoring.mjs';
import { GAME_LEVELS, getLanguagePolicy } from '../prototype/shared/trail-catalog.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';
import {
  playRecordedSequence,
  playRecordedSequenceWithCompletion,
  stopRecordedSpeech,
  vocabularyWordAudio,
} from './recordedSpeech';

export interface ParkProfile {
  id: string;
  name: string;
  emoji: string;
  language?: 'en' | 'he';
}

export interface ParkDeps {
  showScreen: (screenId: 'park-screen') => void;
  getActiveProfile: () => ParkProfile;
  returnToGameSelect: () => void;
  hostedSession: HostedActivitySession | null;
}

export type ParkItem = VocabWord;
export type ParkLevelId = 'park-level-1' | 'park-level-2' | 'park-level-3' | 'park-level-4' | 'park-level-5';

interface ParkLevel {
  id: ParkLevelId;
  title: string;
  subtitle: string;
  icon: string;
  findCount: number;
  sceneSize: number;
  itemPool: string[];
  difficultyRank: number;
}

interface SceneSlot {
  top: number;
  left: number;
  scale: number;
  zone: string;
}

const PARK_SCENE_SLOTS: readonly SceneSlot[] = Object.freeze([
  { top: 12, left: 16, scale: 1.05, zone: 'sky-left' },
  { top: 10, left: 78, scale: 1.1, zone: 'sky-right' },
  { top: 26, left: 44, scale: 0.95, zone: 'treetop' },
  { top: 38, left: 18, scale: 1.0, zone: 'hill-left' },
  { top: 35, left: 82, scale: 1.0, zone: 'hill-right' },
  { top: 52, left: 32, scale: 1.0, zone: 'bench' },
  { top: 48, left: 62, scale: 1.05, zone: 'tree-base' },
  { top: 62, left: 12, scale: 0.95, zone: 'pond-left' },
  { top: 68, left: 48, scale: 1.1, zone: 'picnic-blanket' },
  { top: 64, left: 84, scale: 1.0, zone: 'pond-right' },
  { top: 80, left: 24, scale: 1.05, zone: 'flowerbed-left' },
  { top: 82, left: 66, scale: 1.0, zone: 'flowerbed-right' },
  { top: 76, left: 38, scale: 1.1, zone: 'path-front' },
  { top: 84, left: 54, scale: 1.0, zone: 'grass-front' },
]);

const PARK_LEVEL_PROGRESS_STORAGE_KEY = 'bubble_park_levels';
const PARK_WORD_DECK_STORAGE_KEY = 'bubble_park_word_decks_v1';
const PARK_WIN_RETURN_DELAY_MS = 2400;

const PARK_LEVELS = GAME_LEVELS.park as readonly ParkLevel[];

export function initParkGame(deps: ParkDeps) {
  const state = {
    activeLevel: PARK_LEVELS[0],
    targets: [] as ParkItem[],
    targetIndex: 0,
    sceneItems: [] as ParkItem[],
    foundIds: new Set<string>(),
    mistakes: 0,
    locked: false,
    timers: [] as number[],
  };

  const levelMap = requireElement<HTMLElement>('park-level-map');
  const gameArea = requireElement<HTMLElement>('park-game-area');
  const trail = requireElement<HTMLDivElement>('park-level-trail');
  const hotspotsContainer = requireElement<HTMLDivElement>('park-hotspots');
  const celebration = requireElement<HTMLDivElement>('park-celebration');

  requireElement<HTMLButtonElement>('park-back-btn').addEventListener('click', () => {
    leavePark();
    if (deps.hostedSession) {
      deps.hostedSession.exit();
      return;
    }
    deps.returnToGameSelect();
  });
  requireElement<HTMLButtonElement>('park-level-list-btn').addEventListener('click', returnFromParkGame);
  requireElement<HTMLButtonElement>('park-replay-btn').addEventListener('click', replayTargetPrompt);
  requireElement<HTMLButtonElement>('park-celebration-next-btn').addEventListener('click', finishParkCelebration);

  function openPark() {
    deps.showScreen('park-screen');
    renderLevelList();
    showLevelList();
  }

  function openLevel(levelId: ParkLevelId) {
    deps.showScreen('park-screen');
    if (deps.hostedSession) {
      requireElement<HTMLButtonElement>('park-level-list-btn').hidden = true;
      const celebrationButton = requireElement<HTMLButtonElement>('park-celebration-next-btn');
      celebrationButton.textContent = 'חזרה למסלול';
      celebrationButton.setAttribute('aria-label', 'חזרה למסלול');
      const backButton = requireElement<HTMLButtonElement>('park-back-btn');
      backButton.querySelector<HTMLElement>('span:last-child')!.textContent = 'חזרה למסלול';
      backButton.setAttribute('aria-label', 'חזרה למסלול');
      backButton.title = 'חזרה למסלול';
    }
    startLevel(levelId);
  }

  function leavePark() {
    clearParkTimers();
    hideCelebration();
    stopRecordedSpeech();
    state.locked = false;
  }

  function showLevelList() {
    levelMap.classList.remove('hidden');
    gameArea.classList.add('hidden');
    renderLevelList();
  }

  function returnToLevelList() {
    clearParkTimers();
    hideCelebration();
    stopRecordedSpeech();
    showLevelList();
  }

  function returnFromParkGame() {
    if (deps.hostedSession) {
      leavePark();
      deps.hostedSession.exit();
      return;
    }
    returnToLevelList();
  }

  function finishParkCelebration() {
    if (deps.hostedSession) {
      const stars = calculateMasteryStars({
        mistakes: state.mistakes,
        challengeSize: state.activeLevel.findCount,
      });
      leavePark();
      deps.hostedSession.complete(stars);
      return;
    }
    returnToLevelList();
  }

  function renderLevelList() {
    const profile = deps.getActiveProfile();
    requireElement<HTMLElement>('park-profile-badge').textContent = `המסלול של ${profile.name}`;

    trail.innerHTML = '';
    const currentLevelId = deriveCurrentLevelId();

    PARK_LEVELS.forEach((level, index) => {
      const stars = getLevelStars(level.id);
      const isLocked = isLevelLocked(index);
      const isCurrent = !isLocked && level.id === currentLevelId && stars === 0;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'park-level-node';
      button.classList.toggle('is-locked', isLocked);
      button.classList.toggle('is-complete', stars > 0);
      button.classList.toggle('is-current', isCurrent);
      button.disabled = isLocked;
      button.setAttribute('aria-label', isLocked ? `${level.title}, נעול` : `${level.title}, ${level.subtitle}`);
      button.addEventListener('click', () => startLevel(level.id));

      const icon = document.createElement('span');
      icon.className = 'park-level-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = isLocked ? '🔒' : level.icon;

      const copy = document.createElement('span');
      copy.className = 'park-level-copy';
      const title = document.createElement('strong');
      title.textContent = level.title;
      const subtitle = document.createElement('small');
      subtitle.textContent = level.subtitle;
      copy.append(title, subtitle);

      const starRow = document.createElement('span');
      starRow.className = 'park-level-stars';
      starRow.setAttribute('aria-label', `${stars} מתוך 3 כוכבים`);
      for (let starIndex = 1; starIndex <= 3; starIndex++) {
        const star = document.createElement('span');
        star.className = 'park-level-star';
        star.classList.toggle('is-filled', starIndex <= stars);
        star.textContent = '★';
        starRow.append(star);
      }

      button.append(icon, copy, starRow);
      trail.append(button);
    });
  }

  function startLevel(levelId: ParkLevelId) {
    const level = PARK_LEVELS.find((candidate) => candidate.id === levelId);
    if (!level) {
      throw new Error(`Missing park level ${levelId}`);
    }

    state.activeLevel = level;
    state.mistakes = 0;
    state.locked = false;
    state.foundIds = new Set<string>();

    requireElement<HTMLElement>('park-profile-badge').textContent = `המסלול של ${deps.getActiveProfile().name}`;
    clearParkTimers();
    hideCelebration();
    levelMap.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameArea.classList.remove('is-completing');
    requireElement<HTMLElement>('park-game-level-title').textContent = level.title;

    const drawnTargets = drawTargetItems(level.findCount);
    state.targets = drawnTargets;
    state.targetIndex = 0;

    const targetSet = new Set(drawnTargets.map((item) => item.id));
    const distractorPool = level.itemPool
      .filter((id) => !targetSet.has(id))
      .map(getParkItem);
    const neededDistractors = level.sceneSize - drawnTargets.length;
    const fillers = shuffle(distractorPool).slice(0, neededDistractors);
    state.sceneItems = shuffle([...drawnTargets, ...fillers]);

    renderScene();
    renderPrompt();
    updateHud();

    const isEnglish = getLearningLanguage() === 'en';
    if (isEnglish) {
      scheduleTimer(() => speakCurrentTarget(), 400);
    }
  }

  function currentTarget(): ParkItem | null {
    return state.targets[state.targetIndex] ?? null;
  }

  function renderPrompt() {
    const target = currentTarget();
    if (!target) {
      return;
    }
    const isEnglish = getLearningLanguage() === 'en';
    const promptText = requireElement<HTMLElement>('park-target-prompt');
    const replayButton = requireElement<HTMLButtonElement>('park-replay-btn');

    if (isEnglish) {
      promptText.textContent = `Where is the ${target.english}?`;
      promptText.dir = 'ltr';
      replayButton.hidden = false;
      setFeedback('הקשיבו ומצאו בפארק');
    } else {
      promptText.textContent = `איפה יש ${target.hebrew}?`;
      promptText.dir = 'rtl';
      replayButton.hidden = true;
      setFeedback('קראו ומצאו בפארק');
    }
  }

  function renderScene() {
    hotspotsContainer.innerHTML = '';
    const isEnglish = getLearningLanguage() === 'en';
    const policy = getLanguagePolicy(getLearningLanguage());
    const slots = shuffle([...PARK_SCENE_SLOTS]).slice(0, state.sceneItems.length);

    state.sceneItems.forEach((item, index) => {
      const slot = slots[index];
      const hotspot = document.createElement('button');
      hotspot.type = 'button';
      hotspot.className = 'park-hotspot';
      hotspot.dataset.itemId = item.id;
      hotspot.style.top = `${slot.top}%`;
      hotspot.style.left = `${slot.left}%`;
      hotspot.style.setProperty('--park-item-scale', String(slot.scale));

      const isFound = state.foundIds.has(item.id);
      hotspot.classList.toggle('is-found', isFound);

      const label = document.createElement('span');
      if (policy.choices === 'written-hebrew' && !isFound) {
        label.className = 'park-hotspot-word';
        label.dir = 'rtl';
        label.textContent = item.hebrew;
      } else {
        label.className = 'park-hotspot-drawing';
        label.setAttribute('aria-hidden', 'true');
        label.textContent = item.drawing;
      }
      hotspot.append(label);

      hotspot.setAttribute('aria-label', isEnglish ? item.english : item.hebrew);
      hotspot.addEventListener('click', () => selectHotspot(item, hotspot));
      hotspotsContainer.append(hotspot);
    });
  }

  function selectHotspot(item: ParkItem, hotspot: HTMLButtonElement) {
    if (state.locked) {
      return;
    }
    const target = currentTarget();
    if (!target) {
      return;
    }

    if (item.id !== target.id) {
      state.mistakes += 1;
      hotspot.classList.remove('is-wrong');
      void hotspot.offsetWidth;
      hotspot.classList.add('is-wrong');
      setFeedback(getLearningLanguage() === 'en' ? 'לא זה. מקשיבים שוב 🍃' : 'לא זה. קוראים שוב 🍃');
      if (getLearningLanguage() === 'en') {
        scheduleTimer(() => speakCurrentTarget(), 200);
      }
      return;
    }

    // Correct target found!
    state.foundIds.add(item.id);
    state.locked = true;
    hotspot.classList.remove('is-wrong');
    hotspot.classList.add('is-found', 'is-celebrating');

    // Reveal drawing if it was in written Hebrew mode
    const label = hotspot.querySelector<HTMLElement>('.park-hotspot-word');
    if (label) {
      label.className = 'park-hotspot-drawing';
      label.removeAttribute('dir');
      label.textContent = item.drawing;
    }

    animateSparkle(hotspot);
    setFeedback(`✨ ${item.drawing} ${item.hebrew} — ${item.english}`);
    updateHud();

    const isEnglish = getLearningLanguage() === 'en';
    const advance = () => {
      hotspot.classList.remove('is-celebrating');
      state.targetIndex += 1;
      state.locked = false;

      if (state.targetIndex >= state.targets.length) {
        completeLevel();
        return;
      }

      renderPrompt();
      updateHud();
      if (isEnglish) {
        scheduleTimer(() => speakCurrentTarget(), 300);
      }
    };

    if (isEnglish) {
      scheduleTimer(() => {
        playRecordedSequenceWithCompletion(
          [vocabularyWordAudio(item.id)],
          advance,
          advance,
        );
      }, 120);
    } else {
      scheduleTimer(advance, 1200);
    }
  }

  function animateSparkle(hotspot: HTMLElement) {
    const sparkle = document.createElement('span');
    sparkle.className = 'park-sparkle';
    sparkle.textContent = '✨';
    sparkle.setAttribute('aria-hidden', 'true');
    hotspot.append(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
  }

  function updateHud() {
    const level = state.activeLevel;
    requireElement<HTMLElement>('park-found-progress').textContent = `🔍 ${state.targetIndex}/${level.findCount}`;
    requireElement<HTMLButtonElement>('park-replay-btn').disabled = state.locked;
  }

  function setFeedback(message: string) {
    requireElement<HTMLElement>('park-feedback').textContent = message;
  }

  function replayTargetPrompt() {
    if (!state.locked && getLearningLanguage() === 'en') {
      speakCurrentTarget();
    }
  }

  function speakCurrentTarget() {
    const target = currentTarget();
    if (target) {
      playRecordedSequence([vocabularyWordAudio(target.id)]);
    }
  }

  function getLearningLanguage(): 'en' | 'he' {
    return deps.getActiveProfile().language ?? 'en';
  }

  function completeLevel() {
    clearParkTimers();
    state.locked = true;
    const stars = calculateMasteryStars({
      mistakes: state.mistakes,
      challengeSize: state.activeLevel.findCount,
    });
    if (!deps.hostedSession) {
      saveLevelStars(state.activeLevel.id, stars);
      renderLevelList();
    }
    showCelebration(stars);
    scheduleTimer(() => {
      if (deps.hostedSession) {
        leavePark();
        deps.hostedSession.complete(stars);
        return;
      }
      returnToLevelList();
    }, PARK_WIN_RETURN_DELAY_MS);
  }

  function showCelebration(stars: number) {
    gameArea.classList.add('is-completing');
    requireElement<HTMLElement>('park-celebration-stars').textContent = formatStarRating(stars);
    requireElement<HTMLElement>('park-celebration-subtitle').textContent =
      `${deps.getActiveProfile().name}, מצאת את כולם וצברת ${stars} כוכבים!`;
    celebration.classList.add('is-visible');
    celebration.setAttribute('aria-hidden', 'false');
  }

  function hideCelebration() {
    celebration.classList.remove('is-visible');
    celebration.setAttribute('aria-hidden', 'true');
    gameArea.classList.remove('is-completing');
  }

  function drawTargetItems(count: number) {
    const decks = JSON.parse(localStorage.getItem(PARK_WORD_DECK_STORAGE_KEY) || '{}');
    const profileId = deps.getActiveProfile().id;
    const profileDecks = decks[profileId] || {};
    const result = drawVocabularyRound({
      pool: state.activeLevel.itemPool,
      count,
      state: profileDecks[state.activeLevel.id] || null,
    });
    profileDecks[state.activeLevel.id] = result.state;
    decks[profileId] = profileDecks;
    localStorage.setItem(PARK_WORD_DECK_STORAGE_KEY, JSON.stringify(decks));
    return result.selection.map(getParkItem);
  }

  function isLevelLocked(index: number) {
    return index > 0 && getLevelStars(PARK_LEVELS[index - 1].id) === 0;
  }

  function deriveCurrentLevelId() {
    const firstPlayable = PARK_LEVELS.find((level, index) => !isLevelLocked(index) && getLevelStars(level.id) === 0);
    return firstPlayable?.id || PARK_LEVELS[PARK_LEVELS.length - 1].id;
  }

  function readLevelProgress(): Record<string, Partial<Record<ParkLevelId, number>>> {
    return JSON.parse(localStorage.getItem(PARK_LEVEL_PROGRESS_STORAGE_KEY) || '{}');
  }

  function getLevelStars(levelId: ParkLevelId) {
    const progress = readLevelProgress();
    return progress[deps.getActiveProfile().id]?.[levelId] || 0;
  }

  function saveLevelStars(levelId: ParkLevelId, stars: number) {
    const progress = readLevelProgress();
    const profileId = deps.getActiveProfile().id;
    const profileProgress = progress[profileId] || {};
    profileProgress[levelId] = Math.max(profileProgress[levelId] || 0, stars);
    progress[profileId] = profileProgress;
    localStorage.setItem(PARK_LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }

  function scheduleTimer(callback: () => void, delayMs: number) {
    const timerId = window.setTimeout(() => {
      state.timers = state.timers.filter((candidate) => candidate !== timerId);
      callback();
    }, delayMs);
    state.timers.push(timerId);
  }

  function clearParkTimers() {
    state.timers.forEach((timerId) => clearTimeout(timerId));
    state.timers = [];
  }

  // Text state hook for automated tests per develop-web-game skill
  (window as unknown as { render_game_to_text?: () => string }).render_game_to_text = () => JSON.stringify({
    mode: 'park',
    activeLevel: state.activeLevel.id,
    targetIndex: state.targetIndex,
    findCount: state.activeLevel.findCount,
    currentTarget: currentTarget()?.id ?? null,
    mistakes: state.mistakes,
    foundCount: state.foundIds.size,
    locked: state.locked,
    sceneItemCount: state.sceneItems.length,
  });

  return {
    openPark,
    openLevel,
    leavePark,
  };
}

function getParkItem(id: string): ParkItem {
  const item = VOCAB_WORDS.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Missing park vocabulary item ${id}`);
  }
  return item;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element as T;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
