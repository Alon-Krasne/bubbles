# Magic House visual concepts

Generated with the built-in image-generation tool, September 9, 2026. The daughter selected **Moonlight Storybook**, superseding the initial treehouse choice. The concept images are visual references, not baked gameplay screens. The current game screenshot was supplied as a functional reference, explicitly not a style/geometry reference.

- `magic-house-enchanted-treehouse.png`: warm carved timber, leafy canopy, amber sunlight and tactile fabrics.
- `magic-house-moonlight-storybook.png`: indigo observatory bedroom, moonlit clouds and warm golden interior lighting.
- `magic-house-popup-playhouse.png`: dimensional paper storybook, felt toys, folded furniture and bright garden scenery.

## Generation prompt set

Shared brief: high-fidelity landscape 16:10 gameplay-screen mockup for Magic House, a warm language-learning game for ages 4–8. Radically redesign the existing screenshot rather than cosmetically reskin it. Complete edge-to-edge screen, no device frame or collage. Retain identifiable bed with visible floor underneath, wall shelf, open toy chest, nightstand and table; keep placement areas unobstructed. Bed at back-left, shelf at back-right, open center. One small crowned rainbow blob companion rendered in the room's medium. Foreground inventory contains exactly five items: teddy bear, red ball, blue book, pillow and blue lamp. No names below pictured choices. Teddy stays in inventory, not on bed; do not highlight or connect the answer destination. Quiet usable UI with large touch targets: small Hebrew title “הבית הקסום”, avatar, three stars and “2 / 6”, compact instruction “Put the teddy bear on the bed.”, speaker and small bulb controls, corner home button. No translations showing, giant heading, dashboard, stock emoji, watermark or trademarks. Room dominates, text remains crisp and legible.

Direction A — Enchanted Treehouse: premium painterly 2.5D adventure, not clay/plastic. Bedroom inside a living tree with sculpted timber ribs, carved furniture, round canopy-view window, soft leaf shadows and tiny warm lanterns. Forest teal, moss green, amber sunlight, cream bedding, restrained coral. Tactile painted grain and woven fabrics. Inventory built into a curved branch shelf with shallow recesses. Restrained luminous dust by the window. Foreground framing, middle-ground furniture, distant trees. Not the existing pastel attic or orange-bed/peach-floor palette.

Direction B — Moonlight Storybook: enchanted bedroom in a curved observatory above clouds. Oversized arched window, crescent moon, distant stars. Illustrated animated-storybook aesthetic with brush texture and luminous color, neither photoreal nor plastic. Honey-and-cream furniture contrasts with soft indigo/periwinkle walls; amber interior and cyan moonlight give gentle depth. Twilight without dark/scary targets. Rounded architecture, star-stitched canopy bed, rounded shelf, recognizable chest. Curved luminous windowsill-like inventory ledge with distinct wells. Matching painterly companion. Few stars in the window, not a particle field. Cinematic but usable UI.

Direction C — Pop-up Playhouse: modern handcrafted pop-up storybook made of cut layered paper, matte card, felt and folded illustrations. Not clay 3D or pixel art. Ivory, mint, terracotta, butter yellow and sky blue. Open book forms the floor; paper walls fold up with window cutouts and layered garden beyond. Folded-paper bed, shelf, chest, nightstand and table have subtle contact shadows and embossed details. Five inventory compartments along the lower page, felt teddy and consistently crafted toys. Companion is matching felt/paper without a thick outline. Cheerful daylight, spacious composition and cream paper UI tabs.

## Implementation

The selected concept is implemented in PR #37 using a clean environment and a separate transparent object atlas. UI, hints, drag/tap targets, text, and progress remain live DOM elements. Existing profile characters are retained. `treehouse-clean-unused.webp` is an abandoned intermediate reference, not used by the game.

Runtime assets in `prototype/assets/magic-house/`:

- `moonlight-room.webp`: 1586×992, lossy WebP quality 88. Generated from the moonlight concept with all UI, companions, inventory objects, pillows, books, and lamps removed from learning surfaces; preserve the crescent-moon arched window, star canopy, cloud city, warm interior, empty shelf/chest/nightstand/table, under-bed gap, and curved golden foreground ledge. Original generation: `exec-c1c3721e-63dd-47ed-9ae7-b136994ecdca.png`.
- `storybook-objects.webp`: 1774×887, lossless WebP with genuine alpha. Generated as a regular 4×2 atlas in matching painterly 2.5D style: pillow, red ball, blue book, orange shoes / yellow lamp, red apple, teddy, blue lamp. Original `exec-e37087ce-77f5-4929-bab3-40cb2041c443.png` had a baked checkerboard; background extraction through image generation produced transparent `exec-590a8b8e-853a-4104-ae34-9f2e46ca11aa.png`. No runtime chroma-key or background-removal code.

The stage preserves the background aspect ratio at desktop and landscape-tablet sizes. All seven zone IDs and twelve placement keys stay unchanged; only their visual coordinates change. No save-format changes or reset. The user and daughter approved the playable moonlit preview on September 9, 2026.
