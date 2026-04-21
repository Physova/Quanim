# Physova Lab — UX Design Specification
# 2026-04-16 — Lab Simulation Interface

## 1. Wireframe Descriptions

The Lab interface is designed as an immersive "window" into a physical experiment, prioritizing the 3D canvas while providing contextual controls.

### A. Main Layout Structure
- **Container**: `relative aspect-video` or `h-[600px]` card.
- **Header Overlay (Fixed Top)**:
  - **Left**: Experiment Title (Amber-500) + Brief Description (Slate-400).
  - **Right**: Utility Actions (Reset, Toggle Controls Sidebar, Fullscreen).
- **Controls Sidebar (Collapsible Right)**:
  - **Purpose**: Complex parameter tuning (Slit width, Detector sensitivity).
  - **Style**: Glassmorphic panel with `backdrop-blur-xl`, `bg-slate-900/40`, `border-l border-slate-800/50`.
  - **Interaction**: Slides in/out on toggle; auto-collapses on mobile.
- **Playback Overlay (Floating Bottom-Center/Right)**:
  - **Purpose**: Essential simulation flow (Play/Pause, Step, Fast Forward).
  - **Style**: Pill-shaped glassmorphic bar.
- **Status Overlay (Bottom-Left)**:
  - **Purpose**: Real-time readouts (FPS, Simulation Time, Particle Count).
  - **Style**: Subtle mono-spaced text on a translucent background.

### B. Sidebar Content Hierarchy
1. **Primary Parameters**: Sliders for continuous physics values (Intensity, Frequency).
2. **Visual Toggles**: Switches for auxiliary visualizations (Show Wavefronts, Probability Density).
3. **Advanced Settings**: Accordion for fine-grained engine tuning (Shader complexity, Raytrace depth).

---

## 2. Interaction Specifications

### A. Simulation Parameters
- **Sliders (Continuous Values)**:
  - **Behavior**: Direct manipulation with immediate visual feedback in the 3D Canvas.
  - **States**:
    - `Default`: Slate-700 track, Amber-500 thumb.
    - `Hover/Drag`: Thumb glows with `shadow-[0_0_10px_rgba(245,158,11,0.5)]`.
  - **Precision**: Hold `Shift` while dragging for 10x finer precision.
- **Toggles (Boolean States)**:
  - **Behavior**: Instantaneous state change; triggers a subtle re-render/re-compilation of shaders.
  - **States**:
    - `Active`: Amber-500 background, Slate-950 switch head.
- **Reset Functionality**:
  - **Global Reset**: Reverts all parameters to defaults and resets the simulation clock.
  - **Local Reset**: Double-click any slider thumb to reset that specific parameter to its default.

### B. 3D Navigation (OrbitControls)
- **Left Mouse Click + Drag**: Orbit/Rotate camera around focus point.
- **Scroll**: Zoom in/out.
- **Right Mouse Click + Drag**: Pan camera.
- **Double Click (Empty Space)**: Reset camera position to default view.
- **Double Click (Object)**: Focus camera on specific object (e.g., Slit, Detector).

---

## 3. Visual Design Specifications

### A. Glassmorphism Design System
- **Background**: `bg-slate-900/40` with `backdrop-blur-xl` (24px).
- **Border**: `1px solid border-slate-800/50`.
- **Inner Glow**: `shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]` (simulates light catch on top edge).
- **Surface Gradient**: Subtle linear gradient from top-left (`white/5`) to bottom-right (`transparent`).
- **Contrast**: Text uses `text-slate-100` (primary) and `text-slate-400` (secondary) to maintain legibility over moving 3D backgrounds.

### B. Gold/Amber (Physics Energy) Accent Application
- **Primary Highlights**: `Amber-400` (#fbbf24) for active UI elements (Active toggles, slider thumbs).
- **Glow Effects**: UI elements indicating "active physics" (e.g., a "Simulation Running" status) use `drop-shadow(0 0 8px rgba(245, 158, 11, 0.4))`.
- **Iconography**: Lucide icons used for controls; active icons tinted Amber-500.
- **Typography Highlights**: Subheadings and important numeric readouts use Amber-500 for high visual hierarchy.

### C. Steel Blue (Community/Depth) Accents
- **Depth Cues**: Gradients transitioning from `Slate-900` to `Steel-Blue` (hex: #4682B4) for background depth and shadow areas.
- **Secondary Actions**: Non-critical buttons (Help, Share) use a ghost-style blue variant.
