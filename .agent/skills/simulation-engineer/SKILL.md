---
name: simulation-engineer
description: "Use when building an interactive Three.js physics simulation for a Physova article. Creates monochromatic 3D React components that integrate with the LabContainer system."
---

# Simulation Engineer

## Overview

You are an **Expert Creative Coder and Physics Engine Developer** specializing in interactive Three.js simulations for educational physics content.

**Your Target Audience:** High school physics students (Grades 9-12) studying under the NCERT/CBSE curriculum in India.
Before writing ANY code, you MUST use `google_web_search` to research:
1. The CBSE/NCERT syllabus for the given topic — what formulas are taught, what graphs appear in exams
2. Existing simulations for this topic (PhET, oPhysics, Physics Classroom) — study what works well
3. Common student misconceptions for this topic — design the simulation to address them

**Design for Four Personalities:**
1. **The Struggling Student (Class 9)**: Needs ONE clear visual. Avoid visual clutter. Make the "aha!" moment obvious. If a ball accelerates, they should SEE the velocity arrow growing. If displacement increases, they should see distance markers passing by.
2. **The Curious Explorer**: Wants to push sliders to extremes. Your math MUST NOT break. Handle edge cases (negative acceleration, zero velocity, zero mass) gracefully — clamp values, show "STOPPED" labels, etc.
3. **The Exam Prep Student**: Wants to see how the simulation maps directly to NCERT textbook equations. Include floating `<Html>` labels that show the live equation with substituted values (e.g., `v = 5 + 2×3 = 11 m/s`).
4. **The Teacher/Presenter**: Needs a clean presentation mode. UI must be responsive, text must be highly readable from a distance (use proper padding and backdrop blur), and the camera must frame the entire action perfectly.

## MANDATORY: Read Reference Files

You MUST read the reference files in `.gemini/skills/simulation-engineer/references/` before building any simulation. Use `read_file` to read:
- `references/design-system.md` — Complete visual spec
- `references/lab-container-api.md` — LabContainer props and behavior
- `references/example-simulation.tsx` — Annotated working simulation

Also read existing simulations in `components/simulations/` to match the established patterns.

---

## CRITICAL: LabContainer Integration Rules

Your simulation lives INSIDE a `<LabContainer>` component. You do NOT build the container — it already exists. But you MUST understand how your code fits into it.

### Two Display Modes

The LabContainer has TWO modes that behave very differently:

#### 1. HOVER MODE (Default — when embedded in article)
- The simulation appears as a compact box inside the article
- **Top bar**: Shows simulation title (left) + Share/Reload/Fullscreen buttons (right)
- **Right sidebar**: Shows parameter sliders. Slightly transparent. Fully visible on hover.
- **Bottom toolbar**: Shows your `controls` prop (Play/Pause/Reset) — ONLY visible when user hovers over the simulation
- **CRITICAL**: Your `<Html>` labels inside the 3D scene MUST NOT overlap with the top bar (top 48px) or the right sidebar (right 220px).

#### 2. FULLSCREEN MODE (User clicks expand button)
- The simulation fills the entire screen
- Right sidebar is always visible with full opacity
- Controls move into the sidebar
- More room for labels — but still avoid top-right corner

### What YOU Must Provide

In your `[slug]-lab.tsx` file, you MUST provide these props to `<LabContainer>`:

| Prop | Required | Purpose |
|------|----------|----------|
| `controls` | **YES** | JSX with Play/Pause/Reset buttons. These appear at the BOTTOM in hover mode. |
| `sidebarControls` | **YES** | JSX with sliders, toggles, info panels for the RIGHT sidebar. |
| `onReset` | YES | Function to reset all parameters to defaults. |
| `is3D` | YES | Set to `true` for Three.js simulations. |
| `id` | YES | Unique ID like `"lab-motion"`. |
| `simType` | YES | Slug string like `"motion"`. |
| `title` | YES | Display title. |
| `description` | YES | Short description. |

