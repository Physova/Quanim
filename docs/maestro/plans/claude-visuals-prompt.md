# TECHNICAL SPECIFICATION: Physova CELESTIAL NARRATIVE ASSET

## 1. PROJECT OVERVIEW
**Title**: Physova Physics Narrative (v2.0)
**Objective**: Generate a cinematic, high-fidelity 3D animation sequence to be used as a "Video-Scrubbing" background for a 600vh scroll-driven landing page.
**Tone**: Sophisticated, Research-Grade, Cinematic (Inspiration: *Interstellar*, *Cosmos*, *Tenet*).

---

## 2. TECHNICAL CONSTRAINTS
- **Format**: `.mp4` (H.264/H.265) or `.webm`.
- **Resolution**: 3840x2160 (4K) — 16:9 Aspect Ratio.
- **Frame Rate**: 60 FPS (Crucial for smooth scroll-scrubbing).
- **Duration**: Exactly 12.0 seconds (720 frames).
- **Background**: Pure Black (`#000000`).
- **Composition**: Central focal point, with specific glides to the right to accommodate UI text on the left.

---

## 3. SCROLL-TIMELINE MAPPING (CHOREOGRAPHY)

| Timestamp | Scroll % | Narrative Stage | Visual Action |
|-----------|----------|-----------------|---------------|
| **0.0s - 2.0s** | 0% - 15% | **The Singularity** | Static, hyper-detailed Black Hole. Rotating accretion disk with subtle heat shimmer. |
| **2.0s - 4.0s** | 15% - 30% | **Warp Transition** | Gravitational lensing intensifies. The Singularity pulses and "opens" into a blinding white light. |
| **4.0s - 6.0s** | 30% - 50% | **Scale of Life** | The light collapses into a molten **Sun**, which then cools instantly into the **Earth**. |
| **6.0s - 7.5s** | 50% - 65% | **Camera Glide** | The Earth glides from the Center to the **Right 1/3** of the frame. Smooth, cinematic ease-in-out. |
| **7.5s - 9.0s** | 65% - 80% | **Quantum Discovery** | A digital scanning line passes through Earth. It dissolves into a **Double Slit Interference Pattern** (Neon Cyan). |
| **9.0s - 10.5s**| 80% - 95% | **Synthesis Warp** | The interference pattern warps into a **3D Community Constellation** (Interconnected nodes of light). |
| **10.5s - 12.0s**| 95% - 100%| **The Void Loop** | The constellation fades into the distant starfield, returning to a state of minimalist void. |

---

## 4. VISUAL STYLE & POST-PROCESSING

### A. The Black Hole (The Singularity)
- **Accretion Disk**: High-contrast orange/amber. Use fluid simulations for the gas flow.
- **Doppler Shifting**: The left side of the disk should be slightly bluer/brighter, the right side redder/dimmer.
- **Einstein Ring**: Clear gravitational lensing of the background starfield around the event horizon.

### B. The Earth (Scale of Life)
- **Atmosphere**: Thin, realistic cyan haze (Rayleigh scattering).
- **Night Side**: Subtle "City Lights" visible on the dark portion to emphasize human presence.
- **Clouds**: High-resolution, multi-layered cloud system with shadows.

### C. The Tech-Lab Aesthetic (Discovery/Synthesis)
- **Colors**: Shift to "Interstellar Blue" (`#00AEEF`) and "Neutrino White".
- **Particles**: Use millions of tiny light motes (Point clouds) to construct the objects.
- **Geometry**: Clean, mathematical lines. No "magic" effects—everything should look like it's being "computed" or "measured".

### D. Rendering Pass
- **Bloom**: Soft, realistic bloom on high-energy points.
- **Chromatic Aberration**: Minimal, only at the edges of the frame during high-warp transitions.
- **Motion Blur**: 180-degree shutter speed equivalent to ensure frames blend when scrubbed quickly.

---

## 5. FINAL DIRECTIVE TO CLAUDE
"Deliver the highest quality visual output possible. If the tech stack (e.g., Three.js, Blender, Cinema4D) allows, prefer physically-based rendering (PBR). The goal is to make the user feel like they are looking through a research telescope into the heart of physics. Surprise us with the detail."
