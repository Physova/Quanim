# Physova Design System — Simulation Visual Spec

## Absolute Rules
1. ONLY white (#ffffff) and black (#000000) — NO other colors ever
2. ALL corners sharp — `rounded-none` everywhere, no border-radius
3. Font: `font-mono` for all labels, values, and data displays
4. Text sizes: 8px, 9px, 10px only for UI elements
5. All text UPPERCASE with `tracking-wider` or `tracking-[0.2em]`
6. Borders: `border-white/10` (10% opacity white)
7. Backgrounds: `bg-white/[0.02]` to `bg-white/[0.05]` for subtle fills
8. Glassmorphism: `bg-black/95 backdrop-blur-xl` for overlays

## CSS Variables (from globals.css)
- `--background: #000000`
- `--foreground: #ffffff`
- `--border: #333333`
- `--radius: 0rem` (enforces no rounding)

## Three.js Material Palette

| Material Type | Usage | Code |
|---|---|---|
| Wire shell | Outer boundary/context | `<meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />` |
| Solid white | Primary objects | `<meshBasicMaterial color="#ffffff" />` |
| Metallic white | Important objects | `<meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />` |
| Glass/chrome | Spheres, enclosures | `<meshPhysicalMaterial color="#000000" transparent opacity={0.6} metalness={0.9} roughness={0.1} />` |
| Grid plane | Background context | `<meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03} />` |
| Dim white | Secondary objects | `<meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9} />` |
| Emissive | Glowing indicators | `<meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />` |

## Status Bar
Every simulation has a bottom-left status bar showing `SYSTEM.READY V.2.0.4`.
This is rendered automatically by LabContainer. Do NOT add your own.

## Scanline Overlay
LabContainer automatically renders a CRT scanline effect over the simulation.
Do NOT add any additional overlay effects.

## Header
LabContainer renders a top header with:
- Title (left) and description (left, below title)
- Share, split-mode, fullscreen, and reset buttons (right)
All automatic. Do NOT duplicate.

## Sidebar
The right sidebar panel is hidden by default and appears on hover.
In fullscreen mode it stays visible. LabContainer handles the reveal logic.
You provide the CONTENT of the sidebar via the `sidebarControls` prop.
