import prisma from "@/lib/prisma";
import { CommunityHub } from "@/components/social/community-hub";

export default async function CommunityPage() {
  const threads = await prisma.thread.findMany({
    include: {
      author: {
        select: { name: true }
      },
      _count: {
        select: { comments: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <CommunityHub initialThreads={threads} />
    </div>
  );
}
