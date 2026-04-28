# Article Pipeline — Step-by-Step Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Create the complete multi-skill article orchestrator pipeline for the Physova physics platform.

**Architecture:** 4 Gemini CLI skills (orchestrator, content-formatter, simulation-engineer, build-master) + 1 new React component (Quiz) + 1 workflow trigger + reference files.

**Tech Stack:** Gemini CLI Skills (Markdown), Next.js, MDX, React, Three.js, Tailwind CSS.

**IMPORTANT:** The complete file contents for every skill and reference file are documented in these companion documents in `docs/plans/`. You MUST read them before creating the files:
- `docs/plans/2026-04-27-article-pipeline-design.md` — Architecture overview
- `docs/plans/skill-orchestrator-content.md` — Orchestrator SKILL.md content
- `docs/plans/skill-content-formatter-content.md` — Content formatter SKILL.md content
- `docs/plans/skill-simulation-engineer-content.md` — Simulation engineer SKILL.md content
- `docs/plans/skill-build-master-and-references.md` — Build master SKILL.md + ALL reference files

---

### Task 1: Create the Quiz Component

This component doesn't exist yet. It's needed by the content-formatter skill to generate `<Quiz>` tags.

**Files:**
- Create: `components/content/quiz.tsx`
- Modify: `mdx-components.tsx`

**Step 1: Create the Quiz component**

Create `components/content/quiz.tsx`. This is a client component that renders a multiple-choice question with monochrome styling. Read the COMPLETE component code from `docs/plans/2026-04-27-article-pipeline-design.md`, Section 8.1 "Create Quiz Component". Copy it exactly.

Key design requirements:
- `"use client"` directive at top
- Uses `framer-motion` for button press animation
- Uses `lucide-react` for Check/X icons
- All styling is monochrome: `bg-white/[0.02]`, `border-white/10`, `rounded-none`
- Label says "Self Assessment" in `text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]`
- Options show A, B, C letters in `text-[10px] font-mono font-bold text-white/20`
- After selecting: correct = brighter border + Check icon, wrong = dimmer + X icon
- Correct answer always highlighted after reveal even if not selected

**Step 2: Register Quiz in mdx-components.tsx**

Open `mdx-components.tsx` (project root). Add at the top with other imports:
```tsx
import { Quiz } from '@/components/content/quiz'
```

Add to the returned object, before `...components`:
```tsx
Quiz: (props: React.ComponentProps<typeof Quiz>) => <Quiz {...props} />,
```

**Step 3: Verify**

Run: `npm run build`
Expected: Build passes. No type errors related to Quiz.

**Step 4: Commit**

```bash
git add components/content/quiz.tsx mdx-components.tsx
git commit -m "feat: add Quiz component for in-article self-assessment"
```

---

### Task 2: Create Content Formatter Skill

**Files:**
- Create: `.agent/skills/content-formatter/SKILL.md`
- Create: `.agent/skills/content-formatter/references/writing-format.md`
- Create: `.agent/skills/content-formatter/references/example-input.md`
- Create: `.agent/skills/content-formatter/references/example-output.mdx`

**Step 1: Create directory structure**

```bash
mkdir -p .agent/skills/content-formatter/references
```

**Step 2: Create the SKILL.md**

Read the COMPLETE skill content from `docs/plans/skill-content-formatter-content.md`. The content is inside the markdown code fence. Extract ONLY the content between the ` ```markdown ` and ` ``` ` delimiters — that is the actual SKILL.md content. Write it to `.agent/skills/content-formatter/SKILL.md`.

The SKILL.md must contain:
- YAML frontmatter with `name: content-formatter`
- Description starting with "Use when..."
- Complete equation conversion table (mu → \mu, theta → \theta, etc.)
- Complete question table parsing rules with 1-based to 0-based index conversion
- Step-by-step process (8 steps)
- Common mistakes section

**Step 3: Create reference files**

Read `docs/plans/skill-build-master-and-references.md` for the COMPLETE content of these files:

1. `.agent/skills/content-formatter/references/writing-format.md` — SingerBoy's writing guide
2. `.agent/skills/content-formatter/references/example-input.md` — Raw markdown example (static friction article)
3. `.agent/skills/content-formatter/references/example-output.mdx` — Expected MDX output with `<EquationBlock>` and `<Quiz>` components

**Step 4: Verify the files exist**

```bash
ls -la .agent/skills/content-formatter/
ls -la .agent/skills/content-formatter/references/
```

Expected: SKILL.md + 3 reference files.

**Step 5: Commit**

```bash
git add .agent/skills/content-formatter/
git commit -m "feat: add content-formatter skill for md-to-mdx conversion"
```

---

### Task 3: Create Simulation Engineer Skill

