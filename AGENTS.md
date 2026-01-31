# AGENTS.md

## Project Overview
- Game name: בועות! (Bubbles!)
- Purpose: Cooperative bubble-catching game for two kids
- Target players: לוטם (7) and תום (4.5)
- Created by: Dad (41, nostalgic for 90s side-by-side games)

## Visual Reference
- Approved mockup: `design/draft-v1.png`
- Style: Dreamy, pastel, kawaii blobs with soft gradients and sparkles

## Original Requirements
- 2D view with slight perspective (not pure side-view, not top-down)
- Bubbles fall from sky downward
- Characters move left/right only
- Cooperative gameplay with shared score
- Hebrew RTL interface with editable names (defaults: לוטם, תום)
- Cute kawaii blob characters (pink girl with bow, blue boy)
- Dreamy animated background (sun, clouds, twinkling stars)
- Lush grass with swaying blades and flowers
- Timer options: 30, 45, 60 seconds
- Sparkle particle effects on bubble catch
- Persistent high scores (localStorage)
- No power-ups in MVP
- Visual effects only (no audio for now)

## Technical Stack
- HTML5 + CSS3 (no preprocessors)
- Vanilla JavaScript (ES6+)
- Vite for dev server and production builds
- PixiJS v8 for rendering pipeline
- HTML5 Canvas drawn into a Pixi texture

## File Structure
```
bubbles/
├── index.html          # Main entry point
├── src/
│   ├── game.js         # Game engine, classes, rendering
│   ├── main.js         # Vite entry, Pixi bootstrap
│   └── styles.css      # UI styling (screens, HUD)
├── design/
│   └── draft-v1.png    # Approved visual mockup
├── docs/
│   ├── GAME_PLAN.md    # Original detailed spec
│   └── IMPLEMENTATION_PLAN.md  # Enhancement plan
├── scripts/
│   └── bundle.js       # Bundles into single HTML
├── dist/
│   └── bubbles_v<major>.html    # Shareable bundled game
├── package.json
├── README.md
└── AGENTS.md
```

## Design Principles
- Kid-friendly: Large touch targets, clear visuals, simple controls
- Playful aesthetic: Kawaii style, soft pastels, bubbly UI
- Hebrew-first: RTL layout, Hebrew fonts (Rubik, Secular One)
- Lightweight: Minimal bundle size, fast startup
- Shareable: Vite build outputs static assets for easy hosting

## Coding Conventions
- Game state managed via module-level variables
- Classes for game entities (Character, Bubble, Particle)
- Separate functions for background layers (drawSun, drawClouds, drawGrass)
- CSS uses custom properties (variables) for colors
- Hebrew text in UI, English in code/comments

## How to Run
- `bun run dev` - Start Vite dev server
- `bun run build` - Create production build in `dist/`
- `bun run preview` - Preview the production build

## Key Design Decisions
- Use Vite + PixiJS while keeping the game loop in vanilla JS
- Canvas for game, DOM for UI overlays (screens, HUD)
- Cooperative (not competitive) to encourage sibling bonding
- Bubbles fall DOWN (not up) to match the visual perspective

## Versioning
- Version is stored in `package.json` and displayed in the UI on the start screen
- Use semantic versioning: `MAJOR.MINOR.PATCH`
  - **MAJOR**: Breaking changes or major redesigns
  - **MINOR**: New features (e.g., new theme, new game mode)
  - **PATCH**: Bug fixes, small tweaks, refactors

### Agent Directive: Version Bumping
When completing work on a PR, you MUST:
1. Determine the appropriate version bump based on your changes
2. Run `npm version <major|minor|patch> --no-git-tag-version` to bump the version
3. Include the version bump in your commit

### PR Review Directive
When reviewing a PR, verify that:
1. The version has been bumped appropriately for the changes
2. If not bumped, request the author to bump the version or do it yourself before approving
