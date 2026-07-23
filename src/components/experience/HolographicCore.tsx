'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
} from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import type { Group, Mesh } from 'three';

function LivingCore() {
  const group = useRef<Group>(null);
  const crystal = useRef<Mesh>(null);
  const inner = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.12;
      group.current.rotation.x += (state.pointer.y * 0.18 - group.current.rotation.x) * 0.035;
      group.current.rotation.z += (-state.pointer.x * 0.12 - group.current.rotation.z) * 0.035;
      group.current.position.x += (state.pointer.x * 0.28 - group.current.position.x) * 0.025;
      group.current.position.y = Math.sin(time * 0.65) * 0.1;
    }
    if (crystal.current) {
      crystal.current.rotation.y -= delta * 0.2;
    }
    if (inner.current) {
      const pulse = 0.76 + Math.sin(time * 1.8) * 0.045;
      inner.current.scale.setScalar(pulse);
      inner.current.rotation.x += delta * 0.24;
      inner.current.rotation.z -= delta * 0.16;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.25} rotationIntensity={0.18} floatIntensity={0.3}>
        <mesh ref={crystal} castShadow>
          <icosahedronGeometry args={[1.48, 2]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.55}
            chromaticAberration={0.12}
            anisotropy={0.25}
            distortion={0.32}
            distortionScale={0.35}
            temporalDistortion={0.12}
            roughness={0.08}
            transmission={1}
            ior={1.28}
            color="#90b8e8"
            attenuationColor="#7768ff"
            attenuationDistance={1.35}
          />
        </mesh>

        <mesh ref={inner}>
          <icosahedronGeometry args={[0.95, 4]} />
          <meshPhysicalMaterial
            color="#6d5dfc"
            emissive="#27d7ff"
            emissiveIntensity={1.45}
            roughness={0.18}
            metalness={0.38}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh scale={1.7} rotation={[0.4, 0.2, 0.25]}>
          <torusGeometry args={[1.18, 0.012, 12, 140]} />
          <meshBasicMaterial color="#78e9ff" transparent opacity={0.55} />
        </mesh>
        <mesh scale={1.9} rotation={[-0.65, 0.25, 0.8]}>
          <torusGeometry args={[1.18, 0.008, 12, 140]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.4} />
        </mesh>
      </Float>

      <Sparkles
        count={46}
        scale={4.6}
        size={2.2}
        speed={0.22}
        opacity={0.65}
        color="#9cecff"
      />
    </group>
  );
}

export default function HolographicCore() {
  return (
    <div className="holographic-core" aria-label="Interactive holographic AI core">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0, 5.85], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[4, 5, 4]} intensity={1.45} color="#d9f7ff" castShadow />
          <pointLight position={[-3, 1, 2]} intensity={3.2} color="#655cff" />
          <pointLight position={[3, -2, 2]} intensity={2.8} color="#22d3ee" />
          <LivingCore />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.3}
            scale={6}
            blur={2.8}
            far={5}
            color="#111a39"
          />
          <Environment preset="city" environmentIntensity={0.72} />
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.8} intensity={0.52} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
      <div className="core-hud core-hud-top">LIVE INTELLIGENCE</div>
      <div className="core-hud core-hud-bottom">FINANCE · DATA · AI</div>
    </div>
  );
}
