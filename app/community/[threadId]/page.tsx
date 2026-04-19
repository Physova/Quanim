import { ThreadView } from "@/components/social/thread-view";

// Mock thread data for development
const mockThreads: Record<string, { title: string; authorName: string }> = {
  t1: { title: "Is the Many-Worlds Interpretation scientifically testable?", authorName: "QuantumAlice" },
  t2: { title: "Bell's Inequality — Intuitive explanation for beginners", authorName: "PhySciGuy" },
  t3: { title: "Double-slit experiment: Why does observation collapse the wave function?", authorName: "StarGazer" },
  t4: { title: "Quantum computing vs classical — where's the real advantage?", authorName: "GravityGuru" },
};

interface ThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;
  const thread = mockThreads[threadId];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="relative z-10 p-8">
        <ThreadView
          threadId={threadId}
          title={thread?.title || "Discussion Thread"}
          authorName={thread?.authorName}
        />
      </div>
    </div>
  );
}
