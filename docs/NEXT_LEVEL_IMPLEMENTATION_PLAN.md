# Next-Level Animation Implementation Plan (Step-by-Step)

This plan breaks execution into PR-sized steps with clear Definition of Done.

## Principles
- Incremental rollout (no big-bang rewrite)
- Keep scope tight per PR
- Validate performance continuously
- Maintain playability at all times

---

## PR1 — Background System Skeleton
### Goal
Establish modular runtime structure for dynamic background systems.

### Tasks
- Add:
  - `src/systems/background/BackgroundSystem.ts`
  - `src/systems/background/CloudLayerSystem.ts`
  - `src/systems/background/GrassSwaySystem.ts`
  - `src/systems/background/AmbientParticleSystem.ts`
  - `src/systems/background/WindController.ts`
- Wire systems into game update/render cycle
- Add dev toggles (enable/disable each subsystem)

### Tests
- Integration: systems initialize and tick in main loop
- Unit: wind controller value evolves within configured bounds

### DoD
- No gameplay regressions
- Systems can be toggled independently
- Build and type-check pass

---

## PR2 — Cloud Parallax v1
### Goal
Add depth via layered clouds.

### Tasks
- 3 cloud layers with differing speed/scale/alpha
- Deterministic spawn config (seeded random optional)
- Smooth despawn/respawn lifecycle

### Tests
- Unit: cloud lifecycle (spawn -> active -> despawn)
- Integration: parallax layers render and move at distinct speeds

### DoD
- Clouds create depth without visual clutter
- No stutter from cloud lifecycle

---

## PR3 — Wind-Driven Grass v1
### Goal
Add ambient organic motion near the ground.

### Tasks
- Implement grass sway model (sine/noise)
- Drive sway from shared `WindController`
- Support tuning config for amplitude/frequency

### Tests
- Unit: sway output remains bounded
- Integration: wind changes affect grass behavior across frames

### DoD
- Grass movement looks smooth and subtle
- Performance impact remains acceptable

---

## PR4 — Ambient Particles v1
### Goal
Add tiny sparkles/pollen to make the world feel magical.

### Tasks
- Particle system using `ParticleContainer`
- Spawn rules influenced by wind
- Particle caps to prevent overload

### Tests
- Unit: particle cap enforcement
- Integration: particles render/update without runaway growth

### DoD
- Visual liveliness improved
- No noticeable frame spikes from particles

---

## PR5 — Start Sequence (Intro State)
### Goal
Deliver a “wow” opening animation before gameplay starts.

### Tasks
- Add explicit `intro` game state
- Build timeline (GSAP): comet/entry effect + reveal
- Transition to `playing` state
- Any key press skips intro

### Tests
- Integration: `intro -> playing` transition is reliable
- Unit: skip handler ends intro immediately and safely

### DoD
- Intro duration ~1.5–3.0s
- Intro is skippable and never blocks play
- Controls work immediately in gameplay

---

## PR6 — Character Motion Polish v1
### Goal
Improve movement responsiveness and feel.

### Tasks
- Add acceleration/deceleration curves
- Add small per-character motion presets
- Tune animation speed relation to movement

### Tests
- Unit: velocity smoothing behavior
- Integration: movement remains responsive under continuous input

### DoD
- Movement feels less robotic
- No input latency regressions

---

## PR7 — Asset Pipeline (AI + Approval)
### Goal
Stabilize content production workflow for animation assets.

### Tasks
- Add source/processed structure:
  - `assets-source/` (raw AI outputs)
  - `src/assets/processed/` (approved game assets)
- Add atlas build script (free-tex-packer-cli)
- Add asset metadata convention (prompt/model/version/approval)
- Document naming format

### Recommended naming format
`type_subject_variant_action_v###`

Example:
`char_blobpink_default_walk_v003`

### Tests
- Integration: atlas generation command succeeds in CI/dev
- Unit: config/schema validation for metadata files (if implemented)

### DoD
- Repeatable asset build flow
- Clear approval boundary between raw and production assets

---

## PR8 — Performance Hardening and Quality Tiers
### Goal
Protect smooth play across browser/laptop variability.

### Tasks
- Add quality tiers: `high`, `medium`, `low`
- Map tier to particle count/cloud count/effect intensity
- Optional dynamic downgrade on sustained high frame-time
- Final tuning pass

### Tests
- Unit: tier config mapping correctness
- Integration: runtime tier switching applies expected limits

### DoD
- Gameplay remains smooth on target environment
- Visual systems degrade gracefully under load

---

## Cross-Cutting Standards per PR
- Keep files under 500 lines (split when needed)
- Prefer early returns and small focused methods
- Add/update tests with meaningful assertions
- Run build + type-check + relevant tests before merge
- Avoid unrelated-file changes in PR

---

## Risks and Fallbacks
1. **Performance regression**
   - Fallback: lower tier defaults, tighter particle/cloud caps
2. **Intro sequence fatigue**
   - Fallback: always skippable, optional once-per-session display
3. **AI asset inconsistency**
   - Fallback: strict approval gate and style checklist
4. **System complexity growth**
   - Fallback: maintain subsystem boundaries and strict PR scope

---

## Definition of Success (Program-Level)
- Background feels alive throughout the round
- Start sequence creates a clear magical first impression
- Controls stay responsive and readable
- Visual upgrades land without destabilizing gameplay
- Pipeline supports adding new content without code bloat
