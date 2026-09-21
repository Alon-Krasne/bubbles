// Run against the local D1 test server after building; never production.
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const base = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:8788';
assert.equal(new URL(base).hostname, '127.0.0.1');
const browser = (...args) => execFileSync('agent-browser', ['--session', 'profile-gate-test', ...args], { encoding: 'utf8' });
const evaluate = code => JSON.parse(browser('eval', code));
try {
  browser('open', `${base}/prototype/world-map.html`);
  browser('wait', '.gate-profile-choice');
  for (const mode of ['day', 'night']) {
    browser('click', `.profile-gate [data-time-toggle=${mode}]`);
    const contrast = evaluate(`(() => {
      const style = getComputedStyle(document.querySelector('#add-profile-button'));
      const rgb = value => value.match(/[\\d.]+/g).map(Number);
      const bg = rgb(style.backgroundColor), fg = rgb(style.color);
      const luminance = rgb => rgb.slice(0,3).map(n => n/255).map(n => n<=0.04045?n/12.92:((n+0.055)/1.055)**2.4).reduce((sum,n,i)=>sum+n*[0.2126,0.7152,0.0722][i],0);
      return {opaque: bg.length===3 || bg[3]===1, ratio:(Math.max(luminance(bg),luminance(fg))+0.05)/(Math.min(luminance(bg),luminance(fg))+0.05)};
    })()`);
    assert.ok(contrast.opaque && contrast.ratio >= 4.5, `Add-player control needs its own opaque, readable background in ${mode}: ${JSON.stringify(contrast)}`);
    for (const [width,height] of [[375,600],[390,844],[844,390],[1280,720]]) {
      browser('set','viewport',String(width),String(height));
      const reachable = evaluate(`(() => {
        return [...document.querySelectorAll('.gate-profile-choice,#add-profile-button')].every(button => {
          button.scrollIntoView({block:'center'});
          const r=button.getBoundingClientRect();
          return r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth && button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        });
      })()`);
      assert.ok(reachable, `Every profile and add-player button must be reachable at ${width}x${height} in ${mode}`);
    }
  }
  browser('click','#add-profile-button');
  browser('fill','#profile-name-input','בדיקה');
  browser('click','.save-profile-button');
  browser('wait','.gate-profile-choice');
  evaluate('window.bubblesSaveClient.flush().then(()=>true)');
  browser('reload'); browser('wait','.gate-profile-choice');
  assert.ok(evaluate(`[...document.querySelectorAll('.gate-profile-choice')].some(button=>button.textContent.includes('בדיקה'))`),'New child survives reload');
  console.log('PASS: opaque 4.5:1+ add-player button, reachable profiles at four viewports in day/night, and creation persists after reload.');
} finally { browser('close'); }
