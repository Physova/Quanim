# Update Reading Progress Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate and redesign the reading progress bar for better UX, including hover feedback.

**Architecture:** Update the `ReadingProgress` client component to sit below the navbar, increase its height, and add a hover state that displays the current progress percentage.

**Tech Stack:** React, Next.js, Tailwind CSS.

---

### Task 1: Update Placement and Design

**Files:**
- Modify: `components/ui/reading-progress.tsx`

- [ ] **Step 1: Relocate and Thicken**

Update the outer `div` to `top-[72px]` and height to `h-1`.

```tsx
// components/ui/reading-progress.tsx
// Change:
// <div className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-white/10">
// To:
<div className="fixed top-[72px] left-0 right-0 z-[200] h-1 bg-white/5 backdrop-blur-sm group">
```

- [ ] **Step 2: Add Hover Percentage Text**

Add a text element inside the bar that appears on hover.

```tsx
// components/ui/reading-progress.tsx
// Add inside the outer div:
<div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 bg-black/80 border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
  {Math.round(progress)}%
</div>
```

- [ ] **Step 3: Verification**

Since automated tests are not yet set up for this project, I'll verify visually by running the dev server and checking the component's position and hover behavior.

Run: `npm run dev`
Expected: Reading progress bar appears below the navbar (`h-[72px]`), is 4px thick (`h-1`), and shows "X%" on hover.

- [ ] **Step 4: Commit**

```bash
git add components/ui/reading-progress.tsx
git commit -m "feat: update reading progress bar placement, design and hover feedback"
```
