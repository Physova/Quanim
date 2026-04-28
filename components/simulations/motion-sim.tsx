"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Sphere, Cylinder, Line, Html } from "@react-three/drei";
import { useLab } from "./lab-container";
import { cn } from "@/lib/utils";

interface MotionSimProps {
  initialVelocity: number; // u
  acceleration: number;    // a
  isPlaying: boolean;
  onBoundaryReached?: () => void;
  resetKey: number;
}

export default function MotionSim({ 
  initialVelocity, 
  acceleration, 
  isPlaying, 
  onBoundaryReached,
  resetKey 
}: MotionSimProps) {
  const { isFullscreen } = useLab();
  const cartRef = React.useRef<THREE.Group>(null);
  // ... rest of the setup code remains same ...
  const timeRef = React.useRef(0);
  const boundaryReachedRef = React.useRef(false);
  
  // Refs for direct DOM manipulation of labels (performance)
  const vLabelRef = React.useRef<HTMLDivElement>(null);
  const sLabelRef = React.useRef<HTMLDivElement>(null);
  const eqLabelRef = React.useRef<HTMLDivElement>(null);
  const velocityArrowRef = React.useRef<THREE.Group>(null);

  const [trail, setTrail] = React.useState<THREE.Vector3[]>([]);

  const boundaryAlertRef = React.useRef<HTMLDivElement>(null);

  // Constants for boundaries
  const TRACK_LIMIT = 20;

  // Handle reset
  React.useEffect(() => {
    timeRef.current = 0;
    setTrail([]);
    boundaryReachedRef.current = false;
    
    if (cartRef.current) {
      cartRef.current.position.set(0, 0.45, 0);
    }
    
    // Reset labels
    if (vLabelRef.current) vLabelRef.current.textContent = `V = ${initialVelocity.toFixed(1)} M/S`;
    if (sLabelRef.current) sLabelRef.current.textContent = `S = 0.0 M`;
    if (eqLabelRef.current) {
      eqLabelRef.current.textContent = `v = ${initialVelocity} + (${acceleration}) × 0.00 = ${initialVelocity.toFixed(2)} m/s`;
    }
    if (velocityArrowRef.current) {
      velocityArrowRef.current.scale.setScalar(Math.abs(initialVelocity) > 0.1 ? 1 : 0.001);
      velocityArrowRef.current.rotation.y = initialVelocity >= 0 ? 0 : Math.PI;
    }
    if (boundaryAlertRef.current) {
      boundaryAlertRef.current.style.display = "none";
    }
  }, [resetKey, initialVelocity, acceleration]);

  useFrame((state, delta) => {
    if (!isPlaying || boundaryReachedRef.current) return;

    // Increment time
    timeRef.current += delta;

    const u = initialVelocity;
    const a = acceleration;
    const t = timeRef.current;

    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;

    // Update DOM labels directly
    if (vLabelRef.current) vLabelRef.current.textContent = `V = ${v.toFixed(1)} M/S`;
    if (sLabelRef.current) sLabelRef.current.textContent = `S = ${s.toFixed(1)} M`;
    if (eqLabelRef.current) {
      eqLabelRef.current.textContent = `v = ${u} + (${a}) × ${t.toFixed(2)} = ${v.toFixed(2)} m/s`;
    }

    // Update cart and visual elements
    if (cartRef.current) {
      cartRef.current.position.x = s;

      // Rotate wheels
      const ds = v * delta;
      const dTheta = ds / 0.2;
      cartRef.current.children[0].children.forEach((child) => {
        if (child.name === "wheel") {
          child.rotation.y += dTheta;
        }
      });

      // Update velocity arrow length and visibility
      if (velocityArrowRef.current) {
        const absV = Math.abs(v);
        velocityArrowRef.current.scale.setScalar(absV > 0.1 ? 1 : 0.001);
        velocityArrowRef.current.rotation.y = v >= 0 ? 0 : Math.PI;
        
        const arrowLength = Math.min(3, 0.5 + absV * 0.2);
        velocityArrowRef.current.scale.x = arrowLength;
      }

      // Update trail every few frames
      if (state.clock.elapsedTime % 0.1 < 0.02) {
        setTrail((prev) => [...prev.slice(-100), cartRef.current!.position.clone().add(new THREE.Vector3(0, -0.3, 0))]);
      }
    }

    // Boundary check
    if (Math.abs(s) >= TRACK_LIMIT) {
      boundaryReachedRef.current = true;
      if (boundaryAlertRef.current) {
        boundaryAlertRef.current.style.display = "block";
      }
      if (onBoundaryReached) onBoundaryReached();
    }
  });

  return (
    <group>
      {/* Background Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>

      {/* Track */}
      <Box args={[TRACK_LIMIT * 2 + 2, 0.1, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} transparent opacity={0.4} />
      </Box>

      {/* Distance Markers */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = (i - 4) * 5;
        return (
          <group key={x} position={[x, 0, 0]}>
            <Box args={[0.05, 0.3, 2.1]} position={[0, 0.15, 0]}>
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </Box>
            <Html position={[0, -0.5, 1.1]} center className="pointer-events-none">
              <div className="text-[8px] font-mono text-white/40 tracking-widest bg-black/40 px-1 border border-white/5">
                {x}M
              </div>
            </Html>
          </group>
        );
      })}

      {/* Trail */}
      {trail.length > 1 && (
        <Line points={trail} color="#ffffff" opacity={0.2} transparent lineWidth={1} />
      )}

      {/* Cart */}
      <group ref={cartRef} position={[0, 0.45, 0]}>
        {/* Wheels Group */}
        <group>
          {/* Wheel positions: [x, y, z] */}
          {[
            [-0.4, -0.2, 0.45],
            [0.4, -0.2, 0.45],
            [-0.4, -0.2, -0.45],
            [0.4, -0.2, -0.45],
          ].map((pos, i) => (
            <Cylinder 
              key={i} 
              name="wheel"
              args={[0.2, 0.2, 0.1, 16]} 
              position={pos as [number, number, number]} 
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
              {/* Wheel spoke detail */}
              <Box args={[0.05, 0.35, 0.12]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#000000" />
              </Box>
            </Cylinder>
          ))}
        </group>

        {/* Cart Body */}
        <Box args={[1.2, 0.4, 0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.7} />
        </Box>
        {/* Cart Upper Detail */}
        <Box args={[0.8, 0.2, 0.6]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.5} transparent opacity={0.8} />
        </Box>
        {/* Cart Sensor Detail */}
        <Box args={[0.1, 0.4, 0.1]} position={[-0.4, 0.4, 0]}>
          <meshBasicMaterial color="#ffffff" />
        </Box>
        <Sphere args={[0.05, 16, 16]} position={[-0.4, 0.6, 0]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>

        {/* Velocity Arrow */}
        <group ref={velocityArrowRef}>
          <Cylinder 
            args={[0.02, 0.02, 1]} 
            position={[1.1, 0.1, 0]} 
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          <Cylinder 
            args={[0, 0.08, 0.2]} 
            position={[1.6, 0.1, 0]} 
            rotation={[0, 0, -Math.PI / 2]}
          >
            <meshBasicMaterial color="#ffffff" />
          </Cylinder>
          <Html position={[1.1, 0.5, 0]} center className="pointer-events-none">
            <div ref={vLabelRef} className="text-[8px] font-mono text-white/80 whitespace-nowrap bg-black/60 px-2 py-0.5 border border-white/10 backdrop-blur-md">
              V = 0.0 M/S
            </div>
          </Html>
        </group>

        {/* Displacement Label */}
        <Html position={[0, -0.8, 0]} center className="pointer-events-none">
          <div ref={sLabelRef} className="text-[10px] font-mono font-bold text-white tracking-widest px-3 py-1.5 bg-black/80 border border-white/20 backdrop-blur-md whitespace-nowrap uppercase">
            S = 0.0 M
          </div>
        </Html>
      </group>

      {/* Boundary Reached Alert */}
      <Html position={[0, 3, 0]} center className="pointer-events-none">
        <div ref={boundaryAlertRef} style={{ display: "none" }} className="text-[10px] font-mono font-bold text-white tracking-[0.2em] px-4 py-2 bg-black border border-white/40 animate-pulse whitespace-nowrap uppercase">
          LIMIT REACHED: RESET REQUIRED
        </div>
      </Html>

      {/* Live Equation Display (Floating) */}
      <Html 
        position={[0, isFullscreen ? 4 : 2.2, -2]} 
        center 
        className="pointer-events-none transition-all duration-500"
      >
        <div className={cn(
          "p-3 bg-black/60 border border-white/10 backdrop-blur-md space-y-1 transition-all duration-500",
          !isFullscreen && "scale-75 opacity-90"
        )}>
          <div className="text-[8px] text-white/40 uppercase tracking-tighter">Current State</div>
          <div ref={eqLabelRef} className="text-[10px] md:text-[12px] font-mono text-white whitespace-nowrap">
            v = 0.0 + (0.0) × 0.00 = 0.00 m/s
          </div>
          <div className="text-[8px] text-white/30 italic">v = u + at</div>
        </div>
      </Html>
    </group>
  );
}

