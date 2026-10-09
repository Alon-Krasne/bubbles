import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'painter-acceptance', ...args], {
  encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
});
// Pass scripts on stdin so quotes and Hebrew text never go through a shell.
function evalScript(code) {
  return JSON.parse(execFileSync('agent-browser', ['--session', 'painter-acceptance', 'eval', '--stdin'], {
    encoding: 'utf8', input: code, maxBuffer: 2 * 1024 * 1024,
  }));
}

function assertBrowserClean() {
  const errors = JSON.parse(browser('--json', 'errors')).data.errors;
  const consoleErrors = JSON.parse(browser('--json', 'console')).data.messages.filter(message => message.type === 'error');
  assert.deepEqual(errors, [], `Browser runtime errors: ${JSON.stringify(errors)}`);
  assert.deepEqual(consoleErrors, [], `Browser console errors: ${JSON.stringify(consoleErrors)}`);
}

const state = () => evalScript('JSON.parse(window.render_game_to_text())');
const mousePoint = distance => evalScript(`(() => {
  const canvas=document.querySelector('#paint-canvas'),r=canvas.getBoundingClientRect();
  const p=document.querySelector('#svg-stroke-path').getPointAtLength(${distance});
  return {x:r.left+p.x*r.width/320,y:r.top+p.y*r.height/320};
})()`);
const move = point => {
  assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y), `Mouse coordinates: ${JSON.stringify(point)}`);
  browser('mouse', 'move', String(Math.round(point.x)), String(Math.round(point.y)));
};
function drawStroke(from = 0) {
  const length=evalScript("document.querySelector('#svg-stroke-path').getTotalLength()");
  move(mousePoint(from));browser('mouse','down');
  for(let distance=from+16;distance<length;distance+=16) move(mousePoint(distance));
  move(mousePoint(length));browser('mouse','up');
}

function openPainter(language) {
  const params=new URLSearchParams({host:'world-map',activity:'magic-painter',level:'trail-painter-1',stage:'5',
    profile:'mouse-test',profileName:'בדיקה',profileEmoji:'🦄',profileCharacter:'unicorn',profileLanguage:language,destination:'wonder'});
  browser('open','http://127.0.0.1:8788/index.html?'+params);
  browser('wait','#paint-canvas');
}

function checkMouseAndDialog(language) {
  openPainter(language);
  evalScript("window.mouseTestMessages=[];window.addEventListener('message',event=>{if(event.data.type==='bubbles.activity.complete'||event.data.type==='bubbles.activity.exit')window.mouseTestMessages.push(event.data)});true");

  // Actual mouse capture must deliver moves and release outside the board.
  move(mousePoint(0));browser('mouse','down');move(mousePoint(32));
  const outside=evalScript("(() => {const r=document.querySelector('#paint-canvas').getBoundingClientRect();return {x:r.right+40,y:r.top+40}})()");
  move(outside);
  assert.ok(evalScript("document.querySelector('#paint-canvas').hasPointerCapture(1)"),'mouse remains captured outside the board');
  browser('mouse','up');
  assert.equal(state().isDrawing,false);
  assert.equal(state().mistakes,1,'off-board mouse drag is rejected');
  assert.equal(evalScript("document.querySelector('#paint-canvas').hasPointerCapture(1)"),false);

  // Each stroke must be one continuous drag. Releasing midway clears its ink
  // and progress; a new drag must begin at the original start marker.
  const length=evalScript("document.querySelector('#svg-stroke-path').getTotalLength()");
  move(mousePoint(0));browser('mouse','down');
  for(let distance=16;distance<length/2;distance+=16) move(mousePoint(distance));
  const checkpoint=state().progressLen;
  assert.ok(checkpoint>0,'partial native mouse drag makes progress before release');
  browser('mouse','up');
  assert.equal(state().progressLen,0,'releasing midway discards progress and requires a continuous stroke');
  assert.equal(state().isDrawing,false);
  assert.equal(state().mistakes,1,'releasing midway adds no mistake penalty');
  assert.ok(evalScript(`(() => {
    const canvas=document.querySelector('#paint-canvas');
    return !canvas.getContext('2d').getImageData(0,0,320,320).data.some((value,index)=>index%4===3 && value!==0);
  })()`),'native mouse-up clears all unfinished ink');
  assert.ok(evalScript(`(() => {
    const point=document.querySelector('#svg-stroke-path').getPointAtLength(0),dot=document.querySelector('#svg-start-dot');
    return Math.hypot(Number(dot.getAttribute('cx'))-point.x,Number(dot.getAttribute('cy'))-point.y)<0.01;
  })()`),'marker stays at the original stroke start');
  browser('screenshot',`/tmp/painter-continuous-${language}.png`);
  move(mousePoint(checkpoint));browser('mouse','down');move(mousePoint(checkpoint+12));browser('mouse','up');
  assert.equal(state().progressLen,0,'regrabbing the discarded endpoint cannot continue a stroke');
  assert.equal(state().isDrawing,false);
  drawStroke();
  assert.ok(state().letterIdx>0 || state().strokeIdx>0,'one continuous mouse drag completes the stroke');
  assert.equal(evalScript("document.querySelector('#slate-feedback').classList.contains('show')"),false);

  for(let attempt=0;!state().complete && attempt<20;attempt++) {
    if(state().inputLocked) browser('wait','--fn','!JSON.parse(window.render_game_to_text()).inputLocked');
    else drawStroke();
  }
  assert.ok(state().complete,'native mouse completes the word');
  browser('wait','#celebrate-overlay.show');
  assert.equal(evalScript('document.activeElement.id'),'painter-finish');
  for(const key of ['Shift+Tab','Tab','Shift+Tab']) {
    browser('press',key);
    assert.ok(evalScript("document.querySelector('#celebrate-overlay').contains(document.activeElement)"),`completion dialog contains ${key} in ${language}`);
  }
  browser('press','Escape');
  assert.ok(evalScript("document.querySelector('#celebrate-overlay').classList.contains('show')"));
  assert.deepEqual(evalScript('window.mouseTestMessages'),[],'completion dialog cannot accidentally exit before awarding stars');
  browser('press','Enter');
  browser('wait','--fn','window.mouseTestMessages.length===1');
  const messages=evalScript('window.mouseTestMessages');
  assert.equal(messages[0].type,'bubbles.activity.complete');
  assert.ok(messages[0].stars>=1 && messages[0].stars<=3);
  assert.ok(evalScript("[...document.querySelector('#magic-painter-screen').children].every(child=>!child.inert)"),'completion clears background inertness');
  assertBrowserClean();
  console.log(`PASS: native mouse capture, continuous strokes, feedback, and completion keyboard controls (${language}).`);
}

