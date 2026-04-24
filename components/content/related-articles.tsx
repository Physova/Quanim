import Link from "next/link";
import { getAllTopics } from "@/lib/mdx";

interface RelatedArticlesProps {
  currentSlug: string;
  currentTags: string[];
}

export async function RelatedArticles({
  currentSlug,
  currentTags,
}: RelatedArticlesProps) {
  const allTopics = getAllTopics();

  // Score each article by tag overlap
  const related = allTopics
    .filter((topic) => topic.slug !== currentSlug)
    .map((topic) => {
      const overlapCount = (topic.tags ?? []).filter((tag: string) =>
        currentTags.includes(tag)
      ).length;
      return { ...topic, overlapCount };
    })
    .filter((t) => t.overlapCount > 0)
    .sort((a, b) => b.overlapCount - a.overlapCount)
    .slice(0, 3); // show max 3 related articles

  if (related.length === 0) return null;

  return (
    <section className="mt-32 pt-16 border-t border-white/10">
      <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-tighter text-white mb-12 flex items-center gap-4">
        <span className="w-12 h-px bg-white/20" />
        Related Topics
      </h2>
      <div className="grid gap-8 sm:grid-cols-3">
        {related.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group p-12 border border-white/10 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.08] transition-all duration-500 rounded-none relative overflow-hidden flex flex-col justify-center min-h-[320px]"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.4em]">Module</span>
              </div>
              <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors leading-tight">
                {topic.title}
              </h3>
              <p className="text-[11px] text-white/40 leading-relaxed line-clamp-4 uppercase tracking-wider font-mono">
                {topic.description}
              </p>
            </div>
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
               <span className="text-white/60 text-sm">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
