# UI and Logic Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Reading Progress bar logic, Lab Container alignment/fullscreen issues, and Superposition simulation labels.

**Architecture:** 
- Use Framer Motion's `useScroll` and `useSpring` for the progress bar.
- Adjust Tailwind classes for layout fixes in `LabContainer`.
- Update Three.js/Drei `Html` component props in `SuperpositionSim`.

**Tech Stack:** Next.js, React, Framer Motion, Three.js, React Three Fiber, Tailwind CSS.

---

### Task 1: Fix Reading Progress Bar

**Files:**
- Modify: `components/ui/reading-progress.tsx`

- [ ] **Step 1: Refactor to use useScroll and useSpring**
  - Update imports to include `useScroll`, `useSpring`, `useMotionValueEvent`.
  - Use `useScroll` with `target` element found by ID.
  - Fix message to "Completed!".
  - Ensure message only shows once.

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useSpring, useScroll, useMotionValueEvent } from "framer-motion";

export function ReadingProgress({ targetId = "article-content", endId = "article-end" }: { targetId?: string, endId?: string }) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentPercent, setCurrentPercent] = useState(0);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    targetRef.current = document.getElementById(targetId);
  }, [targetId]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useMotionValueEvent(smoothProgress, "change", (latest) => {
    const percent = Math.round(latest * 100);
    setCurrentPercent(percent);
    
    if (percent >= 99 && !hasCompleted) {
      setHasCompleted(true);
      setShowCompleted(true);
      setTimeout(() => setShowCompleted(false), 5000);
    }
  });

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[200] h-1 bg-white/5 group">
      <motion.div
        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)] origin-left"
        style={{ scaleX: smoothProgress }}
      />
      
      {/* Percentage Tooltip */}
      <motion.div 
        className="absolute top-full mt-1 px-1.5 py-0.5 bg-black/80 border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
        style={{ 
            left: `${currentPercent}%`,
            x: currentPercent > 90 ? "-100%" : "0%"
        }}
      >
        {currentPercent}%
      </motion.div>
      
      <AnimatePresence>
        {showCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute top-full right-4 mt-4 px-4 py-1.5 bg-green-500/20 border border-green-500/40 text-[10px] font-bold text-green-400 uppercase tracking-widest backdrop-blur-md shadow-[0_0_200px_rgba(34,197,94,0.4)]"
          >
            Completed!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Task 2: Fix Lab Container Alignment and Pseudo-fullscreen

**Files:**
- Modify: `components/simulations/lab-container.tsx`

- [ ] **Step 1: Fix Card padding and z-index**
  - Ensure `Card` has `p-0`.
  - Update `isPseudoFullscreen` z-index to `z-[999]`.
  - Reduce header padding to `p-3` or less.

- [ ] **Step 2: Update Fullscreen icon and logic**
  - Update `toggleFullscreen` to handle `isPseudoFullscreen`.
  - Change icon based on `isFullscreen || isPseudoFullscreen`.
  - Update shared link logic to allow exit.

```tsx
// Inside LabContainer component
  const toggleFullscreen = () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }

    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        setIsPseudoFullscreen(true);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Update Fullscreen button icon
  {isFullscreen || isPseudoFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
```

### Task 3: Fix Superposition Simulation Labels

**Files:**
- Modify: `components/simulations/superposition-sim.tsx`

- [ ] **Step 1: Revert labels and adjust positions**
  - Set `y: 3.5` and `y: -3.5` for `Html` components.
  - Ensure verbose text: "PROBABILITY OF SPIN UP: X%" and "PROBABILITY OF SPIN DOWN: X%".
  - Compact styling (smaller padding/font).

```tsx
      {/* Labels */}
      <Html position={[0, 3.5, 0]} center className="pointer-events-none">
        <div className="text-[9px] uppercase font-mono font-bold text-white tracking-widest px-1.5 py-0.5 bg-black/60 border border-white/10 backdrop-blur-md whitespace-nowrap">
          {isMeasured 
            ? (measuredState === 0 ? "STATE: SPIN UP COLLAPSE" : "PROBABILITY OF SPIN UP: 0%") 
            : `PROBABILITY OF SPIN UP: ${Math.round(probUp * 100)}%`}
        </div>
      </Html>
      <Html position={[0, -3.5, 0]} center className="pointer-events-none">
        <div className="text-[9px] uppercase font-mono font-bold text-white/70 tracking-widest px-1.5 py-0.5 bg-black/40 border border-white/5 backdrop-blur-sm whitespace-nowrap">
          {isMeasured 
            ? (measuredState === 1 ? "STATE: SPIN DOWN COLLAPSE" : "PROBABILITY OF SPIN DOWN: 0%") 
            : `PROBABILITY OF SPIN DOWN: ${Math.round((1 - probUp) * 100)}%`}
        </div>
      </Html>
```

### Task 4: Verify and Build

- [ ] **Step 1: Lint check**
  - Run `npm run lint` or check for unused variables.
- [ ] **Step 2: Production build**
  - Run `npm run build`.
