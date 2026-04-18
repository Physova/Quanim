"use client";

import React from "react";
import { motion, useTransform, MotionValue } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Beaker, MessageSquare, BookOpen, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BentoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  className?: string;
  metrics?: string;
}

function BentoCard({ title, description, icon, href, className, metrics }: BentoCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [locId, setLocId] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
    setLocId(Math.floor(Math.random() * 1000).toString(16).toUpperCase());
  }, []);

  return (
    <Link href={href} className="block group">
      <Card className={`h-full p-6 bg-black border border-white/10 group-hover:border-white/40 transition-all duration-300 flex flex-col gap-6 relative overflow-hidden rounded-none ${className}`}>
        {/* Tech grid background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 text-white/80 group-hover:text-white transition-colors">
            {icon}
          </div>
          {metrics && (
            <span className="font-mono text-[10px] text-white/40 uppercase tracking-tighter">
              {metrics}
            </span>
          )}
        </div>
        
        <div className="space-y-3 relative z-10">
          <h3 className="text-xl font-mono font-bold tracking-tighter text-white uppercase">{title}</h3>
          <p className="text-white/50 leading-relaxed text-[11px] font-mono uppercase tracking-tight line-clamp-3">
            {description}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">
            Initiate Protocol <ArrowRight className="w-3 h-3" />
          </div>
          <div className="text-[10px] font-mono text-white/20">
            LOC_0x{mounted ? locId : "000"}
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function DiscoverySection({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // Shutter effect timing: 0.45 to 0.65
  const shutterLeft = useTransform(scrollProgress, [0.45, 0.55, 0.65], ["0%", "-100%", "-100%"]);
  const shutterRight = useTransform(scrollProgress, [0.45, 0.55, 0.65], ["0%", "100%", "100%"]);
  const contentOpacity = useTransform(scrollProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  const contentScale = useTransform(scrollProgress, [0.5, 0.6], [0.95, 1]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Shutter Curtains */}
      <motion.div 
        style={{ x: shutterLeft }}
        className="absolute left-0 top-0 bottom-0 w-1/2 bg-black z-50 border-r border-white/10"
      />
      <motion.div 
        style={{ x: shutterRight }}
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-black z-50 border-l border-white/10"
      />

      {/* Content */}
      <motion.div 
        style={{ opacity: contentOpacity, scale: contentScale }}
        className="relative z-40 w-full max-w-6xl px-8 pointer-events-auto"
      >
        <div className="mb-12 space-y-2">
          <span className="font-mono text-white/40 text-[10px] tracking-[0.4em] uppercase font-bold">Protocol 01</span>
          <h2 className="text-5xl lg:text-7xl font-mono font-bold tracking-tighter text-white uppercase">The Discovery</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BentoCard 
            title="Double Slit Lab"
            description="Visualizing wave-particle duality. Observe the interference pattern emerge from individual electron strikes. Real-time probability density mapping."
            icon={<Beaker className="w-5 h-5" />}
            href="/topics/double-slit"
            metrics="98% FIDELITY"
          />
          <BentoCard 
            title="Quantum Entanglement"
            description="Non-local state correlation analyzer. Testing Bell's Inequality through synchronized photon pair emissions. Spatial separation: 12.4km."
            icon={<BookOpen className="w-5 h-5" />}
            href="/topics/entanglement"
            metrics="LATENCY: 2ms"
          />
          <BentoCard 
            title="Community Hub"
            description="Peer-to-peer knowledge transfer. Collaborative problem solving and research synthesis. Decentralized discussion nodes."
            icon={<MessageSquare className="w-5 h-5" />}
            href="/community"
            metrics="4.2k NODES"
          />
        </div>
      </motion.div>
    </div>
  );
}

export function SynthesisSection({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  // Warp effect timing: 0.75 to 0.95
  const warpBlur = useTransform(scrollProgress, [0.7, 0.8, 0.9], ["blur(20px)", "blur(0px)", "blur(20px)"]);
  const warpScale = useTransform(scrollProgress, [0.7, 0.8, 0.9], [0.8, 1, 1.2]);
  const warpOpacity = useTransform(scrollProgress, [0.7, 0.8, 0.95], [0, 1, 0]);
  
  const warpBrightness = useTransform(scrollProgress, [0.7, 0.8, 0.9], [0.5, 1, 0.5]);
  const warpContrast = useTransform(scrollProgress, [0.7, 0.8, 0.9], [1.5, 1, 1.5]);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        style={{
          opacity: warpOpacity,
          scale: warpScale,
          filter: useTransform(
            [warpBlur, warpBrightness, warpContrast] as any,
            ([b, br, c]: any[]) => `${b} brightness(${br}) contrast(${c})`
          ),
          willChange: "transform, filter"
        }}
        className="relative z-40 w-full max-w-6xl px-8 pointer-events-auto"
      >        <div className="mb-12 space-y-2 text-right">
          <span className="font-mono text-white/40 text-[10px] tracking-[0.4em] uppercase font-bold">Phase 02</span>
          <h2 className="text-5xl lg:text-7xl font-serif font-bold tracking-tighter text-white uppercase">The Synthesis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BentoCard 
            title="Premium Courses"
            description="For those who want to go deeper, our curated paid courses offer structured paths to mastery with guided lessons and expert content."
            icon={<BookOpen className="w-5 h-5" />}
            href="/topics"
          />
          <BentoCard 
            title="Researcher Profiles"
            description="Track your progress, showcase your discoveries, and connect with other curious minds in the Quanim network."
            icon={<User className="w-5 h-5" />}
            href="/community"
          />
        </div>
      </motion.div>
    </div>
  );
}
