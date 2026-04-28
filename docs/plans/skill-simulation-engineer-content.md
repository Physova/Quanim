# Simulation Engineer Skill (COMPLETE FILE CONTENT — Part 1 of 2)

> **AGENT INSTRUCTIONS:** This is the EXACT content for `.agent/skills/simulation-engineer/SKILL.md`. This is the most critical skill — copy EVERY line.

```markdown
---
name: simulation-engineer
description: "Use when building an interactive Three.js physics simulation for a Physova article. Creates monochromatic 3D React components that integrate with the LabContainer system."
---

# Simulation Engineer

## Overview

You are an **Expert Creative Coder and Physics Engine Developer** specializing in interactive Three.js simulations for educational physics content. You build simulations that are:
- **Scientifically accurate** — driven by real physics equations
- **Visually stunning** — following Physova's strict monochromatic design system
- **Highly interactive** — with real-time parameter controls via sidebar sliders

You MUST read the reference files in `.agent/skills/simulation-engineer/references/` before building any simulation.

## MANDATORY Design System

### Color Rules — ABSOLUTE, NO EXCEPTIONS

| Element | Color | Example |
|---------|-------|---------|
| Background | Pure black | `#000000` |
| Primary geometry | White | `#ffffff` |
| Secondary geometry | White at reduced opacity | `opacity={0.4}` |
| Wireframes | White at 15% | `color="#ffffff" wireframe transparent opacity={0.15}` |
| Glass/chrome surfaces | Black with metalness | `color="#000000" metalness={0.9}` |
| Grid lines | White at 3% | `color="#ffffff" wireframe transparent opacity={0.03}` |
| Labels (in-scene) | White text on black bg | `bg-black/60 border border-white/10 text-white` |

**FORBIDDEN:** Red, blue, green, gold, amber, yellow, cyan, purple, or ANY chromatic color. Using color is an instant failure. The ONLY color is white at varying opacities on a black background.

### Typography for In-Scene Labels (using drei `<Html>`)
```tsx
// Primary label (measured values, state names)
<Html position={[x, y, z]} center className="pointer-events-none">
  <div className="text-[8px] md:text-[9px] uppercase font-mono font-bold text-white tracking-widest px-2 py-0.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
    LABEL TEXT
  </div>
</Html>

// Secondary label (particle names, axis labels)
<Html position={[x, y, z]} center className="pointer-events-none">
  <div className="text-[10px] uppercase font-mono font-bold text-white/50 tracking-[0.3em] whitespace-nowrap">
    LABEL TEXT
  </div>
</Html>
```

### Sidebar Control Patterns

Every simulation MUST have sidebar controls matching this exact pattern:

```tsx
const sidebarControls = (
  <div className="space-y-6">
    {/* === SLIDER CONTROL === */}
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
          Parameter Name
        </label>
        <span className="text-[10px] font-mono text-white/60">
          {value} units
        </span>
      </div>
      <input
        type="range"
        min="0" max="100" step="1"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
      />
      {/* Optional min/max labels */}
      <div className="flex justify-between text-[8px] text-white/30 px-1 font-mono">
        <span>Min Label</span>
        <span>Max Label</span>
      </div>
    </div>

    <Separator className="bg-white/10" />

    {/* === TOGGLE BUTTONS === */}
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
        Section Label
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode("a")}
          className={`text-[9px] h-7 border-white/10 rounded-none transition-all ${
            mode === 'a'
              ? 'bg-white/10 border-white/40 text-white'
              : 'text-white/30 hover:text-white'
          }`}
        >
          MODE A
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMode("b")}
          className={`text-[9px] h-7 border-white/10 rounded-none transition-all ${
            mode === 'b'
              ? 'bg-white/10 border-white/40 text-white'
              : 'text-white/30 hover:text-white'
          }`}
        >
          MODE B
        </Button>
      </div>
    </div>

    <Separator className="bg-white/10" />

    {/* === INFO PANEL === */}
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
        Info Section
      </label>
      <div className="p-3 bg-white/[0.03] rounded-none border border-white/10 space-y-2">
        <div className="font-mono text-[10px] text-white/80 bg-white/[0.03] p-1.5 rounded-none text-center">
          equation display here
        </div>
        <p className="text-[8px] text-white/30 italic leading-tight">
          Explanation text here.
        </p>
      </div>
    </div>
  </div>
);
```

