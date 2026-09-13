# Magic House visual concepts

## Moonlit World Map — concepts, approval pending (September 11, 2026)

Three moonlit storybook concepts for redesigning the trail map (`prototype/world-map.html`), which still uses the bright pastel `memory-garden-map-bg-v2.png`. Each keeps the central lawn quiet so the 36 live stage nodes and 6 chapter banners sit on top of the art; no nodes, text, or UI are baked in. Generated with Google Nano Banana Pro (`gemini-3-pro-image`) at 16:9, 2K.

- `world-map-moonlit-a.png` — single snaking golden path through six themed stations (meadow → lantern market → treehouse forest → railway/waterwheel → village + schoolhouse → hilltop celebration arch). Closest match to the generator's six horizontal bands.
- `world-map-moonlit-b.png` — six floating garden islands joined by glowing stepping stones and rope bridges, numbered design not yet applied; most dramatic world-map feel, needs bespoke node positions.
- `world-map-moonlit-c.png` — close garden camera with an oval stone path ringing a central lawn and six zones around it, closest to the approved Moonlit Memory Garden vista.

Prompt style block shared across all three: painterly 2.5D premium hand-painted children's storybook, indigo/periwinkle night sky, teal and moss-green foliage, honey-gold lantern light, ivory and lavender flowers, willow branches and lanterns framing the edges, large crescent moon, soft moonlit rim light. Runtime art and the live 36-stage wiring follow once a concept is approved.

## Moonlit Memory Garden (September 11, 2026)

Runtime background: `src/assets/memory/moonlit-garden.webp`, 1586×992, WebP quality 86 (355 KB). Generated once with the built-in image tool; cards and their decorative borders are live CSS, not baked artwork. Source: `exec-18199e93-af2e-4dd2-a778-89de9da5aa83.png`.

Prompt: a landscape 16:10 premium children's memory-game garden, painterly 2.5D storybook; willow branches framing the edges, warm lanterns at upper corners, crescent moon above indigo sky and distant cloud hills, teal leaves and ivory/lavender flowers at bottom corners, distant fireflies. Keep the central 75% a quiet open blue-green clearing for live cards. Cozy and welcoming, tactile brushwork, honey-gold light and periwinkle. No cards, board, people, animals, text, signs, UI, or watermark.

The playing view uses ivory revealed cards, teal/gold backs, soft green matched cards, and a compact hint/status toolbar. The existing level map and matching/save rules remain intact. Dense phone boards scroll vertically to retain readable words and 44px speaker buttons.

## Moonlit Shop (September 10, 2026)

`moonlit-shop.png` is the user-approved edge-to-edge Shop mockup, derived from the Moonlight Storybook room using built-in image generation. The gameplay sentence, hint/replay controls, customers, products, and progress are implemented separately from the environment; no day/night theme system is introduced.

Runtime artwork in `prototype/assets/shop/` is complete. The environment stays opaque; customer and product atlases have genuine alpha so the live objects sit naturally inside the scene.

Environment edit prompt: preserve the approved shop camera, curved honey wood frame, blue/lavender awning, moon sign, lanterns, village, moon and lighting. Remove all UI, fox, text, foreground items, four fixed compartment walls, paper bag and coin dish. Reconstruct the forest behind the customer and a clear continuous wooden counter in the lower 32%. Source: `exec-764da7bd-8e3a-4b13-9a2f-f847695e3f48.png`.

Customer prompt: 4×2 equal square atlas, front-facing upper torso and paws, reference-quality warm storybook animals with padding; row one rabbit/bear/cat/fox, row two frog/panda/monkey/koala. The original transparent-background request returned a painted checkerboard (`exec-b5531380-fb86-43ee-89de-d3e4b6feea77.png`; unsuccessful extraction `exec-222fcde3-fe4b-47f9-9cf8-e27a2fba33a8.png`). A precise edit replaced only the checkerboard with uniform `#00FFFF`, preserving the grid and animals (`exec-f5f420b5-36b6-4416-8d31-35129bfeb102.png`); that chroma background was removed locally before the runtime WebP was encoded.

Product prompt shared across five 4×4 square atlases: one identifiable isolated object per equal cell, 15% padding, consistent three-quarter view, warm soft lighting and refined tactile storybook rendering matching the mockup. Pure white background, no checkerboard, scenery, counter, text or gridlines. Items in this exact order:

Sheet 1, row-major: banana, red apple, milk bottle, bread loaf, egg, cheese wedge, clear water bottle with blue water, orange fruit, strawberry, carrot, cookie, ceramic cup, red toy ball, closed blue book, sun hat, single shoe.

Sheet 2, row-major: plate, spoon, fork, toothbrush, bar of soap, scissors, spiral notebook, wooden ruler, shirt, dress, backpack, sheet of paper, laptop computer, calculator, paintbrush, camera.

Sheet 3, row-major: slice of cake, tomato, potato, mushroom, pear, peach, doughnut, ice cream cone, corn cob, pizza slice, sandwich, marker pen, basketball, baseball, volleyball, gold medal.

Sheet 4, row-major: gold trophy, hamburger, fries in carton, bowl of white rice, plate of spaghetti, bowl of soup, wrapped candy, chocolate bar, bed, wooden chair, couch, table lamp, key, round clock, telephone, umbrella.

Sheet 5, row-major: radio, pants, single sock, coat, scarf, single glove, pencil, crayon, balloon, kite, teddy bear, empty paper shopping bag with crescent moon seal, small shallow wooden coin dish, small gold star coin, closed paper shopping bag with crescent moon seal, wooden crate.

Sources in order: `exec-2d816622-5b13-4b7b-8c40-326abab82edd.png`, `exec-ce366d32-2ca2-435f-bbe5-68657489c09c.png`, `exec-6284a897-9df0-439f-b43b-1fa3da558790.png`, `exec-217cf1d3-a6d4-4bbc-b3c9-b9bb35bee1d5.png`, `exec-e73e1720-089f-4012-9c8f-2314c8eb6d07.png`. The connected white canvas was removed locally with a conservative two-percent tolerance before quality-90 WebP encoding, preserving pale learning objects such as paper, soap, rice, and milk. The 16 colored learning shapes/books use CSS shapes with explicit vocabulary colors to keep colors exact.

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
