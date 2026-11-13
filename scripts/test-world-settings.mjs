// Run against the built app on the temporary localhost save server.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'world-settings', ...args], { encoding: 'utf8', timeout: 35_000 });
const evaluate = code => JSON.parse(browser('eval', code));
const origin = 'http://127.0.0.1:8788';
const url = `${origin}/prototype/world-map.html`;
const name = `Art${String(Date.now()).slice(-6)}`;
const chooseWorld = world => browser('click', `[data-settings-world="${world}"]`);
const openMapSettings = () => {
  browser('click', '#profile-button');
  browser('click', '#world-settings-button');
};

try {
  browser('open', url);
  browser('wait', '.gate-profile-choice');
  browser('click', '#add-profile-button');
  browser('fill', '#profile-name-input', name);
  browser('click', '.save-profile-button');
  const id = evaluate(`JSON.parse(window.bubblesSaveClient.getItem('bubble_world_map_profiles_v1')).find(profile => profile.name === '${name}').id`);
  const profile = `.gate-profile-choice[data-profile="${id}"]`;
  const saves = () => evaluate(`['route-${id}', 'forest-route-${id}-en', 'reef-route-${id}-en'].map(key => window.bubblesSaveClient.getItem(key))`);
  browser('click', profile);
  const before = saves();
  assert.equal(before[2], null);
  assert.equal(browser('get', 'count', '#destination-settings-button').trim(), '1', 'Settings is available before entering a world');
  browser('click', '#destination-settings-button');
  assert.equal(browser('get', 'count', '[data-settings-world]').trim(), '3');
  chooseWorld('reef');
  browser('wait', '#reef-art-visit[open]');
  browser('set', 'viewport', '390', '844');
  browser('wait', '--fn', "document.querySelector('#reef-visit-map img').naturalWidth > 0");
  const dimensions = evaluate(`(() => {
    const map = document.querySelector('#reef-visit-map');
    map.scrollLeft = map.scrollWidth;
    const right = map.scrollLeft;
    map.scrollLeft = 0;
    return { right, left: map.scrollLeft, width: map.clientWidth };
  })()`);
  assert.equal(dimensions.width, 390);
  assert.equal(dimensions.left, 0);
  assert.ok(dimensions.right > 0, 'The map can be explored horizontally on a phone');
  assert.equal(browser('get', 'url').trim(), url);

  browser('click', '#reef-visit-story');
  browser('wait', '#reef-visit-video:not([hidden])');
  assert.match(evaluate("document.querySelector('#reef-visit-video').src"), /reef-video-01\.mp4$/);
  assert.deepEqual(evaluate("Array.from(document.querySelector('#reef-visit-video').textTracks, track => [track.mode, track.cues.length > 0])"), [['hidden', true], ['showing', true]]);
  evaluate(`(async () => {
    const video = document.querySelector('#reef-visit-video');
    video.playbackRate = 4;
    await video.play();
    return true;
  })()`);
  browser('wait', '--fn', "document.querySelector('#reef-visit-video').ended");
  browser('press', 'Escape');
  browser('wait', '--fn', "!document.querySelector('#reef-art-visit').open && !document.querySelector('#reef-visit-video').hasAttribute('src')");
  assert.equal(evaluate("document.querySelector('#destination-gate').hidden"), false);
  assert.deepEqual(saves(), before, 'Watching the opening in Settings leaves the journey saves unchanged');

  browser('click', '#destination-settings-button');
  chooseWorld('wonder');
  assert.equal(evaluate("document.querySelector('#world').dataset.mapWorld"), 'wonder');
  openMapSettings();
  chooseWorld('reef');
  browser('click', '#reef-visit-close');
  assert.equal(evaluate("document.querySelector('#world').dataset.mapWorld"), 'wonder');
  assert.deepEqual(saves(), before);
  assert.equal(evaluate("document.querySelector('#play-button').disabled"), false);

  browser('click', '#world-settings-button');
  chooseWorld('forest');
  browser('wait', '#forest-character-picker:not([hidden])');
  browser('click', '[data-character="adva"]');
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  assert.match(evaluate("document.querySelector('#forest-milestone-video').src"), /forest-video-01\.mp4$/);
  assert.equal(evaluate("document.querySelector('#world').dataset.mapWorld"), 'forest');
  assert.equal(saves()[2], null);
  browser('click', '#forest-milestone-play-btn');

  browser('click', '#profile-button');
  browser('click', '#edit-profile-button');
  browser('select', '#track-world-select', 'reef');
  browser('click', '#track-reset-button');
  browser('click', '#confirm-track-reset-button');
  browser('click', '#editor-close');
  const earned = saves();
  openMapSettings();
  chooseWorld('wonder');
  openMapSettings();
  chooseWorld('reef');
  assert.equal(evaluate("document.querySelector('#reef-art-visit').open"), false);
  assert.equal(evaluate("document.querySelector('#world').dataset.mapWorld"), 'reef');
  assert.equal(browser('get', 'url').trim(), `${url}#reef`);
  assert.equal(browser('is', 'enabled', '.world-stage[data-stage="37"]').trim(), 'true');
  assert.deepEqual(saves(), earned);
  assert.equal(browser('errors').trim(), '');
  console.log('PASS: Settings visits, phone artwork panning, real Reef opening playback, save isolation, and entering the playable Reef.');
} finally {
  browser('close');
}
