"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface CreateThreadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string }) => void;
}

export function CreateThreadSheet({
  isOpen,
  onClose,
  onSubmit,
}: CreateThreadSheetProps) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, content });
    setTitle("");
    setContent("");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-black border-l border-white/10 sm:max-w-md w-full p-8 flex flex-col">
        <SheetHeader className="mb-10 text-left">
          <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em] mb-4 block">
            {"// System Initialization"}
          </span>
          <SheetTitle className="text-3xl font-serif font-bold text-white tracking-tighter uppercase leading-none">
            New Transmission
          </SheetTitle>
          <SheetDescription className="text-white/40 text-xs font-mono uppercase tracking-widest mt-4">
            Broadcast your ideas to the global network.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum Gravity Paradox"
              className="bg-white/[0.03] border-white/10 rounded-none focus:border-white/40 text-white placeholder:text-white/10"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest">
              Context
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide the conceptual foundation for this discussion..."
              className="bg-white/[0.03] border-white/10 rounded-none focus:border-white/40 text-white min-h-[150px] placeholder:text-white/10"
            />
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              className="w-full h-12 bg-white text-black font-extrabold rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border hover:border-white text-[10px] uppercase tracking-[0.3em]"
            >
              Initialize Broadcast
            </Button>
          </div>
        </form>

        <SheetFooter className="mt-auto pt-8 border-t border-white/5">
          <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
            Note: Ephemeral session. Data will be cleared upon synchronization.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
