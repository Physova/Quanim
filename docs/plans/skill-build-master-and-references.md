# Build Master Skill + Reference Files (COMPLETE CONTENT)

> **AGENT INSTRUCTIONS:** This contains the build-master skill AND all reference files for the other skills. Create each file at its specified path.

---

## File: `.agent/skills/build-master/SKILL.md`

```markdown
---
name: build-master
description: "Use when stitching a simulation into an MDX article, updating routing maps, and validating the Next.js production build for Physova."
---

# Build Master

## Overview

You are the **final quality gate** in the Physova article pipeline. You stitch the simulation component into the MDX article, update all routing and registry files, and verify the production build passes.

## Inputs

From the orchestrator, you receive:
- **slug**: The article slug (e.g., "friction")
- **hasSimulation**: Whether a simulation was built
- **simComponentName**: PascalCase name of the lab component (e.g., "FrictionLab")
- **simImportPath**: Import path (e.g., "@/components/simulations/friction-lab")

## Tasks

### Task 1: Inject Simulation into MDX (only if hasSimulation = true)

Read the MDX file at `content/topics/[slug].mdx`.

Find an appropriate insertion point for the `<[SimComponentName] />` tag. Follow these placement rules based on existing articles:

1. **BEST: After the first conceptual explanation section.** The student should understand what the simulation shows before interacting with it.
2. **ACCEPTABLE: At the top of the article** (like `entanglement.mdx` does).
3. **NEVER: At the very end.** The simulation should be embedded within the learning flow, not appended as an afterthought.

Insert the component as a self-closing JSX tag:
```mdx
<[SimComponentName]
  title="[Descriptive Title]"
  description="[Short description of what the simulation shows]"
/>
```

### Task 2: Register the Lab Component in mdx-components.tsx

**File to modify:** `mdx-components.tsx` (project root)

Add the import at the top:
```tsx
import { [SimComponentName] } from '@/components/simulations/[slug]-lab'
```

Add to the returned object (before the `...components` spread):
```tsx
[SimComponentName]: (props: React.ComponentProps<typeof [SimComponentName]>) => <[SimComponentName] {...props} />,
```

### Task 3: Add to TOPIC_MAP

**File to modify:** `app/topics/[slug]/page.tsx`

Find the `TOPIC_MAP` constant and add a new entry:
```tsx
const TOPIC_MAP = {
  "double-slit": React.lazy(() => import("@/content/topics/double-slit.mdx")),
  "entanglement": React.lazy(() => import("@/content/topics/entanglement.mdx")),
  "superposition": React.lazy(() => import("@/content/topics/superposition.mdx")),
  // Add this line:
  "[slug]": React.lazy(() => import("@/content/topics/[slug].mdx")),
};
```

**IMPORTANT:** The import path must use `@/content/topics/[slug].mdx` — this is a dynamic import for React.lazy.

### Task 4: Update equation-sim-map.ts (if applicable)

If the simulation has equations that should link to it, add entries to `lib/equation-sim-map.ts`.

First, add the new type to the `SimulationType` union:
```tsx
export type SimulationType = "double-slit" | "entanglement" | "superposition" | "[slug]";
```

Then add equation mappings:
```tsx
"[equation string]": {
  type: "[slug]",
  label: "[Descriptive Label]",
  description: "[What the sim shows for this equation]",
  initialParams: {
    // Default parameter values
  }
},
```

**Note:** This step may not be needed if the simulation doesn't have equations that trigger it. Use judgment.

### Task 5: Build Verification

Run this exact sequence:

```bash
# 1. Type-check (catches import errors, type mismatches)
npx tsc --noEmit

# 2. Full production build (catches everything)
npm run build
```

**If the build fails:**
1. Read the error output carefully
2. Common errors and fixes:
   - `Module not found`: Check import paths — must use `@/` alias
   - `Type error`: Fix TypeScript types — check prop interfaces
   - `JSX element type does not have any construct or call signatures`: The component isn't exported correctly
   - `'X' is not defined`: Missing import statement
3. Fix the error and rebuild
4. Repeat until `npm run build` succeeds with `✓ Build completed`

**If the build passes:**
1. Start the dev server: `npm run dev -- -p 8080`
2. Wait for it to start (check output for "Ready")
3. Report to the orchestrator

### Task 6: Final Report

Tell the orchestrator:
```
✅ Build Master: All tasks complete

