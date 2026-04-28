"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Cylinder, Html, Line } from "@react-three/drei";
import { useLab } from "./lab-container";
import { cn } from "@/lib/utils";

interface ForceSimProps {
  appliedForce: number;
  mass: number;
  frictionCoeff: number;
  isPlaying: boolean;
  onBoundaryHit: () => void;
}

export default function ForceAndLawsOfMotionSim({
  appliedForce,
  mass,
  frictionCoeff,
  isPlaying,
  onBoundaryHit,
}: ForceSimProps) {
  const { isFullscreen } = useLab();
  const groupRef = React.useRef<THREE.Group>(null);
  const cartRef = React.useRef<THREE.Group>(null);
  
  // Physics state refs for high performance and smooth animation
  const state = React.useRef({
    x: 0,
    v: 0,
    a: 0,
    netForce: 0,
    frictionForce: 0,
  });

  const g = 9.8;
  const boundary = 12;

  useFrame((_, delta) => {
    if (!isPlaying) return;

    // Fixed timestep for physics if needed, but delta is usually fine for this
    const dt = Math.min(delta, 0.1); 

    const normalForce = mass * g;
    const f_kinetic = frictionCoeff * normalForce;
    const f_static_max = f_kinetic * 1.2;

    let netF = 0;
    const f_applied = appliedForce;
    let currentFriction = 0;

    // Friction logic
    if (Math.abs(state.current.v) < 0.05) {
      // At rest
      if (Math.abs(f_applied) > f_static_max) {
        currentFriction = -Math.sign(f_applied) * f_kinetic;
        netF = f_applied + currentFriction;
      } else {
        // Friction cancels applied force exactly
        currentFriction = -f_applied;
        netF = 0;
        state.current.v = 0;
      }
    } else {
      // In motion
      currentFriction = -Math.sign(state.current.v) * f_kinetic;
      netF = f_applied + currentFriction;
      
      // Prevent friction from causing reversed motion (it should just stop)
      if (f_applied === 0 || Math.sign(f_applied) !== Math.sign(state.current.v)) {
          const vNext = state.current.v + (netF / mass) * dt;
          if (Math.sign(vNext) !== Math.sign(state.current.v)) {
              netF = -state.current.v * mass / dt;
              state.current.v = 0;
          }
      }
    }

    state.current.netForce = netF;
    state.current.frictionForce = currentFriction;
    state.current.a = netF / mass;
    state.current.v += state.current.a * dt;
    state.current.x += state.current.v * dt;

    // Boundaries
    if (state.current.x > boundary) {
      state.current.x = boundary;
      state.current.v = 0;
      state.current.a = 0;
      onBoundaryHit();
    } else if (state.current.x < -boundary) {
      state.current.x = -boundary;
      state.current.v = 0;
      state.current.a = 0;
      onBoundaryHit();
    }

    if (cartRef.current) {
      cartRef.current.position.x = state.current.x;
    }
  });

  // Force Arrow Helper
  const ForceArrow = ({ direction, magnitude, label, opacity = 1, yOffset = 0 }: { 
    direction: number, 
    magnitude: number, 
    label: string, 
    opacity?: number,
    yOffset?: number
  }) => {
    if (Math.abs(magnitude) < 0.1) return null;
    const length = Math.abs(magnitude) * 0.05;
    const dir = Math.sign(magnitude) * direction; // direction is 1 (right) or -1 (left)
    const xPos = (length / 2) * dir;
    
    return (
      <group position={[xPos, yOffset, 0.4]}>
        <Box args={[length, 0.04, 0.04]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6 * opacity} />
        </Box>
        <Cylinder 
          args={[0, 0.08, 0.2]} 
          position={[(length/2) * dir, 0, 0]} 
          rotation={[0, 0, -Math.PI/2 * dir]}
        >
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8 * opacity} />
        </Cylinder>
        <Html position={[0, 0.3, 0]} center className="pointer-events-none">
          <div className="text-[7px] font-mono text-white/40 uppercase whitespace-nowrap bg-black/40 px-1">
            {label}: {Math.abs(magnitude).toFixed(1)}N
          </div>
        </Html>
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {/* Background Grid */}
      <mesh position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40, 40, 40]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>

      {/* Ground Track */}
      <Box args={[30, 0.1, 4]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} transparent opacity={0.2} />
      </Box>

      {/* Distance Markers */}
      {Array.from({ length: 13 }).map((_, i) => {
        const x = (i - 6) * 2;
        return (
          <group key={x} position={[x, 0, 1]}>
            <Box args={[0.02, 0.2, 0.1]}>
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </Box>
            <Html position={[0, -0.4, 0]} center className="pointer-events-none">
              <span className="text-[7px] font-mono text-white/20">{x}m</span>
            </Html>
          </group>
        );
      })}

      {/* The Cart / Bot */}
      <group ref={cartRef}>
        {/* Main Body */}
        <Box args={[1.2, 0.5, 0.8]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Detail Wireframe */}
        <Box args={[1.22, 0.52, 0.82]} position={[0, 0.3, 0]}>
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
        </Box>
        
        {/* Wheels */}
        {[[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]].map(([x, z], i) => (
          <Cylinder 
            key={i} 
            args={[0.15, 0.15, 0.1, 16]} 
            position={[x, 0.15, z]} 
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </Cylinder>
        ))}

        {/* Passenger / Cargo based on mass */}
        <Box args={[0.6, 0.4, 0.6]} position={[0, 0.75, 0]}>
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={Math.min(0.2 + (mass / 20) * 0.8, 1)} 
            metalness={0.5} 
            roughness={0.5} 
          />
        </Box>

        {/* Force Arrows */}
        <ForceArrow direction={1} magnitude={appliedForce} label="F_applied" yOffset={0.3} />
        <ForceArrow direction={1} magnitude={state.current.frictionForce} label="F_friction" yOffset={0.1} opacity={0.6} />

        {/* Vertical Forces (Visual cues) */}
        <group position={[0, 0.3, 0]}>
           {/* Normal Force */}
           <Line 
             points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.8, 0)]} 
             color="#ffffff" opacity={0.2} transparent 
           />
           {/* Gravity */}
           <Line 
             points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.8, 0)]} 
             color="#ffffff" opacity={0.2} transparent 
           />
        </group>

        {/* Live Equation Label - SAFE POSITION: BELOW OBJECT */}
        <Html position={[0, -1.2, 0]} center className="pointer-events-none">
          <div className={cn(
            "flex flex-col items-center gap-1 px-3 py-2 bg-black/80 border border-white/10 backdrop-blur-md",
            isFullscreen ? "scale-110" : "scale-100"
          )}>
            <div className="text-[9px] font-mono font-bold text-white tracking-widest uppercase">
              F_net = m × a
            </div>
            <div className="text-[10px] font-mono text-white/80 whitespace-nowrap">
              {state.current.netForce.toFixed(1)}N = {mass}kg × {state.current.a.toFixed(2)}m/s²
            </div>
          </div>
        </Html>

        {/* Velocity Indicator */}
        {Math.abs(state.current.v) > 0.1 && (
          <Html position={[0, 1.4, 0]} center className="pointer-events-none">
            <div className="text-[8px] font-mono font-bold text-white/60 tracking-tighter uppercase px-2 py-1 bg-white/5 border border-white/5">
              v = {state.current.v.toFixed(1)} m/s
            </div>
          </Html>
        )}
      </group>

      {/* Boundary Warning */}
      {(state.current.x >= boundary || state.current.x <= -boundary) && (
        <Html position={[0, 2.5, 0]} center className="pointer-events-none">
           <div className="px-4 py-2 bg-white text-black font-mono font-bold text-[10px] tracking-widest animate-pulse">
             BOUNDARY REACHED - RESET BOT
           </div>
        </Html>
      )}

      {/* Outer Shell */}
      <mesh>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.02} />
      </mesh>
    </group>
  );
}
