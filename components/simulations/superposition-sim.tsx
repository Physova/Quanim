"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { Sphere, Cylinder, Html, Line } from "@react-three/drei";

export default function SuperpositionSim() {
  const { probUp, isMeasured, measuredState } = useSimulationStore();
  const groupRef = React.useRef<THREE.Group>(null);
  const pointerRef = React.useRef<THREE.Group>(null);
  
  // Calculate polar angle (theta) from probUp. probUp = cos^2(theta/2)
  // Therefore, theta = 2 * acos(sqrt(probUp))
  const targetTheta = isMeasured 
    ? (measuredState === 0 ? 0 : Math.PI) // If measured, snap to poles |0> or |1>
    : 2 * Math.acos(Math.sqrt(Math.max(0, Math.min(1, probUp))));
    
  // Phase angle (phi)
  const time = React.useRef(0);

  useFrame((state, delta) => {
    if (pointerRef.current) {
       // Animate to target theta
       const currentTheta = pointerRef.current.rotation.x;
       // We use rotation.x or z. Let's use rotation.x for polar angle (tilting forward/back)
       // Or z for tilting side to side. A standard Bloch sphere plots Z as vertical, 
       // so theta is angle from Z. Tilting around X axis changes angle from Z.
       const nextTheta = THREE.MathUtils.lerp(currentTheta, targetTheta, 0.1);
       pointerRef.current.rotation.x = isMeasured ? nextTheta : targetTheta;

       // Rotate around Z axis (phase) only if not measured
       // Standard spherical coords: phi is rotation around Z. But in THREE, Y is UP.
       // So theta is rotation around X or Z, and phi is rotation around Y!
       
       if (!isMeasured) {
         time.current += delta;
         pointerRef.current.rotation.y = time.current * 0.8;
       } else {
         // Snapped phase to 0 for clarity when collapsed
         pointerRef.current.rotation.y = THREE.MathUtils.lerp(pointerRef.current.rotation.y, 0, 0.1);
       }
    }
    
    if (groupRef.current) {
        // Very slow, subtle drift of the entire sphere for scene "life"
       groupRef.current.rotation.y += delta * 0.05;
       groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer Bloch Sphere Wireframe */}
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </Sphere>

      {/* Sphere glass surface */}
      <Sphere args={[2.48, 32, 32]}>
        <meshPhysicalMaterial 
          color="#000000" 
          transparent 
          opacity={0.6} 
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* Intutive Probability Rings */}
      <group>
        {/* 'Up' Probability Ring */}
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 64]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={isMeasured ? (measuredState === 0 ? 0.8 : 0.05) : Math.max(0.05, probUp)} 
          />
        </mesh>
        
        {/* 'Down' Probability Ring */}
        <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 64]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={isMeasured ? (measuredState === 1 ? 0.8 : 0.05) : Math.max(0.05, 1 - probUp)} 
          />
        </mesh>
      </group>

      {/* Origin */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* State Vector (Arrow) */}
      <group>
        {/* We wrap pointer in an outer group so the rotation works correctly with Y as UP */}
        <group ref={pointerRef}>
          {/* Arrow Body */}
          <Cylinder args={[0.02, 0.02, 2.5]} position={[0, 1.25, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          {/* Arrow Head */}
          <Cylinder args={[0, 0.1, 0.3]} position={[0, 2.65, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          {/* Arrow Tip Dot */}
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* Axis Lines */}
      {/* Y Axis (Up/Down in THREE js) */}
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)]} color="#ffffff" opacity={0.4} transparent />
      {/* X Axis */}
      <Line points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]} color="#ffffff" opacity={0.15} transparent />
      {/* Z Axis */}
      <Line points={[new THREE.Vector3(0, 0, -3), new THREE.Vector3(0, 0, 3)]} color="#ffffff" opacity={0.15} transparent />

      {/* Labels */}
      <Html position={[0, 3.4, 0]} center className="pointer-events-none">
        <div className="text-[10px] uppercase font-mono font-bold text-white tracking-widest px-2 py-1 bg-black border border-white/20 whitespace-nowrap">
          {isMeasured 
            ? (measuredState === 0 ? "STATE: SPIN UP COLLAPSE" : "") 
            : `PROBABILITY OF SPIN UP: ${Math.round(probUp * 100)}%`}
        </div>
      </Html>
      <Html position={[0, -3.4, 0]} center className="pointer-events-none">
        <div className="text-[10px] uppercase font-mono font-bold text-white/80 tracking-widest px-2 py-1 bg-black border border-white/10 whitespace-nowrap">
          {isMeasured 
            ? (measuredState === 1 ? "STATE: SPIN DOWN COLLAPSE" : "") 
            : `PROBABILITY OF SPIN DOWN: ${Math.round((1 - probUp) * 100)}%`}
        </div>
      </Html>

      {/* Equator Circle */}
      <Line 
        points={Array.from({ length: 65 }).map((_, i) => {
          const angle = (i / 64) * Math.PI * 2;
          return new THREE.Vector3(Math.cos(angle) * 2.5, 0, Math.sin(angle) * 2.5);
        })}
        color="#ffffff" 
        opacity={0.3} 
        transparent 
      />
    </group>
  );
}
