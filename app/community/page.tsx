import { CommunityHub } from "@/components/social/community-hub";

// Mock threads for development — replace with Prisma queries once DB is configured
const mockThreads = [
  {
    id: "t1",
    title: "Is the Many-Worlds Interpretation scientifically testable?",
    author: { name: "QuantumAlice" },
    createdAt: new Date("2024-04-15"),
    _count: { comments: 12 },
  },
  {
    id: "t2",
    title: "Bell's Inequality — Intuitive explanation for beginners",
    author: { name: "PhySciGuy" },
    createdAt: new Date("2024-04-10"),
    _count: { comments: 8 },
  },
  {
    id: "t3",
    title: "Double-slit experiment: Why does observation collapse the wave function?",
    author: { name: "StarGazer" },
    createdAt: new Date("2024-04-05"),
    _count: { comments: 23 },
  },
  {
    id: "t4",
    title: "Quantum computing vs classical — where's the real advantage?",
    author: { name: "GravityGuru" },
    createdAt: new Date("2024-03-28"),
    _count: { comments: 15 },
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background handled by body dot-grid */}

      <CommunityHub initialThreads={mockThreads} />
    </div>
  );
}
