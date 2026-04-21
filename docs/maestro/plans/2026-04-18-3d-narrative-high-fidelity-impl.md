# Physova 3D Narrative 3.0 (High Fidelity) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a cinematic 3D background scroll narrative featuring a rotating Black Hole, a twinkling Flare transition, a centered procedural Earth, a diagnostic Plane mechanism, and a pulsing Sun synthesis.

**Architecture:** Port high-fidelity 3D assets from `files/PhysovaHero.jsx` into the existing Next.js `PhysovaHero` component. Use `THREE.Points` for the 22k particle Black Hole and a custom `ShaderMaterial` for the Sun. Orchestrate camera movements and diagnostic overlays (Heat, Aero, Fuel) based on scroll progress.

**Tech Stack:** Next.js 14, TypeScript, Three.js, Tailwind CSS.

**Constraints:** DO NOT use git commands (add/commit). Focus on high-fidelity visual parity with `files/PhysovaHero.jsx`.

---

### Task 1: Singularity (Black Hole Port)

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Port 22k Particle Accretion Disk**
Copy the particle initialization and Doppler color logic exactly from `files/PhysovaHero.jsx`.

```typescript
const DN = 22000;
const dkPos  = new Float32Array(DN * 3);
const dkOrig = new Float32Array(DN * 3);
const dkSpd  = new Float32Array(DN);
const dkCol  = new Float32Array(DN * 3);

for (let i = 0; i < DN; i++) {
  const a = Math.random() * Math.PI * 2;
  const r = 1.18 + Math.pow(Math.random(), 0.6) * 2.7;
  const h = (Math.random() - 0.5) * 0.07 * Math.max(0.5, r - 1.0);
  dkOrig[i*3]   = Math.cos(a) * r;
  dkOrig[i*3+1] = h;
  dkOrig[i*3+2] = Math.sin(a) * r;
  dkPos[i*3]    = dkOrig[i*3]; dkPos[i*3+1] = dkOrig[i*3+1]; dkPos[i*3+2] = dkOrig[i*3+2];
  dkSpd[i] = 0.4 + Math.random() * 0.6;

  const rNorm   = Math.max(0, (r - 1.18) / 2.7);
  const temp    = Math.pow(1 - rNorm, 1.8);
  const approach = (Math.sin(a) + 1) * 0.5;

  dkCol[i*3]   = Math.min(1, temp * 1.1 + 0.15);
  dkCol[i*3+1] = Math.min(1, temp * 0.65 * (0.6 + 0.4 * approach) * 0.8);
  dkCol[i*3+2] = Math.min(1, approach * 0.55 * (1 - temp * 0.6) * 0.35);
}
```

- [ ] **Step 2: Fix Visibility at Start**
Update `bhA` logic in the `animate` loop to ensure it is 1.0 at `s=0`.

```typescript
const bhA = (1 - ss(0.22, 0.32, s)); 
```

- [ ] **Step 3: Port ISCO Band**
Ensure the 4000-particle ISCO band is also ported for high-fidelity "hot" core.

---

### Task 2: Warp Transition (Twinkling Flare)

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Create Twinkle Sprite**
Initialize a `THREE.Sprite` with a radial gradient texture for the central flare.

- [ ] **Step 2: Orchestrate Twinkle Flare**
Update `animate` loop: `const flare = ss(0.21, 0.28, s) * (1 - ss(0.28, 0.36, s));`. Apply to sprite opacity. Disable the white flash DIV.

---

### Task 3: Mechanism - Plane Construction

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Construct Low-Poly Plane**
Use `BoxGeometry` and `CylinderGeometry` to build a plane silhouette. Position at `x: 1.8` for sideways view.

- [ ] **Step 2: Base Material Setup**
Use `MeshPhongMaterial` with `transparent: true`.

---

### Task 4: Mechanism - Heat & Fuel Diagnostics

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Heat Overlay Logic**
Lerp `pMat.emissive` and `pMat.color` to Red-Orange during 65-72% scroll.

- [ ] **Step 2: Fuel Sprite Label**
Add a sprite label "FUEL: NOMINAL" that pulses during 72-79% scroll.

---

### Task 5: Mechanism - Aero Diagnostics & Sky Zoom

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Aero Line Segments**
Add animated blue lines over the wings during 79-85% scroll.

- [ ] **Step 2: Camera Sky Zoom**
Orchestrate camera through clouds during 55-65% transition.

---

### Task 6: Synthesis - Sun Shader & Corona

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Port FBM Sun Shader**
Copy `sunVertexShader` and `sunFragmentShader` (with FBM and limb darkening) exactly from `files/PhysovaHero.jsx`.

- [ ] **Step 2: Add 4 Corona Layers**
Implement the sphere layers with additive blending for the solar glow.

---

### Task 7: Synthesis - Solar Flares & Cosmic Zoom

**Files:**
- Modify: `components/visuals/physova-hero.tsx`

- [ ] **Step 1: Implement Solar Flares**
Add the 3 procedural flare sprites that pulse with `now`.

- [ ] **Step 2: Orchestrate Cosmic Transition**
Final camera zoom out from Plane -> show Earth orbit -> fixate on Sun (85-100%).

---
