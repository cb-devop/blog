"use client";

import Link from "next/link";
import { Sparkles, ArrowLeft, FileText, Settings } from "lucide-react";
import { AiArticleGenerator } from "@/components/ai-article-generator";

export default function AiWriterPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/posts" className="p-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Writer
            </h1>
            <p className="text-muted-foreground">
              Generate articles with AI, refine them, then save as a draft for review before publishing.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          AI Settings
        </Link>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { step: "1", title: "Describe", desc: "Enter a topic and optional instructions for the AI." },
          { step: "2", title: "Refine & Edit", desc: "Ask the AI to modify, or edit the HTML manually." },
          { step: "3", title: "Save as Draft", desc: "Send to Posts as a draft — review and publish when ready." },
        ].map((s) => (
          <div key={s.step} className="p-4 rounded-lg border border-border bg-muted/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {s.step}
              </span>
              <span className="text-sm font-semibold text-foreground">{s.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Generator */}
      <AiArticleGenerator enableSaveDraft />

      {/* Footer hint */}
      <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/30 border border-border text-sm text-muted-foreground">
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span>
          Saved drafts appear in{" "}
          <Link href="/dashboard/posts" className="text-primary hover:underline">Posts</Link>.
          Open a draft, review, and switch status to <strong>Published</strong> to make it live.
        </span>
      </div>
    </div>
  );
}
