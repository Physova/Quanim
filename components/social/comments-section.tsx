"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  isDeleted: boolean;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CommentsSectionProps {
  slug: string;
}

export function CommentsSection({ slug }: CommentsSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (parentId: string | null = null) => {
    const text = parentId 
      ? (document.getElementById(`reply-${parentId}`) as HTMLTextAreaElement).value 
      : newComment;

    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          slug,
          parentId,
        }),
      });

      if (res.ok) {
        if (!parentId) setNewComment("");
        else setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editText }),
      });
      if (res.ok) {
        setEditingComment(null);
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isAuthor = session?.user?.id === comment.author.id;
    const isAdmin = session?.user?.role === "ADMIN";

    return (
      <div 
        key={comment.id} 
        className={cn(
          "flex gap-4 p-4 transition-colors",
          isReply ? "ml-8 mt-2 bg-white/[0.01] border-l-2 border-white/5" : "bg-white/[0.02] border border-white/10",
          comment.isDeleted && "opacity-60"
        )}
      >
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={comment.author.image || ""} />
            <AvatarFallback className="bg-white/5 text-white/60">
              {comment.author.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white truncate">
              {comment.isDeleted ? "[Deleted]" : (comment.author.name || "Anonymous")}
            </span>
            <span className="text-xs text-white/30 whitespace-nowrap">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>

          {editingComment === comment.id ? (
            <div className="mt-2 space-y-2">
              <Textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)}>Cancel</Button>
                <Button size="sm" onClick={() => handleUpdate(comment.id)} className="bg-white hover:bg-white/90 text-black rounded-none">
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60 mb-3 break-words">
              {comment.isDeleted ? "This comment has been removed by the author or a moderator." : comment.body}
            </p>
          )}

          {!comment.isDeleted && (
            <div className="flex items-center gap-4">
              {!isReply && (
                <button 
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Reply</span>
                </button>
              )}
              {isAuthor && !editingComment && (
                <button 
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditText(comment.body);
                  }}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit</span>
                </button>
              )}
              {(isAuthor || isAdmin) && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1 text-xs text-red-400/50 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}

          {replyTo === comment.id && (
            <div className="mt-4 space-y-2">
              <Textarea 
                id={`reply-${comment.id}`}
                placeholder={`Reply to ${comment.author.name}...`}
                className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>Cancel</Button>
                <Button 
                  size="sm" 
                  onClick={() => handleSubmit(comment.id)} 
                  disabled={isLoading}
                  className="bg-white hover:bg-white/90 text-black rounded-none"
                >
                  Post Reply
                </Button>
              </div>
            </div>
          )}

          {/* Replies rendering - only if it's a top-level comment */}
          {!isReply && comments
            .filter(c => c.parentId === comment.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(reply => renderComment(reply, true))}
        </div>
      </div>
    );
  };

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="space-y-6 mt-16 pt-12 border-t border-white/10 max-w-4xl mx-auto px-4">
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-amber-400" />
        Community Discussion
      </h3>

      {session ? (
        <div className="space-y-3 p-6 bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-white/80">{session.user?.name}</span>
          </div>
          <Textarea 
            placeholder="Share your thoughts on this topic..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[120px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none text-white"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit()} 
              disabled={isLoading || !newComment.trim()}
              className="bg-white hover:bg-white/90 text-black font-bold rounded-none px-8"
            >
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white/[0.02] border border-dashed border-white/10 text-center">
          <p className="text-white/40 mb-4">Join the physics community. Sign in to contribute to the discussion.</p>
          <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black rounded-none px-8">
            Sign In to Comment
          </Button>
        </div>
      )}

      <div className="space-y-6 mt-8">
        {rootComments.length === 0 ? (
          <div className="py-12 text-center border border-white/5 bg-white/[0.01]">
            <p className="text-white/30 italic">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          rootComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
