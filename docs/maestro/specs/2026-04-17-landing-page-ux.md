# Interaction Specification & Wireframe: Physova Landing Page Overhaul

**Date**: 2026-04-17
**Agent**: UX Designer
**Status**: Draft

---

## 1. Visual Theme & Brand
- **Primary Palette**: 
    - **Space Black**: `#0A0C10` (Backgrounds, Base)
    - **Quantum Cyan**: `#22D3EE` (Interactive highlights, Particle active states)
    - **Deep Violet**: `#4C1D95` (Atmospheric gradients, Particle base states)
    - **Stellar White**: `#F8FAFC` (Primary typography)
- **Typography**:
    - **Headings**: Sans-serif, extra-bold, tight tracking (`tracking-tighter`).
    - **Body**: Sans-serif, medium weight, high readability.

---

## 2. Wireframe Description (Split-Screen)

### Desktop (1024px+)
- **Layout**: 40% (Left) / 60% (Right) horizontal split.
- **Left Panel (Brand & Navigation)**:
    - **Fixed/Sticky**: Remains stationary during interactions.
    - **Content Stack**:
        1. **Top (Margin-8)**: Logo "Physova" (Gradient: Cyan to Violet). Tagline: "Interpreting the Quantum Void: Interactive Visual Physics".
        2. **Center (Flex-Grow)**: Navigation List.
            - `Explore Topics`
            - `Interactive Labs`
            - `Community Hub`
            - `Member Portal`
        3. **Bottom (Margin-8)**: 
            - Primary CTA: "Begin Journey" (Cyan glow button).
            - Social links (Discord, Twitter/X).
- **Right Panel (Interactive Canvas)**:
    - **Background**: Deep radial gradient from `#1E1B4B` (Center) to `#0A0C10` (Edges).
    - **Visual**: Full-bleed WebGL particle field.

### Mobile (< 768px)
- **Layout**: Vertical stack.
- **Top Section (40vh)**: Brand + Navigation (Condensed grid).
- **Bottom Section (60vh)**: Interactive Canvas (Touch-enabled).

---

## 3. Interaction Specification: Particle Canvas

### Base Engine
- **Technology**: React-Three-Fiber + ShaderMaterial.
- **Entities**: 400 circular particles (points).

### Behavior States
| State | Trigger | Animation Detail |
|-------|---------|------------------|
| **Idle** | Default | Particles drift via 3D Perlin noise at 0.05 speed. Pulse opacity between 0.2 and 0.6. |
| **Mouse Hover** | `onMouseMove` | Particles within 200px of cursor accelerate toward cursor. Color shifts from Violet to Cyan. |
| **Mouse Click** | `onClick` | "Quantum Displacement": Instant radial push (outward) from click origin, followed by elastic return. |
| **Scroll** | `onScroll` | Particle field slightly offsets vertically (Parallax) to provide depth. |

---

## 4. Responsive Adaptation

- **Breakpoint 768px**:
    - Transition from `flex-row` to `flex-col`.
    - Left panel padding reduces from `p-12` to `p-6`.
    - Navigation font size reduces from `text-3xl` to `text-xl`.
- **Performance Scaling**:
    - **High Power**: 500 particles, Bloom effect enabled.
    - **Low Power / Mobile**: 150 particles, Bloom disabled, static color (no shaders).

---

## 5. Accessibility Requirements (A11y)

- **Contrast**: All navigation text must maintain 7:1 contrast against Space Black.
- **Focus States**: High-visibility Cyan ring (`ring-2 ring-cyan-400`) for keyboard users.
- **Motion Control**: Respect `prefers-reduced-motion`. 
    - *Action*: Disable Perlin drift and Mouse-follow attraction.
- **ARIA**:
    - Main container: `role="main"`.
    - Navigation: `role="navigation"`.
    - Canvas: `aria-label="Interactive particle field representing quantum states"`.

---

## 6. Implementation Notes for Coder
- Use `framer-motion` for the Left Panel's entry animations and navigation hover states.
- Use `@react-three/drei`'s `Points` and `PointMaterial` for efficient rendering.
- Ensure the split-screen is implemented using `h-screen` and `overflow-hidden` on the parent to prevent awkward layout shifts.
