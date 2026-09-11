Original prompt: Fix unlocked trail stages so they launch playable games and can be replayed while preserving the highest star score; add distinct highlighted Magic House placement targets when an item is selected or dragged.

## September 11 generated trail foundation

- Goal: make the learning trail content-driven so it can extend to 30-40 stages with rising difficulty instead of a hand-placed list.
- Added `scripts/generate-vocabulary-catalog.mjs`, which derives a compact runtime mirror `prototype/shared/vocabulary-catalog.mjs` (214 words with category and shoppable) from the app's `src/words.ts`. A trail test asserts the mirror stays in sync.
- Added `prototype/shared/trail-recipes.mjs`: level factories, six Hebrew-named chapters, and `generateTrail()`, a deterministic vocabulary-driven generator. Memory difficulty comes from pair count and the chapter's word categories; Shop scales customers/shelf and moves single → quantity → color → double; Magic House scales requests and help while introducing compound requests only in later chapters. Shop pools are restricted to `SHOP_ART_IDS` so every generated product already has committed artwork.
- `prototype/shared/trail-catalog.mjs` now re-exports the factories and exposes `TRAIL_CHAPTERS`, `GENERATED_GAME_LEVELS`, and `GENERATED_TRAIL_STAGES` (36 stages across 6 chapters, unique auto-positioned map nodes, non-decreasing per-game difficulty). The live 15-stage route and its levels are unchanged, so existing progress, saves, and every browser test keep working; wiring the chaptered map to the generated route is the next step.
- Cloudflare Pages Git integration already covers the workflow: `main` → production `https://bubbles-by5.pages.dev`; any `codex/*` branch → its own preview at `https://<branch>.bubbles-by5.pages.dev` (stable branch alias) plus a per-commit URL. `codex/generated-trail` preview is `https://codex-generated-trail.bubbles-by5.pages.dev`, uses the preview D1 binding, and redeploys on every push. Both sit behind Cloudflare Access, so automated browser checks against the preview need an Access service token.
- Validation: `npm run test:trail` reports legacy 15 stages and generated `chapterCount:6, stageCount:36, maxStars:108`. `npx tsc --noEmit`, `npm run build`, `test:vocabulary-audio`, `test:vocabulary`, `test:shop-session`, `test:store-audio`, `test:route-vocabulary`, `test:activity-scoring`, `test:memory-completion`, `test:track`, `test:traveller-position`, `test:audio-integrity`, and `test:translations` all pass.

## September 11 Memory save boundary

- User accepts a fresh closed/shuffled board on refresh; preserve completed stars, route progress, and configuration, not individual card state.
- Removed Memory round snapshot writes and restoration. Existing snapshot rows are unused, not migrated or deleted. No save-client or database schema changes.
- Red: `node scripts/test-memory-saves.mjs` failed `Opening one card must not write to the database`, actual 1 versus expected 0.
- Green, same test: `PASS: flips, mismatches, pairs and reshuffles produce 0 database writes; completion produces 1; reload closes cards and retains stars.` Uses agent-browser and isolated local D1; run build and `node scripts/serve-save-test.mjs` first.
- `npm run test:saves`: `PASS: D1 save/read, lost-ack retry, stale-write rejection, simultaneous writes, service restart, and origin/key validation.` Client, round, and body-limit tests also passed. Memory completion, translations, TypeScript, build, and whitespace checks passed.
- Save-path review: shared client already skips equal values. Shop still snapshots item selections/mistakes/customer state; Magic House still snapshots placements/mistakes/help state. These other activities were reviewed but not changed in this Memory-focused fix. Vocabulary deck rotation and profile configuration remain unchanged.
- Reviewed locally against the user's save boundary and AGENTS.md; no subagents per user preference.

## September 10 Moonlit Shop — in progress

