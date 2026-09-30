import { getPainterWord } from '../prototype/shared/painter-content.mjs';
import { calculateMasteryStars, formatStarRating } from '../prototype/shared/activity-scoring.mjs';

// Promoted from the reviewed Magic Brush Painter prototype (9b71348).
export function mountPainter(root, { wordId, language, speakWord, speakGuidance, speakLetter, onExit, onComplete }) {
const get = id => root.querySelector('#' + id);
let disposed = false;
const timers = new Set();
const frames = new Set();
function schedule(callback, delay) {
  const id = setTimeout(() => { timers.delete(id); if (!disposed) callback(); }, delay);
  timers.add(id); return id;
}
function animate(callback) {
  const id = requestAnimationFrame(time => { frames.delete(id); if (!disposed) callback(time); });
  frames.add(id); return id;
}
function dispose() {
  if (disposed) return;
  disposed = true;
  setCompletionModal(false);
  timers.forEach(clearTimeout);
  frames.forEach(cancelAnimationFrame);
  motionPreference.removeEventListener('change', updateDashMotion);
  if (audioCtx) audioCtx.close();
  delete window.render_game_to_text;
  delete window.advanceTime;
}

// --- Web Audio Synthesizer for cheerful sound effects ---
let audioCtx = null;
function playChime(freq = 440, duration = 0.22) {
  if (!audioCtx) return;
  {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }
}
function playSplashChime() {
  [440, 554.37, 659.25].forEach((f, i) => schedule(() => playChime(f, 0.3), i * 80));
}
function playFanfare() {
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((f, i) => schedule(() => playChime(f, 0.4), i * 110));
}
function playDissolveSound() {
  {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  }
}

const data = getPainterWord(wordId, language);
const currentLang = language;
const totalStrokes = data.letters.reduce((sum, letter) => sum + letter.strokes.length, 0);
let mistakes = 0;
let brushColor = '#FF5E62';
let letterIdx = 0;
let strokeIdx = 0;
let activeMasks = [];

// Stroke validation state
// A stroke passes only if the child starts at ①, stays inside the letter
// corridor the whole way, moves forward along the stroke in order, and
// reaches the end without scribbling.
const START_RADIUS = 36;        // px: how close the first touch must be to ①
const CORRIDOR = 26;            // px: max distance from the stroke centerline
const MAX_AHEAD = 40;           // px: max progress jump per sub-step (no shortcuts)
const MAX_BACKTRACK = 24;       // px: small wobble backwards allowed
const SCRIBBLE_RATIO = 1.4;     // drawn length vs. covered length
const SCRIBBLE_SLACK = 30;      // px of forgiveness for small wobbles
const END_MARGIN = 10;          // px from the end that counts as finished
const SUBSTEP = 6;              // px: interpolate fast moves in small steps

let pathSamples = [];           // dense samples along the stroke {x, y, len}
let strokeLength = 0;
let progressLen = 0;            // furthest valid distance reached along the stroke
let drawnLen = 0;               // total ink length drawn in this attempt
let userPathPoints = [];
let completedStrokes = [];      // strokes of the current letter that passed
let fadingStroke = null;        // failed attempt fading out {points, color, alpha}; separate from the live attempt
let isDrawing = false;
let pausedStroke = false;       // a valid partial stroke can continue after a finger lifts
let awaitingResumePoint = false; // a nearby regrab must reach the saved checkpoint before adding ink
let inputLocked = false;        // true between letters, until the next guide and state are loaded
let letterTransitionTimer = null;
let firstLetterSpoken = false;

// Flowing arrow-dashes along the current stroke
const DASH_SPACING = 20;        // px between arrows
const DASH_EDGE = 18;           // keep clear of the start dot and the end star
const DASH_FADE = 10;           // px over which arrows fade in/out at the ends
const DASH_SPEED = 20;          // px per second along the path
let dashArrows = [];
let dashCycle = 0;              // total loop length (count * spacing)
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let dashFrame = null;

const canvas = get('paint-canvas');
const ctx = canvas.getContext('2d');

function setBrushColor(color, el) {
  brushColor = color;
  root.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  root.querySelectorAll('.color-dot').forEach(dot => dot.setAttribute('aria-pressed', String(dot === el)));
  playChime(500, 0.1);
}

function updateColorMask() {
  const wrap = get('art-color-wrap');
  if (activeMasks.length === 0) {
    wrap.style.webkitMaskImage = 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))';
    wrap.style.maskImage = 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))';
  } else if (activeMasks.includes('full')) {
    wrap.style.webkitMaskImage = 'none';
    wrap.style.maskImage = 'none';
  } else {
    const combined = activeMasks.join(', ');
    wrap.style.webkitMaskImage = combined;
    wrap.style.maskImage = combined;
  }
}

