"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { getGuestCompletedSlugs } from "@/lib/guest-identity";
import type { TopicFrontmatter } from "@/lib/mdx";

interface TopicsListProps {
  topics: TopicFrontmatter[];
}

const GRADE_LABELS: Record<string, string> = {
  "9": "Grade 9",
  "10": "Grade 10",
  "11": "Grade 11",
  "12": "Grade 12",
  "other": "Other Topics",
};

export function TopicsList({ topics }: TopicsListProps) {
  const { data: session } = useSession();
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCompleted() {
      if (session?.user?.id) {
        try {
          const res = await fetch("/api/completed");
          if (res.ok) {
            const data = await res.json();
            setCompletedSlugs(data.slugs || []);
          }
        } catch {
          // fallback to empty
        }
      } else {
        setCompletedSlugs(getGuestCompletedSlugs());
      }
    }
    fetchCompleted();
  }, [session]);

  // Group topics by grade
  const grouped = topics.reduce<Record<string, TopicFrontmatter[]>>((acc, topic) => {
    const key = topic.grade ? String(topic.grade) : "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(topic);
    return acc;
  }, {});

  // Sort grade keys: 9, 10, 11, 12, then "other"
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "other") return 1;
    if (b === "other") return -1;
    return Number(a) - Number(b);
  });

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
          {"// Repository"}
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tighter text-white uppercase">
          Physics Topics
        </h1>
        <p className="text-white/40 text-lg md:text-xl max-w-2xl leading-relaxed">
          Interpreting the Universe through interactive visual physics. 
          Explore our curated selection of complex phenomena.
        </p>
      </motion.div>

      {sortedKeys.map((gradeKey) => (
        <div key={gradeKey} className="mb-16">
          {/* Grade heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="w-8 h-px bg-white/20" />
            <h2 className="text-lg md:text-xl font-serif font-bold uppercase tracking-tighter text-white/70">
              {GRADE_LABELS[gradeKey] || `Grade ${gradeKey}`}
            </h2>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
              {grouped[gradeKey].length} {grouped[gradeKey].length === 1 ? "topic" : "topics"}
            </span>
            <span className="flex-1 h-px bg-white/10" />
          </motion.div>

          {/* Topic cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {grouped[gradeKey].map((topic) => (
              <motion.div key={topic.slug} variants={itemVariants}>
                <Card className="h-full flex flex-col bg-black border border-white/10 hover:border-white/40 transition-all duration-300 group overflow-hidden relative rounded-none">
                  <CardHeader className="relative z-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
                      {topic.difficulty}
                    </span>
                    <div className="flex items-center gap-2">
                      {completedSlugs.includes(topic.slug) && (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-green-400 uppercase tracking-wider">
                          <Check className="h-3 w-3" />
                          Done
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-tight">
                        {topic.publishedAt}
                      </span>
                    </div>
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
                  <Button asChild className="w-full h-10 rounded-none border border-white/10 text-white bg-black hover:!bg-white hover:!text-black transition-all duration-300 font-bold text-[10px] uppercase tracking-[0.2em] group/btn">
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
      ))}
    </div>
  );
}
