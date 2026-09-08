import { initializeSaves, showSaveLoadError } from './shared/saves.mjs';
initializeSaves().then(() => import('./magic-house.js')).catch(showSaveLoadError);
