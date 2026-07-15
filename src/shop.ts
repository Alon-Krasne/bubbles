import { COLOR_VOCAB_WORDS, VOCAB_WORDS, type VocabWord } from './words';
import type { HostedActivitySession } from './hostedActivity';
import { calculateMasteryStars } from '../prototype/shared/activity-scoring.mjs';

export interface ShopProfile {
  id: string;
  name: string;
  emoji: string;
  language?: 'en' | 'he';
}

export interface ShopDeps {
  showScreen: (screenId: 'shop-screen') => void;
  getActiveProfile: () => ShopProfile;
  returnToGameSelect: () => void;
  hostedSession: HostedActivitySession | null;
}

export type ShopItem = VocabWord;

export type ShopLevelId = 'shop-level-1' | 'shop-level-2' | 'shop-level-3' | 'shop-level-4' | 'shop-level-5';
type ShopLevelMode = 'single' | 'quantity' | 'color' | 'double';

interface ShopLevel {
  id: ShopLevelId;
  title: string;
  subtitle: string;
  icon: string;
  customerCount: number;
  shelfSize: number;
  mode: ShopLevelMode;
}

interface ShopOrderTarget {
  item: ShopItem;
  required: number;
  served: number;
}

interface ShopOrder {
  sentence: string;
  shelfItems: ShopItem[];
  targets: ShopOrderTarget[];
}

const SHOP_LEVEL_PROGRESS_STORAGE_KEY = 'bubble_shop_levels';
const SHOP_COINS_STORAGE_KEY = 'bubble_shop_coins';
const SHOP_SPEECH_RATE = 0.72;
const SHOP_WIN_RETURN_DELAY_MS = 2400;
const SHOP_CUSTOMER_EMOJIS = ['🐰', '🐻', '🐱', '🦊', '🐸', '🐼', '🐵', '🐨'];
const SHOP_CUSTOMER_NAMES = ['נוני', 'מימי', 'קוקו', 'לילי', 'פופי', 'טופי', 'קיקי', 'בוני'];
const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
};
const MASS_ITEMS = new Set([
  'bread',
  'cheese',
  'chocolate',
  'corn',
  'fries',
  'grapes',
  'honey',
  'ice-cream',
  'milk',
  'rice',
  'scissors',
  'soup',
  'spaghetti',
  'water',
]);
const PLURALS: Record<string, string> = {
  cherry: 'cherries',
  cherries: 'cherries',
  peach: 'peaches',
  potato: 'potatoes',
  strawberry: 'strawberries',
  tomato: 'tomatoes',
};
const SHOP_ITEMS: ShopItem[] = VOCAB_WORDS.filter((word) => word.shoppable && word.category !== 'colors');
const COLOR_ITEMS: ShopItem[] = COLOR_VOCAB_WORDS;
const SHOP_LEVEL_1_ITEM_IDS = ['banana', 'apple', 'milk', 'bread'];
const SHOP_LEVEL_2_ITEM_IDS = [
  'banana',
  'apple',
  'milk',
  'bread',
  'egg',
  'cheese',
  'water',
  'cake',
  'cookie',
  'orange',
  'strawberry',
  'carrot',
  'tomato',
  'ball',
  'book',
  'hat',
  'shoe',
  'cup',
];
const SHOP_QUANTITY_ITEM_IDS = [
  'banana',
  'apple',
  'egg',
  'cake',
  'cookie',
  'orange',
  'strawberry',
  'carrot',
  'tomato',
  'potato',
  'mushroom',
  'pear',
  'peach',
  'doughnut',
];
const SHOP_DOUBLE_ITEM_IDS = [
  'banana',
  'apple',
  'milk',
  'bread',
  'egg',
  'cheese',
  'water',
  'cake',
  'cookie',
  'ice-cream',
  'orange',
  'strawberry',
  'carrot',
  'tomato',
  'corn',
  'pizza',
  'sandwich',
  'ball',
  'book',
  'hat',
  'shoe',
  'cup',
];

