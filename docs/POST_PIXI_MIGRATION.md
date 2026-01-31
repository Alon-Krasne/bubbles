# Post-PixiJS Migration Guide

## Migration Summary

The game has been migrated from pure Canvas 2D API to PixiJS v8. The current architecture uses:

- **PixiJS Application** as the rendering pipeline manager
- **HTML5 Canvas** as the drawing surface (drawn into a Pixi texture)
- **Vite** for development server and production builds
- **Vanilla JavaScript** for game logic (unchanged)

This is a **hybrid approach** - PixiJS handles the rendering infrastructure while your existing Canvas 2D code remains the primary drawing method.

---

## What PixiJS Gives You

### 1. **Better Presentation Layer (Current Hybrid)**

PixiJS now owns the render loop and presents a single canvas texture. That gives you:

- **WebGL compositing** - The final frame is drawn by the GPU
- **Crisp scaling** - High-DPI support via the Pixi renderer
- **Cleaner lifecycle** - Resize + render loop handled by Pixi

Note: the actual game drawing still happens in Canvas 2D, so per-object performance is still CPU-bound until you migrate objects to Pixi display objects.

### 2. **Simplified Resize Handling**

```javascript
// Before: Manual resize calculations
// After: Pixi handles it automatically
const app = new PIXI.Application();
await app.init({
    resizeTo: container,  // Auto-resizes to container
    antialias: true
});
```

### 3. **Built-in Texture System**

- Load and cache images efficiently
- Create sprites from textures
- Apply filters and effects to textures
- Texture atlases for better performance

### 4. **Advanced Effects (Now Possible)**

With PixiJS, you can add effects once objects are Pixi sprites (or apply a full-canvas filter to the hybrid sprite):

- **Glow/bloom effects** on caught bubbles
- **Blur effects** for background depth
- **Color matrix filters** for theme transitions
- **Displacement maps** for water/liquid effects
- **Particle containers** for 10,000+ particles

### 5. **Better Asset Management**

```javascript
// Load and manage game assets
await PIXI.Assets.load([
    'assets/unicorn.png',
    'assets/themes/castle.jpg'
]);
```

### 6. **Scene Graph & Container Hierarchy**

Organize your game into layers:

```javascript
const backgroundLayer = new PIXI.Container();
const gameLayer = new PIXI.Container();
const uiLayer = new PIXI.Container();

app.stage.addChild(backgroundLayer);
app.stage.addChild(gameLayer);
app.stage.addChild(uiLayer);
```

---

## Current Hybrid Limits

- **Canvas 2D is still the renderer** - Pixi does not yet draw individual bubbles/characters
- **Filters are global** - A Pixi filter applies to the full canvas sprite, not individual objects
- **Performance gains are limited** - Uploading a full canvas each frame still costs CPU + GPU bandwidth

---

## What You Can Do Now

These are easiest once you start moving specific layers (background, bubbles, particles) to Pixi display objects. In the current hybrid mode, full-canvas effects are possible, but per-object effects require migration.

### Immediate Improvements

1. **Add Visual Filters**
   - Full-canvas glow or blur for quick polish
   - Per-object glow once bubbles become Pixi sprites
   - Color adjustment for night mode

2. **Particle System Upgrade**
   - Replace custom particle pool with Pixi ParticleContainer
   - Support thousands of particles
   - Add particle textures (sparkles, stars, hearts)

3. **Sprite-based Characters**
   - Convert blob characters to Pixi Sprites
   - Add bone-based animation (Spine/DragonBones)
   - Swap textures for different figures

4. **Animated Backgrounds**
   - Parallax scrolling layers
   - Animated GIF/video backgrounds
   - Shader-based sky effects

### Advanced Features

1. **Lighting System**
   - Dynamic shadows
   - Light sources (sun, lanterns)
   - Normal maps for 3D-like depth

2. **Post-Processing Effects**
   - Screen shake on bubble catch
   - Chromatic aberration
   - Vignette for focus

3. **Spine/DragonBones Animation**
   - Smooth character animations
   - Procedural movement
   - Animated figure images

4. **Physics Integration**
   - Matter.js or Planck.js for realistic bubble physics
   - Collision detection
   - Wind effects

---

## Migration Path Options

### Option 1: Keep Current Hybrid Approach (Recommended for Now)

