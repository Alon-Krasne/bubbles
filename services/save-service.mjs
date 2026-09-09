const response = (body, status = 200) => Response.json(body, {
  status,
  headers: { 'cache-control': 'no-store' },
});

// Authentication belongs to the Pages middleware, not the save document.
export async function handleSaveRequest(request, database, key) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(key)) return response({ error: 'Invalid save key' }, 400);
  if (request.method === 'GET') {
    const row = await database.prepare('SELECT value, revision FROM saves WHERE key = ?').bind(key).first();
    return row ? response({ revision: row.revision, value: JSON.parse(row.value) }) : response({ error: 'Not found' }, 404);
  }
  if (request.method !== 'PUT') return response({ error: 'Method not allowed' }, 405);
  if (request.headers.get('origin') !== new URL(request.url).origin) return response({ error: 'Invalid origin' }, 403);
  if (request.headers.get('content-type') !== 'application/json') return response({ error: 'Expected JSON' }, 415);
  if (!request.body) return response({ error: 'Invalid JSON' }, 400);
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65536) {
      await reader.cancel();
      return response({ error: 'Save too large' }, 413);
    }
    chunks.push(value);
  }
  const text = await new Blob(chunks).text();
  let body;
  try { body = JSON.parse(text); } catch { return response({ error: 'Invalid JSON' }, 400); }
  if (!body || !Number.isSafeInteger(body.revision) || body.revision < 0 || body.revision >= Number.MAX_SAFE_INTEGER
    || !Object.hasOwn(body, 'value')) return response({ error: 'Invalid save' }, 400);
  const value = JSON.stringify(body.value);
  const row = body.revision === 0
    ? await database.prepare('INSERT INTO saves (key, value, revision) VALUES (?, ?, 1) ON CONFLICT(key) DO NOTHING RETURNING revision')
      .bind(key, value).first()
    : await database.prepare('UPDATE saves SET value = ?, revision = revision + 1, updated_at = CURRENT_TIMESTAMP WHERE key = ? AND revision = ? RETURNING revision')
      .bind(value, key, body.revision).first();
  if (!row) {
    const current = await database.prepare('SELECT value, revision FROM saves WHERE key = ?').bind(key).first();
    if (current?.revision === body.revision + 1 && current.value === value) {
      return response({ revision: current.revision, value: body.value });
    }
    return response({ error: 'Save changed on another device. Reload before continuing.' }, 409);
  }
  return response({ revision: row.revision, value: body.value });
}
