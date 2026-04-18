"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface ShutterTransitionProps {
  scrollYProgress: MotionValue<number>;
  start?: number;
  end?: number;
}

/**
 * ShutterTransition Component
 * 
 * Creates a "Camera Shutter" reveal effect with two vertical curtains
 * that open from the center outward based on scroll progress.
 */
export function ShutterTransition({ 
  scrollYProgress, 
  start = 0.45, 
  end = 0.75 
}: ShutterTransitionProps) {
  // Opening the curtains: X moves from 0% to -100% (left) and 100% (right)
  // We want them fully closed at 'start' and fully open at some point after 'start'
  // Let's say they open fully by 'start + 0.1' and close back at 'end - 0.1'?
  // Or just open from start to end?
  // The prompt says "triggers as the user enters the Discovery section (scroll 0.45 - 0.75)"
  
  // Transition phases:
  // 0.45 -> 0.50: Curtains Open
  // 0.50 -> 0.70: Stay Open
  // 0.70 -> 0.75: Curtains Close
  
  const leftX = useTransform(
    scrollYProgress, 
    [start, start + 0.05, end - 0.05, end], 
    ["0%", "-100%", "-100%", "0%"]
  );
  
  const rightX = useTransform(
    scrollYProgress, 
    [start, start + 0.05, end - 0.05, end], 
    ["0%", "100%", "100%", "0%"]
  );

  // Center aperture detail
  const apertureScale = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [1, 1.5, 1.5, 1]
  );
  
  const apertureOpacity = useTransform(
    scrollYProgress,
    [start, start + 0.02, start + 0.05, end - 0.05, end - 0.02, end],
    [0, 1, 0, 0, 1, 0]
  );

  // Only show if within range
  const containerOpacity = useTransform(
    scrollYProgress,
    [start - 0.01, start, end, end + 0.01],
    [0, 1, 1, 0]
  );

  return (
    <motion.div 
      style={{ opacity: containerOpacity }}
      className="absolute inset-0 z-[35] pointer-events-none overflow-hidden"
    >
      {/* Left Curtain */}
      <motion.div
        style={{ x: leftX }}
        className="absolute top-0 left-0 w-1/2 h-full bg-black border-r border-amber-500/20 shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
      />
      
      {/* Right Curtain */}
      <motion.div
        style={{ x: rightX }}
        className="absolute top-0 right-0 w-1/2 h-full bg-black border-l border-amber-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.8)]"
      />

      {/* Center Shutter Aperture (Visual Flavor) */}
      <motion.div
        style={{ 
          scale: apertureScale, 
          opacity: apertureOpacity,
          x: "-50%",
          y: "-50%"
        }}
        className="absolute top-1/2 left-1/2 w-64 h-64 flex items-center justify-center"
      >
        <div className="w-full h-full rounded-full border border-amber-500/30 flex items-center justify-center p-4">
          <div className="w-full h-full rounded-full border-2 border-amber-500/50 flex items-center justify-center p-4">
            <div className="w-full h-full rounded-full border border-amber-500/20" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
