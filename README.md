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
