# Design Document: Mobile Integrity

**design_depth: standard**
**task_complexity: medium**

## Problem Statement
The landing page relies on a fixed `100vh` absolute container, breaking layout for mobile.
1. **Navbar**: Overlaps/breaks on narrow screens.
2. **Stage 3 (Discovery)**: Content overflows the fixed container when stacked vertically.
3. **Hero Labels**: Relative screen units are used but text density causes overlap at narrow widths.

## Requirements
- **Functional**:
  - REQ-1: Mobile hamburger menu (standard drawer).
  - REQ-2: Stage 3 narrative layout supports vertical scrolling on mobile.
  - REQ-3: 3D Hero labels dynamically scale based on screen width.
- **Non-Functional**:
  - Consistent visual identity across devices.
  - Desktop-to-mobile layout transition without breaking scroll logic.

## Approach
### Approach 1: Responsive Layout Decoupling (Recommended)
**Summary**: Decouple the landing page from fixed `100vh` containers on mobile, transitioning to a responsive scroll model while keeping the 3D canvas fixed in the background.

**Architecture**:
- **app/page.tsx**: Introduce `isMobile` hook and conditional rendering to switch the narrative container from `absolute inset-0` to `relative` (scrolling) on small viewports.
- **components/navbar.tsx**: Add Hamburger menu component using `Radix UI` or `shadcn` Drawer.
- **components/visuals/physova-hero.tsx**: Implement a `mobileScale` factor for label offsets, ensuring they remain proportional to viewport width rather than fixed multipliers.

**Pros**:
- Solves vertical overflow issue fundamentally.
- Maintains 3D performance.

**Cons**:
- Requires significant changes to `app/page.tsx` scroll narrative logic.

**Risk Level**: Medium

## Decision Matrix
| Criterion | Weight | Approach 1 (Decoupling) |
|-----------|--------|--------------------------|
| Visual Polish | 40% | 5: Addresses all conflicts directly. |
| Performance | 30% | 4: Slightly higher load due to layout shifts. |
| Maintainability| 30% | 4: Keeps logic in existing files. |
| **Weighted Total** | | **4.4** |

## Success Criteria
- [ ] Hamburger menu opens/closes properly on mobile.
- [ ] Stage 3 discovery section scrolls vertically on mobile.
- [ ] 3D Hero labels are readable on all viewports without overlap.

## Risk Assessment
- **Layout Shift**: Changing the narrative container could cause minor layout jitter during orientation change. (Traces To: REQ-2)
- **Complexity**: Managing state between 3D canvas and stacked mobile layout. (Traces To: REQ-3)
