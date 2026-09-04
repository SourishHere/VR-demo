# Photo → Interactive 3D World

A browser-based Code2Create project built around **photo → 3D scene → interactive world**.

## MVP

- First-person browser movement
- WASD + mouse controls
- Procedural forest environment
- Interactive animated dog
- Distance-based interaction
- Polished HUD / landing screen

## Run in Codespaces

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open the forwarded Vite port.

## Meshy API Key Setup (Important)

This project uses the Meshy Image-to-3D API.

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and set your key:

   **For testing / development (recommended first):**
   ```
   MESHY_API_KEY=msy_dummy_api_key_for_test_mode_12345678
   ```
   This is Meshy’s official test key. It works with all endpoints, uses **0 credits**, and always returns sample results. Perfect for coding and testing your integration.

   **For real generations:**
   - Create a Meshy account at https://www.meshy.ai
   - Upgrade to Pro plan (API access is not available on Free)
   - Go to Settings → API and create a real key
   - Replace the value in `.env` with your real key

3. Restart the server after changing the key so it picks up the new environment variable.

> Never commit your real API key. Keep it only in `.env` (which should stay gitignored).

## Roadmap

### Phase 1 — Playable world
- [x] First-person controller
- [x] Environment
- [x] Animal
- [x] Animation/reaction
- [x] Interaction
- [ ] Real bark audio

### Phase 2 — Photo input
- [ ] Image upload UI
- [ ] Image-to-3D API adapter
- [ ] GLB ingestion
- [ ] Replace procedural animal with generated asset

### Phase 3 — Competition features
- [ ] Scene understanding
- [ ] Multiple objects from one photo
- [ ] Object interaction
- [ ] Animal behavior system
- [ ] Natural-language commands
- [ ] Persistent generated worlds

## Architecture

```text
React + Vite
    ↓
React Three Fiber / Three.js
    ↓
Browser 3D World
    ↓
Photo Upload
    ↓
Image-to-3D Adapter
    ↓
GLB
    ↓
Interactive Scene
```

Designed for normal PC browser play; a VR headset is not required for the MVP.
