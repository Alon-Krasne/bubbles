#!/usr/bin/env python3
"""Second pass: popular-children's-game inspired versions of the same 3
game concepts. Different visual idioms per game so they don't all look
like draft-v1.png.

Borrowed visual references per game:
  A — Toca Kitchen: top-down cozy room, chunky ingredients, big tap targets.
  B — Sago Mini / peek-a-boo frame: 3/4 cozy room, items with faces, bold
      outlines, wallpaper pattern, big question marker.
  C — Pokemon / Where's My Water?: tilted 3/4 path with chunky tiles that
      are themselves little characters doing their action.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

from google import genai
from google.genai import types

OUT = Path("design/mockups")
OUT.mkdir(parents=True, exist_ok=True)

KEYS = [
    (
        "A_sorting-basket.jpg",
        """
WIDE 16:9 LANDSCAPE format, very wide and short.

Toca Boca style illustration. TOP-DOWN VIEW of a cozy kitchen counter,
warm cream and coral palette, NO sky and NO grass at all. The scene
fills the entire frame.

The wooden counter has a soft round SCOOP TRAY in the center holding
five big chunky illustrated ingredient pieces, each round and
substantial: a fat carrot with two tiny eyes and a smile, a red apple
with a leaf on top and eyes, a purple butterfly with big eyes, an
orange cat-faced cupcake, a green pear with one eye. The pieces are
roughly the same size as a child's palm.

Above and below the counter are two HUGE COLORED BINS in soft chunky
plastic-pail style. The TOP bin is coral-pink with one big apple icon
on its front. The BOTTOM bin is mint-teal with one big paw icon on
its front. The bins are tall and obvious — clearly the destinations.

One soft pale-pink chunky hand-cursor with a waggly cartoon finger
points down at the butterfly in the tray, mid-drag.

NO letters, NO numbers, NO captions. Warm kitchen palette: cream
beige counter, coral, teal, gold, with a faint patterned tablecloth
under the tray.

Bold simple shapes. The feel should be cozy, hand-tappable, like a
warm illustration in a kids cookbook. NOT a screenshot.
""",
    ),
    (
        "B_listening-window.jpg",
        """
WIDE 16:9 LANDSCAPE format.

Sago Mini / peek-a-boo storybook style illustration. THREE-QUARTER
PERSPECTIVE view of a single cozy living-room scene, framed like a
toy diorama open at one side. Bold flat colors, soft darker outlines
on every shape, no gradients.

The room has soft pastel-striped wallpaper (lavender + cream stripes),
a small geometric rug (mint + coral + cream triangles) on the floor,
a chunky wooden chair LEFT, a small round side-table CENTER, a tall
chunky floor-lamp RIGHT with a giant yellow lampshade.

Each item's "occupant" is a big-eyed round creature:
- ON the chair sits a giant pink KITTEN-FACE, looking forward with
  huge oval eyes and a tiny smile, well above the chair back.
- UNDER the table is a giant blue BUNNY head peeking out from beneath
  the tablecloth, only the top half of its head visible, with one big
  sparkly eye visible.
- NEXT to the lamp stands a giant yellow DUCK waving a tiny wing,
  touching the lamp base with its other wing, with two big cheerful
  eyes.

A clean white think-cloud with a single BIG PASTEL QUESTION MARK
floats in the upper-left of the room, pointing at the scene.

NO sky, NO grass — these populate only what fits in the room.

Bold outlines around every shape (slightly darker tone of the fill).
Pastel but COZY not airy. NO letters. NO numbers.
""",
    ),
    (
        "C_action-path.jpg",
        """
WIDE 16:9 LANDSCAPE format.

Pokemon "follow the path" / Where's My Water style illustration.
TILTED 3/4 ISOMETRIC VIEW of a small charm garden, with the camera
looking down at an angle as if you're standing over it.

A chunky cobblestone garden path with bright moss-green grass on both
sides, runs from lower-left to upper-right of the frame. THREE flat
TILE SLOTS sit on the path in sequence, each a chunky tilted square.

A tiny pastel-brown BUNNY CHARACTER stands on the first tile, looking
forward with big shiny eyes and a happy smile.

Above the path, three BIG CHUNKY ROUND TILE PIECES float in a row,
each TILE is its own LITTLE CHARACTER doing the action:
- Tile 1: a smiling CARROT with tiny arms, in mid-bite with little
  crumb sparkles
- Tile 2: a happy BUNNY mid-jump, two legs tucked up, a sparkle trail
  behind
- Tile 3: a sleeping BUNNY under a tiny blanket, eyes closed, with a
  glowing "z z z" floating above

The tiles are tilted toward the camera so they look like physical
chess-pieces you'd push down onto the path.

A warm pale sun is in the upper-right corner (round face, soft smile,
pink cheeks). Soft stylized background trees of three different
round shapes in soft greens and pinks.

Bold dark outlines on every shape. COZY, CHUNKY, GROUNDED. NO sky
gradient — flat pale-cream sky underneath the trees. NO letters. NO
numbers.
""",
    ),
    (
        "D_all-three-comparison.jpg",
        """
WIDE 16:9 LANDSCAPE format. Comparison sheet of three different
visual idioms — same game ideas, totally different feel — stacked
top to bottom, separated by thin dashed lines.

NO letters anywhere. NO labels. NO captions.

TOP THIRD — TOCA BOCA TOP-DOWN KITCHEN: a wooden counter top with
a tray of five chunky ingredient pieces (carrot with eyes, apple with
leaf, butterfly, cat-cupcake, pear) and two large colored bins
(CORAL pink with apple icon, MINT teal with paw icon) above and
below the tray with a chunky cartoon hand cursor pointing down.

MIDDLE THIRD — sago mini DIORAMA LIVING ROOM: a three-quarter view
of a striped-wallpaper cozy room with a chair LEFT, table CENTER,
lamp RIGHT. Pink kitten-FACE ON chair, blue bunny head UNDER table,
yellow duck NEXT to lamp. White think-cloud with a big question
mark upper-left.

BOTTOM THIRD — pokemon-style PATH: tilted 3/4 isometric garden with
a cobblestone path. Cute bunny standing on first of three tile slots.
Above the path, three floating round action tiles (each a tiny
character doing the action). Warm sun, soft rounded trees, flat pale
sky.

The three thirds should look unmistakably DIFFERENT from each other
— top-down vs diorama vs isometric — without any text labels.
""",
    ),
]


def main() -> int:
    if "GEMINI_API_KEY" not in os.environ:
        print("GEMINI_API_KEY not set", file=sys.stderr)
        return 1

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    model = "gemini-3-pro-image"
    failures: list[str] = []

    for filename, prompt in KEYS:
        target = OUT / filename
        print(f"→ Generating {filename}", flush=True)
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt.strip(),
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                ),
            )
            parts = response.candidates[0].content.parts
            blob = next((p.inline_data for p in parts if p.inline_data), None)
            if not blob or not blob.data:
                print(f"   no image data in {filename}", file=sys.stderr)
                failures.append(filename)
                continue
            target.write_bytes(blob.data)
            print(
                f"   wrote {target}  ({len(blob.data):,} bytes, {blob.mime_type})",
                flush=True,
            )
        except Exception as exc:
            print(f"   FAIL {filename}: {type(exc).__name__}: {exc}", file=sys.stderr)
            failures.append(filename)

    if failures:
        print(f"Failed: {failures}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
