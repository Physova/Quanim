"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    reactions: number;
  };
}

interface CommentSectionProps {
  articleId?: string;
  threadId?: string;
  slug?: string;
}

export function CommentSection({ articleId, threadId, slug }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = async () => {
    const params = new URLSearchParams();
    if (articleId) params.append("articleId", articleId);
    if (threadId) params.append("threadId", threadId);
    if (slug) params.append("slug", slug);

    const res = await fetch(`/api/comments?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [articleId, threadId, slug]);

  const handleSubmit = async (parentId: string | null = null) => {
    if (!newComment.trim() && !parentId) return;
    
    setIsLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        content: parentId ? (document.getElementById(`reply-${parentId}`) as HTMLTextAreaElement).value : newComment,
        articleId,
        threadId,
        slug,
        parentId,
      }),
    });

    if (res.ok) {
      if (!parentId) setNewComment("");
      else setReplyTo(null);
      fetchComments();
    }
    setIsLoading(false);
  };

  const handleReaction = async (commentId: string) => {
    if (!session) return;

    const res = await fetch("/api/reactions", {
      method: "POST",
      body: JSON.stringify({
        commentId,
        type: "UPVOTE",
      }),
    });

    if (res.ok) {
      fetchComments();
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    return (
      <div key={comment.id} className={cn("flex gap-4 p-4 rounded-lg bg-card/50 border border-border/50", isReply && "ml-8 mt-2")}>
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border border-gold/20">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback className="bg-background text-gold">
              {comment.author.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gold">{comment.author.name || "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-foreground mb-3">{comment.content}</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleReaction(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{comment._count.reactions}</span>
            </button>
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Reply</span>
            </button>
          </div>

          {replyTo === comment.id && (
            <div className="mt-4 space-y-2">
              <Textarea 
                id={`reply-${comment.id}`}
                placeholder="Write a reply..."
                className="min-h-[80px] bg-background/50 border-gold/20 focus-visible:ring-gold"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
                <Button size="sm" onClick={() => handleSubmit(comment.id)} disabled={isLoading} className="bg-gold hover:bg-gold/80 text-black">
                  Post Reply
                </Button>
              </div>
            </div>
          )}

          {comments.filter(c => c.parentId === comment.id).map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="text-gold h-5 w-5" />
        Community Discussion
      </h3>

      {session ? (
        <div className="space-y-3 p-4 rounded-xl bg-card border border-gold/20 shadow-[0_0_15px_rgba(255,215,0,0.05)]">
          <Textarea 
            placeholder="Share your thoughts on this topic..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-background/50 border-gold/20 focus-visible:ring-gold"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isLoading || !newComment.trim()}
              className="bg-gold hover:bg-gold/80 text-black font-semibold"
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-card/30 border border-dashed border-border text-center">
          <p className="text-muted-foreground mb-4">Please sign in to join the discussion.</p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black">
            Sign In
          </Button>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {rootComments.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No comments yet. Be the first to start the conversation!</p>
        ) : (
          rootComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
