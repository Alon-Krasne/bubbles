# Magic Brush Painter illustrations

Six vocabulary pictures for the recurring trail activity. Each picture depicts its word directly, unlike the independent reward scenes in Reveal the Magic.

- `apple.webp`: existing watercolor illustration from the reviewed prototype in PR #46, commit `9b71348` (originally generated using Gemini 3 Pro Image).
- `cat.webp`, `sun.webp`, `boat.webp`: generated using Codex's built-in imagegen tool on 2026-09-27.
- `map.webp`, `medal.webp`: generated using Codex's built-in imagegen tool on 2026-09-29 to match the school and sports chapters.

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

Words and Hebrew spellings come from the shared vocabulary catalog. The activity uses committed Google TTS recordings for each word, the start instruction, and the names of all letters in its six words in both languages. Chimes are nonverbal feedback. The audio generators derive the active letter list from `painter-content.mjs`, and the content check requires every clip.
