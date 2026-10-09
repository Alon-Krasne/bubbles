import { VOCAB_WORDS } from './words';
import {
  playRecordedSequence,
  stopRecordedSpeech,
  vocabularyWordAudio,
  hebrewWordAudio,
} from './recordedSpeech';
import {
  createMagicLettersRound,
  dropLetter,
  returnSlotItem,
  checkWordCompletion,
  getLetterHint,
  isSpellableWord,
  normalizeWordLetters,
  resetRound,
} from '../prototype/shared/magic-letters.mjs';
import { calculateMasteryStars } from '../prototype/shared/activity-scoring.mjs';
import type { HostedActivityContext, HostedActivitySession } from './hostedActivity';
import './magic-letters.css';

export interface MagicLettersGameOptions {
  wordsCount?: number;
  rank?: number;
}

// Screen text is Hebrew in both learning tracks, like the other activities.
// Only the word itself (letters, direction and audio) follows the learning language.
const TEXT = {
  title: 'אותיות הקסם',
  back: '← למפה',
  hint: '💡 רמז',
  sound: 'השמעת מילה',
  ready: 'מוכנים? נסדר! 🪄',
  preview: 'הביטו במילה וזכרו את סדר האותיות!',
  solving: 'גררו את האותיות למקום!',
  hintPlace: 'הנה רמז! גררו את האות הזוהרת למקום המסומן.',
  hintRemove: 'האות הזו לא במקום. גררו אותה חזרה למטה.',
  wrong: 'לא בדיוק! מנקים ומתחילים מחדש.',
  retry: 'ננסה שוב!',
  success: 'כל הכבוד! ✨',
  next: 'למילה הבאה ←',
  finish: 'כל הכבוד! סיימנו ✨',
  progress: (current: number, total: number) => `מילה ${current} מתוך ${total}`,
};

const SPARKLE_COUNT = 12;
const WRONG_WORD_PAUSE_MS = 900;
const DRAG_THRESHOLD_PX = 8;

