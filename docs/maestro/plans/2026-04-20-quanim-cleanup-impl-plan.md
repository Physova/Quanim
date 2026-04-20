---
title: "Quanim Cleanup Implementation Plan"
design_ref: "docs/maestro/plans/2026-04-20-quanim-cleanup-design.md"
created: "2026-04-20T10:30:00Z"
status: "draft"
total_phases: 3
estimated_files: 12
task_complexity: "medium"
---

# Quanim Cleanup Implementation Plan

## Plan Overview

- **Total phases**: 3
- **Agents involved**: `coder`, `debugger`, `ux_designer`, `design_system_engineer`
- **Estimated effort**: Cleanup session targeting stability, performance, and UX.

## Dependency Graph

```
Phase 1 (Foundation & Build Fixes) 
       |
Phase 2 (Visuals & Performance)
       |
Phase 3 (UX & Interactions)
```

## Execution Strategy

| Stage | Phases | Execution | Agent Count | Notes |
|-------|--------|-----------|-------------|-------|
| 1     | Phase 1 | Sequential | 1 | Build stability and config migration |
| 2     | Phase 2 | Sequential | 1 | Particle optimization and background grain |
| 3     | Phase 3 | Sequential | 1 | Split screen exit and fullscreen UI |

---

## Phase 1: Foundation & Build Fixes

### Objective
Resolve `npm run build` errors and migrate deprecated configurations.

### Agent: `debugger`
### Parallel: No

### Files to Modify
- `next.config.ts` — Migrate `experimental.turbo` -> `config.turbopack`.
- `eslint.config.mjs` — Add `ignores` property with patterns from `.eslintignore`.
- `.eslintignore` — Delete after migration.
- `app/auth/signin/page.tsx` — Escape unescaped entities (`'` -> `&apos;`).
- `app/topics/[slug]/page.tsx` — Remove unused `Lab` and `simType`. Fix JSX comments.
- `components/footer.tsx` — Remove unused `Github`, `Twitter`, `MessageSquare`.
- `components/simulations/double-slit-sim.tsx` — Remove unused `Text` and `delta`.
- `components/simulations/entanglement-sim.tsx` — Replace `any` with `unknown` or interfaces.
- `components/social/community-hub.tsx` — Fix JSX comments.
- `components/social/thread-view.tsx` — Fix JSX comments.
- `components/visuals/bento-sections.tsx` — Remove unused `MessageSquare`.
- `components/visuals/topics-list.tsx` — Fix JSX comments.

### Implementation Details
- **ESLint JSX Comments:** Ensure comments are inside braces `{/* comment */}` when inside children.
- **Config:** Update `next.config.ts` using Next.js 15.5+ standards.

### Validation
- Run `npm run build` in PowerShell and confirm success.
- Check ESLint output for zero errors.

### Dependencies
- Blocked by: None
- Blocks: Phase 2, Phase 3

---

## Phase 2: Visuals & Performance

### Objective
Optimize Blackhole simulation and add background grain effect.

### Agent: `design_system_engineer`
### Parallel: No

### Files to Modify
- `components/visuals/quanim-hero.tsx` — Reduce `DN` (particle count) to 2,500. Adjust distribution loop (`dkOrig`) for spacing.
- `app/globals.css` — Update `.qh-grain` SVG filter opacity and visibility for 2-3% grain impact.

### Implementation Details
- **Blackhole:** Change `DN = isMobile ? 1250 : 2500` (reduced from 7000/14000). Adjust `dkOrig` spread logic to fill visual space with fewer points.
- **Grain:** Ensure the SVG filter `feTurbulence` and `feColorMatrix` are tuned for a subtle, high-quality grain.

### Validation
- Visual check of Blackhole density.
- Visual check of background grain on pure black sections.
- Monitor frame rate during Blackhole scroll segment.

### Dependencies
- Blocked by: Phase 1
- Blocks: Phase 3

---

## Phase 3: UX & Interactions

### Objective
Implement split screen exit and fullscreen UI repositioning.

### Agent: `coder`
### Parallel: No

### Files to Modify
- `components/simulations/lab-container.tsx` — Add `Exit Split` button overlay. Implement `Esc` key listener. Reposition controls in `isFullscreen` mode.
- `components/simulations/lab-interface.tsx` — Pass control state/re-layout logic to `LabContainer`.

### Implementation Details
- **Split Exit:** Add a button with `position: absolute; top: 1rem; right: 1rem; z-index: 50` that calls `setIsSplitMode(false)`.
- **Esc Key:** `useEffect` with `keydown` listener for `Escape` key to trigger `setIsSplitMode(false)`.
- **Fullscreen UI:** When `isFullscreen` is true, move simulation buttons from the bottom bar into the left sidebar (below tweaks). Use conditional rendering based on `isFullscreen` prop.

### Validation
- Enter split screen and exit via 'X' button.
- Enter split screen and exit via `Esc` key.
- Enter fullscreen and verify buttons move to left sidebar.

### Dependencies
- Blocked by: Phase 2
- Blocks: None

---

## File Inventory

| # | File | Phase | Purpose |
|---|------|-------|---------|
| 1 | `next.config.ts` | 1 | Config migration |
| 2 | `eslint.config.mjs` | 1 | ESLint migration |
| 3 | `app/auth/signin/page.tsx` | 1 | Lint fix |
| 4 | `app/topics/[slug]/page.tsx` | 1 | Lint fix |
| 5 | `components/footer.tsx` | 1 | Lint fix |
| 6 | `components/simulations/double-slit-sim.tsx` | 1 | Lint fix |
| 7 | `components/simulations/entanglement-sim.tsx` | 1 | Type fix |
| 8 | `components/social/community-hub.tsx` | 1 | Lint fix |
| 9 | `components/visuals/quanim-hero.tsx` | 2 | Particle optimization |
| 10| `app/globals.css` | 2 | Background grain |
| 11| `components/simulations/lab-container.tsx` | 3 | UX logic |
| 12| `components/simulations/lab-interface.tsx` | 3 | UX UI updates |

## Risk Classification

| Phase | Risk | Rationale |
|-------|------|-----------|
| 1 | LOW | Standard lint/config fixes. High visibility but low complexity. |
| 2 | MEDIUM | Visual balance. Particle reduction might make the blackhole look "thin" if spacing isn't right. |
| 3 | MEDIUM | Layout shifts in fullscreen/split-mode can break responsive behavior if not carefully styled. |

## Execution Profile

```
Execution Profile:
- Total phases: 3
- Parallelizable phases: 0 (Sequenced for stability and review)
- Sequential-only phases: 3
- Estimated wall time: 25-30 minutes

Note: Sequential execution preferred to ensure build success (Phase 1) before visual/UX tweaks.
```
