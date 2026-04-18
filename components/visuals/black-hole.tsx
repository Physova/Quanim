'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue, useTransform } from 'framer-motion';
import { AccretionDiskShader, CelestialBodyShader } from './celestial-shaders';

interface BlackHoleProps {
  scrollYProgress: MotionValue<number>;
  uMorph: MotionValue<number>;
  posX: MotionValue<number>;
  diskOpacity: MotionValue<number>;
}

export function BlackHole({ scrollYProgress, uMorph, posX, diskOpacity }: BlackHoleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const rotationSpeed = useTransform(scrollYProgress, [0, 0.2], [1, 2]);
  const diskScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.2]);

  // Accretion Disk Uniforms
  const accretionUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#ff8c00') },
    uOpacity: { value: 1.0 }
  }), []);

  // Core (Singularity/Sun/Earth) Uniforms
  const coreUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Update group position (panning)
    if (groupRef.current) {
      groupRef.current.position.x = posX.get();
    }

    // Update uniforms
    if (diskRef.current) {
      const material = diskRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;
      material.uniforms.uOpacity.value = diskOpacity.get();
      
      // Rotate disk based on scroll-driven speed
      diskRef.current.rotation.z += delta * rotationSpeed.get() * 0.2;
      diskRef.current.scale.setScalar(diskScale.get());
    }

    if (coreRef.current) {
      const material = coreRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = time;
      material.uniforms.uMorph.value = uMorph.get();
    }
  });

  return (
    <group ref={groupRef} scale={2}>
      {/* Accretion Disk - only visible in Stage 1 */}
      <mesh ref={diskRef} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[15, 15, 128, 128]} />
        <shaderMaterial
          fragmentShader={AccretionDiskShader.fragmentShader}
          vertexShader={AccretionDiskShader.vertexShader}
          uniforms={accretionUniforms}
          transparent
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* The Core (Singularity -> Sun -> Earth) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <shaderMaterial
          fragmentShader={CelestialBodyShader.fragmentShader}
          vertexShader={CelestialBodyShader.vertexShader}
          uniforms={coreUniforms}
          transparent
        />
      </mesh>
    </group>
  );
}
