import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTopicBySlug, getTopicSlugs } from "@/lib/mdx";
import { MDXContent } from "@/components/mdx-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Lab } from "@/components/simulations/lab-interface";
import { TopicActions } from "@/components/social/topic-actions";

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

  // Determine simulation type based on slug or frontmatter
  const simType = (slug === 'double-slit' || slug === 'entanglement' || slug === 'superposition')
    ? slug as "double-slit" | "entanglement" | "superposition"
    : null;

  // Use the static import map for MDX content
  const Content = TOPIC_MAP[slug as keyof typeof TOPIC_MAP];
  if (!Content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background handled by body dot-grid */}

      <div className="container mx-auto py-12 px-4 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <Button asChild variant="ghost" className="w-fit text-white/40 hover:text-white hover:bg-white/5 -ml-4 transition-all">
            <Link href="/topics">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Repository
            </Link>
          </Button>

          <TopicActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white/40">
                  {frontmatter.difficulty}
                </span>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.15em]">
                  {frontmatter.publishedAt}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 tracking-tighter uppercase leading-[1.1]">
                {frontmatter.title}
              </h1>
              
              <div className="border-l border-white/20 pl-6 mb-12">
                <p className="text-lg md:text-xl text-white/50 leading-relaxed">
                  {frontmatter.description}
                </p>
              </div>
            </div>

            {/* Integrated Simulation removed - now handled purely inside MDX */}

            <div className="border border-white/5 rounded-none p-8 md:p-16 mb-12 prose prose-invert max-w-none relative">
               <div className="relative z-10">
                <MDXContent>
                  <Suspense fallback={<div className="h-96 bg-white/[0.02] border border-white/5"></div>}>
                    <Content />
                  </Suspense>
                </MDXContent>
               </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-16 pt-8 border-t border-white/5">
              {frontmatter.tags.map(tag => (
                <span key={tag} className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-[0.15em] border border-white/10 px-3 py-1 rounded-none hover:border-white/40 hover:text-white/50 transition-all cursor-default">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar (Desktop View) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* Sidebar Simulation removed - now handled purely inside MDX */}
              
              <div className="p-8 rounded-none bg-white/[0.02] border border-white/10 relative overflow-hidden group">
                  <h4 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-6">
                    // System Brief
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

              <div className="p-6 rounded-none bg-white/[0.02] border border-white/10 text-center">
                  <p className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] mb-3">Join the Discussion</p>
                  <Button asChild size="sm" className="w-full bg-white text-black font-bold rounded-none transition-all hover:bg-white/90">
                    <Link href="/community">Community Hub</Link>
                  </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
