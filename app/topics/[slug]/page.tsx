import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTopicBySlug, getTopicSlugs } from "@/lib/mdx";
import { MDXContent } from "@/components/mdx-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

import { TopicActions } from "@/components/social/topic-actions";
import { CommentsSection } from "@/components/social/comments-section";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { RelatedArticles } from "@/components/content/related-articles";
import "katex/dist/katex.min.css";

const TOPIC_MAP = {
  "double-slit": React.lazy(() => import("@/content/topics/double-slit.mdx")),
  "entanglement": React.lazy(() => import("@/content/topics/entanglement.mdx")),
  "superposition": React.lazy(() => import("@/content/topics/superposition.mdx")),
};

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getTopicSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, ""),
  }));
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  
  let topic;
  try {
    topic = getTopicBySlug(slug);
  } catch {
    notFound();
  }

  const { frontmatter } = topic;

  

  // Use the static import map for MDX content
  const Content = TOPIC_MAP[slug as keyof typeof TOPIC_MAP];
  if (!Content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ReadingProgress />
      {/* Background handled by body dot-grid */}

      <div className="container mx-auto py-12 px-4 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <Button asChild variant="ghost" className="w-fit text-white/40 hover:text-white hover:bg-white/5 -ml-4 transition-all rounded-none font-bold uppercase tracking-widest text-[10px]">
            <Link href="/topics">
              <ChevronLeft className="mr-2 w-4 h-4" />
              Return to Repository
            </Link>
          </Button>

          <TopicActions />
        </div>

        <div id="article-content" className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-12">
              <div className="flex items-center gap-6 mb-8">
                <DifficultyBadge difficulty={frontmatter.difficulty} />
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.2em] font-bold">
                  {frontmatter.publishedAt}
                </span>
                <span className="text-[10px] font-mono text-white/60 uppercase tracking-[0.2em] font-bold">
                  {Math.ceil(topic.content.split(/\s+/).length / 200)} min read
                </span>
              </div>
              
              <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-10 tracking-tighter uppercase leading-[0.9]">
                {frontmatter.title}
              </h1>
              
              <div className="border-l border-white/10 pl-8 mb-16">
                <p className="text-lg md:text-xl text-white/40 leading-relaxed font-mono italic">
                  {frontmatter.description}
                </p>
              </div>
            </div>

            {/* Integrated Simulation removed - now handled purely inside MDX */}

            <div className="border border-white/5 rounded-none p-8 md:p-20 mb-12 relative bg-white/[0.01]">
               <div className="relative z-10">
                <MDXContent slug={slug}>
                  <Suspense fallback={<div className="h-96 bg-white/[0.01] border border-white/5"></div>}>
                    <Content />
                  </Suspense>
                </MDXContent>
               </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-24 pt-12 border-t border-white/5">
              {frontmatter.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono font-bold text-white/10 uppercase tracking-[0.2em] border border-white/5 px-4 py-1.5 rounded-none hover:border-white/20 hover:text-white/40 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>

            <div id="article-end" />
            <RelatedArticles currentSlug={slug} currentTags={frontmatter.tags} />

            <CommentsSection slug={slug} />
          </div>

          {/* Sidebar (Desktop View) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* Sidebar Simulation removed - now handled purely inside MDX */}
              
              <div className="p-8 rounded-none bg-white/[0.02] border border-white/10 relative overflow-hidden group">
                  <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-6">
                    {/* System Brief */}
                  </h4>
                  <ul className="space-y-4">
                      <li className="text-xs text-white/40 flex items-start gap-3 leading-relaxed">
                          <span className="text-white/60 font-bold mt-1">01</span>
                          <span>Interactive visual model utilizing high-precision GLSL interference algorithms.</span>
                      </li>
                      <li className="text-xs text-white/40 flex items-start gap-3 leading-relaxed">
                          <span className="text-white/60 font-bold mt-1">02</span>
                          <span>Modify environmental variables in real-time to observe wave-particle duality shifts.</span>
                      </li>
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
