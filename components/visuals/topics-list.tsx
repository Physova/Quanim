"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/30 mb-6 block">
          // Repository
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tighter text-white uppercase">
          Physics Topics
        </h1>
        <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed">
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
        {topics.map((topic) => {
          return (
            <motion.div key={topic.slug} variants={itemVariants}>
              <Card className="h-full flex flex-col bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group overflow-hidden relative rounded-none">
                <CardHeader className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
                    {topic.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-tight">
                    {topic.publishedAt}
                  </span>
                </div>
                <CardTitle className="text-xl font-serif font-bold tracking-tighter text-white uppercase">
                  {topic.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-white/40 text-sm leading-relaxed mt-2">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow relative z-10">
                <div className="flex flex-wrap gap-3">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-mono font-bold text-white/20 uppercase tracking-[0.15em]">
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="relative z-10 border-t border-white/5 bg-white/[0.01]">
                <Button asChild variant="outline" className="w-full h-10 rounded-none border-white/10 hover:bg-white hover:text-black transition-all duration-300 font-bold text-[10px] uppercase tracking-[0.2em] group/btn">
                  <Link href={`/topics/${topic.slug}`} className="flex items-center justify-center gap-2 text-white group-hover/btn:text-black transition-colors">
                    Enter Simulation
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
