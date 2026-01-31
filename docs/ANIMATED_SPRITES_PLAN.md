# Animated Nano Banana Character Sprites Plan

## Overview

Transform static Nano Banana character images into animated sprite sheets with magical PixiJS effects. Starting with unicorn as proof-of-concept.

## Design Decisions

- **Frame count**: Standard (7 unique images per character, reused for 13 logical frames)
- **Walk direction**: Generate right-facing only, flip programmatically for left
- **Sprite packing**: Skip texture packer, load individual frames directly (simpler for small frame counts)
- **Image dimensions**: 1024x1024 per frame (Nano Banana default)
- **Celebrate trigger**: Every bubble catch (short animation)
- **Fallback**: Static sprite if animated frames fail to load

---

## Complete Workflow

### Step 1: Install Dependencies

```bash
npm install pixi-filters
```

### Step 2: Create Directory Structure

```bash
mkdir -p src/assets/characters/unicorn
```

```
src/assets/
├── characters/
│   └── unicorn/           # Frames from Nano Banana (after background removal)
│       ├── unicorn_idle_1.png
│       ├── unicorn_idle_2.png
│       ├── unicorn_walk_1.png
│       ├── unicorn_walk_2.png
│       ├── unicorn_walk_3.png
│       ├── unicorn_celebrate_1.png
│       └── unicorn_celebrate_2.png
└── unicorn.png            # Keep old static image as fallback
```

### Step 3: Generate Images with Nano Banana

Run these commands to generate each frame. They can run in parallel:

```bash
# idle_1 - Standing neutral
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Standing neutral with a slight smile, looking forward, relaxed idle pose.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# idle_2 - Looking up
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Head tilted slightly upward, eyes looking up toward the sky (watching bubbles fall), curious happy expression.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# walk_1 - Right hoof forward
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Walking/trotting pose with right front hoof forward, body leaning slightly into the stride, happy expression.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# walk_2 - Mid-stride
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Walking/trotting mid-stride, hooves passing each other, body centered and balanced, happy expression.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# walk_3 - Left hoof forward
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Walking/trotting with left front hoof forward, body leaning slightly into stride, happy expression.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# celebrate_1 - Hooves up
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Celebration pose with front hooves raised up in the air joyfully, huge excited smile, sparkly eyes, super happy expression.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."

# celebrate_2 - Bounce down
gemini -e nanobanana --approval-mode yolo -o json "Create a kawaii chibi unicorn character sprite for a children's bubble-catching game.
Pose: Celebration bounce-down pose, hooves still slightly raised but coming down, joyful bouncy expression, like landing from a small jump.
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
Composition: character centered facing right, full body visible, solid white background.
Technical: game sprite ready, clean edges suitable for cutout, consistent size approximately 512x512 pixels, no ground/shadow.
Constraints: no text, no logos, no watermarks."
```

Images will be saved to `nanobanana-output/` with auto-generated names.

### Step 4: Copy and Rename Images

After generation, copy from `nanobanana-output/` to the characters folder with proper names:

```bash
cp nanobanana-output/[generated_name_1].png src/assets/characters/unicorn/unicorn_idle_1.png
cp nanobanana-output/[generated_name_2].png src/assets/characters/unicorn/unicorn_idle_2.png
# ... etc for all 7 frames
```

### Step 5: Remove White Backgrounds (CRITICAL!)

Nano Banana generates images with **white backgrounds**. You MUST remove them before use.

