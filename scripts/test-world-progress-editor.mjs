// Run against the built app and the temporary local save server.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'world-progress-editor', ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const name = `Reef${String(Date.now()).slice(-6)}`;
const readSave = key => evaluate(`JSON.parse(window.bubblesSaveClient.getItem(${JSON.stringify(key)}))`);
const select = (world, stage) => {
  browser('select', '#track-world-select', world);
  browser('select', '#track-stage-select', String(stage));
  browser('click', '#track-reset-button');
  browser('click', '#confirm-track-reset-button');
};
const editMapProfile = () => {
  browser('click', '#profile-button');
  browser('click', '#edit-profile-button');
};
const mapWorld = () => evaluate("document.querySelector('#world').dataset.mapWorld");

try {
  browser('open', 'http://127.0.0.1:8788/prototype/world-map.html');
  browser('wait', '.gate-profile-choice');
  browser('click', '#add-profile-button');
  browser('fill', '#profile-name-input', name);
  browser('click', '.save-profile-button');
  const { id } = readSave('bubble_world_map_profiles_v1').find(profile => profile.name === name);
  const profileChoice = `.gate-profile-choice[data-profile="${id}"]`;
  const gateEdit = `.gate-profile-card:has(${profileChoice}) .gate-profile-edit`;
  const forestKey = `forest-route-${id}-en`;
  const reefKey = `reef-route-${id}-en`;
  const wonderKey = `route-${id}`;
  const wonder = readSave(wonderKey);
  browser('click', gateEdit);
  assert.equal(browser('get', 'count', '#track-world-select option').trim(), '3', 'The profile editor offers all three worlds');
  select('reef', 42);
  const forest = readSave(forestKey);
  const reef = readSave(reefKey);
  assert.equal(forest.progress[36], 3);
  assert.ok(forest.seenVideos.includes('forest-video-09'));
  assert.equal(reef.currentStage, 6);
  assert.equal(reef.progress[5], 3);
  assert.equal(reef.progress[6], undefined);
  assert.ok(reef.seenVideos.includes('bridge-forest-reef'));
  assert.deepEqual(readSave(wonderKey), wonder);
  assert.equal(readSave(`reef-route-${id}-he`), null);

  browser('click', '#editor-close');
  browser('click', gateEdit);
  assert.equal(evaluate("document.querySelector('#track-world-select').value"), 'reef');
  assert.equal(evaluate("document.querySelector('#track-stage-select').value"), '42');
  browser('click', '#editor-close');
  browser('click', '.gate-profile-choice[data-profile="lotem"]');
  browser('click', '#destination-card-wonder');
  browser('click', '#profile-button');
  browser('click', `.profile-menu-option[data-profile="${id}"]`);
  browser('click', '[data-character="adva"]');
  assert.equal(mapWorld(), 'reef');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '42');
  browser('click', '#gallery-button');
  browser('click', '.gallery-card[data-item="reef-video-02"]');
  browser('wait', '.gallery-media video');
  assert.match(evaluate("document.querySelector('.gallery-media video').src"), /reef-video-02\.mp4$/);
  assert.deepEqual(evaluate("Array.from(document.querySelector('.gallery-media video').textTracks, track => track.cues.length > 0)"), [true, true]);
  browser('select', '.gallery-captions select', 'he');
  assert.deepEqual(evaluate("Array.from(document.querySelector('.gallery-media video').textTracks, track => track.mode)"), ['showing', 'hidden']);
  browser('click', '.gallery-close');

  browser('set', 'viewport', '390', '844');
  editMapProfile();
  assert.equal(evaluate("document.querySelector('#track-world-select').value"), 'reef');
  assert.equal(evaluate("document.querySelector('#track-stage-select').value"), '42');
  select('reef', 72);
  browser('click', '#editor-close');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '72');
  assert.equal(browser('is', 'enabled', '.world-stage[data-stage="72"]').trim(), 'true');

  browser('click', '#play-button');
  browser('wait', '#activity-overlay.is-visible');
  browser('wait', '--fn', "document.querySelector('#activity-frame').contentDocument?.querySelector('.object-button')");
  evaluate(`(async () => {
    const frame = document.querySelector('#activity-frame');
    const doc = frame.contentDocument;
    const { MAGIC_HOUSE_REQUESTS } = await import('/prototype/shared/magic-house-content.mjs');
    for (let attempt = 0; attempt < 55; attempt++) {
      if (doc.querySelector('#celebration').classList.contains('is-visible')) {
        doc.querySelector('#replay-button').click();
        return true;
      }
      const state = JSON.parse(frame.contentWindow.render_game_to_text());
      const request = MAGIC_HOUSE_REQUESTS.find(item => item.id === state.requestIds[state.completedRequests]);
      if (request) for (const target of request.targets) {
        const object = doc.querySelector('.object-button[data-object-id="' + target.objectId + '"]');
        if (!object || object.disabled) continue;
        object.click();
        doc.querySelector('[data-zone="' + target.zoneId + '"]').click();
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error('Reef House did not complete');
  })()`);
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.match(evaluate("document.querySelector('#forest-milestone-video').src"), /reef-video-09\.mp4$/);
  browser('click', '#forest-milestone-play-btn');
  browser('wait', '#world-complete-overlay.is-visible');
  browser('click', '#world-complete-button');
  const completedForest = readSave(forestKey);
  const completedReef = readSave(reefKey);
  editMapProfile();
  select('wonder', 1);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'wonder');
  editMapProfile();
  select('reef', 72);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'reef');
  assert.deepEqual(readSave(reefKey), completedReef, 'Opening completed Reef preserves the stage 72 result');

  const forestRoundKey = `house-round-forest-${id}-en-trail-house-1`;
  const reefHistory = `magic-house-previous-requests-v1:${id}:reef-house-1:en`;
  const otherLanguageHistory = `magic-house-previous-requests-v1:${id}:reef-house-1:he`;
  evaluate(`(() => {
    window.bubblesSaveClient.setItem('${forestRoundKey}', '{}');
    localStorage.setItem('${reefHistory}', '[]');
    localStorage.setItem('${otherLanguageHistory}', '[]');
    return true;
  })()`);
  editMapProfile();
  select('reef', 37);
  browser('click', '#editor-close');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '37');
  assert.deepEqual(readSave(reefKey).progress, {});
  assert.ok(readSave(reefKey).unlockedVideos.includes('reef-video-09'), 'A Reef reset keeps earned videos available for replay');
  assert.deepEqual(readSave(forestKey), completedForest);
  assert.deepEqual(readSave(forestRoundKey), {});
  assert.equal(evaluate(`localStorage.getItem('${reefHistory}')`), null);
  assert.equal(evaluate(`localStorage.getItem('${otherLanguageHistory}')`), '[]');
  const resetReef = readSave(reefKey);

  editMapProfile();
  select('wonder', 6);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'wonder');
  assert.equal(readSave(wonderKey).currentStage, 6);
  assert.deepEqual(readSave(reefKey), resetReef);
  editMapProfile();
  select('forest', 36);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'forest');
  assert.equal(evaluate("document.querySelector('#traveller').dataset.stage"), '36');
  assert.deepEqual(readSave(forestKey), completedForest, 'Opening completed Forest preserves its earned stars');
  browser('click', '#destinations-nav-button');
  browser('press', 'Escape');
  assert.equal(mapWorld(), 'forest', 'Closing the destination chooser keeps the selected Forest map');
  editMapProfile();
  select('forest', 36);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'forest');
  assert.equal(readSave(forestKey).progress[36], undefined);
  assert.deepEqual(readSave(reefKey), resetReef);
  editMapProfile();
  const updatedWonder = readSave(wonderKey);
  select('wonder', 6);
  browser('click', '#editor-close');
  assert.equal(mapWorld(), 'wonder');
  assert.deepEqual(readSave(wonderKey), updatedWonder, 'A world-only switch preserves the selected world’s progress');
  assert.equal(browser('errors').trim(), '');
  console.log('PASS: profile world and stage controls, Reef gallery and captions, stage 72 completion, scoped reset, and world-only switching.');
} finally {
  browser('close');
}
