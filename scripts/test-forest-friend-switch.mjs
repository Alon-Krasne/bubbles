// Run against scripts/serve-save-test.mjs after npm run build.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const browser=(...args)=>execFileSync('agent-browser',['--session','forest-friend-switch',...args],{encoding:'utf8'});
const evaluate=code=>JSON.parse(browser('eval',code));
const route=()=>evaluate(`JSON.parse(window.bubblesSaveClient.getItem('forest-route-lotem-en'))`);
try {
  browser('open','http://127.0.0.1:8788/prototype/world-map.html');
  browser('wait','.gate-profile-choice');
  evaluate(`(async()=>{const s=window.bubblesSaveClient;s.setItem('bubble_world_map_profiles_v1',JSON.stringify([{id:'lotem',name:'לוטם',character:'princess',learningLanguage:'en'}]));s.setItem('route-lotem',JSON.stringify({currentStage:1,progress:{},contentVersion:2}));s.setItem('forest-route-lotem-en',JSON.stringify({currentStage:4,progress:{1:3,2:3,3:2},character:'zohar',unlockedVideos:['forest-video-01'],seenVideos:['forest-video-01'],contentVersion:2}));await s.flush();return true;})()`);
  browser('eval',`localStorage.setItem('bubble_world_map_profile_v1','lotem')`);
  browser('reload');browser('wait','.gate-profile-choice');browser('click','.gate-profile-choice[data-profile="lotem"]');
  browser('wait','#destination-card-wonder');browser('click','#destination-card-wonder');
  browser('click','#profile-button');
  assert.equal(evaluate(`document.querySelector('#forest-friend-button').hidden`),true,'the forest companion option is hidden outside the forest');
  browser('click','#profile-button');
  browser('click','#destinations-nav-button');browser('click','#destination-card-forest');
  const before=route();

  // Transparent cutout, not the framed cast sheet
  const portrait=evaluate(`(()=>{const s=getComputedStyle(document.querySelector('#traveller'));return {image:s.backgroundImage,color:s.backgroundColor,radius:s.borderTopLeftRadius};})()`);
  assert.match(portrait.image,/companion-zohar\.webp/);
  assert.equal(portrait.color,'rgba(0, 0, 0, 0)','no paper background behind the companion');
  assert.equal(portrait.radius,'0px','no rounded portrait frame');
  const alpha=evaluate(`(async()=>{const img=new Image();img.src='./assets/forest/companion-zohar.webp';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);const at=(px,py)=>x.getImageData(px,py,1,1).data[3];return {corner:at(2,2),bottom:at(2,img.height-3),centre:at(img.width>>1,img.height>>1)};})()`);
  assert.deepEqual(alpha,{corner:0,bottom:0,centre:255},'cutout has genuine transparency around an opaque character');

  // Open the switch from the profile menu; the current companion is marked
  browser('click','#profile-button');
  assert.equal(evaluate(`document.querySelector('#forest-friend-button').hidden`),false);
  browser('click','#forest-friend-button');
  assert.deepEqual(evaluate(`({open:!document.querySelector('#forest-character-picker').hidden,inert:document.querySelector('#world').inert,gate:!document.querySelector('#destination-gate').hidden,pressed:[...document.querySelectorAll('.forest-friend-card[aria-pressed="true"]')].map(c=>c.dataset.character),focus:document.activeElement.dataset.character})`),
    {open:true,inert:true,gate:false,pressed:['zohar'],focus:'zohar'});

  // Closing without choosing keeps the companion
  browser('click','#forest-picker-close');
  assert.deepEqual(evaluate(`({open:!document.querySelector('#forest-character-picker').hidden,inert:document.querySelector('#world').inert,focus:document.activeElement.id})`),{open:false,inert:false,focus:'profile-button'});
  assert.equal(route().character,'zohar');

  // Switching changes only the companion
  browser('click','#profile-button');browser('click','#forest-friend-button');browser('click','[data-character="nevet"]');
  const after=route();
  assert.equal(after.character,'nevet');
  assert.deepEqual({...after,character:before.character},before,'stage, stars, order and stories are unchanged');
  assert.deepEqual(evaluate(`({picker:!document.querySelector('#forest-character-picker').hidden,gate:!document.querySelector('#destination-gate').hidden,milestone:!document.querySelector('#forest-milestone-dialog').hidden,inert:document.querySelector('#world').inert,friend:document.querySelector('#traveller').dataset.friend,label:document.querySelector('#journey-label').textContent,destination:document.querySelector('#world').dataset.destination})`),
    {picker:false,gate:false,milestone:false,inert:false,friend:'nevet',label:'המסע של לוטם · נבט 🌱',destination:'forest'});

  // The choice survives a reload
  browser('reload');browser('wait','.gate-profile-choice');browser('click','.gate-profile-choice[data-profile="lotem"]');
  browser('wait','#destination-card-forest');browser('click','#destination-card-forest');
  assert.equal(evaluate(`document.querySelector('#traveller').dataset.friend`),'nevet');
  console.log('PASS: forest companion switches from the profile menu without touching progress, and portraits are transparent cutouts.');
} finally { browser('close'); }
