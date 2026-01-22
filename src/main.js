import * as PIXI from 'pixi.js';
import './styles.css';
import { FIGURE_ASSET_URLS, initGame, resizeGame } from './game';

function applyFigureButtonImages() {
    document.querySelectorAll('.figure-btn').forEach((button) => {
        const figure = button.dataset.figure;
        const image = button.querySelector('img');
        if (image && FIGURE_ASSET_URLS[figure]) {
            image.src = FIGURE_ASSET_URLS[figure];
        }
    });
}

function createPixiStage(container) {
    const app = new PIXI.Application({
        resizeTo: container,
        antialias: true,
        backgroundAlpha: 0
    });

    app.view.setAttribute('aria-label', 'Bubbles game canvas');
    app.view.setAttribute('role', 'img');
    container.prepend(app.view);

    return app;
}

function initPixiGame() {
    const container = document.getElementById('game-container');
    if (!container) {
        throw new Error('Missing #game-container element.');
    }

    const app = createPixiStage(container);

    const gameCanvas = document.createElement('canvas');
    const gameContext = gameCanvas.getContext('2d');
    if (!gameContext) {
        throw new Error('Unable to create 2D canvas context.');
    }

    const texture = PIXI.Texture.from(gameCanvas);
    const sprite = new PIXI.Sprite(texture);
    app.stage.addChild(sprite);

    const handleResize = () => {
        const { width, height } = app.renderer;
        gameCanvas.width = width;
        gameCanvas.height = height;
        sprite.width = width;
        sprite.height = height;
        resizeGame(width, height);
        texture.update();
    };

    app.renderer.on('resize', handleResize);
    handleResize();

    initGame({
        canvas: gameCanvas,
        ctx: gameContext,
        onFrame: () => texture.update()
    });
}

applyFigureButtonImages();
initPixiGame();
