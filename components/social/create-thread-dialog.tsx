"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Shield, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateThreadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newThread: {
    id: string;
    title: string;
    content?: string;
    author: { name: string | null };
    createdAt: Date;
    _count: { comments: number };
  }) => void;
}

export function CreateThreadDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateThreadDialogProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const titleLimit = 100;
  const contentLimit = 2000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/community/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You must be signed in to create a thread");
        }
        throw new Error("Failed to create thread");
      }

      const rawThread = await response.json();
      
      const newThread = {
        ...rawThread,
        _count: { comments: 0 },
        author: { name: "Just now" }
      };
      
      setTitle("");
      setContent("");
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess(newThread);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-black border border-white/20 rounded-none p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
        {/* Scanning Line Effect */}
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden opacity-10">
          <motion.div 
            animate={{ y: ["0%", "100%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-full h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
          />
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center px-4 py-1.5 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-none bg-blue-500 animate-pulse" />
              <span className="text-[8px] font-mono text-blue-500/80 uppercase tracking-widest">Link Stable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-2 h-2 text-white/30" />
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">AES-256</span>
            </div>
          </div>
          <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">
            Frequency: 442.5 THz
          </div>
        </div>

        <DialogHeader className="p-8 border-b border-white/10 relative">
          <div className="flex flex-col gap-2">
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.3em] flex items-center gap-2"
            >
              <Zap className="h-3 w-3" />
              {"// Uplink Protocol Initiated"}
            </motion.span>
            <DialogTitle className="text-3xl font-serif font-bold text-white tracking-tighter uppercase flex items-center gap-3">
              New Transmission
            </DialogTitle>
          </div>
          
          <div className="absolute top-8 right-8 flex items-center gap-1 opacity-20">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-4 bg-white" />
            ))}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-10 relative">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-red-500 animate-ping" />
                Critical Error: {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4 group">
            <div className="flex justify-between items-end border-l-2 border-white/20 pl-4 py-1">
              <label className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-[0.2em]">
                Subject / Central Inquiry
              </label>
              <span className={`text-[10px] font-mono tabular-nums ${title.length > titleLimit * 0.8 ? 'text-amber-500' : 'text-white/20'}`}>
                [{title.length.toString().padStart(3, '0')}/{titleLimit}]
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="DEFINE CORE THESIS..."
              className="bg-white/[0.02] border-white/10 rounded-none h-14 focus:border-white focus:bg-white/[0.05] focus:ring-0 text-lg text-white placeholder:text-white/10 font-mono transition-all duration-500"
              maxLength={titleLimit}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end border-l-2 border-white/20 pl-4 py-1">
              <label className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-[0.2em]">
                Context / Technical Framework
              </label>
              <span className={`text-[10px] font-mono tabular-nums ${content.length > contentLimit * 0.9 ? 'text-amber-500' : 'text-white/20'}`}>
                [{content.length.toString().padStart(4, '0')}/{contentLimit}]
              </span>
            </div>
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="SYNTHESIZE OBSERVATIONS AND EMPIRICAL DATA..."
                className="min-h-[250px] bg-white/[0.02] border-white/10 rounded-none focus:border-white focus:bg-white/[0.05] focus:ring-0 text-white/90 placeholder:text-white/10 resize-none leading-relaxed font-mono text-sm p-6 transition-all duration-500"
                maxLength={contentLimit}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none border-r border-b border-white/20" />
              <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none border-l border-t border-white/20" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-white/20 uppercase">Signature</span>
                <span className="text-[10px] font-mono text-white/60">AUTHORIZED_USER_SESSION</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-mono text-white/20 uppercase">Encryption</span>
                <span className="text-[10px] font-mono text-white/60">QUANTUM_SECURE</span>
              </div>
            </div>

            <div className="flex gap-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-white/30 hover:text-white hover:bg-white/5 rounded-none px-6"
                disabled={isSubmitting}
              >
                Abort
              </Button>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="bg-white text-black font-extrabold rounded-none hover:bg-black hover:text-white border-2 border-white transition-all duration-500 text-[10px] uppercase tracking-[0.3em] px-10 h-14 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Wifi className="h-4 w-4 group-hover:animate-pulse" />
                        Initialize Broadcast
                      </>
                    )}
                  </span>
                  
                  {/* Hover Background Animation */}
                  <motion.div 
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="absolute inset-0 bg-white group-hover:bg-black"
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </form>

        <div className="px-8 py-4 bg-white/5 flex justify-between items-center border-t border-white/10">
          <div className="flex gap-2">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-1 rounded-none ${i < 3 ? 'bg-white/40' : 'bg-white/10'}`} 
              />
            ))}
          </div>
          <p className="text-[9px] font-mono text-white/40 uppercase tracking-[0.3em]">
            System Status: 100% Operational // Ready for Dispatch
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