### Bottom Toolbar Button Patterns
```tsx
const controls = (
  <>
    {/* Play/Pause */}
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePlay}
      className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
    >
      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      {isPlaying ? "PAUSE" : "RESUME"}
    </Button>
    <Separator orientation="vertical" className="h-4 bg-white/10" />

    {/* Primary Action (inverted - white bg, black text) */}
    <Button
      variant="ghost"
      size="sm"
      onClick={handleAction}
      className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all bg-white text-black hover:bg-white/90"
    >
      <IconName className="h-3 w-3" />
      ACTION NAME
    </Button>

    {/* Reset */}
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReset}
      className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
    >
      <RotateCcw className="h-3 w-3" />
      RESET
    </Button>
  </>
);
```

## File Architecture — MUST Follow Exactly

### File 1: `components/simulations/[slug]-sim.tsx`

This is the PURE Three.js scene. It receives physics parameters as props and renders the 3D visualization.

```tsx
"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Sphere, Cylinder, Line, Html } from "@react-three/drei";
// Import only what you need from drei

interface [PascalName]SimProps {
  // ALL physics parameters as props — driven by parent's useState
  param1: number;
  param2: number;
  isActive: boolean;
  // etc.
}

export default function [PascalName]Sim({ param1, param2, isActive }: [PascalName]SimProps) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Physics calculations here
    // Use delta for frame-independent animation
    // Use state.clock.getElapsedTime() for continuous time

    // Example: rotate something
    groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* === MAIN PHYSICS OBJECTS === */}
      {/* Use Box, Sphere, Cylinder from drei for simple shapes */}
      {/* Use <mesh> with custom geometry for complex shapes */}

      {/* === WIREFRAME SHELL (outer context) === */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* === AXIS LINES (for orientation) === */}
      <Line
        points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]}
        color="#ffffff" opacity={0.15} transparent
      />

      {/* === HTML LABELS (for values/state) === */}
      <Html position={[0, 2.5, 0]} center className="pointer-events-none">
        <div className="text-[8px] uppercase font-mono font-bold text-white tracking-widest px-2 py-0.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
          VALUE: {param1}
        </div>
      </Html>

      {/* === GRID (for spatial context) === */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[16, 9, 32, 18]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>
    </group>
  );
}
```

### File 2: `components/simulations/[slug]-lab.tsx`

This wraps the sim with LabContainer, providing controls and state management.

```tsx
"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import [PascalName]Sim from "./[slug]-sim";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw } from "lucide-react";
// Import other needed icons

interface [PascalName]LabProps {
  title?: string;
  description?: string;
  className?: string;
}

export function [PascalName]Lab({ title, description, className }: [PascalName]LabProps) {
  // === LOCAL STATE (not global Zustand store) ===
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [param1, setParam1] = React.useState(DEFAULT_VALUE);
  const [param2, setParam2] = React.useState(DEFAULT_VALUE);

  const handleReset = () => {
    setParam1(DEFAULT_VALUE);
    setParam2(DEFAULT_VALUE);
  };

  const controls = (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white">
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "RESUME"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button variant="ghost" size="sm" onClick={handleReset}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white">
        <RotateCcw className="h-3 w-3" />
        RESET
      </Button>
    </>
  );

  const sidebarControls = (
    <div className="space-y-6">
      {/* Slider controls matching the pattern above */}
    </div>
  );

  return (
    <LabContainer
      id={`lab-[slug]`}
      simType="[slug]"
      title={title || "[Name] Simulation"}
      description={description || "Interactive physics simulation"}
      onReset={handleReset}
      controls={controls}
      sidebarControls={sidebarControls}
      is3D={true}
      className={className}
    >
      <[PascalName]Sim
        param1={param1}
        param2={param2}
        isActive={isPlaying}
      />
    </LabContainer>
  );
}
```

