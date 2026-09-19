import { createSaveClient, SAVE_CACHE_KEY } from './save-client.mjs';

export let saveStorage;

export async function initializeSaves() {
  if (window.parent !== window && new URLSearchParams(location.search).get('host') === 'world-map') {
    saveStorage = window.parent.bubblesSaveClient;
    if (!saveStorage) throw new Error('The world map must load saves before opening an activity');
    return;
  }
  const panel = document.createElement('div');
  panel.className = 'save-status-panel';
  panel.dir = 'rtl';
  panel.setAttribute('role', 'status');
  panel.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:10000;background:#fff8e9;color:#68415f;border:2px solid white;border-radius:14px;padding:8px 12px;font:600 14px Rubik,sans-serif;max-width:90vw';
  document.body.append(panel);
  let hideTimer;
  const block = () => {
    for (const child of document.body.children) if (child !== panel) child.inert = true;
  };
  const showStatus = state => {
    clearTimeout(hideTimer);
    panel.hidden = false;
    const messages = {
      saving: 'שומר…', saved: 'נשמר בענן ✓', offline: 'נשמר במכשיר · ממתין לחיבור לענן',
      conflict: 'ההתקדמות השתנתה במכשיר אחר. השמירה המקומית נשמרה לשחזור.',
      error: 'לא ניתן לשמור במכשיר. יש לפנות מקום לפני שממשיכים.',
    };
    panel.textContent = messages[state];
    if (state === 'saved') hideTimer = setTimeout(() => { panel.hidden = true; }, 1600);
    if (state === 'conflict' || state === 'error') block();
    if (state === 'conflict') {
      const button = document.createElement('button');
      button.textContent = 'המשך מהשמירה בענן';
      button.onclick = () => {
        localStorage.setItem(`${SAVE_CACHE_KEY}-conflict-${Date.now()}`, localStorage.getItem(SAVE_CACHE_KEY));
        localStorage.removeItem(SAVE_CACHE_KEY);
        location.reload();
      };
      panel.append(button);
    }
  };
  panel.textContent = 'טוען שמירה…';
  // The newest tab owns saves. The older tab drains its queue before handing off.
  const tabId = crypto.randomUUID();
  const channel = new BroadcastChannel('bubbles-save-tab-handoff');
  let releaseLock;
  let readyResolve;
  let readyReject;
  let canTransfer = false;
  const lockHeld = new Promise(resolve => { releaseLock = resolve; });
  const lockReady = new Promise((resolve, reject) => { readyResolve = resolve; readyReject = reject; });
  channel.onmessage = async event => {
    if (event.data?.type !== 'take-over' || event.data.tabId === tabId || !canTransfer) return;
    canTransfer = false;
    block();
    await saveStorage.retire();
    clearTimeout(hideTimer);
    panel.hidden = false;
    panel.textContent = 'המשחק עבר ללשונית החדשה.';
    const returnButton = document.createElement('button');
    returnButton.textContent = 'לשחק כאן';
    returnButton.onclick = () => location.reload();
    panel.append(returnButton);
    channel.close();
    releaseLock();
  };
  void navigator.locks.request('bubbles-save-tab', async () => {
    readyResolve();
    await lockHeld;
  }).catch(readyReject);
  const requestTakeover = () => channel.postMessage({ type: 'take-over', tabId });
  const requestTimer = setInterval(requestTakeover, 400);
  requestTakeover();
  try {
    await lockReady;
  } finally {
    clearInterval(requestTimer);
  }
  saveStorage = createSaveClient({ storage: localStorage, fetcher: fetch.bind(window), onStatus: showStatus });
  window.bubblesSaveClient = saveStorage;
  try {
    await saveStorage.load();
  } catch (error) {
    channel.close();
    releaseLock();
    throw error;
  }
  canTransfer = true;
  window.addEventListener('online', () => { void saveStorage.flush(); });
  window.addEventListener('pagehide', () => { void saveStorage.flush(); });
}

export function showSaveLoadError(error) {
  const panel = document.createElement('div');
  panel.dir = 'rtl';
  panel.style.cssText = 'position:fixed;inset:0;z-index:20000;background:#fff8e9;display:grid;place-content:center;text-align:center;font:20px Rubik,sans-serif';
  panel.textContent = `לא ניתן לטעון את השמירה. ${error.message}`;
  const retry = document.createElement('button');
  retry.textContent = 'נסו שוב';
  retry.onclick = () => location.reload();
  panel.append(retry);
  document.body.append(panel);
}
