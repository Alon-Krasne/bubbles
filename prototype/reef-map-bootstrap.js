import { initializeSaves, showSaveLoadError } from './shared/saves.mjs';
initializeSaves().then(() => import('./reef-map.js')).catch(showSaveLoadError);
