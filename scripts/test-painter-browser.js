// Run through npm run test:painter-browser (agent-browser and port 8788 required).
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
  const load = async (level, language, letterCase = 'uppercase') => {
    const params = new URLSearchParams({ host:'world-map', activity:'magic-painter', level:`trail-painter-${level}`,
      stage: '5', profile:'painter-test', profileName:'בדיקה', profileEmoji:'🦄', profileCharacter:'unicorn',
      profileLanguage: language, destination:'wonder' });
    await new Promise(resolve => { frame.onload = resolve; frame.src = '/index.html?' + params; });
    for (let retry=0; retry<100 && !frame.contentWindow.render_game_to_text; retry++) await wait(30);
    frame.contentWindow.addEventListener('error', event => errors.push(event.message));
    frame.contentWindow.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
    check(`load ${level}/${language}`, state().game === 'magic-painter', state());
    if (language === 'en') {
      check(`capital first letter default ${level}`, state().letterCase === 'titlecase' &&
        state().word === state().word[0].toUpperCase() + state().word.slice(1).toLowerCase(), state());
      frame.contentDocument.querySelector(`[data-letter-case="${letterCase}"]`).click();
    } else {
      check(`Hebrew hides case controls ${level}`, frame.contentDocument.querySelector('#painter-letter-case').hidden);
    }
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
  const inkAt = point => frame.contentDocument.querySelector('#paint-canvas').getContext('2d')
    .getImageData(Math.round(point.x),Math.round(point.y),1,1).data[3];
  try {
    await load(2,'en');
    let path = points();
    fire('pointerdown',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('stray touch costs no star',state().mistakes===0 && !state().isDrawing,state());
    fire('pointerdown',path[0]);fire('pointermove',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('invalid trace still counts as mistake',state().mistakes===1 && state().strokeIdx===0,state());
    const halfway=Math.floor(path.length/2);
    draw(path.slice(0,halfway));
    check('finger lift discards unfinished progress',!state().isDrawing && state().strokeIdx===0 && state().mistakes===1 && state().progressLen===0,state());
    check('finger lift erases unfinished ink',inkAt(path[Math.floor(halfway/2)])===0);
    const marker=frame.contentDocument.querySelector('#svg-start-dot');
    check('pink marker returns to original start',Math.hypot(Number(marker.getAttribute('cx'))-path[0].x,
      Number(marker.getAttribute('cy'))-path[0].y)<0.01);
    fire('pointerdown',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('stray retry costs no star or progress',state().mistakes===1 && state().progressLen===0,state());
    fire('pointerdown',path[halfway-1]);
    path.slice(halfway).forEach(point=>fire('pointermove',point));fire('pointerup',path.at(-1));
    check('discarded endpoint cannot continue stroke',state().strokeIdx===0 && state().progressLen===0 && state().mistakes===1,state());
    draw(path);
    check('continuous retry keeps new ink',state().strokeIdx===1 && state().mistakes===1,state());
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
    draw(path);
    check('successful retry clears old mistake feedback',!frame.contentDocument.querySelector('#slate-feedback').classList.contains('show'));
    await wait(740);
    check('P curve accepted after immediate retry',state().letterIdx===2,state());

    for (const [level,language] of [[1,'he'],[2,'en']]) {
      await load(level,language);
      const firstPath=points(),completedPoint=firstPath[Math.floor(firstPath.length/2)];
      draw(firstPath); // Complete ח's roof or A's first leg before interrupting the next stroke.
      const before=state(), guide=frame.contentDocument.querySelector('#svg-stroke-path');
      const pointAt=distance=>guide.getPointAtLength(distance);
      fire('pointerdown',pointAt(0));fire('pointerup',pointAt(0));
      for(let hop=0;hop<6 && state().letterIdx===before.letterIdx && state().strokeIdx===before.strokeIdx;hop++) {
        const progress=state().progressLen;
        fire('pointerdown',pointAt(progress+30));
        fire('pointermove',pointAt(progress+32));fire('pointerup',pointAt(progress+32));
      }
      check(`repeated lifts cannot complete a stroke ${language}`,state().letterIdx===before.letterIdx &&
        state().strokeIdx===before.strokeIdx && state().progressLen===0 && state().mistakes===0,state());
      const partial=points().slice(0,Math.floor(points().length/2));
      draw(partial);
      check(`interrupted stroke resets without penalty ${language}`,state().progressLen===0 && !state().isDrawing && state().mistakes===0,state());
      check(`interrupted ink disappears ${language}`,inkAt(partial[Math.floor(partial.length/2)])===0);
      check(`completed stroke survives release ${language}`,state().completedStrokes===before.completedStrokes && inkAt(completedPoint)>0,state());
      fire('pointerdown',partial.at(-1));fire('pointermove',pointAt(guide.getTotalLength()));fire('pointerup',pointAt(guide.getTotalLength()));
      check(`discarded endpoint cannot resume ${language}`,state().progressLen===0 && state().letterIdx===before.letterIdx && state().strokeIdx===before.strokeIdx,state());
      draw(points());
      check(`continuous stroke succeeds after release ${language}`,state().letterIdx>before.letterIdx || state().strokeIdx>before.strokeIdx,state());
    }

    await load(2,'he');
    draw(points().reverse());
    check('backwards start ignored without penalty',state().strokeIdx===0 && state().mistakes===0,state());
    path=points();fire('pointerdown',path[0]);fire('pointermove',path[5]);fire('pointercancel',path[5]);
    check('cancelled pointer discards incomplete stroke',!state().isDrawing && state().progressLen===0,state());
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

    const hebrewWords=['חתול','תפוח','שמש','סירה','מפה','מדליה'];
    for(const language of ['en','he']) for(let level=1;level<=6;level++) {
      await load(level,language);
      if(language==='he') {
        check(`Hebrew word spelling ${level}`,state().word===hebrewWords[level-1],state());
        const banner=frame.contentDocument.querySelector('#word-banner');
        const slots=[...banner.querySelectorAll('.letter-slot')];
        check(`Hebrew RTL order ${level}`,banner.style.direction==='rtl' &&
          slots[0].getBoundingClientRect().left>slots[1].getBoundingClientRect().left,
          {direction:banner.style.direction,first:slots[0].getBoundingClientRect().left,second:slots[1].getBoundingClientRect().left});
      }
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
      if(language==='he') check(`Hebrew completed banner ${level}`,
        [...frame.contentDocument.querySelectorAll('#word-banner .letter-slot')].map(slot=>slot.textContent).join('')===hebrewWords[level-1]);
      check(`picture ${level}/${language}`,frame.contentDocument.querySelector('#art-color-img').naturalWidth>0 && frame.contentDocument.querySelector('#art-color-wrap').style.maskImage==='none');
      const before=messages.length;
      frame.contentDocument.querySelector('#painter-finish').click();
      frame.contentDocument.querySelector('#painter-finish').click();
      await wait(40);
      check(`completion once ${level}/${language}`,messages.length===before+1 && messages.at(-1).stars===3,messages.at(-1));
    }

    // Switching during the 700ms letter transition must cancel the old guide.
    await load(1,'en','lowercase');
    draw(points());
    check('lowercase c completed',state().letterIdx===1 && state().inputLocked,state());
    const chooseWord = id => {
      const select=frame.contentDocument.querySelector('#painter-word');
      select.value=id;
      select.dispatchEvent(new frame.contentWindow.Event('change',{bubbles:true}));
    };
    chooseWord('panda');
    frame.contentDocument.querySelector('[data-letter-case="uppercase"]').click();
    await wait(740);
    check('word and case switching cancel old transition',state().word==='PANDA' && state().letterIdx===0 &&
      state().strokeIdx===0 && !state().inputLocked && state().mistakes===0,state());
    path=points();fire('pointerdown',path[0]);fire('pointermove',{x:300,y:300});fire('pointerup',{x:300,y:300});
    check('new word mistake is tracked',state().mistakes===1,state());
    chooseWord('cat');
    check('changing word resets score and reveal',state().mistakes===0 && state().letterIdx===0 &&
      frame.contentDocument.querySelector('#art-color-wrap').style.maskImage.includes('rgba(0, 0, 0, 0)'),state());

    // Capital-first words, lowercase practice, and new words in uppercase and Hebrew.
    const pools=[['cat','panda'],['apple','soup'],['sun','moon'],['boat','bus'],['map','ruler'],['medal','baseball']];
    for(let level=1;level<=6;level++) for(const [wordId,language,letterCase] of [
      [pools[level-1][0],'en','titlecase'],[pools[level-1][1],'en','titlecase'],
      [pools[level-1][0],'en','lowercase'],[pools[level-1][1],'en','lowercase'],
      [pools[level-1][1],'en','uppercase'],[pools[level-1][1],'he','uppercase'],
    ]) {
      await load(level,language,letterCase);
      const select=frame.contentDocument.querySelector('#painter-word');
      check(`two chapter choices ${level}/${language}`,select.options.length===2 &&
        [...select.options].map(option=>option.value).join(',')===pools[level-1].join(','));
      chooseWord(wordId);
      check(`selected word ${wordId}/${language}/${letterCase}`,state().wordId===wordId && state().letterIdx===0,state());
      const audio=frame.contentDocument.querySelector('#recorded-speech');
      for(let retry=0;retry<100 && audio.readyState<2;retry++) await wait(20);
      check(`recorded guidance ${wordId}/${language}/${letterCase}`,audio.readyState>=2 && !audio.error &&
        audio.dataset.sequenceLength==='3',{source:audio.src,error:audio.error});
      let attempts=0;
      while(!state().complete && attempts++<40) {
        const before=state();draw(points());const after=state();
        check(`new stroke ${wordId}/${language}/${letterCase}/${before.letterIdx}/${before.strokeIdx}`,
          after.letterIdx>before.letterIdx || after.strokeIdx>before.strokeIdx,after);
        if(after.inputLocked) await wait(740);
      }
      check(`new completion ${wordId}/${language}/${letterCase}`,state().complete && state().mistakes===0,state());
      const img=frame.contentDocument.querySelector('#art-color-img');
      check(`matching picture ${wordId}/${language}/${letterCase}`,img.naturalWidth>0 &&
        img.src.endsWith(`/painter/${wordId}.webp`) && img.alt===state().word &&
        frame.contentDocument.querySelector('#art-color-wrap').style.maskImage==='none');
      const before=messages.length;
      frame.contentDocument.querySelector('#painter-finish').click();await wait(40);
      check(`new award ${wordId}/${language}/${letterCase}`,messages.length===before+1 && messages.at(-1).stars===3,messages.at(-1));
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
