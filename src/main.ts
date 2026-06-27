import './styles.css';
import { GameApp } from './game/GameApp';
import { FigureType } from './entities/Character';
import { FallingItemMode } from './entities/Bubble';

// Version badge
const versionBadge = document.getElementById('version-badge');
if (versionBadge) {
  versionBadge.textContent = `v${__APP_VERSION__}`;
}

// Initialize game
const gameApp = new GameApp();

type ScreenId = 'game-select-screen' | 'memory-screen' | 'start-screen' | 'game-hud' | 'end-screen';
type MemoryDifficulty = 'easy' | 'medium' | 'hard';
type MemoryCardKind = 'hebrew' | 'english';
type MemoryLevelId =
  | 'level-1'
  | 'level-2'
  | 'level-3'
  | 'level-4'
  | 'level-5'
  | 'level-6'
  | 'level-7'
  | 'level-8'
  | 'level-9'
  | 'level-10'
  | 'level-11'
  | 'level-12'
  | 'level-13'
  | 'level-14'
  | 'level-15';

interface KidProfile {
  id: string;
  name: string;
  emoji: string;
}

interface MemoryWord {
  id: string;
  hebrew: string;
  english: string;
  drawing: string;
}

interface MemoryCard {
  cardId: string;
  wordId: string;
  kind: MemoryCardKind;
  text: string;
  english: string;
  drawing: string;
}

interface MemoryLevel {
  id: MemoryLevelId;
  difficulty: MemoryDifficulty;
  title: string;
  subtitle: string;
  pairs: number;
  icon: string;
  hints: string[];
  locked: boolean;
  reward?: string;
}

type MemoryRoutePoint = { x: number; y: number };
type MemoryMapAreaTone = 'green' | 'pink' | 'gold';
type MemoryMapArea = { label: string; x: number; y: number; tone: MemoryMapAreaTone };

const MEMORY_WORDS: MemoryWord[] = [
  { id: 'dog', hebrew: 'כלב', english: 'dog', drawing: '🐶' },
  { id: 'cat', hebrew: 'חתול', english: 'cat', drawing: '🐱' },
  { id: 'apple', hebrew: 'תפוח', english: 'apple', drawing: '🍎' },
  { id: 'banana', hebrew: 'בננה', english: 'banana', drawing: '🍌' },
  { id: 'sun', hebrew: 'שמש', english: 'sun', drawing: '☀️' },
  { id: 'moon', hebrew: 'ירח', english: 'moon', drawing: '🌙' },
  { id: 'house', hebrew: 'בית', english: 'house', drawing: '🏠' },
  { id: 'car', hebrew: 'מכונית', english: 'car', drawing: '🚗' },
  { id: 'ball', hebrew: 'כדור', english: 'ball', drawing: '⚽' },
  { id: 'tree', hebrew: 'עץ', english: 'tree', drawing: '🌳' },
  { id: 'fish', hebrew: 'דג', english: 'fish', drawing: '🐟' },
  { id: 'flower', hebrew: 'פרח', english: 'flower', drawing: '🌸' },
];

const MEMORY_DIFFICULTY_PAIRS: Record<MemoryDifficulty, number> = {
  easy: 4,
  medium: 6,
  hard: 8,
};

const MEMORY_LEVELS: MemoryLevel[] = [
  {
    id: 'level-1',
    difficulty: 'easy',
    title: 'שלב 1',
    subtitle: 'גן קטן',
    pairs: MEMORY_DIFFICULTY_PAIRS.easy,
    icon: '🍎',
    hints: ['dog', 'cat', 'apple', 'sun'],
    locked: false,
  },
  {
    id: 'level-2',
    difficulty: 'medium',
    title: 'שלב 2',
    subtitle: 'שביל פרחים',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🐶',
    hints: ['moon', 'house', 'car', 'ball'],
    locked: false,
  },
  {
    id: 'level-3',
    difficulty: 'hard',
    title: 'שלב 3',
    subtitle: 'שער הכוכבים',
    pairs: MEMORY_DIFFICULTY_PAIRS.hard,
    icon: '🐘',
    hints: ['tree', 'fish', 'flower', 'banana'],
    locked: false,
    reward: '🎁',
  },
  {
    id: 'level-4',
    difficulty: 'easy',
    title: 'שלב 4',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.easy,
    icon: '☀️',
    hints: ['fish', 'tree', 'moon'],
    locked: true,
  },
  {
    id: 'level-5',
    difficulty: 'medium',
    title: 'שלב 5',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🏠',
    hints: ['house', 'car', 'ball'],
    locked: true,
    reward: '🎁',
  },
  {
    id: 'level-6',
    difficulty: 'medium',
    title: 'שלב 6',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🌳',
    hints: ['car', 'dog', 'apple'],
    locked: true,
  },
  {
    id: 'level-7',
    difficulty: 'hard',
    title: 'שלב 7',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.hard,
    icon: '🌙',
    hints: ['moon', 'sun', 'cat'],
    locked: true,
  },
  {
    id: 'level-8',
    difficulty: 'easy',
    title: 'שלב 8',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.easy,
    icon: '⚽',
    hints: ['ball', 'flower', 'fish'],
    locked: true,
    reward: '🎁',
  },
  {
    id: 'level-9',
    difficulty: 'medium',
    title: 'שלב 9',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🌳',
    hints: ['tree', 'house', 'banana'],
    locked: true,
  },
  {
    id: 'level-10',
    difficulty: 'hard',
    title: 'שלב 10',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.hard,
    icon: '🍌',
    hints: ['banana', 'dog', 'sun'],
    locked: true,
  },
  {
    id: 'level-11',
    difficulty: 'easy',
    title: 'שלב 11',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.easy,
    icon: '🐶',
    hints: ['dog', 'cat', 'car'],
    locked: true,
    reward: '🎁',
  },
  {
    id: 'level-12',
    difficulty: 'medium',
    title: 'שלב 12',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🐱',
    hints: ['cat', 'moon', 'flower'],
    locked: true,
  },
  {
    id: 'level-13',
    difficulty: 'hard',
    title: 'שלב 13',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.hard,
    icon: '☀️',
    hints: ['sun', 'apple', 'ball'],
    locked: true,
  },
  {
    id: 'level-14',
    difficulty: 'medium',
    title: 'שלב 14',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.medium,
    icon: '🌸',
    hints: ['flower', 'tree', 'house'],
    locked: true,
  },
  {
    id: 'level-15',
    difficulty: 'hard',
    title: 'שלב 15',
    subtitle: 'בקרוב',
    pairs: MEMORY_DIFFICULTY_PAIRS.hard,
    icon: '👑',
    hints: ['fish', 'banana', 'sun'],
    locked: true,
    reward: '🏆',
  },
];

