import assert from 'node:assert/strict';

import { getTravellerPosition } from '../prototype/shared/traveller-position.mjs';

const defaultPosition = getTravellerPosition({ id: 5, x: 29, y: 47 });
assert.deepEqual(defaultPosition, { x: 29, y: 47 }, 'ordinary stages anchor the traveller to the stage marker');

const stageSixPosition = getTravellerPosition({ id: 6, x: 40, y: 45 });
assert.deepEqual(stageSixPosition, { x: 40, y: 55 }, 'stage 6 must move the traveller below the route and clear the stage panel');

console.log(JSON.stringify({ defaultPosition, stageSixPosition }));
