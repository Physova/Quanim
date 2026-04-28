"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Trash2, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { getGuestIdentity, type GuestIdentity } from "@/lib/guest-identity";

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  parentId: string | null;
  isDeleted: boolean;
  guestId: string | null;
  guestName: string | null;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  } | null;
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
  const [guest, setGuest] = useState<GuestIdentity | null>(null);

  useEffect(() => {
    if (!session) {
      setGuest(getGuestIdentity());
    }
  }, [session]);

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
      ? (document.getElementById(`reply-${parentId}`) as HTMLTextAreaElement)?.value
      : newComment;

    if (!text?.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: text,
          slug,
          parentId,
          ...(session ? {} : { guestId: guest?.guestId, guestName: guest?.displayName }),
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
        headers: guest?.guestId ? { "x-guest-id": guest.guestId } : {},
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
        headers: {
          "Content-Type": "application/json",
          ...(guest?.guestId ? { "x-guest-id": guest.guestId } : {}),
        },
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



  const currentDisplayName = session?.user?.name || session?.user?.username || guest?.displayName || "Anonymous";
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-6 mt-16 pt-12 border-t border-white/10 max-w-4xl mx-auto px-4 font-mono">
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-white" />
        Community Discussion
      </h3>

      {/* Comments list FIRST */}
      <div className="space-y-6">
        {comments.filter(c => !c.parentId).length === 0 ? (
          <div className="py-12 text-center border border-white/5 bg-white/[0.01]">
            <p className="text-white/30 italic">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments
            .filter(c => !c.parentId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                allComments={comments}
                session={session}
                guest={guest}
                isAdmin={isAdmin}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                editText={editText}
                setEditText={setEditText}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            ))
        )}
      </div>

      {/* Comment input BELOW existing comments */}
      <div className="space-y-3 p-6 bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <Avatar className="h-8 w-8 border border-white/10">
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} />
            ) : null}
            <AvatarFallback className="bg-white/5 text-white/60 text-xs font-bold">
              {currentDisplayName[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">{currentDisplayName}</span>
            {!session && (
              <span className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest border border-white/10 px-1.5 py-0.5">
                Guest
              </span>
            )}
          </div>
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
            className="bg-black border border-white/20 text-white hover:bg-white hover:text-black font-bold rounded-none px-8 transition-all duration-300"
          >
            Post Comment
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  session: {
    user: {
      id: string;
      name?: string | null;
      username?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  } | null;
  guest: GuestIdentity | null;
  isAdmin: boolean;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  editingComment: string | null;
  setEditingComment: (id: string | null) => void;
  editText: string;
  setEditText: (text: string) => void;
  handleUpdate: (id: string) => void;
  handleDelete: (id: string) => void;
  handleSubmit: (parentId: string) => void;
  isLoading: boolean;
  depth?: number;
}

function CommentItem({
  comment,
  allComments,
  session,
  guest,
  isAdmin,
  replyTo,
  setReplyTo,
  editingComment,
  setEditingComment,
  editText,
  setEditText,
  handleUpdate,
  handleDelete,
  handleSubmit,
  isLoading,
  depth = 0,
}: CommentItemProps) {
  const isOwnComment = 
    (session?.user?.id && comment.author?.id === session.user.id) ||
    (guest?.guestId && comment.guestId === guest.guestId);
  
  const canEdit = isOwnComment;
  const canDelete = isOwnComment || isAdmin;
  const isGuest = !comment.author && comment.guestId;

  const getCommentDisplayName = (c: Comment) => {
    if (c.isDeleted) return "[Deleted]";
    if (c.author) return c.author.username || c.author.name || "Anonymous";
    return c.guestName || "Anonymous";
  };

  return (
    <div
      className={cn(
        "flex gap-4 p-4 transition-colors",
        depth > 0 ? "ml-4 md:ml-8 mt-2 bg-white/[0.01] border-l-2 border-white/5" : "bg-white/[0.02] border border-white/10",
        comment.isDeleted && "opacity-60"
      )}
    >
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-white/10">
          <AvatarImage src={comment.author?.image || ""} />
          <AvatarFallback className={cn(
            "text-white/60 font-bold text-[10px] md:text-sm",
            isGuest ? "bg-white/[0.08]" : "bg-white/5"
          )}>
            {(comment.author?.name || comment.guestName || "?")[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-semibold text-white text-sm md:text-base truncate">
              {getCommentDisplayName(comment)}
            </span>
            {isGuest && !comment.isDeleted && (
              <span className="text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest border border-white/10 px-1.5 py-0.5">
                Guest
              </span>
            )}
            <span className="text-[10px] md:text-xs text-white/30 whitespace-nowrap">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          {!comment.isDeleted && (
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className={cn(
                  "p-2 transition-colors",
                  replyTo === comment.id ? "text-white bg-white/10" : "text-white/20 hover:text-white hover:bg-white/5"
                )}
                title="Reply"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              {canEdit && editingComment !== comment.id && (
                <button
                  onClick={() => { setEditingComment(comment.id); setEditText(comment.body); }}
                  className="p-2 text-white/20 hover:text-white hover:bg-white/5 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {editingComment === comment.id ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none text-white text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)} className="text-[10px] uppercase font-bold tracking-widest">Cancel</Button>
              <Button size="sm" onClick={() => handleUpdate(comment.id)} className="bg-white hover:bg-white/90 text-black rounded-none text-[10px] uppercase font-bold tracking-widest">
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60 break-words leading-relaxed">
            {comment.isDeleted ? "This comment has been removed by the author or a moderator." : comment.body}
          </p>
        )}

        {replyTo === comment.id && (
          <div className="mt-4 space-y-2">
            <Textarea
              id={`reply-${comment.id}`}
              placeholder={`Reply to ${getCommentDisplayName(comment)}...`}
              className="min-h-[80px] bg-black/50 border-white/10 focus-visible:ring-white/50 rounded-none text-white text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="text-[10px] uppercase font-bold tracking-widest">Cancel</Button>
              <Button
                size="sm"
                onClick={() => handleSubmit(comment.id)}
                disabled={isLoading}
                className="bg-white hover:bg-white/90 text-black rounded-none text-[10px] uppercase font-bold tracking-widest"
              >
                Post Reply
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        <div className="space-y-2">
          {allComments
            .filter(c => c.parentId === comment.id)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            .map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                allComments={allComments}
                session={session}
                guest={guest}
                isAdmin={isAdmin}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                editingComment={editingComment}
                setEditingComment={setEditingComment}
                editText={editText}
                setEditText={setEditText}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                depth={depth + 1}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

