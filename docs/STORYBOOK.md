# היער הלוחש — implementation storybook

Status: final story specification for implementation. This is the authoritative brief. The earlier illustrations—including every owl and flight image—must be kept intact. They are references, not instructions to recreate their plot. The nine video scripts below define the story to implement.

## Current production handoff

See [FOREST_PRODUCTION_PLAN.md](FOREST_PRODUCTION_PLAN.md) for the completed two-image art pass and remaining work. [Open the character references and pilot keyframe](visual-explainer/forest-song/production/art-pass-01/index.html). An opening video draft exists. Video 2 is being revised around the hidden village and courier; its garden-only production plan is superseded.

## The promise

The great tree once connected the forest’s communities. Its paths have grown quiet, and neighbors have lost touch. Three little friends set out to bring everyone together again. By learning to understand requests, recognize words and help each other, the child restores those connections. Each reunion adds a musical voice to the forest’s song. The destination is a gathering inside the great tree, where every friend has a place.

The child’s emotional progression: “What do they need?” → “I understand!” → “I can help.” → “We made this happen.”

## Agreed direction

- **Entrance:** איפה נטייל היום? Two destinations with their own identities: עולם הפלאים and היער הלוחש. Use these destination names for implementation; keep them in editable UI copy. No repository name or version labels in the child-facing entrance.
- **Shared cast:** Three new selectable forest friends appear as the same fixed group in every video. Selecting a friend changes gameplay representation, not the rendered movie. Current destination keeps its existing characters.
- **Language has a purpose:** Understand a need → help through a learning activity → see the relationship and world change. The forest language is the selected English or Hebrew learning track; no invented vocabulary.
- **Wordless generated videos:** AI-generated video shots, assembled into nine videos. Gestures, expressions, creature sounds, ambience and music. No dialogue, narration, burned-in subtitles, language-specific signs or lip-sync. Optional short story captions are rendered by the player in the selected learning language, with an off control. Character movement is generated, not hand-animated.
- **Learning stays in gameplay:** Preserve the active runtime prompt and choice policies for each learning track. The current catalog, Memory, Shop and Magic House implementations use spoken Hebrew prompts or target words with pictured choices. Wordless videos do not replace educational recordings, reveal a pending task’s answer, or teach vocabulary through invented chirps.
- **Tone and ending:** Small friends, inviting scale, warm refuges and safe moonlit mystery. Language and cooperation bring the community together inside the tree. The opening canopy and illuminated landscape are the finale. No owl, giant bird guardian or flight ending.
- **Pacing:** Opening; after newly completed stages 5, 10, 15, 20, 25, 30 and 35; ending after 36. These milestones cross curriculum chapter boundaries. Replays do not advance the story. Videos are skippable and replayable.
- **Adventure pacing:** Each milestone pays off language work, changes where we can go or what we can do, and sets up a concrete next problem. Introduce scenery through action; keep humor and mystery without danger. Traversal and delivery events are video story beats, not extra minigames.
- **Production boundary:** Follow the revised scripts below. Existing drafts and images remain references; production status is recorded per video. No gameplay or save changes are made by this story revision.

## Entrance and progress

The entrance must ask **איפה נטייל היום?** and offer **עולם הפלאים** and **היער הלוחש**, with distinct artwork. The names describe destinations; neither is described to children as an older/newer version.

Keep existing profiles and the current destination’s progress. The new journey needs independent progress and a forest-character choice for each profile and language track; it must not overwrite the existing character selection or completion state. This is a future implementation requirement, not a save change made here. New destination: choose a forest friend on first visit, then continue its map. Provide a clear way back to destination selection.

## Agreed character concepts

### נבט / Nevet — The curious friend

Pronounced **Nevet**, like a sprout. Use this spelling in all future production prompts.

A small round moss creature with two broad leaf ears, an earthy green body and a cream face. Simple, readable silhouette.

