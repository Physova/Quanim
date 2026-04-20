"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { Box, Sphere } from "@react-three/drei";

const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uWavelength;
  uniform float uSlitDistance;
  uniform int uObserverMode; // 0: none, 1: observed
  uniform bool uWaveMode;

  void main() {
    vec2 uv = vUv;
    float d1 = distance(uv, vec2(0.3, 0.5 - uSlitDistance * 0.05));
    float d2 = distance(uv, vec2(0.3, 0.5 + uSlitDistance * 0.05));
    
    // k = 2 * PI / wavelength
    float k = 1000.0 / uWavelength; 
    float phase1 = d1 * k * 40.0 - uTime * 5.0;
    float phase2 = d2 * k * 40.0 - uTime * 5.0;
    
    float wave1 = sin(phase1);
    float wave2 = sin(phase2);
    
    float screenX = 0.85;
    float screenPattern = 0.0;
    
    bool isObserved = (uObserverMode > 0);
    bool showInterference = !isObserved && uWaveMode;

    float y = uv.y - 0.5;
    float angleScale = 1500.0 / uWavelength; 
    
    if (showInterference) {
      float d = uSlitDistance;
      float interferenceFactor = cos( (3.14159 * d * y * angleScale) / 10.0 );
      screenPattern = pow(interferenceFactor, 2.0) * exp(-y * y * 50.0);
    } else {
      float offset = uSlitDistance * 0.1;
      screenPattern = (exp(-pow(y - offset, 2.0) * 400.0) + exp(-pow(y + offset, 2.0) * 400.0));
      if (isObserved) screenPattern *= 0.8; 
    }

    vec3 baseColor = vec3(1.0);
    vec3 color = vec3(0.0); 

    if (uv.x > screenX) {
      color = mix(color, baseColor * 2.0, screenPattern * uIntensity);
    } else if (uv.x > 0.3) {
      float mask = smoothstep(0.3, 0.7, uv.x) * (1.0 - smoothstep(0.8, 0.85, uv.x));
      float interference = (wave1 + wave2) * 0.5;
      
      if (showInterference) {
        color += baseColor * interference * mask * 0.4;
      } else {
        float ray1 = exp(-pow(uv.y - (0.5 - uSlitDistance * 0.05), 2.0) * 500.0);
        float ray2 = exp(-pow(uv.y - (0.5 + uSlitDistance * 0.05), 2.0) * 500.0);
        color += baseColor * (wave1 * ray1 + wave2 * ray2) * mask * 0.5;
      }
    }
    
    // Slit mask is hidden in shader since we have 3D geometry now
    // Only observation dots are rendered
    // Observer indicator
    if (uObserverMode > 0 && uv.x > 0.35 && uv.x < 0.4) {
      float obsY = (uObserverMode == 1) ? 0.5 - uSlitDistance * 0.05 : 0.5 + uSlitDistance * 0.05;
      if (uObserverMode == 3) {
         if (distance(uv, vec2(0.37, 0.5 - uSlitDistance * 0.05)) < 0.02 || 
             distance(uv, vec2(0.37, 0.5 + uSlitDistance * 0.05)) < 0.02) {
           color += vec3(1.0); 
         }
      } else {
        if (distance(uv, vec2(0.37, obsY)) < 0.02) {
          color += vec3(1.0);
        }
      }
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function DoubleSlitSim() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { isPlaying, waveMode, intensity, wavelength, slitDistance, observerState, reset, clearReset } = useSimulationStore();
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uIntensity: { value: intensity },
    uWavelength: { value: wavelength },
    uSlitDistance: { value: slitDistance },
    uObserverMode: { value: 0 },
    uWaveMode: { value: waveMode },
  }), [intensity, wavelength, slitDistance, waveMode]);

  useEffect(() => {
    if (reset) {
      clearReset();
    }
  }, [reset, clearReset]);

  useFrame((state) => {
    if (meshRef.current && isPlaying) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uWavelength.value = wavelength;
      material.uniforms.uSlitDistance.value = slitDistance;
      material.uniforms.uWaveMode.value = waveMode;
      
      let obsMode = 0;
      if (observerState === "both") obsMode = 3;
      material.uniforms.uObserverMode.value = obsMode;
    }
  });

  // Calculate slit positions dynamically for 3D blocks
  // uv.x = 0.3 means x = -3.2 in a 16 unit wide plane centered at 0
  const wallX = -3.2;
  // uv.y = 0.5 +/- slitDistance * 0.05 means y = +/- (slitDistance * 0.05 * 9)
  const slitOffset = slitDistance * 0.45; // 0.05 * 9 (height of plane)

  return (
    <group rotation={[-Math.PI / 4, 0, 0]} position={[0, -1, 0]}>
      {/* The Quantum Field Screen */}
      <mesh ref={meshRef} rotation={[0, 0, 0]} position={[0, 0, -0.1]}>
        <planeGeometry args={[16, 9]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3D Physical Rig Elements overlaid on screen */}

      {/* Emitter */}
      <group position={[-7, 0, 0.5]}>
         <Box args={[1, 1, 1]}>
           <meshPhysicalMaterial color="#ffffff" wireframe metalness={0.8} />
         </Box>
         <Sphere args={[0.2, 16, 16]} position={[0.6, 0, 0]}>
            <meshBasicMaterial color="#ffffff" />
         </Sphere>
      </group>

      {/* Barrier Wall with dynamic slits */}
      <group position={[wallX, 0, 0.5]}>
         {/* Top piece */}
         <Box args={[0.2, 4.5 - slitOffset - 0.2, 1]} position={[0, (4.5 + slitOffset + 0.2)/2, 0]}>
           <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
         </Box>
         {/* Center piece */}
         <Box args={[0.2, slitOffset * 2 - 0.4, 1]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
         </Box>
         {/* Bottom piece */}
         <Box args={[0.2, 4.5 - slitOffset - 0.2, 1]} position={[0, -(4.5 + slitOffset + 0.2)/2, 0]}>
           <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
         </Box>
      </group>

      {/* Detection Screen Backing */}
      <Box args={[0.2, 9, 2]} position={[5.7, 0, 0]}>
         <meshBasicMaterial color="#111111" wireframe transparent opacity={0.5} />
      </Box>

      {/* Grid Wireframe for Context */}
      <mesh position={[0, 0, -0.2]}>
         <planeGeometry args={[16, 9, 32, 18]} />
         <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>
    </group>
  );
}
