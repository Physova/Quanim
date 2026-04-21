---
title: "Physova 3D Narrative 2.0 Implementation Plan"
design_ref: "docs/maestro/plans/2026-04-18-3d-narrative-design.md"
created: "2026-04-18T12:00:00Z"
status: "draft"
total_phases: 4
estimated_files: 2
task_complexity: "complex"
---

# Physova 3D Narrative 2.0 Implementation Plan

## Plan Overview

- **Total phases**: 4
- **Agents involved**: `design_system_engineer`, `coder`, `ux_designer`
- **Estimated effort**: Moderate complexity. Porting existing Three.js logic and building a new low-poly plane mechanism with diagnostic overlays.

## Dependency Graph

```
Phase 1 (Foundation)
    |
Phase 2 (Core Narrative)
    |
Phase 3 (Mechanism Logic)
    |
Phase 4 (Final Synthesis)
```

## Execution Strategy

| Stage | Phases | Execution | Agent Count | Notes |
|-------|--------|-----------|-------------|-------|
| 1     | Phase 1 | Sequential | 1 | Asset & Type Foundation |
| 2     | Phase 2 | Sequential | 1 | Black Hole & Earth Core |
| 3     | Phase 3 | Sequential | 1 | Plane Mechanism Overlays |
| 4     | Phase 4 | Sequential | 1 | Final Polish |

## Phase 1: Asset Foundation & Types
### Objective
Define types for the new narrative stages and prepare canvas texture helpers.

### Agent: design_system_engineer
### Parallel: No

### Files to Modify
- `components/visuals/physova-hero.tsx` — Add `SCENES` metadata for the new 4 stages. Port `mkEarthTex` and `mkCloudTex`.

### Implementation Details
- Update `Scene` interface.
- Add texture generators from `Physova.html`.

### Validation
- `npm run lint` and `npx tsc --noEmit`.

### Dependencies
- Blocked by: None
- Blocks: Phase 2

---

## Phase 2: Core Narrative (Black Hole & Earth)
### Objective
Implement the high-fidelity Black Hole and the centered Earth visual.

### Agent: coder
### Parallel: No

### Files to Modify
- `components/visuals/physova-hero.tsx` — Replace current Black Hole/Earth logic with `files/` and `Physova.html` sources.

### Implementation Details
- Accretion disk: 22k particles, Keplerian velocities (Source: `files/`).
- Earth: Centered sphere, CanvasTexture landmass (Source: `Physova.html`).
- Sync ranges: BH (0-28%), Earth (34-55%).

### Validation
- Verify scroll percentage triggers BH -> Flash -> Earth correctly.

### Dependencies
- Blocked by: Phase 1
- Blocks: Phase 3

---

## Phase 3: Mechanism Stage (The Plane)
### Objective
Build the Low-Poly Plane scene with Heat/Aero/Fuel diagnostic overlays.

### Agent: coder
### Parallel: No

### Files to Modify
- `components/visuals/physova-hero.tsx` — Add Plane group. Implement zoom transition.

### Implementation Details
- Plane: Compose from `BoxGeometry` and `CylinderGeometry`.
- Diagnostic Overlays: Heat (Color), Aero (Lines), Fuel (Sprite).
- View: Sideways camera transition at 65-85% scroll.

### Validation
- Manual scroll check: Diagnostic labels trigger sequentially.

### Dependencies
- Blocked by: Phase 2
- Blocks: Phase 4

---

## Phase 4: Synthesis & Final Transitions
### Objective
Finalize the zoom out to Earth orbit and the Sun fixation.

### Agent: ux_designer
### Parallel: No

### Files to Modify
- `components/visuals/physova-hero.tsx` — Finalize Sun sequence (95-100%). Adjust camera curves.

### Implementation Details
- Sun: Port FBM Shader and Corona layers from `files/`.
- Transition: Smooth camera lerp from Plane -> Earth Orbit -> Sun center.

### Validation
- Full journey walkthrough (0% -> 100%).

### Dependencies
- Blocked by: Phase 3
- Blocks: None

---

## File Inventory

| # | File | Phase | Purpose |
|---|------|-------|---------|
| 1 | `components/visuals/physova-hero.tsx` | 1-4 | Main Narrative implementation |
| 2 | `components/visuals/physova-hero.css` | 1 | Layout and overlays |

## Risk Classification

| Phase | Risk | Rationale |
|-------|------|-----------|
| 3     | MEDIUM | Overlay synchronization with scroll position requires precise clamping. |
| 4     | LOW | Purely visual camera transitions. |

## Execution Profile

```
Execution Profile:
- Total phases: 4
- Parallelizable phases: 0 (File overlap on physova-hero.tsx)
- Sequential-only phases: 4
- Estimated sequential wall time: 70 mins

Note: Subagents run autonomously. All tool calls are auto-approved.
```