const SHOP_LEVELS: ShopLevel[] = [
  {
    id: 'shop-level-1',
    title: 'קונים ראשונים',
    subtitle: '5 קונים, 4 פריטים',
    icon: '🍌',
    customerCount: 5,
    shelfSize: 4,
    mode: 'single',
  },
  {
    id: 'shop-level-2',
    title: 'החנות מתמלאת',
    subtitle: '6 קונים, 6 פריטים',
    icon: '🥛',
    customerCount: 6,
    shelfSize: 6,
    mode: 'single',
  },
  {
    id: 'shop-level-3',
    title: 'אחת, שתיים, שלוש',
    subtitle: 'כמויות של 1-3',
    icon: '🍎',
    customerCount: 6,
    shelfSize: 6,
    mode: 'quantity',
  },
  {
    id: 'shop-level-4',
    title: 'צבעים בחנות',
    subtitle: 'מקשיבים לצבע',
    icon: '💙',
    customerCount: 6,
    shelfSize: 8,
    mode: 'color',
  },
  {
    id: 'shop-level-5',
    title: 'הזמנה כפולה',
    subtitle: 'שני פריטים לקונה',
    icon: '🛒',
    customerCount: 6,
    shelfSize: 6,
    mode: 'double',
  },
];

export function speakEnglish(text: string, rate = SHOP_SPEECH_RATE) {
  speakText(text, 'en', rate);
}

function speakText(text: string, language: 'en' | 'he', rate = SHOP_SPEECH_RATE) {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'en' ? 'en-US' : 'he-IL';
  utterance.rate = rate;
  utterance.pitch = 1.08;

  const voices = synth.getVoices();
  const languagePrefix = language === 'en' ? 'en' : 'he';
  const voice = voices.find((candidate) => candidate.lang.toLowerCase().startsWith(languagePrefix));
  if (voice) {
    utterance.voice = voice;
  }

  synth.speak(utterance);
}

