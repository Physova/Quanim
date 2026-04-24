"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Signal, Activity, Globe, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { CommentSection } from "@/components/social/comment-section";
import { motion } from "framer-motion";
import { CreateThreadDialog } from "./create-thread-dialog";

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
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  const handleCreateThreadSuccess = (newThread: Thread) => {
    setThreads([newThread, ...threads]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  return (
    <div className="container mx-auto py-24 px-4 relative z-10">
      <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-white/40" />
            <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.4em]">
              Knowledge Relay Network
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tighter uppercase leading-[0.9]">
            Community Hub
          </h1>
          <p className="text-white/40 text-lg max-w-xl leading-relaxed font-mono">
            Synthesize collective intelligence, challenge established paradigms, and connect with observers across the event horizon.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="h-16 px-10 bg-white text-black font-extrabold rounded-none transition-all duration-500 hover:bg-black hover:text-white border-2 border-white text-[11px] uppercase tracking-[0.4em] relative group overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Discussion
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white group-hover:bg-black transition-colors" />
          </Button>
        </motion.div>
      </div>

      <CreateThreadDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleCreateThreadSuccess}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <Signal className="h-5 w-5 text-white animate-pulse" />
              <h2 className="text-xs font-mono font-bold text-white uppercase tracking-[0.3em]">
                Active Transmissions / Signal Stream
              </h2>
            </div>
            <div className="flex gap-4">
              <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-white border-b-2 border-white pb-1 transition-all">Recent</button>
              <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-all">Trending</button>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {threads.length === 0 ? (
              <Card className="bg-white/[0.01] border border-dashed border-white/10 py-32 text-center rounded-none">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 border border-white/10 flex items-center justify-center mx-auto mb-6 bg-white/[0.02]">
                    <MessageSquare className="h-6 w-6 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm font-mono uppercase tracking-[0.2em]">Void Detected: No Active Signals</p>
                  <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="rounded-none border-white/20 text-[10px] uppercase font-mono tracking-widest">Transmit First Packet</Button>
                </CardContent>
              </Card>
            ) : (
              threads.map((thread) => (
                <motion.div key={thread.id} variants={itemVariants}>
                  <Link href={`/community/${thread.id}`} className="block group">
                    <Card className="bg-black border border-white/10 group-hover:border-white transition-all duration-500 rounded-none overflow-hidden relative">
                      {/* Corner Accents */}
                      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none border-r border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none border-l border-b border-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <CardHeader className="p-8 pb-4">
                        <div className="flex justify-between items-start gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-mono text-white/20 uppercase">Transmission ID: {thread.id.slice(0, 8)}</span>
                              <div className="w-1 h-1 rounded-none bg-white/20" />
                              <span className="text-[8px] font-mono text-white/20 uppercase">Verified</span>
                            </div>
                            <CardTitle className="text-2xl font-serif font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">
                              {thread.title}
                            </CardTitle>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-white/40 border border-white/10 px-4 py-2 rounded-none text-[10px] font-mono bg-white/[0.02] group-hover:border-white/40 group-hover:text-white transition-all">
                              <MessageSquare className="h-3 w-3" />
                              <span className="tabular-nums">{thread._count.comments.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">Responses</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-8 pb-8 pt-0">
                        <div className="space-y-8">
                          {thread.content && (
                            <p className="text-white/40 text-sm leading-relaxed line-clamp-2 font-mono group-hover:text-white/60 transition-colors">
                              {thread.content}
                            </p>
                          )}
                          <div className="flex items-center justify-between border-t border-white/5 pt-6">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center rounded-none group-hover:bg-white group-hover:border-white transition-all duration-500">
                                <span className="text-[10px] font-mono text-white group-hover:text-black font-bold">
                                  {(thread.author.name || 'A')[0].toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-mono font-bold text-white/60 uppercase tracking-widest group-hover:text-white transition-colors">
                                  @{thread.author.name || 'Anonymous'}
                                </span>
                                <span className="text-[8px] font-mono text-white/20 uppercase">Observer</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-[0.2em] text-white/20">
                              <span>Relay Date: {new Date(thread.createdAt).toLocaleDateString()}</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                            </div>
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
        <div className="lg:col-span-4 space-y-12">
          {/* Network Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/[0.02] border border-white/10 rounded-none overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <CardHeader className="p-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-white/40" />
                  <CardTitle className="text-white/40 text-[10px] font-mono font-bold uppercase tracking-[0.3em]">
                    Relay Statistics
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Active Observers</span>       
                    <span className="font-mono font-bold text-white text-lg tabular-nums">1.2k</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-full bg-white/40"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Quantum Pulses</span>
                    <span className="font-mono font-bold text-white text-lg tabular-nums">42 Hz</span>       
                  </div>
                  <div className="w-full h-[1px] bg-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "42%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                      className="absolute top-0 left-0 h-full bg-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-widest">Data Blocks</span>       
                    <span className="font-mono font-bold text-white text-lg tabular-nums">{threads.length}</span>
                  </div>
                  <div className="w-full h-[1px] bg-white/5 relative">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "88%" }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                      className="absolute top-0 left-0 h-full bg-white/40"
                    />
                  </div>
                </div>
              </CardContent>
              <div className="px-8 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Global Status: Optimal</span>
                <Activity className="w-3 h-3 text-blue-500/40" />
              </div>
            </Card>
          </motion.div>

          {/* Global Discussion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-none bg-white/[0.01] border border-white/10 overflow-hidden"
          >
            <div className="p-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="w-4 h-4 text-white/40" />
                <h3 className="font-mono font-bold text-[10px] text-white uppercase tracking-[0.3em]">
                  Real-time Buffer
                </h3>
              </div>
              <p className="text-[10px] font-mono text-white/40 leading-relaxed uppercase tracking-wider">
                Unstructured signal relay. Synchronize quick observations.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black rounded-none pointer-events-none z-10 h-32 bottom-0 top-auto" />
              <div className="max-h-[500px] overflow-hidden bg-black/40 p-6">
                <CommentSection threadId="global-discussion" />
              </div>
            </div>

            <div className="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-none bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-[0.2em]">
                Uplink Active // Encrypted Channel
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
