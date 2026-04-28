# LabContainer API Reference

## Import
```tsx
import { LabContainer } from "./lab-container";
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Three.js scene content (goes inside `<Canvas>` when `is3D=true`) |
| `title` | `string` | `"Physics Lab"` | Title shown in top-left header |
| `description` | `string` | `undefined` | Subtitle under title |
| `className` | `string` | `undefined` | Additional CSS classes for outer container |
| `onReset` | `() => void` | `undefined` | Reset handler — shows reset button in header when provided |
| `controls` | `ReactNode` | `undefined` | Bottom toolbar content (Play/Pause, action buttons) |
| `sidebarControls` | `ReactNode` | `undefined` | Right sidebar content (sliders, toggles, info panels) |
| `is3D` | `boolean` | `true` | If true, wraps children in R3F `<Canvas>`. If false, renders as plain div |
| `id` | `string` | `undefined` | DOM id for the container. Use `lab-[slug]` pattern |
| `simType` | `string` | `"unknown"` | Identifier for sharing/linking |

## Behavior

### Header (always visible)
- **Left:** Title text + optional description
- **Right:** Share button, split-mode toggle, fullscreen toggle, reset button (if `onReset` provided)

### Bottom Toolbar
- Renders the `controls` prop content
- Fixed at bottom of the simulation container
- Only visible when `controls` is provided

### Right Sidebar
- Renders the `sidebarControls` prop content
- **Hidden by default** — appears on mouse hover (right edge)
- **Always visible** in fullscreen mode
- Width: `w-56` (224px)
- Background: `bg-black/95 backdrop-blur-xl`

### Fullscreen
- Toggle via header button
- Uses native Fullscreen API with pseudo-fullscreen fallback
- In fullscreen: sidebar stays visible, no hover needed

### Split Mode
- Pins simulation to left half of screen (desktop only)
- Article content scrolls on the right

### Default 3D Setup (when `is3D=true`)
LabContainer automatically provides:
- `<Canvas>` with `gl={{ antialias: true, alpha: true }}` and `camera={{ position: [0, 0, 10], fov: 50 }}`
- `<OrbitControls enablePan={false} maxDistance={15} minDistance={3} enableDamping />`
- `<ambientLight intensity={0.8} />`
- `<pointLight position={[10, 10, 10]} intensity={2} />`

**DO NOT** add your own Canvas, Camera, OrbitControls, or ambient/point lights. They're already provided by LabContainer.

### Scanline Overlay
Automatic CRT-style scanline effect. Not configurable. Do not duplicate.

### Status Bar
`SYSTEM.READY V.2.0.4` text in bottom-left corner. Automatic.

## Usage Example
```tsx
<LabContainer
  id="lab-friction"
  simType="friction"
  title="Friction Simulation"
  description="Explore static and kinetic friction on surfaces"
  onReset={handleReset}
  controls={toolbarButtons}
  sidebarControls={sidebarSliders}
  is3D={true}
>
  <FrictionSim angle={angle} friction={friction} isPlaying={isPlaying} />
</LabContainer>
```