export function initShopGame(deps: ShopDeps) {
  const state = {
    activeLevel: SHOP_LEVELS[0],
    currentOrder: null as ShopOrder | null,
    servedCustomers: 0,
    mistakes: 0,
    roundCoins: 0,
    locked: false,
    customerEmoji: SHOP_CUSTOMER_EMOJIS[0],
    customerName: SHOP_CUSTOMER_NAMES[0],
    timers: [] as number[],
  };

  const levelMap = requireElement<HTMLElement>('shop-level-map');
  const gameArea = requireElement<HTMLElement>('shop-game-area');
  const trail = requireElement<HTMLDivElement>('shop-level-trail');
  const shelves = requireElement<HTMLDivElement>('shop-shelves');
  const celebration = requireElement<HTMLDivElement>('shop-celebration');

  requireElement<HTMLButtonElement>('shop-back-btn').addEventListener('click', () => {
    leaveShop();
    if (deps.hostedSession) {
      deps.hostedSession.exit();
      return;
    }
    deps.returnToGameSelect();
  });
  requireElement<HTMLButtonElement>('shop-level-list-btn').addEventListener('click', returnFromShopGame);
  requireElement<HTMLButtonElement>('shop-replay-btn').addEventListener('click', replayOrder);
  requireElement<HTMLButtonElement>('shop-order-replay-btn').addEventListener('click', replayOrder);
  requireElement<HTMLButtonElement>('shop-celebration-next-btn').addEventListener('click', finishShopCelebration);

  function openShop() {
    deps.showScreen('shop-screen');
    renderLevelList();
    showLevelList();
  }

  function openLevel(levelId: ShopLevelId) {
    deps.showScreen('shop-screen');
    if (deps.hostedSession) {
      requireElement<HTMLButtonElement>('shop-level-list-btn').hidden = true;
      const celebrationButton = requireElement<HTMLButtonElement>('shop-celebration-next-btn');
      celebrationButton.textContent = 'חזרה למסלול';
      celebrationButton.setAttribute('aria-label', 'חזרה למסלול');
      const backButton = requireElement<HTMLButtonElement>('shop-back-btn');
      backButton.querySelector<HTMLElement>('span:last-child')!.textContent = 'חזרה למסלול';
      backButton.setAttribute('aria-label', 'חזרה למסלול');
      backButton.title = 'חזרה למסלול';
    }
    startLevel(levelId);
  }

  function leaveShop() {
    clearShopTimers();
    hideCelebration();
    stopSpeech();
    state.currentOrder = null;
    state.locked = false;
  }

  function showLevelList() {
    levelMap.classList.remove('hidden');
    gameArea.classList.add('hidden');
    renderLevelList();
  }

  function returnToLevelList() {
    clearShopTimers();
    hideCelebration();
    stopSpeech();
    showLevelList();
  }

  function returnFromShopGame() {
    if (deps.hostedSession) {
      leaveShop();
      deps.hostedSession.exit();
      return;
    }
    returnToLevelList();
  }

  function finishShopCelebration() {
    if (deps.hostedSession) {
      deps.hostedSession.complete(calculateMasteryStars({
        mistakes: state.mistakes,
        challengeSize: state.activeLevel.customerCount,
        solutionHints: 0,
      }));
      return;
    }
    returnToLevelList();
  }

  function renderLevelList() {
    const profile = deps.getActiveProfile();
    requireElement<HTMLElement>('shop-profile-badge').textContent = `${profile.name} משחק/ת`;
    updateCoinBadges();

    trail.innerHTML = '';
    const currentLevelId = deriveCurrentLevelId();

    SHOP_LEVELS.forEach((level, index) => {
      const stars = getLevelStars(level.id);
      const isLocked = isLevelLocked(index);
      const isCurrent = !isLocked && level.id === currentLevelId && stars === 0;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shop-level-node';
      button.classList.toggle('is-locked', isLocked);
      button.classList.toggle('is-complete', stars > 0);
      button.classList.toggle('is-current', isCurrent);
      button.disabled = isLocked;
      button.setAttribute('aria-label', isLocked ? `${level.title}, נעול` : `${level.title}, ${level.subtitle}`);
      button.addEventListener('click', () => startLevel(level.id));

      const icon = document.createElement('span');
      icon.className = 'shop-level-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = isLocked ? '🔒' : level.icon;

      const copy = document.createElement('span');
      copy.className = 'shop-level-copy';
      const title = document.createElement('strong');
      title.textContent = level.title;
      const subtitle = document.createElement('small');
      subtitle.textContent = level.subtitle;
      copy.append(title, subtitle);

      const starRow = document.createElement('span');
      starRow.className = 'shop-level-stars';
      starRow.setAttribute('aria-label', `${stars} מתוך 3 כוכבים`);
      for (let starIndex = 1; starIndex <= 3; starIndex++) {
        const star = document.createElement('span');
        star.className = 'shop-level-star';
        star.classList.toggle('is-filled', starIndex <= stars);
        star.textContent = '★';
        starRow.append(star);
      }

      button.append(icon, copy, starRow);
      trail.append(button);
    });
  }

  function startLevel(levelId: ShopLevelId) {
    const level = SHOP_LEVELS.find((candidate) => candidate.id === levelId);
    if (!level) {
      throw new Error(`Missing shop level ${levelId}`);
    }

    state.activeLevel = level;
    state.currentOrder = null;
    state.servedCustomers = 0;
    state.mistakes = 0;
    state.roundCoins = 0;
    state.locked = false;
    requireElement<HTMLElement>('shop-profile-badge').textContent = `${deps.getActiveProfile().name} משחק/ת`;
    clearShopTimers();
    hideCelebration();
    levelMap.classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameArea.classList.remove('is-completing');
    requireElement<HTMLElement>('shop-game-level-title').textContent = level.title;
    setFeedback('קונה חדש/ה בדרך לחנות');
    updateHud();
    nextCustomer();
  }

  function nextCustomer() {
    if (state.servedCustomers >= state.activeLevel.customerCount) {
      completeLevel();
      return;
    }

    state.locked = false;
    state.customerEmoji = randomFrom(SHOP_CUSTOMER_EMOJIS);
    state.customerName = randomFrom(SHOP_CUSTOMER_NAMES);
    state.currentOrder = createOrder();
    renderCustomer();
    renderShelves();
    renderBasket();
    setFeedback('הקשיבו להזמנה ובחרו מהמדף');
    updateHud();
    scheduleTimer(() => speakOrder(), 600);
  }

  function renderCustomer() {
    requireElement<HTMLElement>('shop-customer-avatar').textContent = state.customerEmoji;
    requireElement<HTMLElement>('shop-customer-name').textContent = state.customerName;
    requireElement<HTMLElement>('shop-order-prompt').textContent = 'אני רוצה בבקשה...';
    requireElement<HTMLElement>('shop-customer-card').classList.remove('is-happy', 'is-leaving');
  }

  function renderShelves() {
    const order = requireCurrentOrder();
    const learningLanguage = getLearningLanguage();
    shelves.innerHTML = '';
    shelves.style.setProperty('--shop-shelf-columns', String(Math.min(4, order.shelfItems.length)));

    order.shelfItems.forEach((item) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'shop-item-tile';
      tile.dataset.itemId = item.id;
      tile.setAttribute('aria-label', learningLanguage === 'he' ? item.hebrew : item.english);

      const choice = document.createElement('span');
      if (learningLanguage === 'he') {
        choice.className = 'shop-item-word';
        choice.dir = 'rtl';
        choice.textContent = item.hebrew;
      } else {
        choice.className = 'shop-item-drawing';
        choice.setAttribute('aria-hidden', 'true');
        choice.textContent = item.drawing;
      }

      tile.append(choice);
      tile.addEventListener('click', () => selectItem(item, tile));
      shelves.append(tile);
    });
  }

  function selectItem(item: ShopItem, tile: HTMLButtonElement) {
    if (state.locked) {
      return;
    }

    const order = requireCurrentOrder();
    const target = order.targets.find((candidate) => candidate.item.id === item.id && candidate.served < candidate.required);
    if (!target) {
      state.mistakes += 1;
      tile.classList.remove('is-wrong');
      void tile.offsetWidth;
      tile.classList.add('is-wrong');
      setFeedback('כמעט. מקשיבים שוב');
      updateHud();
      scheduleTimer(() => speakOrder(), 180);
      return;
    }

    target.served += 1;
    state.roundCoins += 1;
    if (!deps.hostedSession) {
      saveCoins(getCoins() + 1);
    }
    animateCorrectTile(tile, item);
    renderBasket();
    updateHud();

    if (isOrderComplete(order)) {
      state.locked = true;
      state.servedCustomers += 1;
      setFeedback('תודה רבה!');
      requireElement<HTMLElement>('shop-customer-card').classList.add('is-happy');
      scheduleTimer(() => speakText(createConfirmationSentence(item, getLearningLanguage()), getLearningLanguage()), 120);
      scheduleTimer(() => speakText(createThankYouSentence(getLearningLanguage()), getLearningLanguage()), 1120);
      scheduleTimer(() => {
        requireElement<HTMLElement>('shop-customer-card').classList.add('is-leaving');
      }, 1460);
      scheduleTimer(() => nextCustomer(), 1860);
    } else {
      setFeedback('יפה! ממשיכים למלא את הסל');
      speakText(createConfirmationSentence(item, getLearningLanguage()), getLearningLanguage());
    }
  }

  function animateCorrectTile(tile: HTMLButtonElement, item: ShopItem) {
    tile.classList.remove('is-correct');
    void tile.offsetWidth;
    tile.classList.add('is-correct');

    const basket = requireElement<HTMLElement>('shop-basket');
    const tileRect = tile.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();
    const fly = document.createElement('span');
    fly.className = 'shop-fly-item';
    fly.classList.toggle('is-word', getLearningLanguage() === 'he');
    fly.textContent = getLearningLanguage() === 'he' ? item.hebrew : item.drawing;
    fly.style.setProperty('--shop-fly-x', `${basketRect.left + basketRect.width / 2 - tileRect.left - tileRect.width / 2}px`);
    fly.style.setProperty('--shop-fly-y', `${basketRect.top + basketRect.height / 2 - tileRect.top - tileRect.height / 2}px`);
    tile.append(fly);
    fly.addEventListener('animationend', () => fly.remove(), { once: true });
  }

  function renderBasket() {
    const basket = requireElement<HTMLElement>('shop-basket');
    const order = state.currentOrder;
    if (!order) {
      basket.textContent = '🧺';
      return;
    }

    basket.innerHTML = '';
    const basketIcon = document.createElement('span');
    basketIcon.className = 'shop-basket-icon';
    basketIcon.textContent = '🧺';
    basket.append(basketIcon);

    order.targets.forEach((target) => {
      const itemProgress = document.createElement('span');
      itemProgress.className = 'shop-basket-item';
      // Keep the requested item hidden until it has been served,
      // so the basket never reveals the answer before listening or reading.
      const servedItem = getLearningLanguage() === 'he' ? target.item.hebrew : target.item.drawing;
      itemProgress.textContent = `${target.served > 0 ? servedItem : '❓'} ${target.served}/${target.required}`;
      basket.append(itemProgress);
    });
  }

  function updateHud() {
    const level = state.activeLevel;
    requireElement<HTMLElement>('shop-served-progress').textContent = `🧺 ${state.servedCustomers}/${level.customerCount}`;
    requireElement<HTMLElement>('shop-round-coins').textContent = `🪙 ${getDisplayedCoins()}`;

    const order = state.currentOrder;
    if (!order) {
      requireElement<HTMLElement>('shop-basket-progress').textContent = 'סל ריק';
      return;
    }

    const served = order.targets.reduce((sum, target) => sum + target.served, 0);
    const required = order.targets.reduce((sum, target) => sum + target.required, 0);
    requireElement<HTMLElement>('shop-basket-progress').textContent = `בסל ${served}/${required}`;
    updateCoinBadges();
  }

  function updateCoinBadges() {
    requireElement<HTMLElement>('shop-coins-count').textContent = String(getDisplayedCoins());
  }

  function setFeedback(message: string) {
    requireElement<HTMLElement>('shop-feedback').textContent = message;
  }

  function requireCurrentOrder() {
    if (!state.currentOrder) {
      throw new Error('Missing active shop order');
    }
    return state.currentOrder;
  }

  function replayOrder() {
    if (state.currentOrder) {
      speakOrder();
    }
  }

  function speakOrder() {
    speakText(requireCurrentOrder().sentence, getLearningLanguage());
  }

  function getLearningLanguage(): 'en' | 'he' {
    return deps.getActiveProfile().language ?? 'en';
  }

  function createLocalizedOrder(
    englishSentence: string,
    shelfItems: ShopItem[],
    targets: ShopOrderTarget[],
  ): ShopOrder {
    const sentence = getLearningLanguage() === 'en'
      ? englishSentence
      : createHebrewRequestSentence(targets);
    return { sentence, shelfItems, targets };
  }

  function completeLevel() {
    clearShopTimers();
    state.locked = true;
    const stars = calculateMasteryStars({
      mistakes: state.mistakes,
      challengeSize: state.activeLevel.customerCount,
      solutionHints: 0,
    });
    if (!deps.hostedSession) {
      saveLevelStars(state.activeLevel.id, stars);
      renderLevelList();
    }
    showCelebration(stars);
    scheduleTimer(() => {
      if (deps.hostedSession) {
        deps.hostedSession.complete(stars);
        return;
      }
      returnToLevelList();
    }, SHOP_WIN_RETURN_DELAY_MS);
  }

  function showCelebration(stars: number) {
    gameArea.classList.add('is-completing');
    requireElement<HTMLElement>('shop-celebration-stars').textContent = '⭐'.repeat(stars);
    requireElement<HTMLElement>('shop-celebration-subtitle').textContent =
      `${deps.getActiveProfile().name}, צברת ${stars} כוכבים ו-${state.roundCoins} מטבעות`;
    celebration.classList.add('is-visible');
    celebration.setAttribute('aria-hidden', 'false');
  }

  function hideCelebration() {
    celebration.classList.remove('is-visible');
    celebration.setAttribute('aria-hidden', 'true');
    gameArea.classList.remove('is-completing');
  }

  function createOrder(): ShopOrder {
    const level = state.activeLevel;
    if (level.id === 'shop-level-1' && state.servedCustomers === 0) {
      const banana = getShopItem('banana');
      return createLocalizedOrder(
        'Can I have a banana, please?',
        [banana, getShopItem('apple'), getShopItem('milk'), getShopItem('bread')],
        [{ item: banana, required: 1, served: 0 }],
      );
    }

    if (level.mode === 'color') {
      const target = randomFrom(COLOR_ITEMS);
      return createLocalizedOrder(
        createRequestSentence(definitePhrase(target)),
        createShelf(COLOR_ITEMS, [target], level.shelfSize),
        [{ item: target, required: 1, served: 0 }],
      );
    }

    if (level.mode === 'quantity') {
      const target = randomFrom(getShopItems(SHOP_QUANTITY_ITEM_IDS));
      const quantity = 1 + Math.floor(Math.random() * 3);
      return createLocalizedOrder(
        createRequestSentence(quantityPhrase(target, quantity)),
        createShelf(getShopItems(SHOP_LEVEL_2_ITEM_IDS), [target], level.shelfSize),
        [{ item: target, required: quantity, served: 0 }],
      );
    }

    if (level.mode === 'double') {
      const source = getShopItems(SHOP_DOUBLE_ITEM_IDS);
      const targets = shuffle(source).slice(0, 2);
      return createLocalizedOrder(
        createRequestSentence(`${indefinitePhrase(targets[0])} and ${indefinitePhrase(targets[1])}`),
        createShelf(source, targets, level.shelfSize),
        targets.map((item) => ({ item, required: 1, served: 0 })),
      );
    }

    const source = getShopItems(level.id === 'shop-level-2' ? SHOP_LEVEL_2_ITEM_IDS : SHOP_LEVEL_1_ITEM_IDS);
    const target = randomFrom(source);
    return createLocalizedOrder(
      createRequestSentence(indefinitePhrase(target)),
      createShelf(source, [target], level.shelfSize),
      [{ item: target, required: 1, served: 0 }],
    );
  }

  function isLevelLocked(index: number) {
    return index > 0 && getLevelStars(SHOP_LEVELS[index - 1].id) === 0;
  }

  function deriveCurrentLevelId() {
    const firstPlayable = SHOP_LEVELS.find((level, index) => !isLevelLocked(index) && getLevelStars(level.id) === 0);
    return firstPlayable?.id || SHOP_LEVELS[SHOP_LEVELS.length - 1].id;
  }

  function readLevelProgress(): Record<string, Partial<Record<ShopLevelId, number>>> {
    return JSON.parse(localStorage.getItem(SHOP_LEVEL_PROGRESS_STORAGE_KEY) || '{}');
  }

  function getLevelStars(levelId: ShopLevelId) {
    const progress = readLevelProgress();
    return progress[deps.getActiveProfile().id]?.[levelId] || 0;
  }

  function saveLevelStars(levelId: ShopLevelId, stars: number) {
    const progress = readLevelProgress();
    const profileId = deps.getActiveProfile().id;
    const profileProgress = progress[profileId] || {};
    profileProgress[levelId] = Math.max(profileProgress[levelId] || 0, stars);
    progress[profileId] = profileProgress;
    localStorage.setItem(SHOP_LEVEL_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }

  function getCoins() {
    const coins = JSON.parse(localStorage.getItem(SHOP_COINS_STORAGE_KEY) || '{}') as Record<string, number>;
    return coins[deps.getActiveProfile().id] || 0;
  }

  function getDisplayedCoins() {
    return deps.hostedSession ? state.roundCoins : getCoins();
  }

  function saveCoins(total: number) {
    const coins = JSON.parse(localStorage.getItem(SHOP_COINS_STORAGE_KEY) || '{}') as Record<string, number>;
    coins[deps.getActiveProfile().id] = total;
    localStorage.setItem(SHOP_COINS_STORAGE_KEY, JSON.stringify(coins));
  }

  function scheduleTimer(callback: () => void, delayMs: number) {
    const timerId = window.setTimeout(() => {
      state.timers = state.timers.filter((candidate) => candidate !== timerId);
      callback();
    }, delayMs);
    state.timers.push(timerId);
  }

  function clearShopTimers() {
    state.timers.forEach((timerId) => clearTimeout(timerId));
    state.timers = [];
  }

  return {
    openShop,
    openLevel,
    leaveShop,
  };
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing #${id}`);
  }
  return element as T;
}

