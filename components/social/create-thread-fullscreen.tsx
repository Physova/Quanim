"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateThreadFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}

export function CreateThreadFullscreen({
  isOpen,
  onClose,
  onSubmit,
}: CreateThreadFullscreenProps) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const titleLimit = 100;
  const contentLimit = 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length > titleLimit || content.length > contentLimit) return;
    onSubmit({ title, content });
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col"
        >
          <div className="qh-grain" />
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/50 backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-none hover:bg-white/10 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
                  {"// Broadcast Protocol"}
                </span>
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                  New Transmission
                </h2>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || title.length > titleLimit || content.length > contentLimit}
              className="h-10 px-6 bg-white text-black font-extrabold rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border hover:border-white text-[10px] uppercase tracking-[0.3em] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Initialize Broadcast
            </Button>
          </div>

          {/* Form Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
            <div className="max-w-4xl mx-auto w-full p-8 md:p-12 space-y-12">
              {/* Title Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                    Thread Title
                  </label>
                  <span className={`text-[10px] font-mono ${title.length > titleLimit ? 'text-red-500' : 'text-white/70'}`}>
                    {title.length}/{titleLimit}
                  </span>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Define the central thesis..."
                  className="text-3xl md:text-5xl font-serif font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white placeholder:text-white/5 tracking-tighter"
                  autoFocus
                />
              </div>

              {/* Content Input */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                    Contextual Foundation
                  </label>
                  <span className={`text-[10px] font-mono ${content.length > contentLimit ? 'text-red-500' : 'text-white/70'}`}>
                    {content.length}/{contentLimit}
                  </span>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Synthesize your arguments here. Mathematical LaTeX notation supported (mock)..."
                  className="min-h-[200px] text-lg leading-relaxed bg-transparent border-none p-0 focus-visible:ring-0 text-white/70 placeholder:text-white/5 resize-none"
                />
              </div>

              {/* Large Initialize Button at bottom */}
              <div className="pt-12 pb-24">
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || title.length > titleLimit || content.length > contentLimit}
                  className="w-full h-20 bg-white text-black font-extrabold rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border hover:border-white text-xs uppercase tracking-[0.5em] disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Initialize Broadcast
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="p-6 border-t border-white/5 bg-black/50 text-center relative z-10">
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              Security: AES-256 Encrypted Tunnel // Status: Ephemeral Session
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