export function openMagicLetters(
  context: HostedActivityContext,
  session: HostedActivitySession,
  options: MagicLettersGameOptions = {},
) {
  const root = document.getElementById('magic-letters-screen');
  if (!root) {
    throw new Error('Element #magic-letters-screen not found');
  }

  const language = context.profileLanguage;
  const wordDir = language === 'en' ? 'ltr' : 'rtl';
  const rank = options.rank ?? 1;
  const wordsCount = options.wordsCount ?? 3;

  // Single words of letters only, at least 4 letters long, in the learning language
  const eligibleWords = VOCAB_WORDS.filter((word) => {
    const text = language === 'en' ? word.english : word.hebrew;
    return isSpellableWord(text, language) && normalizeWordLetters(text, language).length >= 4;
  });

  // Pick wordsCount words (deterministic or varied by profile/stage)
  const startIndex = (context.stageId * 3) % eligibleWords.length;
  const selectedWords = Array.from({ length: wordsCount }, (_, i) => {
    return eligibleWords[(startIndex + i) % eligibleWords.length];
  });

  const progress = {
    roundIndex: 0,
    mistakes: 0,
    hints: 0,
    phase: 'preview' as 'preview' | 'solving' | 'complete',
  };

  let currentRound = createMagicLettersRound({
    word: selectedWords[0],
    language,
    rank,
  });

  // The hint only marks the move; the child still drags the letter.
  let activeHint: ReturnType<typeof getLetterHint> = null;
  let statusMessage = TEXT.preview;
  let statusTone: 'normal' | 'success' | 'warning' = 'normal';
  // True while a wrong word is shown before it is cleared; input is ignored meanwhile.
  let isResetting = false;

  function currentWordItem() {
    return selectedWords[progress.roundIndex];
  }

  function playWordSpeech() {
    const word = currentWordItem();
    const clip = language === 'en' ? vocabularyWordAudio(word.id) : hebrewWordAudio(word.id);
    void playRecordedSequence([clip]);
  }

  function setStatus(message: string, tone: typeof statusTone = 'normal') {
    statusMessage = message;
    statusTone = tone;
  }

  function startRound(index: number) {
    progress.roundIndex = index;
    progress.phase = 'preview';
    isResetting = false;
    activeHint = null;
    setStatus(TEXT.preview);

    currentRound = createMagicLettersRound({
      word: selectedWords[index],
      language,
      rank,
    });

    render();
    playWordSpeech();
  }

  function slotClasses(slot: (typeof currentRound.slots)[number]) {
    const classes = ['ml-slot'];
    if (slot.locked) classes.push('locked');
    classes.push(slot.currentChar !== null ? 'has-char' : 'empty-dot');
    if (progress.phase === 'complete') classes.push('correct');
    if (activeHint?.slotIndex === slot.index) {
      classes.push(activeHint.type === 'place' ? 'hint-target' : 'hint-remove');
    }
    return classes.join(' ');
  }

  function renderSparkles() {
    return `
      <div class="ml-sparkles" aria-hidden="true">
        ${Array.from({ length: SPARKLE_COUNT }, (_, i) => {
          const angle = (360 / SPARKLE_COUNT) * i;
          return `<span class="ml-sparkle" style="--angle: ${angle}deg; --delay: ${(i % 4) * 70}ms">✦</span>`;
        }).join('')}
      </div>`;
  }

  function render() {
    const word = currentWordItem();
    const isComplete = progress.phase === 'complete';

    root!.dir = 'rtl';
    root!.innerHTML = `
      <header class="ml-header">
        <button id="ml-back-btn" class="ml-btn" type="button">${TEXT.back}</button>
        <h1>${TEXT.title}</h1>
      </header>
      <button id="ml-hint-btn" class="magic-hint-button" type="button" ${progress.phase !== 'solving' ? 'disabled' : ''}>${TEXT.hint}</button>

      <main class="ml-stage">
        <section class="ml-card-wrap">
          <div class="ml-clue-row">
            <span class="ml-clue-drawing" aria-hidden="true">${word.drawing}</span>
            <button id="ml-sound-btn" class="ml-audio-btn" type="button" aria-label="${TEXT.sound}">🔊</button>
          </div>

          ${
            progress.phase === 'preview'
              ? `
            <div class="ml-preview-box">
              <div class="ml-preview-word" dir="${wordDir}">
                ${currentRound.letters.map((char, idx) => `<span class="ml-preview-tile" style="animation-delay: ${idx * 60}ms">${char}</span>`).join('')}
              </div>
              <button id="ml-ready-btn" class="ml-btn ml-ready-btn" type="button">${TEXT.ready}</button>
            </div>
            `
              : `
            <div class="ml-board">
              <div class="ml-slots-row" dir="${wordDir}">
                ${currentRound.slots
                  .map((slot) => `
                  <button type="button" class="${slotClasses(slot)}" data-slot-index="${slot.index}" tabindex="-1">
                    ${slot.currentChar !== null ? `<span class="ml-slot-char">${slot.currentChar}</span>` : ''}
                  </button>`)
                  .join('')}
              </div>
              ${isComplete ? renderSparkles() : ''}
            </div>
            `
          }

          <div id="ml-status" class="ml-status-text ${statusTone === 'normal' ? '' : statusTone}" role="status" aria-live="polite">${statusMessage}</div>
        </section>

        ${
          progress.phase !== 'preview'
            ? `
          <section class="ml-tray-panel">
            <div class="ml-tray-items" dir="${wordDir}">
              ${currentRound.tray
                .map((item) => {
                  const isHinted = activeHint?.type === 'place' && activeHint.trayItemId === item.id;
                  return `
                  <button type="button" class="ml-tile-btn${isHinted ? ' hint-highlight' : ''}" data-tile-id="${item.id}" tabindex="-1" ${item.used || isComplete ? 'disabled' : ''}>${item.char}</button>`;
                })
                .join('')}
            </div>
          </section>
          `
            : ''
        }

        <footer class="ml-footer">
          <span class="ml-progress-pill">${TEXT.progress(progress.roundIndex + 1, selectedWords.length)}</span>
          ${
            isComplete
              ? `<button id="ml-next-btn" class="ml-btn ml-next-btn" type="button">${
                progress.roundIndex === selectedWords.length - 1 ? TEXT.finish : TEXT.next
              }</button>`
              : ''
          }
        </footer>
      </main>
    `;

    attachHandlers();
  }

  function attachHandlers() {
    document.getElementById('ml-back-btn')!.onclick = () => {
      stopRecordedSpeech();
      session.exit();
    };

    document.getElementById('ml-sound-btn')!.onclick = () => {
      playWordSpeech();
    };

    const readyBtn = document.getElementById('ml-ready-btn');
    if (readyBtn) {
      readyBtn.onclick = () => {
        progress.phase = 'solving';
        setStatus(TEXT.solving);
        render();
      };
    }

    document.getElementById('ml-hint-btn')!.onclick = () => {
      if (progress.phase !== 'solving' || isResetting) return;
      const hint = getLetterHint(currentRound);
      if (!hint) return;
      // The same hint is already showing: pressing again must not cost another hint
      if (JSON.stringify(hint) === JSON.stringify(activeHint)) return;
      progress.hints += 1;
      activeHint = hint;
      setStatus(hint.type === 'place' ? TEXT.hintPlace : TEXT.hintRemove, hint.type === 'place' ? 'normal' : 'warning');
      render();
    };

    // Letters are placed and removed only by dragging
    attachDragHandlers();

    const nextBtn = document.getElementById('ml-next-btn');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (progress.roundIndex < selectedWords.length - 1) {
          startRound(progress.roundIndex + 1);
        } else {
          stopRecordedSpeech();
          const stars = calculateMasteryStars({
            mistakes: progress.mistakes + progress.hints,
            challengeSize: selectedWords.length,
          });
          session.complete(stars);
        }
      };
    }
  }

  type DragSource = { trayItemId: string } | { slotIndex: number };

  function dragSourceOf(el: HTMLElement): DragSource | null {
    if (el.dataset.tileId) return { trayItemId: el.dataset.tileId };
    const index = Number(el.dataset.slotIndex);
    const slot = currentRound.slots[index];
    return slot && !slot.locked && slot.currentChar !== null ? { slotIndex: index } : null;
  }

  // Any unlocked slot accepts a drop (a filled one is replaced), as does the tray.
  function dropTargetAt(x: number, y: number) {
    const under = document.elementFromPoint(x, y);
    const slotEl = under?.closest<HTMLElement>('[data-slot-index]');
    if (slotEl) {
      const slot = currentRound.slots[Number(slotEl.dataset.slotIndex)];
      return slot.locked ? null : { kind: 'slot' as const, index: slot.index, el: slotEl };
    }
    const trayEl = under?.closest<HTMLElement>('.ml-tray-panel');
    return trayEl ? { kind: 'tray' as const, el: trayEl } : null;
  }

  function applyDrop(source: DragSource, target: NonNullable<ReturnType<typeof dropTargetAt>>) {
    const moved = target.kind === 'tray'
      ? 'slotIndex' in source && returnSlotItem(currentRound, source.slotIndex)
      : dropLetter(currentRound, source, target.index);
    if (!moved) return;

    activeHint = null;
    setStatus(TEXT.solving);
    checkAndApplyRoundState();
  }

  function attachDragHandlers() {
    root!.querySelectorAll<HTMLElement>('[data-tile-id], [data-slot-index]').forEach((el) => {
      el.onpointerdown = (down) => {
        if (progress.phase !== 'solving' || isResetting || down.button !== 0) return;
        const source = dragSourceOf(el);
        if (!source || (el instanceof HTMLButtonElement && el.disabled)) return;

        const startX = down.clientX;
        const startY = down.clientY;
        const box = el.getBoundingClientRect();
        const char = el.textContent?.trim() ?? '';
        let ghost: HTMLElement | null = null;
        let hovered: HTMLElement | null = null;

        const setHover = (next: HTMLElement | null) => {
          if (hovered === next) return;
          hovered?.classList.remove('drop-target');
          hovered = next;
          hovered?.classList.add('drop-target');
        };

        const onMove = (move: PointerEvent) => {
          if (!ghost) {
            if (Math.hypot(move.clientX - startX, move.clientY - startY) < DRAG_THRESHOLD_PX) return;
            ghost = document.createElement('div');
            ghost.className = 'ml-drag-ghost';
            ghost.textContent = char;
            ghost.style.width = `${box.width}px`;
            ghost.style.height = `${box.height}px`;
            document.body.append(ghost);
            el.classList.add('drag-source');
          }
          ghost.style.left = `${move.clientX - box.width / 2}px`;
          ghost.style.top = `${move.clientY - box.height / 2}px`;
          setHover(dropTargetAt(move.clientX, move.clientY)?.el ?? null);
        };

        const finish = (up: PointerEvent, cancelled: boolean) => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          setHover(null);
          el.classList.remove('drag-source');
          if (!ghost) return;
          ghost.remove();

          const target = cancelled ? null : dropTargetAt(up.clientX, up.clientY);
          if (target) applyDrop(source, target);
        };
        const onUp = (up: PointerEvent) => finish(up, false);
        const onCancel = (up: PointerEvent) => finish(up, true);

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
      };
    });
  }

  function checkAndApplyRoundState() {
    const completion = checkWordCompletion(currentRound);

    if (!completion.isFilled) {
      render();
      return;
    }

    if (completion.isCorrect) {
      progress.phase = 'complete';
      setStatus(TEXT.success, 'success');
      render();
      playWordSpeech();
      return;
    }

    // Filled but wrong: show the wrong letters briefly, then clear and start over
    progress.mistakes += 1;
    setStatus(TEXT.wrong, 'warning');
    isResetting = true;
    const roundAtMistake = currentRound;
    render();

    root!.querySelectorAll<HTMLElement>('.ml-slot').forEach((slotEl) => {
      if (completion.misplacedIndices.includes(Number(slotEl.dataset.slotIndex))) {
        slotEl.classList.add('misplaced');
      }
    });

    setTimeout(() => {
      if (currentRound !== roundAtMistake || !isResetting) return;
      isResetting = false;
      resetRound(currentRound);
      activeHint = null;
      setStatus(TEXT.retry);
      render();
    }, WRONG_WORD_PAUSE_MS);
  }

  startRound(0);

  // Hook for testing and automated acceptance checks
  (window as unknown as Record<string, unknown>).render_game_to_text = () => {
    const comp = checkWordCompletion(currentRound);
    return JSON.stringify({
      game: 'magic-letters',
      language,
      roundIndex: progress.roundIndex,
      wordsCount: selectedWords.length,
      currentWordId: currentWordItem().id,
      targetWord: currentRound.targetWord,
      currentWord: comp.currentWord,
      phase: progress.phase,
      mistakes: progress.mistakes,
      hints: progress.hints,
      isFilled: comp.isFilled,
      isCorrect: comp.isCorrect,
      slots: currentRound.slots.map((s) => ({
        index: s.index,
        targetChar: s.targetChar,
        currentChar: s.currentChar,
        locked: s.locked,
      })),
      tray: currentRound.tray.map((t) => ({
        id: t.id,
        char: t.char,
        used: t.used,
      })),
    });
  };
}
