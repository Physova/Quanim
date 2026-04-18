"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus, TrendingUp, Zap, Globe, Shield } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/components/social/comment-section";
import { motion } from "framer-motion";

interface Thread {
  id: string;
  title: string;
  author: { name: string | null };
  createdAt: Date;
  _count: { comments: number };
}

interface CommunityHubProps {
  initialThreads: Thread[];
}

export function CommunityHub({ initialThreads }: CommunityHubProps) {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest">
            <Globe className="w-3 h-3" />
            Global Network
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex items-center gap-4">
            Community Hub
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Synthesize ideas, challenge theories, and connect with minds interpreting the universe.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-full shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all hover:scale-105 gap-2">
            <Plus className="h-5 w-5 stroke-[3px]" />
            Initialize Discussion
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-cyan-400 h-6 w-6" />
              Active Transmissions
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-500/5">Recent</Button>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Trending</Button>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {initialThreads.length === 0 ? (
              <Card className="bg-white/[0.02] border-dashed border-white/10 py-20 text-center rounded-[2rem]">
                <CardContent>
                  <MessageSquare className="h-16 w-16 text-slate-700 mx-auto mb-6 opacity-50" />
                  <p className="text-slate-400 text-lg font-medium">The void is silent. Start a new transmission.</p>
                </CardContent>
              </Card>
            ) : (
              initialThreads.map((thread) => (
                <motion.div key={thread.id} variants={itemVariants}>
                  <Link href={`/community/${thread.id}`}>
                    <Card className="bg-white/[0.03] backdrop-blur-md hover:bg-white/[0.06] transition-all duration-500 border-white/5 hover:border-violet-500/30 group rounded-[2rem] overflow-hidden relative shadow-xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/[0.03] rounded-full blur-2xl group-hover:bg-violet-500/[0.06] transition-colors" />
                      <CardHeader className="p-8">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-3">
                            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-cyan-400 transition-colors duration-300">
                              {thread.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-3 text-slate-500 font-mono text-xs uppercase tracking-widest">
                              <span className="text-violet-400 font-black">@{thread.author.name || 'Anonymous'}</span>
                              <span className="opacity-30">/</span>
                              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2 text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 px-4 py-2 rounded-full text-xs font-black shadow-inner">
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>{thread._count.comments}</span>
                          </div>
                        </div>
                      </CardHeader>
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
            <Card className="bg-violet-600/[0.03] border-violet-500/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-violet-400 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
                  <Zap className="h-4 w-4 fill-violet-400" />
                  Network Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-4 space-y-6">
                <div className="flex justify-between items-center group/stat">
                  <span className="text-slate-400 text-sm">Active Observers</span>
                  <span className="font-mono font-black text-white group-hover:text-cyan-400 transition-colors">1.2k+</span>
                </div>
                <div className="flex justify-between items-center group/stat">
                  <span className="text-slate-400 text-sm">Quantum Pulses</span>
                  <span className="font-mono font-black text-emerald-500 animate-pulse">42 Sync</span>
                </div>
                <div className="flex justify-between items-center group/stat">
                  <span className="text-slate-400 text-sm">Knowledge Blocks</span>
                  <span className="font-mono font-black text-white group-hover:text-violet-400 transition-colors">{initialThreads.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Global Signal
              </h3>
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Broadcast quick queries or observations to the global feed. Formal topics require initialization.
            </p>
            
            <div className="relative pt-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background rounded-2xl pointer-events-none z-10 h-32 bottom-0 top-auto" />
              <div className="max-h-[400px] overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-4">
                <CommentSection threadId="global-discussion" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest pt-2">
              <Shield className="w-3 h-3" />
              Encrypted Connection Established
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