First to investigate; pauses and listens when a friend needs help. Signature gesture: Tilts both leaf ears toward a sound, then offers an open hand.

### אדוה — The playful friend

A small rounded river creature with scalloped side fins, a slate-blue body and pale belly. Stays on the ground during gameplay.

Tries things enthusiastically; turns small surprises into shared laughter. Signature gesture: Bounces once, splashes a toe, then looks back to invite the others.

### זוהר — The thoughtful friend

A small rounded woodland creature with an amber belly patch and three simple light spots. Warm ochre, short limbs, no elaborate costume.

Notices what another creature is trying to communicate. Signature gesture: Looks from a friend to an object, checks with a questioning chirp, then offers it.

All three are equally capable; choice does not change difficulty or learning rewards. Use these character identities and personalities consistently. Final reference artwork remains a production task, not a reason to restart story development. The recurring supporting cast is exactly one stream/river resident (river-resident), one village courier who later hosts the friends in its root workshop (root-host) and one cave traveler (cave-traveler). A complete video includes the fixed trio, but an individual shot may use a close-up of fewer characters. Do not generate a large cast of one-off creatures.


The village courier is a small chestnut dormouse with a cream muzzle, teal cross-body satchel and wooden two-wheel parcel cart. It is the same root-host at the workshop and finale, not an additional guest.

## Read this first, implementing agents

- Implement this story, not the original owl storyboard. Do not invent another plot, guardian, collectible system or personalized video pipeline.
- Preserve every existing image, prompt and earlier story artifact. Asset preservation is explicitly requested; do not delete or regenerate owl art to make the folder match the revised ending.
- This specification authorizes concrete implementation planning, not an unbounded batch of paid media generations. Honor the user's subsequent implementation and production instructions; do not ask them to reapprove the settled story.
- The storybook and its HTML presentation are planning artifacts. This update does not claim that destination routing, progress isolation, characters or videos have been implemented in the game.
- Follow repository branch, versioning and PR policy for future feature implementation. Keep unrelated work intact.

## Story rules that must survive implementation

The forest's magical response follows an act of understanding: a request is understood, a friend is helped, a route or gathering place comes to life. Music is the emotional reward, not a second invented language to memorize. All real vocabulary instruction stays in the selected English or Hebrew activity track.

Keep the existing activity contracts as implemented in the active runtime. On review, prototype/shared/trail-catalog.mjs specifies spoken-hebrew with semantic-image choices, and the current activities use Hebrew recordings. The reading-only description in docs/LEARNING_MODEL.md is stale relative to that code; do not reintroduce it as part of this story work. Do not introduce microphone scoring, pronunciation gates or translating fictional creature sounds. Let the child succeed with the existing assistance and corrections.

One video master per milestone contains the fixed group Nevet, Adva and Zohar. All players and both learning tracks receive that same master. Gameplay character selection never changes which video is rendered. All three are equally capable. User-interface controls may be localized; the video file itself has no words, narration, burned-in subtitles, labels, lyrics or readable signs. The player adds short localized story captions in Hebrew or English, one simple sentence per shot, independently of the shared media.

## Final-act continuity lock

Videos 6–9 use the same tree hall, three low tables and three hanging blossoms. Video 6 establishes the hall empty. Video 7 brings the three recurring guests. Video 8 shows two places ready and the last still being prepared. Video 9 starts after the final gameplay action, completes the gathering, opens the canopy and shows the restored connections. Do not repeat a specific final placement in video 9: gameplay may finish on a different supported request. This avoids implying a wrong object or answer.

The finale is stages 34 / Memory, 35 / Shop, 36 / Magic House, with video 8 between Shop and House. These are the final three normal stages, not three new subgames packed into stage 36. Stages 31–33 prepare the same gathering. Use practiced content, no timer and no perfect-score condition. The final reveal is a luminous garden and reunited friends; preserve the owl reference images without making an owl ride the ending.

## Nine production video scripts

