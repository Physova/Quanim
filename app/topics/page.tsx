import { getAllTopics } from "@/lib/mdx";
import { TopicsList } from "@/components/visuals/topics-list";

export default function TopicsPage() {
  const topics = getAllTopics();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grey gradient for depth */}
      <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      <TopicsList topics={topics} />
    </div>
  );
}
