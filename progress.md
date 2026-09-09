Original prompt: Fix unlocked trail stages so they launch playable games and can be replayed while preserving the highest star score; add distinct highlighted Magic House placement targets when an item is selected or dragged.

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