Stable IDs below are independent of the selected character or language. Target edited runtime: 126 seconds in 21 shots. Six seconds per shot is an editorial target; select native model durations after the pilot. Opening draft exists; later production must follow the revised scripts.

### forest-video-01 — A request we don’t yet understand / מה החבר מבקש?

**Trigger:** Before stage 1. **Target:** 18 seconds. **Feeling:** Curiosity.

**Shot 1 / 6s**

- See: At a quiet stream, a small forest resident holds out an empty basket and makes a hopeful gesture. The three friends look from the basket to the resident, curious.
- Hear: Running water. A questioning chirp. A warm answering hum.

**Shot 2 / 6s**

- See: The friends kneel beside the resident. One notices a faint trail of light in the roots; all three look toward it together.
- Hear: Three little notes, each with a different timbre. Soft leaf rustle.

**Shot 3 / 6s**

- See: The trail leads toward an immense tree across the valley. Most of its canopy is quiet, but one warm window glows. The resident invites the friends onto the path.
- Hear: The three notes receive a distant, incomplete musical answer.

**Learning connection:** Stages 1–5: recognize familiar animals and objects, connect words to meaning, and fulfill simple requests using the existing three activities. Suggested known vocabulary: rabbit, apple, water, cup.

**Lasting change:** The player has someone to help and a destination to discover. The first five activities are small acts of understanding.

**Anticipation:** What is that little friend trying to tell us?

**Production constraint:** Establish cast and tree once. No readable signs, burned-in subtitles or speech in the video file. The player may add short story captions in the chosen language.

### forest-video-02 — The village behind the waterfall / הכפר שמאחורי המפל

**Trigger:** After stage 5. **Target:** 18 seconds. **Feeling:** Discovery → comedy → a new mission.

**Shot 1 / 6s**

- See: Keep the gift brief: Zohar offers the filled basket; the river resident recognizes the supplies. Light runs from the basket through the roots toward a curtain of leaves. The resident pulls it aside, revealing the entrance to a new place.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: A wide reveal opens onto a village built among enormous roots: little bridges, warm round windows and seed-shaped lifts. Nevet, Adva and Zohar enter along the lower path, small against the inviting architecture. One seed lift glides upward, making the place feel alive.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 3 / 6s**

- See: At a fork beside the village entrance, a small dormouse courier pulls a wooden parcel cart to a stop. It looks down one path, then the other, checks the parcels and makes an exaggerated puzzled face. Adva starts to point one way, pauses, and looks back at the others. They gather around the cart to help; do not reveal the correct route.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Payoff for stages 1–5: understanding the resident’s request opens the village route. Stages 6–10 identify familiar food and objects requested for the courier’s deliveries through the existing Memory, single-item Shop and House activities. Routes and parcel delivery are story framing, not a new navigation or address-reading task; no early quantity/color modes.

**Lasting change:** The hidden root village becomes visible and accessible. The courier joins the ongoing story with a concrete delivery problem.

**Anticipation:** What does each neighbor need—and how can we help the courier?

**Production constraint:** Three six-second editorial shots. Reuse the gift image only as reference; the former two-shot garden-only video-02 plan is superseded. Introduce one courier, reusing root-host identity. No crowds or readable parcel labels. Approve scene keyframes before video generation.

### forest-video-03 — The bridge wakes up / הגשר מתעורר

**Trigger:** After stage 10. **Target:** 12 seconds. **Feeling:** Payoff → movement → delight.

**Shot 1 / 6s**

- See: The courier delivers the final prepared parcel to a root-door hatch. The pictured recipient stays offscreen: a small thank-you lantern lights above the doorway. A chain of warm windows lights across the village toward the river; the friends and courier follow it with their eyes.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: The river resident unfolds broad lily leaves into a safe bridge between two root platforms. The courier rolls the now-empty cart across with the trio. One wheel makes a gentle comic bounce; Adva steadies the cart. Across the river, the courier’s cozy workshop door opens.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Payoff for stages 6–10: matching requested objects lets the courier finish deliveries and wakes the crossing. Stages 11–15 help put familiar household objects in their supported places inside the courier’s workshop. Cinematic deliveries do not add new gameplay systems.

