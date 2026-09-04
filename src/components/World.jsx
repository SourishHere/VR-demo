import { Float } from '@react-three/drei';

export default function World() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#527d42" roughness={1} />
      </mesh>

      {[
        [-8, -5, 1.2], [8, -8, 1.5], [-12, -16, 1.3], [13, -18, 1.4],
        [-18, 3, 1.5], [18, 8, 1.6], [-5, -24, 1.4], [6, -30, 1.5]
      ].map((p, i) => <Tree key={i} position={[p[0], 0, p[1]]} scale={p[2]} />)}

      {[
        [3, -3, .7], [-4, -7, .55], [8, -12, .8], [-8, -15, .6], [14, -5, .5]
      ].map((p, i) => <Rock key={i} position={[p[0], p[2] * .45, p[1]]} scale={p[2]} />)}

      <pathway />
    </>
  );
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[.35, .55, 3.4, 10]} />
        <meshStandardMaterial color="#6b4328" />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <sphereGeometry args={[1.9, 14, 12]} />
        <meshStandardMaterial color="#315f35" roughness={1} />
      </mesh>
      <mesh position={[.8, 4.7, .2]} castShadow>
        <sphereGeometry args={[1.2, 12, 10]} />
        <meshStandardMaterial color="#3e7040" roughness={1} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }) {
  return (
    <Float speed={1} rotationIntensity={.1} floatIntensity={.05}>
      <mesh position={position} scale={scale} castShadow>
        <dodecahedronGeometry args={[.8, 0]} />
        <meshStandardMaterial color="#777b78" roughness={1} />
      </mesh>
    </Float>
  );
}

function pathway() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .006, -16]}>
      <planeGeometry args={[5, 60]} />
      <meshStandardMaterial color="#9b815e" roughness={1} />
    </mesh>
  );
}
