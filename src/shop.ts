import { VOCAB_WORDS, type VocabWord } from './words';
import type { HostedActivitySession } from './hostedActivity';
import { calculateMasteryStars } from '../prototype/shared/activity-scoring.mjs';
import { GAME_LEVELS, getLanguagePolicy } from '../prototype/shared/trail-catalog.mjs';
import { drawVocabularyRound } from '../prototype/shared/vocabulary-deck.mjs';
import {
  playRecordedSequence,
  stopRecordedSpeech,
  vocabularyPluralAudio,
  vocabularyUiAudio,
  vocabularyWordAudio,
} from './recordedSpeech';

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
  itemPool: string[];
  difficultyRank: number;
}

interface ShopOrderTarget {
  item: ShopItem;
  required: number;
  served: number;
}

interface ShopOrder {
  sentence: string;
  audioSources: string[];
  shelfItems: ShopItem[];
  targets: ShopOrderTarget[];
}

interface SpokenPhrase {
  text: string;
  audioSources: string[];
}

interface EnglishRequest {
  sentence: string;
  audioSources: string[];
}

const SHOP_LEVEL_PROGRESS_STORAGE_KEY = 'bubble_shop_levels';
const SHOP_COINS_STORAGE_KEY = 'bubble_shop_coins';
const SHOP_WORD_DECK_STORAGE_KEY = 'bubble_shop_word_decks_v1';
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
  'glue',
  'honey',
  'ice-cream',
  'milk',
  'paper',
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
const SHOP_ITEMS: ShopItem[] = VOCAB_WORDS.filter((word) => word.shoppable);

