// ============================================================================
// ANNOTATED REFERENCE SIMULATION — Superposition (Bloch Sphere)
// ============================================================================
// This is a REAL, WORKING simulation from the Physova codebase.
// Use it as a template when building new simulations.
// Comments marked with "=== PATTERN ===" explain the design decisions.
// ============================================================================

"use client";
// === PATTERN: ALWAYS start with "use client" — simulations use hooks & browser APIs ===

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
// === PATTERN: Import THREE namespace for Vector3, MathUtils, etc. ===

import { Sphere, Cylinder, Html, Line } from "@react-three/drei";
// === PATTERN: Import ONLY the drei helpers you need. Common ones:
//   Sphere, Box, Cylinder, Cone — primitive shapes
//   Html — in-scene text labels
//   Line — axis lines, trajectories, field lines
//   Torus — rings, orbits
// ===

// === PATTERN: This sim uses the LEGACY global Zustand store.
// NEW SIMULATIONS should NOT import this. Instead, receive params as props.
// import { useSimulationStore } from "@/lib/stores/simulation-store";
// ===

// === PATTERN FOR NEW SIMS: Define props interface ===
// interface FrictionSimProps {
//   angle: number;      // Incline angle in radians
//   friction: number;   // Coefficient of friction (0-1)
//   isPlaying: boolean; // Pause/resume animation
// }

export default function SuperpositionSim() {
  // === PATTERN: Use refs for objects that animate in useFrame ===
  const groupRef = React.useRef<THREE.Group>(null);
  const pointerRef = React.useRef<THREE.Group>(null);

  // === LEGACY: Global store. NEW sims receive these as props instead ===
  // For new sims: const { angle, friction, isPlaying } = props;
  const probUp = 0.7; // Simulated default
  const isMeasured = false;
  const measuredState = 0;

  const targetTheta = isMeasured
    ? (measuredState === 0 ? 0 : Math.PI)
    : 2 * Math.acos(Math.sqrt(Math.max(0, Math.min(1, probUp))));

  const time = React.useRef(0);

  // === PATTERN: useFrame is the animation loop — runs every frame ===
  // ALWAYS use delta for frame-independent animation
  // ALWAYS add null checks for refs
  useFrame((state, delta) => {
    if (pointerRef.current) {
      const currentTheta = pointerRef.current.rotation.x;
      const nextTheta = THREE.MathUtils.lerp(currentTheta, targetTheta, 0.1);
      pointerRef.current.rotation.x = isMeasured ? nextTheta : targetTheta;

      if (!isMeasured) {
        time.current += delta;
        pointerRef.current.rotation.y = time.current * 0.8;
      } else {
        pointerRef.current.rotation.y = THREE.MathUtils.lerp(
          pointerRef.current.rotation.y, 0, 0.1
        );
      }
    }

    // === PATTERN: Subtle ambient rotation gives the scene "life" ===
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>

      {/* === PATTERN: WIREFRAME SHELL — outer context boundary ===
          Every simulation has a wireframe mesh as the outermost container.
          This gives spatial context and depth to the scene.
          ALWAYS: color="#ffffff" wireframe transparent opacity={0.15}
      */}
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </Sphere>

      {/* === PATTERN: GLASS SURFACE — semi-transparent inner shell ===
          Gives a premium, physical appearance to the container.
          ALWAYS: color="#000000" (black), high metalness, low roughness
      */}
      <Sphere args={[2.48, 32, 32]}>
        <meshPhysicalMaterial
          color="#000000"
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>

      {/* === PATTERN: DYNAMIC VISUAL ELEMENTS ===
          These change appearance based on simulation state.
          Use opacity to show/hide or indicate magnitude.
          NEVER use color changes — only opacity changes.
      */}
      <group>
        {/* Probability rings — opacity driven by state */}
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.05, 16, 64]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isMeasured ? (measuredState === 0 ? 0.8 : 0.05) : Math.max(0.05, probUp)}
          />
        </mesh>
      </group>

      {/* === PATTERN: ORIGIN POINT — small white sphere at center === */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* === PATTERN: STATE VECTOR / ARROW ===
          Built from a Cylinder (shaft) + Cylinder (cone head) + small sphere (tip).
          All pure white. Wrapped in a group for rotation.
      */}
      <group>
        <group ref={pointerRef}>
          <Cylinder args={[0.02, 0.02, 2.5]} position={[0, 1.25, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          <Cylinder args={[0, 0.1, 0.3]} position={[0, 2.65, 0]}>
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          <mesh position={[0, 2.8, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </group>

      {/* === PATTERN: AXIS LINES ===
          Provide spatial orientation. Use Line from drei.
          Primary axis (Y/vertical): opacity 0.4
          Secondary axes (X, Z): opacity 0.15
      */}
      <Line points={[new THREE.Vector3(0, -3, 0), new THREE.Vector3(0, 3, 0)]}
        color="#ffffff" opacity={0.4} transparent />
      <Line points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]}
        color="#ffffff" opacity={0.15} transparent />
      <Line points={[new THREE.Vector3(0, 0, -3), new THREE.Vector3(0, 0, 3)]}
        color="#ffffff" opacity={0.15} transparent />

      {/* === PATTERN: IN-SCENE LABELS using drei Html ===
          ALWAYS: pointer-events-none on the Html wrapper
          ALWAYS: text-[8px] or text-[9px], uppercase, font-mono, font-bold
          ALWAYS: tracking-widest, bg-black/60, border border-white/10
          ALWAYS: whitespace-nowrap to prevent wrapping
      */}
      <Html position={[0, 2.9, 0]} center className="pointer-events-none">
        <div className="text-[8px] md:text-[9px] uppercase font-mono font-bold text-white tracking-widest px-2 py-0.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
          {isMeasured
            ? (measuredState === 0 ? "STATE: SPIN UP COLLAPSE" : "")
            : `PROBABILITY OF SPIN UP: ${Math.round(probUp * 100)}%`}
        </div>
      </Html>
      <Html position={[0, -2.9, 0]} center className="pointer-events-none">
        <div className="text-[8px] md:text-[9px] uppercase font-mono font-bold text-white/70 tracking-widest px-2 py-0.5 bg-black/40 border border-white/5 backdrop-blur-sm whitespace-nowrap">
          {isMeasured
            ? (measuredState === 1 ? "STATE: SPIN DOWN COLLAPSE" : "")
            : `PROBABILITY OF SPIN DOWN: ${Math.round((1 - probUp) * 100)}%`}
        </div>
      </Html>

      {/* === PATTERN: EQUATOR / ORBIT CIRCLE ===
          Generated as an array of points forming a circle.
          Use Line with moderate opacity.
      */}
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