Files modified:
  - content/topics/[slug].mdx (simulation injected)
  - mdx-components.tsx (component registered)
  - app/topics/[slug]/page.tsx (TOPIC_MAP updated)
  - lib/equation-sim-map.ts (equations linked) [if applicable]

Build status: PASSING
Dev server: Running at http://localhost:8080
```

## Verification Checklist

- [ ] Simulation component appears in the MDX at the right location
- [ ] `mdx-components.tsx` has the new import and registration
- [ ] `TOPIC_MAP` has the new entry
- [ ] `npm run build` passes with zero errors
- [ ] The article renders correctly at `/topics/[slug]`
- [ ] The simulation loads and is interactive
- [ ] No console errors in the browser
```

---

## File: `.agent/skills/content-formatter/references/writing-format.md`

```markdown
# SingerBoy's Article Writing Guide

## File Location
Save your `.md` files in the `content/drafts/` folder.
Name files in kebab-case: `friction-basics.md`, `wave-interference.md`

## Required Header (copy this every time)
```
---
title: "Your Title"
description: "One sentence about the article."
tags: ["topic1", "topic2"]
difficulty: "Beginner"
---
```

## Writing Sections
Use `##` for main sections, `###` for subsections.

## Adding Questions
Use this EXACT table format:
```
| Question text here | number of options | Option A | Option B | Option C | correct option number |
```

Examples:
```
| What is the SI unit of force? | 3 | Joule | Newton | Watt | 2 |
| Energy is always conserved | 2 | True | False | | 1 |
```

## Adding Equations
Just write them naturally! Examples:
- `F = ma` (AI will convert to proper LaTeX)
- `E = mc^2`
- `T = 2 * pi * sqrt(L/g)`
- `f = mu * N`

Greek letters: Write `mu`, `theta`, `alpha`, `omega`, `lambda`, `pi` — the AI understands.

## Block Quotes
```
> "Famous physics quote here"
> — Scientist Name
```
```

---

## File: `.agent/skills/content-formatter/references/example-input.md`

```markdown
---
title: "Static Friction"
description: "Understanding why objects resist motion."
tags: ["mechanics", "friction"]
difficulty: "Intermediate"
---

# Static Friction

## What is Friction?

Friction is a force that opposes the relative motion between two surfaces in contact. It is one of the most fundamental forces in everyday life.

The basic equation for friction is f = mu * N, where mu is the coefficient of friction and N is the normal force.

## Types of Friction

There are two main types:
- **Static friction** — the force that keeps stationary objects from moving
- **Kinetic friction** — the force that opposes objects already in motion

Static friction is always greater than or equal to kinetic friction: f_s >= f_k

The maximum static friction force is f_s_max = mu_s * N

| What determines the friction force? | 3 | Only the weight | The surfaces and normal force | Only the speed | 2 |

## On an Inclined Plane

When an object sits on a ramp at angle theta:
- The normal force is N = mg cos(theta)
- The component of gravity along the ramp is F_parallel = mg sin(theta)
- The object stays still when f_s >= mg sin(theta)

The critical angle where the object starts sliding is theta_c = arctan(mu_s)

| At what angle does a block start sliding if mu = 0.5? | 3 | 30 degrees | 26.6 degrees | 45 degrees | 2 |

> "There is no branch of mathematics that cannot someday be applied to the problems of the real world."
> — Nikolai Lobachevsky
```

---

## File: `.agent/skills/content-formatter/references/example-output.mdx`

```mdx
---
title: "Static Friction"
slug: "static-friction"
description: "Understanding why objects resist motion."
tags: ["mechanics", "friction"]
publishedAt: "2026-04-27"
difficulty: "Intermediate"
---

# Static Friction

## What is Friction?

Friction is a force that opposes the relative motion between two surfaces in contact. It is one of the most fundamental forces in everyday life.

<EquationBlock
  equation="f = \mu N"
  description="Friction force equals coefficient of friction times the normal force"
/>

## Types of Friction

There are two main types:
- **Static friction** — the force that keeps stationary objects from moving
- **Kinetic friction** — the force that opposes objects already in motion

<EquationBlock
  equation="f_s \geq f_k"
  description="Static friction is always greater than or equal to kinetic friction"
/>

