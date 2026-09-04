import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, Sky } from '@react-three/drei';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import World from './components/World';
import Dog from './components/Dog';

function Player({ onInteract }) {
  const { camera } = useThree();
  const keys = useRef({});

  useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') onInteract();
    };
    const up = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [onInteract]);

  useFrame((_, delta) => {
    window.__worldCamera = camera;
    const speed = 4.8;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
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

export default function App() {
  const dogRef = useRef();
  const [notice, setNotice] = useState('');
  const [started, setStarted] = useState(false);

  const interact = useCallback(() => {
    if (!dogRef.current || !window.__worldCamera) return;
    const distance = window.__worldCamera.position.distanceTo(dogRef.current.position);
    if (distance < 4.5) {
      dogRef.current.userData.react?.();
      setNotice('🐕 Woof! The dog noticed you.');
      window.setTimeout(() => setNotice(''), 1800);
    } else {
      setNotice('Walk closer to the dog first.');
      window.setTimeout(() => setNotice(''), 1400);
    }
  }, []);

  return (
    <main className="app">
      <Canvas shadows camera={{ position: [0, 1.8, 8], fov: 70 }}>
        <color attach="background" args={['#9bc8e8']} />
        <fog attach="fog" args={['#9bc8e8', 18, 65]} />
        <ambientLight intensity={1.1} />
        <directionalLight castShadow position={[8, 14, 6]} intensity={2.2} shadow-mapSize={[2048, 2048]} />
        <Sky sunPosition={[100, 30, 20]} turbidity={8} rayleigh={1.5} />
        <Suspense fallback={null}>
          <World />
          <Dog dogRef={dogRef} />
          <Player onInteract={interact} />
        </Suspense>
        <PointerLockControls onLock={() => setStarted(true)} />
      </Canvas>

      {!started && (
        <section className="start-card">
          <div className="badge">CODE2CREATE • MVP</div>
          <h1>Photo → Interactive<br /><span>3D World</span></h1>
          <p>Step into a generated world and interact with its animal.</p>
          <button onClick={() => document.querySelector('canvas')?.requestPointerLock?.()}>Enter World</button>
          <small>WASD to move • Mouse to look • E to interact</small>
        </section>
      )}

      <div className="hud">
        <div className="brand">WORLD<span>LAB</span></div>
        <div className="controls">W A S D &nbsp; MOVE &nbsp; • &nbsp; E &nbsp; INTERACT</div>
      </div>
      <div className="crosshair">+</div>
      {notice && <div className="notice">{notice}</div>}
    </main>
  );
}
