// Run against scripts/serve-save-test.mjs after npm run build; also included in test:painter-browser.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'game-variation', ...args], { encoding:'utf8' });
const evaluate = code => JSON.parse(execFileSync('agent-browser', ['--session', 'game-variation', 'eval', '--stdin'], {
  encoding:'utf8', input:code,
}));
const fixtures = [
  ['memory-garden','trail-memory-1','1','.memory-card'],
  ['listening-shop','trail-shop-1','2','.shop-item-tile'],
  ['magic-house','trail-house-1','3','.object-button'],
  ['magic-reveal','trail-reveal-1','4','#reveal-keyboard'],
];
// Repeat a draw to check that repeated names are valid, then cover middle/end choices.
const customerDraws = [[0,'נוני'],[0,'נוני'],[3/8,'לילי'],[6/8,'קיקי'],[0.999,'בוני']];
try {
  for (const language of ['en','he']) for (const [activity,level,stage,selector] of fixtures) {
    const snapshots=[];
    const params=new URLSearchParams({host:'world-map',activity,level,stage,
      profile:`variation-${language}`,profileName:'Test',profileEmoji:'🦄',profileCharacter:'unicorn',
      profileLanguage:language,destination:'wonder'});
    const path=activity==='magic-house' ? '/prototype/magic-house.html' : '/index.html';
    for (let replay=0;replay<5;replay++) {
      browser('open','http://127.0.0.1:8788'+path+'?'+params);
      browser('wait',selector);
      const snapshot=evaluate(`(() => {
        const ids = selector => [...document.querySelectorAll(selector)].map(el => ({...el.dataset}));
        return { memory:ids('.memory-card'), shelf:ids('.shop-item-tile'), drawer:ids('.object-button'),
          state:window.render_game_to_text ? JSON.parse(window.render_game_to_text()) : null };
      })()`);
      if(activity==='listening-shop') {
        snapshot.customer=evaluate(`(async () => {
          const originalRandom=Math.random;
          Math.random=()=>${customerDraws[replay][0]};
          try {
            const order=JSON.parse(window.render_game_to_text());
            for(const target of order.targets) for(let item=target.served;item<target.required;item++) {
              document.querySelector('[data-item-id="'+target.itemId+'"]').click();
            }
            const deadline=Date.now()+10000;
            while(Date.now()<deadline) {
              const state=JSON.parse(window.render_game_to_text());
              if(state.servedCustomers===1 && state.targets.every(target=>target.served===0)) {
                return document.querySelector('#shop-customer-name').textContent;
              }
              await new Promise(resolve=>setTimeout(resolve,25));
            }
            throw new Error('Shop did not advance to the controlled customer');
          } finally { Math.random=originalRandom; }
        })()`);
      }
      snapshots.push(snapshot);
    }
    const unique = values => new Set(values.map(value=>JSON.stringify(value))).size;
    if(activity==='memory-garden') {
      assert.ok(unique(snapshots.map(s=>s.memory))>1,'Memory must vary its board');
      assert.ok(unique(snapshots.map(s=>[...new Set(s.memory.map(c=>c.wordId))].sort()))>1,'Memory must vary its vocabulary');
    } else if(activity==='listening-shop') {
      assert.ok(unique(snapshots.map(s=>s.state.targets))>1,'Shop must vary requested products');
      assert.ok(unique(snapshots.map(s=>s.shelf))>1,'Shop must vary shelf content and order');
      assert.deepEqual(snapshots.map(s=>s.customer),customerDraws.map(([,name])=>name),
        'Shop customer names must follow controlled draws, including repeated names');
    } else if(activity==='magic-house') {
      assert.ok(unique(snapshots.map(s=>s.state.requestIds))>1,'House must vary request order');
      assert.ok(unique(snapshots.map(s=>s.state.requestIds.toSorted()))>1,'House must vary request sets');
      assert.ok(unique(snapshots.map(s=>s.drawer))>1,'House must vary drawer order');
    } else {
      assert.ok(unique(snapshots.map(s=>s.state.letters))>1,'Reveal must vary its words');
      assert.ok(unique(snapshots.map(s=>s.state.tileOrder))>1,'Reveal must vary its tiles');
      assert.ok(unique(snapshots.map(s=>s.state.choices))>1,'Reveal must vary its choices');
      const completion=evaluate(`(() => {
        const messages=[];
        window.addEventListener('message',event=>{if(event.data?.type==='bubbles.activity.complete')messages.push(event.data)});
        for(let round=0;round<3;round++) {
          let state=JSON.parse(window.render_game_to_text());
          for(let guess=0;!state.complete && guess<30;guess++) {
            const answer=state.choices.find(letter=>state.letters.includes(letter));
            document.querySelector('[data-letter="'+answer+'"]').click();
            state=JSON.parse(window.render_game_to_text());
          }
          if(!state.complete) throw new Error('Reveal word did not complete');
          if(document.querySelectorAll('.reveal-curtain .revealed').length!==12) throw new Error('Picture did not fully reveal');
          document.querySelector('#reveal-next').click();
        }
        return new Promise(resolve=>setTimeout(()=>resolve(messages),50));
      })()`);
      assert.equal(completion.length,1,'Reveal awards exactly once after every randomized word');
      assert.equal(completion[0].stars,3);
    }
    assert.deepEqual(JSON.parse(browser('--json','errors')).data.errors,[],'No browser runtime errors');
    console.log(`PASS: ${activity}/${language} varies across five real browser replays.`);
  }
} finally { browser('close'); }
