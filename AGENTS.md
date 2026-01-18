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
- Vanilla HTML5
- Vanilla CSS3 (no preprocessors)
- Vanilla JavaScript (ES6+)
- HTML5 Canvas for game rendering
- No frameworks, no dependencies
- Bundle script creates single shareable HTML file

## File Structure
```
bubbles/
├── index.html          # Main entry point
├── src/
│   ├── game.js         # Game engine, classes, rendering
│   └── styles.css      # UI styling (screens, HUD)
├── design/
│   └── draft-v1.png    # Approved visual mockup
├── docs/
│   ├── GAME_PLAN.md    # Original detailed spec
│   └── IMPLEMENTATION_PLAN.md  # Enhancement plan
├── scripts/
│   └── bundle.js       # Bundles into single HTML
├── dist/
│   └── bubbles.html    # Shareable bundled game
├── package.json
├── README.md
└── AGENTS.md
```

## Design Principles
- Kid-friendly: Large touch targets, clear visuals, simple controls
- Playful aesthetic: Kawaii style, soft pastels, bubbly UI
- Hebrew-first: RTL layout, Hebrew fonts (Rubik, Secular One)
- Lightweight: No frameworks, minimal bundle size
- Shareable: Single HTML file works offline

## Coding Conventions
- Game state managed via module-level variables
- Classes for game entities (Character, Bubble, Particle)
- Separate functions for background layers (drawSun, drawClouds, drawGrass)
- CSS uses custom properties (variables) for colors
- Hebrew text in UI, English in code/comments

## How to Run
- `bun run start` - Open game in browser
- `bun run bundle` - Create `dist/bubbles.html`
- `bun run share` - Bundle and open

## Key Design Decisions
- Keep vanilla HTML/CSS/JS (no frameworks)
- Canvas for game, DOM for UI overlays (screens, HUD)
- Cooperative (not competitive) to encourage sibling bonding
- Bubbles fall DOWN (not up) to match the visual perspective