const MEMORY_ROUTE_POINTS: MemoryRoutePoint[] = [
  { x: 15, y: 58 },
  { x: 19, y: 83 },
  { x: 24, y: 43 },
  { x: 33, y: 37 },
  { x: 43, y: 40 },
  { x: 53, y: 49 },
  { x: 60, y: 64 },
  { x: 70, y: 71 },
  { x: 78, y: 68 },
  { x: 88, y: 60 },
  { x: 90, y: 43 },
  { x: 80, y: 31 },
  { x: 68, y: 31 },
  { x: 56, y: 36 },
  { x: 45, y: 31 },
];

const MEMORY_MAP_AREAS: MemoryMapArea[] = [
  { label: 'עמק הפרחים', x: 36, y: 82, tone: 'green' },
  { label: 'שביל הכוכבים', x: 58, y: 74, tone: 'pink' },
  { label: 'שער העננים', x: 20, y: 19, tone: 'gold' },
];

const PROFILE_STORAGE_KEY = 'bubble_kid_profiles';
const ACTIVE_PROFILE_STORAGE_KEY = 'bubble_active_kid_profile';
const MEMORY_LEVEL_PROGRESS_STORAGE_KEY = 'bubble_memory_garden_levels';
const DEFAULT_KID_PROFILES: KidProfile[] = [
  { id: 'lotem', name: 'לוטם', emoji: '🌸' },
  { id: 'tom', name: 'תום', emoji: '🫧' },
];
const PROFILE_EMOJIS = ['🌸', '🫧', '⭐', '🌈', '🍎', '🦄', '🚗', '☀️', '🐶', '🏠'];

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element as T;
}

function showScreen(screenId: ScreenId) {
  document.querySelectorAll<HTMLElement>('.screen').forEach((screen) => {
    screen.classList.toggle('active', screen.id === screenId);
  });
}

// Player state (will be updated by UI)
let kidProfiles: KidProfile[] = DEFAULT_KID_PROFILES.map((profile) => ({ ...profile }));
let activeProfileId = DEFAULT_KID_PROFILES[0].id;
let p1Name = DEFAULT_KID_PROFILES[0].name;
let p2Name = DEFAULT_KID_PROFILES[1].name;
let p1Color = 0xff9eb5;
let p2Color = 0x7ec8e8;
let p1Figure: FigureType = 'blob';
let p2Figure: FigureType = 'blob';
let selectedTime = 45;
let fallingItemsMode: FallingItemMode = 'bubbles';
let activeMemoryLevel = MEMORY_LEVELS[0];
let memoryDifficulty: MemoryDifficulty = activeMemoryLevel.difficulty;
let memoryCards: MemoryCard[] = [];
let memoryFirstCard: HTMLDivElement | null = null;
let memorySecondCard: HTMLDivElement | null = null;
let memoryMatchedPairs = new Set<string>();
let memoryLocked = false;
let memoryToastTimer: number | null = null;
let memoryMismatchTimer: number | null = null;
let memoryWinReturnTimer: number | null = null;
const MEMORY_WIN_RETURN_DELAY_MS = 2400;

// Load saved preferences
function loadPreferences() {
  const savedColors = JSON.parse(localStorage.getItem('bubble_colors') || '{}');
  if (savedColors.p1) p1Color = parseInt(savedColors.p1.replace('#', ''), 16);
  if (savedColors.p2) p2Color = parseInt(savedColors.p2.replace('#', ''), 16);

  const savedFigures = JSON.parse(localStorage.getItem('bubble_figures') || '{}');
  if (savedFigures.p1) p1Figure = savedFigures.p1;
  if (savedFigures.p2) p2Figure = savedFigures.p2;

  const savedNames = JSON.parse(localStorage.getItem('bubble_names') || '{}');
  if (savedNames.p2) p2Name = savedNames.p2;

  loadProfiles();

  const savedTheme = localStorage.getItem('bubble_background_theme');
  if (savedTheme) {
    gameApp.setTheme(savedTheme);
    document.querySelectorAll('.world-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.theme === savedTheme);
    });
  }

  const savedItems = localStorage.getItem('bubble_falling_items_mode') as FallingItemMode;
  if (savedItems) {
    fallingItemsMode = savedItems;
    gameApp.setFallingItemsMode(savedItems);
    document.querySelectorAll('.items-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.items === savedItems);
    });
  }
}

