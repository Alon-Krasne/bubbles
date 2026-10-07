# Magic Brush Painter illustrations

Twelve vocabulary pictures for the recurring trail activity, two per chapter. Each picture depicts its word directly, unlike the independent reward scenes in Reveal the Magic. The word picker offers cat/panda, apple/soup, sun/moon, boat/bus, map/ruler, and medal/baseball. English starts in lowercase, with an uppercase practice button; Hebrew uses print letters.

- `apple.webp`: existing watercolor illustration from the reviewed prototype in PR #46, commit `9b71348` (originally generated using Gemini 3 Pro Image).
- `cat.webp`, `sun.webp`, `boat.webp`: generated using Codex's built-in imagegen tool on 2026-09-27.
- `map.webp`, `medal.webp`: generated using Codex's built-in imagegen tool on 2026-09-29 to match the school and sports chapters.
- `panda.webp`, `soup.webp`, `moon.webp`, `bus.webp`, `ruler.webp`, `baseball.webp`: generated using Codex's built-in imagegen tool on 2026-10-07, one call per picture, using the prompt set below.

New-picture prompt set: a single landscape 4:3 watercolor and gouache illustration; one large clear main subject centered on warm ivory textured paper with gentle pastel surroundings; dreamy hand-painted children's storybook, soft edges, playful, calming and uncluttered; subject fills about 70% of the canvas; opaque background; no text, letters, numbers, UI, border or watermark. Subjects:

- Panda: a cute black and white panda sitting with a small bamboo sprig.
- Soup: a large inviting bowl of vegetable soup with a spoon beside it.
- Moon: a softly glowing crescent moon in a gentle twilight sky with a few tiny stars.
- Bus: a friendly pastel yellow bus with four windows and two wheels on a gentle road.
- Ruler: one large wooden school ruler with evenly spaced measurement tick marks, beside a small blank sheet of paper.
- Baseball: one large white baseball with clear curved red stitching, resting on grass.

Each is a separate landscape watercolor/gouache picture with a single large subject, ivory paper, gentle pastel surroundings, and no text or UI.

All are shipped at 768 pixels wide, WebP quality 84. The same image supplies the grayscale sketch and color layer, so reveals stay registered exactly.

Letter direction references used during prototype review:
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60650 (ת)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60664 (ח)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60655 (פ)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60666 (ו)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60679 (ס, clockwise closed stroke)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60681 (מ, rising arch first)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60682 (ל)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60684 (י)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60674 (ר)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60689 (ה)
- https://www.yo-yoo.co.il/coolpics/bg.php?id=60690 (ד)
- https://www.montgomeryschoolsmd.org/siteassets/schools/elementary-schools/t-w/waysidees/uploadedfiles/specials/verbal_letters.pdf (uppercase M and D)
- https://crane.osu.edu/files/2021/05/ABC_Lessons_V2_Final.pdf (uppercase N and T)

Lowercase paths follow the K-2 verbal letter-formation worksheet linked above. Letter bodies sit below ascenders; p extends below the baseline. Uppercase and lowercase share the same recorded letter names.

Words and Hebrew spellings come from the shared vocabulary catalog. The activity uses committed Google TTS recordings for each word, the start instruction, and the names of all letters in its twelve words in both languages. Chimes are nonverbal feedback. The audio generators derive the active letter list from `painter-content.mjs`, and the content check requires every clip.
