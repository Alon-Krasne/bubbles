import './styles.css';
import { GameApp } from './game/GameApp';
import { FigureType } from './entities/Character';
import { FallingItemMode } from './entities/Bubble';

// Version badge
const versionBadge = document.getElementById('version-badge');
if (versionBadge) {
  versionBadge.textContent = `v${__APP_VERSION__}`;
}

// Initialize game
const gameApp = new GameApp();

// Player state (will be updated by UI)
let p1Name = localStorage.getItem('bubble_p1_name') || 'לוטם';
let p2Name = localStorage.getItem('bubble_p2_name') || 'תום';
let p1Color = 0xff9eb5;
let p2Color = 0x7ec8e8;
let p1Figure: FigureType = 'blob';
let p2Figure: FigureType = 'blob';
let selectedTime = 45;
let fallingItemsMode: FallingItemMode = 'bubbles';

// Load saved preferences
function loadPreferences() {
  const savedColors = JSON.parse(localStorage.getItem('bubble_colors') || '{}');
  if (savedColors.p1) p1Color = parseInt(savedColors.p1.replace('#', ''), 16);
  if (savedColors.p2) p2Color = parseInt(savedColors.p2.replace('#', ''), 16);

  const savedFigures = JSON.parse(localStorage.getItem('bubble_figures') || '{}');
  if (savedFigures.p1) p1Figure = savedFigures.p1;
  if (savedFigures.p2) p2Figure = savedFigures.p2;

  const savedNames = JSON.parse(localStorage.getItem('bubble_names') || '{}');
  if (savedNames.p1) p1Name = savedNames.p1;
  if (savedNames.p2) p2Name = savedNames.p2;

  const savedTheme = localStorage.getItem('bubble_background_theme');
  if (savedTheme) {
    gameApp.setTheme(savedTheme);
    document.querySelectorAll('.world-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.theme === savedTheme);
    });
  }

  const savedItems = localStorage.getItem('bubble_falling_items_mode') as FallingItemMode;
  if (savedItems) {
    fallingItemsMode = savedItems;
    gameApp.setFallingItemsMode(savedItems);
    document.querySelectorAll('.items-btn').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.items === savedItems);
    });
  }
}

// Setup UI event handlers
function setupUI() {
  // Name inputs
  const p1Input = document.getElementById('p1-name') as HTMLInputElement;
  const p2Input = document.getElementById('p2-name') as HTMLInputElement;

  if (p1Input) {
    p1Input.value = p1Name;
    p1Input.addEventListener('input', () => {
      p1Name = p1Input.value || 'לוטם';
      localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
    });
  }

  if (p2Input) {
    p2Input.value = p2Name;
    p2Input.addEventListener('input', () => {
      p2Name = p2Input.value || 'תום';
      localStorage.setItem('bubble_names', JSON.stringify({ p1: p1Name, p2: p2Name }));
    });
  }

  // Color pickers
  document.querySelectorAll('.player-bubble').forEach((picker) => {
    const player = (picker as HTMLElement).dataset.player;

    picker.querySelectorAll('.color-petal').forEach((petal) => {
      petal.addEventListener('click', () => {
        const colorStr = (petal as HTMLElement).dataset.color;
        if (!colorStr) return;

        const color = parseInt(colorStr.replace('#', ''), 16);

        if (player === '1') {
          p1Color = color;
        } else {
          p2Color = color;
        }

        // Update UI
        picker.querySelectorAll('.color-petal').forEach((p) => {
          p.classList.toggle('is-selected', p === petal);
        });

        localStorage.setItem('bubble_colors', JSON.stringify({ p1: `#${p1Color.toString(16).padStart(6, '0')}`, p2: `#${p2Color.toString(16).padStart(6, '0')}` }));
      });
    });

    // Figure pickers
    picker.querySelectorAll('.figure-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const figure = (btn as HTMLElement).dataset.figure as FigureType;

        if (player === '1') {
          p1Figure = figure;
        } else {
          p2Figure = figure;
        }

        picker.querySelectorAll('.figure-btn').forEach((b) => {
          b.classList.toggle('is-selected', b === btn);
        });

        localStorage.setItem('bubble_figures', JSON.stringify({ p1: p1Figure, p2: p2Figure }));
      });
    });
  });

  // Timer buttons
  document.querySelectorAll('.candy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.candy-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime = parseInt((btn as HTMLElement).dataset.time || '45');
    });
  });

  // World Carousel
  setupWorldCarousel();

  // World/theme picker (legacy - kept for compatibility)
  document.querySelectorAll('.world-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.world-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = (btn as HTMLElement).dataset.theme || 'classic';
      gameApp.setTheme(theme);
      localStorage.setItem('bubble_background_theme', theme);
    });
  });

  // Falling items picker
  document.querySelectorAll('.items-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.items-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = (btn as HTMLElement).dataset.items as FallingItemMode;
      fallingItemsMode = mode;
      gameApp.setFallingItemsMode(mode);
      localStorage.setItem('bubble_falling_items_mode', mode);
    });
  });

  // Start button
  document.getElementById('start-btn')?.addEventListener('click', startGame);

  // Restart button
  document.getElementById('restart-btn')?.addEventListener('click', returnToStart);

  // Home button
  document.getElementById('home-btn')?.addEventListener('click', returnToStart);

  // High scores popup
  document.getElementById('show-scores-btn')?.addEventListener('click', () => {
    document.getElementById('scores-popup')?.classList.remove('hidden');
  });

  document.querySelector('.close-popup')?.addEventListener('click', () => {
    document.getElementById('scores-popup')?.classList.add('hidden');
  });

  document.getElementById('scores-popup')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).id === 'scores-popup') {
      (e.target as HTMLElement).classList.add('hidden');
    }
  });
}

