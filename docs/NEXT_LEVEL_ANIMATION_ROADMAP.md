# Next-Level Animation Roadmap (General Plan)

## Goal
Upgrade בועות! visual quality to feel more magical and modern (2D), with emphasis on:
1. Live, dynamic background
2. High-impact game start animation moment
3. Smooth character movement polish

Constraints:
- Keep keyboard-first gameplay (desktop/laptop)
- Keep Pixi.js engine
- Favor free/open-source tooling
- AI asset generation is allowed, with manual approval
- Smooth experience is prioritized over strict 60 FPS enforcement

---

## Milestone M1 — Foundations for a Live World
### Objective
Create architecture and tooling foundations for dynamic visuals.

### Scope
- Background systems module structure
- Update/render separation for systems
- Dev toggles for systems
- Lightweight performance telemetry (dev only)

### Deliverables
- `BackgroundSystem` and subsystem interfaces
- Feature flags/toggles for visual layers
- Dev perf overlay (fps + frame-time + active particles)

---

## Milestone M2 — Live Background v1 (Core Magic)
### Objective
Make the world feel alive throughout gameplay with subtle, continuous motion.

### Scope
- Multi-layer cloud parallax
- Wind-driven grass sway
- Ambient sparkle/pollen particles
- Global wind controller with gentle drift over time

### Design Principle
“Breathing world” during matches: subtle movement, no dramatic scene shifts.

---

## Milestone M3 — Start Sequence WOW Moment
### Objective
Add a short, delightful intro animation when players begin.

### Scope
- Intro state (`intro`) before gameplay
- Timeline-driven animation (comet landing / magical entry)
- Smooth transition into gameplay
- Skip intro on key press

### UX Rules
- Duration target: ~1.5–3.0s
- Never block repeated play (must be skippable)

---

## Milestone M4 — Character Motion Polish v1
### Objective
Improve movement feel with minimal complexity.

### Scope
- Acceleration/deceleration curves
- Small per-character movement “personality” presets
- Preserve current animation assets and state setup
- No facial-state system in this phase

---

## Milestone M5 — FX and Performance Hardening
### Objective
Ensure visuals remain smooth on target laptops/browsers.

### Scope
- Effect intensity caps
- Quality tiers (`high`, `medium`, `low`)
- Dynamic fallback based on frame-time
- Final tuning for smoothness

---

## Optional Milestone M6 — Advanced Effects (Later)
### Objective
Explore premium effects after v1 is stable.

### Candidates
- Signature shaders (sky shimmer, magical distortion)
- Runtime animation tools (Spine / Rive) only if needed

---

## Tooling Strategy
### Adopt now
- Pixi.js (existing)
- GSAP (timeline/easing for intro and polish)
- free-tex-packer-cli (atlas pipeline)
- ffmpeg/scripts for AI sequence processing
- Optional open-source art tools (Krita, LibreSprite/Piskel)

### Consider later
- Spine / Rive (advanced runtime animation workflows)
- Custom shader-heavy pipeline (only after profiling)

---

## Engine Strategy
- **Decision:** stay on Pixi.js
- Rationale:
  - No migration risk
  - Strong for 2D rendering and effects
  - Supports incremental visual upgrades

---

## Success Criteria
- Background consistently feels alive without distraction
- Start sequence is delightful and fast
- Controls remain responsive and clear
- Visual quality improves significantly with stable performance
- Architecture supports future content expansion