<EquationBlock
  equation="f_{s,max} = \mu_s N"
  description="Maximum static friction force"
/>

<Quiz
  question="What determines the friction force?"
  options={["Only the weight", "The surfaces and normal force", "Only the speed"]}
  correctIndex={1}
/>

## On an Inclined Plane

When an object sits on a ramp at angle theta:
- The normal force is N = mg cos(θ)
- The component of gravity along the ramp is F_parallel = mg sin(θ)
- The object stays still when f_s ≥ mg sin(θ)

<EquationBlock
  equation="\theta_c = \arctan(\mu_s)"
  description="Critical angle where the object begins to slide"
/>

<Quiz
  question="At what angle does a block start sliding if μ = 0.5?"
  options={["30 degrees", "26.6 degrees", "45 degrees"]}
  correctIndex={1}
/>

> "There is no branch of mathematics that cannot someday be applied to the problems of the real world."
> — Nikolai Lobachevsky
```

---

## File: `.agent/skills/simulation-engineer/references/design-system.md`

```markdown
# Physova Design System — Simulation Visual Spec

## Absolute Rules
1. ONLY white (#ffffff) and black (#000000) — NO other colors
2. ALL corners sharp — `rounded-none` everywhere, no border-radius
3. Font: `font-mono` for all labels, values, and data
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

## Material Palette for Three.js
| Material Type | Usage | Properties |
|---|---|---|
| Wire shell | Outer boundary/context | `meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15}` |
| Solid white | Primary objects | `meshBasicMaterial color="#ffffff"` |
| Metallic | Important objects | `meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2}` |
| Glass | Spheres, enclosures | `meshPhysicalMaterial color="#000000" transparent opacity={0.6} metalness={0.9} roughness={0.1}` |
| Grid | Background context | `meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.03}` |
| Dim white | Secondary objects | `meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.9}` |

## Status Bar
Every simulation has a bottom-left status bar (from LabContainer):
```
SYSTEM.READY  V.2.0.4
```
This is automatic — LabContainer handles it.

## Scanline Overlay
LabContainer automatically adds a subtle CRT scanline effect. Do not add your own.
```

---

## File: `.agent/skills/simulation-engineer/references/lab-container-api.md`

```markdown
# LabContainer API Reference

## Import
```tsx
import { LabContainer } from "./lab-container";
```

## Props
| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | The Three.js scene content (goes inside `<Canvas>`) |
| `title` | `string` | "Physics Lab" | Top-left title text |
| `description` | `string` | undefined | Subtitle under title |
| `className` | `string` | undefined | Additional CSS classes |
| `onReset` | `() => void` | undefined | Reset handler — shows reset button in header |
| `controls` | `ReactNode` | undefined | Bottom toolbar buttons (Play/Pause, actions) |
| `sidebarControls` | `ReactNode` | undefined | Right sidebar panel (sliders, toggles, info) |
| `is3D` | `boolean` | true | If true, wraps children in `<Canvas>`. If false, renders as plain div |
| `id` | `string` | undefined | DOM id for the container (use `lab-[slug]` pattern) |
| `simType` | `string` | "unknown" | Identifier for sharing state |

## Behavior
- **Header:** Always visible. Shows title, description, share/reset/split/fullscreen buttons
- **Sidebar:** Right side panel. Hidden by default, appears on hover. Always visible in fullscreen.
- **Fullscreen:** Toggle via button. Supports native fullscreen + pseudo-fullscreen fallback.
- **Split mode:** Pins simulation to left side of screen (desktop only).
- **Scanline overlay:** Automatic CRT effect.
- **Status bar:** "SYSTEM.READY V.2.0.4" always shown bottom-left.

## Default Camera & Lights (when is3D=true)
LabContainer provides:
- `PerspectiveCamera` at position [0, 0, 10]
- `OrbitControls` (no pan, min distance 3, max 15, damping enabled)
- `ambientLight` intensity 0.8
- `pointLight` at [10, 10, 10] intensity 2

Your simulation component receives these automatically. Do NOT add your own camera, controls, or canvas.
```

---

## File: `.agent/workflows/new-article.md`

```markdown
# New Article Workflow

Invoke the `.agent/skills/article-orchestrator/SKILL.md` skill and follow it exactly.

The user should provide a path to their raw `.md` draft file.
```
