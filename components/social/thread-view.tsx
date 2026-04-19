"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommentSection } from "@/components/social/comment-section";

interface ThreadViewProps {
  threadId: string;
  title: string;
  authorName?: string | null;
}

export function ThreadView({ threadId, title, authorName }: ThreadViewProps) {
  return (
    <div className="container mx-auto max-w-4xl">
      <Button asChild variant="ghost" className="mb-8 text-white/40 hover:text-white">
        <Link href="/community">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
            // Transmission {threadId}
          </span>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tighter uppercase">
            {title}
          </h1>
          {authorName && (
            <p className="text-white/50 font-mono text-sm uppercase tracking-widest">
              By @{authorName}
            </p>
          )}
        </div>

        <div className="pt-12 border-t border-white/5">
          <h2 className="text-xl font-bold text-white mb-8">Responses</h2>
          <CommentSection threadId={threadId} />
        </div>
      </motion.div>
    </div>
  );
}