This is the MOST CRITICAL skill. It must be extremely detailed because weak agents will use it to generate Three.js code.

**Files:**
- Create: `.agent/skills/simulation-engineer/SKILL.md`
- Create: `.agent/skills/simulation-engineer/references/design-system.md`
- Create: `.agent/skills/simulation-engineer/references/lab-container-api.md`
- Create: `.agent/skills/simulation-engineer/references/example-simulation.tsx`

**Step 1: Create directory structure**

```bash
mkdir -p .agent/skills/simulation-engineer/references
```

**Step 2: Create the SKILL.md**

Read the COMPLETE skill content from `docs/plans/skill-simulation-engineer-content.md`. Extract the content between the ` ```markdown ` and ` ``` ` delimiters. Write it to `.agent/skills/simulation-engineer/SKILL.md`.

The SKILL.md MUST contain ALL of these sections (verify each exists):
- [ ] YAML frontmatter with `name: simulation-engineer`
- [ ] Color Rules table — FORBIDDEN colors list
- [ ] Typography patterns for Html labels (2 variants with exact className strings)
- [ ] Complete sidebar control pattern (slider + toggle + info panel)
- [ ] Complete bottom toolbar button pattern (play/pause + primary action + reset)
- [ ] File 1 template: `[slug]-sim.tsx` with full component structure
- [ ] File 2 template: `[slug]-lab.tsx` with full LabContainer wrapper
- [ ] CRITICAL NOTE about using local useState instead of global Zustand store
- [ ] Physics implementation guidelines (ForceArrow, particles, trails, springs)
- [ ] Simulation types catalog (mechanics, waves, electromagnetism)
- [ ] Verification checklist

**Step 3: Create reference files**

Read `docs/plans/skill-build-master-and-references.md` for the COMPLETE content of:

1. `.agent/skills/simulation-engineer/references/design-system.md` — Material palette table, CSS variables, status bar info
2. `.agent/skills/simulation-engineer/references/lab-container-api.md` — Props table, behavior docs, default camera/lights

**Step 4: Create the annotated example simulation**

Create `.agent/skills/simulation-engineer/references/example-simulation.tsx` by copying the existing `components/simulations/superposition-sim.tsx` file and adding detailed comments explaining each section. This gives weak agents a real, working reference.

Use `view_file` to read `components/simulations/superposition-sim.tsx`, then create a copy at the reference path with these annotations added as comments:
- `// === IMPORTS: Always import useFrame from fiber and THREE ===`
- `// === PROPS: Receive physics params from parent Lab component ===`
- `// === REFS: Use refs for objects that animate in useFrame ===`
- `// === ANIMATION LOOP: useFrame runs every frame ===`
- `// === WIREFRAME SHELL: Outer context boundary ===`
- `// === GLASS SURFACE: Semi-transparent metallic sphere ===`
- `// === AXIS LINES: Visual orientation guides ===`
- `// === HTML LABELS: In-scene text using drei Html ===`

**Step 5: Verify**

```bash
ls -la .agent/skills/simulation-engineer/
ls -la .agent/skills/simulation-engineer/references/
```

Expected: SKILL.md + 3 reference files.

**Step 6: Commit**

```bash
git add .agent/skills/simulation-engineer/
git commit -m "feat: add simulation-engineer skill with full design system spec"
```

---

### Task 4: Create Build Master Skill

**Files:**
- Create: `.agent/skills/build-master/SKILL.md`

**Step 1: Create directory**

```bash
mkdir -p .agent/skills/build-master
```

**Step 2: Create the SKILL.md**

Read the COMPLETE skill content from `docs/plans/skill-build-master-and-references.md`, the first section titled "File: `.agent/skills/build-master/SKILL.md`". Extract the content between the ` ```markdown ` and ` ``` ` delimiters.

The SKILL.md must contain:
- YAML frontmatter with `name: build-master`
- 6 tasks: inject sim, register in mdx-components, update TOPIC_MAP, update equation-sim-map, build verification, final report
- Exact code patterns for each file modification
- MDX injection placement rules (middle, not end)
- Build error troubleshooting guide
- Verification checklist

**Step 3: Commit**

```bash
git add .agent/skills/build-master/
git commit -m "feat: add build-master skill for stitching and validation"
```

---

### Task 5: Create Article Orchestrator Skill

**Files:**
- Create: `.agent/skills/article-orchestrator/SKILL.md`

**Step 1: Create directory**

```bash
mkdir -p .agent/skills/article-orchestrator
```

**Step 2: Create the SKILL.md**

Read the COMPLETE skill content from `docs/plans/skill-orchestrator-content.md`. Extract the content between the ` ```markdown ` and ` ``` ` delimiters.

