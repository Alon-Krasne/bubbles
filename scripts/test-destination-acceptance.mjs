import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { createInterface } from 'node:readline';

const browser = (...args) => execFileSync('agent-browser', ['--session', 'destination-test', ...args], {
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'pipe'],
});

const cwd = new URL('../', import.meta.url);
const server = spawn(process.execPath, ['scripts/serve-save-test.mjs'], {
  cwd, stdio: ['ignore', 'pipe', 'inherit'],
});
const lines = createInterface({ input: server.stdout });

try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.once('exit', (code, signal) => reject(new Error(`Server exited: ${signal ?? code}`)));
    lines.on('line', line => {
      if (line.includes('Local D1 browser acceptance: http://127.0.0.1:8788')) resolve();
    });
  });

  browser('open', 'http://127.0.0.1:8788/prototype/world-map.html');
  browser('wait', '#destination-gate');

  // 1. Verify Destination Gate is displayed
  const gateVisible = browser('eval', '(!document.getElementById("destination-gate").hidden)');
  console.log('Destination Gate visible:', gateVisible.trim());
  if (!gateVisible.includes('true')) throw new Error('Destination gate should be visible on startup');

  const title = browser('eval', 'document.querySelector(".destination-heading h1").textContent');
  console.log('Gate title:', title.trim());
  if (!title.includes('איפה נטייל היום?')) throw new Error('Unexpected gate title');

  // 2. Verify both destination cards exist
  const wonderTitle = browser('eval', 'document.querySelector("#destination-card-wonder h2").textContent');
  const forestTitle = browser('eval', 'document.querySelector("#destination-card-forest h2").textContent');
  console.log('Cards:', wonderTitle.trim(), 'and', forestTitle.trim());
  if (!wonderTitle.includes('עולם הפלאים') || !forestTitle.includes('היער הלוחש')) {
    throw new Error('Cards title mismatch');
  }

  // 3. Click Wonder World -> enters Wonder World map
  browser('click', '#destination-card-wonder');
  browser('wait', '.world-stage');
  const worldTitle = browser('eval', 'document.querySelector(".world-title strong").textContent');
  console.log('World Title after Wonder click:', worldTitle.trim());
  if (!worldTitle.includes('עולם הפלאים')) throw new Error('Expected עולם הפלאים');

  // 4. Return to destination selector
  browser('click', '#destinations-nav-button');
  browser('wait', '#destination-gate:not([hidden])');
  console.log('Returned to destination selector successfully.');

  // 5. Click Forest World -> opens companion picker because no companion chosen yet
  browser('click', '#destination-card-forest');
  browser('wait', '#forest-character-picker:not([hidden])');
  const pickerTitle = browser('eval', 'document.querySelector("#forest-picker-title").textContent');
  console.log('Companion picker title:', pickerTitle.trim());
  if (!pickerTitle.includes('מי החבר שמצטרף למסע ביער?')) throw new Error('Expected companion picker');

  // 6. Choose Nabat
  browser('click', '[data-character="nabat"]');
  browser('wait', '.world-stage');

  const forestWorldTitle = browser('eval', 'document.querySelector(".world-title strong").textContent');
  const forestJourneyLabel = browser('eval', 'document.getElementById("journey-label").textContent');
  console.log('Forest World:', forestWorldTitle.trim(), '| Journey:', forestJourneyLabel.trim());
  if (!forestWorldTitle.includes('היער הלוחש')) throw new Error('Expected היער הלוחש');
  if (!forestJourneyLabel.includes('נבט')) throw new Error('Expected Nabat in journey label');

  // 6b. Opening milestone theater plays on first forest entry
  browser('wait', '#forest-milestone-dialog:not([hidden])');
  const milestoneVideoSrc = browser('eval', 'document.getElementById("forest-milestone-video").getAttribute("src")');
  console.log('Milestone video src:', milestoneVideoSrc.trim());
  if (!milestoneVideoSrc.includes('forest-video-01.mp4')) throw new Error('Expected opening forest video');
  // The .mp4 is not generated yet, so force the missing-file path and check the poster fallback.
  browser('eval', 'document.getElementById("forest-milestone-video").dispatchEvent(new Event("error"))');
  const posterState = browser('eval', 'JSON.stringify({hidden: document.getElementById("forest-milestone-poster").hidden, src: document.getElementById("forest-milestone-poster").getAttribute("src")})');
  console.log('Poster fallback:', posterState.trim());
  if (!posterState.includes('forest-video-01.jpg') || posterState.includes('"hidden":true')) {
    throw new Error('Expected poster fallback for the missing video');
  }

  // 6c. Continuing marks the video seen and closes the theater
  // (the close handler runs synchronously on click, so assert directly)
  browser('click', '#forest-milestone-play-btn');
  const dialogClosed = browser('eval', 'document.getElementById("forest-milestone-dialog").hidden');
  if (!dialogClosed.includes('true')) throw new Error('Expected milestone theater to close');

  // 7. Verify returning to destination selector shows updated stage/stats
  browser('click', '#destinations-nav-button');
  browser('wait', '#destination-gate:not([hidden])');
  const forestStageText = browser('eval', 'document.getElementById("forest-stage-label").textContent');
  console.log('Forest stage label on card:', forestStageText.trim());
  if (!forestStageText.includes('שלב 1')) throw new Error('Expected שלב 1');

  // Take screenshot of Destination Gate
  browser('screenshot', '/private/tmp/destination-gate.png');
  console.log('PASS: All destination entrance and navigation browser checks passed.');
} finally {
  lines.close();
  if (server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit');
    server.kill('SIGINT');
    await stopped;
  }
  browser('close');
}
