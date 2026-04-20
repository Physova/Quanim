"use client";

import React, { useState } from "react";
import { Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function TopicActions() {
  const [copied, setCopied] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInfo = () => {
    setInfoOpen(true);
    setTimeout(() => setInfoOpen(false), 4000);
  };

  return (
    <div className="flex items-center gap-3 relative">
       <div className="relative group">
         <Button 
           variant="outline" 
           size="icon" 
           onClick={handleShare}
           className="rounded-none bg-black border border-white/20 hover:border-white hover:text-black hover:bg-white transition-all duration-300"
         >
            <Share2 className="h-4 w-4" />
         </Button>
         
         {/* Share Toast */}
         <AnimatePresence>
            {copied && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 whitespace-nowrap bg-white border border-white px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-black pointer-events-none z-50 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                Link Copied
              </motion.div>
            )}
         </AnimatePresence>
       </div>
       
       <div className="relative group">
         <Button 
           variant="outline" 
           size="icon" 
           onClick={handleInfo}
           className="rounded-none bg-black border border-white/20 hover:border-white hover:text-black hover:bg-white transition-all duration-300"
         >
            <Info className="h-4 w-4" />
         </Button>

         {/* Info Toast */}
         <AnimatePresence>
            {infoOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-full right-0 mt-3 w-48 bg-black border border-white/40 p-3 text-[10px] font-mono uppercase tracking-widest text-white/80 pointer-events-none z-50 shadow-2xl leading-relaxed text-right backdrop-blur-md"
              >
                Topic simulation developed for Quanim visualization engine.
              </motion.div>
            )}
         </AnimatePresence>
       </div>
    </div>
  );
}
