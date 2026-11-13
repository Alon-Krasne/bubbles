import { initializeSaves, showSaveLoadError } from './shared/saves.mjs';
initializeSaves()
  .then(() => import('./world-map.js'))
  .then(() => document.body.removeAttribute('data-loading'))
  .catch(showSaveLoadError);
