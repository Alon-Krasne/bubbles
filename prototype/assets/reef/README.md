# Glowing Reef map and stories

These assets serve stages 37–72 of the Forest journey at `prototype/world-map.html`.

- `map.webp`: one new 3:2 painterly environment generated with `gemini-3.1-flash-image` through Google's Interactions API, then resized to 2400px width and encoded as WebP quality 88. Generated output estimate: $0.101, excluding reference/text tokens. Reference scenery comes from the project's approved Reef artwork. The map has no baked-in labels, route, characters or stage numbers; those remain live DOM/SVG elements.
- `nevet.webp`, `adva.webp`, `zohar.webp`: cropped from the approved `trio-underwater-v5.png` reference sheet. The map shows the companion selected on the player's Forest track.
- `bridge-forest-reef.mp4`, `reef-video-01.mp4` … `reef-video-09.mp4`: local copies of the volume-matched review masters prepared in `docs/visual-explainer/reef-song/production/delivery/`. All have the original video packets and constant-gain native soundtracks, normalized to approximately −23 LUFS. No vocal effects were removed. Their audio review page flagged nonverbal effects in videos 01, 02 and 04 for owner review.
- Matching JPG files are posters from those delivery copies.

The production artwork prompts, references and take reviews remain in `docs/visual-explainer/reef-song/production/art-pass-01/prompts.json`. `art-manifest.json` records the map prompt, source hashes, derived image hashes and copied media hashes so the preview's provenance can be checked independently of the production folder.

The existing build copies `prototype/` into `dist/prototype/`, so this page does not rely on a development-only `/docs/` URL for media.

## Review

Use the Reef album to play the unlocked stories and switch captions between Hebrew and English. The files are the volume-matched review cuts. The owner listening pass for the flagged sounds in stories 01, 02 and 04 is pending.
