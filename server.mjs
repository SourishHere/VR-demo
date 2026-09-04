import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const PORT = process.env.PORT || 5173;
const MESHY_KEY = process.env.MESHY_API_KEY;
const MESHY_URL = 'https://api.meshy.ai/openapi/v1/image-to-3d';

async function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method === 'POST' && req.url === '/api/generate-3d') {
    if (!MESHY_KEY) return json(res, 503, { error: 'MESHY_API_KEY is not configured.' });
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
      const data = await r.json();
      return json(res, r.status, data);
    } catch (e) { return json(res, 500, { error: e.message }); }
  }
  if (req.method === 'GET' && req.url === '/api/health') return json(res, 200, { ok: true, imageTo3D: Boolean(MESHY_KEY) });
  return json(res, 404, { error: 'Not found' });
}

const server = http.createServer(handle);
server.listen(PORT, () => console.log(`API listening on ${PORT}`));
