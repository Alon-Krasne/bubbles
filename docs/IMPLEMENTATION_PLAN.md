# Implementation Plan - בועות! Enhancements

**Date:** January 18, 2026  
**Status:** Ready to implement  
**Context:** Continue from this file in a new chat session

---

## Overview

Four enhancements to the בועות! game, plus a decision to keep the project vanilla (no frameworks).

---

## Task 1: High Score Differentiation

### Problem
All high score records look the same - boring and hard to distinguish.

### Solution
Add medals and colored row backgrounds for top 3 scores.

### Design Specification

| Place | Medal | Row Background |
|-------|-------|----------------|
| 1st | 🥇 | Gold gradient |
| 2nd | 🥈 | Silver gradient |
| 3rd | 🥉 | Bronze gradient |
| 4th+ | Number only | Normal/transparent |

### Visual Details
- Gold: Warm yellow/gold gradient, subtle glow
- Silver: Cool gray/white gradient
- Bronze: Warm brown/orange gradient
- Medals appear in the "מקום" (place) column
- Rows should feel celebratory, not just colored

### Files to Modify
- `src/styles.css` - Add `.medal-gold`, `.medal-silver`, `.medal-bronze` row styles
- `src/game.js` - Update `loadHighScores()` function to render medals and apply row classes

---

## Task 2: Flower Color Palette Picker

### Problem
Players can only change their names, not their character colors. Personalization is limited.

### Solution
Add a flower-shaped color picker around each player's name input.

### Design Specification

**Layout:** 8 color "petals" arranged in a circle around the name input area:
```
          ●
        ●   ●
      ●  [INPUT]  ●
        ●   ●
          ●
```

**Interaction:**
- Each petal is clickable
- Selected petal shows a ring/glow effect
- The name input border/background subtly reflects the selected color
- Default: Pink for Player 1, Blue for Player 2

**Shared Palette (8 colors):**
| Name | Hex | Description |
|------|-----|-------------|
| Pink | #FF9EB5 | Soft pink (default P1) |
| Purple | #C9A0DC | Light purple |
| Coral | #FFB07C | Warm coral/orange |
| Mint | #98D9C2 | Fresh mint green |
| Peach | #FFDAB3 | Soft peach |
| Lavender | #B8A9DE | Soft lavender |
| Sky Blue | #7EC8E8 | Light blue (default P2) |
| Lime | #B8E986 | Fresh lime green |

**Persistence:**
- Save selected colors to localStorage
- Restore on page load so kids don't re-pick every time

**In-Game Effect:**
- Selected colors determine character body color
- Derive dark/light variants programmatically for shading

### Visual Style
- Petals should feel like part of the game's aesthetic
- Subtle hover animation (scale up slightly)
- Selected state: white ring + subtle glow matching the color
- Ties into the flower theme already present in the grass

### Files to Modify
- `index.html` - Add color picker HTML structure around each input group
- `src/styles.css` - Style flower picker (circle layout, petal styles, selected state)
- `src/game.js` - Handle color selection, save/load from localStorage, pass to Character class

---

## Task 3: Switch from npm to Bun

### Problem
Project uses npm, but bun is preferred for speed and simplicity.

### Solution
Update all npm references to bun.

### Changes Required

**package.json scripts:**
```json
"scripts": {
  "start": "open index.html",
  "serve": "bun --bun serve .",
  "bundle": "bun scripts/bundle.js",
  "share": "bun scripts/bundle.js && open dist/bubbles.html"
}
```

**README.md:**
- Replace `npm run` with `bun run` in all examples
- Add note that bun is required (or that npm works as fallback)

### Files to Modify
- `package.json`
- `README.md`

---

## Task 4: Create AGENTS.md

### Problem
Modern projects should have an AGENTS.md file to guide AI agents working on the codebase.

### Solution
Create comprehensive AGENTS.md with project-specific context.

### Contents