// Setup UI event handlers
function setupUI() {
  renderProfileList();
  syncActiveProfileUI();

  requireElement<HTMLButtonElement>('add-profile-btn').addEventListener('click', addProfileFromInput);
  requireElement<HTMLButtonElement>('rename-profile-btn').addEventListener('click', renameActiveProfileFromInput);
  requireElement<HTMLButtonElement>('delete-profile-btn').addEventListener('click', deleteActiveProfile);
  requireElement<HTMLInputElement>('profile-name-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addProfileFromInput();
    }
  });

  // Name inputs
  const p1Input = document.getElementById('p1-name') as HTMLInputElement;
  const p2Input = document.getElementById('p2-name') as HTMLInputElement;

  if (p1Input) {
    p1Input.value = p1Name;
    p1Input.addEventListener('input', () => {
      renameActiveProfile(p1Input.value);
      localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
    });
  }

  if (p2Input) {
    p2Input.value = p2Name;
    p2Input.addEventListener('input', () => {
      p2Name = p2Input.value || 'תום';
      localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
    });
  }

  // Color pickers
  document.querySelectorAll('.player-bubble').forEach((picker) => {
    const player = (picker as HTMLElement).dataset.player;

    picker.querySelectorAll('.color-petal').forEach((petal) => {
      petal.addEventListener('click', () => {
        const colorStr = (petal as HTMLElement).dataset.color;
        if (!colorStr) return;

        const color = parseInt(colorStr.replace('#', ''), 16);

        if (player === '1') {
          p1Color = color;
        } else {
          p2Color = color;
        }

        // Update UI
        picker.querySelectorAll('.color-petal').forEach((p) => {
          p.classList.toggle('is-selected', p === petal);
        });

        localStorage.setItem('bubble_colors', JSON.stringify({ p1: `#${p1Color.toString(16).padStart(6, '0')}`, p2: `#${p2Color.toString(16).padStart(6, '0')}` }));
      });
    });

    // Figure pickers
    picker.querySelectorAll('.figure-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const figure = (btn as HTMLElement).dataset.figure as FigureType;

        if (player === '1') {
          p1Figure = figure;
        } else {
          p2Figure = figure;
        }

        picker.querySelectorAll('.figure-btn').forEach((b) => {
          b.classList.toggle('is-selected', b === btn);
        });

        localStorage.setItem('bubble_figures', JSON.stringify({ p1: p1Figure, p2: p2Figure }));
      });
    });
  });

  // Timer buttons
  document.querySelectorAll('.candy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.candy-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = parseInt((btn as HTMLElement).dataset.time || '45');
    });
  });

  // World Carousel
  setupWorldCarousel();

  // World/theme picker (legacy - kept for compatibility)
  document.querySelectorAll('.world-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.world-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = (btn as HTMLElement).dataset.theme || 'classic';
      gameApp.setTheme(theme);
      localStorage.setItem('bubble_background_theme', theme);
    });
  });

  // Falling items picker
  document.querySelectorAll('.items-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.items-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = (btn as HTMLElement).dataset.items as FallingItemMode;
      fallingItemsMode = mode;
      gameApp.setFallingItemsMode(mode);
      localStorage.setItem('bubble_falling_items_mode', mode);
    });
  });

  // Start button
  requireElement<HTMLButtonElement>('select-bubbles-btn').addEventListener('click', openBubblesSetup);
  requireElement<HTMLButtonElement>('select-memory-btn').addEventListener('click', openMemoryGarden);
  requireElement<HTMLButtonElement>('back-to-games-btn').addEventListener('click', returnToGameSelect);
  requireElement<HTMLButtonElement>('start-btn').addEventListener('click', startGame);
  requireElement<HTMLButtonElement>('memory-back-btn').addEventListener('click', returnToGameSelect);
  requireElement<HTMLButtonElement>('memory-map-btn').addEventListener('click', showMemoryLevelMap);
  requireElement<HTMLButtonElement>('memory-new-garden-btn').addEventListener('click', () => startMemoryLevel(activeMemoryLevel.id));
  requireElement<HTMLButtonElement>('memory-celebration-next-btn').addEventListener('click', returnToMemoryMapAfterWin);

  // Restart button
  document.getElementById('restart-btn')?.addEventListener('click', returnToStart);

  // Home button
  document.getElementById('home-btn')?.addEventListener('click', returnToStart);

  // High scores popup
  document.getElementById('show-scores-btn')?.addEventListener('click', () => {
    document.getElementById('scores-popup')?.classList.remove('hidden');
  });

  document.querySelector('.close-popup')?.addEventListener('click', () => {
    document.getElementById('scores-popup')?.classList.add('hidden');
  });

  document.getElementById('scores-popup')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'scores-popup') {
      (e.target as HTMLElement).classList.add('hidden');
    }
  });
}

function loadProfiles() {
  const savedProfiles = localStorage.getItem(PROFILE_STORAGE_KEY);
  kidProfiles = savedProfiles ? JSON.parse(savedProfiles) : DEFAULT_KID_PROFILES.map((profile) => ({ ...profile }));

  const savedActiveProfile = localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
  if (savedActiveProfile) {
    activeProfileId = savedActiveProfile;
  }

  if (!kidProfiles.some((profile) => profile.id === activeProfileId)) {
    activeProfileId = kidProfiles[0].id;
  }

  p1Name = getActiveProfile().name;
  saveProfiles();
}

function getActiveProfile(): KidProfile {
  const profile = kidProfiles.find((candidate) => candidate.id === activeProfileId);
  if (!profile) {
    throw new Error(`Missing active profile ${activeProfileId}`);
  }
  return profile;
}

function saveProfiles() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(kidProfiles));
  localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, activeProfileId);
}

