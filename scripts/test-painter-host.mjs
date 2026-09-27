import assert from 'node:assert/strict';
import { readHostedActivityContext, createHostedActivitySession } from '../src/hostedActivity.ts';
import { TRAIL_STAGES } from '../prototype/shared/trail-catalog.mjs';

const stage = TRAIL_STAGES.find(stage => stage.game === 'painter');
for (const destination of ['wonder', 'forest']) {
  for (const profileLanguage of ['en', 'he']) {
    const params = new URLSearchParams({ host: 'world-map', activity: stage.activity, level: stage.level,
      stage: String(stage.id), profile: 'test-child', profileName: 'ילד', profileEmoji: '🦄',
      profileCharacter: 'unicorn', profileLanguage, destination });
    const sent = [];
    globalThis.window = { location: { search: '?' + params, origin: 'http://localhost' },
      parent: { postMessage: (message, origin) => sent.push({message, origin}) } };
    const context = readHostedActivityContext();
    assert.equal(context.activityId, 'magic-painter');
    assert.equal(context.profileLanguage, profileLanguage);
    assert.equal(context.destination, destination);
    const session = createHostedActivitySession(context);
    assert.throws(() => session.complete(0), /Invalid hosted activity star result/);
    session.complete(3); session.complete(2); session.exit();
    assert.deepEqual(sent, [{ message: { type: 'bubbles.activity.complete', version: 1,
      stageId: stage.id, activityId: stage.activity, levelId: stage.level, profileId: 'test-child', stars: 3 }, origin: 'http://localhost' }]);
    const exit = createHostedActivitySession(context);
    exit.exit(); exit.complete(3);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].message.type, 'bubbles.activity.exit');
    assert.equal('stars' in sent[1].message, false);
    params.set('level', 'missing'); window.location.search = '?' + params;
    assert.throws(() => readHostedActivityContext(), /Invalid hosted activity context/);
  }
}
console.log('PASS: painter host validates both journeys/languages and sends completion or exit exactly once.');
