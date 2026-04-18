"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface NarrativePanelProps {
  text: string;
  className?: string;
  header?: string;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export const NarrativePanel = ({ text, className, header }: NarrativePanelProps) => {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    if (!isInView) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "\n") return char;
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <div ref={ref} className={`font-mono space-y-4 ${className}`}>
      {header && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-blue-500 font-bold tracking-[0.3em] text-xs uppercase"
        >
          // {header}
        </motion.div>
      )}
      
      <div className="relative">
        <div className="text-white/90 leading-relaxed text-lg md:text-xl min-h-[6em]">
          {displayText}
        </div>
        
        {/* Decorative corner borders for "Tech-Lab" look */}
        <div className="absolute -top-4 -left-4 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute -bottom-4 -right-4 w-4 h-4 border-b border-r border-white/20" />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 1 }}
        className="flex gap-2 items-center text-[10px] text-white/30 uppercase tracking-[0.2em]"
      >
        <div className="w-12 h-px bg-white/20" />
        <span>System Status: Narrative Active</span>
        <motion.div 
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-1.5 h-1.5 rounded-full bg-blue-500"
        />
      </motion.div>
    </div>
  );
};
