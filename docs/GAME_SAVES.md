# Shared game saves

## Agreed scope

One shared family space behind the existing Cloudflare Access gate. Adult identity
controls admission only; it does not own a child's profile. No new login screens,
invitations, household administration, or public guest mode.

Fresh start was explicitly chosen: the new shared profiles are Lotem and Tom,
both at level 1 with zero stars. Old browser profiles and route progress are not
imported, deleted, or read by the new save system.

Profiles, per-child routes, and completed stages are saved. Moves inside a journey
activity remain in that open session; leaving or refreshing starts the stage again.
A durable browser queue retains pending writes across reloads and
retries when connectivity returns. The status distinguishes local-only saves
from cloud acknowledgements. Conflicting device writes stop play and offer an
explicit cloud reload after retaining a local recovery copy. A newly opened game
tab takes over the save session after the older tab drains pending writes. The
older tab stops play and offers a button to return to it.

Journey completion is recorded by the map after the activity's completion action.
Profile and journey choices are saved separately. Only the selected child is
device-local.

## Storage foundation

Pages Functions expose `GET /api/saves` and `GET` and `PUT /api/saves/:key`. D1 stores JSON documents
with increasing revisions. Create uses revision 0; update supplies the revision
previously read. A stale write returns 409 instead of overwriting another device.
Retrying the identical write immediately after a lost acknowledgement is safe.
Reads and responses are not cached. A null value can represent a cleared document
without discarding its revision history.

The API independently validates the existing Access JWT, including its signature,
issuer, audience and expiry. Requests without valid admission cannot read or write
saves, even through an alternative deployment hostname. PUT requires same-origin
JSON and limits save bodies to 64 KiB. Database queries use bound parameters.

`wrangler.jsonc` binds production and preview to separate databases. Local tests
use temporary local D1 storage. Code deployments do not create databases or run
destructive schema resets. Migrations are applied explicitly:

```sh
npx wrangler d1 migrations apply SAVES --remote --env preview
npx wrangler d1 migrations apply SAVES --remote --env production
```

The initial empty save table has been created in both remote databases. No player
data has been imported. The live game has not been switched to this API.

## Acceptance

`npm run test:saves` verifies real local D1 persistence, retry after a lost
acknowledgement, competing writes, and service replacement. It also tests Access
using locally signed test tokens; only the signing-key HTTP boundary is mocked.

The journey browser checks now verify that all five activities finish through
their real controls and that stage progress survives reload. A separate two-tab
check verifies that a new tab takes over without an error, the retired tab cannot
write, and returning to that tab retains the completed save. Reveal the Magic
checks verify that unfinished English and Hebrew guesses restart on reload.

Run `node scripts/serve-save-test.mjs` after building for a loopback-only browser
fixture backed by temporary real D1. This fixture deliberately omits Access and
is not a deployment entrypoint.

Pending human acceptance: on the authenticated preview, complete a stage, reload,
and confirm its stars. Open another device and confirm the same profile/route.
Production remains unchanged until PR merge.

Final automated receipts (7.15.0):

```text
npm run test:saves
PASS: Access rejects missing, forged, expired, wrong-audience, and incomplete tokens; valid signed token accepted.
PASS: D1 save/read, lost-ack retry, stale-write rejection, simultaneous writes, service restart, and origin/key validation.
PASS: fresh cloud state ignores old progress; offline saves survive reload and sync to another device.
PASS: Magic House restores placed objects and advances a completed request before its animation ends.
PASS: oversized save streams are cancelled before buffering the rest.

npx tsc --noEmit
(exit 0)

npm run build
✓ built in 1.73s
Copied educational game prototypes into dist.

node scripts/test-fast-start-build.mjs
{"indexBytes":579072,"builtAudioCount":243}

npx wrangler pages functions build --outdir /tmp/bubbles-save-functions
✨ Compiled Worker successfully

git diff --check
(exit 0)
```

Do not seed shared progress from whichever browser happens to arrive first, or
silently replace an existing cloud save with local defaults.
