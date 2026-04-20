"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulationStore } from "@/lib/stores/simulation-store";
import { Line, Html } from "@react-three/drei";

export default function EntanglementSim() {
  const { isEntangled, isMeasuredA, isMeasuredB, measuredStateA, measuredStateB, entanglementDistance } = useSimulationStore();
  
  // Scale distance down for the 3D scene (100-500 maps to 1.5 - 5.5)
  const dist = (entanglementDistance / 100) + 0.5; 
  
  const groupRef = React.useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.05;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
       {/* Particle A */}
       <group position={[-dist, 0, 0]}>
         <Particle coreColor="#ffffff" measured={isMeasuredA} measureState={measuredStateA} label="ALICE" />
       </group>
       
       {/* Particle B */}
       <group position={[dist, 0, 0]}>
         <Particle coreColor="#888888" measured={isMeasuredB} measureState={measuredStateB} label="BOB" />
       </group>

       {/* Entanglement Bridge */}
       {isEntangled && !(isMeasuredA && isMeasuredB) && (
         <WaveBridge dist={dist} />
       )}
    </group>
  );
}

function Particle({ coreColor, measured, measureState, label }: { coreColor: string, measured: boolean, measureState: 0 | 1 | null, label: string }) {
  const innerRef = React.useRef<THREE.Mesh>(null);
  const outerRef = React.useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!measured) {
      if (innerRef.current) {
        innerRef.current.rotation.x += delta * 5;
        innerRef.current.rotation.y += delta * 3;
      }
      if (outerRef.current) {
        outerRef.current.rotation.x -= delta * 1.5;
        outerRef.current.rotation.z += delta * 1.5;
      }
    } else {
       // Snap rotation based on measure state
       const targetRotX = measureState === 0 ? 0 : Math.PI;
       if (innerRef.current) {
           innerRef.current.rotation.x = THREE.MathUtils.lerp(innerRef.current.rotation.x, targetRotX, 0.15);
           innerRef.current.rotation.y = THREE.MathUtils.lerp(innerRef.current.rotation.y, 0, 0.15);
           innerRef.current.rotation.z = THREE.MathUtils.lerp(innerRef.current.rotation.z, 0, 0.15);
       }
       if (outerRef.current) {
           outerRef.current.rotation.x = THREE.MathUtils.lerp(outerRef.current.rotation.x, 0, 0.15);
           outerRef.current.rotation.y = THREE.MathUtils.lerp(outerRef.current.rotation.y, 0, 0.15);
           outerRef.current.rotation.z = THREE.MathUtils.lerp(outerRef.current.rotation.z, 0, 0.15);
       }
    }
  });

  return (
    <group>
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={coreColor} wireframe={false} metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>
      
      {/* Measurement Axis bounds */}
      {measured && measureState !== null && (
          <group>
              <Line points={[new THREE.Vector3(0, -1.8, 0), new THREE.Vector3(0, 1.8, 0)]} color="#ffffff" opacity={0.3} transparent />
              <Html position={[0, measureState === 0 ? 2.1 : -2.1, 0]} center className="pointer-events-none">
                  <div className="text-[10px] uppercase font-mono font-bold text-white tracking-[0.2em] px-2 py-1 bg-black border border-white/20 whitespace-nowrap">
                    {measureState === 0 ? "|0⟩ UP" : "|1⟩ DOWN"}
                  </div>
              </Html>
          </group>
      )}

      {/* Persistent Base Label */}
      <Html position={[0, -1.4, 0]} center className="pointer-events-none">
        <div className="text-[10px] uppercase font-mono font-bold text-white/50 tracking-[0.3em] whitespace-nowrap">
          {label}
        </div>
      </Html>
    </group>
  );
}

function WaveBridge({ dist }: { dist: number }) {
  const line1Ref = React.useRef<THREE.Line>(null);
  const line2Ref = React.useRef<THREE.Line>(null);
  const points1 = React.useMemo(() => new Float32Array(100 * 3), []);
  const points2 = React.useMemo(() => new Float32Array(100 * 3), []);

  const line1 = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points1, 3));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.6 }));
  }, [points1]);

  const line2 = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points2, 3));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.3 }));
  }, [points2]);
  
  useFrame((state) => {
    if (!line1Ref.current || !line2Ref.current) return;
    const time = state.clock.getElapsedTime() * 8;
    const positions1 = line1Ref.current.geometry.attributes.position.array as Float32Array;
    const positions2 = line2Ref.current.geometry.attributes.position.array as Float32Array;
    
    // Animate waves from Alice to Bob
    const startX = -dist + 0.6;
    const endX = dist - 0.6;
    const length = endX - startX;
    
    for (let i = 0; i < 100; i++) {
       const x = startX + (i / 99) * length;
       // We create an envelope so it tapers at the ends
       const envelope = Math.sin((i / 99) * Math.PI);
       
       // Wave 1
       positions1[i * 3] = x;
       positions1[i * 3 + 1] = Math.sin((i / 99) * Math.PI * 6 - time) * 0.4 * envelope;
       positions1[i * 3 + 2] = Math.cos((i / 99) * Math.PI * 6 - time) * 0.4 * envelope;

       // Wave 2 (offset phase)
       positions2[i * 3] = x;
       positions2[i * 3 + 1] = Math.sin((i / 99) * Math.PI * 6 - time + Math.PI) * 0.4 * envelope;
       positions2[i * 3 + 2] = Math.cos((i / 99) * Math.PI * 6 - time + Math.PI) * 0.4 * envelope;
    }
    line1Ref.current.geometry.attributes.position.needsUpdate = true;
    line2Ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <primitive object={line1} ref={line1Ref} />
      <primitive object={line2} ref={line2Ref} />
    </group>
  );
}
