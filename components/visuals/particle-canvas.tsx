"use client"

import React, { useRef, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const { mouse, viewport } = useThree()
  
  const count = 400
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5
      
      // Initial color (Violet-ish)
      col[i * 3] = 0.3
      col[i * 3 + 1] = 0.1
      col[i * 3 + 2] = 0.6
      
      siz[i] = Math.random() * 2 + 1
    }
    return [pos, col, siz]
  }, [count])

  const initialPositions = useMemo(() => new Float32Array(positions), [positions])

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.getElapsedTime()
    const posAttr = pointsRef.current.geometry.attributes.position.array as Float32Array
    const colAttr = pointsRef.current.geometry.attributes.color.array as Float32Array

    const mx = (mouse.x * viewport.width) / 2
    const my = (mouse.y * viewport.height) / 2

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Idle drift
      const x = initialPositions[i3]
      const y = initialPositions[i3 + 1]
      
      const driftX = Math.sin(time * 0.2 + i) * 0.2
      const driftY = Math.cos(time * 0.2 + i) * 0.2
      
      let targetX = x + driftX
      let targetY = y + driftY
      
      // Mouse interaction (Attraction)
      const dx = posAttr[i3] - mx
      const dy = posAttr[i3 + 1] - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      if (dist < 3) {
        const force = (3 - dist) / 3
        targetX -= dx * force * 0.1
        targetY -= dy * force * 0.1
        
        // Color shift to Cyan
        colAttr[i3] = THREE.MathUtils.lerp(colAttr[i3], 0.13, 0.1)     // 0.13 is approx #22d3ee R
        colAttr[i3 + 1] = THREE.MathUtils.lerp(colAttr[i3 + 1], 0.82, 0.1) // 0.82 is approx #22d3ee G
        colAttr[i3 + 2] = THREE.MathUtils.lerp(colAttr[i3 + 2], 0.93, 0.1) // 0.93 is approx #22d3ee B
      } else {
        // Return to Violet
        colAttr[i3] = THREE.MathUtils.lerp(colAttr[i3], 0.3, 0.05)
        colAttr[i3 + 1] = THREE.MathUtils.lerp(colAttr[i3 + 1], 0.1, 0.05)
        colAttr[i3 + 2] = THREE.MathUtils.lerp(colAttr[i3 + 2], 0.6, 0.05)
      }

      posAttr[i3] = THREE.MathUtils.lerp(posAttr[i3], targetX, 0.1)
      posAttr[i3 + 1] = THREE.MathUtils.lerp(posAttr[i3 + 1], targetY, 0.1)
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true
    pointsRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      colors={colors}
      sizes={sizes}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        vertexColors
        size={0.1}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

export const ParticleCanvas = () => {
  return (
    <div className="w-full h-full bg-[#0A0C10] relative overflow-hidden">
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "radial-gradient(circle at center, #1E1B4B 0%, #0A0C10 100%)"
        }}
      />
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        aria-label="Interactive particle field representing quantum states"
      >
        <ParticleField />
      </Canvas>
    </div>
  )
}
