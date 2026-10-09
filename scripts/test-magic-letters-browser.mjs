import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PORT = 8788;
const browser = (...args) =>
  execFileSync('agent-browser', ['--session', 'letters-check', ...args], {
    encoding: 'utf8',
  });

const evalCode = (code) => JSON.parse(browser('eval', code));
const readState = () => evalCode('JSON.parse(window.render_game_to_text())');
const query = (expression) => evalCode(`(() => { ${expression} })()`);
const statusText = () => query("return document.getElementById('ml-status').textContent.trim();");
const isHebrew = (text) => /[\u05D0-\u05EA]/.test(text);
const placedCount = (state) => state.slots.filter((s) => !s.locked && s.currentChar !== null).length;
const tileSel = (id) => `[data-tile-id="${id}"]`;
const slotSel = (index) => `[data-slot-index="${index}"]`;
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

try {
  for (const language of ['he', 'en']) {
    const params = new URLSearchParams({ activity: 'magic-letters', lang: language });
    browser('open', `http://127.0.0.1:${PORT}/index.html?${params}`);
    browser('wait', '#magic-letters-screen');

    // 1. Preview
    let state = readState();
    assert.equal(state.game, 'magic-letters');
    assert.equal(state.language, language);
    assert.equal(state.phase, 'preview');
    assert.equal(state.roundIndex, 0);
    assert.ok(state.targetWord.length >= 4, `Target word must have 4+ letters: ${state.targetWord}`);

    // Screen text is Hebrew in both modes; only the word itself follows the learning language
    const chrome = query(`
      const root = document.getElementById('magic-letters-screen');
      const hint = document.getElementById('ml-hint-btn');
      return {
        dir: root.dir,
        title: root.querySelector('.ml-header h1').textContent.trim(),
        subtitle: root.querySelector('.ml-header small') !== null,
        back: document.getElementById('ml-back-btn').textContent.trim(),
        wordDir: root.querySelector('.ml-preview-word').dir,
        hintShared: hint.classList.contains('magic-hint-button'),
        hintText: hint.textContent.trim(),
        hintDisabled: hint.disabled,
      };`);
    assert.equal(chrome.dir, 'rtl', `${language}: screen is RTL`);
    assert.equal(chrome.title, 'אותיות הקסם', `${language}: Hebrew title`);
    assert.equal(chrome.back, '← למפה', `${language}: Hebrew back button`);
    assert.equal(chrome.subtitle, false, `${language}: no subtitle repeating the instruction`);
    assert.equal(chrome.wordDir, language === 'en' ? 'ltr' : 'rtl', `${language}: word reads in its own direction`);
    assert.equal(chrome.hintShared, true, `${language}: hint uses the shared magic-hint-button`);
    assert.equal(chrome.hintText, '💡 רמז', `${language}: hint label matches other games`);
    assert.equal(chrome.hintDisabled, true, `${language}: hint is off during preview`);
    assert.ok(isHebrew(statusText()), `${language}: Hebrew preview instruction`);

    // 2. Ready
    browser('click', '#ml-ready-btn');
    state = readState();
    assert.equal(state.phase, 'solving');
    const lockedSlots = state.slots.filter((s) => s.locked);
    assert.ok(lockedSlots.length >= 1, 'Rank 1 must have at least 1 locked anchor letter');
    assert.equal(lockedSlots[0].currentChar, lockedSlots[0].targetChar);

    // One instruction line only
    assert.equal(query("return document.querySelector('.ml-tray-title') !== null;"), false, `${language}: no tray title`);
    assert.equal(statusText(), 'גררו את האותיות למקום!', `${language}: single Hebrew instruction`);
    assert.equal(
      query("return document.querySelector('.ml-slots-row').dir;"),
      language === 'en' ? 'ltr' : 'rtl',
      `${language}: slots read in the word's direction`,
    );

    // 2a. Placement is drag-only: taps do nothing
    const tappedTile = state.tray.find((t) => !t.used);
    browser('click', tileSel(tappedTile.id));
    state = readState();
    assert.equal(placedCount(state), 0, `${language}: tapping a letter does not place it`);

    // 2b. Drag a tile to the LAST empty slot: the drag chooses the slot
    const openSlots = state.slots.filter((s) => s.currentChar === null);
    assert.ok(openSlots.length >= 2, 'Need 2+ open slots');
    const dropSlot = openSlots.at(-1);
    const firstTile = state.tray.find((t) => !t.used && t.char === dropSlot.targetChar);
    const tileUsed = (s, id) => s.tray.find((t) => t.id === id).used;

    browser('drag', tileSel(firstTile.id), slotSel(dropSlot.index));
    state = readState();
    assert.equal(state.slots[dropSlot.index].currentChar, dropSlot.targetChar, `${language}: tile dropped in chosen slot`);
    assert.equal(placedCount(state), 1, `${language}: drag fills only the chosen slot`);

    // Tapping a placed letter does not remove it
    browser('click', slotSel(dropSlot.index));
    assert.equal(readState().slots[dropSlot.index].currentChar, dropSlot.targetChar, `${language}: tapping a placed letter does nothing`);

    // Dropping on a filled slot replaces it; the old letter returns to the tray
    const secondTile = state.tray.find((t) => !t.used && t.id !== firstTile.id);
    browser('drag', tileSel(secondTile.id), slotSel(dropSlot.index));
    state = readState();
    assert.equal(state.slots[dropSlot.index].currentChar, secondTile.char, `${language}: new letter takes the filled slot`);
    assert.equal(tileUsed(state, firstTile.id), false, `${language}: replaced letter returns to the tray`);
    assert.equal(tileUsed(state, secondTile.id), true);
    assert.equal(placedCount(state), 1);

    // Move a placed letter to another empty slot, then drag it back to the tray
    const moveSlot = openSlots[0];
    browser('drag', slotSel(dropSlot.index), slotSel(moveSlot.index));
    state = readState();
    assert.equal(state.slots[dropSlot.index].currentChar, null, `${language}: moved letter leaves its old slot`);
    assert.equal(state.slots[moveSlot.index].currentChar, secondTile.char, `${language}: moved letter lands in new slot`);
    browser('drag', slotSel(moveSlot.index), '.ml-tray-panel');
    state = readState();
    assert.equal(placedCount(state), 0, `${language}: dragging a placed letter to the tray returns it`);
    assert.equal(state.tray.every((t) => !t.used), true);

    // Locked slot and empty space reject drops
    browser('drag', tileSel(firstTile.id), slotSel(lockedSlots[0].index));
    browser('drag', tileSel(firstTile.id), '#ml-status');
    state = readState();
    assert.equal(tileUsed(state, firstTile.id), false, `${language}: locked slot and empty space reject drops`);
    assert.equal(state.mistakes, 0, `${language}: drag moves never count as mistakes`);

    // 2c. A full but wrong word clears the board so the player starts over
    const slotTargets = state.slots.filter((s) => s.currentChar === null);
    const pool = [...state.tray];
    const swapFrom = slotTargets.findIndex((s, i) => i > 0 && s.targetChar !== slotTargets[0].targetChar);
    assert.ok(swapFrom > 0, 'Need two different letters to build a wrong word');
    const orderedTiles = slotTargets.map((slot) => pool.splice(pool.findIndex((t) => t.char === slot.targetChar), 1)[0]);
    [orderedTiles[0], orderedTiles[swapFrom]] = [orderedTiles[swapFrom], orderedTiles[0]];
    orderedTiles.forEach((tile, i) => browser('drag', tileSel(tile.id), slotSel(slotTargets[i].index)));

    state = readState();
    assert.equal(state.isFilled, true, `${language}: wrong word is shown first`);
    assert.equal(state.isCorrect, false);
    assert.equal(state.mistakes, 1, `${language}: a wrong full word counts as one mistake`);
    assert.ok(isHebrew(statusText()), `${language}: Hebrew wrong-word message`);

    for (let attempt = 0; attempt < 30 && state.isFilled; attempt += 1) {
      await sleep(100);
      state = readState();
    }
    assert.equal(placedCount(state), 0, `${language}: wrong word is cleared`);
    assert.ok(state.slots.filter((s) => s.locked).every((s) => s.currentChar === s.targetChar), `${language}: anchors stay`);
    assert.equal(state.tray.every((t) => !t.used), true, `${language}: every tile is back in the tray`);
    assert.equal(state.phase, 'solving');
    assert.equal(statusText(), 'ננסה שוב!', `${language}: short Hebrew retry message`);

    // 3. Hint shows the move but never makes it
    const hintMarks = () => query(`return {
      tile: document.querySelector('.ml-tile-btn.hint-highlight')?.dataset.tileId ?? null,
      slot: document.querySelector('.ml-slot.hint-target')?.dataset.slotIndex ?? null,
      remove: document.querySelector('.ml-slot.hint-remove')?.dataset.slotIndex ?? null,
    };`);

    // A wrong letter in a slot: the hint marks it for removal and leaves it there
    const firstOpen = state.slots.find((s) => s.currentChar === null);
    const wrongTile = state.tray.find((t) => t.char !== firstOpen.targetChar);
    browser('drag', tileSel(wrongTile.id), slotSel(firstOpen.index));
    browser('click', '#ml-hint-btn');
    state = readState();
    assert.equal(state.hints, 1);
    assert.equal(state.slots[firstOpen.index].currentChar, wrongTile.char, `${language}: hint does not remove the letter itself`);
    assert.equal(hintMarks().remove, String(firstOpen.index), `${language}: hint marks the wrong letter`);
    assert.ok(isHebrew(statusText()), `${language}: Hebrew hint message`);
    browser('drag', slotSel(firstOpen.index), '.ml-tray-panel');
    assert.equal(hintMarks().remove, null, `${language}: hint mark clears after the child acts`);

    // An empty board: the hint marks the right letter and its slot, and places nothing
    browser('click', '#ml-hint-btn');
    state = readState();
    assert.equal(state.hints, 2);
    assert.equal(placedCount(state), 0, `${language}: hint does not place a letter`);
    const marks = hintMarks();
    const hintedSlot = state.slots.find((s) => s.currentChar === null);
    assert.equal(marks.slot, String(hintedSlot.index), `${language}: hint marks the next empty slot`);
    assert.equal(state.tray.find((t) => t.id === marks.tile).char, hintedSlot.targetChar, `${language}: hint marks a matching letter`);
    assert.ok(isHebrew(statusText()), `${language}: Hebrew hint message`);

    browser('drag', tileSel(marks.tile), slotSel(hintedSlot.index));
    state = readState();
    assert.equal(state.slots[hintedSlot.index].currentChar, hintedSlot.targetChar);
    assert.deepEqual(hintMarks(), { tile: null, slot: null, remove: null }, `${language}: hint marks clear after the drop`);

    // 4. Finish the word by dragging
    while (!state.isFilled) {
      const openSlot = state.slots.find((s) => s.currentChar === null);
      const matchingTile = state.tray.find((t) => !t.used && t.char === openSlot.targetChar);
      browser('drag', tileSel(matchingTile.id), slotSel(openSlot.index));
      state = readState();
    }
    assert.equal(state.isCorrect, true);
    assert.equal(state.phase, 'complete');
    assert.equal(query("return document.querySelectorAll('.ml-sparkles .ml-sparkle').length > 0;"), true, `${language}: sparkles on success`);
    assert.ok(isHebrew(statusText()), `${language}: Hebrew success message`);
    assert.equal(query("return document.getElementById('ml-hint-btn').disabled;"), true, `${language}: hint is off after success`);

    // 5. Next word
    browser('click', '#ml-next-btn');
    state = readState();
    assert.equal(state.roundIndex, 1);
    assert.equal(state.phase, 'preview');
    assert.equal(query("return document.querySelector('.ml-sparkles') !== null;"), false, `${language}: sparkles end with the word`);

    console.log(`PASS ${language}: Hebrew screen text, shared hint button, drag-only placement, replace on drop, wrong-word reset, show-only hints, sparkles, and next word.`);
  }
} finally {
  try {
    browser('close');
  } catch {
    // Ignore cleanup errors
  }
}