**IMPORTANT**: Do NOT use simple `-transparent white` as it will also make white parts of the character transparent (like the unicorn's body).

Instead, use **flood fill from corners** to remove only the background:

```bash
cd src/assets/characters/unicorn

for f in *.png; do
  echo "Processing $f..."
  magick "$f" -fuzz 5% \
    -fill none \
    -draw "color 0,0 floodfill" \
    -draw "color 0,1023 floodfill" \
    -draw "color 1023,0 floodfill" \
    -draw "color 1023,1023 floodfill" \
    "$f"
done

echo "Done - backgrounds removed"
```

This command:
- Uses ImageMagick's `magick` command
- `-fuzz 5%` allows slight color variations (off-white pixels)
- Flood fills from all 4 corners with transparency (`none`)
- Preserves white areas that are NOT connected to the edges (like the character body)

**Verify** the images have RGBA format after processing:
```bash
file src/assets/characters/unicorn/*.png
# Should show: PNG image data, 1024 x 1024, 8-bit/color RGBA
```

### Step 6: Import Frames in Code

In `Character.ts`, import the individual frames:

```ts
// Animated unicorn frames
import unicornIdle1 from '../assets/characters/unicorn/unicorn_idle_1.png';
import unicornIdle2 from '../assets/characters/unicorn/unicorn_idle_2.png';
import unicornWalk1 from '../assets/characters/unicorn/unicorn_walk_1.png';
import unicornWalk2 from '../assets/characters/unicorn/unicorn_walk_2.png';
import unicornWalk3 from '../assets/characters/unicorn/unicorn_walk_3.png';
import unicornCelebrate1 from '../assets/characters/unicorn/unicorn_celebrate_1.png';
import unicornCelebrate2 from '../assets/characters/unicorn/unicorn_celebrate_2.png';

// Define animation sequences (reuse frames for smooth loops)
const ANIMATED_FRAMES = {
  unicorn: {
    idle: [unicornIdle1, unicornIdle2, unicornIdle1],
    walk: [unicornWalk1, unicornWalk2, unicornWalk3, unicornWalk2],
    celebrate: [unicornCelebrate1, unicornCelebrate2],
  },
};
```

### Step 7: Load as AnimatedSprite

```ts
import { AnimatedSprite, Assets } from 'pixi.js';
import { GlowFilter, DropShadowFilter } from 'pixi-filters';

// Load textures
const loadTextures = async (paths: string[]): Promise<Texture[]> => {
  const textures: Texture[] = [];
  for (const path of paths) {
    const texture = await Assets.load(path);
    textures.push(texture);
  }
  return textures;
};

const [idleTextures, walkTextures, celebrateTextures] = await Promise.all([
  loadTextures(frameDefs.idle),
  loadTextures(frameDefs.walk),
  loadTextures(frameDefs.celebrate),
]);

// Create AnimatedSprite
const animatedSprite = new AnimatedSprite(idleTextures);
animatedSprite.anchor.set(0.5);
animatedSprite.animationSpeed = 0.08;
animatedSprite.play();

// Add magical filters
const glowFilter = new GlowFilter({
  distance: 15,
  outerStrength: 1.5,
  color: characterColor,
  quality: 0.3,
});

const shadowFilter = new DropShadowFilter({
  offset: { x: 0, y: 8 },
  blur: 3,
  alpha: 0.3,
});

animatedSprite.filters = [shadowFilter, glowFilter];
```

### Step 8: Handle Animation State Changes

```ts
// Switch animations based on movement
if (isMoving && currentAnim !== 'walk') {
  animatedSprite.textures = animations.walk;
  animatedSprite.play();
  currentAnim = 'walk';
} else if (!isMoving && currentAnim !== 'idle') {
  animatedSprite.textures = animations.idle;
  animatedSprite.play();
  currentAnim = 'idle';
}

// Flip sprite for left/right direction
if (vx < 0) {
  animatedSprite.scale.x = -Math.abs(animatedSprite.scale.x);
} else if (vx > 0) {
  animatedSprite.scale.x = Math.abs(animatedSprite.scale.x);
}

// Animate glow pulse
glowFilter.outerStrength = 1.2 + Math.sin(time * 0.1) * 0.6;
```

---

## Animation Definitions

### Frame Reuse Strategy

To create smooth loops with minimal unique images:

| Animation | Frames Sequence | Unique Images |
|-----------|----------------|---------------|
| **idle** | 1 → 2 → 1 | 2 |
| **walk** | 1 → 2 → 3 → 2 | 3 |
| **celebrate** | 1 → 2 | 2 |
| **Total** | | **7 unique** |

### Animation Speeds

- `idle`: 0.08 (slow, gentle breathing)
- `walk`: 0.12 (moderate trot)
- `celebrate`: 0.15 (quick, excited)

---

## Troubleshooting

### White box around character
- Background wasn't removed properly
- Re-run the flood fill command with higher fuzz value (`-fuzz 10%`)

### Character body is transparent
- Used `-transparent white` instead of flood fill
- Restore original images and use the flood fill method

### Animation not playing
- Check `animatedSprite.play()` was called
- Verify `animationSpeed` > 0

### Sprite not flipping
- Check scale.x is being set based on velocity direction
- Ensure you're using the absolute value when setting positive direction

---

## Completed Characters

All 4 characters now have animated sprites:

| Character | Frames | Location |
|-----------|--------|----------|
| Unicorn | 7 | `src/assets/characters/unicorn/` |
| Dinosaur | 7 | `src/assets/characters/dinosaur/` |
| Puppy | 7 | `src/assets/characters/puppy/` |
| Princess | 7 | `src/assets/characters/princess/` |

### Character Style Descriptions (Used for Generation)

**Unicorn**:
```
Style: soft pastel rainbow mane (pink, purple, mint, blue curls), cream/white body, big sparkly purple anime eyes with star reflections, rounded chubby blob-like proportions, spiral horn with pastel gradient, cute kawaii aesthetic.
```

**Dinosaur**:
```
Style: soft pastel gradient body (mint green to light pink), big sparkly rainbow anime eyes with star reflections, rounded chubby blob-like proportions, small cute spikes on back (pastel yellow), short T-rex arms, cute kawaii aesthetic.
```

**Puppy**:
```
Style: soft cream/peach fluffy body, floppy pastel blue ears, big sparkly rainbow anime eyes with star reflections, rounded chubby blob-like proportions, small wagging tail, pink nose, cute kawaii aesthetic.
```

**Princess**:
```
Style: rainbow gradient blob body (pink to yellow to mint green to sky blue to lavender), small sparkly golden tiara on top, big sparkly anime eyes with star reflections, rounded chubby blob-like proportions, rosy cheeks, cute kawaii aesthetic.
```
