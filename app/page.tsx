"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { NarrativePanel } from "@/components/visuals/narrative-panel";
import { DiscoverySection } from "@/components/visuals/bento-sections";
import QuanimHero from "@/components/visuals/quanim-hero";


/**
 * Stage 1: The Void (Hero)
 * Stage 2: The Spark (Mission/Discovery)
 * Stage 3: The Order (Discovery Bento)
 * Stage 4: The Community (Connection)
 */

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Initialize scroll tracking on 600vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth scroll progress for orchestration
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001
  });

  // Opacity Transforms for the 4 Narrative Stages
  const stage1Opacity = useTransform(smoothProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const stage2Opacity = useTransform(smoothProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
  const stage3Opacity = useTransform(smoothProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
  const stage4Opacity = useTransform(smoothProgress, [0.7, 0.75, 1], [0, 1, 1]);
  
  // Mapping 0-0.95 scroll to 0-100% track position. Clamped to stay inside.
  const dotTop = useTransform(smoothProgress, [0, 0.95], ["0%", "100%"], { clamp: true });

  // End of journey opacity
  const endOpacity = useTransform(smoothProgress, [0.95, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[600vh] bg-black text-white overflow-x-hidden no-scrollbar">
      {/* Background 3D Narrative */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && <QuanimHero />}
      </div>

      {/* Main Narrative Content (Foreground) */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-10">
        
        {/* Stage 1: The Void (Hero) */}
        <motion.div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center"
          style={{ opacity: stage1Opacity }}
        >
          <div className="max-w-4xl space-y-6">
            <h1 className="text-8xl md:text-[12rem] font-serif font-bold tracking-tighter uppercase leading-[0.8]">
              QUANIM
            </h1>
            <p className="text-xl md:text-3xl text-white/60 font-medium tracking-tight">
              Interpreting the Universe through Interactive Visual Physics.
            </p>
          </div>
        </motion.div>

        {/* Stage 2: The Spark (Mission/Discovery) */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-start justify-center p-12 md:p-32"
          style={{ opacity: stage2Opacity }}
        >
          <div className="max-w-2xl">
            {mounted && (
              <NarrativePanel 
                header="Mission Protocol: v2.0"
                text="DECODING THE UNSEEN. Solving abstraction through intuition. Our mission is to translate the complex language of physics into visual experiences that empower everyone to grasp the fundamentals of the universe. We bridge the gap between mathematics and reality."
              />
            )}
          </div>
        </motion.div>

        {/* Stage 3: The Order (Discovery Bento) */}
        <motion.div className="absolute inset-0 z-30 flex items-center justify-center" style={{ opacity: stage3Opacity }}>
          {mounted && <DiscoverySection scrollProgress={smoothProgress} />}
        </motion.div>

        {/* Stage 4: The Community (Connection) */}
        <motion.div 
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-8 bg-purple-900/5"
          style={{ opacity: stage4Opacity }}
        >
          <div className="max-w-2xl space-y-8 text-center">
            <span className="font-mono text-purple-400 text-sm tracking-[0.4em] uppercase font-bold">Phase 04</span>
            <h2 className="text-6xl font-serif font-bold tracking-tighter uppercase">The Community</h2>
            <div className="h-px w-24 bg-purple-500/50 mx-auto" />
            <p className="text-2xl text-white/80 leading-relaxed font-medium">
              Join the discussion and explore the frontiers of knowledge with fellow enthusiasts.
            </p>
          </div>
        </motion.div>

        {/* Progress Tracker (Visual indicator of depth) */}
        <div className="fixed right-12 top-1/2 -translate-y-1/2 space-y-4 z-50 hidden md:block pointer-events-none">
          {[1, 2, 3, 4].map((stage) => (
            <div key={stage} className="flex items-center justify-end gap-4 group">
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Stage 0{stage}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
            </div>
          ))}
          {/* Moving indicator */}
          <motion.div 
            className="absolute right-0 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ 
              top: dotTop,
              y: "-50%" 
            }}
          />
        </div>
      </div>

      {/* Global Bottom UI (Visible when near bottom) */}
      <motion.div 
        className="fixed bottom-12 left-0 right-0 z-50 flex justify-center"
        style={{ opacity: endOpacity }}
      >
        <p className="text-xs font-mono uppercase tracking-[0.5em] text-white/40">End of Journey</p>
      </motion.div>
    </div>
  );
}
