// Run through npm run test:painter-browser. Uses real hosted pages and pointer
// events; the random word selection and game state are never overridden.
window.painterAcceptance = { status: 'running', progress: 'starting' };
(async () => {
  const results = [], errors = [], messages = [];
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
  const load = async (level, language, destination = 'wonder') => {
    const params = new URLSearchParams({ host:'world-map', activity:'magic-painter', level:`trail-painter-${level}`,
      stage:'5', profile:'painter-test', profileName:'בדיקה', profileEmoji:'🦄', profileCharacter:'unicorn',
      profileLanguage:language, destination });
    await new Promise(resolve => { frame.onload = resolve; frame.src = '/index.html?' + params; });
    for (let retry=0; retry<100 && !frame.contentWindow.render_game_to_text; retry++) await wait(30);
    frame.contentWindow.addEventListener('error', event => errors.push(event.message));
    frame.contentWindow.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
    check(`load ${level}/${language}/${destination}`, state().game === 'magic-painter', state());
    check('no demo selectors', !frame.contentDocument.querySelector('select, [data-letter-case]'));
    if (language === 'en') check('capital-first word', state().letterCase === 'titlecase' &&
      state().word === state().word[0].toUpperCase() + state().word.slice(1).toLowerCase(), state());
  };
  const points = () => {
    const path=frame.contentDocument.querySelector('#svg-stroke-path'), length=path.getTotalLength();
    return Array.from({length:Math.ceil(length/4)+1}, (_,i) => {
      const p=path.getPointAtLength(Math.min(i*4,length)); return {x:p.x,y:p.y};
    });
  };
  const fire = (type, point, pointerId=1) => {
    const canvas=frame.contentDocument.querySelector('#paint-canvas'), rect=canvas.getBoundingClientRect();
    canvas.dispatchEvent(new frame.contentWindow.PointerEvent(type, {
      bubbles:true,cancelable:true,pointerId,isPrimary:true,pointerType:'mouse',button:0,
      clientX:rect.left+point.x*rect.width/320,clientY:rect.top+point.y*rect.height/320,
    }));
  };
  const draw = path => {
    fire('pointerdown',path[0]);path.slice(1).forEach(p=>fire('pointermove',p));fire('pointerup',path.at(-1));
  };
  const ink = () => frame.contentDocument.querySelector('#paint-canvas').getContext('2d')
    .getImageData(0,0,320,320).data.some((v,i)=>i%4===3 && v!==0);
  async function completeWord(label) {
    let attempts=0;
    while (!state().wordComplete && attempts++<50) {
      const before=state();draw(points());const after=state();
      check(`stroke ${label}/${before.letterIdx}/${before.strokeIdx}`,
        after.letterIdx>before.letterIdx || after.strokeIdx>before.strokeIdx,after);
      if(after.inputLocked) await wait(750);
    }
    check(`word complete ${label}`,state().wordComplete,state());
    check(`dialog ${label}`,frame.contentDocument.querySelector('#celebrate-overlay').classList.contains('show'));
    const image=frame.contentDocument.querySelector('#art-color-img');
    check(`matching illustration ${label}`,image.naturalWidth>0 && image.src.endsWith(`/painter/${state().wordId}.webp`) &&
      image.alt===state().word && frame.contentDocument.querySelector('#art-color-wrap').style.maskImage==='none');
    check(`completed banner ${label}`,[...frame.contentDocument.querySelectorAll('.letter-slot')]
      .map(slot=>slot.textContent).join('')===state().word);
  }
  try {
    // Interrupted input, second pointers, invalid attempts, and leaving a stage.
    for (const language of ['en','he']) {
      await load(1,language);
      fire('pointerdown',{x:300,y:300});fire('pointerup',{x:300,y:300});
      check('stray touch is non-punitive',state().mistakes===0 && !state().isDrawing,state());
      const path=points();draw(path.slice(0,Math.floor(path.length/2)));
      check('lift resets unfinished progress',state().progressLen===0 && state().mistakes===0 && !state().isDrawing,state());
      check('lift clears unfinished ink',!ink());
      const dot=frame.contentDocument.querySelector('#svg-start-dot');
      check('marker returns to start',Math.hypot(Number(dot.getAttribute('cx'))-path[0].x,
        Number(dot.getAttribute('cy'))-path[0].y)<0.01);
      fire('pointerdown',path[0]);fire('pointermove',path[5]);fire('pointercancel',path[5]);
      check('cancel clears progress',state().progressLen===0 && !state().isDrawing,state());
      fire('pointerdown',path[0]);fire('pointerdown',{x:300,y:300},2);fire('pointerup',{x:300,y:300},2);
      path.slice(1).forEach(p=>fire('pointermove',p));fire('pointerup',path.at(-1));
      check('second pointer cannot replace stroke',state().letterIdx>0 || state().strokeIdx>0,state());
      const before=messages.length;
      frame.contentDocument.querySelector('#painter-back').click();await wait(30);
      check('early exit gives no stars',messages.length===before+1 && messages.at(-1).type==='bubbles.activity.exit' &&
        !('stars' in messages.at(-1)),messages.at(-1));
    }
    // Full sessions at every difficulty, both languages, and both destinations.
    for(const language of ['en','he']) for(let level=1;level<=6;level++) {
      await load(level,language,level%2 ? 'wonder' : 'forest');
      const expectedCounts=[1,1,2,2,2,3], minimumLengths=[3,3,4,4,4,5];
      const count=expectedCounts[level-1], seen=[];
      check(`word count ${level}/${language}`,state().wordCount===count,state());
      const before=messages.length;
      let mistakes=0;
      for(let round=0;round<count;round++) {
        const current=state();seen.push(current.wordId);
        check('word index progresses',current.wordIndex===round,current);
        check('harder words are longer',[...current.word].length>=minimumLengths[level-1],current);
        check('visible progress',frame.contentDocument.querySelector('#painter-progress').textContent===`ציור ${round+1} מתוך ${count}`);
        if(language==='he') {
          const banner=frame.contentDocument.querySelector('#word-banner'), slots=[...banner.querySelectorAll('.letter-slot')];
          check('Hebrew RTL banner',banner.style.direction==='rtl' && slots[0].getBoundingClientRect().left>slots[1].getBoundingClientRect().left);
        }
        frame.contentDocument.querySelector('#painter-sound').click();
        const audio=frame.contentDocument.querySelector('#recorded-speech');
        for(let n=0;n<100 && (!audio.src || audio.readyState<2);n++) await wait(20);
        check('recorded guidance',audio.readyState>=2 && !audio.error && audio.dataset.sequenceLength==='3',
          {src:audio.src,error:audio.error});
        // A mistake on the first word of a longer session must survive every next word.
        if(count>1 && round===0) {
          const path=points(), start=path[0], next=path[1];
          const dx=next.x-start.x, dy=next.y-start.y, length=Math.hypot(dx,dy);
          const off={x:start.x-dy/length*90,y:start.y+dx/length*90};
          fire('pointerdown',start);fire('pointermove',off);fire('pointerup',off);
          check('invalid trace costs one mistake',state().mistakes===1,state());
          mistakes=1;
        }
        await completeWord(`${level}/${language}/${round}`);
        check('mistakes carry across words',state().mistakes===mistakes,state());
        check('no award before Continue',messages.length===before,messages);
        check('only final word completes stage',state().complete===(round===count-1),state());
        if(round<count-1) check('no stars on intermediate picture',frame.contentDocument.querySelector('#painter-stars').textContent==='');
        frame.contentDocument.querySelector('#painter-finish').click();
        frame.contentDocument.querySelector('#painter-finish').click();
        await wait(40);
        if(round<count-1) {
          check('next picture resets drawing',state().letterIdx===0 && state().strokeIdx===0 && !state().inputLocked && !ink(),state());
          check('next picture clears reveal',frame.contentDocument.querySelector('#art-color-wrap').style.maskImage.includes('rgba(0, 0, 0, 0)'));
          check('next picture does not award stars',messages.length===before);
        }
      }
      check('distinct words in one stage',new Set(seen).size===count,seen);
      check('one final award',messages.length===before+1 && messages.at(-1).type==='bubbles.activity.complete' &&
        messages.at(-1).stars===3,messages.at(-1));
    }
    // Replay draws from the remaining deck rather than repeating the fixed opener.
    for(const language of ['en','he']) {
      const firstWords=[];
      for(let attempt=0;attempt<4;attempt++) { await load(1,language); firstWords.push(state().wordId); }
      check(`varied replay ${language}`,new Set(firstWords).size>1,firstWords);
    }
    check('no browser errors',errors.length===0,errors);
    return {passed:results.length,failed:[],errors};
  } catch(error) {
    return {passed:results.length,failed:[error.message],errors,state:frame.contentWindow.render_game_to_text?.()};
  } finally {
    window.removeEventListener('message',receive);frame.remove();
  }
})().then(result => { window.painterAcceptance = { status:'done', ...result }; });
'Started painter acceptance; poll window.painterAcceptance for the result.';