The SKILL.md must contain:
- YAML frontmatter with `name: article-orchestrator`
- 5 phases (Ingestion, Content Formatting, Simulation Scoping, Simulation Engineering, Stitching & Validation)
- 4 HALT gates (after questions, after sim design, after sim build, after final build)
- References to all 3 sub-skills via `view_file` instructions
- The "no simulation" shortcut (Phase 2 → Phase 5, skipping 3-4)
- Error handling section
- Key rules section

**Step 3: Commit**

```bash
git add .agent/skills/article-orchestrator/
git commit -m "feat: add article-orchestrator master skill"
```

---

### Task 6: Create Workflow Trigger

**Files:**
- Create: `.agent/workflows/new-article.md`

**Step 1: Create the workflow file**

Read `docs/plans/skill-build-master-and-references.md`, the last section titled "File: `.agent/workflows/new-article.md`". Write that content.

The file should simply invoke the orchestrator skill:
```markdown
# New Article Workflow

Invoke the `.agent/skills/article-orchestrator/SKILL.md` skill and follow it exactly.

The user should provide a path to their raw `.md` draft file.
```

**Step 2: Commit**

```bash
git add .agent/workflows/new-article.md
git commit -m "feat: add /new-article workflow trigger"
```

---

### Task 7: Create Drafts Directory and Writing Guide

**Files:**
- Create: `content/drafts/.gitkeep`
- Create: `content/WRITING_GUIDE.md`

**Step 1: Create drafts directory**

```bash
mkdir -p content/drafts
touch content/drafts/.gitkeep
```

**Step 2: Create the writing guide**

Create `content/WRITING_GUIDE.md` using the content from `docs/plans/skill-build-master-and-references.md`, section "File: `.agent/skills/content-formatter/references/writing-format.md`". This is a copy placed in the content folder so SingerBoy can find it easily alongside his drafts.

**Step 3: Commit**

```bash
git add content/drafts/ content/WRITING_GUIDE.md
git commit -m "docs: add drafts directory and writing guide for content authors"
```

---

### Task 8: End-to-End Verification

**This task is manual verification — do not automate.**

**Step 1: Create a test draft**

Create `content/drafts/test-friction.md` with this content:
```markdown
---
title: "Test Friction Article"
description: "Testing the pipeline"
tags: ["mechanics"]
difficulty: "Beginner"
---

# Friction Basics

Friction opposes motion between surfaces.

The friction equation is f = mu * N

| What is friction? | 3 | A force | A material | An energy | 1 |

## On a Ramp

For an inclined plane: F = mg sin(theta)

| What happens at the critical angle? | 2 | Object slides | Object stays | | 1 |
```

**Step 2: Verify the orchestrator skill is readable**

```bash
cat .agent/skills/article-orchestrator/SKILL.md | head -20
```

Expected: YAML frontmatter with name and description.

**Step 3: Verify all sub-skills are readable**

```bash
cat .agent/skills/content-formatter/SKILL.md | head -5
cat .agent/skills/simulation-engineer/SKILL.md | head -5
cat .agent/skills/build-master/SKILL.md | head -5
```

Expected: Each shows its YAML frontmatter.

**Step 4: Verify reference files exist**

```bash
ls .agent/skills/content-formatter/references/
ls .agent/skills/simulation-engineer/references/
```

Expected: 3 files in content-formatter/references, 3 files in simulation-engineer/references.

**Step 5: Verify Quiz component works**

```bash
npm run build
```

Expected: Build passes with no Quiz-related errors.

**Step 6: Clean up test files**

```bash
rm content/drafts/test-friction.md
```

**Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete article orchestrator pipeline with all skills and references"
```

---

## Summary of All Files Created

```
.agent/
├── skills/
│   ├── article-orchestrator/
│   │   └── SKILL.md                              (~150 lines)
│   ├── content-formatter/
│   │   ├── SKILL.md                              (~200 lines)
│   │   └── references/
│   │       ├── writing-format.md                 (~50 lines)
│   │       ├── example-input.md                  (~40 lines)
│   │       └── example-output.mdx                (~60 lines)
│   ├── simulation-engineer/
│   │   ├── SKILL.md                              (~400 lines)
│   │   └── references/
│   │       ├── design-system.md                  (~60 lines)
│   │       ├── lab-container-api.md              (~50 lines)
│   │       └── example-simulation.tsx            (~160 lines)
│   └── build-master/
│       └── SKILL.md                              (~150 lines)
├── workflows/
│   └── new-article.md                            (~5 lines)
components/
└── content/
    └── quiz.tsx                                  (~80 lines)
content/
├── drafts/
│   └── .gitkeep
└── WRITING_GUIDE.md                              (~50 lines)
mdx-components.tsx                                (modified: +2 lines)
```

**Total new files:** 14
**Total modified files:** 1
**Estimated total new lines:** ~1,500
