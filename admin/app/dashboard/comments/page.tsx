"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare, Check, X, Trash2,
  Loader2, ExternalLink, Clock
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  post: { id: string; title: string; slug: string };
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const { toast } = useToast();

  useEffect(() => { fetchComments(); }, [statusFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/comments?status=${statusFilter}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (id: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        toast({ title: isApproved ? "Comment approved" : "Comment rejected" });
        fetchComments();
      }
    } catch {
      toast({ title: "Error", description: "Failed to update comment", variant: "destructive" });
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Delete this comment permanently?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Comment deleted" });
        fetchComments();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  };

  const pendingCount = comments.filter((c) => !c.isApproved).length;

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">comments.sh — moderation</span>
          {pendingCount > 0 && (
            <span className="terminal-badge yellow text-[10px] ml-2">
              {pendingCount} pending
            </span>
          )}
        </div>
        <div className="terminal-body">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="terminal-line text-sm">
                <span className="prompt">$</span>
                <span className="cmd">./moderate_comments.sh</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                {pendingCount > 0
                  ? `${pendingCount} comment${pendingCount > 1 ? "s" : ""} pending approval`
                  : "All comments moderated"}
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              {["pending", "approved", "all"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`terminal-btn text-xs ${
                    statusFilter === f ? "primary" : ""
                  }`}
                >
                  {f === "pending" ? "Pending" : f === "approved" ? "Approved" : "All"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Table */}
      <div className="terminal-window">
        <div className="terminal-titlebar">
          <span className="terminal-dot green" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot red" />
          <span className="terminal-title">SELECT * FROM comments WHERE status={statusFilter}</span>
          <span className="terminal-title-right">{comments.length} results</span>
        </div>
        <div className="terminal-body p-0 md:p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-terminal-text" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-mono">
                No {statusFilter !== "all" ? statusFilter : ""} comments found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs font-bold font-mono text-terminal-prompt">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold font-mono text-foreground">
                          <span className="text-terminal-prompt">@</span>{comment.authorName.toLowerCase().replace(/\s+/g, "_")}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          &lt;{comment.authorEmail}&gt;
                        </span>
                        {comment.isApproved ? (
                          <span className="terminal-badge green text-[10px]">approved</span>
                        ) : (
                          <span className="terminal-badge yellow text-[10px]">pending</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 mb-2 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <a
                          href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/blog/${comment.post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 text-terminal-text hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {comment.post.title.length > 35
                            ? comment.post.title.substring(0, 35) + "..."
                            : comment.post.title}
                        </a>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!comment.isApproved ? (
                        <button
                          onClick={() => updateComment(comment.id, true)}
                          className="terminal-btn text-xs px-2 py-1.5 text-green-500 border-green-500/30 hover:bg-green-500/10"
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateComment(comment.id, false)}
                          className="terminal-btn text-xs px-2 py-1.5 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                          title="Reject"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="terminal-btn text-xs px-2 py-1.5 text-red-500 border-red-500/30 hover:bg-red-500/10"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}