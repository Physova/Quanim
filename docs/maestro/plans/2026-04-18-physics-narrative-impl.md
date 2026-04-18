# Quanim Physics Narrative Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Quanim landing page into a 600vh cinematic journey with 3D celestial morphing and Option B tech-lab aesthetic.

**Architecture:** Next.js App Router with Framer Motion for scroll-linked orchestration and React Three Fiber for the central celestial engine.

**Tech Stack:** Next.js, Tailwind CSS, Framer Motion, Three.js, R3F, Drei, Lucide React.

---

### Phase 1: Design System & Asset Prep (Parallel)
**Agents: design_system_engineer, designer**

- [ ] **Task 1.1 (Design System Engineer): Define Option B Tokens**
    - Modify `app/globals.css`: Define JetBrains Mono as the data font, strict black/white/mid-gray palette.
    - Setup Tailwind config for "tight-tracking" headings.
- [ ] **Task 1.2 (Designer): Visual Assets & Shaders Prep**
    - Research/Draft shader code for Black Hole accretion disk and Sun/Earth morph targets.
    - Create placeholder SVG/JSON data for the "Community Constellation" stage.

### Phase 2: Core Scroll Framework (Parallel)
**Agents: coder, ux_designer**

- [ ] **Task 2.1 (Coder): 600vh Sticky Container**
    - Refactor `app/page.tsx` to establish a robust sticky container with `framer-motion` scroll hooks.
- [ ] **Task 2.2 (UX Designer): Scroll-Linked Narrative Mapping**
    - Define precise `scrollYProgress` ranges for each of the 4 narrative stages.
    - Establish timing for the "Camera Shutter" and "Gravitational Warp" transitions.

### Phase 3: Celestial Engine Foundation (Parallel)
**Agents: coder, performance_engineer**

- [ ] **Task 3.1 (Coder): Base R3F Canvas & Stage 1 Black Hole**
    - Create `components/visuals/celestial-engine.tsx`.
    - Implement high-quality centered Black Hole visual (Singularity + Event Horizon).
- [ ] **Task 3.2 (Performance Engineer): R3F Optimization Pass**
    - Implement `AdaptiveDpr` and `AdaptiveEvents` for the R3F canvas.
    - Set up hardware acceleration flags for the narrative sticky layers.

### Phase 4: Stage 2 - Scale of Life (Parallel)
**Agents: coder, designer**

- [ ] **Task 4.1 (Coder): Morphing Logic (Black Hole -> Sun/Earth)**
    - Implement the lerp logic for the celestial object transformation in `CelestialEngine`.
- [ ] **Task 4.2 (Designer): Mission Statement Visuals**
    - Design the "typewriter/data-stream" text entrance for the mission statement.
    - Refine the "Why Visuals?" content layout.

### Phase 5: Stage 3 - The Discovery (Parallel)
**Agents: coder, design_system_engineer**

- [ ] **Task 5.1 (Coder): Camera Shutter Shorter Transition**
    - Implement `components/visuals/shutter-transition.tsx` with high-performance vertical curtains.
- [ ] **Task 5.2 (Design System Engineer): Lab Bento Refinement**
    - Update `DiscoverySection` bento cards to use Option B styling (Monospace data labels, minimalist borders).

### Phase 6: Stage 4 - The Synthesis (Parallel)
**Agents: coder, ux_designer**

- [ ] **Task 6.1 (Coder): Gravitational Warp & Community Network**
    - Implement the "Warp" transition effect.
    - Create the "Community Constellation" 3D visual for the final stage.
- [ ] **Task 6.2 (UX Designer): Researcher Profile Previews**
    - Design the bento cards for the synthesis stage (Profiles, Discord, Forum).

### Phase 7: Narrative & Typography Integration (Parallel)
**Agents: coder, copywriter**

- [ ] **Task 7.1 (Coder): NarrativePanel Component**
    - Build `components/visuals/narrative-panel.tsx` to handle dynamic text display relative to scroll.
- [ ] **Task 7.2 (Copywriter): Tech-Lab Microcopy**
    - Rewrite landing page copy for "Physics" generalization with a research/lab-inspired tone.

### Phase 8: Navigation & Routing Fixes (Parallel)
**Agents: coder, tester**

- [ ] **Task 8.1 (Coder): Routing Implementation**
    - Fix all 404 links. Map navigation items to `/topics`, `/community`, etc.
    - Implement the persistent minimalist nav menu.
- [ ] **Task 8.2 (Tester): Navigation & Link Audit**
    - Verify all routes resolve correctly.
    - Test the persistent nav across all 4 scroll stages.

### Phase 9: Quality & Polish (Parallel)
**Agents: designer, coder**

- [ ] **Task 9.1 (Designer): Particle & Glow Pass**
    - Add subtle background particle field and "energy" point glows consistent with the narrative.
- [ ] **Task 9.2 (Coder): Responsive Refactor**
    - Ensure 600vh scroll degrades gracefully to vertical flow on mobile.
    - Optimize touch interactions for the R3F canvas.

### Phase 10: Final Audit & Handoff (Parallel)
**Agents: performance_engineer, code_reviewer**

- [ ] **Task 10.1 (Performance Engineer): Final FPS & LCP Audit**
    - Run performance benchmarks on mid-range profiles.
    - Implement any necessary final lazy-loading or asset compression.
- [ ] **Task 10.2 (Code Reviewer): Architectural Sign-off**
    - Verify strictness of Option B design implementation.
    - Ensure clean component boundaries and proper Next.js patterns.