**Lasting change:** Deliveries reconnect the village and open a permanent river crossing to the workshop.

**Anticipation:** What has the courier been keeping in that workshop?

**Production constraint:** One delivery detail shot and one bridge shot; no extra voiced villagers, dangerous crossing or precision-jump challenge.

### forest-video-04 — The map inside the workshop / המפה שבסדנה

**Trigger:** After stage 15. **Target:** 12 seconds. **Feeling:** Comedy → revelation → purpose.

**Shot 1 / 6s**

- See: Inside the courier’s root workshop, the objects prepared in gameplay are now in place. The courier parks the cart, hangs up its teal satchel and pulls a broad rolled picture map from a shelf. The roll gently unfurls past Adva’s feet; Adva steps over it with an amused wobble.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: The picture map shows river, village and cave routes meeting at the great tree. Two routes glow; the cave route remains dim. The courier opens a window toward a distant crystal ridge and offers the trio a travel lantern. They gather beside the window, seeing where to go next.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Payoff for stages 11–15: understanding object placements restores the working room and makes the old route map accessible. Familiar words include book, cup, chair and lamp, using supported destinations. Stages 16–20 prepare travel supplies for the crystal route.

**Lasting change:** The courier becomes our host. The friends discover why the tree matters and where the missing connection lies.

**Anticipation:** Who is waiting beyond the crystal ridge?

**Production constraint:** The courier and root-host are the same character. Picture map only; no invented alphabet or readable navigation test.

### forest-video-05 — A light across the crystal water / אור מעבר למים

**Trigger:** After stage 20. **Target:** 12 seconds. **Feeling:** Exploration → surprise → connection.

**Shot 1 / 6s**

- See: In a spacious moonlit crystal cavern, the travel lantern catches a distant answering light across shallow water. What looked like a moving reflection resolves into a small cave traveler on a broad root platform, trying to bring a folded lantern frame toward the tree. The friends lift their supplies in recognition.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: Using the supplies already prepared in gameplay, the traveler swings a wide stable root gangway into place. Its light reveals a huge carved doorway in the great tree’s roots. The trio joins the traveler at the newly connected platform; the doorway begins to glow.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Payoff for stages 16–20: understanding travel-supply requests equips the group to reconnect the crystal route. Familiar vocabulary only; use catalog IDs. The gangway opens in the video and is not a new construction puzzle. Stages 21–25 prepare the great tree meeting place.

**Lasting change:** The third community is reachable and the entrance to the great tree is found.

**Anticipation:** What is behind that enormous door?

**Production constraint:** One new recurring cave traveler; safe moonlight, shallow water, broad paths. No monster silhouette or peril.

### forest-video-06 — The tree opens its doors / העץ פותח את הדלתות

**Trigger:** After stage 25. **Target:** 12 seconds. **Feeling:** Arrival → awe → a plan.

**Shot 1 / 6s**

- See: The glowing root doorway opens into an immense garden hall. The camera travels just inside to reveal three low tables beneath three closed hanging blossoms, with a picture mosaic of the forest communities together. The friends stand small in the doorway, then step into the hall.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: As the prepared room comes to life, three root channels light outward from the hall toward river, village and cave. The courier’s small picture invitations ride gently outward in seed-shaped carriers. The friends watch the invitations leave and turn toward the empty tables.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Payoff for stages 21–25: understanding placements restores a usable meeting place and reconnects its invitation routes. Stages 26–30 practice requests needed to help the three guests prepare for the gathering. Seed carriers are cinematic, not an added collectible system.

**Lasting change:** The destination is reached. The hall can now reach the communities we helped.

**Anticipation:** Will our friends come?

