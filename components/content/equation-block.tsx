"use client";

import React from "react";
import katex from "katex";
import { getSimForEquation } from "@/lib/equation-sim-map";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSimulationStore } from "@/lib/stores/simulation-store";

interface EquationBlockProps {
  equation: string;
  description?: string;
  className?: string;
}

export function EquationBlock({ equation, description, className }: EquationBlockProps) {
  const simConfig = getSimForEquation(equation);

  const handleSimulate = () => {
    if (!simConfig) return;
    
    // Apply parameters if they exist
    if (simConfig.initialParams) {
      useSimulationStore.setState({ ...simConfig.initialParams, isPlaying: true });
    } else {
      useSimulationStore.setState({ isPlaying: true });
    }

    const element = document.getElementById(`lab-${simConfig.type}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Add a brief highlight effect
      element.classList.add("ring-2", "ring-white", "ring-offset-4", "ring-offset-black");
      setTimeout(() => {
        element.classList.remove("ring-2", "ring-white", "ring-offset-4", "ring-offset-black");
      }, 2000);
    }
  };

  return (
    <div 
      onClick={simConfig ? handleSimulate : undefined}
      className={`equation-box my-8 p-8 bg-white/[0.02] border border-white/10 rounded-none text-center relative group overflow-hidden transition-all duration-300 ${simConfig ? 'cursor-pointer hover:border-white/30 active:scale-[0.99]' : ''} ${className}`}
    >
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Sim Indicator */}
      {simConfig && (
        <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/40 transition-colors duration-300">
          <Zap className="h-4 w-4 animate-pulse" />
        </div>
      )}

      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="equation text-2xl md:text-4xl text-white tracking-wide mb-4 transition-transform duration-300 group-hover:scale-[1.02]"
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(equation, { throwOnError: false, displayMode: true })
          }}
        />
        
        {description && (
          <p className="description text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6 max-w-md mx-auto group-hover:text-white/50 transition-colors">
            {description}
          </p>
        )}

        {simConfig && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSimulate();
            }}
            variant="ghost"
            size="sm"
            className="rounded-none border border-white/20 bg-black text-white hover:!bg-white hover:!text-black transition-all gap-2 text-[10px] font-bold tracking-widest uppercase py-5 group/btn"
          >
            <Zap className="h-3 w-3 group-hover/btn:text-black" />
            Simulate This Equation
          </Button>
        )}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-white/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-white/50 transition-colors" />
    </div>
  );
}
