#!/usr/bin/env python3
"""Generate an elaborate storybook watercolor illustration of an apple
using gemini-3-pro-image for the interactive painting reveal prototype.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from google import genai
from google.genai import types

OUT = Path("design/prototypes/assets")
OUT.mkdir(parents=True, exist_ok=True)
TARGET = OUT / "storybook_apple.jpg"

PROMPT = """
A breathtaking, whimsical children's picture-book illustration of a cheerful kawaii apple resting on a rustic wooden table surrounded by gentle watercolor flowers and fresh green leaves.

Art style:
- High-end children's storybook watercolor, gouache and colored pencil on textured, deckled watercolor paper.
- Soft warm sunlight filtering in with golden dust sparkles.
- The apple is vibrant ruby red, plump and glossy, with two cute dark smiling eyes and rosy peach blush cheeks, a tiny golden dewdrop catching light.
- A delicate brown wooden stem with two fresh emerald-green leaves and a tiny white apple blossom flower next to it.
- Cozy, warm, painterly, inviting, master-class children's illustration (reminiscent of Beatrix Potter and modern picture book classics).
- Absolutely NO letters, NO text, NO watermarks.
- Perfectly centered composition on a clean, soft warm cream background.
"""

def main() -> int:
    if "GEMINI_API_KEY" not in os.environ:
        print("GEMINI_API_KEY not set", file=sys.stderr)
        return 1

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    print(f"Generating storybook apple illustration with gemini-3-pro-image...", flush=True)

    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image",
            contents=PROMPT.strip(),
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )
        parts = response.candidates[0].content.parts
        blob = next((p.inline_data for p in parts if p.inline_data), None)
        if not blob or not blob.data:
            print("No image returned", file=sys.stderr)
            return 2

        TARGET.write_bytes(blob.data)
        print(f"Saved {TARGET} ({len(blob.data):,} bytes, {blob.mime_type})", flush=True)
        return 0
    except Exception as e:
        print(f"Failed: {type(e).__name__}: {e}", file=sys.stderr)
        return 3

if __name__ == "__main__":
    sys.exit(main())
