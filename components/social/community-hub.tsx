"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/components/social/comment-section";
import { motion } from "framer-motion";
import { CreateThreadFullscreen } from "./create-thread-fullscreen";

interface Thread {
  id: string;
  title: string;
  content?: string;
  author: { name: string | null };
  createdAt: Date;
  _count: { comments: number };
}

interface CommunityHubProps {
  initialThreads: Thread[];
}

export function CommunityHub({ initialThreads }: CommunityHubProps) {
  const [threads, setThreads] = React.useState<Thread[]>(initialThreads);
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);

  const handleCreateThread = (data: { title: string; content: string }) => {
    const newThread: Thread = {
      id: `temp-${Date.now()}`,
      title: data.title,
      content: data.content,
      author: { name: "Guest" },
      createdAt: new Date(),
      _count: { comments: 0 },
    };
    setThreads([newThread, ...threads]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto py-16 px-4 relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <span className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
            {"// Global Network"}
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tighter uppercase">
            Community Hub
          </h1>
          <p className="text-white/40 text-base max-w-2xl leading-relaxed">
            Synthesize ideas, challenge theories, and connect with minds interpreting the universe.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button 
            onClick={() => setIsFullscreenOpen(true)}
            className="h-12 px-8 bg-white text-black font-extrabold rounded-none transition-all duration-300 hover:bg-black hover:text-white hover:border-2 hover:border-white hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] text-[10px] uppercase tracking-[0.3em] border-2 border-transparent"
          >
            Initialize Discussion
          </Button>
        </motion.div>
      </div>

      <CreateThreadFullscreen 
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        onSubmit={handleCreateThread}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-bold text-white">
              Active Transmissions
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/5">Recent</Button>
              <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60">Trending</Button>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {threads.length === 0 ? (
              <Card className="bg-white/[0.02] border-dashed border-white/10 py-20 text-center rounded-none">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-white/10 mx-auto mb-6" />    
                  <p className="text-white/40 text-lg">The void is silent. Start a new transmission.</p>
                </CardContent>
              </Card>
            ) : (
              threads.map((thread) => (
                <motion.div key={thread.id} variants={itemVariants}>
                  <Link href={`/community/${thread.id}`}>
                    <Card className="bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group rounded-none overflow-hidden relative py-0">
                      <CardHeader className="p-8 pb-3">
                        <div className="flex justify-between items-start gap-4">        
                          <CardTitle className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-white transition-colors duration-300">
                            {thread.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-white/50 border border-white/10 px-3 py-1.5 rounded-none text-[10px] font-mono bg-white/[0.02]">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{thread._count.comments}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 pt-0">
                        <div className="space-y-6">
                          {thread.content && (
                            <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                              {thread.content}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">
                            <span className="text-white/40 font-bold">@{thread.author.name || 'Anonymous'}</span>
                            <span className="opacity-20">/</span>
                            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/[0.02] border border-white/10 rounded-none overflow-hidden relative group">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-white/40 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
                  {/* Network Statistics */}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Active Observers</span>       
                  <span className="font-mono font-bold text-white">1.2k+</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Quantum Pulses</span>
                  <span className="font-mono font-bold text-white">42 Sync</span>       
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Knowledge Blocks</span>       
                  <span className="font-mono font-bold text-white">{threads.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-none bg-white/[0.02] border border-white/10 space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono font-bold text-[10px] text-white/40 uppercase tracking-[0.2em]">
                {/* Global Signal */}
              </h3>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              Broadcast quick queries or observations to the global feed. Formal topics require initialization.
            </p>

            <div className="relative pt-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background rounded-none pointer-events-none z-10 h-32 bottom-0 top-auto" />
              <div className="max-h-[400px] overflow-hidden rounded-none border border-white/5 bg-black/20 p-4">
                <CommentSection threadId="global-discussion" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-white/20 uppercase tracking-widest pt-2">
              Encrypted Connection Established
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
