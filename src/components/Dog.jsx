import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Dog({ dogRef }) {
  const root = useRef();
  const tail = useRef();
  const ears = [useRef(), useRef()];
  const reaction = useRef(0);

  useEffect(() => {
    if (!root.current) return;
    dogRef.current = root.current;
    root.current.userData.react = () => { reaction.current = 1; };
    root.current.userData.camera = window.__worldCamera;
  }, [dogRef]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    root.current.userData.camera = window.__worldCamera;
    root.current.rotation.y = Math.sin(t * .45) * .08;
    tail.current.rotation.z = Math.sin(t * 6) * .25;
    ears[0].current.rotation.z = Math.sin(t * 2) * .04;
    ears[1].current.rotation.z = -Math.sin(t * 2) * .04;

    if (reaction.current > 0) {
      reaction.current = Math.max(0, reaction.current - delta * 1.8);
      root.current.position.y = Math.sin(reaction.current * 18) * .09;
      root.current.scale.y = 1 + Math.sin(reaction.current * 18) * .04;
    } else {
      root.current.position.y = 0;
      root.current.scale.y = 1;
    }
  });

  return (
    <group ref={root} position={[0, 0, -5]}>
      <mesh castShadow position={[0, 1.05, 0]} scale={[1.25, .75, .72]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#b77b45" roughness={.85} />
      </mesh>
      <mesh castShadow position={[0, 1.55, -.82]} scale={[.68, .65, .65]}>
        <sphereGeometry args={[1, 20, 16]} />
        <meshStandardMaterial color="#b77b45" roughness={.85} />
      </mesh>
      <mesh castShadow position={[0, 1.38, -1.38]} scale={[.38, .28, .3]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#35251d" roughness={.7} />
      </mesh>

      <mesh ref={ears[0]} castShadow position={[-.43, 2.05, -.75]} rotation={[0, 0, -.3]} scale={[.18, .52, .3]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#6e432b" />
      </mesh>
      <mesh ref={ears[1]} castShadow position={[.43, 2.05, -.75]} rotation={[0, 0, .3]} scale={[.18, .52, .3]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color="#6e432b" />
      </mesh>

      {[-.23, .23].map((x) => (
        <mesh key={x} position={[x, 1.72, -1.35]}>
          <sphereGeometry args={[.075, 12, 12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}

      {[[-.62, .48, .05], [.62, .48, .05], [-.62, .48, -.55], [.62, .48, -.55]].map((p, i) => (
        <mesh key={i} castShadow position={p} scale={[.22, .55, .22]}>
          <capsuleGeometry args={[.32, .6, 6, 10]} />
          <meshStandardMaterial color="#9d663a" />
        </mesh>
      ))}

      <mesh ref={tail} castShadow position={[0, 1.35, .85]} rotation={[.5, 0, 0]}>
        <capsuleGeometry args={[.13, 1.0, 6, 10]} />
        <meshStandardMaterial color="#9d663a" />
      </mesh>
    </group>
  );
}
