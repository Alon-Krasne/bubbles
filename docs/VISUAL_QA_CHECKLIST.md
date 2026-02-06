# Visual QA Checklist (Next-Level Animation)

## Start Intro
- [ ] Intro plays when game starts
- [ ] Intro can be skipped by any key press
- [ ] Transition from intro to gameplay feels immediate (no lag)
- [ ] No stuck state when starting/stopping quickly

## Dynamic Background
- [ ] Clouds move with visible depth difference
- [ ] Grass sways subtly (not jittery)
- [ ] Ambient particles are visible but not distracting
- [ ] Wind changes feel gradual and natural

## Performance & Quality
- [ ] Dev overlay shows FPS and quality tier
- [ ] Quality tier drops under sustained low FPS
- [ ] No major stutter when particles burst
- [ ] No major stutter during intro sequence

## Controls & Gameplay
- [ ] Keyboard input is responsive during gameplay
- [ ] Skip-intro key does not trigger unwanted gameplay movement
- [ ] Score/timer continue to work normally

## Visual Consistency
- [ ] Effects match kawaii dreamy style
- [ ] No harsh colors or flashing transitions
- [ ] Theme backgrounds still render correctly

## Regression Sweep
- [ ] Start -> End -> Start loop works repeatedly
- [ ] Theme switching still works
- [ ] Bubble catch effects still trigger weather burst
