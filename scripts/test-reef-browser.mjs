// Run against the built app on the temporary D1 server in serve-save-test.mjs.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const origin = 'http://127.0.0.1:8788';
const profileId = `reef-qa-${Date.now()}`;
const mapUrl = `${origin}/prototype/world-map.html`;
const reefUrl = `${mapUrl}#reef`;
const browser = (...args) => execFileSync('agent-browser', ['--session', profileId, ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const storyId = () => evaluate("document.querySelector('#forest-milestone-video').src.split('/').at(-1).replace('.mp4', '')");
const readReef = () => evaluate(`JSON.parse(window.bubblesSaveClient.getItem('reef-route-${profileId}-en'))`);
const mapHeight = () => evaluate("document.querySelector('.map-stage').clientHeight");
const playToEnd = () => evaluate(`(async () => {
  const video = document.querySelector('#forest-milestone-video');
  await video.play();
  video.currentTime = video.duration - 0.5;
  return true;
})()`);
const enterJourney = (id = profileId) => {
  const profileChoice = `.gate-profile-choice[data-profile="${id}"]`;
  browser('wait', profileChoice);
  browser('click', profileChoice);
  browser('click', '#destination-card-forest');
};

async function finishPainter() {
  const frame = document.querySelector('#activity-frame');
  const activity = frame.contentDocument;
  const canvas = activity.querySelector('#paint-canvas');
  const state = () => JSON.parse(frame.contentWindow.render_game_to_text());
  const fire = (type, point) => {
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new frame.contentWindow.PointerEvent(type, {
      bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, pointerType: 'mouse', button: 0,
      clientX: rect.left + point.x * rect.width / canvas.width,
      clientY: rect.top + point.y * rect.height / canvas.height,
    }));
  };
  for (let attempt = 0; attempt < 30 && !state().complete; attempt++) {
    const path = activity.querySelector('#svg-stroke-path');
    const length = path.getTotalLength();
    fire('pointerdown', path.getPointAtLength(0));
    for (let distance = 4; distance < length; distance += 4) fire('pointermove', path.getPointAtLength(distance));
    fire('pointermove', path.getPointAtLength(length));
    fire('pointerup', path.getPointAtLength(length));
    if (state().inputLocked) await new Promise(resolve => setTimeout(resolve, 740));
  }
  if (!state().complete) throw Error('Painter did not complete');
  activity.querySelector('#painter-finish').click();
  return true;
}

function returnWithKeyboard(back) {
  const focused = evaluate(`(() => {
    const activity = document.querySelector('#activity-frame').contentDocument;
    activity.querySelector('${back}').focus();
    return activity.activeElement.id;
  })()`);
  assert.equal(focused, back.slice(1), 'The activity return control receives keyboard focus');
  browser('press', 'Enter');
  browser('wait', '--fn', "!document.querySelector('#activity-overlay').classList.contains('is-visible')");
  assert.equal(evaluate('document.activeElement.id'), 'play-button');
}

try {
  browser('open', mapUrl);
  browser('wait', '.gate-profile-choice');
  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const key = 'bubble_world_map_profiles_v1';
    const profiles = JSON.parse(saves.getItem(key));
    profiles.push({ id: '${profileId}', name: 'Reef QA', character: 'puppy', learningLanguage: 'en' });
    saves.setItem(key, JSON.stringify(profiles));
    const { createForestProgress, FOREST_MILESTONES } = await import('/prototype/shared/destinations.mjs');
    const { TRAIL_STAGES } = await import('/prototype/shared/trail-catalog.mjs');
    const route = createForestProgress('adva');
    route.currentStage = 36;
    route.stageOrder = TRAIL_STAGES.map(stage => stage.id);
    route.progress = Object.fromEntries(Array.from({ length: 35 }, (_, i) => [i + 1, 3]));
    route.unlockedVideos = FOREST_MILESTONES.slice(0, -1).map(story => story.videoId);
    route.seenVideos = route.unlockedVideos.slice(0, -1);
    saves.setItem('forest-route-${profileId}-en', JSON.stringify(route));
    await saves.flush();
    return true;
  })()`);

  browser('open', reefUrl);
  browser('reload');
  enterJourney();
  assert.equal(browser('get', 'url').trim(), mapUrl, 'The Reef URL stays locked before Forest stage 36 is cleared');
  assert.equal(evaluate("document.querySelectorAll('.world-stage').length"), 36);
  const forestMapHeight = mapHeight();
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '36');
  assert.equal(readReef(), null);
  assert.equal(storyId(), 'forest-video-08');
  browser('select', '#forest-story-select', 'forest-video-07');
  browser('click', '#forest-milestone-play-btn');

  browser('click', '#play-button');
  browser('wait', '#activity-overlay.is-visible');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelector('#svg-stroke-path')");
  evaluate(`(${finishPainter.toString()})()`);
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.equal(storyId(), 'forest-video-09');
  assert.equal(browser('get', 'url').trim(), mapUrl);
  assert.equal(evaluate("document.querySelectorAll('.world-stage').length"), 36, 'The finale stays on the Forest screen');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '36');
  assert.equal(evaluate("document.querySelector('#star-total-max').textContent"), '/108');
  assert.equal(evaluate("document.querySelector('#world-complete-overlay').classList.contains('is-visible')"), false);
  browser('reload');
  enterJourney();
  assert.equal(storyId(), 'forest-video-09', 'Refresh at the finale does not resume an older Forest story');
  browser('click', '#forest-milestone-play-btn');
  assert.equal(storyId(), 'bridge-forest-reef');
  assert.equal(browser('get', 'url').trim(), mapUrl);
  assert.equal(browser('get', 'count', '.world-stage[data-stage="37"]').trim(), '0');
  assert.equal(evaluate("document.querySelector('#forest-story-select').hidden"), true);
  assert.equal(evaluate("document.querySelector('#forest-caption-language').value"), 'en');
  browser('select', '#forest-caption-language', 'he');
  assert.deepEqual(evaluate("Array.from(document.querySelector('#forest-milestone-video').textTracks, track => track.mode)"), ['showing', 'hidden']);
  browser('reload');
  enterJourney();
  assert.equal(storyId(), 'bridge-forest-reef', 'Interrupted bridge resumes on the Forest screen');
  assert.equal(browser('get', 'url').trim(), mapUrl);
  playToEnd();
  browser('wait', '--fn', "document.querySelector('#forest-milestone-video').src.endsWith('/reef-video-01.mp4')");
  assert.equal(storyId(), 'reef-video-01');
  assert.equal(browser('get', 'url').trim(), reefUrl);
  assert.equal(evaluate("document.querySelector('#world').dataset.mapWorld"), 'reef');
  assert.equal(evaluate("document.querySelectorAll('.world-stage').length"), 36);
  assert.equal(browser('get', 'count', '.world-stage[data-stage="36"]').trim(), '0');
  assert.equal(mapHeight(), forestMapHeight, 'The viewport only scrolls within the active world');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '37');
  assert.match(evaluate("document.querySelector('#traveller-image').src"), /adva\.webp$/);
  assert.equal(evaluate("document.querySelector('#star-total-max').textContent"), '/216');
  browser('set', 'viewport', '390', '844');
  browser('wait', '--fn', `(() => {
    const stop = document.querySelector('.world-stage[data-stage="37"]').getBoundingClientRect();
    const panel = document.querySelector('#stage-panel').getBoundingClientRect();
    return stop.top >= 0 && stop.bottom <= panel.top;
  })()`);
  browser('set', 'viewport', '1280', '720');
  browser('reload');
  enterJourney();
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.equal(storyId(), 'reef-video-01', 'Interrupted playback offers the opening again');
  assert.equal(browser('get', 'url').trim(), reefUrl);
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef']);
  playToEnd();
  browser('wait', '--fn', "document.querySelector('#forest-milestone-video').ended");
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef', 'reef-video-01']);
  browser('click', '#forest-milestone-play-btn');
  browser('wait', '--fn', "document.querySelector('#forest-milestone-dialog').hidden");

  const forestBefore = evaluate(`window.bubblesSaveClient.getItem('forest-route-${profileId}-en')`);
  assert.equal(JSON.parse(forestBefore).seenVideos.includes('forest-video-08'), false);
  browser('click', '#forest-stories-button');
  browser('select', '#forest-story-select', 'forest-video-08');
  assert.equal(storyId(), 'forest-video-08', 'Earlier stories remain available in the journey album');
  browser('click', '#forest-milestone-play-btn');
  browser('click', '#play-button');
  browser('wait', '#activity-overlay.is-visible');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelectorAll('.memory-card').length > 0");
  assert.equal(evaluate("new URL(document.querySelector('#activity-frame').src).searchParams.get('level')"), 'reef-memory-1');
  assert.equal(evaluate("new URL(document.querySelector('#activity-frame').src).searchParams.get('stage')"), '37');
  evaluate(`(async () => {
    const activity = document.querySelector('#activity-frame').contentDocument;
    const cards = Array.from(activity.querySelectorAll('.memory-card'));
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    for (const id of new Set(cards.map(card => card.dataset.wordId))) {
      const pair = cards.filter(card => card.dataset.wordId === id);
      pair[0].click();
      await wait(250);
      pair[1].click();
      await wait(1600);
    }
    return true;
  })()`);
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelector('#memory-celebration').classList.contains('is-visible')");
  returnWithKeyboard('#memory-celebration-next-btn');
  assert.equal(readReef().currentStage, 2);
  assert.ok(readReef().progress[1] > 0);
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '38');
  assert.equal(evaluate(`window.bubblesSaveClient.getItem('forest-route-${profileId}-en')`), forestBefore);
  assert.equal(evaluate(`window.bubblesSaveClient.getItem('reef-route-${profileId}-he')`), null);

  // Move this fixture to the chapter frontier to check all hosted entry points.
  evaluate(`(async () => {
    const { completeReefStage } = await import('/prototype/shared/reef-progress.mjs');
    const profile = { id: '${profileId}', learningLanguage: 'en' };
    for (const stage of [2, 3, 4]) completeReefStage(profile, stage, 3, window.bubblesSaveClient);
    await window.bubblesSaveClient.flush();
    return true;
  })()`);
  browser('reload');
  enterJourney();
  browser('set', 'viewport', '390', '844');
  assert.equal(browser('is', 'enabled', '.world-stage[data-stage="72"]').trim(), 'false');
  for (const [stage, ready, back] of [
    [38, '#shop-screen.active', '#shop-level-list-btn'],
    [39, '.object-button', '#trail-back-button'],
    [40, '#reveal-keyboard button', '#reveal-back'],
    [41, '#paint-canvas', '#painter-back'],
  ]) {
    browser('click', `.world-stage[data-stage="${stage}"]`);
    browser('click', '#play-button');
    browser('wait', '#activity-overlay.is-visible');
    browser('wait', '--fn', `document.querySelector('#activity-frame').contentDocument?.querySelector('${ready}')`);
    returnWithKeyboard(back);
  }
  assert.equal(readReef().currentStage, 5, 'Exiting a game leaves progress at the same stop');

  browser('click', '#play-button');
  browser('wait', '#activity-overlay.is-visible');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelector('#svg-stroke-path')");
  evaluate(`(${finishPainter.toString()})()`);
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.equal(storyId(), 'reef-video-02', 'Finishing stage 41 presents the first Reef reward');
  assert.equal(readReef().currentStage, 6);
  assert.equal(evaluate('document.activeElement.id'), 'forest-milestone-play-btn');
  browser('click', '#forest-milestone-play-btn');
  browser('click', '#panel-close');
  browser('click', '#forest-stories-button');
  browser('select', '#forest-story-select', 'reef-video-02');
  assert.equal(storyId(), 'reef-video-02');
  browser('press', 'Escape');
  assert.equal(evaluate('document.activeElement.id'), 'forest-stories-button');
  assert.equal(readReef().seenVideos.filter(id => id === 'reef-video-02').length, 1);

  const readMemoryDeck = language => evaluate(`JSON.parse(localStorage.getItem('bubble_memory_word_decks_v1'))['${profileId}']['reef-memory-1:${language}']`);
  const readHouseHistory = language => evaluate(`JSON.parse(localStorage.getItem('magic-house-previous-requests-v1:${profileId}:reef-house-1:${language}'))`);
  const englishMemoryDeck = readMemoryDeck('en');
  const englishHouseHistory = readHouseHistory('en');
  assert.ok(englishMemoryDeck.previous.length > 0);
  assert.ok(englishHouseHistory.length > 0);
  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const { markReefStorySeen, completeReefStage } = await import('/prototype/shared/reef-progress.mjs');
    const forest = JSON.parse(saves.getItem('forest-route-${profileId}-en'));
    saves.setItem('forest-route-${profileId}-he', JSON.stringify({ ...forest, seenVideos: forest.unlockedVideos }));
    const profile = { id: '${profileId}', learningLanguage: 'he' };
    for (const story of ['bridge-forest-reef', 'reef-video-01']) markReefStorySeen(profile, story, saves);
    for (const stage of [1, 2]) completeReefStage(profile, stage, 3, saves);
    await saves.flush();
    return true;
  })()`);
  browser('click', '#profile-button');
  browser('click', '#edit-profile-button');
  browser('click', 'label:has(input[name="learningLanguage"][value="he"])');
  browser('click', '.save-profile-button');
  for (const [stage, ready, back] of [
    [37, '.memory-card', '#memory-back-btn'],
    [39, '.object-button', '#trail-back-button'],
  ]) {
    browser('click', `.world-stage[data-stage="${stage}"]`);
    browser('click', '#play-button');
    browser('wait', '#activity-overlay.is-visible');
    browser('wait', '--fn', `document.querySelector('#activity-frame').contentDocument?.querySelector('${ready}')`);
    returnWithKeyboard(back);
  }
  assert.ok(readMemoryDeck('he').previous.length > 0);
  assert.ok(readHouseHistory('he').length > 0);
  assert.deepEqual(readMemoryDeck('en'), englishMemoryDeck);
  assert.deepEqual(readHouseHistory('en'), englishHouseHistory);

  const resetId = `${profileId}-reset`;
  const resetReef = () => evaluate(`JSON.parse(window.bubblesSaveClient.getItem('reef-route-${resetId}-en'))`);
  const savedReef = readReef();
  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const key = 'bubble_world_map_profiles_v1';
    const profiles = JSON.parse(saves.getItem(key));
    profiles.push({ id: '${resetId}', name: 'Reset QA', character: 'puppy', learningLanguage: 'en' });
    saves.setItem(key, JSON.stringify(profiles));
    const forest = JSON.parse(saves.getItem('forest-route-${profileId}-en'));
    forest.seenVideos = forest.seenVideos.filter(id => id !== 'forest-video-09');
    saves.setItem('forest-route-${resetId}-en', JSON.stringify(forest));
    saves.setItem('reef-route-${resetId}-en', saves.getItem('reef-route-${profileId}-en'));
    await saves.flush();
    return true;
  })()`);
  browser('reload');
  browser('click', `.gate-profile-card:has([data-profile="${resetId}"]) .gate-profile-edit`);
  assert.deepEqual(resetReef(), savedReef);
  browser('select', '#track-stage-select', '1');
  browser('click', '#track-reset-button');
  browser('click', '#confirm-track-reset-button');
  const resetForest = evaluate(`JSON.parse(window.bubblesSaveClient.getItem('forest-route-${resetId}-en'))`);
  assert.equal(resetForest.currentStage, 1);
  assert.deepEqual(resetForest.unlockedVideos, ['forest-video-01', 'forest-video-09']);
  assert.deepEqual(resetForest.seenVideos, []);
  assert.deepEqual(resetReef(), savedReef, 'Reset preserves the existing Reef save');
  const cloudForest = evaluate(`(async () => {
    await window.bubblesSaveClient.flush();
    const response = await fetch('/api/saves/forest-route-${resetId}-en');
    return JSON.parse((await response.json()).value);
  })()`);
  assert.deepEqual(cloudForest, resetForest);
  browser('open', reefUrl);
  browser('reload');
  enterJourney(resetId);
  assert.equal(browser('get', 'url').trim(), mapUrl, 'The Reef URL does not bypass Forest progress');
  assert.equal(browser('get', 'count', '.world-stage[data-stage="37"]').trim(), '0');
  assert.equal(storyId(), 'forest-video-01');
  browser('click', '#forest-milestone-play-btn');
  browser('click', '#forest-stories-button');
  browser('select', '#forest-story-select', 'reef-video-01');
  assert.equal(storyId(), 'reef-video-01', 'Earned stories remain available after resetting the Forest');
  browser('click', '#forest-milestone-play-btn');
  assert.equal(browser('get', 'url').trim(), mapUrl, 'Replaying a story does not change the map');
  assert.deepEqual(resetReef(), savedReef);

  // Save rows can reach another device in different orders.
  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const forest = JSON.parse(saves.getItem('forest-route-${profileId}-en'));
    forest.seenVideos = forest.seenVideos.filter(id => id !== 'forest-video-09');
    saves.setItem('forest-route-${resetId}-en', JSON.stringify(forest));
    await saves.flush();
    return true;
  })()`);
  browser('reload');
  enterJourney(resetId);
  assert.equal(storyId(), 'forest-video-09');
  assert.equal(browser('get', 'url').trim(), mapUrl, 'A synced bridge acknowledgement waits for the finale');
  browser('click', '#forest-milestone-play-btn');
  assert.equal(browser('get', 'url').trim(), reefUrl);
  assert.deepEqual(resetReef(), savedReef);

  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    saves.removeItem('reef-route-${resetId}-en');
    await saves.flush();
    return true;
  })()`);
  browser('reload');
  enterJourney(resetId);
  assert.equal(storyId(), 'bridge-forest-reef');
  browser('click', '#forest-milestone-play-btn');
  assert.equal(storyId(), 'reef-video-01');
  assert.equal(browser('get', 'url').trim(), reefUrl, 'Skipping the bridge changes the screen too');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '37');
  assert.equal(evaluate('document.activeElement.id'), 'forest-milestone-play-btn');

  assert.equal(browser('errors').trim(), '');
  console.log('PASS: separate world screens, bridge playback and skip, out-of-order save sync, real stages 36/37/41, keyboard returns, separate activity histories, and Reef save preservation.');
} finally {
  browser('close');
}