**Production constraint:** Lock one hall, three tables and three blossoms for videos 6–9. The courier’s invitations have pictures only. No fourth supporting character.

### forest-video-07 — All paths lead here / כל השבילים נפגשים

**Trigger:** After stage 30. **Target:** 12 seconds. **Feeling:** Reunion → anticipation.

**Shot 1 / 6s**

- See: At the tree entrance, the river resident arrives from the newly opened crossing, the courier rolls in its cart, and the cave traveler carries the folded lantern frame. The trio welcomes the three familiar guests as their separate routes meet beneath the doorway.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: Inside the same hall, the traveler unfolds the frame into a hanging lantern above the tables while the courier unloads the supplies. Two blossoms stir but remain closed. An incomplete third place is visibly waiting; the group notices the gap and gets ready to help.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Stages 31–33 rehearse familiar vocabulary for the gathering. Stages 34–36 form the final challenge using the existing Memory → Shop → House order. No unintroduced vocabulary in the finale.

**Lasting change:** The restored routes now bring real friends together. The final activities complete a shared event instead of another isolated errand.

**Anticipation:** The hall is waking up. What will happen when everyone has a place?

**Production constraint:** Use a small recurring supporting cast, not a newly generated crowd. Keep all three selectable friends part of the same shared video.

### forest-video-08 — The last light / האור האחרון

**Trigger:** After stage 35. **Target:** 12 seconds. **Feeling:** Visible progress → calm suspense.

**Shot 1 / 6s**

- See: Two prepared tables now sit beneath two open blossoms. Their light travels up the trunk and lifts two sections of the canopy, revealing a glimpse of the sky garden above. The third section remains closed over the unfinished place.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Shot 2 / 6s**

- See: The courier and cave traveler help the river resident settle near the third table. Nevet, Adva and Zohar turn toward the remaining supplies. A soft thread of light stops at the unfinished space; hold the anticipation without placing any item or showing the pending answer.
- Hear: Separate sound pass: environmental movement and instrumental music only; no generated creature speech.

**Learning connection:** Stages 34 and 35 have matched meanings and fulfilled requests. Stage 36 is the final Magic House activity: arrange familiar objects using supported placement instructions. The video does not show the solution or read the prompt aloud.

**Lasting change:** The child can see two parts of the final transformation already working. One familiar activity remains before the full reveal.

**Anticipation:** One more place to finish—then the whole canopy can open.

**Production constraint:** Same tree hall. Avoid a new boss minigame or a three-game bundle inside stage 36.

### forest-video-09 — The forest understands / היער שוב שר

**Trigger:** After stage 36. **Target:** 18 seconds. **Feeling:** Joy + pride.

**Shot 1 / 6s**

- See: Begin after the final gameplay placement, with no repeated object-placement shot. The final guest settles into the completed place and gives the friends a grateful gesture. The third hanging blossom opens.
- Hear: A rising instrumental flourish. The missing musical phrase completes.

**Shot 2 / 6s**

- See: Warm light travels from all three blossoms up the trunk. The canopy slowly unfolds into a luminous garden overhead. The same three playable friends and three returning guests look up together as their musical voices join.
- Hear: A wordless musical chorus built from the familiar character sounds. Warm, moderate volume.

**Shot 3 / 6s**

- See: A gentle camera rise reveals the root village, moving seed lifts, lily crossing and crystal route from the tree balcony. Warm paths now connect the places visited throughout the journey. Return to the trio and the river resident, courier and cave traveler sharing the gathering; hold the reunited group.
- Hear: The forest theme resolves. Leaves, water and soft ambient movement remain.

**Learning connection:** A complete payoff: understanding words helped us understand needs, help friends and bring a community together. The language work caused the celebration.

**Lasting change:** The restored map and unlocked video album remain. Favorite learning activities can be revisited without requiring another quest.

**Anticipation:** Look what we helped make happen.

**Production constraint:** Keep the existing owl and flight illustrations intact as references. Render the reunion and opening-canopy ending described here; do not let an older illustration replace the final script.

