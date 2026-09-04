import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';

export default function GeneratedModel({ url, modelRef }) {
  const root = useRef();
  const { scene } = useGLTF(url);

  useEffect(() => {
    if (!root.current) return;
    modelRef.current = root.current;
    root.current.userData.react = () => {
      root.current.position.y += 0.18;
      setTimeout(() => { if (root.current) root.current.position.y -= 0.18; }, 180);
    };
  }, [modelRef]);

  return <primitive ref={root} object={scene.clone()} position={[0, 0, -5]} scale={2.2} />;
}