function createProfileId() {
  return `kid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function createProfileEmoji() {
  return PROFILE_EMOJIS[kidProfiles.length % PROFILE_EMOJIS.length];
}

function readProfileInput() {
  return requireElement<HTMLInputElement>('profile-name-input').value.trim();
}

function addProfileFromInput() {
  const name = readProfileInput();
  if (!name) {
    requireElement<HTMLInputElement>('profile-name-input').focus();
    return;
  }

  const profile: KidProfile = {
    id: createProfileId(),
    name,
    emoji: createProfileEmoji(),
  };

  kidProfiles.push(profile);
  activeProfileId = profile.id;
  p1Name = profile.name;
  saveProfiles();
  localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
  requireElement<HTMLInputElement>('profile-name-input').value = '';
  renderProfileList();
  syncActiveProfileUI();
}

function renameActiveProfileFromInput() {
  renameActiveProfile(readProfileInput());
  requireElement<HTMLInputElement>('profile-name-input').value = '';
}

function renameActiveProfile(name: string) {
  const normalizedName = name.trim() || getActiveProfile().name;
  const profile = getActiveProfile();
  profile.name = normalizedName;
  p1Name = normalizedName;
  saveProfiles();
  localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
  renderProfileList();
  syncActiveProfileUI();
}

function deleteActiveProfile() {
  if (kidProfiles.length === 1) {
    return;
  }

  const deletedIndex = kidProfiles.findIndex((profile) => profile.id === activeProfileId);
  if (deletedIndex === -1) {
    throw new Error(`Missing active profile ${activeProfileId}`);
  }

  kidProfiles.splice(deletedIndex, 1);
  activeProfileId = kidProfiles[Math.max(0, deletedIndex - 1)].id;
  p1Name = getActiveProfile().name;
  saveProfiles();
  localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
  renderProfileList();
  syncActiveProfileUI();
}

function selectProfile(profileId: string) {
  activeProfileId = profileId;
  p1Name = getActiveProfile().name;
  saveProfiles();
  localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
  renderProfileList();
  syncActiveProfileUI();
  renderMemoryLevelMap();
}

function renderProfileList() {
  const list = requireElement<HTMLDivElement>('profile-list');
  list.innerHTML = '';

  kidProfiles.forEach((profile) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'profile-chip';
    button.classList.toggle('active', profile.id === activeProfileId);
    button.setAttribute('aria-pressed', String(profile.id === activeProfileId));

    const avatar = document.createElement('span');
    avatar.className = 'profile-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = profile.emoji;

    const name = document.createElement('span');
    name.className = 'profile-name';
    name.textContent = profile.name;

    button.append(avatar, name);
    button.addEventListener('click', () => selectProfile(profile.id));
    list.append(button);
  });
}

function syncActiveProfileUI() {
  const profile = getActiveProfile();
  p1Name = profile.name;

  requireElement<HTMLElement>('active-profile-name').textContent = profile.name;
  requireElement<HTMLElement>('memory-profile-badge').textContent = `${profile.name} משחק/ת`;

  const p1Input = document.getElementById('p1-name') as HTMLInputElement | null;
  if (p1Input) {
    p1Input.value = profile.name;
  }

  const deleteButton = requireElement<HTMLButtonElement>('delete-profile-btn');
  deleteButton.disabled = kidProfiles.length === 1;
}

function openBubblesSetup() {
  clearMemoryMismatchTimer();
  clearMemoryWinReturnTimer();
  hideMemoryToast();
  hideMemoryCelebration();
  showScreen('start-screen');
}

function openMemoryGarden() {
  gameApp.returnToStart();
  showScreen('memory-screen');
  showMemoryLevelMap();
}

function startGame() {
  clearMemoryMismatchTimer();
  hideMemoryToast();
  showScreen('game-hud');

  gameApp.startGame(
    { name: p1Name, color: p1Color, figureType: p1Figure, isGirl: true },
    { name: p2Name, color: p2Color, figureType: p2Figure, isGirl: false },
    selectedTime
  );
}

function returnToGameSelect() {
  clearMemoryMismatchTimer();
  clearMemoryWinReturnTimer();
  hideMemoryToast();
  hideMemoryCelebration();
  gameApp.returnToStart();
  showScreen('game-select-screen');
}

function returnToStart() {
  clearMemoryMismatchTimer();
  clearMemoryWinReturnTimer();
  hideMemoryToast();
  hideMemoryCelebration();
  gameApp.returnToStart();
  showScreen('start-screen');
}

function showEndScreen(score: number) {
  showScreen('end-screen');

  const finalScoreEl = document.getElementById('final-score-val');
  if (finalScoreEl) finalScoreEl.textContent = String(score);

  // Save high score
  saveHighScore(score, p1Name, p2Name);
  loadHighScores();
}

function saveHighScore(score: number, n1: string, n2: string) {
  let scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');
  scores.push({
    score,
    names: `${n1} & ${n2}`,
    date: new Date().toLocaleDateString('he-IL'),
  });
  scores.sort((a: any, b: any) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem('bubble_scores', JSON.stringify(scores));
}

function loadHighScores() {
  const scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');

  const list = document.getElementById('scores-list');
  if (list) {
    list.innerHTML = scores.map((s: any) => `<li>${s.names}: ${s.score}</li>`).join('');
  }

  const tableBody = document.querySelector('#full-scores-table tbody');
  if (tableBody) {
    const medalEmojis = ['🥇', '🥈', '🥉'];
    const medalClasses = ['medal-gold', 'medal-silver', 'medal-bronze'];

    tableBody.innerHTML = scores
      .map((s: any, i: number) => {
        const medal = medalEmojis[i] || i + 1;
        const rowClass = medalClasses[i] || '';
        return `<tr class="${rowClass}"><td>${medal}</td><td>${s.names}</td><td>${s.score}</td></tr>`;
      })
      .join('');
  }
}

function showMemoryLevelMap() {
  clearMemoryMismatchTimer();
  clearMemoryWinReturnTimer();
  hideMemoryToast();
  hideMemoryCelebration();
  const gameArea = requireElement<HTMLElement>('memory-game-area');
  const levelMap = requireElement<HTMLElement>('memory-level-map');
  gameArea.classList.remove('is-completing');
  gameArea.classList.add('hidden');
  levelMap.classList.remove('hidden', 'is-returning');
  renderMemoryLevelMap();
}

function startMemoryLevel(levelId: MemoryLevelId) {
  const level = MEMORY_LEVELS.find((candidate) => candidate.id === levelId);
  if (!level) {
    throw new Error(`Missing memory level ${levelId}`);
  }
  if (level.locked) {
    throw new Error(`Memory level ${levelId} is locked`);
  }

  clearMemoryWinReturnTimer();
  hideMemoryCelebration();
  activeMemoryLevel = level;
  const levelMap = requireElement<HTMLElement>('memory-level-map');
  const gameArea = requireElement<HTMLElement>('memory-game-area');
  levelMap.classList.add('hidden');
  levelMap.classList.remove('is-returning');
  gameArea.classList.remove('hidden', 'is-completing');
  requireElement<HTMLElement>('memory-level-title').textContent = `${level.title} - ${level.subtitle}`;
  startMemoryRound(level);
}

function startMemoryRound(level: MemoryLevel) {
  clearMemoryMismatchTimer();
  memoryDifficulty = level.difficulty;
  memoryMatchedPairs = new Set<string>();
  memoryFirstCard = null;
  memorySecondCard = null;
  memoryLocked = false;

  const pairCount = level.pairs;
  const selectedWords = MEMORY_WORDS.slice(0, pairCount);
  const cards = selectedWords.flatMap((word): MemoryCard[] => [
    {
      cardId: `${word.id}-hebrew`,
      wordId: word.id,
      kind: 'hebrew',
      text: word.hebrew,
      english: word.english,
      drawing: word.drawing,
    },
    {
      cardId: `${word.id}-english`,
      wordId: word.id,
      kind: 'english',
      text: word.english,
      english: word.english,
      drawing: word.drawing,
    },
  ]);

  memoryCards = shuffleMemoryCards(cards);
  renderMemoryBoard();
  updateMemoryStatus(`${level.title}: הפכו שני קלפים שמתחברים`);
  hideMemoryToast();
}

function shuffleMemoryCards(cards: MemoryCard[]): MemoryCard[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function renderMemoryBoard() {
  const board = requireElement<HTMLDivElement>('memory-board');
  board.innerHTML = '';
  board.dataset.difficulty = memoryDifficulty;

  memoryCards.forEach((card) => {
    const button = document.createElement('div');
    button.className = `memory-card memory-card-${card.kind}`;
    button.dataset.cardId = card.cardId;
    button.dataset.wordId = card.wordId;
    button.dataset.kind = card.kind;
    button.dataset.english = card.english;
    button.tabIndex = 0;
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', 'קלף זיכרון סגור');

    const back = document.createElement('span');
    back.className = 'memory-card-back';
    back.textContent = '❋';

    const front = document.createElement('span');
    front.className = 'memory-card-front';

    const drawing = document.createElement('span');
    drawing.className = 'memory-card-drawing';
    drawing.setAttribute('aria-hidden', 'true');
    drawing.textContent = card.drawing;

    const word = document.createElement('span');
    word.className = 'memory-card-word';
    word.textContent = card.text;

    front.append(drawing, word);

    if (card.kind === 'english') {
      const soundButton = document.createElement('button');
      soundButton.type = 'button';
      soundButton.className = 'memory-card-sound';
      soundButton.setAttribute('aria-label', `השמיעו ${card.english}`);
      soundButton.title = `השמיעו ${card.english}`;
      soundButton.tabIndex = -1;
      soundButton.textContent = '🔊';
      soundButton.addEventListener('click', (event) => {
        event.stopPropagation();
        speakMemoryWord(card.english);
      });
      soundButton.addEventListener('keydown', (event) => {
        event.stopPropagation();
      });
      front.append(soundButton);
    }

    button.append(back, front);
    button.addEventListener('click', () => handleMemoryCardClick(button));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleMemoryCardClick(button);
      }
    });
    board.append(button);
  });
}

function handleMemoryCardClick(cardButton: HTMLDivElement) {
  if (memoryLocked || cardButton.classList.contains('is-face-up') || cardButton.classList.contains('is-matched')) {
    return;
  }

  revealMemoryCard(cardButton);

  if (!memoryFirstCard) {
    memoryFirstCard = cardButton;
    updateMemoryStatus('בחרו את הזוג שלו');
    return;
  }

  memorySecondCard = cardButton;
  memoryLocked = true;

  const isMatch =
    memoryFirstCard.dataset.wordId === memorySecondCard.dataset.wordId &&
    memoryFirstCard.dataset.kind !== memorySecondCard.dataset.kind;

  if (isMatch) {
    matchMemoryCards();
  } else {
    updateMemoryStatus('כמעט. נסו שוב');
    memoryMismatchTimer = window.setTimeout(closeUnmatchedMemoryCards, 850);
  }
}

function revealMemoryCard(cardButton: HTMLDivElement) {
  cardButton.classList.add('is-face-up');
  cardButton.setAttribute('aria-label', cardButton.textContent?.trim() || 'קלף פתוח');
  setMemorySoundButtonFocus(cardButton, true);
}

function matchMemoryCards() {
  const firstCard = memoryFirstCard as HTMLDivElement;
  const secondCard = memorySecondCard as HTMLDivElement;
  const wordId = firstCard.dataset.wordId as string;

  firstCard.classList.add('is-matched');
  secondCard.classList.add('is-matched');
  firstCard.removeAttribute('tabindex');
  secondCard.removeAttribute('tabindex');
  setMemorySoundButtonFocus(firstCard, true);
  setMemorySoundButtonFocus(secondCard, true);
  memoryMatchedPairs.add(wordId);

  const matchedWord = MEMORY_WORDS.find((word) => word.id === wordId) as MemoryWord;
  const pairCount = activeMemoryLevel.pairs;
  const isComplete = memoryMatchedPairs.size === pairCount;
  const message = isComplete ? `${activeMemoryLevel.title} הושלם!` : `${matchedWord.hebrew} = ${matchedWord.english}`;

  memoryFirstCard = null;
  memorySecondCard = null;
  memoryLocked = false;
  if (isComplete) {
    saveMemoryLevelStars(activeMemoryLevel.id, 3);
    showMemoryCelebration();
    clearMemoryWinReturnTimer();
    memoryWinReturnTimer = window.setTimeout(() => {
      returnToMemoryMapAfterWin();
    }, MEMORY_WIN_RETURN_DELAY_MS);
  }
  updateMemoryStatus(message);
  if (!isComplete) {
    showMemoryToast(matchedWord);
  }
}

function closeUnmatchedMemoryCards() {
  memoryMismatchTimer = null;

  if (!memoryFirstCard || !memorySecondCard || !memoryFirstCard.isConnected || !memorySecondCard.isConnected) {
    memoryFirstCard = null;
    memorySecondCard = null;
    memoryLocked = false;
    return;
  }

  const firstCard = memoryFirstCard;
  const secondCard = memorySecondCard;

  firstCard.classList.remove('is-face-up');
  secondCard.classList.remove('is-face-up');
  firstCard.setAttribute('aria-label', 'קלף זיכרון סגור');
  secondCard.setAttribute('aria-label', 'קלף זיכרון סגור');
  setMemorySoundButtonFocus(firstCard, false);
  setMemorySoundButtonFocus(secondCard, false);

  memoryFirstCard = null;
  memorySecondCard = null;
  memoryLocked = false;
  updateMemoryStatus('הפכו שני קלפים שמתחברים');
}

function clearMemoryMismatchTimer() {
  if (memoryMismatchTimer) {
    clearTimeout(memoryMismatchTimer);
    memoryMismatchTimer = null;
  }
}

function clearMemoryWinReturnTimer() {
  if (memoryWinReturnTimer) {
    clearTimeout(memoryWinReturnTimer);
    memoryWinReturnTimer = null;
  }
}

function updateMemoryStatus(message: string) {
  const pairCount = activeMemoryLevel.pairs;
  requireElement<HTMLDivElement>('memory-progress').textContent = `${memoryMatchedPairs.size} מתוך ${pairCount} זוגות`;
  requireElement<HTMLDivElement>('memory-message').textContent = message;
}

function readMemoryLevelProgress(): Record<string, Partial<Record<MemoryLevelId, number>>> {
  return JSON.parse(localStorage.getItem(MEMORY_LEVEL_PROGRESS_STORAGE_KEY) || '{}');
}

function getMemoryLevelStars(levelId: MemoryLevelId) {
  const progress = readMemoryLevelProgress();
  return progress[activeProfileId]?.[levelId] || 0;
}

function deriveMemoryCurrentLevelId(): MemoryLevelId {
  const firstIncomplete = MEMORY_LEVELS.find(
    (level) => !level.locked && getMemoryLevelStars(level.id) === 0
  );
  if (firstIncomplete) {
    return firstIncomplete.id;
  }

  const lastUnlocked = [...MEMORY_LEVELS].reverse().find((level) => !level.locked);
  return lastUnlocked?.id || MEMORY_LEVELS[0].id;
}

function saveMemoryLevelStars(levelId: MemoryLevelId, stars: number) {
  const progress = readMemoryLevelProgress();
  const profileProgress = progress[activeProfileId] || {};
  profileProgress[levelId] = Math.max(profileProgress[levelId] || 0, stars);
  progress[activeProfileId] = profileProgress;
  localStorage.setItem(MEMORY_LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  renderMemoryLevelMap();
}

function renderMemoryLevelMap() {
  const map = document.getElementById('memory-level-map') as HTMLElement | null;
  if (!map) {
    return;
  }

  map.innerHTML = '';
  updateMemoryStarsBadge();

  const trail = document.createElement('div');
  trail.className = 'memory-level-trail';

  renderMemoryMapScenery(trail);
  renderMemoryMapAreas(trail);
  renderMemoryLevelPath(trail);

  const currentLevelId = deriveMemoryCurrentLevelId();

  MEMORY_LEVELS.forEach((level, index) => {
    const stars = getMemoryLevelStars(level.id);
    const isCurrent = !level.locked && level.id === currentLevelId && stars === 0;
    const point = MEMORY_ROUTE_POINTS[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-level-node';
    button.classList.toggle('is-playable', !level.locked);
    button.classList.toggle('is-complete', stars > 0);
    button.classList.toggle('is-current', isCurrent);
    button.classList.toggle('is-locked', level.locked);
    button.dataset.level = level.id;
    button.disabled = level.locked;
    button.setAttribute('aria-label', level.locked ? `${level.title}, נעול` : `${level.title}, ${level.pairs} זוגות`);
    button.addEventListener('click', () => startMemoryLevel(level.id));

    const number = document.createElement('span');
    number.className = 'memory-level-number';
    number.textContent = String(index + 1);

    const icon = document.createElement('span');
    icon.className = 'memory-level-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = level.icon;

    if (level.locked) {
      button.append(number, icon);
    } else {
      const copy = document.createElement('span');
      copy.className = 'memory-level-copy';

      const title = document.createElement('strong');
      title.textContent = level.title;

      const subtitle = document.createElement('small');
      subtitle.textContent = `${level.pairs} זוגות`;

      copy.append(title, subtitle);

      const starRow = document.createElement('span');
      starRow.className = 'memory-level-stars';
      starRow.setAttribute('aria-label', `${stars} מתוך 3 כוכבים`);

      for (let starIndex = 1; starIndex <= 3; starIndex++) {
        const star = document.createElement('span');
        star.className = 'memory-level-star';
        star.classList.toggle('is-filled', starIndex <= stars);
        star.textContent = '★';
        starRow.append(star);
      }

      button.append(number, icon, copy, starRow);
    }

    if (isCurrent) {
      const marker = document.createElement('span');
      marker.className = 'memory-level-current-marker';
      marker.textContent = `${getActiveProfile().emoji} הבא`;
      button.append(marker);
    }

    if (level.reward) {
      const reward = document.createElement('span');
      reward.className = 'memory-level-reward';
      reward.setAttribute('aria-hidden', 'true');
      reward.textContent = level.reward;
      button.append(reward);
    }

    const stop = document.createElement('div');
    stop.className = `memory-level-stop memory-level-stop-${index + 1}`;
    stop.style.left = `${point.x}%`;
    stop.style.top = `${point.y}%`;
    stop.append(button);
    trail.append(stop);
  });

  renderMemorySpriteMarker(trail, currentLevelId);
  map.append(trail);
}

function updateMemoryStarsBadge() {
  const count = document.getElementById('memory-stars-count');
  if (!count) {
    return;
  }

  const earnedStars = MEMORY_LEVELS
    .filter((level) => !level.locked)
    .reduce((sum, level) => sum + getMemoryLevelStars(level.id), 0);
  const availableStars = MEMORY_LEVELS.filter((level) => !level.locked).length * 3;
  count.textContent = `${earnedStars}/${availableStars}`;
}

function renderMemoryMapAreas(trail: HTMLDivElement) {
  MEMORY_MAP_AREAS.forEach((area) => {
    const label = document.createElement('span');
    label.className = `memory-map-area-label memory-map-area-label-${area.tone}`;
    label.textContent = area.label;
    label.style.left = `${area.x}%`;
    label.style.top = `${area.y}%`;
    trail.append(label);
  });
}

function renderMemoryMapScenery(trail: HTMLDivElement) {
  const props = [
    { className: 'memory-scenery-gate', text: '⌂', x: 12, y: 28 },
    { className: 'memory-scenery-cloud memory-scenery-cloud-1', text: '', x: 26, y: 54 },
    { className: 'memory-scenery-cloud memory-scenery-cloud-2', text: '', x: 88, y: 17 },
    { className: 'memory-scenery-flowerbed memory-scenery-flowerbed-1', text: '', x: 56, y: 23 },
    { className: 'memory-scenery-flowerbed memory-scenery-flowerbed-2', text: '', x: 42, y: 78 },
    { className: 'memory-scenery-chest memory-scenery-chest-1', text: '🎁', x: 8, y: 82 },
    { className: 'memory-scenery-chest memory-scenery-chest-2', text: '🎁', x: 82, y: 22 },
    { className: 'memory-scenery-bubble memory-scenery-bubble-1', text: '', x: 50, y: 18 },
    { className: 'memory-scenery-bubble memory-scenery-bubble-2', text: '', x: 74, y: 43 },
    { className: 'memory-scenery-bubble memory-scenery-bubble-3', text: '', x: 33, y: 20 },
  ];

  props.forEach((prop) => {
    const item = document.createElement('span');
    item.className = `memory-scenery ${prop.className}`;
    item.setAttribute('aria-hidden', 'true');
    item.textContent = prop.text;
    item.style.left = `${prop.x}%`;
    item.style.top = `${prop.y}%`;
    trail.append(item);
  });
}

function renderMemoryLevelPath(trail: HTMLDivElement) {
  const pathSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  pathSvg.setAttribute('class', 'memory-level-path');
  pathSvg.setAttribute('viewBox', '0 0 100 100');
  pathSvg.setAttribute('preserveAspectRatio', 'none');
  pathSvg.setAttribute('aria-hidden', 'true');

  const pathData = createMemoryRoutePath();
  const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shadow.setAttribute('class', 'memory-level-path-shadow');
  shadow.setAttribute('d', pathData);

  const road = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  road.setAttribute('class', 'memory-level-path-road');
  road.setAttribute('d', pathData);

  const frosting = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  frosting.setAttribute('class', 'memory-level-path-frosting');
  frosting.setAttribute('d', pathData);

  pathSvg.append(shadow, road, frosting);
  trail.append(pathSvg);

  MEMORY_ROUTE_POINTS.slice(0, -1).forEach((point, index) => {
    const nextPoint = MEMORY_ROUTE_POINTS[index + 1];
    const arrow = document.createElement('span');
    arrow.className = 'memory-level-path-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '›';
    arrow.style.left = `${(point.x + nextPoint.x) / 2}%`;
    arrow.style.top = `${(point.y + nextPoint.y) / 2}%`;
    arrow.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x)}rad)`;
    trail.append(arrow);
  });
}

