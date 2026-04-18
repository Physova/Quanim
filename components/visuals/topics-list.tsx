"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Tag } from "lucide-react";
import type { TopicFrontmatter } from "@/lib/mdx";

interface TopicsListProps {
  topics: TopicFrontmatter[];
}

export function TopicsList({ topics }: TopicsListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="container mx-auto py-16 px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
          <BookOpen className="w-3 h-3" />
          Repository
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tighter text-white uppercase">
          Physics Topics
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
          Interpreting the Universe through interactive visual physics. 
          Explore our curated selection of complex phenomena.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {topics.map((topic) => (
          <motion.div key={topic.slug} variants={itemVariants}>
            <Card className="h-full flex flex-col bg-white/[0.02] backdrop-blur-md border-white/5 hover:border-white/20 transition-all duration-500 group overflow-hidden relative rounded-none">
              {/* Accent Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-none border border-white/10 text-white/60 bg-white/5">
                    {topic.difficulty}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40 uppercase tracking-tight">
                    <Clock className="w-3 h-3" />
                    {topic.publishedAt}
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif font-bold tracking-tight text-white group-hover:text-white transition-colors duration-300">
                  {topic.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-muted-foreground text-sm leading-relaxed mt-2 font-medium">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow relative z-10">
                <div className="flex flex-wrap gap-2">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-none border border-white/5 flex items-center gap-1 tracking-widest">
                      <Tag className="w-2 h-2 opacity-50" />
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 border-t border-white/5 bg-white/[0.01]">
                <Button asChild variant="outline" className="w-full h-10 rounded-none border-white/10 hover:bg-white hover:text-black transition-all duration-300 font-bold text-[10px] uppercase tracking-[0.2em] group/btn">
                  <Link href={`/topics/${topic.slug}`} className="flex items-center justify-center gap-2">
                    Enter Simulation
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