## Destination and progress behavior

1. Entrance: **איפה נטייל היום?** with **עולם הפלאים** and **היער הלוחש**, each represented by its own artwork. Do not use Bubbles, legacy/new, version numbers or migration language in the destination names.
2. Preserve the existing experience, profiles, character choices and saves. Add independent forest progress and forest character selection scoped to profile and learning track. Do not reset or copy existing stars into the forest journey.
3. First forest visit: choose a forest friend, start the opening video on a user action, then enter the route. Returning visits continue the route. Provide a return to destination selection.
4. Preserve the 36-stage sequence and Memory → Shop → House rotation. Author the forest's content pools against the inspected catalogs rather than assuming today's chapter pools satisfy this story. Five-stage story milestones deliberately cross six-stage curriculum chapters.
5. Treat newly completed route stages as the unlock condition. Replaying a completed activity, changing characters or refreshing must not create another milestone or unlock a new video.
6. Completion awards and progress save before the milestone video is presented. A video cannot revoke a completed stage. Record unlocked and presented/skipped state separately per journey track; commit presentation state on natural completion or explicit skip.
7. If the page closes during playback, keep the milestone unlocked and offer replay or continue on return. Do not force repeated playback. An album lists unlocked videos in story order; replay changes no stage progress.
8. Give videos skip, pause/resume, mute and replay controls; support keyboard and touch, including Escape to leave playback. Pause activity input and educational audio during video playback. Resume the correct map or next activity afterward.
9. Playback is initiated by a user gesture. Never assume browsers will autoplay audible video. If a file fails to load, show retry and continue controls, retain completed progress, and leave the unlocked video in the album. Do not synthesize replacement dialogue or substitute another story scene.
10. Final completion unlocks the ending and leaves the restored world explorable. There is no mandatory sequel prompt, deadline or loss condition attached to watching it.

## Asset reuse and production manifest

| Asset family | Decision | Implementer constraint |
|---|---|---|
| Existing destination | Keep | Current map, princess/dinosaur/puppy/unicorn, learning art, audio and progress stay intact. |
| Shared learning content | Reuse | Preserve vocabulary pictures, recordings and activity logic. Changes to word pools must use actual catalog IDs. |
| Forest cast | Create once | Three identities; approved reference sheets drive both gameplay art and video. Discover the required idle/walk/celebrate assets before ordering frames. |
| Forest visual shell | Adapt selectively | Destination card, map and a small number of activity backgrounds. Match simple character anatomy across gameplay and video. No blanket item repaint. |
| Videos | Generate | Nine shared masters, stable IDs forest-video-01 through forest-video-09. Record source shots, reference artwork, exact prompts, model, settings, revisions and actual charges. |
| Sound | Reuse/produce consistently | Nonverbal motifs for recurring characters; ambience and music. Generated sound can be retained or edited separately. Review for accidental words and abrupt volume changes. |
| Existing nine concept images | Preserve all | Reference folder remains untouched, including owl and flight illustrations. They are not approved final character references. |

The earlier forest illustrations live in [visual-explainer/forest-song/assets](visual-explainer/forest-song/assets). In particular, keep 06-guardian.png, 07-three-lights.png, 08-awakening.png and 09-first-flight.png and their JPG companions. Use their lighting, scale and atmosphere as references; scripts above determine the revised final act. Do not regenerate these merely to make the storybook's pictures match.

Video delivery is a separate media pipeline from the original single-file game bundle. Measure file size and loading behavior before choosing packaging. Keep approved source masters separate from playback encodes. Do not promise offline video playback until explicit download/cache behavior has been implemented and tested. The HTML storybook itself remains self-contained and offline-readable.

## Production sequence and spending control

