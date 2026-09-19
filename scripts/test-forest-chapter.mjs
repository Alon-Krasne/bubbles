// End-to-end: actual picture/card controls complete all five learning screens.
// Run against the isolated scripts/serve-save-test.mjs server after npm run build.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const browser=(...args)=>execFileSync('agent-browser',['--session','forest-chapter-check',...args],{encoding:'utf8'});
const evaluate=code=>JSON.parse(browser('eval',code));
const url='http://127.0.0.1:8788/prototype/world-map.html';
try {
  browser('open',url);browser('wait','.gate-profile-choice');browser('click','.gate-profile-choice[data-profile="lotem"]');browser('wait','#destination-card-forest');
  evaluate(`(async()=>{const s=window.bubblesSaveClient;for(const k of s.keys())if(k.includes('forest-lotem-en'))s.removeItem(k);s.setItem('forest-route-lotem-en',JSON.stringify({currentStage:1,progress:{},character:null,unlockedVideos:['forest-video-01'],seenVideos:[],contentVersion:2}));localStorage.setItem('bubble_world_map_profile_v1','lotem');await s.flush();return true;})()`);
  browser('reload');browser('wait','.gate-profile-choice');browser('click','.gate-profile-choice[data-profile="lotem"]');browser('wait','#destination-card-forest');browser('click','#destination-card-forest');browser('click','[data-character="nevet"]');
  const opening=evaluate(`(async()=>{const v=document.querySelector('#forest-milestone-video');await v.play();await new Promise(r=>setTimeout(r,800));v.pause();return {time:v.currentTime,duration:v.duration,error:v.error,lang:document.querySelector('#forest-caption-language').value};})()`);
  assert.ok(opening.time>0);assert.equal(opening.error,null);assert.equal(opening.lang,'en');assert.ok(opening.duration>=24);
  browser('click','#forest-milestone-play-btn');
  const wonderBefore=evaluate(`window.bubblesSaveClient.getItem('route-lotem')`);
  for(let stage=1;stage<=5;stage++) {
    browser('wait','--fn',`!document.querySelector('#launch-overlay').classList.contains('is-visible')`);
    browser('click','#play-button');
    browser('wait','--fn',`document.querySelector('#activity-overlay').classList.contains('is-visible')`);
    const activity=evaluate(`new URL(document.querySelector('#activity-frame').src).searchParams.get('activity')`);
    const setup=`const d=document.querySelector('#activity-frame').contentDocument;const sleep=ms=>new Promise(r=>setTimeout(r,ms));`;
    if(activity==='memory-garden') {
      evaluate(`(async()=>{${setup}const words=new Set([...d.querySelectorAll('.memory-card')].map(c=>c.dataset.wordId));for(const word of words){const cards=[...d.querySelectorAll('.memory-card')].filter(c=>c.dataset.wordId===word);cards[0].click();await sleep(250);cards[1].click();await sleep(1600);}for(let i=0;i<20&&!d.querySelector('#memory-celebration').classList.contains('is-visible');i++)await sleep(300);if(!d.querySelector('#memory-celebration').classList.contains('is-visible'))throw Error('Memory did not complete');d.querySelector('#memory-celebration-next-btn').click();return true;})()`);
    } else if(activity==='magic-reveal') {
      evaluate(`(()=>{const f=document.querySelector('#activity-frame');const w=f.contentWindow;const d=f.contentDocument;for(let round=0;round<3;round++){const state=JSON.parse(w.render_game_to_text());for(const letter of new Set(state.letters))d.querySelector('[data-letter="'+letter+'"]').click();d.querySelector('#reveal-next').click();}return true;})()`);
    } else if(activity==='listening-shop') {
      evaluate(`(async()=>{${setup}const w=document.querySelector('#activity-frame').contentWindow;for(let i=0;i<55;i++){if(d.querySelector('#shop-celebration').classList.contains('is-visible')){d.querySelector('#shop-celebration-next-btn').click();return true;}const state=JSON.parse(w.render_game_to_text());const t=state.targets.find(t=>t.served<t.required);if(t){const tile=d.querySelector('[data-item-id="'+t.itemId+'"]');if(!tile.disabled)tile.click();}await sleep(500);}throw Error('Shop did not complete');})()`);
    } else {
      evaluate(`(async()=>{${setup}const w=document.querySelector('#activity-frame').contentWindow;const {MAGIC_HOUSE_REQUESTS}=await import('/prototype/shared/magic-house-content.mjs');for(let i=0;i<55;i++){if(d.querySelector('#celebration').classList.contains('is-visible')){d.querySelector('#replay-button').click();return true;}const state=JSON.parse(w.render_game_to_text());const request=MAGIC_HOUSE_REQUESTS.find(r=>r.id===state.requestIds[state.completedRequests]);if(request){for(const t of request.targets){const object=d.querySelector('.object-button[data-object-id="'+t.objectId+'"]');if(object&&!object.disabled){object.click();d.querySelector('[data-zone="'+t.zoneId+'"]').click();}}}await sleep(500);}throw Error('House did not complete');})()`);
    }
    browser('wait','--fn',`!document.querySelector('#activity-overlay').classList.contains('is-visible')`);
    const progress=evaluate(`JSON.parse(window.bubblesSaveClient.getItem('forest-route-lotem-en'))`);
    assert.equal(progress.currentStage,stage+1);assert.ok(progress.progress[stage]>0);
    assert.deepEqual(evaluate(`window.bubblesSaveClient.keys().filter(k=>k.includes('forest-lotem-en')&&(/house-round|magic-reveal|bubble_shop_sessions/.test(k)))`),[], 'hosted activities must not save unfinished rounds');
    assert.equal(evaluate(`window.bubblesSaveClient.getItem('route-lotem')`),wonderBefore);
    console.log(`PASS stage ${stage}: ${activity}, actual controls and isolated save.`);
  }
  browser('wait','#forest-milestone-dialog:not([hidden])');
  assert.equal(evaluate(`document.querySelector('#forest-story-select').value`),'forest-video-02');
  const movie=evaluate(`(async()=>{const v=document.querySelector('#forest-milestone-video');await v.play();await new Promise(r=>setTimeout(r,800));v.pause();return {time:v.currentTime,error:v.error,duration:v.duration};})()`);
  assert.ok(movie.time>0);assert.equal(movie.error,null);assert.ok(movie.duration>=18);
  browser('select','#forest-caption-language','he');
  assert.equal(evaluate(`[...document.querySelector('#forest-milestone-video').textTracks].find(t=>t.language==='he').mode`),'showing');
  browser('click','#forest-milestone-play-btn');
  browser('click','#forest-stories-button');browser('select','#forest-story-select','forest-video-01');
  assert.equal(evaluate(`document.querySelector('#forest-milestone-video').getAttribute('src')`),'./assets/forest/forest-video-01.mp4');
  browser('click','#forest-milestone-play-btn');
  evaluate(`(async()=>{await window.bubblesSaveClient.flush();return true;})()`);
  browser('reload');browser('wait','.gate-profile-choice');browser('click','.gate-profile-choice[data-profile="lotem"]');browser('wait','#destination-card-forest');browser('click','#destination-card-forest');
  assert.equal(evaluate(`document.querySelector('#forest-milestone-dialog').hidden`),true);
  assert.equal(evaluate(`document.querySelector('#traveller').dataset.stage`),'6');
  console.log('PASS: opening → five real activities → second video, captions, replay, reload and Wonder save isolation.');
} finally {browser('close');}
