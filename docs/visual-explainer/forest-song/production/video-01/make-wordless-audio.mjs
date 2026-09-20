// Local synthesized sound design. No voice recordings, speech model, or network calls.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const rate=48000, seconds=24, n=rate*seconds;
const channels=[new Float64Array(n),new Float64Array(n)];
let seed=73019;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
for(let c=0;c<2;c++){
 let low=0,slow=0;
 for(let i=0;i<n;i++){
  const t=i/rate,white=random()*2-1;
  low+=.14*(white-low);slow+=.006*(white-slow);
  const water=(low-slow)*.11*(.85+.15*Math.sin(t*.72+c));
  const leaves=white*.006*(.5+.5*Math.sin(t*.43+c))**4;
  channels[c][i]=water+leaves;
 }
}
function note(start,freq,duration,gain,pan=0){
 for(let i=0;i<duration*rate;i++){
  const at=Math.floor(start*rate)+i;if(at>=n)break;
  const t=i/rate,env=(1-Math.exp(-t*35))*Math.exp(-t*2.3)*Math.min(1,(duration-t)/.2);
  const v=gain*env*(Math.sin(2*Math.PI*freq*t)+.25*Math.sin(2*Math.PI*freq*2*t)*Math.exp(-t*3));
  channels[0][at]+=v*(1-pan*.4);channels[1][at]+=v*(1+pan*.4);
 }
}
// Small instrumental question/answer; three-note discovery; distant unfinished answer.
for(const x of [[1.7,659.25,.9,.075,-.4],[2.05,783.99,1,.065,-.4],[4.8,523.25,1.8,.065,.3],[9.2,523.25,2,.075,-.4],[10,659.25,2,.07,0],[10.8,783.99,2.5,.065,.4],[17,523.25,2,.06,-.3],[17.8,659.25,2,.06,0],[18.6,783.99,2.5,.06,.3],[21,523.25,2.8,.045,0],[21.9,659.25,2,.04,0]]) note(...x);
const buf=Buffer.alloc(44+n*4);buf.write('RIFF');buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(rate,24);buf.writeUInt32LE(rate*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*4,40);
let peak=0;
for(let i=0;i<n;i++)for(let c=0;c<2;c++){
 const fade=Math.min(1,i/(rate*.6),(n-1-i)/(rate*1.2));const v=channels[c][i]*fade;peak=Math.max(peak,Math.abs(v));buf.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*4+c*2);
}
fs.writeFileSync(fileURLToPath(new URL('wordless-soundtrack.wav',import.meta.url)),buf);
console.log(JSON.stringify({seconds,sampleRate:rate,channels:2,peakDb:20*Math.log10(peak),source:'deterministic local synthesis; no original audio'}));