- Approved direction: `design/mockups/moonlit-shop.png`, full-screen moonlit woodland shop matching the daughter's approved Magic House. English requests and optional Hebrew hints stay live; no theme selector or save-schema changes.
- Branch `codex/moonlit-shop` starts at merged main `ee672c4`.
- Luna scoped to browser geometry tests, old gameplay CSS removal, and read-only correctness review. Root handles artwork and integration. Generic web-game Playwright driver is superseded by the project's agent-browser-only rule.
- Acceptance: `node scripts/test-moonlit-shop.mjs` against built local `scripts/serve-save-test.mjs`, 4/6/8 products across all five levels. Baseline failed `Missing .shop-scene-art`. New layout passes all five cases; existing `npm run test:shop-order-hint` passes. Finish gates: both browser suites, `npm run test:translations`, `npm run test:shop-session`, `npm run test:saves`, `npx tsc --noEmit`, `npm run build`, `git diff --check`, screenshot review against approved mockup, then PR/preview.
- Clean scene, eight customer sprites, and five product sheets generated with built-in image generation. Runtime assets currently have opaque backgrounds and are NOT visually approved. Local background-removal permission requested from user; do not ship checkerboard/white rectangles as final art.
- Manual screenshot caught a build URL error despite the first geometry test reporting art present: CSS URL existence is not an image-load check. Runtime CSS variables now point to copied prototype assets. Need a separate actual asset-load check.

## September 9 Shop written orders

- User clarified that Memory hints work; the Shop must display the spoken English order instead of the generic Hebrew placeholder.
- Render the existing saved order sentence with English language/LTR direction. Reuse the Hebrew request formatter for an opt-in hover/focus translation; reset the hint and replace its content for each customer. Hebrew mode stays Hebrew. No audio or save schema changes.
- Red: `node scripts/test-shop-order-hint.mjs` failed with actual `אני רוצה בבקשה...` instead of an English request.
- Green: `npm run test:shop-order-hint` returned `PASS: English order, opt-in Hebrew hover/focus, responsive layout, next-customer reset, and unchanged Hebrew mode.` The script uses agent-browser against `scripts/serve-save-test.mjs` after building; it covers desktop, tablet and mobile widths.
- `npm run test:translations`, `npm run test:shop-session`, `npx tsc --noEmit`, `git diff --check`, and `npm run build` passed. Local visual review is provisional; confirm the customer sentence and Hebrew hover hint in the authenticated preview.

## September 9 Review fixes — version 7.16.2

The user and daughter approved the moonlit visual direction. Addressed the local review's five-choice tablet inventory clipping and both Ponytail comments: removed three unused avatar properties and the title's redundant shared styles/resets. No save/protocol changes. Sprite cells now size to the smaller dimension of their button using native CSS container-relative units; see https://www.w3.org/TR/css-conditional-5/#container-lengths.

Acceptance receipts:

- Before changing CSS, `node scripts/test-magic-house-inventory.mjs` failed with `Error: 5 choices: inventory overflows drawer`. The assertion fixture is unchanged after that red run.
- After fixing CSS, the same test passed English/Hebrew at 1024×768 and 1440×900, each with `PASS: 5, 6, and 8 choices fit the drawer; sprites/labels fit touch-sized buttons.`
- Both medium-reasoning Sol reviewers requested a self-contained test command. Accepted as one duplicate finding. Before adding its wrapper, `npm run test:magic-house-inventory` without a preview failed with `net::ERR_CONNECTION_REFUSED`. It now builds, owns the temporary preview server, waits for its startup, runs the unchanged browser fixture, and tears down. The named command passes all four language/viewport groups without a manually started server. The speculative cleanup-error masking concern did not reproduce: the original startup error remained intact.
- `npm run test:saves` passes Access validation, D1 write/read/retry/conflict/restart, offline synchronization, round restoration, and request-body limits.
- `npm run test:moonlight-room`: `PASS: all 7 moonlit-room surfaces and all 12 authored placements align with the new artwork.` `npm run test:magic-house-hit-areas`: `{"zones":7,"overlaps":0,"bilingualLabels":true}`.
- Translation, Magic House layouts/variation/audio, and TypeScript checks pass. `npm run build`: `✓ built in 1.63s` / `Copied educational game prototypes into dist.` `node scripts/test-fast-start-build.mjs`: `{"indexBytes":580349,"builtAudioCount":243}`.
- Browser screenshots inspected: `/tmp/moonlight-fixed-tablet.png`, `/tmp/moonlight-fixed-hint.png`. The five-choice row now fits on the ledge; enabled Hebrew tooltip opacity is `1`. Real ball drag into the chest produced `{"hint":"false","placed":1,"progress":"2 / 3"}`.
- Final clean-context high-reasoning Sol review: `NO ACTIONABLE FINDINGS`. All local/Ponytail findings fixed; the two medium Sol findings were duplicates and fixed by the owned test wrapper. Port-conflict negative check exits 1 before browser assertions, preventing stale-server passes. No unresolved actionable findings; no automatic merge.

