import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import World from './components/World';
import Dog from './components/Dog';
import GeneratedModel from './components/GeneratedModel';

function Player({ onInteract }) {
  const { camera } = useThree();
  const keys = useRef({});
  useEffect(() => {
    const down = e => { keys.current[e.code] = true; if (e.code === 'KeyE') onInteract(); };
    const up = e => { keys.current[e.code] = false; };
    addEventListener('keydown', down); addEventListener('keyup', up);
    return () => { removeEventListener('keydown', down); removeEventListener('keyup', up); };
  }, [onInteract]);
  useFrame((_, delta) => {
    window.__worldCamera = camera;
    const speed = 4.8, forward = new THREE.Vector3();
    camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
    if (keys.current.KeyW) camera.position.addScaledVector(forward, speed * delta);
    if (keys.current.KeyS) camera.position.addScaledVector(forward, -speed * delta);
    if (keys.current.KeyA) camera.position.addScaledVector(right, speed * delta);
    if (keys.current.KeyD) camera.position.addScaledVector(right, -speed * delta);
    camera.position.y = 1.8;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -45, 45);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -45, 45);
  });
  return null;
}

function bark() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext, ctx = new AudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(170, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + .16);
    gain.gain.setValueAtTime(.001, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.22, ctx.currentTime + .015); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .2);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .21);
  } catch {}
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generate3D(file, onStage) {
  onStage('Reading your photo');
  const imageBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  onStage('Sending image to 3D AI');
  const create = await fetch('/api/generate-3d', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64 })
  });
  const created = await create.json();
  if (!create.ok) throw new Error(created.error || '3D generation request failed');
  const taskId = created.result;
  if (!taskId) throw new Error('3D service did not return a task ID');

  for (let i = 0; i < 60; i++) {
    onStage(i < 4 ? 'Building your 3D companion' : `Generating 3D model • ${Math.min(99, 20 + i * 2)}%`);
    await sleep(3000);
    const statusResponse = await fetch(`/api/generate-3d/${taskId}`);
    const status = await statusResponse.json();
    if (!statusResponse.ok) throw new Error(status.error || 'Could not read generation status');
    if (status.status === 'SUCCEEDED') return status.model_urls?.glb;
    if (status.status === 'FAILED' || status.status === 'CANCELED') throw new Error(status.task_error?.message || '3D generation failed');
  }
  throw new Error('Generation timed out. Try again.');
}

export default function App() {
  const animalRef = useRef(), fileRef = useRef();
  const [notice, setNotice] = useState(''), [started, setStarted] = useState(false);
  const [photo, setPhoto] = useState(null), [modelUrl, setModelUrl] = useState(null);
  const [worldName, setWorldName] = useState('Forest Companion'), [generating, setGenerating] = useState(false), [stage, setStage] = useState('');
  const notify = useCallback(text => { setNotice(text); setTimeout(() => setNotice(''), 2200); }, []);

  const interact = useCallback(() => {
    if (!animalRef.current || !window.__worldCamera) return;
    const d = window.__worldCamera.position.distanceTo(animalRef.current.position);
    if (d < 5.5) { animalRef.current.userData.react?.(); bark(); notify('🐕 WOOF! Your companion noticed you.'); }
    else notify('Walk closer to your companion first.');
  }, [notify]);

  const upload = async e => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!f.type.startsWith('image/')) return notify('Please choose an image.');
    setPhoto(URL.createObjectURL(f)); setWorldName(`${f.name.replace(/\.[^.]+$/, '')} • AI World`); setModelUrl(null); setGenerating(true);
    try {
      const glb = await generate3D(f, setStage);
      if (!glb) throw new Error('The AI finished without a GLB model.');
      setModelUrl(glb); setStage('3D companion ready'); notify('✨ Your photo became a 3D companion!');
    } catch (err) {
      console.error(err); notify(err.message.includes('MESHY_API_KEY') ? 'Add your Meshy API key to .env first.' : err.message);
      setStage('Generation unavailable');
    } finally { setGenerating(false); }
  };

  const enter = () => { setStarted(true); document.querySelector('canvas')?.requestPointerLock?.(); };
  return <main className="app">
    <Canvas shadows camera={{ position: [0, 1.8, 8], fov: 70 }}>
      <color attach="background" args={['#9bc8e8']} /><fog attach="fog" args={['#9bc8e8', 18, 65]} />
      <ambientLight intensity={1.1} /><directionalLight castShadow position={[8,14,6]} intensity={2.2} shadow-mapSize={[2048,2048]} /><Sky sunPosition={[100,30,20]} turbidity={8} rayleigh={1.5} />
      <Suspense fallback={null}><World />{modelUrl ? <GeneratedModel url={modelUrl} modelRef={animalRef} /> : <Dog dogRef={animalRef} />}<Player onInteract={interact} /></Suspense><PointerLockControls onLock={() => setStarted(true)} />
    </Canvas>
    {!started && <section className="start-card">
      <div className="badge">CODE2CREATE • PHOTO → WORLD</div><h1>Turn a photo into an<br/><span>interactive world.</span></h1>
      <p>Upload an animal photo and our 3D pipeline turns it into a companion you can explore with.</p>
      <button className="secondary" disabled={generating} onClick={() => fileRef.current?.click()}>📷 {generating ? 'Generating 3D…' : photo ? 'Change Animal Photo' : 'Upload Animal Photo'}</button><input ref={fileRef} type="file" accept="image/*" onChange={upload} hidden/>
      {photo && <div className="photo-preview"><img src={photo} alt="Uploaded animal"/><div><b>{worldName}</b><small>{generating ? `⚙ ${stage}` : modelUrl ? '✓ Real 3D model generated' : `⚠ ${stage}`}</small></div></div>}
      {generating && <div className="generation"><div className="spinner"/><b>{stage}</b><small>This can take a little while.</small></div>}
      <button className="enter" disabled={generating} onClick={enter}>Enter World →</button><small>WASD move • Mouse look • E interact</small>
    </section>}
    <div className="hud"><div className="brand">WORLD<span>LAB</span></div><div className="controls">WASD MOVE &nbsp; • &nbsp; E INTERACT &nbsp; • &nbsp; ESC EXIT</div></div>
    <div className="crosshair">+</div>{notice && <div className="notice">{notice}</div>}
    {started && <div className="photo-pill">{modelUrl ? '✨ AI 3D WORLD' : photo ? '📷 PHOTO WORLD' : '🌲 DEMO WORLD'} <span>•</span> {worldName}</div>}
  </main>;
}
