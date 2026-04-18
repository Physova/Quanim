# 600vh Sticky Scroll Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a robust 600vh scroll container in `app/page.tsx` with 4 narrative stage placeholders and smooth scroll orchestration.

**Architecture:** Use Framer Motion's `useScroll` on a 600vh container with a `sticky` 100vh inner viewport. Orchestrate stage visibility using `useSpring` progress.

**Tech Stack:** Next.js (App Router), Framer Motion, Tailwind CSS.

---

### Task 1: Refactor app/page.tsx Structure

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Clean up imports and remove old sections**
Remove `DiscoverySection`, `SynthesisSection`, and unused animation transforms.

- [ ] **Step 2: Update Page Structure**
Ensure the outer container is `h-[600vh]` and the inner container is `sticky top-0 h-screen overflow-hidden`.

- [ ] **Step 3: Add Narrative Stage Placeholders**
Create 4 `motion.div` layers for Stages 1-4. Each should be `absolute inset-0` and have a unique label for visibility during development.

```tsx
{/* Stage 1: The Void (Hero) */}
<motion.div 
  className="absolute inset-0 flex items-center justify-center bg-black/10"
  style={{ opacity: stage1Opacity }}
>
  <h2 className="text-white text-4xl font-serif">Stage 1: The Void</h2>
</motion.div>

{/* Stage 2: The Spark (Mission) */}
<motion.div 
  className="absolute inset-0 flex items-center justify-center bg-blue-900/10"
  style={{ opacity: stage2Opacity }}
>
  <h2 className="text-white text-4xl font-serif">Stage 2: The Spark</h2>
</motion.div>

{/* ... and so on for Stage 3 & 4 */}
```

- [ ] **Step 4: Configure Scroll Progress and Transforms**
Set up `useScroll` and `useSpring`. Define opacity transforms for each stage:
- Stage 1: `[0, 0.2, 0.25] -> [1, 1, 0]`
- Stage 2: `[0.2, 0.25, 0.45, 0.5] -> [0, 1, 1, 0]`
- Stage 3: `[0.45, 0.5, 0.7, 0.75] -> [0, 1, 1, 0]`
- Stage 4: `[0.7, 0.75, 1] -> [0, 1, 1]`

- [ ] **Step 5: Validation**
Run `npx tsc --noEmit && npm run lint` to ensure no regressions or type errors.
