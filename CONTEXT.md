# Bubbles Learning World

Bubbles Learning World is a child-focused route of short language-learning activities. It supports separate English-learning and Hebrew-learning paths for each player profile.

## Language

**Shared family space**:
The current collection of children's profiles and saves shared by everyone admitted to the game. It does not belong to an individual adult sign-in.

**Stage save**:
The route progress written after a child finishes a stage. Unfinished activity moves stay in the open game session; leaving or refreshing an activity starts that stage again. Profile and journey choices are saved separately.

**Chapter**:
A themed group of six consecutive trail stages that share vocabulary categories and a difficulty band. Generated chapters let the route extend without hand-placing every stage.

**Generated trail**:
The pool of learning challenges produced by `generateTrail()` from chapters, vocabulary categories, and game parameter recipes. It contains six chapters × six stages = 36 challenges whose activities include Memory, Shop, Magic House, Reveal the Magic, and Magic Brush Painter. Each child's journey saves its own order of those challenges within each chapter, with no more than two consecutive appearances of one game. Magic Brush Painter appears once per chapter: cat, apple, sun, boat, map, and medal. It replaces six repeated challenges, leaving seven Memory, eight Shop, eight Magic House, seven Reveal, and six Painter stages. Existing stage ids, positions, saved journey orders, earned stars, and video milestones remain in place; completed slots stay completed when their challenge changes. Because level ids follow each game's appearance order, the change renumbered Memory 2–9, Shop 5–9, Magic House 6–9 and Reveal 3–9. Saves keyed by those level ids (Memory word decks and level stars, Shop word decks, level stars and unfinished rounds, Magic House request variation) are cleared once by owner decision: local saves once per browser, cloud saves once per account (`prototype/shared/level-renumber-reset.mjs`). Reveal keeps no per-level saves. Reveal the Magic earns normal route stars and uses letter guessing in the selected learning language; its starter letters vary. Painter follows the selected learning language, reveals a matching watercolor picture letter by letter, and uses committed word, instruction, and letter-name recordings. A lifted finger can resume a valid partial line from its pink marker. Stray touches are non-punitive; invalid drawn lines count toward the shared mastery-star calculation; leaving before completion awards nothing and replay starts a fresh drawing. The current tracing tolerance is the same at every rank; the rank describes the chapter, not a measured increase in motor difficulty. Video milestones stay after stages 5/10/15/20/25/30/35 and at the finale. The legacy hand-placed 15-stage route remains exported as `LEGACY_TRAIL_STAGES` for reference only.

**Trail content version**:
A stamp written into each profile's saved route progress. When it is missing, the saved stars are treated as legacy and reset once, because stage ids cannot say which route produced them. The reset is destructive by owner approval (it also clears unversioned progress earned on the generated preview at stages 1–15). Progress already past the legacy trail, plus Memory/Shop/Magic House round and settings saves, is preserved.

**Learning item**:
An English word, pictured choice, movable object, or named destination that carries vocabulary needed to play an activity.
_Avoid_: UI label, decoration

**Translation hint**:
An optional Hebrew gloss attached to a learning item in the English-learning path. It helps a learner continue without revealing unrelated game answers.
_Avoid_: Answer hint, full interface translation

**English-learning path**:
The activity mode in which the learner listens to or reads English and may request Hebrew meaning through translation hints.
_Avoid_: English game

**Hebrew-learning path**:
The activity mode in which the learner hears Hebrew prompts and picks pictured choices. It is designed for a child who speaks Hebrew but cannot read, so its listening activities are reachable by sound and image; English-to-Hebrew translation hints do not appear. Reveal the Magic is a reading activity by explicit product decision: children guess Hebrew letters, with recorded audio, a picture clue, and a lamp that reveals a remaining letter.
_Avoid_: Hebrew game

## Example dialogue

> **Designer:** Is the Shop basket button a learning item?
>
> **Developer:** No. The pictured apple on the shelf is a learning item, but navigation and game controls are not.
>
> **Designer:** What happens in the English-learning path when the learner hovers over the apple?
>
> **Developer:** Its translation hint shows “תפוח”. The same hint is available when the item receives keyboard focus.
