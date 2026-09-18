# Opening video — first draft

Source: [full storybook](../../../../STORYBOOK.md), `forest-video-01`, before stage 1.

Three shots: the river resident's unfamiliar request; Nevet notices a glowing root trail; the great tree appears across the valley. Empty basket throughout. Nevet, Adva, Zohar and the recurring river resident share the scene. Gestures, creature sounds and music only; both languages use the same master.

Generation: Google Veo 3.1 Standard, reference images, 720p 16:9, three native eight-second clips. Editorial target remains approximately 18 seconds, subject to preserving readable action. One generated candidate per shot, no aesthetic retries. Published estimate: $0.40 per generated second, maximum $9.60 for these three candidates. Actual billed charges are not exposed by the generation API. Full prompts, operation state and submission errors are retained in `generation.json`.

Review before implementation: inspect character identity, creature count, stable hands/basket, empty basket, narrative order, safe emotional tone, no readable text and no speech. Generated footage is a draft until reviewed; do not automatically replace game assets.

## First review

Three generated clips and the 24-second assembly are saved. Sampled frames preserve four characters in shot 1. Shot 2 loses Nevet and transfers leaf ears to the resident. Shot 3 duplicates Adva and brings the destination too close. Shots 2 and 3 need replacement, ideally after approving dedicated scene keyframes. No additional video attempts were made. Full motion and listening review remain pending. This is not implementation-ready.

## Wordless audio repair

User heard the generated creatures literally saying sound-effect words. The current preview uses `forest-video-01-wordless.mp4`, with the entire original mix replaced by locally synthesized ambience and instrumental notes. All three preview clips use the corresponding sound bed. Original files are preserved. SHA-256 hashes of the compressed video streams match for all four replacements: no picture regeneration or re-encoding. No model calls or generation charges. Soundtrack source: `make-wordless-audio.mjs`; evidence: `audio-repair.json`. Full listening preference review remains with the user. Visual continuity defects remain.