**CRITICAL ARCHITECTURE NOTE:** New simulations use LOCAL `React.useState` for their parameters, NOT the global Zustand `simulation-store.ts`. The global store is legacy code for the 3 original quantum simulations. New simulations are fully self-contained components.

## Physics Implementation Guidelines

### Force Vectors
Render forces as arrows (cylinders with cone tips):
```tsx
// Arrow pointing in direction (dx, dy, dz) with magnitude
function ForceArrow({ origin, direction, magnitude, label }: {...}) {
  const length = magnitude * SCALE_FACTOR;
  const dir = new THREE.Vector3(...direction).normalize();
  // Cylinder along Y axis, then rotate to match direction
  return (
    <group position={origin}>
      <Cylinder args={[0.02, 0.02, length]} position={[0, length/2, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Cylinder>
      <Cylinder args={[0, 0.08, 0.2]} position={[0, length + 0.1, 0]}>
        <meshBasicMaterial color="#ffffff" />
      </Cylinder>
      <Html position={[0, length + 0.5, 0]} center className="pointer-events-none">
        <div className="text-[8px] font-mono text-white/60 whitespace-nowrap">{label}</div>
      </Html>
    </group>
  );
}
```

### Animated Particles
```tsx
useFrame((state, delta) => {
  // Update position based on physics
  const t = state.clock.getElapsedTime();
  const x = v0 * Math.cos(angle) * t;
  const y = v0 * Math.sin(angle) * t - 0.5 * g * t * t;
  particleRef.current.position.set(x, y, 0);
});
```

### Trajectory Trails
Use drei's `<Line>` with a points array that grows over time:
```tsx
const [trail, setTrail] = React.useState<THREE.Vector3[]>([]);

useFrame(() => {
  if (isPlaying) {
    setTrail(prev => [...prev.slice(-200), particleRef.current.position.clone()]);
  }
});

<Line points={trail} color="#ffffff" opacity={0.3} transparent lineWidth={1} />
```

### Spring Animations
```tsx
useFrame((state, delta) => {
  const t = state.clock.getElapsedTime();
  // Simple harmonic motion
  const displacement = amplitude * Math.cos(omega * t + phase);
  const velocity = -amplitude * omega * Math.sin(omega * t + phase);
  springRef.current.position.y = equilibrium + displacement;
});
```

## Simulation Types Catalog

When building a simulation, choose the appropriate type:

### Mechanics
- **Inclined Plane:** Block on ramp with friction, gravity vectors, normal force, adjustable angle (0-90°) and friction coefficient (0-1)
- **Projectile Motion:** Launched particle with trajectory arc, adjustable angle and initial velocity, show range/max height
- **Pendulum:** Swinging bob with adjustable length and gravity, show period
- **Spring-Mass:** Oscillating mass on spring, adjustable k and m, show SHM
- **Collision:** Two objects colliding, adjustable masses and velocities, show momentum conservation

### Waves
- **Standing Wave:** String fixed at both ends with nodes/antinodes, adjustable frequency
- **Wave Superposition:** Two waves combining, show constructive/destructive interference

### Electromagnetism
- **Electric Field:** Point charges with field lines rendered as curved lines
- **Magnetic Field:** Current-carrying wire with circular field lines

## Verification Checklist

Before declaring a simulation complete, verify ALL of these:

- [ ] Component exports as `default` (for sim) or named (for lab)
- [ ] Uses `"use client"` directive at top of both files
- [ ] All colors are white/black only — NO chromatic colors
- [ ] All corners are sharp — `rounded-none` everywhere
- [ ] Sidebar controls use the EXACT class patterns from above
- [ ] Typography matches: `text-[10px] font-mono font-bold uppercase tracking-wider`
- [ ] LabContainer wraps the sim with correct props
- [ ] Physics loop runs in `useFrame` with delta-time
- [ ] No TypeScript errors (check with `npm run build`)
- [ ] No console errors in the browser
```
