"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

export function ReadingProgress({ targetId = "article-content", endId = "article-end" }: { targetId?: string, endId?: string }) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [percent, setPercent] = useState(0);
  
  const motionPercent = useMotionValue(0);

  const calculateProgress = useCallback(() => {
    const target = document.getElementById(targetId);
    const end = document.getElementById(endId);
    
    if (!target || !end) return;

    // Get absolute positions from document top
    const rect = target.getBoundingClientRect();
    const endRect = end.getBoundingClientRect();
    
    const startPos = rect.top + window.scrollY - 72; // Start of content
    const endPos = endRect.top + window.scrollY; // End of content
    const totalHeight = endPos - startPos;
    const currentScroll = window.scrollY;
    
    // Calculate how much of the content is scrolled past the viewport start
    const scrollOffset = currentScroll - startPos;
    const scrollableRange = totalHeight - window.innerHeight + 200; // Buffer for "finishing"
    
    const rawPercent = (scrollOffset / scrollableRange) * 100;
    const clamped = Math.min(100, Math.max(0, rawPercent));
    
    setPercent(clamped);
    motionPercent.set(clamped / 100);

    if (clamped >= 99 && !hasCompleted) {
      setHasCompleted(true);
      setShowCompleted(true);
      setTimeout(() => setShowCompleted(false), 5000);
    }
  }, [targetId, endId, hasCompleted, motionPercent]);

  useEffect(() => {
    window.addEventListener("scroll", calculateProgress, { passive: true });
    window.addEventListener("resize", calculateProgress);
    // Poll for layout shifts/late renders
    const timer = setInterval(calculateProgress, 1000);
    calculateProgress();

    return () => {
      window.removeEventListener("scroll", calculateProgress);
      window.removeEventListener("resize", calculateProgress);
      clearInterval(timer);
    };
  }, [calculateProgress]);

  const scaleX = useSpring(motionPercent, { stiffness: 100, damping: 30 });

  return (
    <div className="fixed top-[72px] left-0 right-0 z-[200] h-1 bg-white/5 group">
      <motion.div
        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,1)] origin-left w-full"
        style={{ scaleX }}
      />
      
      {/* Percentage Tooltip */}
      <motion.div 
        className="absolute top-full mt-1 px-1.5 py-0.5 bg-black border border-white/10 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap"
        style={{ 
            left: `${percent}%`,
            x: percent > 90 ? "-100%" : "0%"
        }}
      >
        {Math.round(percent)}%
      </motion.div>
      
      <AnimatePresence>
        {showCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute top-full right-4 mt-4 px-4 py-1.5 bg-green-500/20 border border-green-500/40 text-[10px] font-bold text-green-400 uppercase tracking-widest backdrop-blur-md shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          >
            Completed!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
