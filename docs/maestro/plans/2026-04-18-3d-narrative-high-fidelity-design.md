# DESIGN DOCUMENT: Quanim 3D Narrative 3.0 (High Fidelity)

## 1. Objective
Complete the high-fidelity overhaul of the Quanim background narrative. Integrate the Black Hole (22k particles) from `files/`, a new "Central Flare" transition, and the full Plane Mechanism and Sun Synthesis sequences. Ensure the Black Hole is visible immediately upon page load.

## 2. Narrative Choreography
| Scroll (%) | Stage | Visual Content | Key Logic |
| :--- | :--- | :--- | :--- |
| **0 - 28** | **Singularity** | Black Hole (22k particles) | Keplerian rotation, Doppler shift. **Start opacity: 1.0**. |
| **28 - 34** | **Warp** | Central Twinkling Flare | Single glowing sprite pulses and fades. |
| **34 - 55** | **Life** | Centered Earth | Canvas landmass texture. |
| **55 - 65** | **Transition** | Sky Zoom | Camera zooms through clouds to Plane silhouette. |
| **65 - 85** | **Mechanism** | Sideways Low-Poly Plane | Diagnostic overlays: Heat (Red), Aero (Lines), Fuel (Pulsing label). |
| **85 - 95** | **Transition** | Cosmic Zoom | Zoom out to Earth orbit -> Lock onto Sun. |
| **95 - 100** | **Synthesis** | Pulsing Sun | FBM turbulence shader, limb darkening, flares. |

## 3. Implementation Details
- **Singularity**: Re-port 22k particle system from `files/QuanimHero.jsx`. Fix `bhA` start value.
- **Twinkling Light**: Use `THREE.Sprite` with a radial gradient texture for the flare.
- **Plane Mechanism**:
    - **Heat**: Lerp `pMat.emissive` and `pMat.color` to Red-Orange.
    - **Aero**: Use `LineSegments` with animated vertices or moving X-offset to show airflow.
    - **Labels**: "Heat Transmission", "Fuel Consumption", "Aerodynamicity" using `mkTextTex`.
- **Sun**: Port full FBM shader, corona layers, and flares from `files/QuanimHero.jsx`.

## 4. Technical Constraints
- **Performance**: Standard primitives only (Box, Cylinder, Sphere). No high-poly external models.
- **Hydration**: Components wrapped in `mounted` guards.
- **Foreground**: DO NOT change existing text or foreground layout.