function arrowMotion() {
  return evalScript(`(async()=>{
    await new Promise(requestAnimationFrame);
    const arrows=[...document.querySelectorAll('.dash-arrow')];
    const transforms=()=>arrows.map(arrow=>arrow.getAttribute('transform'));
    const before=transforms();await new Promise(resolve=>setTimeout(resolve,350));
    return {reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,before,after:transforms(),
      visible:arrows.filter(arrow=>Number(arrow.getAttribute('opacity'))>0).length};
  })()`);
}

function checkReducedMotion(language) {
  browser('set','media','light','reduced-motion');openPainter(language);
  const reduced=arrowMotion();
  assert.ok(reduced.reduced && reduced.visible>0,'reduced motion keeps visible direction arrows');
  assert.deepEqual(reduced.after,reduced.before,`initial reduced-motion arrows stay static (${language})`);
  browser('set','media','light');
  const normal=arrowMotion();
  assert.equal(normal.reduced,false);
  assert.notDeepEqual(normal.after,normal.before,'normal motion resumes when the preference changes');
  browser('set','media','light','reduced-motion');
  const changed=arrowMotion();
  assert.ok(changed.reduced && changed.visible>0);
  assert.deepEqual(changed.after,changed.before,'arrows stop when reduced motion is enabled during play');
  browser('set','media','light');
  assertBrowserClean();
  console.log(`PASS: reduced-motion arrows stay visible and static, and preference changes apply during play (${language}).`);
}

try {
  for(const language of ['he','en']) checkReducedMotion(language);
  for(const language of ['he','en']) checkMouseAndDialog(language);
  browser('open', 'http://127.0.0.1:8788/');
  evalScript(readFileSync(new URL('./test-painter-browser.js', import.meta.url), 'utf8'));
  const deadline = Date.now() + 360_000;
  let result;
  do {
    await new Promise(resolve => setTimeout(resolve, 500));
    result = evalScript('window.painterAcceptance');
    assert.ok(Date.now() < deadline, `Painter acceptance timed out: ${JSON.stringify(result)}`);
  } while (result.status === 'running');
  assert.equal(result.status, 'done');
  assert.deepEqual(result.failed, [], JSON.stringify(result));
  assert.deepEqual(result.errors, [], JSON.stringify(result));
  assertBrowserClean();
  console.log(`PASS: ${result.passed} Painter browser checks across 12 words, capital-first/lowercase/uppercase English and Hebrew.`);
} finally {
  browser('close');
}
