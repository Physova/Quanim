---
title: "Landing Page UX & Animation Fixes Implementation Plan"
design_ref: "docs/maestro/plans/2026-04-18-landing-page-ux-fixes-design.md"
created: "2026-04-18T12:00:00Z"
status: "draft"
total_phases: 3
estimated_files: 3
task_complexity: "medium"
---

# Landing Page UX & Animation Fixes Implementation Plan

## Plan Overview
- **Total phases**: 3
- **Agents involved**: design_system_engineer, coder, tester
- **Estimated effort**: Surgical fixes to scroll orchestration and visual lifting logic.

## Dependency Graph
```
Phase 1: Foundation (Tokens/CSS)
   |
Phase 2: Implementation (Logic/Timing)
   |
Phase 3: Quality (Verification)
```

## Execution Strategy
| Stage | Phases | Execution | Agent Count | Notes |
|-------|--------|-----------|-------------|-------|
| 1     | Phase 1 | Sequential | 1 | Foundation |
| 2     | Phase 2 | Sequential | 1 | Core Implementation |
| 3     | Phase 3 | Sequential | 1 | Verification |

## Phase 1: Foundation (Visual Tokens)
### Objective
Establish dynamic width for active scroll dots and ensure overflow safety in the sidebar.

### Agent: design_system_engineer
### Parallel: No

### Files to Modify
- `app/page.tsx` — Add `width` or `scaleX` transform to the active dot indicator using `scrollYProgress`.

### Implementation Details
- Define `dotWidth` transform: `useTransform(smoothProgress, [pos - 0.05, pos, pos + 0.05], ["4px", "12px", "4px"])` for each dot position `pos`.
- Ensure the dot container has `overflow: visible` or sufficient padding to accommodate the wider active dot.

### Validation
- Visual check of the scroll sidebar.

### Dependencies
- Blocked by: None
- Blocks: Phase 2

---

## Phase 2: Implementation (Orchestration & Timing)
### Objective
Correct the scroll dot overflow, sync Stage 3 shutters, and lift the spacecraft.

### Agent: coder
### Parallel: No

### Files to Modify
- `app/page.tsx` — Change `dotTop` mapping to `["4px", "calc(100% - 4px)"]`. Adjust `stage3Opacity` and `stage4Opacity` breakpoints.
- `components/visuals/physova-hero.tsx` — Increase `bentoLift` from `1.8` to `2.8`.
- `components/visuals/bento-sections.tsx` — Update `DiscoverySection` shutter scroll ranges to match the parent's new breakpoints.

### Implementation Details
- Sync ranges: If Stage 3 opacity starts at `0.5`, the shutters in `bento-sections.tsx` should also start at `0.5`.
- `bentoLift` adjustment: Ensure the spacecraft doesn't clip the top of the screen at standard resolutions (1080p).

### Validation
- Manual scroll through the landing page.
- Verify spacecraft visibility during Bento module presentation.

### Dependencies
- Blocked by: Phase 1
- Blocks: Phase 3

---

## Phase 3: Quality (Verification)
### Objective
Ensure no regressions in the scroll narrative across different scroll speeds.

### Agent: tester
### Parallel: No

### Validation
- Audit scroll boundaries (start/end).
- Audit Stage 3 transition smoothness.

### Dependencies
- Blocked by: Phase 2
- Blocks: None

---

## File Inventory
| # | File | Phase | Purpose |
|---|------|-------|---------|
| 1 | `app/page.tsx` | 1, 2 | Scroll dots logic, timing breakpoints, overflow fix. |
| 2 | `components/visuals/physova-hero.tsx` | 2 | Spacecraft lift logic. |
| 3 | `components/visuals/bento-sections.tsx` | 2 | Shutter animation timing. |

## Risk Classification
| Phase | Risk | Rationale |
|-------|------|-----------|
| 1     | LOW | Purely visual CSS/Framer Motion changes. |
| 2     | MEDIUM | Timing shifts might affect Stage 4 (Sun) transition. |
| 3     | LOW | Verification only. |

## Execution Profile
```
Execution Profile:
- Total phases: 3
- Parallelizable phases: 0
- Sequential-only phases: 3
- Estimated parallel wall time: N/A
- Estimated sequential wall time: 10-15 minutes
```