1. **Project Overview**
   - Game name: בועות! (Bubbles!)
   - Purpose: Cooperative bubble-catching game for two kids
   - Target players: לוטם (7) and תום (4.5)
   - Created by: Dad (41, nostalgic for 90s side-by-side games)

2. **Visual Reference**
   - Link to `design/draft-v1.png` - the approved mockup
   - Description of the visual style achieved

3. **Original Requirements** (from initial planning session)
   - 2D view with slight perspective (not pure side-view, not top-down)
   - Bubbles fall from sky downward
   - Characters move left-right only
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

4. **Technical Stack**
   - Vanilla HTML5
   - Vanilla CSS3 (no preprocessors)
   - Vanilla JavaScript (ES6+)
   - HTML5 Canvas for game rendering
   - No frameworks, no dependencies
   - Bundle script creates single shareable HTML file

5. **File Structure**
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
   │   └── IMPLEMENTATION_PLAN.md  # This enhancement plan
   ├── scripts/
   │   └── bundle.js       # Bundles into single HTML
   ├── dist/
   │   └── bubbles.html    # Shareable bundled game
   ├── package.json
   ├── README.md
   └── AGENTS.md
   ```

6. **Design Principles**
   - Kid-friendly: Large touch targets, clear visuals, simple controls
   - Playful aesthetic: Kawaii style, soft pastels, bubbly UI
   - Hebrew-first: RTL layout, Hebrew fonts (Rubik, Secular One)
   - Lightweight: No frameworks, minimal bundle size
   - Shareable: Single HTML file works offline

7. **Coding Conventions**
   - Game state managed via module-level variables
   - Classes for game entities (Character, Bubble, Particle)
   - Separate functions for background layers (drawSun, drawClouds, drawGrass)
   - CSS uses custom properties (variables) for colors
   - Hebrew text in UI, English in code/comments

8. **How to Run**
   - `bun run start` - Open game in browser
   - `bun run bundle` - Create dist/bubbles.html
   - `bun run share` - Bundle and open

9. **Key Design Decisions**
   - Chose vanilla over frameworks for simplicity and longevity
   - Canvas for game, DOM for UI overlays (screens, HUD)
   - Cooperative (not competitive) to encourage sibling bonding
   - Bubbles fall DOWN (not up) - matches the visual perspective

### File Location
- Create `AGENTS.md` in project root

---

## Decision: Keep Vanilla HTML/CSS/JS

### Context
Discussed whether to add frameworks (React, Vue, Svelte, etc.)

### Decision
**Keep it vanilla. No frameworks.**

### Rationale
1. **Lightweight** - 37 KB total, instant load
2. **Zero dependencies** - No npm install, no version conflicts
3. **Works forever** - No framework deprecation or breaking changes
4. **Educational** - Proves what "basic" web tech can achieve
5. **Shareable** - Single HTML file works anywhere, offline
6. **Appropriate scope** - It's a single-page game, not a web app
7. **Story value** - "Dad built a game with just HTML" is charming

### What We're NOT Adding
- React / Vue / Svelte / Angular
- TypeScript
- Vite / Webpack / Rollup
- CSS frameworks (Tailwind, etc.)
- State management libraries

### What We Might Add Later (if needed)
- Sound effects (still vanilla, using Web Audio API)
- More game modes
- Touch controls for tablets

---

## Implementation Order

1. **Task 3: Bun** - Quick win, 2 files
2. **Task 1: High Scores** - Moderate, CSS + JS changes
3. **Task 2: Color Picker** - Largest task, HTML + CSS + JS
4. **Task 4: AGENTS.md** - Documentation, do last after code stabilizes

---

## After Implementation

1. Test all features
2. Run `bun run bundle` to create new shareable file
3. Commit changes with descriptive message
4. Update version in package.json if desired

---

*This plan was created collaboratively with the user. Resume implementation from here in a new chat session.*