function createShelf(source: ShopItem[], targets: ShopItem[], shelfSize: number) {
  const targetIds = new Set(targets.map((item) => item.id));
  const fillers = shuffle(source.filter((item) => !targetIds.has(item.id))).slice(0, shelfSize - targets.length);
  return shuffle([...targets, ...fillers]);
}

function createRequestSentence(phrase: string) {
  return randomFrom([
    `Can I have ${phrase}, please?`,
    `I want ${phrase}, please!`,
    `I would like ${phrase}, please.`,
    `Do you have ${phrase}?`,
  ]);
}

function createConfirmationSentence(item: ShopItem, language: 'en' | 'he') {
  if (language === 'he') {
    return `הנה ${item.hebrew}!`;
  }

  const phrase = item.category === 'colors' ? definitePhrase(item) : indefinitePhrase(item);
  const capitalizedPhrase = capitalize(phrase);
  const frames = [
    `Here you go! ${capitalizedPhrase}!`,
    `${capitalizedPhrase}! Great!`,
  ];

  if (!MASS_ITEMS.has(item.id)) {
    frames.push(`Yes! Here is ${phrase}.`);
  }

  return randomFrom(frames);
}

function createThankYouSentence(language: 'en' | 'he') {
  if (language === 'he') {
    return 'תודה רבה!';
  }

  return randomFrom([
    'Thank you! Goodbye!',
    'Thank you so much!',
    'Yay! Thank you!',
  ]);
}

