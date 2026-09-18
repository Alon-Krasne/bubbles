# Media status — all nine review drafts generated

Watch the [production gallery](visual-explainer/forest-song/production/index.html). The approved remaining-six batch completed: 13 six-second shots, one candidate per shot, estimated $31.20. Final players use local wordless soundtracks with Hebrew/English/off captions. Live playback and caption switching passed for all six new players.

These are drafts, not final integration approval. [Review notes and implementation handoff](visual-explainer/forest-song/production/REVIEW.md) document character duplication, early blossom reveals, and changed finale cast. Keep the approved storyline unchanged; resolve visual continuity before final integration. No further paid generation is queued.

# Current direction — adventure revision

Follow the updated [storybook](STORYBOOK.md) and [video 2 visual plan](visual-explainer/forest-song/production/video-02/index.html). Nine videos now contain 21 editorial shots, approximately 126 seconds. Video 2 is 18 seconds: gift opens the passage, root village reveal, courier problem. The courier is the existing root-host role, introduced earlier and returning later. Old garden-only video-02 prompts are superseded; do not submit them. No gameplay mechanics are added by the cinematic cart, lift or bridge events.

Video 2 is now generated and reviewed; its revised three-shot generation estimate was $7.20. The original $4.80 two-shot scope is historical. Remaining milestones now include completed deliveries, bridge opening, workshop map, crystal-route connection, hall opening, converging routes and the canopy reveal. Opening-draft continuity defects remain tracked separately.

The notes below retain earlier production history; where plot or shot scope differs, use the canonical revised scripts.

# Forest production — next work

The story is settled in [STORYBOOK.md](STORYBOOK.md). Focus further creative work on producing its assets, while implementation agents finish the game integration against that brief.

## Produced in art pass 01

- [Shared cast reference sheet](visual-explainer/forest-song/production/art-pass-01/cast-reference-v1.png): Nevet on the left, Adva in the middle, Zohar on the right; full-body designs plus side/expression studies. Uses the current puppy art and map as style references.
- [Video 2 / shot 1 keyframe](visual-explainer/forest-song/production/art-pass-01/pilot-02-shot-01-v1.png): Zohar offers a basket to the recurring river resident, now depicted as a small olive frog-like creature. This is a still image for the pilot, not a generated video.
- [Exact prompts and provenance](visual-explainer/forest-song/production/art-pass-01/prompts.json): two completed image-generation calls, zero retries, zero video calls. The tool does not expose a billing total or exact backend model ID.

These are candidate production references for visual review, not approved replacements for the current game assets. All original owl, flight and other concept images remain intact. The sheet is not a sprite atlas; do not crop it into final gameplay frames and assume registration, transparency or pose consistency.

## 1. Lock identity, then prepare the video pilot

Use this sheet as the starting reference rather than redesigning the trio in each image. Keep Nevet's broad leaf ears, Adva's cheek fins, and Zohar's round ears and three belly lights consistent. Zohar's identity carries across the sheet and keyframe. The current Adva drawing has more fin lobes than the three requested in the prompt; settle that visible detail before creating a full reference set. Do not spend another generation merely to satisfy a hidden prompt detail if the chosen appearance works.

Keep the river resident identical across the opening, river scenes and reunion. Its candidate appearance is established in the pilot keyframe. The root host and cave traveler still need designs; do not create a crowd.

After reference selection, export/generate clean individual character references with consistent front, side and back views as needed by the chosen video workflow. For gameplay, discover which portraits and idle/walk/celebrate frames the implementation actually uses before commissioning them. Avoid a speculative full animation library.

## 2. Generate one bounded video pilot

**Target:** `forest-video-02`, shot 1, about six seconds edited duration. Use the keyframe above as the visual anchor.

**Motion brief:** locked medium camera. Zohar gently brings the basket forward. The river resident looks from the contents to Zohar, brightens in recognition and reaches toward the handle. Zohar responds with a small pleased head tilt. Keep the two apples, blue flask, basket geometry, paws and three belly lights stable. A tiny warm light may appear along a root near their feet. End on the shared recognition; no new character enters and no camera cut is required.

**Sound brief:** quiet stream, leaf rustle, one questioning chirp followed by a happy trill. No words, narration, subtitles or lip-sync. If model audio adds unwanted speech or inconsistent voices, prepare a separate nonverbal sound mix; do not change the story to accommodate it.

Before paid video generation, check current provider/model capabilities, accepted reference formats, native shot lengths and pricing. Agree a maximum spend and attempt count. Do not treat this plan as permission for an unlimited batch.

**Pilot judge:** the recognition is understandable without words; Zohar matches the reference; hands and basket do not merge or morph; the resident remains the same creature; motion is gentle and appealing; no accidental speech. Record actual cost across all attempts. Decide whether the result justifies producing the rest.