## September 9 Moonlight Storybook implementation (supersedes sun/treehouse)

The daughter selected the night concept with the crescent moon and arched window. Implemented a clean generated moonlit environment plus a separate alpha sprite atlas, live DOM instructions and inventory on the painted golden ledge. No save IDs, save schema, request content, scoring, or language-policy changes. Recalibrated all furniture coordinates; preserved the artwork's aspect ratio at 1440×900 and 1024×768. Version 7.16.1.

Acceptance receipts:

- Before changing coordinates, `node scripts/test-moonlight-room.mjs` failed: `AssertionError [ERR_ASSERTION]: bed must cover its visible moonlit-room surface`. The independent fixture was kept unchanged.
- After implementation, `npm run test:moonlight-room`: `PASS: all 7 moonlit-room surfaces and all 12 authored placements align with the new artwork.`
- `npm run test:magic-house-hit-areas`: `{"zones":7,"overlaps":0,"bilingualLabels":true}`.
- `npm run test:translations`: `Validated Hebrew translation behavior and catalog coverage for 214 vocabulary words, 8 Magic House objects, 7 destinations, and 12 requests.` / `PASS: translation help requires a hint click, toggles off, resets for each question, and stays hidden in Hebrew mode.`
- `npm run test:magic-house-layouts`, `npm run test:magic-house-variation`, and `npm run test:magic-house-audio` exit 0; audio receipt: `{"requests":12,"decodedClips":24}`.
- `node scripts/test-round-saves.mjs`: `PASS: Magic House restores placed objects and advances a completed request before its animation ends.`
- `npx tsc --noEmit` exits 0. `npm run build`: `✓ built in 1.70s` / `Copied educational game prototypes into dist.`
- `agent-browser --session moonlight` against `node scripts/serve-save-test.mjs` (isolated, temporary local D1): real pointer drag of book to table advanced to `2 / 6`, placed count `1`, hint `false`; reloading retained `2 / 6` and placed count `1`. Tooltip opacity was `0` before enabling the bulb and `1` after. Completed both six-question layouts through the real object/zone controls, covering all twelve placement keys, including both two-object requests.
- Browser Hebrew mode: `{"hintHidden":true,"imageChoices":0,"speakerHidden":true,"translationTerms":0,"wordChoices":8}`. Trail stage 3: `{"choices":5,"homeVisible":true}`. Reduced motion: `{"animation":"0.001s","reduced":true}`. Speaker click: ready state `4`, English request WAV loaded, no new browser errors. Earlier initial autoplay / interrupted-play errors occurred during reload and rapid profile changes; no audio code was changed.
- Screenshots inspected at `/tmp/moonlight-final-desktop.png`, `/tmp/moonlight-tablet.png`, `/tmp/moonlight-placed.png`, `/tmp/moonlight-second-layout.png`, `/tmp/moonlight-complete.png`, and `/tmp/moonlight-hebrew.png`. Adjusted teddy placement off the footboard onto the mattress after visual inspection.

Design-consultant screenshot loop used as a local **provisional** proxy judge: category changed from flat attic to illustrated moonlit room; controls remain readable, all eight inventory items fit, and the furniture targets stay unobstructed. Final human verdict pending: user/daughter try the PR preview and approve the resemblance to their chosen moon concept. Landscape desktop/tablet only; no portrait-phone acceptance claimed. Do not merge automatically.

## September 9 Magic House storybook benchmark

