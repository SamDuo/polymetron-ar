/**
 * Polymetron AR — Cloudflare Worker
 *
 * Routes:
 *   /hf/{model_id}/resolve/{rev}/{file}   -> proxy to huggingface.co
 *   /*                                     -> static asset (index.html, etc.)
 *
 * Why this exists:
 * Some networks (corporate wifi, content blockers, iOS Private Relay,
 * regional firewalls) block huggingface.co. By fetching the model
 * weights through this same-origin proxy, the demo loads on networks
 * that would otherwise return "Load failed" for direct HF requests.
 *
 * Cloudflare caches each proxied file at the edge for 30 days, so
 * the first user pays the bandwidth and every subsequent visitor
 * gets a fast same-origin response from cache.
 */

const HF_ORIGIN = 'https://huggingface.co';
const PROXY_PREFIX = '/hf/';
const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (url.pathname.startsWith(PROXY_PREFIX)) {
      return handleHfProxy(request, ctx, url);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleHfProxy(request, ctx, url) {
  const hfPath = url.pathname.slice(PROXY_PREFIX.length);
  if (!hfPath) {
    return new Response('Bad proxy path', {
      status: 400,
      headers: corsHeaders(),
    });
  }

  const hfUrl = `${HF_ORIGIN}/${hfPath}${url.search}`;
  const cache = caches.default;
  const cacheKey = new Request(hfUrl, { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) {
    const out = new Response(cached.body, cached);
    addCors(out);
    out.headers.set('X-Polymetron-Cache', 'hit');
    return out;
  }

  let upstream;
  try {
    upstream = await fetch(hfUrl, {
      headers: { 'User-Agent': 'polymetron-ar-proxy/1.0' },
      redirect: 'follow',
      cf: { cacheTtl: CACHE_TTL, cacheEverything: true },
    });
  } catch (e) {
    return new Response('Upstream fetch failed: ' + (e && e.message), {
      status: 502,
      headers: corsHeaders(),
    });
  }

  const response = new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
  });
  addCors(response);
  response.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}, immutable`);
  response.headers.set('X-Polymetron-Cache', 'miss');

  if (upstream.ok && request.method === 'GET') {
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'range, content-type, authorization',
    'Access-Control-Expose-Headers':
      'content-length, content-range, accept-ranges, x-polymetron-cache',
    'Access-Control-Max-Age': '86400',
  };
}

function addCors(response) {
  for (const [k, v] of Object.entries(corsHeaders())) {
    response.headers.set(k, v);
  }
}
