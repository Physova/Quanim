# Design Document: Landing Page UX & Animation Fixes

**design_depth: deep**
**task_complexity: medium**

## Problem Statement
The landing page scroll narrative has several UX and visual coordination issues:
1. **Scroll Dot Overflow**: The dot tracks the entire height (0% to 100%) but overflows its track due to centering transforms.
2. **Timing Mismatch (Stage 3)**: Discovery modules appear at the wrong scroll point (dot 3.5 instead of dot 3) because their shutter animations don't align with parent container opacity.
3. **Visual Conflict**: Bento modules (Stage 3) obscure the spacecraft, and disappear too abruptly.
4. **Scroll Indicator Width**: The indicator needs more visual prominence during active scroll.

## Requirements
- **Functional**:
  - REQ-1: Scroll dot stays within track boundaries at 0% and 100%.
  - REQ-2: Discovery modules (Stage 3) align with the 3rd scroll dot (scroll pos ~0.45-0.55).
  - REQ-3: Spacecraft (Hero) remains visible "above" the modules during Stage 3 transition.
  - REQ-4: Active scroll indicator widens dynamically based on its position in the narrative.
- **Non-Functional**:
  - Smooth 60fps animations via Framer Motion/Three.js.
  - No layout shifts in the fixed sidebar.

## Approach
### Approach 1: Coordinated Scroll Transformation (Recommended)
**Summary**: Adjust the mapping of `scrollYProgress` in `app/page.tsx` and the `bentoLift` in `physova-hero.tsx`. Sync the `DiscoverySection` shutters with the main Stage 3 transition range.

**Architecture**:
- **app/page.tsx**: Adjust `dotTop` transform range to `[4px, "calc(100% - 4px)"]`. Update `stage3Opacity` and `stage4Opacity` breakpoints to improve timing.
- **physova-hero.tsx**: Increase `bentoLift` from `1.8` to `2.8` to move the spacecraft above the modules. Add a `width` transform to the scroll dots using `useTransform`.
- **bento-sections.tsx**: Align `shutterLeft/Right` and `contentOpacity` ranges with the parent's `stage3Opacity` scroll points.

**Pros**:
- Surgical fix to existing orchestration.
- No new state management needed.
- Preserves performance.

**Cons**:
- Requires fine-tuning of exact scroll percentages.

**Risk Level**: Low

## Decision Matrix
| Criterion | Weight | Approach 1 (Coordinated) |
|-----------|--------|--------------------------|
| Visual Polish | 40% | 5: Addresses all conflicts directly. |
| Performance | 30% | 5: Leverages existing GPU-accel transforms. |
| Maintainability| 30% | 4: Keeps logic in existing files. |
| **Weighted Total** | | **4.7** |

## Success Criteria
- [ ] Scroll dot does not overlap track edges.
- [ ] Discovery modules appear exactly when the 3rd dot is active.
- [ ] Spacecraft is clearly visible at the top of the screen while modules are shown.
- [ ] Active scroll dot indicator is wider than inactive ones.

## Risk Assessment
- **Conflict**: If the spacecraft lifts too high, it may clip the top of the viewport at extreme resolutions. (Traces To: REQ-3)
- **Timing**: Small differences in viewport height might cause slight timing drift in bento-sections. (Traces To: REQ-2)
