import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'save-tab-takeover', ...args], { encoding: 'utf8' });
const read = (expression) => JSON.parse(browser('eval', expression));
const url = 'http://127.0.0.1:8788/prototype/world-map.html';
const key = `save-tab-test-${Date.now()}`;

try {
  browser('open', url);
  browser('wait', '--fn', 'Boolean(window.bubblesSaveClient)');
  browser('tab', 'new', url);
  browser('wait', '1200');
  assert.equal(read('Boolean(window.bubblesSaveClient)'), true, 'new tab must start without closing the older game');
  assert.equal(read("document.body.innerText.includes('סגרו אותה ונסו שוב')"), false);
  browser('eval', `window.bubblesSaveClient.setItem('${key}', 'from-new-tab')`);
  browser('eval', '(async()=>{await window.bubblesSaveClient.flush();return true})()');

  browser('tab', '0');
  browser('wait', '--fn', "document.body.innerText.includes('ללשונית החדשה')");
  assert.equal(read(`(()=>{try{window.bubblesSaveClient.setItem('${key}', 'stale-tab');return false}catch{return true}})()`), true, 'older tab must not overwrite the new tab');
  browser('reload');
  browser('wait', '--fn', 'Boolean(window.bubblesSaveClient)');
  assert.equal(read(`window.bubblesSaveClient.getItem('${key}')`), 'from-new-tab', 'returning tab must load the newer saved value');
  console.log('PASS: newer tab starts, older tab retires, and a return takeover preserves the save.');
} finally {
  browser('close');
}
