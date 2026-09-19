# Playable forest journey

The destination chooser at `prototype/world-map.html` opens עולם הפלאים or היער הלוחש. Forest progress, companion and story history are separate per child and learning language. The forest reuses the existing learning route, Memory vocabulary illustrations, Shop product/customer art, Magic House rooms/objects, and recorded language prompts. Companion portraits reuse the approved cast sheet; no new generated artwork or video calls were needed for this integration. Activity guides retain their existing art.

The first playable story segment is the opening video, five learning activities, then video 2. Each child's journey receives a saved arrangement of the 36 challenges within their chapters, with no more than two consecutive stages of one game. The four games appear nine times each, and the order stays the same on return or on another device. The nine shared video masters still play at milestones 0/5/10/15/20/25/30/35/36. Captions initially use the child's learning language; the player supports Hebrew, English and no captions. Children can skip a pending video or replay unlocked stories from the map. The production videos remain the reviewed drafts with their recorded continuity limitations.

Profile changes, new learning languages, and profile deletion must enter the same companion/opening checks as the destination chooser. Resetting or jumping a forest route preserves its companion, reconciles video unlocks, and affects only that destination/language's completed-stage progress. Unfinished activity moves restart if the child leaves or refreshes the game. Resetting to stage 1 makes the opening pending again. Rotating the device centers the active journey's current stage.

## Verification

Run `npm run test:forest` with `agent-browser` installed and port 8788 free. The runner builds the app, starts an isolated in-memory D1 save server, and closes its browser sessions and server afterward. It never accesses production saves.

- `test-forest-entry.mjs`: fresh sibling and learning-language onboarding; forest stage jump and milestone reconciliation; Wonder save isolation; profile deletion without overlapping dialogs.
- `test-forest-chapter.mjs`: plays the real opening, completes the first five shuffled stages through their actual controls, plays video 2, switches captions, replays the opening, and reloads at stage 6. It checks that the child's stage order survives reload. Tests read current activity state to choose answers but do not inject completion messages or alter progress during gameplay.
- `npm run test:destinations`, `node --experimental-strip-types scripts/test-forest-activity-context.mjs`, `npm run test:track`, `npm run test:trail`, `npm run test:shop-session`, `npm run test:saves`, and `npx tsc --noEmit` cover the surrounding contracts.

The browser checks establish the first five-screen segment, not a complete playthrough of all 36 stages. The later milestone contracts have unit coverage. No deployment is part of this change.
