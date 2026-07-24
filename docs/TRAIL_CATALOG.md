# Trail Catalog

`prototype/shared/trail-catalog.mjs` is the single source of truth for playable game levels and route stages.

## Game level factories

Use the matching factory to define a reusable game configuration:

- `createMemoryLevel`: `pairs`, `wordPool`, visual difficulty, route difficulty rank.
- `createShopLevel`: `customerCount`, `shelfSize`, `mode`, `itemPool`, route difficulty rank.
- `createMagicHouseLevel`: `requestIds`, `requestCount`, `drawerSize`, `maxHelpLevel`, route difficulty rank.

Difficulty ranks run from 1 to 5 and must increase at every appearance of the same game until rank 5; additional championship stages may remain at rank 5. The route is organized into tiers containing Memory Garden, Store, then Magic House. There is no time-pressure knob.

Magic House drawer validation uses the distinct objects required by every possible request selection. A generated level cannot launch with a drawer that is too small for its tasks.

Memory and Store selections use per-profile coverage decks. A replay reshuffles the remaining pool, but a word cannot repeat until the configured pool has been exhausted.

## Add a level

Add the new configuration to the relevant array in `GAME_LEVELS`:

```js
createShopLevel({
  id: 'shop-level-6',
  difficultyRank: 5,
  title: 'הזמנה גדולה',
  subtitle: 'שני פריטים, שמונה קונים',
  icon: '🛒',
  customerCount: 8,
  shelfSize: 8,
  mode: 'double',
  itemPool: ['notebook', 'camera', 'basketball', 'book', 'hat', 'shoe', 'cup', 'calculator'],
})
```

A new mode also requires its behavior in the game implementation. Existing modes can be reused without additional wiring.

## Add a route stage

Add one declaration to `TRAIL_STAGES`. Continue the Memory, Store, Magic House rotation and reuse rank 5 only after all three games have reached it:

```js
createTrailStage({
  id: 16,
  x: 50,
  y: 20,
  game: 'memory',
  level: 'level-15',
  title: 'אתגר אליפות נוסף',
  description: 'עוד סיבוב ממאגר האליפות המשתנה',
})
```

The stage factory derives `activity`, `entry`, game label, and difficulty label. The route, URL validator, game launcher, star total, and sequential unlock flow then use the same generated object. Update the catalog acceptance test's expected stage and star totals when extending the fixed route.

## Language contract

The catalog exposes fixed English and Hebrew policies. Difficulty levels may change challenge size and content, but may not override these rules:

- English: spoken English prompt, semantic image choices, no image on the English answer target.
- Hebrew: written Hebrew prompt and choices, no answer image, and no pre-answer speech.
- No niqqud in learning material.

## Validation

Run:

```bash
npm run test:trail
```

The test verifies all stage references, vocabulary IDs, request IDs, launch metadata, difficulty ordering, language policies, and the 45-star route total.
