# בועות! (Bubbles!)

A cooperative 2-player bubble-catching game for kids.

![Game Screenshot](design/draft-v1.png)

## About

A fun, colorful game where two players work together to catch falling bubbles. Built with love for לוטם (7) and תום (4.5).

## How to Play

### Controls

| Player | Character | Keys |
|--------|-----------|------|
| Player 1 | לוטם (pink) | `A` / `D` |
| Player 2 | תום (blue) | `←` / `→` |

### Objective

Catch as many bubbles as you can before time runs out! Both players share a single score - teamwork makes the dream work!

### Timer Options

- 30 seconds - Quick round
- 45 seconds - Medium round  
- 60 seconds - Full round

## Running the Game

Simply open `index.html` in any modern browser (or use Bun scripts):

```bash
# macOS
bun run start

# Or use a local server
bun run serve
```

Requires Bun (`https://bun.sh`). If you prefer Node, you can still open `index.html` directly.

## Project Structure

```
bubbles/
├── index.html          # Main game file
├── src/
│   ├── game.js         # Game engine & logic
│   └── styles.css      # UI styling
├── design/
│   └── draft-v1.png    # Visual mockup
├── docs/
│   └── GAME_PLAN.md    # Full game specification
├── package.json
└── README.md
```

## Features

- Hebrew RTL interface
- Customizable player names
- Persistent high scores (localStorage)
- Dreamy animated background
- Cute kawaii blob characters
- Sparkle effects on bubble catch
- Playful, child-friendly UI

## License

MIT
