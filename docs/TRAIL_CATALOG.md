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
- Magic House keeps object choices within those policies; after an object is selected, English destination labels include a small Hebrew location gloss so room vocabulary cannot block placement. Hebrew destination labels remain Hebrew-only.
- No niqqud in learning material.

## Validation

Run:

```bash
npm run test:trail
```

The test verifies all stage references, vocabulary IDs, request IDs, launch metadata, difficulty ordering, language policies, and the 45-star route total.

## Vocabulary progression

Each word in `src/words.ts` has explicit `difficulty.en` and `difficulty.he` grades: 1 foundational, 2 everyday, 3 extended, 4 specialist or compound vocabulary. These are editorial game grades, not standardized proficiency scores. They consider familiarity and the actual word in each language; for example, `strawberry` is grade 3 in English and `תות` is grade 1 in Hebrew. Regenerate `prototype/shared/vocabulary-catalog.mjs` with `node --experimental-strip-types scripts/generate-vocabulary-catalog.mjs` after editing grades. Generation rejects missing or invalid grades.

The shared `vocabulary-progression.mjs` applies the active learning language and the stage's difficulty rank across both worlds:

| Stages | Available grades for Memory and spoken Shop targets |
| --- | --- |
| 1–6 | 1 |
| 7–12 | 1–2 |
| 13–24 | 1–3 |
| 25–36 | 1–4 |
| 37–60 | 2–4 |
| 61–72 | 3–4 |

Shop shelf distractors may include previously introduced vocabulary; requested words follow the advancing grade floor. All items retain their recorded audio and existing artwork. Reveal and Painter use the same introduction ceilings and retain familiar-word review within their spelling/tracing length constraints. Painter keeps its 13 illustrated words; House keeps its recorded instruction progression.

Word-rotation keys include the effective pool and learning language, so revised grades do not reuse incompatible saved queues. Route stars, stage order, earned stories and other profiles are unchanged. All 333 words remain reachable over the complete 72-stage route in either language. Run `npm run test:vocabulary-progression` to check the actual graded pools, replay variation and coverage; the journey difficulty browser check also exercises early and late boards/orders with old queues present.
