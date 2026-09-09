import cloudflareAccess from '@cloudflare/pages-plugin-cloudflare-access';

export async function onRequest(context) {
  const { ACCESS_DOMAIN, ACCESS_AUD } = context.env;
  const headers = { 'cache-control': 'no-store' };
  if (!ACCESS_DOMAIN || !ACCESS_AUD) return new Response('Access is not configured', { status: 503, headers });
  if (!context.request.headers.get('Cf-Access-Jwt-Assertion')) return new Response('Sign in required', { status: 403, headers });
  const authenticate = cloudflareAccess({ domain: ACCESS_DOMAIN, aud: ACCESS_AUD });
  const result = await authenticate({ ...context, next: async () => {
    const claims = context.data.cloudflareAccess.JWT.payload;
    if (claims.iss !== ACCESS_DOMAIN || !Array.isArray(claims.aud) || !claims.aud.includes(ACCESS_AUD)
      || !Number.isFinite(claims.exp)) return new Response('Invalid access token', { status: 403, headers });
    return context.next();
  } });
  return result.status === 302 ? new Response('Sign in required', { status: 403, headers }) : result;
}
