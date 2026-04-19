import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTopicBySlug, getTopicSlugs } from "@/lib/mdx";
import { MDXContent } from "@/components/mdx-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FlaskConical, Share2, Info, Clock, Sparkles } from "lucide-react";
import { Lab } from "@/components/simulations/lab-interface";

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
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] right-[-5%] w-[30%] h-[30%] bg-cyan-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-violet-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto py-12 px-4 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <Button asChild variant="ghost" className="w-fit text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/5 -ml-4 transition-all">
            <Link href="/topics">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Repository
            </Link>
          </Button>

          <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:border-cyan-500/50 hover:text-cyan-400">
                <Share2 className="h-4 w-4" />
             </Button>
             <Button variant="outline" size="icon" className="rounded-full bg-white/5 border-white/10 hover:border-violet-500/50 hover:text-violet-400">
                <Info className="h-4 w-4" />
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  frontmatter.difficulty === 'Beginner' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                  frontmatter.difficulty === 'Intermediate' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' :
                  'border-violet-500/30 text-violet-400 bg-violet-500/5'
                }`}>
                  {frontmatter.difficulty}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  {frontmatter.publishedAt}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                {frontmatter.title}
              </h1>
              
              <div className="bg-white/[0.03] backdrop-blur-md border-l-4 border-cyan-500 p-6 rounded-r-2xl mb-12">
                <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                  {frontmatter.description}
                </p>
              </div>
            </div>

            {/* Integrated Simulation (Mobile/Tablet View) */}
            {simType && (
              <div className="lg:hidden mb-12">
                 <div className="flex items-center gap-2 mb-4 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Core Experiment // v2.4
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl shadow-2xl backdrop-blur-sm">
                  <Lab type={simType} />
                </div>
              </div>
            )}

            <div className="bg-background/40 backdrop-blur-sm border border-white/5 rounded-[2rem] p-8 md:p-16 mb-12 prose prose-invert prose-cyan max-w-none shadow-2xl relative overflow-hidden">
               {/* Decorative subtle gradient */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.02] rounded-full blur-3xl pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/[0.02] rounded-full blur-3xl pointer-events-none" />
               
               <div className="relative z-10">
                <MDXContent>
                  <Suspense fallback={<div className="animate-pulse h-96 bg-white/5 rounded-2xl border border-white/5"></div>}>
                    <Content />
                  </Suspense>
                </MDXContent>
               </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-16 pt-8 border-t border-white/5">
              {frontmatter.tags.map(tag => (
                <span key={tag} className="text-[10px] font-black bg-white/5 text-slate-500 px-4 py-1.5 rounded-full border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all cursor-default uppercase tracking-widest">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar Simulation (Desktop View) */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {simType && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                    <FlaskConical className="h-4 w-4" /> Lab Module // {slug}.sys
                  </div>
                  <div className="w-[420px] xl:w-[480px] -ml-[120px] xl:-ml-[160px] relative group">
                    <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-black border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                      <Lab type={simType} className="aspect-square" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-widest font-mono">
                      Realtime Physics Compute
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-emerald-500/80 font-mono uppercase">Status: Nominal</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
                  
                  <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> System Brief
                  </h4>
                  <ul className="space-y-4">
                      <li className="text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
                          <span className="text-cyan-500 font-bold mt-1">01</span>
                          <span>Interactive visual model utilizing high-precision GLSL interference algorithms.</span>
                      </li>
                      <li className="text-xs text-slate-400 flex items-start gap-3 leading-relaxed">
                          <span className="text-violet-500 font-bold mt-1">02</span>
                          <span>Modify environmental variables in real-time to observe wave-particle duality shifts.</span>
                      </li>
                  </ul>
              </div>

              <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                  <p className="text-[10px] font-black text-cyan-400/80 uppercase tracking-widest mb-3">Join the Discussion</p>
                  <Button asChild size="sm" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
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