function createMemoryRoutePath() {
  const points = MEMORY_ROUTE_POINTS;
  const commands = [`M ${points[0].x} ${points[0].y}`];

  for (let index = 1; index < points.length - 1; index++) {
    const point = points[index];
    const nextPoint = points[index + 1];
    const midX = (point.x + nextPoint.x) / 2;
    const midY = (point.y + nextPoint.y) / 2;
    commands.push(`Q ${point.x} ${point.y} ${midX} ${midY}`);
  }

  const lastPoint = points[points.length - 1];
  commands.push(`T ${lastPoint.x} ${lastPoint.y}`);
  return commands.join(' ');
}

function renderMemorySpriteMarker(trail: HTMLDivElement, levelId: MemoryLevelId) {
  const levelIndex = MEMORY_LEVELS.findIndex((level) => level.id === levelId);
  if (levelIndex < 0) {
    throw new Error(`Missing route point for ${levelId}`);
  }

  const point = MEMORY_ROUTE_POINTS[levelIndex];
  const sprite = document.createElement('span');
  sprite.className = 'memory-map-sprite';
  sprite.setAttribute('aria-hidden', 'true');
  sprite.style.left = `${point.x}%`;
  sprite.style.top = `${point.y}%`;
  sprite.innerHTML = `
    <span class="memory-map-sprite-shadow"></span>
    <span class="memory-map-sprite-body">
      <span class="memory-map-sprite-hair"></span>
      <span class="memory-map-sprite-face"></span>
      <span class="memory-map-sprite-bow"></span>
      <span class="memory-map-sprite-dress"></span>
    </span>
  `;
  trail.append(sprite);
}

