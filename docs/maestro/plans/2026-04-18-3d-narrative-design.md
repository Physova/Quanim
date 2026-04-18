# DESIGN DOCUMENT: Quanim 3D Narrative 2.0

## 1. Objective
Overhaul the landing page background with a cinematic 3D scroll narrative. Integrate the high-fidelity Black Hole (from `files/`), the transition flash (from `files/`), and the Earth-centered sequence (from `quanim.html`). Implement a new Plane Mechanism stage with diagnostic overlays and a final transition to the Sun.

## 2. Visual Sequence (Scroll-Linked)
| Range (%) | Stage | Visual Content | Source |
| :--- | :--- | :--- | :--- |
| **0 - 28** | **Singularity** | Black Hole (Keplerian accretion disk) | `files/QuanimHero.jsx` |
| **28 - 34** | **Warp** | High-intensity white flash transition | `files/QuanimHero.jsx` |
| **34 - 55** | **Life** | Centered Earth (Canvas landmass texture) | `quanim.html` |
| **55 - 65** | **Transition** | Zoom into sky -> Plane silhouette entrance | NEW |
| **65 - 85** | **Mechanism** | Sideways Low-Poly Plane. Heat/Aero/Fuel labels | NEW |
| **85 - 95** | **Transition** | Zoom out to Earth Orbit -> Lock Sun | NEW |
| **95 - 100** | **Synthesis** | Pulsing Sun (FBM texture / Glow sphere) | `files/QuanimHero.jsx` |

## 3. Implementation Details (Option B Style)
- **Engine:** React Three Fiber (R3F).
- **Optimization:** 
  - Static BufferGeometry for Black Hole (22k particles).
  - CanvasTexture for Earth (procedural generation on mount).
  - Low-poly mesh (Box/Cylinder) for Plane to minimize GPU load.
- **Diagnostics:** 
  - **Heat:** Mesh color lerp to Red.
  - **Aero:** 3D line primitives for "airflow".
  - **Fuel:** 3D Sprite label + pulse.

## 4. UI/Foreground
- **KEEP** existing Quanim text and content layouts.
- Background narrative must sit behind existing `z-index` layers.
- Persistent scroll indicator and dots.
