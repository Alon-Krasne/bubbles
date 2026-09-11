# Bubbles Learning World

Bubbles Learning World is a child-focused route of short language-learning activities. It supports separate English-learning and Hebrew-learning paths for each player profile.

## Language

**Shared family space**:
The current collection of children's profiles and saves shared by everyone admitted to the game. It does not belong to an individual adult sign-in.

**Round save**:
A child's unfinished Shop or Magic House activity, including the selected challenges and actions already completed, which can be resumed later. Memory Garden does not persist round state: opening or refreshing it creates a shuffled, closed board. Only completed Memory stage progress and settings persist.

**Chapter**:
A themed group of six consecutive trail stages that share vocabulary categories and a difficulty band. Generated chapters let the route extend without hand-placing every stage.

**Generated trail**:
The live learning route produced by `generateTrail()` from chapters, vocabulary categories, and game parameter recipes. It is deterministic and validated: six chapters × six stages = 36 stages whose Memory, Shop and Magic House levels scale in difficulty. The legacy hand-placed 15-stage route remains exported as `LEGACY_TRAIL_STAGES` for reference only.

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
The activity mode in which the learner reads Hebrew prompts and choices; English-to-Hebrew translation hints do not appear.
_Avoid_: Hebrew game

## Example dialogue

> **Designer:** Is the Shop basket button a learning item?
>
> **Developer:** No. The pictured apple on the shelf is a learning item, but navigation and game controls are not.
>
> **Designer:** What happens in the English-learning path when the learner hovers over the apple?
>
> **Developer:** Its translation hint shows “תפוח”. The same hint is available when the item receives keyboard focus.