function playMemoryMapReturnCue() {
  const map = requireElement<HTMLElement>('memory-level-map');
  map.classList.remove('is-returning');
  void map.offsetWidth;
  map.classList.add('is-returning');
  map.addEventListener('animationend', () => map.classList.remove('is-returning'), { once: true });
}

function returnToMemoryMapAfterWin() {
  clearMemoryWinReturnTimer();
  hideMemoryCelebration();
  showMemoryLevelMap();
  playMemoryMapReturnCue();
}

function setMemorySoundButtonFocus(cardButton: HTMLDivElement, isFocusable: boolean) {
  const soundButton = cardButton.querySelector<HTMLButtonElement>('.memory-card-sound');
  if (soundButton) {
    soundButton.tabIndex = isFocusable ? 0 : -1;
  }
}

function speakMemoryWord(word: string) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.82;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

function showMemoryToast(matchedWord: MemoryWord) {
  const toast = requireElement<HTMLDivElement>('memory-toast');
  const toastText = requireElement<HTMLSpanElement>('memory-toast-text');
  const name = p1Name.trim() || 'לוטם';
  toastText.textContent = `${name}, מצאת זוג: ${matchedWord.hebrew} = ${matchedWord.english}`;

  if (memoryToastTimer) {
    clearTimeout(memoryToastTimer);
  }

  toast.classList.remove('is-visible', 'is-complete');
  void toast.offsetWidth;
  toast.classList.add('is-visible');

  memoryToastTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible', 'is-complete');
    memoryToastTimer = null;
  }, 3000);
}