User approved beginning the app-wide visual direction with Magic House. Keep the existing room artwork, calibrated placement coordinates, learning policies and saves unchanged. Before-state: heavy separate tray cards, competing framed headings, mismatched emoji avatar. Visual judge: screenshot review at 1440x900 and 1024x768, then user approval before extending the direction to other games.

Acceptance: centered wooden object shelf with all eight targets fitting; readable Hebrew choices; discreet 44px-or-larger controls; opt-in translations still reset between requests; correct placements and lamp lighting survive reload; celebration keeps the room visible; reduced-motion preference suppresses animation. Gates: translations, Magic House layouts/hit areas/variation/audio, round saves, TypeScript, production build. Browser testing uses agent-browser per project policy instead of the generic web-game skill's Playwright client.

Receipts: `npm run test:translations` reports coverage for 214 words, 8 objects, 7 destinations and 12 requests, plus PASS for opt-in/reset/Hebrew hiding. `npm run test:magic-house-hit-areas` returns `{"zones":7,"overlaps":0,"bilingualLabels":true}`; layouts, variation and audio tests pass (24 decoded clips). `node scripts/test-round-saves.mjs` reports PASS for restore/advance. `npx tsc --noEmit` and `git diff --check` exit 0. `npm run build` reports `✓ built in 1.74s` and prototype copy complete.

Browser proxy verdict: provisionally accepted at 1440x900 and 1024x768. Eight-object English and Hebrew shelves fit; Hebrew has eight word choices, no visible translation bulb, and the dinosaur avatar. Translation tooltip opacity is 0 before enabling; it is visibly shown after enabling and the bulb resets to false at 2/6. Pointer-dragging the pillow advances to request 5 with five placed objects and zero drag ghosts. Lamp/placed-object state survives reload. Complete practice round reaches its celebration with seven placed objects. Reduced motion returns true with animation duration 0.001s. A fresh English audio replay returns error:null and readyState:4; the rapid-navigation session logged autoplay/source warnings, with no errors after the fresh replay check.

Screenshots inspected: /tmp/house-storybook-desktop.png, /tmp/house-storybook-tablet.png, /tmp/house-storybook-hint.png, /tmp/house-storybook-lamp.png, /tmp/house-storybook-completion.png, /tmp/house-storybook-hebrew.png, /tmp/house-storybook-preview.png. Pending: user visual approval of this Magic House benchmark before extending it to Shop and Garden. No save schema, scoring, target positions, or language policy changes. Version 7.16.0.

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
- [x] Preserve the prior inline-asset bundle lifecycle while the online production build emits recordings as lazy assets; full offline trail packaging remains outside this correction pass.
- [ ] Confirm Memory word playback and Store sentence playback on the PR preview; local agent-browser reached its external usage limit during the final click-through.

## July 17 correction pass

User reports: Memory speaker overlaps the word; Magic House repeats the same room round; Memory reports success before the final cards finish opening; the stage-6 traveller disappears; game startup is slow; and calculator uses an abacus drawing.

Acceptance tests:

- [x] `npm run test:magic-house-variation` prevents consecutive request-set repeats.
- [x] `npm run test:memory-completion` delays completion until the final transform transition and fires once.
- [x] `npm run test:traveller-position` places the stage-6 traveller below the route, outside the stage panel footprint.
- [x] `npm run test:vocabulary` requires a calculator drawing rather than the abacus emoji.
- [x] `npm run test:fast-start` performs a fresh build, then requires a sub-2 MB entry and all 243 recordings as emitted assets; current result is 565,958 bytes and 243 files.
- [x] Validate the Memory card, stage-6 traveller, and consecutive Magic House rounds with `agent-browser` at 1024 x 768.
- [x] Run the complete regression suite, visual review, and version bump.
- [x] Commit, push, and update PR #29.

Browser receipts at 1024 x 768:

