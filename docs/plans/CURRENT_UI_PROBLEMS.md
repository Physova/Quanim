# PHYSOVA — CURRENT UI & LOGIC STATE REPORT
**Date:** April 24, 2026
**Status:** UNRESOLVED (Consultation needed)


## 2. Lab UI Alignment (`components/simulations/lab-container.tsx`)
- **Current Fix:** Replaced `Card` component with a bare `div` (in latest version) to strip unwanted `shadcn` padding. Anchored header to `top-0`.
- **Problem:** User reports a significant (~5cm) gap between the simulation box top and the actual start of UI elements.
- **Conflict:** Lab header and controls overlap with sidebar tweak menus in hover mode due to displacement.
- **Goal:** Move all header UI elements (title, fullscreen, reload) to the absolute top edge of the box to maximize simulation space.

## 3. Superposition Lab Labels (`components/simulations/superposition-sim.tsx`)
- **Current Fix:** Reverted text to verbose ("PROBABILITY OF SPIN UP: X%").
- **Problem:** Labels currently overflow the container boundaries even on default load.
- **Goal:** Reposition `Html` labels (currently at `y: 3.2` and `-3.2`) so they are contained within the sphere's visual bounds without clipping or overflowing the container edges.

## 4. Shareable Links & Pseudo-Fullscreen
- **Current Fix:** Added `?fullscreen=true` to shared URLs. Implemented "Pseudo-Fullscreen" (fixed inset-0) because browser programmatic fullscreen is often blocked without direct user gesture.
- **Problem:** 
    - Lab UI buttons are unclickable in pseudo-mode (likely Navbar overlap or `pointer-events` issue).
    - Redundant exit buttons appear.
    - Icon logic for toggle needs clarification (Minimize vs Maximize).
- **Goal:** Shared link should open simulation in a clean, interactive, full-screen-like state with a single clear exit path.