function resetRound() {
  setCompletionModal(false);
  clearTimeout(letterTransitionTimer);
  letterTransitionTimer = null;
  inputLocked = false;
  fadingStroke = null;
  letterIdx = 0;
  strokeIdx = 0;
  activeMasks = [];
  firstLetterSpoken = false;
  updateColorMask();

  const colorImg = get('art-color-img');
  colorImg.classList.remove('bloom-pop');
  get('paint-caption').textContent = 'כל אות שתציירו במדויק תחשוף גל צבעי מים בציור! 🎨';

  completedStrokes = [];
  userPathPoints = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderWordBanner();
  loadStroke();
}

function renderWordBanner() {
  
  const banner = get('word-banner');
  banner.style.direction = currentLang === 'en' ? 'ltr' : 'rtl';
  banner.innerHTML = `<span class="word-banner-title">${currentLang === 'en' ? 'Word:' : 'המילה:'}</span>`;

  data.letters.forEach((item, idx) => {
    const slot = document.createElement('div');
    slot.className = 'letter-slot';
    slot.id = `slot-${idx}`;
    if (idx < letterIdx) {
      slot.classList.add('filled');
      slot.textContent = item.char;
    } else if (idx === letterIdx) {
      slot.classList.add('active');
      slot.textContent = item.char;
    } else {
      slot.textContent = '?';
    }
    banner.appendChild(slot);
  });
}

function setStartMarker(point) {
  const dot = get('svg-start-dot');
  const txt = get('svg-start-text');
  dot.setAttribute('cx', point.x);
  dot.setAttribute('cy', point.y);
  txt.setAttribute('x', point.x);
  txt.setAttribute('y', point.y);
}

