# Scroll-Linked Narrative Mapping — Physova Overhaul

## Overview
This document defines the choreography for the Physova landing page, mapping the [0, 1] scroll range to specific stages, 3D celestial states, and transition effects.

## Global Scroll Configuration
- **Total Scroll Height**: 600vh
- **Scroll Driver**: `useScroll` from Framer Motion
- **Target Element**: `ref` on the main container

## 1. Stage Mapping
| Stage | Scroll Range | Section Name | Key Visual |
| :--- | :--- | :--- | :--- |
| **Stage 1** | `0.00 - 0.20` | **Singularity / Hero** | Dense, glowing orb (Hero Particle) |
| **Stage 2** | `0.20 - 0.45` | **Scale of Life / Mission** | Particle dispersion into a galaxy/cloud |
| **Stage 3** | `0.45 - 0.75` | **Discovery / Labs** | Geometric structure formation (Grid/Lattice) |
| **Stage 4** | `0.75 - 1.00` | **Synthesis / Community** | Full constellation / Connected nodes |

---

## 2. Celestial State (uMorph)
The `uMorph` value controls the transition of the 3D celestial object in the shader. 

| Milestone | Scroll Position | uMorph Value | Description |
| :--- | :--- | :--- | :--- |
| **Start** | `0.00` | `0.0` | **Singularity**: Perfect sphere, high density. |
| **Hero Peak** | `0.10` | `0.1` | Slight vibration, energy build-up. |
| **Transition 1** | `0.20` | `0.3` | **Explosion**: Sudden expansion into Stage 2. |
| **Mission Mid** | `0.35` | `0.5` | **Fluid State**: Particles flow in wave-like patterns. |
| **Transition 2** | `0.45` | `0.7` | **Structural Warp**: Pulling into Stage 3 grid. |
| **Labs Peak** | `0.60` | `0.8` | **Crystalline**: Sharp edges, high geometric order. |
| **Transition 3** | `0.75` | `0.9` | **Softening**: Dissolving edges for community. |
| **Synthesis** | `1.00` | `1.0` | **Constellation**: Network of points, stable. |

---

## 3. Transition Effects

### A. The "Shutter" Effect (Stage 1 → Stage 2)
Triggered at the boundary of Hero and Mission sections.
- **Trigger Range**: `0.18 - 0.22`
- **Effect**: Horizontal "bars" of the UI slide in/out like a camera shutter.
- **Timing**:
  - `0.18 - 0.19`: Shutter closes (Opacity 0 -> 1, Scale 1.2 -> 1.0)
  - `0.19 - 0.21`: Background swap (Celestial uMorph jump)
  - `0.21 - 0.22`: Shutter opens (Opacity 1 -> 0, Scale 1.0 -> 0.8)

### B. The "Warp" Effect (Stage 2 → Stage 3)
Triggered as we move from the Scale of Life to Discovery Labs.
- **Trigger Range**: `0.42 - 0.48`
- **Effect**: Radial blur and FOV (Field of View) expansion.
- **Timing**:
  - `0.42 - 0.45`: FOV increases from 45 to 90 degrees.
  - `0.45`: Instantaneous color shift (Cyan -> Violet Deep).
  - `0.45 - 0.48`: FOV returns to 50 degrees.

---

## 4. Section Content Opacity (Fade Curves)
- **Stage 1 Text**: 
  - Visible: `0.00 - 0.12`
  - Fade Out: `0.12 - 0.18`
- **Stage 2 Text**: 
  - Fade In: `0.22 - 0.28`
  - Visible: `0.28 - 0.38`
  - Fade Out: `0.38 - 0.44`
- **Stage 3 Text**: 
  - Fade In: `0.48 - 0.55`
  - Visible: `0.55 - 0.68`
  - Fade Out: `0.68 - 0.74`
- **Stage 4 Text**: 
  - Fade In: `0.78 - 0.85`
  - Visible: `0.85 - 1.00`

---

## 5. Visual Summary (The Narrative Arc)
1. **0.0 - 0.2 (Singularity)**: Pure energy. Focus on "What is Physova?"
2. **0.2 - 0.45 (Humanity)**: Physics at our scale. Focus on "Why Physics matters."
3. **0.45 - 0.75 (Mechanism)**: The tools of discovery. Focus on "The Labs/Simulations."
4. **0.75 - 1.0 (Synthesis)**: Knowledge shared. Focus on "The Community."
