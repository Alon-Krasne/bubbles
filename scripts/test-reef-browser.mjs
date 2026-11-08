// Run against the built app on the temporary D1 server in serve-save-test.mjs.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const origin = 'http://127.0.0.1:8788';
const profileId = `reef-qa-${Date.now()}`;
const profileChoice = `.gate-profile-choice[data-profile="${profileId}"]`;
const browser = (...args) => execFileSync('agent-browser', ['--session', profileId, ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const storyId = () => evaluate("document.querySelector('#story-dialog video').src.split('/').at(-1).replace('.mp4', '')");
const readReef = () => evaluate(`JSON.parse(window.bubblesSaveClient.getItem('reef-route-${profileId}-en'))`);

try {
  browser('open', `${origin}/prototype/world-map.html`);
  browser('wait', '.gate-profile-choice');
  evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const key = 'bubble_world_map_profiles_v1';
    const profiles = JSON.parse(saves.getItem(key));
    profiles.push({ id: '${profileId}', name: 'Reef QA', character: 'puppy', learningLanguage: 'en' });
    saves.setItem(key, JSON.stringify(profiles));
    const { createForestProgress, FOREST_MILESTONES } = await import('/prototype/shared/destinations.mjs');
    const route = createForestProgress('adva');
    route.currentStage = 36;
    route.progress = Object.fromEntries(Array.from({ length: 35 }, (_, i) => [i + 1, 3]));
    route.unlockedVideos = route.seenVideos = FOREST_MILESTONES.slice(0, -1).map(story => story.videoId);
    saves.setItem('forest-route-${profileId}-en', JSON.stringify(route));
    await saves.flush();
    return true;
  })()`);

  browser('reload');
  browser('wait', profileChoice);
  browser('click', profileChoice);
  assert.equal(browser('is', 'enabled', '#destination-card-reef').trim(), 'false');
  browser('open', `${origin}/prototype/reef-map.html`);
  browser('wait', '#reef-locked:not([hidden])');
  assert.equal(readReef(), null);

  // Simulate a refresh immediately after the last Forest result was saved.
  const forestBefore = evaluate(`(async () => {
    const saves = window.bubblesSaveClient;
    const key = 'forest-route-${profileId}-en';
    const route = JSON.parse(saves.getItem(key));
    route.progress[36] = 3;
    route.unlockedVideos.push('forest-video-09');
    saves.setItem(key, JSON.stringify(route));
    await saves.flush();
    return route;
  })()`);
  browser('click', '#reef-locked a');
  browser('wait', profileChoice);
  browser('click', profileChoice);
  browser('click', '#destination-card-reef');
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.match(evaluate("document.querySelector('#forest-milestone-video').src"), /forest-video-09\.mp4$/);
  browser('click', '#forest-milestone-play-btn');
  browser('click', '#world-complete-button');

  browser('wait', '#story-dialog[open]');
  assert.equal(storyId(), 'bridge-forest-reef');
  assert.equal(evaluate("document.querySelector('#story-list').hidden"), true);
  assert.match(evaluate("document.querySelector('.traveller img').src"), /adva\.webp$/);
  assert.equal(evaluate("document.querySelector('#caption-language').value"), 'en');
  browser('select', '#caption-language', 'he');
  assert.deepEqual(evaluate("Array.from(document.querySelector('#story-video').textTracks, track => track.mode)"), ['showing', 'hidden']);
  browser('press', 'Escape');
  browser('wait', '--fn', "document.querySelector('#story-dialog[open] video')?.src.endsWith('reef-video-01.mp4')");
  browser('reload');
  browser('wait', '#story-dialog[open]');
  assert.equal(storyId(), 'reef-video-01', 'Interrupted playback offers the opening again');
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef']);
  evaluate(`(async () => {
    const video = document.querySelector('#story-video');
    await video.play();
    video.currentTime = video.duration - 0.5;
    return true;
  })()`);
  browser('wait', '--fn', "document.querySelector('#story-video').ended");
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef', 'reef-video-01']);
  browser('click', '#continue-story');
  browser('wait', '--fn', "!document.querySelector('#story-dialog').open");

  browser('click', '#play-stage');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelectorAll('.memory-card').length > 0");
  assert.equal(evaluate("new URL(document.querySelector('#activity-frame').src).searchParams.get('level')"), 'reef-memory-1');
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
  evaluate("document.querySelector('#activity-frame').contentDocument.querySelector('#memory-celebration-next-btn').click(); true");
  browser('wait', '--fn', "document.querySelector('#reef-activity').hidden");
  assert.equal(readReef().currentStage, 2);
  assert.ok(readReef().progress[1] > 0);
  const forestAfter = evaluate(`JSON.parse(window.bubblesSaveClient.getItem('forest-route-${profileId}-en'))`);
  assert.deepEqual(forestAfter, { ...forestBefore, seenVideos: [...forestBefore.seenVideos, 'forest-video-09'] });
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
  browser('wait', '#reef-screen:not([hidden])');
  browser('set', 'viewport', '390', '844');
  browser('click', '#go-finish');
  assert.equal(browser('is', 'enabled', '#play-stage').trim(), 'false');
  for (const [stage, ready, back] of [
    [2, '#shop-screen.active', '#shop-back-btn'],
    [3, '.object-button', '#trail-back-button'],
    [4, '#reveal-keyboard button', '#reveal-back'],
    [5, '#paint-canvas', '#painter-back'],
  ]) {
    browser('focus', `[data-stage="${stage}"]`);
    browser('click', '#play-stage');
    browser('wait', '--fn', `document.querySelector('#activity-frame').contentDocument?.querySelector('${ready}')`);
    evaluate(`document.querySelector('#activity-frame').contentDocument.querySelector('${back}').click(); true`);
    browser('wait', '--fn', "document.querySelector('#reef-activity').hidden");
  }
  assert.equal(readReef().currentStage, 5, 'Exiting a game leaves progress at the same stop');
  assert.equal(browser('errors').trim(), '');
  console.log('PASS: locked entry, Forest finale handoff, companion, captions, interrupted story, and playable Reef progress in local D1.');
} finally {
  browser('close');
}