function loadStroke() {
  clearFeedback();
  if (letterIdx >= data.letters.length) {
    onCompleteWord();
    return;
  }

  const curLetter = data.letters[letterIdx];
  const curStroke = curLetter.strokes[strokeIdx];

  // Update instruction
  get('slate-instruction-text').textContent =
    `האות ${curLetter.char} · קו ${strokeIdx + 1} מתוך ${curLetter.strokes.length}`;
  get('paint-badge').textContent =
    `נצבע: ${letterIdx} / ${data.letters.length}`;

  // Update Faint Full Letter Background
  const fullLetterD = curLetter.strokes.map(s => s.d).join(' ');
  get('svg-ghost-letter').setAttribute('d', fullLetterD);

  // Update Start Point ①
  const txt = get('svg-start-text');
  setStartMarker(curStroke.from);
  txt.textContent = curStroke.label;

  // Update End Star
  const star = get('svg-end-star');
  star.setAttribute('x', curStroke.to.x);
  star.setAttribute('y', curStroke.to.y + 4);

  // Densely sample the stroke centerline (every ~3px) for validation
  const mathPath = get('svg-stroke-path');
  mathPath.setAttribute('d', curStroke.d);
  strokeLength = mathPath.getTotalLength();
  pathSamples = [];
  const count = Math.max(20, Math.ceil(strokeLength / 3));
  for (let i = 0; i <= count; i++) {
    const len = (i / count) * strokeLength;
    const p = mathPath.getPointAtLength(len);
    pathSamples.push({ x: p.x, y: p.y, len });
  }

  // Arrow-dashes: positioned every frame by animateDashArrows()
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const dashGroup = get('svg-stroke-dashes');
  dashGroup.innerHTML = '';
  const dashSpan = strokeLength - DASH_EDGE * 2;
  const dashCount = Math.max(1, Math.ceil(dashSpan / DASH_SPACING));
  dashCycle = dashCount * DASH_SPACING;
  dashArrows = [];
  for (let i = 0; i < dashCount; i++) {
    const arrow = document.createElementNS(SVG_NS, 'g');
    arrow.setAttribute('class', 'dash-arrow');
    const shaft = document.createElementNS(SVG_NS, 'line');
    shaft.setAttribute('class', 'dash-arrow-shaft');
    shaft.setAttribute('x1', -6);
    shaft.setAttribute('y1', 0);
    shaft.setAttribute('x2', 1);
    shaft.setAttribute('y2', 0);
    const head = document.createElementNS(SVG_NS, 'path');
    head.setAttribute('class', 'dash-arrow-head');
    head.setAttribute('d', 'M0 -5 L7 0 L0 5 Z');
    arrow.appendChild(shaft);
    arrow.appendChild(head);
    dashGroup.appendChild(arrow);
    dashArrows.push(arrow);
  }

  progressLen = 0;
  drawnLen = 0;
  userPathPoints = [];
  isDrawing = false;
  pausedStroke = false;
  awaitingResumePoint = false;
  updateDashMotion();
}