function startGame() {
  document.getElementById('start-screen')?.classList.remove('active');
  document.getElementById('end-screen')?.classList.remove('active');
  document.getElementById('game-hud')?.classList.add('active');

  gameApp.startGame(
    { name: p1Name, color: p1Color, figureType: p1Figure, isGirl: true },
    { name: p2Name, color: p2Color, figureType: p2Figure, isGirl: false },
    selectedTime
  );
}

function returnToStart() {
  gameApp.returnToStart();
  document.getElementById('game-hud')?.classList.remove('active');
  document.getElementById('end-screen')?.classList.remove('active');
  document.getElementById('start-screen')?.classList.add('active');
}

function showEndScreen(score: number) {
  document.getElementById('game-hud')?.classList.remove('active');
  document.getElementById('end-screen')?.classList.add('active');

  const finalScoreEl = document.getElementById('final-score-val');
  if (finalScoreEl) finalScoreEl.textContent = String(score);

  // Save high score
  saveHighScore(score, p1Name, p2Name);
  loadHighScores();
}

function saveHighScore(score: number, n1: string, n2: string) {
  let scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');
  scores.push({
    score,
    names: `${n1} & ${n2}`,
    date: new Date().toLocaleDateString('he-IL'),
  });
  scores.sort((a: any, b: any) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem('bubble_scores', JSON.stringify(scores));
}

function loadHighScores() {
  const scores = JSON.parse(localStorage.getItem('bubble_scores') || '[]');

  const list = document.getElementById('scores-list');
  if (list) {
    list.innerHTML = scores.map((s: any) => `<li>${s.names}: ${s.score}</li>`).join('');
  }

  const tableBody = document.querySelector('#full-scores-table tbody');
  if (tableBody) {
    const medalEmojis = ['🥇', '🥈', '🥉'];
    const medalClasses = ['medal-gold', 'medal-silver', 'medal-bronze'];

    tableBody.innerHTML = scores
      .map((s: any, i: number) => {
        const medal = medalEmojis[i] || i + 1;
        const rowClass = medalClasses[i] || '';
        return `<tr class="${rowClass}"><td>${medal}</td><td>${s.names}</td><td>${s.score}</td></tr>`;
      })
      .join('');
  }
}

// ==================== WORLD CAROUSEL ====================
function setupWorldCarousel() {
  const track = document.querySelector('.carousel-track') as HTMLElement;
  const cards = document.querySelectorAll('.carousel-card');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const viewport = document.querySelector('.carousel-viewport') as HTMLElement;

  if (!track || cards.length === 0) return;

  let currentIndex = 0;
  let isAnimating = false;
  let touchStartX = 0;
  let touchEndX = 0;
  let previewTimeout: number | null = null;

  // Get theme names for matching saved preference
  const themes = Array.from(cards).map((card) => (card as HTMLElement).dataset.theme);

  // Load saved theme and set initial index
  const savedTheme = localStorage.getItem('bubble_background_theme');
  if (savedTheme) {
    const savedIndex = themes.indexOf(savedTheme);
    if (savedIndex !== -1) {
      currentIndex = savedIndex;
    }
  }

  function updateCarousel(animate = true) {
    if (!track || !viewport) return;

    // Calculate card width + gap
    const card = cards[0] as HTMLElement;
    const cardWidth = card.offsetWidth;
    const gap = parseInt(getComputedStyle(track).gap) || 15;

    // Calculate offset to center the active card in the viewport
    const viewportWidth = viewport.offsetWidth;
    const cardFullWidth = cardWidth + gap;
    
    // Center the current card in the viewport
    // Start position: first card at center = (viewportWidth - cardWidth) / 2
    // For each subsequent card, we need to shift by cardFullWidth
    const startOffset = (viewportWidth - cardWidth) / 2;
    const translateX = startOffset - (currentIndex * cardFullWidth);

    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    track.style.transform = `translateX(${translateX}px)`;

    // Update active states
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === currentIndex);
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    // Update theme
    const theme = themes[currentIndex] || 'classic';
    gameApp.setTheme(theme);
    localStorage.setItem('bubble_background_theme', theme);
  }

  function goToSlide(index: number) {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex = ((index % cards.length) + cards.length) % cards.length;
    updateCarousel();

    // Trigger mascot bounce animation
    triggerMascotBounce();

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  }

  function triggerMascotBounce() {
    const mascots = document.querySelectorAll('.mascot');
    mascots.forEach((mascot) => {
      mascot.classList.remove('bounce');
      // Force reflow to restart animation
      void (mascot as HTMLElement).offsetWidth;
      mascot.classList.add('bounce');
    });

    // Remove bounce class after animation completes
    setTimeout(() => {
      mascots.forEach((mascot) => mascot.classList.remove('bounce'));
    }, 600);
  }

  function goNext() {
    goToSlide(currentIndex + 1);
  }

  function goPrev() {
    goToSlide(currentIndex - 1);
  }

  // Preview theme on hover (with debounce)
  function previewTheme(theme: string) {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
    }
    previewTimeout = window.setTimeout(() => {
      gameApp.setTheme(theme);
    }, 150);
  }

  function cancelPreview() {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }
    // Restore selected theme
    const selectedTheme = themes[currentIndex] || 'classic';
    gameApp.setTheme(selectedTheme);
  }

  // Click handlers
  prevBtn?.addEventListener('click', goPrev);
  nextBtn?.addEventListener('click', goNext);

  // Card click handlers
  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      goToSlide(index);
    });

    // Hover preview
    card.addEventListener('mouseenter', () => {
      const theme = (card as HTMLElement).dataset.theme || 'classic';
      previewTheme(theme);
    });

    card.addEventListener('mouseleave', () => {
      cancelPreview();
    });
  });

  // Dot click handlers
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Touch support
  viewport?.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );

  viewport?.addEventListener(
    'touchmove',
    (e) => {
      touchEndX = e.touches[0].clientX;
    },
    { passive: true }
  );

  viewport?.addEventListener('touchend', () => {
    const diff = touchStartX - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // In RTL, swipe left goes to previous
        goPrev();
      } else {
        // In RTL, swipe right goes to next
        goNext();
      }
    }
  });

  // Keyboard support (when carousel is focused)
  document.addEventListener('keydown', (e) => {
    // Only handle when start screen is active
    if (!document.getElementById('start-screen')?.classList.contains('active')) return;

    // Don't handle if user is typing in an input
    if (document.activeElement?.tagName === 'INPUT') return;

    if (e.key === 'ArrowRight') {
      goPrev(); // RTL - right goes to previous
    } else if (e.key === 'ArrowLeft') {
      goNext(); // RTL - left goes to next
    }
  });

  // Initialize
  updateCarousel(false);
}

// Game callbacks
gameApp.onScoreChange = (score) => {
  const el = document.getElementById('score-val');
  if (el) el.textContent = String(score);
};

gameApp.onTimeChange = (time) => {
  const el = document.getElementById('timer-val');
  if (el) el.textContent = String(time);
};

gameApp.onGameEnd = (score) => {
  showEndScreen(score);
};

// Initialize
gameApp.init().then(() => {
  loadPreferences();
  setupUI();
  loadHighScores();
});
