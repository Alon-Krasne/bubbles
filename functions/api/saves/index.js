export async function onRequestGet({ env }) {
  const { results } = await env.SAVES.prepare('SELECT key, value, revision FROM saves').all();
  return Response.json(Object.fromEntries(results.map(row => [row.key, { revision: row.revision, value: JSON.parse(row.value) }])), {
    headers: { 'cache-control': 'no-store' },
  });
}
