// Serve the built app with scripts/serve-save-test.mjs, open that origin using
// agent-browser, then run: agent-browser eval --stdin < scripts/test-painter-browser.js
// Uses real hosted activity pages and pointer events; no game-state mutation.
window.painterAcceptance = { status: 'running', progress: 'starting' };
(async () => {
  const results = [];
  const errors = [];
  const messages = [];
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:10000';
  document.body.append(frame);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const check = (name, condition, detail) => {
    if (!condition) throw new Error(name + ': ' + JSON.stringify(detail));
    results.push(name);
    window.painterAcceptance.progress = name;
  };
  const receive = event => { if (event.source === frame.contentWindow) messages.push(event.data); };
  window.addEventListener('message', receive);
  const state = () => JSON.parse(frame.contentWindow.render_game_to_text());
  const load = async (level, language) => {
    const params = new URLSearchParams({ host:'world-map', activity:'magic-painter', level:`trail-painter-${level}`,
      stage: '5', profile:'painter-test', profileName:'בדיקה', profileEmoji:'🦄', profileCharacter:'unicorn',
      profileLanguage: language, destination:'wonder' });
    await new Promise(resolve => { frame.onload = resolve; frame.src = '/index.html?' + params; });
    for (let retry=0; retry<100 && !frame.contentWindow.render_game_to_text; retry++) await wait(30);
    frame.contentWindow.addEventListener('error', event => errors.push(event.message));
    frame.contentWindow.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
    check(`load ${level}/${language}`, state().game === 'magic-painter', state());
  };
  const samplePath = path => {
    const length = path.getTotalLength();
    return Array.from({length:Math.ceil(length / 4)+1}, (_,index) => {
      const point = path.getPointAtLength(Math.min(index*4,length));
      return {x:point.x,y:point.y};
    });
  };
  const points = () => samplePath(frame.contentDocument.querySelector('#svg-stroke-path'));
  const fire = (type, point, pointerId=1) => {
    const canvas = frame.contentDocument.querySelector('#paint-canvas');
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(new frame.contentWindow.PointerEvent(type, {
      bubbles:true,cancelable:true,pointerId,isPrimary:true,pointerType:'mouse',button:0,
      clientX:rect.left+point.x*rect.width/320,clientY:rect.top+point.y*rect.height/320,
    }));
  };
  const draw = path => {
    fire('pointerdown',path[0]);
    path.slice(1).forEach(point=>fire('pointermove',point));
    fire('pointerup',path.at(-1));
  };
  try {
    await load(2,'en');
    let path = points();
    fire('pointerdown',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('stray touch costs no star',state().mistakes===0 && !state().isDrawing,state());
    fire('pointerdown',path[0]);fire('pointermove',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('invalid trace still counts as mistake',state().mistakes===1 && state().strokeIdx===0,state());
    const halfway=Math.floor(path.length/2);
    draw(path.slice(0,halfway));
    const pausedProgress=state().progressLen;
    check('finger lift preserves partial line',state().pausedStroke && state().strokeIdx===0 && state().mistakes===1 && pausedProgress>0,state());
    const marker=frame.contentDocument.querySelector('#svg-start-dot');
    check('pink resume marker moves to partial line',Math.hypot(Number(marker.getAttribute('cx'))-path[0].x,
      Number(marker.getAttribute('cy'))-path[0].y)>10);
    fire('pointerdown',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('stray resume costs no star or progress',state().pausedStroke && state().mistakes===1 && state().progressLen===pausedProgress,state());
    fire('pointerdown',path[halfway-1]);
    path.slice(halfway).forEach(point=>fire('pointermove',point));fire('pointerup',path.at(-1));
    check('quick retry and partial resume keep new ink',state().strokeIdx===1 && state().mistakes===1,state());
    // Starting a second pointer cannot replace the primary stroke.
    path=points(); fire('pointerdown',path[0]);
    fire('pointerdown',{x:300,y:300},2); fire('pointerup',{x:300,y:300},2);
    path.slice(1).forEach(point=>fire('pointermove',point));fire('pointerup',path.at(-1));
    check('second pointer does not interrupt',state().strokeIdx===2,state());
    path=points();draw(path);draw(path);
    check('old crossbar blocked during transition',state().letterIdx===1 && state().strokeIdx===0 && state().inputLocked,state());
    await wait(740);
    check('next letter starts fresh',state().strokeIdx===0 && state().completedStrokes===0,state());
    draw(points());
    path=points();draw([path[0],path.at(-1)]);
    check('P loop shortcut rejected',state().strokeIdx===1,state());
    draw(path); await wait(740);
    check('P curve accepted after immediate retry',state().letterIdx===2,state());

    await load(2,'he');
    draw(points().reverse());
    check('backwards start ignored without penalty',state().strokeIdx===0 && state().mistakes===0,state());
    path=points();fire('pointerdown',path[0]);fire('pointermove',path[5]);fire('pointercancel',path[5]);
    check('cancelled pointer stops drawing',!state().isDrawing,state());
    draw(points());
    check('retry after pointer cancellation succeeds',state().strokeIdx===1,state());
    frame.contentDocument.querySelector('#painter-back').click();await wait(30);
    check('early exit awards no stars',messages.at(-1).type==='bubbles.activity.exit' && !('stars' in messages.at(-1)),messages.at(-1));

    await load(3,'en');
    draw(points()); await wait(740); // S
    draw(points()); await wait(740); // U
    check('worksheet N test reaches N',state().letterIdx===2,state());
    // Independent worksheet direction, rather than sampling the game's N guide.
    const nDown = Array.from({length:46},(_,index)=>({x:85,y:60+index*4}));
    draw(nDown);
    check('worksheet N downward first stroke accepted',state().strokeIdx===1 && state().mistakes===0,state());

    await load(3,'he');
    // Yo-yoo worksheet 60673: right leg down, curve left, left leg up.
    const shin = frame.contentDocument.createElementNS('http://www.w3.org/2000/svg','path');
    shin.setAttribute('d','M255 72 L232 210 Q225 240 195 240 L125 240 Q95 240 90 220 L65 72');
    draw(samplePath(shin));
    check('worksheet ש right-to-left outer stroke accepted',state().strokeIdx===1 && state().mistakes===0,state());
    draw(points());
    check('ש middle stroke completes the letter',state().letterIdx===1 && state().mistakes===0,state());

    await load(4,'he');
    // Yo-yoo print worksheet 60679: across the roof to the right, down and
    // around, then up the left edge. Draw from independent geometric landmarks.
    const samekh = frame.contentDocument.createElementNS('http://www.w3.org/2000/svg','path');
    samekh.setAttribute('d','M87 74 L182 74 C221 74 229 96 229 128 L229 183 C229 222 212 239 166 239 C121 239 91 225 91 183 L91 74');
    draw(samplePath(samekh));
    check('worksheet ס clockwise closed stroke accepted',state().letterIdx===1 && state().mistakes===0,state());

    await load(5,'he');
    const mem = frame.contentDocument.createElementNS('http://www.w3.org/2000/svg','path');
    mem.setAttribute('d','M82 238 L116 130 C119 94 138 73 169 73 C204 73 220 88 220 115');
    draw(samplePath(mem));
    check('worksheet מ arch rises before right leg',state().strokeIdx===1 && state().mistakes===0,state());

    for(const language of ['en','he']) for(let level=1;level<=6;level++) {
      await load(level,language);
      frame.contentDocument.querySelector('#painter-sound').click();
      const audio=frame.contentDocument.querySelector('#recorded-speech');
      for(let n=0;n<100 && (!audio.src || audio.readyState<2);n++) await wait(20);
      check(`spoken prompt ${level}/${language}`,audio.readyState>=2 && !audio.error && audio.dataset.sequenceLength==='3',
        {src:audio.src,error:audio.error,sequenceLength:audio.dataset.sequenceLength});
      let attempts=0;
      while(!state().complete && attempts++<30) {
        const before=state();
        draw(points());
        const after=state();
        check(`stroke ${level}/${language}/${before.letterIdx}/${before.strokeIdx}`,
          after.letterIdx>before.letterIdx || after.strokeIdx>before.strokeIdx,after);
        if(after.inputLocked) {
          frame.contentDocument.querySelector('#painter-sound').click();
          await wait(740);
          if(!state().complete) check(`next letter spoken ${level}/${language}/${state().letterIdx}`,
            audio.dataset.sequenceLength==='1',{sequenceLength:audio.dataset.sequenceLength});
        }
      }
      check(`complete ${level}/${language}`,state().complete && state().mistakes===0,state());
      check(`picture ${level}/${language}`,frame.contentDocument.querySelector('#art-color-img').naturalWidth>0 && frame.contentDocument.querySelector('#art-color-wrap').style.maskImage==='none');
      const before=messages.length;
      frame.contentDocument.querySelector('#painter-finish').click();
      frame.contentDocument.querySelector('#painter-finish').click();
      await wait(40);
      check(`completion once ${level}/${language}`,messages.length===before+1 && messages.at(-1).stars===3,messages.at(-1));
    }
    check('no browser errors',errors.length===0,errors);
    return {passed:results.length,failed:[],errors};
  } catch(error) {
    return {passed:results.length,failed:[error.message],errors,state:frame.contentWindow.render_game_to_text?.()};
  } finally {
    window.removeEventListener('message',receive);
    frame.remove();
  }
})().then(result => { window.painterAcceptance = { status: 'done', ...result }; });
'Started painter acceptance; poll window.painterAcceptance for the result.';
