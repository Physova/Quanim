# Quantum Simulation & UI Rework v2 Design

## Objective
Evolve the Quanim physics simulations from technically functional 3D models into highly polished, intuitive, pedagogical tools suitable for general students. Implement specific UI UX enhancements to refine split-screen workflows, hover states, and navigational routing.

## 1. Simulation Redesign Specifications

### Superposition: The Intuitive Bloch Sphere
- **Concept:** Transform the formal Bloch Sphere into a dynamic density indicator.
- **Visuals:** Add glowing "Probability Rings" that shift inside a translucent sphere. The sphere physically reacts to probability manipulation, glowing brighter toward the dominant pole (Spin Up = North, Spin Down = South).
- **UX:** Replace advanced mathematical typography with simple, student-friendly terms (e.g., `PROBABILITY OF SPIN UP: 80%`).

### Entanglement: The Spooky Action Wave
- **Concept:** Visualize non-local correlation intuitively instead of abstractly.
- **Visuals:** Connect Alice and Bob's floating particle meshes via a vibrant, oscillating **3D Sine Wave** (Tube Geometry). 
- **Interaction:** When measurement collapses the entangled Bell State, the connecting wave dramatically snaps and dissolves, physically demonstrating the severing of the correlated wavefunction.

### Double-Slit: The Unshadowed Optical Bench
- **Concept:** Ensure pedagogical clarity over literal geometry lighting.
- **Visuals:** Replace shadow-casting heavy wall materials with self-illuminating, translucent grating to prevent the slits from being obscured.
- **Camera:** The default orbit perspective will be angled slightly top-down, granting an unobstructed view of the photon/wave crests physically passing through the slits to hit the detecting back-plane.

## 2. Layout & Platform Fixes

### Split-Screen Enhancements
- **Exit Logic:** Introduce an explicit `[X] Exit Split View` overlay button in the Lab Chrome to toggle out of split-screen reading.
- **Workspace Layout:** In native Fullscreen (`document.fullscreenElement`), automatically stack/flex standard controls (sliders, resets) to the bottom-left corner to keep the central 3D scene clear.

### Landing Page Routing
- **Bento Discovery Stage:** Hardcode the featured tiles to display exactly: `Double Slit`, `Entanglement`, and `Superposition`.
- **Community Stage (Phase 4):** Embed a CTA button (`Join Community ->`) that maps to `/auth/signup`.

### Universal Polishing Hooks
- **Icons:** Use proper `<Minimize />` and `<Maximize />` lucide-react icon toggling depending on fullscreen context.
- **Hover/Toasts:** Map empty buttons (Info, Share) to proper visual responses. Share triggers a UI toast or tooltip `"LINK COPIED"`.
- **Topics Button:** Resolve the background inheritance bug on the `Repository/Enter Simulation` link so it correctly inverts to a pure white background with black text.
