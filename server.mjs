import http from 'node:http';
import { Client, handle_file } from '@gradio/client';

const PORT = process.env.API_PORT || 8787;
const HF_SPACE = process.env.HF_3D_SPACE || 'tencent/Hunyuan3D-2.1';
const HF_TOKEN = process.env.HF_TOKEN;

let gradioClientPromise;
async function getClient() {
  if (!gradioClientPromise) {
    gradioClientPromise = Client.connect(HF_SPACE, HF_TOKEN ? { token: HF_TOKEN } : undefined);
  }
  return gradioClientPromise;
}

async function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(body));
}

function dataUriToBlob(dataUri) {
  const match = dataUri.match(/^data:(image\/[\w.+-]+);base64,(.+)$/s);
  if (!match) throw new Error('imageBase64 must be a base64 image data URI.');
  return new Blob([Buffer.from(match[2], 'base64')], { type: match[1] });
}

function findGlb(value) {
  if (!value) return null;
  if (typeof value === 'string' && /\.glb(?:\?|$)/i.test(value)) return value;
  if (typeof value === 'object') {
    if (typeof value.url === 'string' && /\.glb(?:\?|$)/i.test(value.url)) return value.url;
    if (typeof value.path === 'string' && /\.glb(?:\?|$)/i.test(value.path)) return value.path;
    if (typeof value.value === 'string' && /\.glb(?:\?|$)/i.test(value.value)) return value.value;
    for (const child of Object.values(value)) {
      const found = findGlb(child);
      if (found) return found;
    }
  }
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findGlb(child);
      if (found) return found;
    }
  }
  return null;
}

async function generateWithHunyuan(imageBase64) {
  const client = await getClient();
  const image = handle_file(dataUriToBlob(imageBase64));

  // Shape-only generation is substantially faster and produces a GLB that
  // Three.js can display. Texture/PBR can be added later as an optional mode.
  const job = client.submit('/shape_generation', {
    image,
    steps: 30,
    guidance_scale: 5,
    seed: 1234,
    octree_resolution: 256,
    check_box_rembg: true,
    randomize_seed: true
  });

  let lastProgress = 5;
  for await (const event of job) {
    if (event.type === 'status') {
      const p = event.progress_data?.find?.(x => typeof x.progress === 'number')?.progress;
      if (typeof p === 'number') lastProgress = Math.round(p * 100);
    }
    if (event.type === 'data') {
      const glb = findGlb(event.data);
      if (glb) return { glb, progress: 100 };
    }
  }

  throw new Error('Hunyuan3D completed without returning a GLB model.');
}

async function handle(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});

  if (req.method === 'POST' && req.url === '/api/generate-3d') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { imageBase64 } = JSON.parse(body);
      if (!imageBase64?.startsWith('data:image/')) return json(res, 400, { error: 'imageBase64 must be an image data URI.' });
      const result = await generateWithHunyuan(imageBase64);
      return json(res, 200, { result: result.glb, source: 'Hunyuan3D-2.1 ZeroGPU' });
    } catch (e) {
      console.error('3D generation error:', e);
      return json(res, 500, { error: e?.message || 'Remote 3D generation failed.' });
    }
  }

  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, { ok: true, imageTo3D: true, provider: 'Hugging Face ZeroGPU', model: HF_SPACE });
  }

  return json(res, 404, { error: 'Not found' });
}

http.createServer(handle).listen(PORT, () => {
  console.log(`Remote Hunyuan3D API listening on ${PORT}`);
  console.log(`3D model backend: Hugging Face Space ${HF_SPACE}`);
});
