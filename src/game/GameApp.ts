import { Application, Text } from 'pixi.js';
import { GameState, GamePhase } from './GameState';
import { BackgroundScene } from '../scenes/BackgroundScene';
import { GameScene, PlayerConfig } from '../scenes/GameScene';
import { FigureType } from '../entities/Character';
import { FallingItemMode } from '../entities/Bubble';

export class GameApp {
  private app: Application | null = null;
  private background: BackgroundScene | null = null;
  private gameScene: GameScene | null = null;
  private state = new GameState();
  private devOverlay: Text | null = null;

  // Game timer
  private gameTimer: number | null = null;

  // Callbacks for UI updates
  public onScoreChange?: (score: number) => void;
  public onTimeChange?: (time: number) => void;
  public onGameEnd?: (score: number) => void;

  // Dev mode
  private devMode = false;
  private fpsFrames = 0;
  private fpsLastTime = 0;
  private fpsDisplay = 0;

  async init() {
    // Check dev mode
    this.devMode =
      new URLSearchParams(window.location.search).has('dev') ||
      localStorage.getItem('bubble_dev_mode') === 'true';

    const app = new Application();
    await app.init({
      background: '#87ceeb',
      resizeTo: window,
      antialias: true,
      preference: 'webgl',
    });

    this.app = app;
    const container = document.getElementById('game-container');
    if (!container) {
      throw new Error('Missing #game-container');
    }

    // Insert canvas at the beginning (behind DOM UI)
    container.prepend(app.canvas);

    // Force PixiJS to resize to window dimensions
    app.renderer.resize(window.innerWidth, window.innerHeight);

    this.setupStage();
    this.setupControls();
    this.setupResize();
    this.startGameLoop();
  }

  private setupStage() {
    if (!this.app) return;

    // Background layer (sky, sun, clouds, grass)
    this.background = new BackgroundScene();
    this.app.stage.addChild(this.background);

    // Game scene layer (characters, bubbles, particles)
    this.gameScene = new GameScene();
    this.app.stage.addChild(this.gameScene);

    // Dev overlay
    if (this.devMode) {
      this.devOverlay = new Text({
        text: 'FPS: --',
        style: {
          fontFamily: 'monospace',
          fontSize: 14,
          fill: 0x4ade80,
        },
      });
      this.devOverlay.x = 10;
      this.devOverlay.y = 10;
      this.app.stage.addChild(this.devOverlay);
    }

    // Initial resize
    this.handleResize();
  }

  private setupControls() {
    const keys: Record<string, boolean> = {};

    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      // Only prevent default during gameplay
      if (this.state.phase === 'PLAYING') {
        if (['KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    // Store keys reference for game loop
    (this as any)._keys = keys;
  }

  private handleInput() {
    if (!this.gameScene || this.state.phase !== 'PLAYING') return;

    const keys = (this as any)._keys as Record<string, boolean>;

    // Player 1: A/D
    let p1vx = 0;
    if (keys['KeyA']) p1vx = -1;
    if (keys['KeyD']) p1vx = 1;
    this.gameScene.setPlayerVelocity(0, p1vx);

    // Player 2: Arrow keys
    let p2vx = 0;
    if (keys['ArrowLeft']) p2vx = -1;
    if (keys['ArrowRight']) p2vx = 1;
    this.gameScene.setPlayerVelocity(1, p2vx);
  }

  private handleResize() {
    if (!this.app || !this.background || !this.gameScene) return;

    // Resize renderer to window
    this.app.renderer.resize(window.innerWidth, window.innerHeight);

    const { width, height } = this.app.screen;
    this.background.resize(width, height);
    this.gameScene.resize(width, height);
  }

  private setupResize() {
    window.addEventListener('resize', () => this.handleResize());
  }

  private startGameLoop() {
    if (!this.app) return;

    this.fpsLastTime = performance.now();

    this.app.ticker.add((ticker) => {
      const dt = ticker.deltaTime;

      // Update background animations
      this.background?.update(dt);

      // Handle game logic
      if (this.state.phase === 'PLAYING') {
        this.handleInput();
        const score = this.gameScene?.update(dt) ?? 0;

        if (score !== this.state.score) {
          this.state.score = score;
          this.onScoreChange?.(score);
        }
      }

      // Dev overlay
      if (this.devMode && this.devOverlay) {
        this.updateDevOverlay();
      }
    });
  }

  private updateDevOverlay() {
    this.fpsFrames++;
    const now = performance.now();

    if (now - this.fpsLastTime >= 500) {
      this.fpsDisplay = Math.round(this.fpsFrames / ((now - this.fpsLastTime) / 1000));
      this.fpsFrames = 0;
      this.fpsLastTime = now;
    }

    const bubbles = this.gameScene?.getBubbleCount() ?? 0;
    const particles = this.gameScene?.getParticleCount() ?? 0;

    this.devOverlay!.text = `FPS: ${this.fpsDisplay}\nBubbles: ${bubbles}\nParticles: ${particles}`;
    this.devOverlay!.style.fill = this.fpsDisplay >= 55 ? 0x4ade80 : this.fpsDisplay >= 30 ? 0xfbbf24 : 0xf87171;
  }

  // Public API for UI integration

  startGame(p1Config: PlayerConfig, p2Config: PlayerConfig, duration: number) {
    if (!this.gameScene) return;

    this.state.setPhase('PLAYING');
    this.state.score = 0;
    this.state.timeLeft = duration;

    this.gameScene.startGame(p1Config, p2Config);

    // Start timer
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    this.gameTimer = window.setInterval(() => {
      this.state.timeLeft--;
      this.onTimeChange?.(this.state.timeLeft);

      if (this.state.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    this.onScoreChange?.(0);
    this.onTimeChange?.(duration);
  }

  endGame() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.state.setPhase('END');
    this.gameScene?.clear();
    this.onGameEnd?.(this.state.score);
  }

  returnToStart() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }

    this.state.setPhase('START');
    this.gameScene?.clear();
  }

  setTheme(themeName: string) {
    this.background?.setTheme(themeName);
  }

  setFallingItemsMode(mode: FallingItemMode) {
    this.gameScene?.setFallingItemsMode(mode);
  }

  getPhase(): GamePhase {
    return this.state.phase;
  }
}
