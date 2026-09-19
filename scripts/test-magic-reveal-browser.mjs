import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const b=(...args)=>execFileSync('agent-browser',['--session','reveal-check',...args],{encoding:'utf8'});
const e=code=>JSON.parse(b('eval',code));
try {
 for(const language of ['en','he']) {
 const params=new URLSearchParams({host:'world-map',activity:'magic-reveal',level:'trail-reveal-1',stage:'4',profile:'reveal-check-'+language,profileName:'Test',profileEmoji:'🌸',profileCharacter:'princess',profileLanguage:language,destination:'forest'});
 b('open','http://127.0.0.1:8788/index.html?'+params);b('wait','#reveal-keyboard');
 e(`(()=>{window.results=[];window.addEventListener('message',e=>{if(e.data?.type==='bubbles.activity.complete')window.results.push(e.data);});return true;})()`);
  let state=e('JSON.parse(window.render_game_to_text())');
  assert.ok(state.guesses.length > 0, 'Initial letters must already be revealed');
  const initialTiles = state.tiles;
  const wrong=e(`(()=>{const letters=JSON.parse(window.render_game_to_text()).letters;return [...document.querySelectorAll('[data-letter]')].find(b=>!letters.includes(b.dataset.letter)).dataset.letter})()`);
  b('click',`[data-letter="${wrong}"]`);assert.equal(e('JSON.parse(window.render_game_to_text()).tiles'),initialTiles);
 b('click','#reveal-hint');assert.ok(e('JSON.parse(window.render_game_to_text()).revealed')>0);
 e('(async()=>{await window.bubblesSaveClient.flush();return true})()');
 const guesses=e('JSON.parse(window.render_game_to_text()).guesses');b('reload');b('wait','#reveal-keyboard');assert.deepEqual(e('JSON.parse(window.render_game_to_text()).guesses'),guesses);
 e(`(()=>{window.results=[];window.addEventListener('message',e=>{if(e.data?.type==='bubbles.activity.complete')window.results.push(e.data);});return true;})()`);
 for(let round=0;round<3;round++) {
 state=e('JSON.parse(window.render_game_to_text())');
 for(const letter of new Set(state.letters))if(!state.guesses.includes(letter))b('click',`[data-letter="${letter}"]`);
 assert.equal(e('document.querySelectorAll(".reveal-curtain .revealed").length'),12);
 assert.equal(e('window.results.length'),0);
 assert.equal(e('document.querySelector("#reveal-image").naturalWidth > 0'),true);
 b('click','#reveal-next');
 }
 assert.equal(e('window.results.length'),1);assert.equal(e('window.results[0].stageId'),4);assert.equal(e('window.results[0].stars'),2);
 console.log(`PASS ${language}: wrong guesses, lamp, reload, image reveal, full round and scored completion.`);
 }
}finally{b('close');}
