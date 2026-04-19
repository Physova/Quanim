import { getAllTopics } from "@/lib/mdx";
import { TopicsList } from "@/components/visuals/topics-list";

export default function TopicsPage() {
  const topics = getAllTopics();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background handled by body dot-grid */}

      <TopicsList topics={topics} />
    </div>
  );
}
