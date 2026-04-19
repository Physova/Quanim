"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { NarrativePanel } from "@/components/visuals/narrative-panel";
import { DiscoverySection } from "@/components/visuals/bento-sections";
import Link from "next/link";

// Dynamic import — no SSR, eliminates Three.js from server bundle
const QuanimHero = dynamic(() => import("@/components/visuals/quanim-hero"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black" />,
});

/**
 * Stage 1: The Void (Hero)
 * Stage 2: The Spark (Mission/Discovery)
 * Stage 3: The Order (Discovery Bento)
 * Stage 4: The Community (Connection)
 */
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeStage, setActiveStage] = useState(1);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Initialize scroll tracking on 950vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001
  });

  // Stage opacities — aligned to 3D engine scene ranges
  const stage1Opacity = useTransform(smoothProgress, [0, 0.15, 0.20], [1, 1, 0]);
  const stage2Opacity = useTransform(smoothProgress, [0.25, 0.30, 0.48, 0.53], [0, 1, 1, 0]);
  const stage3Opacity = useTransform(smoothProgress, [0.55, 0.58, 0.70, 0.74], [0, 1, 1, 0]);
  const stage4Opacity = useTransform(smoothProgress, [0.82, 0.87, 0.91, 0.95], [0, 1, 1, 0]);

  // Progress dot — mapped to full scroll range 
  const dotTop = useTransform(smoothProgress, [0, 1], ["0%", "100%"], { clamp: true });

  // Track which stage is active for pointer-events and navbar visibility
  useMotionValueEvent(smoothProgress, "change", (v) => {
    if (v < 0.20) { setActiveStage(1); setNavVisible(false); }
    else if (v < 0.53) { setActiveStage(2); setNavVisible(true); }
    else if (v < 0.74) { setActiveStage(3); setNavVisible(true); }
    else { setActiveStage(4); setNavVisible(true); }
  });

  return (
    <div ref={containerRef} className="relative h-[950vh] bg-black text-white overflow-x-hidden no-scrollbar">
      {/* Floating Navbar — appears after Stage 1 */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[72px] backdrop-blur-xl bg-black/60 border-b border-white/5 transition-all"
        initial={{ y: -80 }}
        animate={{ y: navVisible ? 0 : -80 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base font-bold tracking-[0.2em] uppercase text-foreground group-hover:opacity-80 transition-opacity">
            Quanim
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Nexus</Link>
          <Link href="/topics" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Repository</Link>
          <Link href="/community" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">Network</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="hidden sm:flex text-[10px] font-bold text-white/50 hover:text-white transition-all uppercase tracking-[0.2em]">
            Access
          </Link>
          <Link href="/auth/signup" className="px-6 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-colors">
            JOIN_VOID
          </Link>
        </div>
      </motion.header>

      {/* Background 3D Narrative */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && <QuanimHero />}
      </div>

      {/* Main Narrative Content (Foreground) */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-10" style={{ pointerEvents: 'none' }}>
        
        {/* Stage 1: The Void (Hero) */}
        <motion.div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 md:p-8 text-center"
          style={{ opacity: stage1Opacity, pointerEvents: activeStage === 1 ? 'auto' : 'none' }}
        >
          <div className="max-w-4xl space-y-4 md:space-y-6">
            <h1 className="text-5xl sm:text-7xl md:text-[12rem] font-serif font-bold tracking-tighter uppercase leading-[0.8]">
              QUANIM
            </h1>
            <p className="text-base sm:text-xl md:text-3xl text-white/60 font-medium tracking-tight px-4">
              Interpreting the Universe through Interactive Visual Physics.
            </p>
          </div>
        </motion.div>

        {/* Stage 2: The Spark (Mission/Discovery) */}
        <motion.div 
          className="absolute inset-0 z-20 flex flex-col items-start justify-center p-6 md:p-12 lg:p-32"
          style={{ opacity: stage2Opacity, pointerEvents: activeStage === 2 ? 'auto' : 'none' }}
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
        <motion.div className="absolute inset-0 z-30 flex items-center justify-center" style={{ opacity: stage3Opacity, pointerEvents: activeStage === 3 ? 'auto' : 'none' }}>
          {mounted && <DiscoverySection scrollProgress={smoothProgress} />}
        </motion.div>

        {/* Stage 4: The Community (Connection) */}
        <motion.div 
          className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 md:p-8 bg-purple-900/5"
          style={{ opacity: stage4Opacity, pointerEvents: activeStage === 4 ? 'auto' : 'none' }}
        >
          <div className="max-w-2xl space-y-6 md:space-y-8 text-center">
            <span className="font-mono text-purple-400 text-xs md:text-sm tracking-[0.4em] uppercase font-bold">Phase 04</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold tracking-tighter uppercase">The Community</h2>
            <div className="h-px w-24 bg-purple-500/50 mx-auto" />
            <p className="text-lg md:text-2xl text-white/80 leading-relaxed font-medium px-4">
              Join the discussion and explore the frontiers of knowledge with fellow enthusiasts.
            </p>
          </div>
        </motion.div>

        {/* Progress Tracker — dots at correct scene positions */}
        <div className="fixed right-4 md:right-12 top-[12%] bottom-[8%] z-50 hidden md:block pointer-events-none">
          <div className="absolute right-[2.5px] top-0 bottom-0 w-px bg-white/10" />
          {[
            { stage: 1, pos: '10%' },
            { stage: 2, pos: '40%' },
            { stage: 3, pos: '67%' },
            { stage: 4, pos: '92%' },
          ].map(({ stage, pos }) => (
            <div key={stage} className="absolute right-0 flex items-center justify-end gap-4"
                 style={{ top: pos, transform: 'translateY(-50%)' }}>
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                Stage 0{stage}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          ))}
          <motion.div 
            className="absolute right-0 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ top: dotTop, y: "-50%" }}
          />
        </div>
      </div>
    </div>
  );
}
