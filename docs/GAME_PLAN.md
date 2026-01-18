# בועות! (Bubbles!) - Game Plan

## Overview

A cooperative 2D bubble-catching game for two siblings to play together.

**Target Players:**
- לוטם (Lotem) - Girl, 7 years old
- תום (Tom) - Boy, 4.5 years old

**Created by:** Dad (41, nostalgic for side-by-side games from the 90s)

---

## Visual Reference

![Draft v1](design/draft-v1.png)

**Approved Design Direction:**
- 2D view with slight perspective (not pure side-view, not top-down)
- Small cute blob characters at the bottom
- Bubbles fall from sky downward
- Flat green grass ground
- Soft blue gradient sky background
- Colorful translucent pastel bubbles
- Clean, child-friendly aesthetic

---

## Core Gameplay

### Objective
Catch as many falling bubbles as possible before the timer runs out.

### Mechanics
| Element | Description |
|---------|-------------|
| Movement | Characters move **left-right only** (horizontal) |
| Bubbles | Fall from top of screen downward |
| Scoring | Cooperative - **shared score** for both players |
| Win Condition | Catch as many bubbles before time runs out |

### Game Flow
1. **Start Screen** → Select timer, edit names, start game
2. **Gameplay** → Catch bubbles together
3. **End Screen** → Show score, high scores, play again

---

## Characters

### לוטם (Lotem) - Player 1
- **Appearance:** Pink blob with bow
- **Controls:** WASD keys
- **Position:** Can be anywhere on the ground line

### תום (Tom) - Player 2
- **Appearance:** Blue blob
- **Controls:** Arrow keys
- **Position:** Can be anywhere on the ground line

**Note:** Names are editable in the start screen.

---

## Controls

| Player | Character | Left | Right |
|--------|-----------|------|-------|
| Player 1 | לוטם (pink) | A | D |
| Player 2 | תום (blue) | ← | → |

---

## Timer Options

Players can select round duration at start:
- **30 seconds** - Quick round
- **45 seconds** - Medium round
- **60 seconds** - Full round

---

## Visual Effects

### On Bubble Catch
- Sparkle particle burst
- Pop animation
- Visual feedback (no audio for now)

### Background
- Gentle animated elements (subtle movement)
- Soft gradient sky
- Green grass ground

### End Game
- Celebration effects
- Confetti or stars

---

## Screens

### 1. Start Screen (מסך פתיחה)
- Game title: **בועות!**
- Name inputs (default: לוטם, תום)
- Timer selection (30/45/60)
- Start button: **!התחל**
- High scores preview

### 2. Game Screen (משחק)
- Characters on grass
- Falling bubbles
- Score counter (top)
- Timer countdown (top)
- No pause needed (short rounds)

### 3. End Screen (סיום)
- Final score display
- High scores table (persistent)
- Play again button: **?שחקו שוב**

---

## Technical Specifications

### Platform
- **Web browser** (HTML5 Canvas)
- Desktop-first (keyboard controls)
- Responsive for different screen sizes

### Tech Stack
- HTML5 Canvas for game rendering
- Vanilla JavaScript (no heavy frameworks)
- CSS for UI screens
- LocalStorage for high scores

### Language
- **Hebrew UI** (RTL support)
- All text in Hebrew

---

## Design Aesthetic

Based on the frontend-design skill guidelines:

### Tone
**Playful / Toy-like** with soft, child-friendly appeal

### Typography
- Rounded, friendly Hebrew font
- Large, readable text for young players
- Playful display font for title

### Color Palette
| Element | Color |
|---------|-------|
| Sky | Soft blue gradient (#87CEEB → #E0F4FF) |
| Grass | Fresh green (#7EC850) |
| לוטם | Soft pink (#FFB6C1) |
| תום | Soft blue (#87CEEB) |
| Bubbles | Pastel rainbow (pink, blue, purple, green, yellow) |
| UI accent | Warm coral or golden yellow |

### Motion
- Smooth bubble floating animation
- Sparkle burst on catch
- Gentle background movement
- Celebration confetti at end

### Differentiation
- **Two-player cooperative** focus (rare in web games)
- **Hebrew-first** interface
- **Personalized** with kids' names
- **Simple enough for 4.5 year old**, fun for 7 year old

---

## High Scores

Stored in LocalStorage:
- Top 5 scores
- Each entry: score + date
- Persists between sessions

---

## Future Enhancements (Not in MVP)

- Sound effects and music
- Power-ups (golden bubbles, time bonus)
- Different backgrounds/themes
- Difficulty levels
- Touch controls for tablet
- Gamepad support

---

## File Structure (Planned)

```
bubbles/
├── design/
│   └── draft-v1.png          # Approved visual mockup
├── index.html                 # Main game file
├── styles.css                 # UI styling
├── game.js                    # Game logic
└── GAME_PLAN.md              # This file
```

---

## Development Phases

### Phase 1: Core Game
- [ ] Set up HTML canvas
- [ ] Implement character rendering
- [ ] Add character movement (keyboard controls)
- [ ] Create bubble spawning and falling
- [ ] Implement collision detection (catching bubbles)
- [ ] Add scoring system

### Phase 2: UI Screens
- [ ] Start screen with name inputs
- [ ] Timer selection
- [ ] End screen with score
- [ ] High scores display

### Phase 3: Polish
- [ ] Visual effects (sparkles, pop)
- [ ] Background animation
- [ ] End game celebration
- [ ] Hebrew RTL styling
- [ ] Responsive design

---

*Plan created: January 18, 2026*
