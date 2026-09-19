import { VOCAB_WORDS } from './words';
import { playRecordedSequence, stopRecordedSpeech, vocabularyWordAudio, hebrewWordAudio } from './recordedSpeech';
import { saveStorage } from '../prototype/shared/saves.mjs';
import { getRevealState, getRevealHint, getInitialRevealedLetters } from '../prototype/shared/magic-reveal.mjs';
import { getGameLevel } from '../prototype/shared/trail-catalog.mjs';
import type { HostedActivitySession, HostedActivityContext } from './hostedActivity';
import './magic-reveal.css';


export function openMagicReveal(context: HostedActivityContext, session: HostedActivitySession) {
  const level = getGameLevel('reveal', context.levelId);
  const wordIds = level.wordPool.slice(0, level.wordCount);
  const key = `magic-reveal-${context.destination}-${context.profileId}-${context.profileLanguage}-${context.levelId}`;
  const stored = saveStorage.getItem(key);
  const progress = stored ? JSON.parse(stored) : { round: 0, guesses: [], mistakes: 0, hints: 0 };
  const root = document.getElementById('magic-reveal-screen')!;
  root.innerHTML = `<header class="reveal-header"><button id="reveal-back" type="button">← למפה</button><div><small>מגלים אותיות, מגלים קסם</small><h1>התמונה הקסומה</h1></div><button id="reveal-hint" class="magic-hint-button" type="button">💡 רמז</button></header><main class="reveal-stage"><div class="reveal-picture"><img id="reveal-image" alt="נוף קסום שמתגלה עם כל אות"><div class="reveal-curtain" aria-hidden="true">${Array.from({length:12},()=>'<span>✦</span>').join('')}</div></div><section class="reveal-puzzle"><p class="reveal-clue"><span id="reveal-clue-picture" aria-hidden="true"></span><button id="reveal-sound" type="button" aria-label="האזינו למילה">🔊 האזינו</button></p><div id="reveal-word" aria-label="אותיות המילה"></div><p id="reveal-message" role="status">בחרו אות וגלו מה מסתתר בתמונה.</p><div id="reveal-keyboard" aria-label="בחירת אות"></div><button id="reveal-next" type="button" hidden>עוד תמונה קסומה ←</button><small id="reveal-progress"></small></section></main>`;
  const $ = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
  const currentWord = () => VOCAB_WORDS.find(w=>w.id===wordIds[progress.round])!;
  const target = () => context.profileLanguage === 'en' ? currentWord().english.toUpperCase() : currentWord().hebrew;
  const persist = () => saveStorage.setItem(key,JSON.stringify(progress));
  const ensureInitialGuesses = () => {
    const initial = getInitialRevealedLetters(target());
    let changed = false;
    for (const letter of initial) {
      if (!progress.guesses.includes(letter)) {
        progress.guesses.push(letter);
        changed = true;
      }
    }
    if (changed) persist();
  };
  ensureInitialGuesses();
  const speak = () => playRecordedSequence([context.profileLanguage === 'en' ? vocabularyWordAudio(currentWord().id) : hebrewWordAudio(currentWord().id)]);
  function render() {
    const state = getRevealState(target(),progress.guesses);
    $('reveal-clue-picture').textContent = currentWord().drawing;
    $('reveal-word').dir = context.profileLanguage === 'en' ? 'ltr' : 'rtl';
    $('reveal-word').replaceChildren(...target().split(/\s+/).map(word=>{
      const group=document.createElement('div');group.className='reveal-word-group';
      group.replaceChildren(...[...word].filter(letter=>!/[\u0591-\u05C7]/u.test(letter)).map(letter=>{const span=document.createElement('span');const guessable=/[A-Zא-ת]/u.test(letter);span.textContent=!guessable||progress.guesses.includes(letter)?letter:'·';if(!guessable)span.className='separator';return span;}));
      return group;
    }));
    $('reveal-image').setAttribute('src',`./prototype/assets/forest/forest-video-${String(2 + (level.picture + progress.round - 2) % 8).padStart(2,'0')}.jpg`);
    root.querySelectorAll('.reveal-curtain span').forEach((tile,index)=>tile.classList.toggle('revealed',index<state.tiles));
    const alphabet = context.profileLanguage === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'אבגדהוזחטיכךלמםנןסעפףצץקרשת';
    $('reveal-keyboard').dir = context.profileLanguage === 'en' ? 'ltr' : 'rtl';
    $('reveal-keyboard').replaceChildren(...[...alphabet].map(letter=>{const button=document.createElement('button');button.type='button';button.textContent=letter;button.dataset.letter=letter;button.disabled=state.complete||progress.guesses.includes(letter);button.classList.toggle('correct',progress.guesses.includes(letter)&&state.letters.includes(letter));button.onclick=()=>guess(letter);return button;}));
    $<HTMLButtonElement>('reveal-hint').disabled=state.complete;
    $('reveal-next').hidden=!state.complete;
    $('reveal-next').textContent=progress.round === wordIds.length - 1 ? 'כל הכבוד! ממשיכים במסע ←' : 'למילה הבאה ←';
    $('reveal-progress').textContent=`מילה ${progress.round + 1} מתוך ${wordIds.length}`;
    if(state.complete) $('reveal-message').textContent='כל האותיות התגלו — והתמונה מלאה בקסם!';
  }
  function guess(letter:string) {
    const state=getRevealState(target(),progress.guesses);
    if(state.complete||progress.guesses.includes(letter))return;
    if(!state.letters.includes(letter)) progress.mistakes++;
    progress.guesses.push(letter);persist();render();
    if(!getRevealState(target(),progress.guesses).complete) $('reveal-message').textContent=state.letters.includes(letter)?'מצאתם אות! עוד קצת קסם מתגלה.':'האות הזאת לא במילה. נסו אות אחרת.';
  }
  $('reveal-back').onclick=()=>{stopRecordedSpeech();session.exit();};
  $('reveal-sound').onclick=speak;
  $('reveal-hint').onclick=()=>{progress.hints++;guess(getRevealHint(target(),progress.guesses));};
  $('reveal-next').onclick=()=>{
    if(progress.round === wordIds.length - 1) {
      const help = progress.mistakes + progress.hints;
      saveStorage.removeItem(key);
      stopRecordedSpeech();
      session.complete(help === 0 ? 3 : help <= wordIds.length ? 2 : 1);
      return;
    }
    progress.round++;
    progress.guesses = getInitialRevealedLetters(target());
    persist();
    $('reveal-message').textContent = 'מילה חדשה מחכה לכם. בחרו אות!';
    render();
    speak();
  };
  document.addEventListener('keydown',event=>{
    const letter=event.key.toLocaleUpperCase();
    if(event.ctrlKey||event.metaKey||event.altKey||event.target instanceof HTMLButtonElement && ['Enter',' '].includes(event.key))return;
    const button=[...root.querySelectorAll<HTMLButtonElement>('[data-letter]')].find(b=>b.dataset.letter===letter);
    if(button&&!button.disabled){event.preventDefault();guess(letter);}
  });
  render();
  // A readable state hook for the browser acceptance loop; progress is changed only by UI actions.
  (window as any).render_game_to_text=()=>JSON.stringify({game:'magic-reveal',language:context.profileLanguage,wordLength:[...target()].length,guesses:progress.guesses,...getRevealState(target(),progress.guesses),round:progress.round});
}
