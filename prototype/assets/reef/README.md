# Glowing Reef map preview assets

These assets serve the standalone `prototype/reef-map.html` screen. No Reef gameplay or save migration is enabled.

- `map.webp`: one new 3:2 painterly environment generated with `gemini-3.1-flash-image` through Google's Interactions API, then resized to 2400px width and encoded as WebP quality 88. Generated output estimate: $0.101, excluding reference/text tokens. Reference scenery comes from the project's approved Reef artwork. The map has no baked-in labels, route, characters or stage numbers; those remain live DOM/SVG elements.
- `nevet.webp`: cropped from the approved `trio-underwater-v5.png` reference sheet, not a newly generated character. It retains Nevet's ear-following helmet. Used only as the preview's companion illustration.
- `bridge-forest-reef.mp4`, `reef-video-01.mp4` … `reef-video-09.mp4`: local copies of the volume-matched review masters prepared in `docs/visual-explainer/reef-song/production/delivery/`. All have the original video packets and constant-gain native soundtracks, normalized to approximately −23 LUFS. No vocal effects were removed. Their audio review page flagged nonverbal effects in videos 01, 02 and 04 for owner review.
- Matching JPG files are posters from those delivery copies.

The production artwork prompts, references and take reviews remain in `docs/visual-explainer/reef-song/production/art-pass-01/prompts.json`. `art-manifest.json` records the map prompt, source hashes, derived image hashes and copied media hashes so the preview's provenance can be checked independently of the production folder.

The existing build copies `prototype/` into `dist/prototype/`, so this page does not rely on a development-only `/docs/` URL for media.

## Verification

- `npm run test:reef-map`, `npm run test:trail`, `npm run test:destinations`, and `npm run build` passed.
- Browser checks used only `agent-browser`, against both the development page and the built page served by Vite preview.
- All 36 stops were focused and checked to be visible above the information panel at 1440×900, 1024×768 and 390×844. Stops have at least 48px touch targets; no document-level horizontal overflow.
- All ten album videos loaded metadata; actual muted playback was exercised. Escape/close pauses playback and restores focus to the opener.
- Arrow-key navigation and start/lighthouse controls passed. The localStorage snapshot stayed unchanged across the tested interactions.
- These are UI and media-delivery checks, not tests of Reef gameplay, vocabulary coverage, progression unlocking or caption tracks.