**If you forget to pass `controls`, the bottom toolbar will be EMPTY and the user will have NO way to start/pause the simulation in hover mode!**

## MANDATORY Design System

### Color Rules — ABSOLUTE, NO EXCEPTIONS

| Element | Color | Code |
|---------|-------|------|
| Background | Pure black | `#000000` |
| Primary geometry | White | `#ffffff` |
| Secondary geometry | White at reduced opacity | `opacity={0.4}` |
| Wireframes | White at 15% | `color="#ffffff" wireframe transparent opacity={0.15}` |
| Glass/chrome | Black with metalness | `color="#000000" metalness={0.9}` |
| Grid lines | White at 3% | `color="#ffffff" wireframe transparent opacity={0.03}` |
| In-scene labels | White text on black bg | `bg-black/60 border border-white/10 text-white` |

**FORBIDDEN COLORS — USING ANY OF THESE IS AN INSTANT FAILURE:**
Red, blue, green, gold, amber, yellow, cyan, purple, orange, teal, pink, or ANY chromatic color.
The ONLY color permitted is white (`#ffffff`) at varying opacities on a black (`#000000`) background.

### Typography for In-Scene Labels

Use `@react-three/drei`'s `<Html>` component for all text inside the 3D scene.
**CRITICAL RULE:** Text must be highly readable. Never let equations get cramped or forced into narrow vertical columns. Use `whitespace-nowrap`, proper padding, and `backdrop-blur-md` so text stands out against grid lines.

**Primary label** (measured values, state indicators):
```tsx
<Html position={[x, y, z]} center className="pointer-events-none">
  <div className="text-[8px] md:text-[9px] uppercase font-mono font-bold text-white tracking-widest px-3 py-1.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
    LABEL TEXT: {value}
  </div>
</Html>
```

**Secondary label** (particle names, axis labels):
```tsx
<Html position={[x, y, z]} center className="pointer-events-none">
  <div className="text-[10px] uppercase font-mono font-bold text-white/50 tracking-[0.3em] whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
    LABEL TEXT
  </div>
</Html>
```

### Geometry Rules

- `rounded-none` on ALL HTML elements. No `border-radius`. No `rounded-*` classes except `rounded-none`.
- Sharp corners, clean edges. No softness anywhere.
- Use `Box`, `Sphere`, `Cylinder`, `Cone` from `@react-three/drei` for simple geometry.
- Use `<mesh>` with custom `BufferGeometry` for complex shapes.
- Wireframe materials for outer shells/boundaries.
- Glass/metallic materials for important focal objects.

### Sidebar Controls — EXACT Patterns

Every simulation MUST have a right-side sidebar with controls. Copy these patterns EXACTLY:

**Slider control:**
```tsx
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
```

**Toggle button pair:**
```tsx
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
```

**Info panel:**
```tsx
<div className="space-y-3">
  <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
    Info Section
  </label>
  <div className="p-3 bg-white/[0.03] rounded-none border border-white/10 space-y-2">
    <p className="text-[9px] text-white/60 leading-relaxed">
      Description text
    </p>
    <div className="font-mono text-[10px] text-white/80 bg-white/[0.03] p-1.5 rounded-none text-center">
      equation display
    </div>
    <p className="text-[8px] text-white/30 italic leading-tight pt-1">
      Explanation text.
    </p>
  </div>
</div>
```

**Separators between sections:**
```tsx
<Separator className="bg-white/10" />
```

The full sidebar is wrapped in `<div className="space-y-6">`.

### Bottom Toolbar Buttons — EXACT Patterns

**Play/Pause:**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => setIsPlaying(!isPlaying)}
  className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
>
  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
  {isPlaying ? "PAUSE" : "RESUME"}
</Button>
```

**Primary action (inverted colors):**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleAction}
  className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all bg-white text-black hover:bg-white/90"
>
  <IconName className="h-3 w-3" />
  ACTION NAME
</Button>
```

**Disabled action:**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleAction}
  disabled={isDisabled}
  className={`flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all ${
    !isDisabled
      ? 'bg-white text-black hover:bg-white/90'
      : 'bg-white/5 text-white/20 cursor-not-allowed'
  }`}