## 3. Produce the remaining media from the shot list

- Follow the nine scripts and 21-shot plan in the storybook. One master per milestone serves both languages and all character choices.
- Produce by location to reuse references: stream/waterfall; crossing; root dwelling; cave; tree hall. The tree hall serves videos 6–9.
- Lock the hall's three tables and three hanging blossoms before the final four videos. Track empty, preparing, two ready, then fully open states.
- Assemble shots into the nine finished videos. Normalize sound and preserve a consistent character motif. Keep source shots, approved reference images, prompts, provider/model settings and actual charges.
- Treat the original owl imagery as a retained atmosphere/scale reference. Produce the reunion/canopy ending in the final script.

## 4. Finish game integration — implementation agents

Inspect existing work before adding parallel implementations. This review observed work in `prototype/shared/destinations.mjs`, world-map files and destination/save tests on `codex/destination-entrance-and-saves`; it was not edited or validated by the art pass. Do not describe it as complete without checking it.

1. Finish the two-destination entrance and independent profile/language journey state. Preserve the current destination and its saves.
2. Connect the approved forest character portraits/map assets. Selecting a character must not request a personalized video.
3. Author forest vocabulary pools around the story while preserving the current difficulty curve. Stage 8's Shop is `single`; the existing first quantity and color modes are stages 17 and 23. Early videos must not imply mandatory harder modes.
4. Preserve the current runtime language policies. The reviewed Hebrew implementation uses recorded spoken prompts/target words and pictured choices; `docs/LEARNING_MODEL.md` contains older reading-only prose. Resolve that documentation inconsistency in the relevant implementation work, without reverting runtime behavior to satisfy the old prose.
5. Wire stable video IDs, completion triggers, album and user-initiated playback. Finalized playback files are expected by the current destination module as `prototype/assets/forest/forest-video-01.mp4` through `forest-video-09.mp4`; inspect the latest interface before delivering encodes. Existing JPG posters are not evidence that videos exist.
6. Clearly distinguish unavailable production videos from reference stills. Do not report a poster as video playback or substitute a still movie for the requested generated video.
7. Check save isolation, repeated completions, interrupted playback, skip/replay and touch/keyboard controls. Keep gameplay progress independent of media success. Follow repository feature branch, version bump, checks and PR requirements.

## Review fixes already made

The storybook review corrected the fixed supporting-cast count, the pre-pilot spending rule in the HTML, stale Hebrew-learning instructions, early quantity/color difficulty claims and ambiguous archive wording. Scene content now has a repeatable sync/check command:

```sh
node docs/visual-explainer/forest-song/sync-storybook.mjs --write
node docs/visual-explainer/forest-song/sync-storybook.mjs --check
```

No gameplay files were changed during that review. Planning checks establish document consistency, not completed game behavior or successful generated video.

## Wordless sound policy — learned from opening draft

The first native soundtrack spoke sound-effect names aloud. The opening preview now preserves the exact video streams and uses a separate locally synthesized sound bed; originals remain available. See [repaired preview](visual-explainer/forest-song/production/video-01/index.html) and [prepared future prompts](visual-explainer/forest-song/production/video-01/future-prompts.json).

For future generation, separate visual performance from sound direction. Ask for head tilts, eye contact and paw gestures, with relaxed mouths and no speech articulation. Request environmental water/leaf sound only. Add character sounds and music in post-production. Never put quoted onomatopoeia or pronounceable sound-effect examples into dialogue. If commissioning nonverbal effects, specify acoustic properties such as a short breathy rising whistle with no consonants, vowels or syllables; do not treat this wording as a guarantee.

Use the supported negative prompt field for: speech, dialogue, narration, spoken sound-effect labels, human voices, syllabic vocalizations, singing, lip-synced speech, subtitles, captions. Prompting reduces risk; separate audio production prevents accidental generated speech from reaching the final mix. Listen to every final shot before acceptance. Replace audio on otherwise useful footage instead of spending on new video solely to repair sound.

Reference: [Google's Veo prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1). The separate-audio policy is our production decision based on the observed failure, not a provider guarantee. Storybook sound cues describe the intended experience; they must be adapted into acoustic direction rather than copied literally into model prompts.

## Localized story captions

The user approved short sentences in the chosen language as player-rendered subtitles. Keep the shared video and audio wordless; the application supplies Hebrew or English captions from the selected learning track, plus an off control. These are story captions, not transcriptions of creature sounds. The opening preview implements three timed sentences in `production/video-01/captions.json` and native text tracks (including the individual shots). Changing language must not restart playback. Use short, concrete sentences, one at a time, with enough reading time. Generated/burned-in text remains prohibited; captions are separate, editable UI. Remaining eight videos need caption copy authored against their final edits.
