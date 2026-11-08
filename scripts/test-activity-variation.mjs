// Run against the local save test server after building the app.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'activity-variation', ...args], { encoding: 'utf8' });
const read = expression => JSON.parse(browser('eval', expression));
const activities = [
  ['memory', '.memory-card'],
  ['shop', '.shop-item-tile'],
  ['house', '.object-button'],
  ['reveal', '#reveal-keyboard'],
  ['painter', '#paint-canvas'],
];

try {
  for (const language of ['en', 'he']) {
    for (const [game, selector] of activities) {
      const stage = TRAIL_STAGES.find(candidate => candidate.game === game);
      const params = new URLSearchParams({ host: 'world-map', activity: stage.activity, level: stage.level,
        stage: String(stage.id), profile: `variation-${language}`, profileName: 'Test', profileEmoji: '🦄',
        profileCharacter: 'unicorn', profileLanguage: language, destination: 'wonder' });
      const seen = [];
      for (let visit = 0; visit < 3; visit++) {
        const path = game === 'house' ? '/prototype/magic-house.html' : '/index.html';
        browser('open', `http://127.0.0.1:8788${path}?${params}`);
        browser('wait', selector);
        const result = read(`(() => {
          const state = window.render_game_to_text ? JSON.parse(window.render_game_to_text()) : null;
          const memoryWords = [...new Set([...document.querySelectorAll('.memory-card')].map(card => card.dataset.wordId))].sort();
          return { state, memoryWords, chosenWord: document.querySelector('#painter-word')?.value };
        })()`);
        if (game === 'memory') seen.push(result.memoryWords);
        if (game === 'shop') seen.push(result.state.targets.map(target => target.itemId));
        if (game === 'house') seen.push(result.state.requestIds);
        if (game === 'reveal') seen.push(result.state.letters);
        if (game === 'painter') {
          assert.equal(result.chosenWord, result.state.wordId, 'the word menu matches the displayed word');
          seen.push(result.state.wordId);
        }
      }
      for (let index = 1; index < seen.length; index++) {
        assert.notDeepEqual(seen[index], seen[index - 1], `${game}/${language} should vary on replay`);
      }
      console.log(`PASS: ${game}/${language} varies across real replays`);
    }
  }
} finally {
  browser('close');
}