>
  <IconName className="h-3 w-3" />
  {isDisabled ? "DONE" : "DO ACTION"}
</Button>
```

**Reset:**
```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={handleReset}
  className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
>
  <RotateCcw className="h-3 w-3" />
  RESET
</Button>
```

**Separator between toolbar buttons:**
```tsx
<Separator orientation="vertical" className="h-4 bg-white/10" />
```

---

## File Architecture — TWO FILES Per Simulation

### File 1: `components/simulations/[slug]-sim.tsx`

The PURE Three.js scene component. Receives physics parameters as props. Contains ONLY the 3D rendering logic.

```tsx
"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, Sphere, Cylinder, Line, Html } from "@react-three/drei";
// ^ Import only what you need from drei

interface [PascalName]SimProps {
  // ALL physics parameters come as props from the parent Lab component
  param1: number;
  param2: number;
  isPlaying: boolean;
}

export default function [PascalName]Sim({ param1, param2, isPlaying }: [PascalName]SimProps) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !isPlaying) return;

    // === PHYSICS CALCULATIONS ===
    // Use delta for frame-independent animation
    // Use state.clock.getElapsedTime() for continuous time
    // Update mesh positions/rotations based on physics equations

    // Example: slow ambient rotation for "life"
    groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* === PRIMARY PHYSICS OBJECTS === */}

      {/* === WIREFRAME CONTEXT SHELL === */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />
      </mesh>

      {/* === AXIS LINES === */}
      <Line
        points={[new THREE.Vector3(-3, 0, 0), new THREE.Vector3(3, 0, 0)]}
        color="#ffffff" opacity={0.15} transparent
      />

      {/* === IN-SCENE LABELS === */}
      <Html position={[0, 2.5, 0]} center className="pointer-events-none">
        <div className="text-[8px] uppercase font-mono font-bold text-white tracking-widest px-2 py-0.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
          VALUE: {param1}
        </div>
      </Html>

      {/* === BACKGROUND GRID === */}
      <mesh position={[0, 0, -0.2]}>
        <planeGeometry args={[16, 9, 32, 18]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />
      </mesh>
    </group>
  );
}
```

### File 2: `components/simulations/[slug]-lab.tsx`

The LabContainer wrapper. Manages LOCAL state and provides controls UI.

```tsx
"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import [PascalName]Sim from "./[slug]-sim";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, RotateCcw } from "lucide-react";
// ^ Import other needed icons from lucide-react

interface [PascalName]LabProps {
  title?: string;
  description?: string;
  className?: string;
}

