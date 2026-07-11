"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Send, Clock, Check, Loader2 } from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export function CommentsSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/public?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/comments/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setAuthorName("");
        setAuthorEmail("");
        setContent("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit comment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-8 border-t">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Comments</h2>
        {!loading && <span className="text-sm text-muted-foreground">({comments.length})</span>}
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading comments...
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold font-mono text-terminal-prompt">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold font-mono text-foreground">
                      <span className="text-terminal-prompt">@</span>{comment.authorName.toLowerCase().replace(/\s+/g, "_")}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 font-mono leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}

      {/* Comment Form */}
      {submitted ? (
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">status — success</span>
          </div>
          <div className="terminal-body text-center py-6">
            <Check className="h-10 w-10 text-terminal-text mx-auto mb-3" />
            <h3 className="text-lg font-bold font-mono">Comment submitted!</h3>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              Your comment has been submitted for review. It will appear here after admin approval.
            </p>
          </div>
        </div>
      ) : (
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">leave_comment.sh</span>
          </div>
          <div className="terminal-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="terminal-line text-sm mb-1">
                <span className="prompt">$</span>
                <span className="cmd">Leave a Comment</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="terminal-input text-sm"
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  required
                  className="terminal-input text-sm"
                />
              </div>

              <textarea
                placeholder="Write your comment... *"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="terminal-input text-sm resize-y min-h-[100px]"
              />

              {error && <p className="text-xs text-red-500 font-mono">{error}</p>}

              <button type="submit" disabled={submitting} className="terminal-btn primary">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {submitting ? "./submitting.sh" : "./submit_comment.sh"}
              </button>

              <p className="text-xs text-muted-foreground font-mono">
                <span className="text-terminal-text">*</span> Your email will not be published. Comments require admin approval.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
