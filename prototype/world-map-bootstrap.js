import { initializeSaves, showSaveLoadError } from './shared/saves.mjs';
initializeSaves().then(() => import('./world-map.js')).catch(showSaveLoadError);