- Stage 6 traveller is visible below its route node and no longer hidden by the stage panel.
- Magic House now has two authored six-request layouts with different object/location pairs and 24 matching English/Hebrew recordings. A deterministic regression test proves a reordered copy of the previous room cannot win before the alternate layout is considered.
- A browser replay seeded with requests 1-6 selected only requests 7-12 on the following complete room. The corrected ball request used `bedside-floor`, with matching English and Hebrew text/audio.
- Memory completion stayed hidden immediately after all 12 cards were matched, then appeared only after the 320 ms final flip transition.
- The watermelon stress card fits one line with 21 px margins; word and speaker button share the same horizontal center.
- Production Play-to-visible-and-interactive Magic House launch measured 1,149 ms after parallelizing iframe loading with the launch celebration, down from 1,434 ms before that change.
- Gemini 3.1 Pro final Magic House verdict: APPROVE with no blocker/high/medium findings. Its three low notes (ball grounding, pillow contrast, and keyword spacing) were applied afterward.

## August 21 Listening Shop timing follow-up

User follow-up: keep the completed request visible until the item + “thank you” audio finishes, show the next customer immediately when “thank you” ends, and play recorded speech 20% faster.

Acceptance target:

- [x] Recorded vocabulary speech plays at `1.2×`.
- [x] The completed customer/request remains visible for the entire confirmation sequence.
- [x] The next customer appears immediately after confirmation audio ends, with no additional pause.
- [x] Queue, Store audio, build, and real-Chrome checks pass without playback or console errors.

Implementation notes:

- Recorded speech now assigns `playbackRate = 1.2` before every clip.
- Queue completion callbacks run only after successful playback; superseded and cancelled requests never complete.
- English Store customer advancement is driven by the item + “thank you” sequence completion; Hebrew keeps its existing text-only timing.
- The queue completion regression was observed failing before implementation and now passes.

Browser receipt: before the change, playback was `1.0×` and the customer changed about 1.4 seconds before “thank you” ended. In the final Chrome run, every recorded clip reported `1.2×`; all samples through the final `1.64 s` “thank you” frame kept the original customer at opacity `1` without the leaving class, and the next customer appeared 0.6 ms after the clip ended. Both replay controls were disabled during confirmation and re-enabled for the next customer. The page error log was empty and the console contained only Vite connection messages.

### Voice-speed correction

The user found the `1.2×` result still perceptually slow. The immutable correction target is `1.5×`, with the committed `1.64 s` “thank you” clip completing within `1.2 s` in Chrome while preserving the confirmation-completion transition and an empty page-error log.

Before correction, Chrome confirmed that the audio path was applying `1.2×`, but “thank you” still took `1,418.8 ms` of wall-clock time. This rules out a bypassed playback path and identifies the problem as insufficient speed-up.

After correction, Chrome reported `1.5×` and completed that same clip in `1,162.4 ms`, passing the `1.2 s` threshold. In a full Store round, the selected word and “thank you” both played at `1.5×`; the completed customer stayed fully visible with no leaving class through the final audio frame, and the next request began 0.7 ms after “thank you” ended. Replay controls unlocked for the next customer, the page-error log was empty, and visual inspection found the post-transition layout intact.

## August 21 Shop state and forgiving stars correction

User follow-up: the Shop answer/progress UI still changed before “thank you,” in-progress play reset to an older state, and star scoring must never disappoint a child with a hidden penalty.

Acceptance target:

- [x] Customer, prompt, basket, served count, coins, feedback, and shelf remain visibly unchanged until `thank-you.mp3` ends.
- [x] The next request renders immediately after “thank you,” with no added pause.
- [x] The exact in-progress customer, order, shelf, mistakes, coins, and served count survive a hard reload after every committed interaction.
- [x] Completing a Shop level clears only that level's in-progress session.
- [x] Help never costs a star; forgiving mistake thresholds are the only scoring input.
- [x] Every one-, two-, or three-star result displays all three slots.

Before correction, Chrome showed the first customer changing from `0/5`, `0` coins, and `❓ 0/1` to `1/5`, `1` coin, and the revealed answer 121.8 ms before selected-word audio began; “thank you” ended another 2,158.8 ms later. A hard reload then reset `1/5` to `0/5`, and local storage contained no Shop session.