function showMemoryCelebration() {
  const celebration = requireElement<HTMLDivElement>('memory-celebration');
  const subtitle = requireElement<HTMLDivElement>('memory-celebration-subtitle');
  const profile = getActiveProfile().name;
  subtitle.textContent = `${profile}, ${activeMemoryLevel.title} הושלם עם 3 כוכבים`;

  requireElement<HTMLElement>('memory-game-area').classList.add('is-completing');
  celebration.classList.add('is-visible');
  celebration.setAttribute('aria-hidden', 'false');
}

function hideMemoryCelebration() {
  const celebration = document.getElementById('memory-celebration');
  if (celebration) {
    celebration.classList.remove('is-visible');
    celebration.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('memory-game-area')?.classList.remove('is-completing');
}

function hideMemoryToast() {
  if (memoryToastTimer) {
    clearTimeout(memoryToastTimer);
    memoryToastTimer = null;
  }

  document.getElementById('memory-toast')?.classList.remove('is-visible', 'is-complete');
}

// ==================== WORLD CAROUSEL (Infinite Loop) ====================
function setupWorldCarousel() {
  const track = document.querySelector('.carousel-track') as HTMLElement;
  const originalCards = Array.from(document.querySelectorAll('.carousel-card'));
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const viewport = document.querySelector('.carousel-viewport') as HTMLElement;

  if (!track || originalCards.length === 0) return;

  const totalOriginal = originalCards.length;
  const themes = originalCards.map((card) => (card as HTMLElement).dataset.theme!);

  // Clone cards for infinite effect
  // We want the track layout to be:
  // [clone-of-6, clone-of-7, orig-0, orig-1, ..., orig-7, clone-of-0, clone-of-1]
  // So when scrolling LEFT from orig-0, we see clone-of-7 (Castle), then snap to real orig-7
  
  // Prepend: first prepend clone-of-6, then prepend clone-of-7
  // prepend(A) then prepend(B) results in [B, A, ...originals]
  // So we prepend in order: 6, then 7 -> gives us [7, 6, ...] which is wrong
  // We need to prepend 7 first, then 6 -> gives us [6, 7, ...]
  const cloneSecondLast = originalCards[totalOriginal - 2].cloneNode(true) as HTMLElement;
  cloneSecondLast.classList.add('carousel-clone');
  cloneSecondLast.setAttribute('data-clone-of', String(totalOriginal - 2));
  
  const cloneLast = originalCards[totalOriginal - 1].cloneNode(true) as HTMLElement;
  cloneLast.classList.add('carousel-clone');
  cloneLast.setAttribute('data-clone-of', String(totalOriginal - 1));
  
  // Prepend in reverse order: last first, then second-to-last
  // This gives us: [second-to-last, last, ...originals]
  track.prepend(cloneLast);        // [7, orig-0, orig-1, ...]
  track.prepend(cloneSecondLast);  // [6, 7, orig-0, orig-1, ...]
  
  // Append clones of first cards
  const cloneFirst = originalCards[0].cloneNode(true) as HTMLElement;
  cloneFirst.classList.add('carousel-clone');
  cloneFirst.setAttribute('data-clone-of', '0');
  track.append(cloneFirst);
  
  const cloneSecond = originalCards[1].cloneNode(true) as HTMLElement;
  cloneSecond.classList.add('carousel-clone');
  cloneSecond.setAttribute('data-clone-of', '1');
  track.append(cloneSecond);

  // Track layout is now:
  // Index: 0=clone-of-6, 1=clone-of-7, 2=orig-0, 3=orig-1, ..., 9=orig-7, 10=clone-of-0, 11=clone-of-1
  const clonesPerSide = 2;

  // Get all cards including clones
  const allCards = Array.from(track.querySelectorAll('.carousel-card'));
  
  // Current position in the extended array (starts at first real card)
  let currentPosition = clonesPerSide; // Start at orig-0 (index 2)
  let isAnimating = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let previewTimeout: number | null = null;

  // Load saved theme and set initial position
  const savedTheme = localStorage.getItem('bubble_background_theme');
  if (savedTheme) {
    const savedIndex = themes.indexOf(savedTheme);
    if (savedIndex !== -1) {
      currentPosition = savedIndex + clonesPerSide;
    }
  }

  function getCardMetrics() {
    const card = allCards[0] as HTMLElement;
    const cardWidth = card.offsetWidth;
    const gap = parseInt(getComputedStyle(track).gap) || 15;
    const viewportWidth = viewport.offsetWidth;
    return { cardWidth, gap, viewportWidth, cardFullWidth: cardWidth + gap };
  }

  function getRealIndex(position: number): number {
    // Convert position in extended array to real index (0 to totalOriginal-1)
    const adjusted = position - clonesPerSide;
    return ((adjusted % totalOriginal) + totalOriginal) % totalOriginal;
  }

  function updateCarousel(animate = true) {
    if (!track || !viewport) return;

    const { cardWidth, viewportWidth, cardFullWidth } = getCardMetrics();
    
    // Center the current card
    const startOffset = (viewportWidth - cardWidth) / 2;
    const translateX = startOffset - (currentPosition * cardFullWidth);

    track.style.transition = animate ? 'transform 0.4s ease-out' : 'none';
    track.style.transform = `translateX(${translateX}px)`;

    const realIndex = getRealIndex(currentPosition);

    // Update active states on ALL cards (including clones showing same theme)
    allCards.forEach((card) => {
      const cardEl = card as HTMLElement;
      const cloneOf = cardEl.getAttribute('data-clone-of');
      const cardIndex = cloneOf !== null ? parseInt(cloneOf) : originalCards.indexOf(card);
      cardEl.classList.toggle('active', cardIndex === realIndex);
    });

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === realIndex);
    });

    // Update theme
    const theme = themes[realIndex] || 'classic';
    gameApp.setTheme(theme);
    localStorage.setItem('bubble_background_theme', theme);
  }

  function snapToRealPosition() {
    // If we're on a clone (outside the real range), instantly snap to the equivalent real card
    const minReal = clonesPerSide; // First real card position
    const maxReal = clonesPerSide + totalOriginal - 1; // Last real card position
    
    if (currentPosition < minReal) {
      // We're on a prepended clone, snap to the real card at the end
      currentPosition = currentPosition + totalOriginal;
      updateCarousel(false);
    } else if (currentPosition > maxReal) {
      // We're on an appended clone, snap to the real card at the start
      currentPosition = currentPosition - totalOriginal;
      updateCarousel(false);
    }
  }

  function goToPosition(newPosition: number) {
    if (isAnimating) return;
    isAnimating = true;

    currentPosition = newPosition;
    updateCarousel(true);

    // Trigger mascot bounce
    triggerMascotBounce();

    // After animation completes, snap to real position if on a clone
    setTimeout(() => {
      snapToRealPosition();
      isAnimating = false;
    }, 420); // Slightly longer than animation duration
  }

  function goToSlide(realIndex: number) {
    const targetPosition = realIndex + clonesPerSide;
    goToPosition(targetPosition);
  }

  function triggerMascotBounce() {
    const mascots = document.querySelectorAll('.mascot');
    mascots.forEach((mascot) => {
      mascot.classList.remove('bounce');
      void (mascot as HTMLElement).offsetWidth;
      mascot.classList.add('bounce');
    });
    setTimeout(() => {
      mascots.forEach((mascot) => mascot.classList.remove('bounce'));
    }, 500);
  }

  function goNext() {
    goToPosition(currentPosition + 1);
  }

  function goPrev() {
    goToPosition(currentPosition - 1);
  }

  // Preview theme on hover
  function previewTheme(theme: string) {
    if (previewTimeout) clearTimeout(previewTimeout);
    previewTimeout = window.setTimeout(() => {
      gameApp.setTheme(theme);
    }, 150);
  }

  function cancelPreview() {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }
    const realIndex = ((currentPosition - clonesPerSide) % totalOriginal + totalOriginal) % totalOriginal;
    gameApp.setTheme(themes[realIndex] || 'classic');
  }

  // Click handlers
  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // Card click handlers (including clones)
  allCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const cardEl = card as HTMLElement;
      const cloneOf = cardEl.getAttribute('data-clone-of');
      if (cloneOf !== null) {
        // Clicked a clone - go to the real card
        goToSlide(parseInt(cloneOf));
      } else {
        // Clicked real card - go directly to its position
        goToPosition(index);
      }
    });

    card.addEventListener('mouseenter', () => {
      const theme = (card as HTMLElement).dataset.theme || 'classic';
      previewTheme(theme);
    });

    card.addEventListener('mouseleave', cancelPreview);
  });

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Touch support
  viewport?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  viewport?.addEventListener('touchmove', (e) => {
    touchEndX = e.touches[0].clientX;
  }, { passive: true });

  viewport?.addEventListener('touchend', () => {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goPrev() : goNext(); // RTL swipe
    }
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('start-screen')?.classList.contains('active')) return;
    if (document.activeElement?.tagName === 'INPUT') return;

    if (e.key === 'ArrowRight') goPrev(); // RTL
    else if (e.key === 'ArrowLeft') goNext();
  });

  // Initialize
  updateCarousel(false);
}

// Game callbacks
gameApp.onScoreChange = (score) => {
  const el = document.getElementById('score-val');
  if (el) el.textContent = String(score);
};

gameApp.onTimeChange = (time) => {
  const el = document.getElementById('timer-val');
  if (el) el.textContent = String(time);
};

gameApp.onGameEnd = (score) => {
  showEndScreen(score);
};

// Initialize
gameApp.init().then(() => {
  loadPreferences();
  setupUI();
  loadHighScores();
});