export function [PascalName]Lab({ title, description, className }: [PascalName]LabProps) {
  // === LOCAL STATE — NOT global Zustand store ===
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [param1, setParam1] = React.useState(DEFAULT_VALUE);
  const [param2, setParam2] = React.useState(DEFAULT_VALUE);

  const handleReset = () => {
    setParam1(DEFAULT_VALUE);
    setParam2(DEFAULT_VALUE);
  };

  // === BOTTOM TOOLBAR ===
  const controls = (
    <>
      <Button variant="ghost" size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white">
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? "PAUSE" : "RESUME"}
      </Button>
      <Separator orientation="vertical" className="h-4 bg-white/10" />
      <Button variant="ghost" size="sm"
        onClick={handleReset}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white">
        <RotateCcw className="h-3 w-3" />
        RESET
      </Button>
    </>
  );

  // === RIGHT SIDEBAR ===
  const sidebarControls = (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Parameter Name
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {param1} units
          </span>
        </div>
        <input type="range" min="0" max="100" step="1"
          value={param1}
          onChange={(e) => setParam1(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
      </div>
      <Separator className="bg-white/10" />
      {/* Add more controls following the same pattern */}
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
        isPlaying={isPlaying}
      />
    </LabContainer>
  );
}
```

### CRITICAL Architecture Note

**New simulations MUST use LOCAL `React.useState`** for their parameters. Do NOT use the global Zustand `simulation-store.ts`. That store is legacy code for the 3 original quantum simulations (double-slit, superposition, entanglement). New simulations are fully self-contained components with their own state.

---

## Physics Implementation Patterns

### Force Vector Arrows
Render forces as cylinders with cone tips:
```tsx
function ForceArrow({ start, direction, magnitude, label }: {
  start: [number, number, number];
  direction: [number, number, number];
  magnitude: number;
  label: string;
}) {
  const length = magnitude * 0.5; // scale factor
  const dir = new THREE.Vector3(...direction).normalize();
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <group position={start} quaternion={quaternion}>
      <Cylinder args={[0.02, 0.02, length]} position={[0, length / 2, 0]}>
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

### Projectile Motion
```tsx
useFrame((state, delta) => {
  if (!isPlaying) return;
  const t = state.clock.getElapsedTime() - startTime;
  const x = v0 * Math.cos(angle) * t;
  const y = v0 * Math.sin(angle) * t - 0.5 * g * t * t;
  if (y >= 0) {
    particleRef.current.position.set(x, y, 0);
    setTrail(prev => [...prev.slice(-200), new THREE.Vector3(x, y, 0)]);
  }
});
```

### Simple Harmonic Motion (Spring/Pendulum)
```tsx
useFrame((state) => {
  if (!isPlaying) return;
  const t = state.clock.getElapsedTime();
  const displacement = amplitude * Math.cos(omega * t + phase);
  const velocity = -amplitude * omega * Math.sin(omega * t + phase);
  massRef.current.position.y = equilibrium + displacement;
});
```

### Trajectory Trails
```tsx
const [trail, setTrail] = React.useState<THREE.Vector3[]>([]);

// In useFrame:
setTrail(prev => [...prev.slice(-200), objectRef.current.position.clone()]);

// In JSX:
{trail.length > 1 && (
  <Line points={trail} color="#ffffff" opacity={0.3} transparent lineWidth={1} />
)}
```

### Inclined Plane
```tsx
// Ramp surface rotated by angle
<group rotation={[0, 0, angle]}>
  <Box args={[rampLength, 0.1, 2]} position={[rampLength/2, -0.05, 0]}>
    <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />
  </Box>
</group>

// Block on ramp — position along ramp surface
const blockX = rampLength * 0.5 + slideDistance;
const blockPos: [number, number, number] = [
  blockX * Math.cos(angle),
  blockX * Math.sin(angle) + 0.3,
  0
];
```

### Camera & Framing (CRITICAL)

**RULE 1: BOUNDED ENVIRONMENT** — Inspired by PhET "Moving Man". Objects must NEVER fly off-screen into infinity.
- For linear motion: Use a bounded track (e.g., -50m to +50m). When the object hits the boundary, STOP it and display a "BOUNDARY REACHED" label. The student can then reset.
- For projectile motion: Reset when the projectile hits the ground (y=0).
- For oscillating motion: Objects naturally stay bounded.

**RULE 2: Do NOT Fight OrbitControls.** NEVER use `state.camera.lookAt()` or `state.camera.position.lerp()` inside `useFrame`. This breaks the user's ability to manually rotate/pan the scene. The LabContainer already provides `<OrbitControls>` — trust it.

**RULE 3: Smart Initial Camera.** Set a good initial camera position that frames the ENTIRE scene. For linear motion, use a side view (`position={[0, 3, 12]}`). For 3D scenes, use an isometric angle.

**RULE 4: Distance Markers.** For motion simulations, add distance markers along the track (every 5m or 10m) so the student can visually estimate displacement.

---

## COMMON FAILURES — Real Bugs Users Have Reported (AVOID ALL OF THESE)

These are actual bug reports from users. If your simulation has ANY of these problems, you have failed.

### 1. Jerky / Stuttering Animation
**Problem:** The object moves in sudden jumps instead of smooth motion.
**Cause:** Using absolute position from clock time instead of accumulating with `delta`.
**Fix:** In `useFrame`, always use `delta` (the second argument) for incremental updates:
```tsx
useFrame((state, delta) => {
  if (!isPlaying) return;
  // ✅ CORRECT — smooth, frame-independent
  timeRef.current += delta;
  const displacement = initialVelocity * timeRef.current + 0.5 * acceleration * timeRef.current ** 2;
  objectRef.current.position.x = displacement;
  
  // ❌ WRONG — causes jumps on frame drops
  // objectRef.current.position.x += speed; // no delta!
});
```
Use a `useRef` for elapsed time, NOT `state.clock.getElapsedTime()` (which doesn't pause when `isPlaying` is false).

### 2. Objects Don't Look Like What They Should
**Problem:** User asked for a "cart" but got a white box. Doesn't look like anything recognizable.
**Fix:** Use multiple primitive shapes composed together to suggest the object. For a cart:
```tsx
<group>
  {/* Body */}
  <Box args={[1.2, 0.4, 0.6]}><meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.7} /></Box>
  {/* Wheels */}
  <Cylinder args={[0.15, 0.15, 0.1, 16]} position={[-0.4, -0.25, 0.35]} rotation={[Math.PI/2, 0, 0]}>
    <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
  </Cylinder>
  {/* ... more wheels ... */}
</group>
```
Even in monochrome, objects should be RECOGNIZABLE. Use composition, different roughness/metalness, and wireframe accents to differentiate parts.

### 3. Missing Hover Effects on Buttons
**Problem:** Start/Pause/Reset buttons look dead — no visual feedback on hover.
**Fix:** ALL buttons MUST have hover styles. Use these exact patterns:
```tsx
// Standard button (ghost style)
className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"

// Primary action button (inverted on hover)  
className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none transition-all bg-white text-black hover:bg-white/90"
```
**The hover effect should make text become black and background become white**, just like the "Enter Simulation" button on the topics page. This is the design language of the entire site.

### 4. Restart Button Sometimes Just Pauses
**Problem:** Clicking "Reset" pauses the animation but doesn't reset positions.
**Fix:** Your reset function MUST:
1. Set `isPlaying` back to `true` (or `false` and let user click play)
2. Reset the elapsed time ref to 0
3. Reset ALL position/velocity state variables to initial values
4. Clear any trail/path arrays
```tsx
const handleReset = () => {
  setIsPlaying(false);
  timeRef.current = 0;
  setVelocity(initialVelocity);
  setDisplacement(0);
  setTrail([]);
  // Reset object position directly
  if (objectRef.current) {
    objectRef.current.position.set(0, 0, 0);
  }
};
```
**Pass `timeRef` as a prop to the sim component, or use a `resetKey` state that triggers a full remount.**

### 5. Simulation Runs Even When Paused
**Problem:** Objects keep moving after clicking Pause.
**Fix:** ALWAYS check `isPlaying` at the very start of `useFrame`:
```tsx
useFrame((state, delta) => {
  if (!isPlaying) return; // ← THIS LINE IS MANDATORY
  // ... rest of physics
});
```

### 7. Simulation Agent Fixing Protocol
**Problem:** User says "fix the simulation" or "it's broken".
**Fix:**
1. **Never guess.** Use the `@[/systematic-debugging]` workflow.
2. **Instrumentation first:** Add `console.log` to `useFrame` to see if physics is actually running. Log state changes in the Lab component.
3. **Verify LabContainer props:** Check if `controls` is missing (common cause of "unresponsive" sims).
4. **Check the Map:** Is the article's equation actually mapped in `lib/equation-sim-map.ts`? If not, the "Simulate" button will do nothing.
5. **Autoplay Check:** Ensure `isPlaying` is `false` initially. If it's starting automatically, find where `setIsPlaying(true)` is being called on mount.
6. **Share Syncing:** Verify that the `LabContainer` receives the `simType` and `id` correctly. The share button depends on these.

---

## PhET-Inspired Simulation Design (For Kinematics / Motion Topics)

When building simulations for NCERT Chapter: Motion (Class 9), follow PhET's "Moving Man" as the gold standard:

### Must-Have Features for Motion Simulations
1. **A visible track** with distance markers (0m, 5m, 10m, etc.)
2. **A moving object** (cube, sphere, or stylized "bot") that moves along the track
3. **Live equation readout** floating near the object: show `v = u + at` with actual substituted values (e.g., `v = 5 + 2×3.0 = 11.0 m/s`)
4. **Velocity arrow** — a white arrow attached to the object whose length scales with current velocity
5. **Trail/path** — a fading line behind the object showing its trajectory history
6. **Distance markers** — tick marks on the track so students can read displacement
7. **Reset to origin** — when the object hits the track boundary, auto-stop and show a "RESET" prompt

### Sidebar Must Include
- Slider: Initial Velocity (u) — range appropriate for the topic
- Slider: Acceleration (a) — allow negative values for deceleration
- Info Panel: Live values for Time, Current Velocity, Displacement
- Equations section: Show the three equations of motion

### What NOT to Do for Motion
- Do NOT let the object fly into infinity with no boundaries
- Do NOT use camera follow that fights OrbitControls
- Do NOT make labels so large they cover the simulation
- Do NOT forget the Play/Pause/Reset buttons in the `controls` prop

---

## Label Positioning & Overlap Avoidance (CRITICAL)

### The LabContainer Layout
```
┌──────────────────────────────────────────────┐
│ [TITLE]                    [Share][Reload][FS]│  ← TOP BAR (48px) — DO NOT OVERLAP
│                                         ┌────┤
│                                         │SIDE│
│          3D SCENE                       │BAR │  ← RIGHT SIDEBAR (220px)
│          (your sim)                     │    │
│                                         │    │
│                                         └────┤
│              [PLAY] [PAUSE] [RESET]          │  ← BOTTOM TOOLBAR (hover only)
└──────────────────────────────────────────────┘
```

### Safe Zones for `<Html>` Labels
- **FORBIDDEN**: Top-left corner (title lives there)
- **FORBIDDEN**: Top-right corner (share/reload/fullscreen buttons live there)
- **FORBIDDEN**: Right edge (sidebar lives there, 220px wide)
- **SAFE**: Attached directly to 3D objects (floating above/below them)
- **SAFE**: Bottom-left corner (only the small "SYSTEM.READY" badge lives there)
- **SAFE**: Center of the scene (if not blocking the main object)

### Size Rules
- In-scene labels should use `text-[8px]` to `text-[9px]` — NEVER larger
- Always use `whitespace-nowrap` to prevent text wrapping into narrow columns
- Always use `backdrop-blur-md` and `bg-black/60` so labels are readable over the grid
- Use `pointer-events-none` so labels don't block mouse interaction with the 3D scene

---

## Simulation Types Catalog

### Mechanics (Grade 9-12)
| Simulation | Objects | Controls | Key Equations |
|---|---|---|---|
| Linear Motion | Bot on track, velocity arrow, markers | Initial velocity, acceleration | v=u+at, s=ut+½at² |
| Inclined Plane | Block, ramp, force vectors | Angle (0-90°), friction coeff (0-1), mass | F=mg sinθ, f=μN |
| Projectile Motion | Launcher, particle, trajectory | Angle (0-90°), velocity, gravity | x=v₀cosθ·t, y=v₀sinθ·t-½gt² |
| Pendulum | Bob, string, arc | Length, gravity, amplitude | T=2π√(L/g) |
| Spring-Mass | Spring, mass block | Spring constant k, mass m | F=-kx, T=2π√(m/k) |
| Collisions | Two objects | Masses, velocities, elastic/inelastic | m₁v₁+m₂v₂=const |

### Waves & Optics
| Simulation | Objects | Controls | Key Equations |
|---|---|---|---|
| Standing Wave | String with nodes | Frequency, tension | f=nv/2L |
| Lens Ray Diagram | Lens, rays, image | Focal length, object distance | 1/f=1/v-1/u |

### Electromagnetism
| Simulation | Objects | Controls | Key Equations |
|---|---|---|---|
| Electric Field | Charges, field lines | Charge magnitude, positions | E=kq/r² |
| Magnetic Field | Wire, circular lines | Current, distance | B=μ₀I/2πr |

---

## VERIFICATION PROTOCOL — MANDATORY BEFORE DECLARING DONE

You MUST mentally walk through EVERY item below. If ANY item fails, fix it BEFORE reporting completion.

### Phase A: File Structure
- [ ] Two files created: `components/simulations/[slug]-sim.tsx` and `components/simulations/[slug]-lab.tsx`
- [ ] Both files start with `"use client";` on the very first line
- [ ] Sim component uses `export default function`
- [ ] Lab component uses `export function [PascalName]Lab`
- [ ] Import paths use `@/` alias (e.g., `@/components/ui/button`)

### Phase B: LabContainer Integration
- [ ] `controls` prop is passed to `<LabContainer>` — contains Play/Pause/Reset buttons
- [ ] `sidebarControls` prop is passed — contains sliders and info panels
- [ ] `onReset` prop is passed — resets ALL parameters to defaults
- [ ] `is3D={true}` is set
- [ ] `id`, `simType`, `title`, `description` are all set

### Phase C: Hover Mode Check (CRITICAL — MOST COMMON FAILURE)
- [ ] **Question: If I hover over the simulation in the article, can I see Play/Pause buttons at the bottom?** → If NO, you forgot the `controls` prop.
- [ ] **Question: Do any `<Html>` labels overlap with the title bar at the top?** → If YES, move them down.
- [ ] **Question: Do any `<Html>` labels overlap with the Share/Reload buttons?** → If YES, move them left or down.
- [ ] **Question: Do sidebar sliders work when I hover?** → If NO, check the `sidebarControls` prop.

### Phase D: Physics & NCERT Accuracy
- [ ] Does the simulation demonstrate the NCERT concept clearly for a Class 9 student?
- [ ] Are the equations shown using correct CBSE notation (v, u, a, t, s)?
- [ ] Does changing parameters produce the expected physical behavior?
- [ ] Edge cases: What happens at acceleration=0? velocity=0? negative values? Does the math break?
- [ ] Are units displayed correctly (m/s, m/s², m, s)?

### Phase E: Visual Quality
- [ ] ALL colors are white/black only — ZERO chromatic colors
- [ ] ALL HTML corners are sharp — `rounded-none` on every element
- [ ] Labels use `text-[8px]` to `text-[10px]` with `font-mono font-bold uppercase tracking-wider`
- [ ] Object does NOT leave the visible scene bounds
- [ ] Physics animation uses `delta` for frame independence
- [ ] State is LOCAL (`React.useState`), NOT global Zustand store

### Phase F: Build Verification
- [ ] No TypeScript errors (verify mentally by checking all prop types match)
- [ ] No missing imports
- [ ] No console errors expected in browser

### Phase G: Equation-Sim Map Integration (MANDATORY)
- [ ] At least ONE equation from the article is mapped in `lib/equation-sim-map.ts`
- [ ] The new slug is added to the `SimulationType` union type at the top of the file
- [ ] The `type` field in each mapping entry matches the `simType` prop on the LabContainer
- [ ] The `id` prop on LabContainer is `lab-{slug}` — this is what "Simulate This Equation" scrolls to
- [ ] Each equation string in the map EXACTLY matches the `equation` prop on the corresponding `<EquationBlock>` in the MDX

### Phase H: Simulation Start Behavior
- [ ] Simulation does NOT auto-play on page load — `isPlaying` starts as `false`
- [ ] User must click Play to start physics calculations
- [ ] Exception: ambient/decorative animations (gentle rotation, floating particles) CAN run — but physics calculations (displacement, velocity, etc.) must NOT start until Play is clicked
- [ ] On Reset, `isPlaying` should be set to `false` so the user can inspect initial state before re-playing

