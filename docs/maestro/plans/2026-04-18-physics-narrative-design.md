# Physova Frontend Overhaul: High-Fidelity Physics Narrative

## Objective
Rebuild the Physova landing page into a cinematic, scroll-driven journey using "Celestial Morphing" 3D visuals and an "Inverted Minimalist" design (Option B: Tech-Lab aesthetic). Generalize the platform from "Quantum" to "Physics" while preserving core educational value.

## 1. Design Direction (Option B: Minimalist Tech-Lab)
- **Aesthetic:** Dark mode (`bg-black`), high-contrast typography, monospace accents for "data" feel.
- **Typography:** 
    - **Headings:** Bold Sans-serif (Inter/Geist) with tight tracking.
    - **Data/Labels:** Monospace (JetBrains Mono/Geist Mono) for that "research interface" look.
- **Color Palette:**
    - Base: `#000000` (Black)
    - Primary Accent: `#FFFFFF` (White)
    - Secondary Accent: `#555555` (Mid-gray)
    - Gravity/Physics Accents: Subtle Cyan/Violet glows for "energy" points.

## 2. The Narrative Journey (Scroll Flow)
The page is a `600vh` scroll experience divided into 4 main "Stages":

### Stage 1: The Singularity (Hero) - 0-100vh
- **Visual:** A centered 3D **Black Hole** (Singularity) with a subtle accretion disk.
- **Text:** Large title "Physova" with a monospace tagline: `INTERPRETING THE UNIVERSE // v2.0`.
- **Interaction:** Subtle floating motion.

### Stage 2: The Scale of Life (Mission) - 100-250vh
- **Visual:** The Black Hole **morphs** into the **Sun** (Stellar scale) or **Earth** (Planetary scale). The object glides to the right.
- **Text (Left):** "THE MISSION: DECODING THE UNSEEN." Text appears with a typewriter/data-stream effect.
- **Content:** Why Visuals? section (Solving abstraction through intuition).

### Stage 3: The Discovery (Labs) - 250-450vh
- **Visual:** "Camera Shutter" effect reveals the **Interactive Labs**. The 3D object centers and becomes a high-tech representation of a **Quantum Wave** or the **Double Slit** setup.
- **Text:** "WHAT WE BUILD."
- **Content:** Bento cards for Featured Labs (Double Slit, Entanglement, Superposition).

### Stage 4: The Synthesis (Community) - 450-600vh
- **Visual:** "Gravitational Warp" effect. The 3D object transforms into a network/constellation representing the **Community**.
- **Text:** "WHO WE ARE."
- **Content:** Bento cards for Community Forum, Discord, and Researcher Profiles.

## 3. Technical Strategy
- **Framework:** Next.js (App Router), Tailwind CSS.
- **Animations:** `framer-motion` (scroll-linked transforms).
- **3D Engine:** `react-three-fiber` + `@react-three/drei`.
- **Optimization:** 
    - Use `useMemo` for shader materials.
    - Low-poly models or procedural geometries for morphing.
    - `Canvas` stays sticky while `scrollYProgress` drives the state changes.

## 4. Navigation & Routing Fixes
- Replace all `alert()` calls and placeholders with real routes:
    - `/topics` -> MDX Topic Index
    - `/community` -> Community Hub
    - `/topics/[slug]` -> Dynamic MDX rendering
- Ensure a persistent, minimalist "Menu" button or top-nav that doesn't break immersion.

## 5. Components to Build/Refactor
- `CelestialEngine.tsx`: The core R3F component handling the Black Hole -> Sun -> Earth morphing.
- `NarrativePanel.tsx`: The left-side text container that reacts to scroll.
- Bento cards with Option B styling.
- `ShutterTransition.tsx`: Component for the "Camera Shutter" reveal.

## 6. Verification
- **Performance:** Ensure 60fps scroll on mid-range devices.
- **Responsive:** Mobile view transitions to a simplified vertical flow.
- **Content:** Verify all "old version" content is accurately represented in the new design.
