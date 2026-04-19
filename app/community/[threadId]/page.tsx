import prisma from "@/lib/prisma";
import { ThreadView } from "@/components/social/thread-view";

interface ThreadPageProps {
  params: Promise<{
    threadId: string;
  }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      author: {
        select: { name: true }
      }
    }
  });

  if (!thread) {
    // If thread doesn't exist in DB, we still show the placeholder UI but with the ID from params
    // OR we could show 404. Given this is a placeholder/migration phase, let's just use what we have.
    return (
      <div className="min-h-screen bg-background p-8">
        <ThreadView threadId={threadId} title="Discussion Thread" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <ThreadView 
        threadId={thread.id} 
        title={thread.title} 
        authorName={thread.author.name} 
      />
    </div>
  );
}
