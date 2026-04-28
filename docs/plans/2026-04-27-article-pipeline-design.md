# Article Orchestrator Pipeline — Complete Design Document

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a multi-agent Gemini CLI skill system that lets the non-technical article writer (SingerBoy) convert raw `.md` files written in Obsidian/VSCode into fully production-ready `.mdx` articles with interactive Three.js simulations — all by running a single command.

**Architecture:** A master orchestrator skill delegates work to 3 specialized sub-skills (Content Formatter, Simulation Engineer, Build Master). The orchestrator uses `<HALT>` gates to pause for user approval at key checkpoints. Each sub-skill has its own deeply detailed `.md` file that enforces Quanim's strict monochromatic design language.

**Tech Stack:** Gemini CLI Skills, Next.js 14, MDX, React, Three.js, @react-three/fiber, @react-three/drei, Zustand, Tailwind CSS, KaTeX.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [SingerBoy's Writing Format](#3-singerboys-writing-format)
4. [Orchestrator Skill Design](#4-orchestrator-skill)
5. [Content Formatter Skill Design](#5-content-formatter-skill)
6. [Simulation Engineer Skill Design](#6-simulation-engineer-skill)
7. [Build Master Skill Design](#7-build-master-skill)
8. [Codebase Changes Required](#8-codebase-changes-required)
9. [File Manifest](#9-file-manifest)
10. [Task Breakdown](#10-task-breakdown)

---

## 1. System Overview

### The Problem
- SingerBoy writes physics content but cannot write JSX/MDX/React
- Simulations are our main selling point but require expert Three.js knowledge
- Currently, every new article requires manual developer intervention to format MDX, build simulations, and wire up routing
- The `TOPIC_MAP` in `app/topics/[slug]/page.tsx` is hardcoded — adding a new article requires code changes
- The `Lab` component in `lab-interface.tsx` uses a hardcoded switch/case — no extensibility
- The `simulation-store.ts` has hardcoded state for only 3 simulations

### The Solution
A pipeline of 4 Gemini CLI skills that automate the entire process:

```
SingerBoy writes friction.md in Obsidian
         ↓
Runs: /article-orchestrator @friction.md
         ↓
  ┌──────────────────────────────────┐
  │  ORCHESTRATOR (asks questions)   │
  │  - Grade? → 11                   │
  │  - Difficulty? → Intermediate    │
  │  - Simulation? → Yes, friction   │
  │    on an inclined plane          │
  └──────┬───────────────────────────┘
         ↓
  ┌──────────────────────────────────┐
  │  CONTENT FORMATTER               │
  │  - Reads raw .md                 │
  │  - Converts questions → <Quiz>   │
  │  - Converts equations → KaTeX    │
  │  - Generates frontmatter         │
  │  - Writes friction.mdx           │
  └──────┬───────────────────────────┘
         ↓
  ┌──────────────────────────────────┐
  │  SIMULATION ENGINEER             │
  │  - Reads the MDX for context     │
  │  - Designs sim architecture      │
  │  - <HALT> for user approval      │
  │  - Builds friction-sim.tsx       │
  │  - Starts localhost:8080         │
  │  - <HALT> for user visual check  │
  └──────┬───────────────────────────┘
         ↓
  ┌──────────────────────────────────┐
  │  BUILD MASTER                    │
  │  - Injects simulation into MDX   │
  │  - Updates TOPIC_MAP             │
  │  - Updates mdx-components.tsx    │
  │  - Runs npm run build            │
  │  - Starts localhost:8080         │
  │  - <HALT> for final approval     │
  └──────────────────────────────────┘
```

---

## 2. Architecture Diagram

### Skill File Structure
```
.agent/skills/
├── article-orchestrator/
│   └── SKILL.md                    # Master orchestrator
├── content-formatter/
│   ├── SKILL.md                    # Content formatting rules
│   └── references/
│       ├── writing-format.md       # SingerBoy's syntax reference
│       ├── example-input.md        # Example raw markdown
│       └── example-output.mdx      # Expected MDX output
├── simulation-engineer/
│   ├── SKILL.md                    # Simulation building rules
│   └── references/
│       ├── design-system.md        # Complete Quanim visual spec
│       ├── lab-container-api.md    # LabContainer props & usage
│       └── example-simulation.tsx  # Annotated reference sim
└── build-master/
    └── SKILL.md                    # Build validation & stitching
```

### How Skills Interact
The orchestrator does NOT spawn sub-agents. Instead, it instructs the SAME Gemini agent to switch personas by reading the sub-skill files. The flow is:

1. Orchestrator reads its own SKILL.md → enters Phase 1
2. Orchestrator says: "Now read `.agent/skills/content-formatter/SKILL.md` and follow it"
3. Agent reads content-formatter → executes Phase 2
4. Orchestrator says: "Now read `.agent/skills/simulation-engineer/SKILL.md` and follow it"
5. Agent reads simulation-engineer → executes Phase 3-4
6. Orchestrator says: "Now read `.agent/skills/build-master/SKILL.md` and follow it"
7. Agent reads build-master → executes Phase 5

---

## 3. SingerBoy's Writing Format

SingerBoy writes in **standard Markdown** with these simple additions:

### Frontmatter (required)
```markdown
---
title: "Friction"
description: "Understanding static and kinetic friction."
tags: ["mechanics", "forces"]
difficulty: "Intermediate"
grade: 11
---
```

### Questions Format
```markdown
| Question | How many options | Option A | Option B | Option C | Correct option number |
```

**Examples:**
```markdown
| What is the coefficient of friction symbol? | 3 | α | μ | θ | 2 |
| Friction always opposes motion | 2 | True | False | | 1 |
```

### Equations
SingerBoy writes equations in natural syntax. The AI understands context:
```markdown
The force of friction is f = mu * N

For an inclined plane: F = mg sin(theta) - mu * mg cos(theta)

The work done against friction is W = f * d * cos(180) = -fd
```

### Simulation Request
SingerBoy does NOT write any simulation code. Instead, the orchestrator asks if they want one and what it should show.

---

## 4. Orchestrator Skill

### File: `.agent/skills/article-orchestrator/SKILL.md`

This is the master controller. It coordinates the entire pipeline.

**Key behaviors:**
- Asks SingerBoy metadata questions using conversational prompts
- Stores answers in working memory (the conversation context)
- Delegates to sub-skills by instructing the agent to read them
- Uses `<HALT>` gates at 4 checkpoints
- Handles the "no simulation" shortcut (skip Phase 3-4)

**Checkpoint gates:**
1. After metadata questions → wait for answers
2. After content formatting → show summary, wait for OK
3. After simulation design → show scope, wait for approval
4. After final build → show localhost, wait for final sign-off

---

## 5. Content Formatter Skill

### File: `.agent/skills/content-formatter/SKILL.md`

**Identity:** You are a strict Markdown-to-MDX compiler that understands physics notation.

**Input:** Raw `.md` file + metadata from orchestrator (grade, difficulty)
**Output:** Formatted `.mdx` file in `/content/topics/[slug].mdx`

**Rules:**
1. Parse frontmatter and merge with orchestrator metadata
2. Find question tables (`| Question | ...`) and convert to `<Quiz>` components
3. Find natural-language equations and convert to `<EquationBlock>` components
4. Preserve all other markdown (headings, paragraphs, lists, blockquotes)
5. Do NOT add any simulation components — that's the simulation engineer's job
6. Validate the output by running `node .agent/skills/article-orchestrator/scripts/validate-mdx.js`

**Question conversion rule:**
```
Input:  | What is friction? | 3 | A force | A material | An energy | 1 |
Output: <Quiz
          question="What is friction?"
          options={["A force", "A material", "An energy"]}
          correctIndex={0}
        />
```
Note: correctIndex is 0-based (input "1" → index 0)

**Equation conversion rule:**
```
Input:  The friction force is f = mu * N
Output: <EquationBlock
          equation="f = \mu N"
          description="The friction force equals the coefficient of friction times the normal force"
        />
```

The AI must understand that:
- `mu` → `\mu` (Greek letter)
- `theta` → `\theta`
- `alpha` → `\alpha`
- `pi` → `\pi`
- `sqrt(x)` → `\sqrt{x}`
- `x^2` → `x^2`
- `x/y` → `\frac{x}{y}` (for block equations)

**MDX output must match this exact structure** (based on existing articles):
```mdx
---
title: "Friction"
slug: "friction"
description: "Understanding static and kinetic friction."
tags: ["mechanics", "forces"]
publishedAt: "2026-04-27"
difficulty: "Intermediate"
---

# Friction

Understanding how surfaces interact

## Section heading

Paragraph text here...

<EquationBlock
  equation="f = \mu N"
  description="Friction force equation"
/>

<Quiz
  question="What is the symbol for friction coefficient?"
  options={["α", "μ", "θ"]}
  correctIndex={1}
/>
```

---

## 6. Simulation Engineer Skill

### File: `.agent/skills/simulation-engineer/SKILL.md`

This is the MOST CRITICAL and MOST DETAILED skill. It must produce simulations that perfectly match our existing visual language.

**Identity:** You are an expert creative coder specializing in Three.js physics simulations with a strict monochromatic design aesthetic.

### Design System Rules (MANDATORY)

Every simulation MUST follow these rules without exception:

#### Color Palette
- Background: Pure black `#000000`
- Primary: White `#ffffff` at varying opacities
- NO colors. No red, blue, green, gold, amber. ONLY white on black.
- Object fills: `#ffffff` with `opacity` variations (0.03 to 1.0)
- Borders: `border-white/10` (rgba 255,255,255,0.1)
- Text: White at opacities: `/80` for primary, `/60` for secondary, `/40` for labels, `/30` for hints

#### Typography
- Labels: `text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40`
- Values: `text-[10px] font-mono text-white/60`
- Hints: `text-[8px] text-white/30 italic`
- Section headers: `text-[10px] font-bold text-white/40 uppercase tracking-wider`

#### Geometry
- `rounded-none` on EVERYTHING. No border radius anywhere.
- Sharp corners, clean edges, no softness
- Wireframe materials for outer shells: `wireframe transparent opacity={0.15}`
- Glass/metallic surfaces: `metalness={0.8} roughness={0.2}`

#### Controls (Sidebar)
- Sliders: `<input type="range" className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white" />`
- Buttons: `text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white` or inverted `bg-white text-black hover:bg-white/90`
- Separators: `<Separator className="bg-white/10" />`
- Labels always ABOVE the control, flex justify-between with value on right

#### Three.js Patterns (from existing simulations)
- Camera: `<PerspectiveCamera makeDefault position={[0, 0, 10]} />`
- Controls: `<OrbitControls enablePan={false} maxDistance={15} minDistance={3} enableDamping />`
- Lighting: `<ambientLight intensity={0.8} />` + `<pointLight position={[10, 10, 10]} intensity={2} />`
- Materials: `meshBasicMaterial` for pure white, `meshStandardMaterial` for lit surfaces, `meshPhysicalMaterial` for glass
- Wireframes: `<meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.15} />`
- Html labels: Use `@react-three/drei` `<Html>` with `className="pointer-events-none"` and styled `<div>` inside

### Architecture Pattern

Every new simulation MUST follow this exact file structure:

#### 1. Simulation Component: `components/simulations/[slug]-sim.tsx`
```tsx
"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
// Import from drei as needed: { Line, Html, Sphere, Box, Cylinder }

// Props interface for any configurable parameters
interface [Name]SimProps {
  param1: number;
  param2: boolean;
  // ... physics parameters driven by sidebar controls
}

export default function [Name]Sim({ param1, param2 }: [Name]SimProps) {
  const groupRef = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // Animation loop — update physics here
    // Use delta for frame-independent animation
    // Use state.clock.getElapsedTime() for time-based effects
  });

  return (
    <group ref={groupRef}>
      {/* 3D scene content */}
    </group>
  );
}
```

#### 2. Wrapper Component: `components/simulations/[slug]-lab.tsx`
This wraps the sim with LabContainer + controls:
```tsx
"use client";

import * as React from "react";
import { LabContainer } from "./lab-container";
import [Name]Sim from "./[slug]-sim";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Import relevant lucide icons

interface [Name]LabProps {
  title?: string;
  description?: string;
  className?: string;
}

export function [Name]Lab({ title, description, className }: [Name]LabProps) {
  // Local state for this simulation's parameters
  const [param1, setParam1] = React.useState(defaultValue);
  const [param2, setParam2] = React.useState(defaultValue);

  const handleReset = () => {
    setParam1(defaultValue);
    setParam2(defaultValue);
  };

  // Bottom toolbar buttons
  const controls = (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="flex items-center gap-2 text-[10px] h-8 px-3 rounded-none hover:bg-white/10 text-white"
      >
        <RotateCcw className="h-3 w-3" />
        RESET
      </Button>
    </>
  );

  // Right sidebar controls (hover-reveal)
  const sidebarControls = (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Parameter Name
          </label>
          <span className="text-[10px] font-mono text-white/60">
            {param1} units
          </span>
        </div>
        <input
          type="range"
          min="0" max="100" step="1"
          value={param1}
          onChange={(e) => setParam1(Number(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
      </div>
      <Separator className="bg-white/10" />
      {/* More controls... */}
    </div>
  );

  return (
    <LabContainer
      id={`lab-[slug]`}
      simType="[slug]"
      title={title || "[Name] Simulation"}
      description={description || "Interactive physics simulation"}
      onReset={handleReset}
      controls={controls}
      sidebarControls={sidebarControls}
      is3D={true}
      className={className}
    >
      <[Name]Sim param1={param1} param2={param2} />
    </LabContainer>
  );
}
```

**CRITICAL:** New simulations use LOCAL React state (useState) instead of the global Zustand store. The global store is legacy for the 3 original quantum sims. New sims are self-contained.

### Physics Simulation Patterns

The simulation engineer must be able to build these types of simulations:

**Mechanics (Grade 9-12):**
- Inclined planes with friction (blocks sliding, force vectors)
- Projectile motion (trajectory arcs, adjustable angle/velocity)
- Simple harmonic motion (springs, pendulums)
- Circular motion (centripetal force visualization)
- Collisions (elastic/inelastic, momentum conservation)

**Waves & Optics:**
- Wave interference (already have double-slit as reference)
- Standing waves on strings
- Lens ray diagrams
- Reflection/refraction

**Electromagnetism:**
- Electric field lines
- Magnetic field around current-carrying wire
- Electromagnetic induction

**For each simulation, the engineer must:**
1. Read the article content to understand the physics
2. Identify the key equation(s) that drive the simulation
3. Map equation parameters to interactive controls
4. Build the 3D scene using the monochrome design system
5. Ensure the physics loop runs in `useFrame` with delta-time

---

## 7. Build Master Skill

### File: `.agent/skills/build-master/SKILL.md`

**Identity:** You are the final quality gate. You stitch everything together and verify the build passes.

**Tasks:**
1. Inject the simulation component into the MDX file at an appropriate location (after the theory section, before questions/applications)
2. Register the new lab component in `mdx-components.tsx`
3. Add the new topic to the `TOPIC_MAP` in `app/topics/[slug]/page.tsx`
4. If the simulation has equations, add entries to `lib/equation-sim-map.ts`
5. Run `npm run build` — fix any TypeScript errors
6. Run `npm run dev -- -p 8080` — ask user to check localhost:8080
7. Report completion

### MDX Injection Rules
The simulation goes in the MIDDLE of the article, not at the end. Based on existing articles:
- `superposition.mdx`: `<Lab>` is after the intro paragraph, before the theory
- `double-slit.mdx`: `<Lab>` is after "What You're Seeing" section
- `entanglement.mdx`: `<Lab>` is at the very top, before all text

Pattern: Place the simulation after the first conceptual explanation, so students understand what they're about to interact with.

### TOPIC_MAP Update
```tsx
// In app/topics/[slug]/page.tsx
const TOPIC_MAP = {
  "double-slit": React.lazy(() => import("@/content/topics/double-slit.mdx")),
  "entanglement": React.lazy(() => import("@/content/topics/entanglement.mdx")),
  "superposition": React.lazy(() => import("@/content/topics/superposition.mdx")),
  // NEW: Add this line
  "[new-slug]": React.lazy(() => import("@/content/topics/[new-slug].mdx")),
};
```

### mdx-components.tsx Update
```tsx
// Add import at top
import { [Name]Lab } from '@/components/simulations/[slug]-lab'

// Add to the returned object
[Name]Lab: (props: React.ComponentProps<typeof [Name]Lab>) => <[Name]Lab {...props} />,
```

---

## 8. Codebase Changes Required

Before the skills can work, we need these code changes:

### 8.1 Create `<Quiz>` Component
File: `components/content/quiz.tsx`

Currently doesn't exist. The content formatter generates `<Quiz>` tags but the component isn't built yet.

```tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface QuizProps {
  question: string;
  options: string[];
  correctIndex: number;
}

export function Quiz({ question, options, correctIndex }: QuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
  };

  return (
    <div className="my-8 p-6 bg-white/[0.02] border border-white/10 rounded-none">
      <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-4">
        Self Assessment
      </div>
      <p className="text-sm text-white/80 mb-6 font-medium">{question}</p>
      <div className="space-y-2">
        {options.map((option, i) => {
          const isCorrect = i === correctIndex;
          const isSelected = i === selected;
          let borderClass = "border-white/10";
          let bgClass = "bg-transparent";
          let textClass = "text-white/60";

          if (revealed && isSelected && isCorrect) {
            borderClass = "border-white/40";
            bgClass = "bg-white/10";
            textClass = "text-white";
          } else if (revealed && isSelected && !isCorrect) {
            borderClass = "border-white/20";
            bgClass = "bg-white/[0.03]";
            textClass = "text-white/30";
          } else if (revealed && isCorrect) {
            borderClass = "border-white/30";
            textClass = "text-white/80";
          }

          return (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              whileTap={!revealed ? { scale: 0.98 } : {}}
              className={`w-full text-left px-4 py-3 border ${borderClass} ${bgClass} rounded-none transition-all flex items-center gap-3 ${!revealed ? 'cursor-pointer hover:border-white/20 hover:bg-white/[0.02]' : 'cursor-default'}`}
            >
              <span className="text-[10px] font-mono font-bold text-white/20 w-4">
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-sm ${textClass} flex-1`}>{option}</span>
              {revealed && isSelected && (
                isCorrect
                  ? <Check className="h-4 w-4 text-white/80" />
                  : <X className="h-4 w-4 text-white/30" />
              )}
              {revealed && !isSelected && isCorrect && (
                <Check className="h-4 w-4 text-white/40" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
```

### 8.2 Register Quiz in mdx-components.tsx
```tsx
import { Quiz } from '@/components/content/quiz'

// In the returned object:
Quiz: (props: React.ComponentProps<typeof Quiz>) => <Quiz {...props} />,
```

### 8.3 Create `content/drafts/` directory
```bash
mkdir -p content/drafts
```
This is where SingerBoy drops his `.md` files.

---

## 9. File Manifest

### New Files to Create

| # | File | Purpose | Lines (est.) |
|---|------|---------|-------------|
| 1 | `.agent/skills/article-orchestrator/SKILL.md` | Master orchestrator skill | ~150 |
| 2 | `.agent/skills/content-formatter/SKILL.md` | Content formatting rules | ~200 |
| 3 | `.agent/skills/content-formatter/references/writing-format.md` | SingerBoy's syntax guide | ~80 |
| 4 | `.agent/skills/content-formatter/references/example-input.md` | Raw markdown example | ~40 |
| 5 | `.agent/skills/content-formatter/references/example-output.mdx` | Expected MDX output | ~60 |
| 6 | `.agent/skills/simulation-engineer/SKILL.md` | Simulation building rules | ~400 |
| 7 | `.agent/skills/simulation-engineer/references/design-system.md` | Visual spec | ~150 |
| 8 | `.agent/skills/simulation-engineer/references/lab-container-api.md` | LabContainer docs | ~80 |
| 9 | `.agent/skills/simulation-engineer/references/example-simulation.tsx` | Annotated reference | ~160 |
| 10 | `.agent/skills/build-master/SKILL.md` | Build & stitching rules | ~150 |
| 11 | `components/content/quiz.tsx` | Quiz component | ~80 |
| 12 | `content/drafts/.gitkeep` | Drafts directory | 0 |

### Files to Modify

| # | File | Change |
|---|------|--------|
| 1 | `mdx-components.tsx` | Add Quiz import and registration |
| 2 | `.agent/workflows/` | Add `new-article.md` workflow trigger |

---

## 10. Task Breakdown

### Task 1: Create Quiz Component + Register in MDX
- Create `components/content/quiz.tsx` with the code from Section 8.1
- Update `mdx-components.tsx` to import and register `Quiz`
- Verify: `npm run build` passes

### Task 2: Create Content Formatter Skill
- Create `.agent/skills/content-formatter/SKILL.md`
- Create all files in `references/` subdirectory
- The SKILL.md must contain COMPLETE rules for equation/question conversion

### Task 3: Create Simulation Engineer Skill
- Create `.agent/skills/simulation-engineer/SKILL.md`
- Create all files in `references/` subdirectory
- The SKILL.md must contain the COMPLETE design system specification
- Include the annotated example simulation file

### Task 4: Create Build Master Skill
- Create `.agent/skills/build-master/SKILL.md`
- Must contain exact file paths and code patterns for TOPIC_MAP updates

### Task 5: Create Article Orchestrator Skill
- Create `.agent/skills/article-orchestrator/SKILL.md`
- Must reference all 3 sub-skills
- Must define the 5 phases and 4 HALT gates
- Must handle the "no simulation" shortcut path

### Task 6: Create Workflow Trigger
- Create `.agent/workflows/new-article.md` so SingerBoy can invoke with `/new-article`

### Task 7: Create Drafts Directory + Writing Guide
- Create `content/drafts/.gitkeep`
- Create `content/WRITING_GUIDE.md` for SingerBoy

### Task 8: End-to-End Verification
- Create a test draft `content/drafts/test-friction.md`
- Manually run through the orchestrator flow
- Verify the generated MDX, simulation, and build all work
- Delete test files after verification