function createHebrewRequestSentence(targets: ShopOrderTarget[]) {
  if (targets.length === 2) {
    return `אפשר בבקשה ${targets[0].item.hebrew} וגם ${targets[1].item.hebrew}?`;
  }

  const target = targets[0];
  return target.required === 1
    ? `אפשר בבקשה ${target.item.hebrew}?`
    : `אפשר בבקשה ${target.item.hebrew}, בכמות ${target.required}?`;
}

function indefinitePhrase(item: ShopItem) {
  if (MASS_ITEMS.has(item.id)) {
    return item.english;
  }

  const article = /^[aeiou]/i.test(item.english) ? 'an' : 'a';
  return `${article} ${item.english}`;
}

function definitePhrase(item: ShopItem) {
  return `the ${item.english}`;
}

function quantityPhrase(item: ShopItem, quantity: number) {
  return `${NUMBER_WORDS[quantity]} ${quantity === 1 ? item.english : pluralize(item.english)}`;
}

function pluralize(english: string) {
  const compact = english.replace(/\s+/g, '-');
  if (PLURALS[compact]) {
    return PLURALS[compact];
  }
  if (/[^aeiou]y$/i.test(english)) {
    return `${english.slice(0, -1)}ies`;
  }
  if (/(s|x|z|ch|sh)$/i.test(english)) {
    return `${english}es`;
  }
  return `${english}s`;
}

function isOrderComplete(order: ShopOrder) {
  return order.targets.every((target) => target.served >= target.required);
}

function getShopItem(id: string) {
  const item = SHOP_ITEMS.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`Missing shop item ${id}`);
  }
  return item;
}

function getShopItems(ids: string[]) {
  return ids.map(getShopItem);
}

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function capitalize(text: string) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
