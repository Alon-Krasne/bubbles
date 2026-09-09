import { createSaveClient, SAVE_CACHE_KEY } from './save-client.mjs';
import { TRAIL_STAGES } from './trail-catalog.mjs';

export let saveStorage;

export async function initializeSaves() {
  if (window.parent !== window && new URLSearchParams(location.search).get('host') === 'world-map') {
    saveStorage = window.parent.bubblesSaveClient;
    if (!saveStorage) throw new Error('The world map must load saves before opening an activity');
    return;
  }
  const panel = document.createElement('div');
  panel.dir = 'rtl';
  panel.setAttribute('role', 'status');
  panel.style.cssText = 'position:fixed;bottom:8px;left:8px;z-index:10000;background:#fff8e9;color:#68415f;border:2px solid white;border-radius:14px;padding:8px 12px;font:600 14px Rubik,sans-serif;max-width:90vw';
  document.body.append(panel);
  const block = () => {
    for (const child of document.body.children) if (child !== panel) child.inert = true;
  };
  const showStatus = state => {
    const messages = {
      saving: 'שומר…', saved: 'נשמר בענן ✓', offline: 'נשמר במכשיר · ממתין לחיבור לענן',
      conflict: 'ההתקדמות השתנתה במכשיר אחר. השמירה המקומית נשמרה לשחזור.',
      error: 'לא ניתן לשמור במכשיר. יש לפנות מקום לפני שממשיכים.',
    };
    panel.textContent = messages[state];
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
  // One controller per browser tab tree; a second tab must not replace its local queue.
  await new Promise((resolve, reject) => {
    void navigator.locks.request('bubbles-save-tab', { ifAvailable: true }, async lock => {
      if (!lock) { reject(new Error('המשחק כבר פתוח בלשונית אחרת. סגרו אותה ונסו שוב.')); return; }
      resolve();
      await new Promise(() => {});
    }).catch(reject);
  });
  saveStorage = createSaveClient({ storage: localStorage, fetcher: fetch.bind(window), onStatus: showStatus });
  window.bubblesSaveClient = saveStorage;
  await saveStorage.load();
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

export function recordStageCompletion(context, stars) {
  const key = `route-${context.profileId}`;
  const route = JSON.parse(saveStorage.getItem(key));
  route.progress[context.stageId] = Math.max(route.progress[context.stageId] || 0, stars);
  while (route.progress[route.currentStage] && route.currentStage < TRAIL_STAGES.length) route.currentStage += 1;
  saveStorage.setItem(key, JSON.stringify(route));
}
