import * as PIXI from 'pixi.js';
import './styles.css';
import { FIGURE_ASSET_URLS, initGame, rebuildBackgroundForResize, resizeGame } from './game';

function applyFigureButtonImages() {
    document.querySelectorAll('.figure-btn').forEach((button) => {
        const figure = button.dataset.figure;
        const image = button.querySelector('img');
        if (image && FIGURE_ASSET_URLS[figure]) {
            image.src = FIGURE_ASSET_URLS[figure];
        }
    });
}

async function createPixiStage(container) {
    const app = new PIXI.Application();
    await app.init({
        resizeTo: container,
        antialias: true,
        backgroundAlpha: 0
    });

    app.canvas.setAttribute('aria-label', 'Bubbles game canvas');
    app.canvas.setAttribute('role', 'img');
    container.prepend(app.canvas);

    return app;
}

async function initPixiGame() {
    const container = document.getElementById('game-container');
    if (!container) {
        throw new Error('Missing #game-container element.');
    }

    const app = await createPixiStage(container);

    const gameCanvas = document.createElement('canvas');
    const gameContext = gameCanvas.getContext('2d');
    if (!gameContext) {
        throw new Error('Unable to create 2D canvas context.');
    }

    const texture = PIXI.Texture.from(gameCanvas);
    const sprite = new PIXI.Sprite(texture);
    app.stage.addChild(sprite);

    const syncRendererSize = () => {
        const { width, height } = app.renderer;
        gameCanvas.width = width;
        gameCanvas.height = height;
        sprite.width = width;
        sprite.height = height;
    };

    const handleResize = () => {
        syncRendererSize();
        const { width, height } = app.renderer;
        resizeGame(width, height);
        rebuildBackgroundForResize();
        texture.update();
    };

    app.renderer.on('resize', handleResize);
    syncRendererSize();

    initGame({
        canvas: gameCanvas,
        ctx: gameContext,
        onFrame: () => texture.update()
    });

    handleResize();
}

applyFigureButtonImages();
initPixiGame().catch((error) => {
    console.error('Failed to initialize Pixi game.', error);
    const container = document.getElementById('game-container');
    if (!container) return;

    const errorScreen = document.createElement('div');
    errorScreen.className = 'error-screen';
    errorScreen.innerHTML = `
        <div class="error-card">
            <h2>אוי לא!</h2>
            <p>המשחק לא הצליח להיטען. אפשר לרענן ולנסות שוב.</p>
            <button type="button" class="error-retry">רענון מחדש</button>
        </div>
    `;

    errorScreen.querySelector('.error-retry')?.addEventListener('click', () => {
        window.location.reload();
    });

    container.appendChild(errorScreen);
});