1. Story is final for implementation. Prepare reference art for one cast member, validate its gameplay readability, then complete the remaining shared cast references. Reuse existing environment art wherever suitable.
2. Before running a paid pilot, identify the current video provider/model, supported reference workflow and a bounded cost/attempt limit. Price research and model selection are production tasks; this brief does not assert a current winner or price.
3. Generate one pilot: video 2, shot 1, recognition after a basket handoff. Judge identity, clear nonverbal meaning, object continuity, inviting movement and audio without unwanted speech. Simplify the shot if needed rather than multiplying attempts without a limit.
4. Report actual pilot cost including rejected attempts. Agree the remaining production scope and spending ceiling before the full batch. One shared master serves both languages and all characters: nine videos total, not 54 variants.
5. Generate the remaining shots, assemble the videos and review continuity. Scene-specific handoffs to the activity must remain clear without subtitles. Capture exact prompts and asset provenance.
6. Integrate only approved masters. Wire the milestone/album behavior and validate learning-route state independently of media playback. Prototype wiring may use explicitly labeled reference stills; do not present those as final generated videos or replace the agreed video medium with manual animation.

## Implementation handoff by work area

- **Experience entry and saves:** implement two destination choices and independent forest state while proving existing profiles and progress remain intact.
- **Learning route:** map each interval's helping task to supported content pools and requests; retain the 36-stage order and language contracts. Use actual request targets such as book → shelf, book → table and apple → table. The story's vocabulary examples are inputs to content authoring, not claims that all current recipes already include them.
- **Character and environment art:** inventory reuse, produce shared character references and only required gameplay assets. Keep all existing imagery.
- **Video and sound production:** follow the nine shot scripts, fixed cast, recurring locations and pilot budget sequence.
- **Video integration:** implement user-initiated playback, progression triggers, skip/replay and the album, with progress independent of media delivery.

These are work boundaries, not instructions to spawn agents, create tasks or start paid generations automatically.

## Acceptance criteria

- All nine milestone IDs match opening, 5, 10, 15, 20, 25, 30, 35 and 36. Every script contains visual action, sound, a learning connection and a world consequence.
- A child can follow each video's request/help/reaction without reading or hearing a human language. Adult reviewers can identify what changed and why.
- Both learning tracks and every selected character use the same nine video masters. Video gestures and creature sounds never disclose a pending activity answer.
- Characters in gameplay and videos share approved identity references. No selected-avatar-specific video is generated.
- The final act follows the three-table/blossom continuity and ends with the forest gathering. All original owl artwork still exists unchanged.
- Replays and refreshes do not advance the story; skipping preserves progress; interrupted or failed playback cannot erase completion. Unlocked videos can be replayed from the album.
- Existing destination saves, characters and learning behavior survive entry-screen and route changes.
- Tests cover milestone boundaries, replay idempotence, track separation and interrupted playback. Browser checks cover keyboard/touch controls and audible-playback initiation on supported devices. Preserve applicable repository gates and version/PR policy when implementation occurs.
- No production claim is based only on this document: completed game changes, generated videos, actual costs and live playback checks must each be reported separately.

## Source files and reading order

1. This file is the authoritative implementation storybook.
2. [Structured scripts](visual-explainer/forest-song/storybook-v2.json) are the editable source for scene content; this brief remains authoritative for product and production rules. After scene edits, run `node docs/visual-explainer/forest-song/sync-storybook.mjs --write`, then `--check`, to synchronize the scene section and [readable HTML](visual-explainer/forest-song/index.html).
3. Existing contracts: [learning model](LEARNING_MODEL.md), [saves](GAME_SAVES.md), prototype/shared/trail-recipes.mjs, prototype/shared/vocabulary-catalog.mjs and prototype/shared/magic-house-content.mjs.
4. Original references: visual-explainer/forest-song/index-v1.html, script-v1.json, prompts.json and assets/. Preserve them; they do not override this story.

If an implementation detail conflicts with the inspected runtime, resolve the implementation against the current code without adding compatibility or fallback paths. Ask only if the resolution changes the agreed story, learning contract, cost limit or preservation of existing progress.