**Pros:**
- Minimal code changes
- Existing Canvas 2D code works
- Easy to maintain

**Cons:**
- Not using full PixiJS potential
- Some manual texture updates needed

**Best for:** Stability, incremental improvements

### Option 2: Gradual Migration to Pure PixiJS

Migrate components one at a time:

1. **Background** → Pixi Graphics + Sprites
2. **Bubbles** → Pixi Sprites with filters
3. **Characters** → Animated Sprites
4. **Particles** → ParticleContainer
5. **UI** → Pixi Text + Graphics

**Pros:**
- Full WebGL performance
- Access to all PixiJS features
- Better mobile performance

**Cons:**
- More refactoring needed
- Learning curve

**Best for:** Long-term, feature-rich game

### Option 3: Add Selective PixiJS Features

Keep Canvas 2D for most things, use PixiJS for:

- Particle effects (ParticleContainer)
- Post-processing filters
- Complex animations
- Asset loading

**Pros:**
- Best of both worlds
- Targeted improvements
- Lower risk

**Cons:**
- Two rendering systems to maintain
- Potential complexity

**Best for:** Specific feature additions

---

## Quick Wins You Can Implement Today

These examples assume you are using Pixi display objects. In hybrid mode, apply filters to the full canvas sprite unless you migrate individual game elements.

### 1. Add a Glow Effect on Bubble Catch

```javascript
import { GlowFilter } from 'pixi-filters';

// Requires: bun add pixi-filters
// When bubble is caught (Pixi sprite):
const glow = new GlowFilter({
    distance: 15,
    outerStrength: 2,
    color: 0xFFD700
});
sprite.filters = [glow];
```

### 2. Use Pixi ParticleContainer for Sparkles

```javascript
const particleContainer = new PIXI.ParticleContainer(1000, {
    position: true,
    rotation: true,
    alpha: true
});

// Add thousands of particles with minimal performance cost
// Requires particles to be Pixi sprites, not Canvas 2D draws
```

### 3. Smooth Theme Transitions

```javascript
// Fade between themes using Pixi alpha
const themeSprite = new PIXI.Sprite(themeTexture);
themeSprite.alpha = 0;

// Animate transition
themeSprite.alpha += 0.05;
```

### 4. Better Image Loading

```javascript
// Replace manual Image() loading:
const texture = await PIXI.Assets.load('assets/unicorn.png');
const sprite = new PIXI.Sprite(texture);
```

---

## Performance Notes

- Hybrid mode does not reduce Canvas 2D draw cost; it only changes how the final frame is presented
- Uploading a full canvas to the GPU each frame has a cost that grows with resolution
- Real performance gains come from migrating hot paths (bubbles, particles) to Pixi sprites
- Results vary by device and resolution, so measure on target hardware

---

## Next Steps

### Short Term (This Week)

1. ✅ **Test current setup** - Ensure everything works
2. 🎯 **Add one PixiJS feature** - Try glow filter on bubble catch
3. 📊 **Profile performance** - Check FPS on different devices

### Medium Term (This Month)

1. 🎨 **Migrate particles** to ParticleContainer
2. 🌅 **Add transition effects** between themes
3. ✨ **Enhance bubble effects** with filters

### Long Term (Future)

1. 🎭 **Spine animation** for characters
2. 🌊 **Shader backgrounds** for themes
3. 📱 **Touch optimization** using Pixi interaction

---

## Resources

- [PixiJS v8 Documentation](https://pixijs.com/8.x/guides)
- [PixiJS Examples](https://pixijs.com/8.x/examples)
- [Pixi Filters](https://github.com/pixijs/filters) - Glow, blur, color matrix, etc.
- [Pixi Particles](https://github.com/pixijs/particle-emitter) - Advanced particle systems

---

## Summary

The PixiJS migration provides a **solid foundation** for future enhancements. You now have:

- ✅ GPU-backed presentation layer
- ✅ Better resize handling
- ✅ Texture management system
- ✅ Access to advanced effects
- ✅ Room to grow (particles, filters, shaders)

**Recommendation:** Keep the hybrid approach for now, add PixiJS features incrementally, and consider full migration only if you need advanced features like Spine animation or complex shaders.

The game is now **more flexible and future-proof** while keeping your existing code intact.
