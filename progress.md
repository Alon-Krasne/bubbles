Original prompt: Fix unlocked trail stages so they launch playable games and can be replayed while preserving the highest star score; add distinct highlighted Magic House placement targets when an item is selected or dragged.

## Acceptance target

- Completed and current trail stages launch their real activity; locked stages remain disabled.
- Replaying an earlier stage never advances the current frontier and never lowers its saved star score.
- Completing the current stage advances once and stores the better of the old and new star result.
- Magic House reveals clearly differentiated valid destinations only while an item is selected or dragged.
- Supported review viewports remain 1440 x 900 and 1024 x 768; portrait phones are out of scope.

## Current diagnosis

- Only Magic House is registered as a hosted trail activity.
- Every other unlocked stage currently runs a placeholder completion animation.
- Hosted Memory initially failed because it initialized the unused Pixi bubbles renderer first; hosted vocabulary activities now skip that engine.

## TODO

- [x] Reproduce the placeholder completion in the browser.
- [x] Map Memory Garden and Listening Shop launch/completion seams.
- [x] Launch real Memory Garden and Listening Shop levels from the trail.
- [x] Validate shared completion and high-water star persistence.
- [x] Implement Magic House destination cues.
- [x] Visually validate Magic House destination cues at 1440 x 900 and 1024 x 768.
- [x] Receive final read-only Gemini 3.1 Pro visual approval.
- [x] Run final build, review, version, and PR checks.
- [x] Make the deployed root open the world trail while hosted activities remain playable.

## Profile gate acceptance

- [x] Opening the app starts with profile selection before the trail.
- [x] A profile can be created with a name, character, and learning language.
- [x] Existing profiles can be edited without losing route progress.
- [x] The selected profile persists across reloads and can be changed from the trail.
- [x] Custom profile identity, language, and character reach every hosted activity.
- [x] The only remaining profile cannot be deleted.
- [x] Browser and Gemini 3.1 Pro visual review pass at 1440 x 900 and 1024 x 768.
- [x] Production bundle includes all four profile sprite directories.

## Vocabulary variation and language contract

- [x] Memory Garden chooses a new subset of words from a larger themed pool each session.
- [x] Store begins from a shuffled target deck and avoids repeats until the level pool is exhausted.
- [x] Magic House shuffles its request sequence and object drawer while keeping each request's matching audio file.
- [x] English comprehension choices use images without duplicate written answer labels.
- [x] Hebrew reading choices use written Hebrew without answer images before success.
- [x] All placement zones receive the same cue; even penalized help never identifies the correct destination.
- [x] English activities use sound plus image choices; Hebrew activities use written prompts and choices without answer-revealing sound or images.

Acceptance judge: automated `agent-browser` sessions against the hosted trail at 1440 x 900, followed by a read-only Gemini 3.1 Pro visual review.

- Memory receipt: four fresh level-one sessions produced four different word subsets; English target cards had sound and no drawings, while Hebrew target cards had neither sound nor drawings.
- Store receipt: a complete round exhausted the shuffled target deck before repeating; English showed image choices plus replay audio, while Hebrew showed the full written request plus written choices and no replay controls.
- Magic House receipt: six requests completed in shuffled order with matching audio in English; Hebrew showed word-only choices, no audio control, and all destination cues remained visually equivalent.
- Progression receipt: a persisted profile with stage 5 stars was upgraded to stage 6; completing stage 6 recorded its best stars and displayed the six-stage completion state.

## Generated trail catalog

- [x] One shared catalog generates game levels and all route launch metadata.
- [x] Memory Garden exposes pair-count and vocabulary-pool knobs.
- [x] Store exposes customer-count, shelf-size, and order-mode knobs.
- [x] Magic House exposes request-pool, request-count, and drawer-size knobs.
- [x] All 15 route stages launch implemented games and unlock sequentially.
- [x] Difficulty never decreases between appearances of the same game.
- [x] English and Hebrew learning policies remain fixed across generated levels.
- [x] `npm run test:trail` validates references, policies, difficulty, and the 45-star total.

## Track reset and vocabulary breadth

- [x] Profile settings can reset the track to any of the 15 stages.
- [x] Resetting to stage N gives stages 1 through N-1 three stars and leaves stage N playable with zero stars.
- [x] Version-1 stage-6 progress is migrated without crediting the replacement activity.
- [x] Vocabulary expanded from 151 to 214 unique English/Hebrew entries with no niqqud.
- [x] Routed Memory pools contain 161 non-overlapping words and increase through 4, 6, 8, 9, and 10 pairs.
- [x] Store item pools are generated from the shared catalog and contain 12, 20, 16, 16, and 61 words.
- [x] Every one of the 214 catalog words is reachable through the 15-stage route.
- [x] Per-profile coverage decks exhaust Memory and Store pools before repeating answers.
- [x] Memory and Store runtime speech is assembled only from committed vocabulary recordings.
- [x] Generate and commit the 243 Google Gemini 3.1 Flash TTS vocabulary clips after network export approval.
- [x] Validate all 243 MP3s decode and remain within the expected spoken-clip duration range.
- [x] Verify the production single-file build inlines all 243 recordings.
- [ ] Confirm Memory word playback and Store sentence playback on the PR preview; local agent-browser reached its external usage limit during the final click-through.
