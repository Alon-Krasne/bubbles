// Run against the local save test server after building the app.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'history-cleanup', ...args], { encoding: 'utf8' });
const read = expression => JSON.parse(browser('eval', expression));
const name = `Test${String(Date.now()).slice(-6)}`;

try {
  browser('open', 'http://127.0.0.1:8788/prototype/world-map.html');
  browser('wait', '.gate-profile-choice');
  browser('click', '#add-profile-button');
  browser('fill', '#profile-name-input', name);
  browser('click', '.save-profile-button');
  browser('wait', '.gate-profile-choice');
  const id = read(`JSON.parse(window.bubblesSaveClient.getItem('bubble_world_map_profiles_v1')).find(profile => profile.name === '${name}').id`);
  const keys = [
    `shop-decks-wonder-en-${id}`,
    `painter-deck-wonder-en-${id}-trail-painter-1`,
    `reveal-deck-forest-he-${id}-trail-reveal-1`,
  ];
  read(`(() => { for (const key of ${JSON.stringify(keys)}) localStorage.setItem(key, '{}'); return true; })()`);
  read(`(() => {
    const card = [...document.querySelectorAll('.gate-profile-card')].find(item => item.textContent.includes('${name}'));
    card.querySelector('.gate-profile-edit').click();
    return true;
  })()`);
  browser('click', '#delete-profile-button');
  browser('click', '#confirm-delete-button');
  const remaining = read(`(() => ${JSON.stringify(keys)}.filter(key => localStorage.getItem(key) !== null))()`);
  assert.deepEqual(remaining, [], 'deleting a profile removes its local activity history');
  console.log('PASS: deleting a profile removes its local activity history');
} finally {
  browser('close');
}
