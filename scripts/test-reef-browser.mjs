// Run against the built app on the temporary D1 server in serve-save-test.mjs.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const origin = 'http://127.0.0.1:8788';
const profileId = `reef-qa-${Date.now()}`;
const profileChoice = `.gate-profile-choice[data-profile="${profileId}"]`;
const mapUrl = `${origin}/prototype/world-map.html`;
const browser = (...args) => execFileSync('agent-browser', ['--session', profileId, ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const storyId = () => evaluate("document.querySelector('#forest-milestone-video').src.split('/').at(-1).replace('.mp4', '')");
const readReef = () => evaluate(`JSON.parse(window.bubblesSaveClient.getItem('reef-route-${profileId}-en'))`);
const enterJourney = () => {
  browser('wait', profileChoice);
  browser('click', profileChoice);
  browser('click', '#destination-card-forest');
};

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
    route.unlockedVideos = route.seenVideos = FOREST_MILESTONES.slice(0, -1).map(story => story.videoId);
    saves.setItem('forest-route-${profileId}-en', JSON.stringify(route));
    await saves.flush();
    return true;
  })()`);

  browser('reload');
  enterJourney();
  assert.equal(evaluate("document.querySelectorAll('.world-stage').length"), 36);
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '36');
  assert.equal(readReef(), null);

  browser('click', '#play-button');
  browser('wait', '#activity-overlay.is-visible');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelector('#svg-stroke-path')");
  evaluate(`(async () => {
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
    if (!state().complete) throw Error('Forest stage 36 did not complete');
    activity.querySelector('#painter-finish').click();
    return true;
  })()`);
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.equal(storyId(), 'forest-video-09');
  assert.equal(browser('get', 'url').trim(), mapUrl);
  assert.equal(evaluate("document.querySelectorAll('.map-stage').length"), 1);
  assert.equal(evaluate("document.querySelectorAll('.world-stage').length"), 72);
  assert.equal(browser('is', 'enabled', '.world-stage[data-stage="36"]').trim(), 'true');
  assert.equal(evaluate("document.querySelector('.world-stage[data-stage=\"37\"]').offsetTop < document.querySelector('.world-stage[data-stage=\"36\"]').offsetTop"), true);
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '37');
  assert.equal(evaluate("document.querySelector('#star-total-max').textContent"), '/216');
  assert.equal(evaluate("document.querySelector('#world-complete-overlay').classList.contains('is-visible')"), false);
  browser('click', '#forest-milestone-play-btn');
  assert.equal(storyId(), 'bridge-forest-reef');
  assert.equal(evaluate("document.querySelector('#forest-story-select').hidden"), true);
  assert.match(evaluate("document.querySelector('#traveller-image').src"), /adva\.webp$/);
  assert.equal(evaluate("document.querySelector('#forest-caption-language').value"), 'en');
  browser('select', '#forest-caption-language', 'he');
  assert.deepEqual(evaluate("Array.from(document.querySelector('#forest-milestone-video').textTracks, track => track.mode)"), ['showing', 'hidden']);
  browser('press', 'Escape');
  assert.equal(storyId(), 'reef-video-01');
  browser('reload');
  enterJourney();
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.equal(storyId(), 'reef-video-01', 'Interrupted playback offers the opening again');
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef']);
  evaluate(`(async () => {
    const video = document.querySelector('#forest-milestone-video');
    await video.play();
    video.currentTime = video.duration - 0.5;
    return true;
  })()`);
  browser('wait', '--fn', "document.querySelector('#forest-milestone-video').ended");
  assert.deepEqual(readReef().seenVideos, ['bridge-forest-reef', 'reef-video-01']);
  browser('click', '#forest-milestone-play-btn');
  browser('wait', '--fn', "document.querySelector('#forest-milestone-dialog').hidden");

  const forestBefore = evaluate(`window.bubblesSaveClient.getItem('forest-route-${profileId}-en')`);
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
  evaluate("document.querySelector('#activity-frame').contentDocument.querySelector('#memory-celebration-next-btn').click(); true");
  browser('wait', '--fn', "!document.querySelector('#activity-overlay').classList.contains('is-visible')");
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
    [38, '#shop-screen.active', '#shop-back-btn'],
    [39, '.object-button', '#trail-back-button'],
    [40, '#reveal-keyboard button', '#reveal-back'],
    [41, '#paint-canvas', '#painter-back'],
  ]) {
    browser('click', `.world-stage[data-stage="${stage}"]`);
    browser('click', '#play-button');
    browser('wait', '#activity-overlay.is-visible');
    browser('wait', '--fn', `document.querySelector('#activity-frame').contentDocument?.querySelector('${ready}')`);
    evaluate(`document.querySelector('#activity-frame').contentDocument.querySelector('${back}').click(); true`);
    browser('wait', '--fn', "!document.querySelector('#activity-overlay').classList.contains('is-visible')");
  }
  assert.equal(readReef().currentStage, 5, 'Exiting a game leaves progress at the same stop');
  assert.equal(browser('errors').trim(), '');
  console.log('PASS: completing stage 36 extends the same map to 72, with stories, saved stage 37, and all five Reef activity entry points.');
} finally {
  browser('close');
}
