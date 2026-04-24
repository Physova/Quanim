"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  body?: string;
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

  const fetchComments = useCallback(async () => {
    const params = new URLSearchParams();
    if (articleId) params.append("articleId", articleId);
    if (threadId) params.append("threadId", threadId);
    if (slug) params.append("slug", slug);

    const res = await fetch(`/api/comments?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  }, [articleId, threadId, slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (parentId: string | null = null) => {
    const text = parentId 
      ? (document.getElementById(`reply-${parentId}`) as HTMLTextAreaElement).value 
      : newComment;

    if (!text.trim()) return;
    
    setIsLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        body: text,
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
      <div key={comment.id} className={cn("flex gap-4 p-4 rounded-none bg-white/[0.02] border border-white/10", isReply && "ml-8 mt-2")}>
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback className="bg-white/5 text-white/60">
              {comment.author.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{comment.author.name || "Anonymous"}</span>
            <span className="text-xs text-white/30">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-white/60 mb-3">{comment.content || comment.body}</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleReaction(comment.id)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>{comment._count.reactions}</span>
            </button>
            <button 
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
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
                className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
                <Button size="sm" onClick={() => handleSubmit(comment.id)} disabled={isLoading} className="bg-white hover:bg-white/90 text-black rounded-none">
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
        Community Discussion
      </h3>

      {true /* session ? */ ? (
        <div className="space-y-3 p-4 rounded-none bg-white/[0.02] border border-white/10">
          <Textarea 
            placeholder="Share your thoughts on this topic..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isLoading || !newComment.trim()}
              className="bg-white hover:bg-white/90 text-black font-bold rounded-none"
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-none bg-white/[0.02] border border-dashed border-white/10 text-center">
          <p className="text-white/40 mb-4">Please sign in to join the discussion.</p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none">
            Sign In
          </Button>
        </div>
      )}

      <div className="space-y-4 mt-8">
        {rootComments.length === 0 ? (
          <p className="text-center text-white/30 py-10">No comments yet. Be the first to start the conversation.</p>
        ) : (
          rootComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