After correction, every observed UI value stayed unchanged through the `thank-you.mp3` `ended` event and the next request rendered 1.0 ms later. A hard reload reproduced the exact customer, shelf, stored request, `1/5`, and coin count byte-for-byte. Completing all five customers removed the session and displayed a visible `★★★` celebration. The Chrome page-error log was empty.

Scoring now awards three stars through mistakes on half the round's challenges, two stars through twice the challenge count, and one star beyond that. The strongest help no longer affects scoring. Celebration screens and completed route nodes use `★★★`, `★★☆`, or `★☆☆` so the result is always visibly out of three.

## August 21 Memory Garden completion correction

User follow-up: Memory Garden must not celebrate or leave the activity while any matched pair is still visually closed or mid-reveal.

Acceptance target:

- [x] Completion requires exactly two rendered cards per configured pair.
- [x] Every rendered card is both matched and face-up before completion can proceed.
- [x] Celebration waits for every active card-front animation, not only the second card in the final pair.
- [x] Hosted route completion remains blocked until after the fully revealed celebration.
- [x] The targeted regression, production build, and real-Chrome trace pass without page errors.

Before correction, the isolated completion path fired as soon as the second final card emitted `transitionend`, even when another card was explicitly still mid-reveal.

After correction, Chrome observed all eight cards matched and face-up 30 ms after the last selection, with four card-front animations still active and celebration correctly hidden. Celebration appeared only after all active animations reached zero. At that frame all eight cards were matched and face-up; the hosted completion message followed 2,401.7 ms later. The page-error log was empty.

## August 21 failure-path hardening

Review follow-up: a failed audio clip locked the Shop confirmation forever, an unhandled rejection could strand Memory completion, and corrupt storage could crash session restore.

Acceptance target:

- [x] A failed `thank-you` clip still serves the customer, unlocks replay controls, and starts the next request.
- [x] Queue semantics stay unchanged: completion fires only after successful playback; superseded and cancelled requests never complete or fail.
- [x] Memory celebration proceeds (with a logged error) even if the reveal wait rejects.
- [x] Corrupt or malformed Shop session storage reads as absent, is repaired by the next save, and failed writes never throw.
- [x] `npm run test:audio-playback`, `test:shop-session`, `test:memory-completion`, `test:activity-scoring`, `tsc --noEmit`, and the production build pass.

## August 21 basket animation restore

User follow-up: the correct final pick must fly to the basket and move the basket count 0→1 immediately, with the word + "thank you" audio following — not after the audio.

Acceptance target:

- [x] The completing English selection commits visually at tap time (fly animation, basket reveal, coins, served count, happy customer).
- [x] The next customer still appears only when the confirmation audio ends (or fails), preserving the no-extra-pause timing.
- [x] The committed selection persists immediately, so a mid-audio reload keeps the served state.
- [x] Targeted tests, typecheck, and production build pass.

## September 5 English translation hints

User request: In the English-learning path, let a child hover over learning words and objects to see their Hebrew translations.

Immutable acceptance target:

- [x] Memory Garden English word cards expose their Hebrew gloss after the card is revealed, on hover and keyboard focus.
- [x] Listening Shop image choices expose their Hebrew gloss on hover and keyboard focus.
- [x] Magic House instruction vocabulary, drawer objects, and room destinations expose Hebrew glosses on hover and keyboard focus.
- [x] Hebrew-learning activities contain no English-to-Hebrew translation affordances.
- [x] Translation hints do not intercept clicks, reveal closed Memory cards, or change game answers.
- [x] Targeted browser checks, typecheck, regression tests, production build, and visual review pass. The repository's explicit `agent-browser`-only rule superseded the generic web-game client named in the original target.

Red receipt: English Memory rendered 4 English cards and 0 `[data-hebrew-translation]` elements before implementation.

Green receipts:

- Production Memory kept closed cards at zero translation affordances, then showed the revealed word's Hebrew gloss on hover and keyboard focus; matched translated cards remained keyboard-focusable.
- Production Shop exposed Hebrew glosses on all four image choices while preserving correct-answer selection and hiding the hint outside hover/focus.
- Production Magic House exposed glosses for every instruction token, all five drawer objects, and all seven room destinations without changing help highlighting or placement behavior.
- Direct Hebrew-path checks returned zero translation affordances in Memory, Shop, and Magic House.
- All 20 package regression scripts, `npx tsc --noEmit`, `npm run test:fast-start`, and production `agent-browser` checks passed. Production screenshots were reviewed at 1024 x 768 with no clipping or obscured controls.
- A read-only external screenshot review was not run because permission to export the local screenshots was denied; local visual inspection was the final visual judge.

## September 7 simplification fixes

- Consolidated translation assertions and tooltip styling; English Magic House terms now come from the translation dictionary.
- Removed unused coming-soon/world-picker UI, the redundant GameState wrapper, and the unused texture packer (105 installed packages removed).
- Replaced custom recursive test file walkers with Node's recursive directory listing; bumped to 7.14.1.
- All 18 remaining regression scripts, TypeScript checks, and production build passed (573,507-byte entrypoint; 243 audio files).
- Production browser checks confirmed visible, styled Hebrew hints in Memory, Shop, and Magic House.

## September 8 opt-in translation hints

- Added a 💡 hint control to English Memory, Shop, and Magic House rounds. Word/object translations stay hidden until the child turns the hint on; a new question/customer/round turns it off again.
- Magic House destination Hebrew labels are also hidden until the hint is enabled, while the existing placement-highlight behavior remains available.
- Added a focused control test plus source/style assertions. Translation tests, TypeScript, build, and fast-start checks pass. Magic House browser check confirmed tooltip opacity 0 before enabling, 1 after enabling, and 0 after disabling; screenshot visually inspected. Hint reset and Hebrew-mode hiding pass the control test.

## Magic House visual refinement

- Replaced the wide hint banner with a 46px bulb beside the existing help control; kept an accessible name and pressed state.
- Colored key instruction words in teal and berry with subtle dotted underlines. Rounded the instruction/title panels and drawer tiles, softened shadows, and warmed the drawer background.
- Inspected screenshots at 1280x720 and 1024x768, including a hovered Hebrew word tooltip and Hebrew mode. Browser confirmed bulb width 46, a visible כדור tooltip after enabling, one placed object, and hint reset to false on request 2/6. Hebrew mode hides the bulb.
- `npm run test:translations` passes; `npx tsc --noEmit` and `git diff --check` exit 0. Browser reported the existing initial audio autoplay restriction before user interaction.

## September 11 Memory Garden visual refresh

- One new compressed moonlit garden environment with lanterns, foliage, and a crescent moon; CSS card decoration avoids additional generated sprites.
- Compact gameplay header and opt-in bulb, teal/gold card backs, ivory fronts, and sage matched-pair treatment. Flip behavior, vocabulary, and saves use existing code.
- Visual judge: before/after desktop and phone captures; check dense boards and real pair matching. Final aesthetic approval remains with the user on the PR preview.
- Gates: `npm run test:memory-completion`, `npm run test:translations`, `npx tsc --noEmit`, production build, and `git diff --check`.
- All gates passed. Browser checks passed 4/6/8/9/10-pair boards at desktop, portrait phone, and short landscape widths, plus a real matching pair. Dense phone boards scroll to preserve readable cards and 44px speaker controls.

## September 10 moonlit Shop redesign

- Rebuilt the Shop game as an edge-to-edge moonlit woodland stall, following the approved mockup while keeping requests, choices, hint/replay controls, and progress as live UI.
- Added eight illustrated customers and complete illustrated product coverage for all five Shop levels. The sprite atlases have real transparency; colored shapes and books remain exact CSS colors.
- English-learning choices show their English vocabulary word directly beneath each illustration; Hebrew-mode choices remain Hebrew-only.
- Removed the duplicate replay control and kept one compact speaker plus the opt-in translation bulb inside the request bubble.
- The acceptance target covers every Shop level at desktop, tablet, portrait phone, and short landscape sizes; products and controls must remain at least 44px, contained, and backed by decodable artwork.
