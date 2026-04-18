# Implementation Plan: Quanim 3D Narrative 3.0 (High Fidelity)

## Objective
Implement a high-fidelity cinematic 3D background scroll narrative featuring a rotating Black Hole, a twinkling Flare transition, a centered procedural Earth, a diagnostic Plane mechanism, and a pulsing Sun synthesis.

## Key Files
- `components/visuals/quanim-hero.tsx` (Logic & Scene)
- `components/visuals/quanim-hero.css` (Styles)
- `app/page.tsx` (Integration)

## Phase 1: Singularity & Flare Transition
- [ ] **EXACT Port of 22k Particle System**: Port the 22,000 particle accretion disk, Keplerian velocity rotation loop, and Doppler shifting (dkCol) exactly from `files/QuanimHero.jsx`. Ensure positions update in the `animate` loop.
- [ ] **Fix Visibility at s=0**: Ensure `bhA` is 1.0 immediately on load.
- [ ] **Twinkling Light transition**: Replace white flash with a central `Sprite` based twinkle flare (28-34%).

## Phase 2: Mechanism Stage (Plane & Diagnostic)
- [ ] **Construct Low-Poly Plane**: Use `BoxGeometry` and `CylinderGeometry`. Position for sideways view.
- [ ] **Diagnostic Overlays**:
    - Heat: Lerp material emissive/color to Red at 65-72%.
    - Fuel: Add sprite pulsing label at 72-79%.
    - Aero: Add animated line segments over wings at 79-85%.
- [ ] **Sky Zoom**: Orchestrate camera path through clouds during 55-65% transition.

## Phase 3: Synthesis Stage (Sun & Cosmic Zoom)
- [ ] **Port Sun Shader**: FBM turbulence, limb darkening, and 4 corona layers from `files/QuanimHero.jsx`.
- [ ] **Add Solar Flares**: Implement procedural flare sprites that pulse with scroll.
- [ ] **Cosmic Transition**: Smooth camera pan from Plane sideways -> Earth Orbit -> Sun fixation (85-100%).

## Phase 4: Integration & Distance Sync
- [ ] **Sync Scroll Dots**: Distance the foreground dots and update stage labels.
- [ ] **Performance Review**: Ensure all disposals are recursive and CPU updates are throttled/efficient.
- [ ] **Hydration Check**: Final verify of `mounted` guards in `app/page.tsx`.

## Verification
- walkthrough 0-100% scroll.
- Check Black Hole rotation and particle persistence.
- Check Plane labels and heat mapping.
- Check Sun pulsation and flares.
