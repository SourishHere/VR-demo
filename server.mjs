import http from 'node:http';

const PORT = process.env.API_PORT || 8787;

// Use real key from environment if available, otherwise fall back to Meshy's official test key
// Test key: works with all endpoints, consumes 0 credits, always returns sample results
const MESHY_KEY = process.env.MESHY_API_KEY || 'msy_dummy_api_key_for_test_mode_12345678';
const MESHY_URL = 'https://api.meshy.ai/openapi/v1/image-to-3d';

async function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  if (req.method === 'POST' && req.url === '/api/generate-3d') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { imageBase64 } = JSON.parse(body);
      if (!imageBase64?.startsWith('data:image/')) return json(res, 400, { error: 'imageBase64 must be an image data URI.' });
      const r = await fetch(MESHY_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${MESHY_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageBase64, enable_pbr: true })
      });
      return json(res, r.status, await r.json());
    } catch (e) { return json(res, 500, { error: e.message }); }
  }

  const match = req.method === 'GET' && req.url?.match(/^\/api\/generate-3d\/([^/]+)$/);
  if (match) {
    try {
      const r = await fetch(`${MESHY_URL}/${encodeURIComponent(match[1])}`, { headers: { Authorization: `Bearer ${MESHY_KEY}` } });
      return json(res, r.status, await r.json());
    } catch (e) { return json(res, 500, { error: e.message }); }
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, {
      ok: true,
      imageTo3D: true,
      usingTestKey: !process.env.MESHY_API_KEY
    });
  }

  return json(res, 404, { error: 'Not found' });
}

http.createServer(handle).listen(PORT, () => {
  console.log(`Image-to-3D API listening on ${PORT}`);
  if (!process.env.MESHY_API_KEY) {
    console.log('Using Meshy official test key (no credits consumed, sample results only)');
  }
});
