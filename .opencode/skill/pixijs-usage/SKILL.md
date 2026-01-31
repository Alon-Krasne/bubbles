---
name: pixijs-usage
description: PixiJS v8 usage patterns for Application setup, assets, rendering, interaction, and performance.
---

# PixiJS v8 Usage

## What I do
- Provide PixiJS v8 setup patterns (Application.init, app.canvas, resizeTo).
- Show asset loading via Assets.init + Assets.load and Sprite creation.
- Explain scene graph basics: Container, Sprite, Text, BitmapText.
- Offer ticker and time-step guidance (deltaTime, deltaMS, FPS).
- Cover interaction basics with eventMode + pointer events.
- Call out resizing and common v8 gotchas.

## When to use
Use this skill when:
- You are adding or modifying PixiJS code.
- You need to translate gameplay or UI requirements into PixiJS APIs.
- You are debugging rendering, resize, or interaction issues.

## Version check
- Read `package.json` or the lockfile to confirm the PixiJS major version.
- Prefer Context7 snippets for the exact version in use.

## Quick start (v8)
```ts
import { Application, Assets, Sprite } from 'pixi.js';

const app = new Application();
await app.init({ background: '#1099bb', resizeTo: window });
document.body.appendChild(app.canvas);

const texture = await Assets.load('assets/bunny.png');
const sprite = new Sprite(texture);
sprite.anchor.set(0.5);
sprite.position.set(app.screen.width / 2, app.screen.height / 2);
app.stage.addChild(sprite);
```

## Assets
- `await Assets.init({ basePath: 'assets/' })` for relative paths.
- `Assets.load()` supports single or multiple asset paths (textures, spritesheets, fonts, data).
- Use spritesheets for grouped textures and `BitmapText` for high-performance UI text.

## Scene graph
- `app.stage` is the root `Container`.
- Use `Container` to group objects and apply shared transforms.
- Use `Sprite` for textures, `Text` for styled canvas text, `BitmapText` for performance.

## Ticker / game loop
- `app.ticker.add((time) => { ... })` for per-frame updates.
- Use `time.deltaTime` for frame-rate independent updates.
- `app.ticker.FPS` and `app.ticker.deltaMS` help with diagnostics.

## Interaction
- Set `displayObject.eventMode = 'static'` (or `dynamic`) to enable pointer events.
- Use `on('pointerdown' | 'pointermove' | 'pointerup')` handlers.
- For hit testing, ensure the object has a non-zero size or a hitArea.

## Resize
- Prefer `resizeTo: window` or a container element in `app.init`.
- Manual resize: `app.renderer.resize(width, height)` and update layout.

## Common v8 gotchas
- v8 uses `app.canvas` (not `app.view`).
- `app.init` is async; await it before reading `app.screen`.
- Interaction uses `eventMode`; `interactive` is legacy.

## Gemini prompt (optional)
Use with Gemini CLI if available:
```
You are a PixiJS v8 expert. Provide a minimal, working example that shows:
- Application.init with resizeTo
- Assets.load for textures
- Sprite setup with anchor + position
- Ticker update using deltaTime
- Pointer event handling with eventMode
Return code only.
```

## Prompt patterns
- "Implement a PixiJS v8 scene with a root Container and parallax background. use context7"
- "Add sprite interaction with pointerdown + hover states (PixiJS v8). use context7"
- "Resize a PixiJS v8 game to fit a container and reposition UI. use context7"
- "Create a PixiJS v8 asset loading pipeline with Assets.load and spritesheets. use context7"

## Reference links
- https://pixijs.download/release/docs/index.html
- https://pixijs.com/8.x/guides
