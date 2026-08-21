import assert from 'node:assert/strict';

import { calculateMasteryStars, formatStarRating } from '../prototype/shared/activity-scoring.mjs';

assert.equal(
  calculateMasteryStars({ mistakes: 0, challengeSize: 6 }),
  3,
  'help must never reduce a mistake-free score',
);
assert.equal(
  calculateMasteryStars({ mistakes: 3, challengeSize: 6 }),
  3,
  'a child may make mistakes on up to half the challenges and still earn three stars',
);
assert.equal(
  calculateMasteryStars({ mistakes: 4, challengeSize: 6 }),
  2,
  'mistakes beyond the forgiving three-star allowance reduce the score by one star',
);
assert.equal(
  calculateMasteryStars({ mistakes: 13, challengeSize: 6 }),
  1,
  'very high mistake counts still complete the activity with one star',
);
assert.equal(formatStarRating(3), '★★★', 'three stars must show all three filled slots');
assert.equal(formatStarRating(2), '★★☆', 'two stars must show one empty slot');
assert.equal(formatStarRating(1), '★☆☆', 'one star must show two empty slots');

console.log(JSON.stringify({ threeStarMistakeAllowance: 3, twoStarDisplay: formatStarRating(2) }));
