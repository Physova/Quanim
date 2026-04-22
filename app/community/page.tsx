// Temporarily unlisted from nav.
import { CommunityHub } from "@/components/social/community-hub";
import prisma from "@/lib/prisma";

export default async function CommunityPage() {
  const threads = await prisma.thread.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background handled by body dot-grid */}

      <CommunityHub initialThreads={threads} />
    </div>
  );
}
