---
title: "Mobile Integrity Implementation Plan"
design_ref: "docs/maestro/plans/2026-04-18-mobile-integrity-design.md"
created: "2026-04-18T12:00:00Z"
status: "draft"
total_phases: 3
estimated_files: 3
task_complexity: "medium"
---

# Mobile Integrity Implementation Plan

## Plan Overview
- **Total phases**: 3
- **Agents involved**: coder, design_system_engineer
- **Estimated effort**: Implement responsive navbar, decouple 100vh scroll narrative, and add label scaling.

## Dependency Graph
```
Phase 1: Responsive Nav
   |
Phase 2: Narrative Layout (Decoupling)
   |
Phase 3: Label Scaling
```

## Execution Strategy
| Stage | Phases | Execution | Agent Count | Notes |
|-------|--------|-----------|-------------|-------|
| 1     | Phase 1 | Sequential | 1 | Navigation |
| 2     | Phase 2 | Sequential | 1 | Narrative Layout |
| 3     | Phase 3 | Sequential | 1 | Hero Polish |

## Phase 1: Responsive Nav
### Objective
Implement mobile hamburger menu with overlay drawer.

### Agent: coder
### Parallel: No

### Files to Create
- `components/mobile-nav.tsx` — Drawer-based mobile navigation component.

### Files to Modify
- `components/navbar.tsx` — Integrate mobile nav drawer, show on mobile, hide on desktop.

### Validation
- Verify menu opens/closes on small screens.

### Dependencies
- Blocked by: None
- Blocks: Phase 2

---

## Phase 2: Narrative Layout (Decoupling)
### Objective
Transition Stage 3 to scrollable layout on mobile.

### Agent: coder
### Parallel: No

### Files to Modify
- `app/page.tsx` — Add `isMobile` logic to switch container styles from `absolute` to `relative` on mobile viewports.
- `components/visuals/bento-sections.tsx` — Ensure bento modules are properly spaced for vertical stacking.

### Implementation Details
- Add responsive breakpoint classes for the container.

### Validation
- Ensure no layout shift on desktop. Verify vertical scrolling works on mobile for Stage 3.

### Dependencies
- Blocked by: Phase 1
- Blocks: Phase 3

---

## Phase 3: Hero Labels Scaling
### Objective
Scale 3D labels relative to viewport width to avoid overlap.

### Agent: design_system_engineer
### Parallel: No

### Files to Modify
- `components/visuals/quanim-hero.tsx` — Add `mobileScale` factor to label projection logic.

### Validation
- Check label alignment on mobile emulation.

### Dependencies
- Blocked by: Phase 2
- Blocks: None

---

## File Inventory
| # | File | Phase | Purpose |
|---|------|-------|---------|
| 1 | `components/mobile-nav.tsx` | 1 | Mobile drawer navigation. |
| 2 | `components/navbar.tsx` | 1 | Integrate mobile nav. |
| 3 | `app/page.tsx` | 2 | Responsive layout switching. |
| 4 | `components/visuals/quanim-hero.tsx` | 3 | Label scaling logic. |

## Risk Classification
| Phase | Risk | Rationale |
|-------|------|-----------|
| 1     | LOW | Standard UI pattern. |
| 2     | HIGH | Decoupling the narrative scroll could break Three.js logic. |
| 3     | LOW | Minor math adjustment. |

## Execution Profile
```
Execution Profile:
- Total phases: 3
- Parallelizable phases: 0
- Sequential-only phases: 3
- Estimated parallel wall time: N/A
- Estimated sequential wall time: 20-30 minutes
```
