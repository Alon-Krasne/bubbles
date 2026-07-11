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