// Slide every arrow-dash forward along the real path; arrows fade in at ① and
// fade out before ⭐, and wrap around only while invisible, so the flow never jumps.
function renderDashArrows(phase) {
  const path = get('svg-stroke-path');
  const span = strokeLength - DASH_EDGE * 2;
  dashArrows.forEach((arrow, i) => {
    const u = (phase + i * DASH_SPACING) % dashCycle;
    const opacity = Math.max(0, Math.min(1, u / DASH_FADE, (span - u) / DASH_FADE));
    arrow.setAttribute('opacity', opacity);
    if (opacity === 0) return;
    const len = DASH_EDGE + u;
    const p = path.getPointAtLength(len);
    const behind = path.getPointAtLength(len - 2);
    const ahead = path.getPointAtLength(len + 2);
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
    arrow.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})`);
  });
}
function animateDashArrows(time) {
  renderDashArrows((time / 1000) * DASH_SPEED);
  dashFrame = animate(animateDashArrows);
}
function updateDashMotion() {
  if (dashFrame !== null) {
    cancelAnimationFrame(dashFrame);
    frames.delete(dashFrame);
    dashFrame = null;
  }
  if (motionPreference.matches) renderDashArrows(DASH_SPACING / 2);
  else dashFrame = animate(animateDashArrows);
}
motionPreference.addEventListener('change', updateDashMotion);

// Coordinate extraction
function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return {
    x: (t.clientX - rect.left) * (canvas.width / rect.width),
    y: (t.clientY - rect.top) * (canvas.height / rect.height)
  };
}

// --- Canvas painting helpers ---
const BRUSH_WIDTH = 14;         // px (the letter corridor is 26px wide)
const BRUSH_OPACITY = 0.6;      // see-through ink so the guide arrows show beneath

function paintPoints(points, color, alpha = 1) {
  if (points.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha * BRUSH_OPACITY;
  ctx.strokeStyle = color;
  ctx.lineWidth = BRUSH_WIDTH;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (point === null) continue;
    if (i === 0 || points[i - 1] === null) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
  ctx.restore();
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  completedStrokes.forEach(s => paintPoints(s.points, s.color, 1));
  if (fadingStroke) paintPoints(fadingStroke.points, fadingStroke.color, fadingStroke.alpha);
  paintPoints(userPathPoints, brushColor, 1);
}

// --- Mistake feedback ---
let feedbackTimer = null;
function clearFeedback() {
  clearTimeout(feedbackTimer);
  timers.delete(feedbackTimer);
  feedbackTimer = null;
  get('slate-feedback').classList.remove('show');
  get('slate-feedback').textContent = '';
  get('slate-board').classList.remove('shake');
}
function showFeedback(message, shake = true) {
  clearFeedback();
  const el = get('slate-feedback');
  el.textContent = message;
  el.classList.add('show');
  if (shake) {
    get('slate-board').classList.remove('shake');
    void get('slate-board').offsetWidth;
    get('slate-board').classList.add('shake');
  }
  feedbackTimer = schedule(() => el.classList.remove('show'), 1800);
}

const FEEDBACK = {
  start: 'התחילו מהנקודה הוורודה',
  off: 'אופס! יצאתם מהקו — נסו שוב מהנקודה הוורודה',
  backwards: 'לכיוון החץ, מהנקודה הוורודה אל הכוכב ⭐',
  scribble: 'בקו אחד רגוע לאורך החץ ✏️',
  continue: 'יופי! המשיכו מהנקודה הוורודה עד הכוכב ⭐',
  resume: 'חזרו לנקודה הוורודה כדי להמשיך ⭐',
};

function failStroke(reason) {
  mistakes++;
  isDrawing = false;
  pausedStroke = false;
  awaitingResumePoint = false;
  progressLen = 0;
  drawnLen = 0;
  setStartMarker(pathSamples[0]);
  playDissolveSound();
  showFeedback(FEEDBACK[reason]);
  // Hand the failed ink to its own fade; a new attempt can start right away.
  const fading = { points: userPathPoints, color: brushColor, alpha: 1 };
  fadingStroke = fading;
  userPathPoints = [];
  const fade = () => {
    if (fadingStroke !== fading) return;   // replaced by a newer failure or a reset
    fading.alpha -= 0.12;
    if (fading.alpha <= 0) fadingStroke = null;
    redrawCanvas();
    if (fadingStroke === fading) animate(fade);
  };
  redrawCanvas();
  animate(fade);
}

// --- Stroke validation ---
// Returns the nearest centerline sample inside the allowed progress window,
// so a finger near a *different* part of the stroke (e.g. the end of P's loop,
// which sits right next to its start) can never be used as a shortcut.
function nearestInWindow(pt) {
  let best = null;
  let bestDist = Infinity;
  const minLen = progressLen - MAX_BACKTRACK;
  const maxLen = progressLen + MAX_AHEAD;
  for (const s of pathSamples) {
    if (s.len < minLen || s.len > maxLen) continue;
    const d = Math.hypot(pt.x - s.x, pt.y - s.y);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return { sample: best, dist: bestDist };
}

// Nearest sample anywhere on the stroke (used to tell "backwards" from "off")
function nearestAnywhere(pt) {
  let best = null;
  let bestDist = Infinity;
  for (const s of pathSamples) {
    const d = Math.hypot(pt.x - s.x, pt.y - s.y);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return { sample: best, dist: bestDist };
}

// Validates one small step of the finger. Returns a failure reason or null.
function validateStep(pt) {
  const local = nearestInWindow(pt);
  if (local.sample && local.dist <= CORRIDOR) {
    if (local.sample.len > progressLen) {
      const before = progressLen;
      progressLen = local.sample.len;
      // melodic rising chime roughly every 15% of the stroke
      const step = strokeLength * 0.15;
      if (Math.floor(progressLen / step) > Math.floor(before / step)) {
        playChime(380 + (progressLen / strokeLength) * 320, 0.08);
      }
    }
    return null;
  }
  // Outside the allowed window: is the finger on an earlier part of the stroke?
  const global = nearestAnywhere(pt);
  if (global.dist <= CORRIDOR && global.sample.len < progressLen - MAX_BACKTRACK) {
    return 'backwards';
  }
  return 'off';
}

function onDrawDown(e) {
  e.preventDefault();
  if (inputLocked || disposed) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  if (letterIdx >= data.letters.length) return;
  const pt = getTouchPos(e);
  const start = pausedStroke ? get('svg-stroke-path').getPointAtLength(progressLen) : pathSamples[0];

  if (Math.hypot(pt.x - start.x, pt.y - start.y) > START_RADIUS) {
    showFeedback(pausedStroke ? FEEDBACK.resume : FEEDBACK.start, false);
    return;
  }

  if (pausedStroke) {
    const checkpoint = nearestInWindow(pt);
    if (checkpoint.dist > CORRIDOR || checkpoint.sample.len > progressLen) {
      awaitingResumePoint = true;
      showFeedback(FEEDBACK.resume, false);
      return;
    }
  }

  awaitingResumePoint = false;
  clearFeedback();
  isDrawing = true;
  if (pausedStroke) userPathPoints.push(null, pt);
  else {
    progressLen = 0;
    drawnLen = 0;
    userPathPoints = [pt];
  }
  pausedStroke = false;
  if (!firstLetterSpoken) {
    firstLetterSpoken = true;
    speakLetter(data.letters[0].char);
  }
  playChime(360, 0.12);
}

function onDrawMove(e) {
  if (awaitingResumePoint) {
    onDrawDown(e);
    return;
  }
  if (!isDrawing) return;
  e.preventDefault();
  const target = getTouchPos(e);
  const prev = userPathPoints[userPathPoints.length - 1];
  const segLen = Math.hypot(target.x - prev.x, target.y - prev.y);
  if (segLen < 1) return;

  // Validate in small sub-steps so a fast swipe can't jump over the path
  const steps = Math.max(1, Math.ceil(segLen / SUBSTEP));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const pt = { x: prev.x + (target.x - prev.x) * t, y: prev.y + (target.y - prev.y) * t };
    const last = userPathPoints[userPathPoints.length - 1];
    drawnLen += Math.hypot(pt.x - last.x, pt.y - last.y);
    userPathPoints.push(pt);

    const failure = validateStep(pt);
    if (failure) {
      redrawCanvas();
      failStroke(failure);
      return;
    }

    // Scribbling: far more ink than forward progress along the stroke
    if (drawnLen > progressLen * SCRIBBLE_RATIO + SCRIBBLE_SLACK) {
      redrawCanvas();
      failStroke('scribble');
      return;
    }

    if (progressLen >= strokeLength - END_MARGIN) {
      redrawCanvas();
      onStrokeSuccess();
      return;
    }
  }
  redrawCanvas();
}

function onDrawUp() {
  awaitingResumePoint = false;
  if (!isDrawing) return;
  isDrawing = false;
  pausedStroke = true;
  setStartMarker(get('svg-stroke-path').getPointAtLength(progressLen));
  showFeedback(FEEDBACK.continue, false);
}

function onStrokeSuccess() {
  isDrawing = false;
  pausedStroke = false;
  clearFeedback();
  playSplashChime();

  // Keep the child's own successful stroke painted on the letter
  completedStrokes.push({ points: userPathPoints.slice(), color: brushColor });
  userPathPoints = [];
  redrawCanvas();

  
  const curLetter = data.letters[letterIdx];
  strokeIdx++;

  if (strokeIdx < curLetter.strokes.length) {
    loadStroke();
  } else {
    onCompleteLetter(curLetter);
  }
}

function onCompleteLetter(letterObj) {
  playChime(780, 0.4);

  // 1. Add watercolor mask bloom for this letter
  const fraction = (letterIdx + 1) / data.letters.length;
  activeMasks = fraction === 1 ? ['full'] : [
    `linear-gradient(${currentLang === 'he' ? 'to left' : 'to right'}, black 0%, black ${fraction * 100 - 5}%, transparent ${fraction * 100 + 12}%)`,
  ];
  updateColorMask();
  const colorImg = get('art-color-img');
  colorImg.classList.remove('bloom-pop');
  void colorImg.offsetWidth;
  colorImg.classList.add('bloom-pop');

  // Update caption
  get('paint-caption').textContent = 'עוד אות, עוד צבע! ✨';

  // 2. Mark Word Slot Filled
  const slot = get(`slot-${letterIdx}`);
  slot.classList.remove('active');
  slot.classList.add('filled');
  slot.textContent = letterObj.char;

  // Advance: let the finished letter shine briefly, then clear the slate.
  // Drawing stays locked until the next letter's guide and state are loaded.
  letterIdx++;
  strokeIdx = 0;
  inputLocked = true;
  letterTransitionTimer = schedule(() => {
    letterTransitionTimer = null;
    completedStrokes = [];
    userPathPoints = [];
    redrawCanvas();
    renderWordBanner();
    loadStroke();
    inputLocked = false;
    if (letterIdx < data.letters.length) speakLetter(data.letters[letterIdx].char);
  }, 700);
}

function setCompletionModal(open) {
  const dialog = get('celebrate-overlay');
  for (const child of root.children) {
    if (child !== dialog) child.inert = open;
  }
  dialog.classList.toggle('show', open);
  if (open) get('painter-finish').focus();
}

function onCompleteWord() {
  playFanfare();
  get('paint-badge').textContent = `הושלם! ✨`;
  get('painter-stars').textContent = formatStarRating(calculateMasteryStars({ mistakes, challengeSize: totalStrokes }));
  setCompletionModal(true);
  speakWord();
}


let activePointer = null;
canvas.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || activePointer !== null || inputLocked) return;
  activePointer = event.pointerId;
  canvas.setPointerCapture(event.pointerId);
  onDrawDown(event);
});
canvas.addEventListener('pointermove', event => {
  if (event.pointerId === activePointer) onDrawMove(event);
});
function releasePointer(event) {
  if (event.pointerId !== activePointer) return;
  activePointer = null;
  onDrawUp();
}
canvas.addEventListener('pointerup', releasePointer);
canvas.addEventListener('pointercancel', releasePointer);
canvas.addEventListener('lostpointercapture', releasePointer);
get('celebrate-overlay').addEventListener('keydown', event => {
  // Continue is this dialog's only action; keep both Tab directions on it.
  if (event.key === 'Tab') {
    event.preventDefault();
    get('painter-finish').focus();
  }
});
get('painter-back').onclick = () => { dispose(); onExit(); };
get('painter-sound').onclick = () => {
  if (inputLocked || letterIdx >= data.letters.length) return;
  firstLetterSpoken = true;
  speakGuidance(data.letters[letterIdx].char);
};
get('painter-finish').onclick = () => {
  if (letterIdx !== data.letters.length) return;
  const stars = calculateMasteryStars({ mistakes, challengeSize: totalStrokes });
  dispose(); onComplete(stars);
};
root.querySelectorAll('.color-dot').forEach(button => button.addEventListener('click', () => setBrushColor(button.dataset.color, button)));
root.querySelector('.color-dot.active').setAttribute('aria-pressed', 'true');
root.querySelectorAll('.art-layer').forEach(image => { image.src = './prototype/' + data.picture; });
resetRound();
window.render_game_to_text = () => JSON.stringify({
  game: 'magic-painter', language, wordId, word: data.word, letterIdx, strokeIdx,
  mistakes, inputLocked, isDrawing, pausedStroke, progressLen, completedStrokes: completedStrokes.length,
  complete: letterIdx === data.letters.length,
  stroke: letterIdx < data.letters.length ? data.letters[letterIdx].strokes[strokeIdx] : null,
});
window.advanceTime = milliseconds => new Promise(resolve => schedule(resolve, milliseconds));
return dispose;

}