const SHOP_LEVELS = GAME_LEVELS.shop as readonly ShopLevel[];

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
    stopRecordedSpeech();
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
    stopRecordedSpeech();
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
      const stars = calculateMasteryStars({
        mistakes: state.mistakes,
        challengeSize: state.activeLevel.customerCount,
        solutionHints: 0,
      });
      leaveShop();
      deps.hostedSession.complete(stars);
      return;
    }
    returnToLevelList();
  }

  function renderLevelList() {
    const profile = deps.getActiveProfile();
    requireElement<HTMLElement>('shop-profile-badge').textContent = `המסלול של ${profile.name}`;
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
    requireElement<HTMLElement>('shop-profile-badge').textContent = `המסלול של ${deps.getActiveProfile().name}`;
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
    const isEnglishLearning = getLanguagePolicy(getLearningLanguage()).prompt === 'spoken-english';
    setFeedback(isEnglishLearning ? 'הקשיבו להזמנה ובחרו מהמדף' : 'קראו את ההזמנה ובחרו מהמדף');
    updateHud();
    if (isEnglishLearning) {
      scheduleTimer(() => speakOrder(), 600);
    }
  }

  function renderCustomer() {
    const isEnglishLearning = getLanguagePolicy(getLearningLanguage()).prompt === 'spoken-english';
    const orderPrompt = requireElement<HTMLElement>('shop-order-prompt');
    requireElement<HTMLElement>('shop-customer-avatar').textContent = state.customerEmoji;
    requireElement<HTMLElement>('shop-customer-name').textContent = state.customerName;
    orderPrompt.textContent = isEnglishLearning ? 'אני רוצה בבקשה...' : requireCurrentOrder().sentence;
    orderPrompt.dir = 'rtl';
    requireElement<HTMLButtonElement>('shop-replay-btn').hidden = !isEnglishLearning;
    requireElement<HTMLButtonElement>('shop-order-replay-btn').hidden = !isEnglishLearning;
    requireElement<HTMLElement>('shop-customer-card').classList.remove('is-happy', 'is-leaving');
  }

  function renderShelves() {
    const order = requireCurrentOrder();
    const learningLanguage = getLearningLanguage();
    const learningPolicy = getLanguagePolicy(learningLanguage);
    shelves.innerHTML = '';
    shelves.style.setProperty('--shop-shelf-columns', String(Math.min(4, order.shelfItems.length)));

    order.shelfItems.forEach((item) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'shop-item-tile';
      tile.dataset.itemId = item.id;
      tile.setAttribute('aria-label', learningLanguage === 'he' ? item.hebrew : item.english);

      const choice = document.createElement('span');
      if (learningPolicy.choices === 'written-hebrew') {
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
      setFeedback(getLearningLanguage() === 'en' ? 'כמעט. מקשיבים שוב' : 'כמעט. קוראים שוב');
      updateHud();
      if (getLearningLanguage() === 'en') {
        scheduleTimer(() => speakOrder(), 180);
      }
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
      updateHud();
      setFeedback(createSuccessFeedback(item, getLearningLanguage()));
      requireElement<HTMLElement>('shop-customer-card').classList.add('is-happy');
      if (getLearningLanguage() === 'en') {
        scheduleTimer(() => playRecordedSequence([
          vocabularyWordAudio(item.id),
          vocabularyUiAudio('thank-you'),
        ]), 120);
      }
      scheduleTimer(() => {
        requireElement<HTMLElement>('shop-customer-card').classList.add('is-leaving');
      }, 1460);
      scheduleTimer(() => nextCustomer(), 1860);
    } else {
      setFeedback(`${createSuccessFeedback(item, getLearningLanguage())} ממשיכים למלא את הסל`);
      if (getLearningLanguage() === 'en') {
        playRecordedSequence([vocabularyWordAudio(item.id)]);
      }
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
    if (state.currentOrder && getLearningLanguage() === 'en') {
      speakOrder();
    }
  }

  function speakOrder() {
    playRecordedSequence(requireCurrentOrder().audioSources);
  }

  function getLearningLanguage(): 'en' | 'he' {
    return deps.getActiveProfile().language ?? 'en';
  }

  function createLocalizedOrder(
    englishRequest: EnglishRequest,
    shelfItems: ShopItem[],
    targets: ShopOrderTarget[],
  ): ShopOrder {
    const sentence = getLearningLanguage() === 'en'
      ? englishRequest.sentence
      : createHebrewRequestSentence(targets);
    return { sentence, audioSources: englishRequest.audioSources, shelfItems, targets };
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
        leaveShop();
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
    const source = getLevelTargetSource(level);

    if (level.mode === 'color') {
      const [target] = drawTargetItems(1);
      return createLocalizedOrder(
        createEnglishRequest(definitePhrase(target)),
        createShelf(source, [target], level.shelfSize),
        [{ item: target, required: 1, served: 0 }],
      );
    }

    if (level.mode === 'quantity') {
      const [target] = drawTargetItems(1);
      const quantity = 1 + Math.floor(Math.random() * 3);
      return createLocalizedOrder(
        createEnglishRequest(quantityPhrase(target, quantity)),
        createShelf(source, [target], level.shelfSize),
        [{ item: target, required: quantity, served: 0 }],
      );
    }

    if (level.mode === 'double') {
      const targets = drawTargetItems(2);
      return createLocalizedOrder(
        createEnglishRequest(joinPhrases(indefinitePhrase(targets[0]), indefinitePhrase(targets[1]))),
        createShelf(source, targets, level.shelfSize),
        targets.map((item) => ({ item, required: 1, served: 0 })),
      );
    }

    const [target] = drawTargetItems(1);
    return createLocalizedOrder(
      createEnglishRequest(indefinitePhrase(target)),
      createShelf(source, [target], level.shelfSize),
      [{ item: target, required: 1, served: 0 }],
    );
  }

  function drawTargetItems(count: number) {
    const decks = JSON.parse(localStorage.getItem(SHOP_WORD_DECK_STORAGE_KEY) || '{}');
    const profileId = deps.getActiveProfile().id;
    const profileDecks = decks[profileId] || {};
    const result = drawVocabularyRound({
      pool: state.activeLevel.itemPool,
      count,
      state: profileDecks[state.activeLevel.id] || null,
    });
    profileDecks[state.activeLevel.id] = result.state;
    decks[profileId] = profileDecks;
    localStorage.setItem(SHOP_WORD_DECK_STORAGE_KEY, JSON.stringify(decks));
    return result.selection.map(getShopItem);
  }

  function getLevelTargetSource(level: ShopLevel) {
    return getShopItems(level.itemPool);
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

function createEnglishRequest(phrase: SpokenPhrase): EnglishRequest {
  return randomFrom([
    {
      sentence: `Can I have ${phrase.text}, please?`,
      audioSources: [vocabularyUiAudio('can-i-have'), ...phrase.audioSources, vocabularyUiAudio('please')],
    },
    {
      sentence: `I want ${phrase.text}, please!`,
      audioSources: [vocabularyUiAudio('i-want'), ...phrase.audioSources, vocabularyUiAudio('please')],
    },
    {
      sentence: `I would like ${phrase.text}, please.`,
      audioSources: [vocabularyUiAudio('i-would-like'), ...phrase.audioSources, vocabularyUiAudio('please')],
    },
    {
      sentence: `Do you have ${phrase.text}?`,
      audioSources: [vocabularyUiAudio('do-you-have'), ...phrase.audioSources],
    },
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

function createSuccessFeedback(item: ShopItem, language: 'en' | 'he') {
  return language === 'en'
    ? `✨ ${item.english} ${item.drawing}`
    : `✨ ${item.hebrew} ${item.drawing}`;
}

function indefinitePhrase(item: ShopItem) {
  if (MASS_ITEMS.has(item.id)) {
    return { text: item.english, audioSources: [vocabularyWordAudio(item.id)] };
  }

  const article = /^[aeiou]/i.test(item.english) ? 'an' : 'a';
  return {
    text: `${article} ${item.english}`,
    audioSources: [vocabularyUiAudio(article), vocabularyWordAudio(item.id)],
  };
}

function definitePhrase(item: ShopItem) {
  return {
    text: `the ${item.english}`,
    audioSources: [vocabularyUiAudio('the'), vocabularyWordAudio(item.id)],
  };
}

function quantityPhrase(item: ShopItem, quantity: number) {
  return {
    text: `${NUMBER_WORDS[quantity]} ${quantity === 1 ? item.english : pluralize(item.english)}`,
    audioSources: [
      vocabularyUiAudio(NUMBER_WORDS[quantity]),
      quantity === 1 ? vocabularyWordAudio(item.id) : vocabularyPluralAudio(item.id),
    ],
  };
}

function joinPhrases(first: SpokenPhrase, second: SpokenPhrase): SpokenPhrase {
  return {
    text: `${first.text} and ${second.text}`,
    audioSources: [...first.audioSources, vocabularyUiAudio('and'), ...second.audioSources],
  };
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
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
