"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BlogPost } from "@/lib/blog-data";

export function RelatedPosts({
  currentSlug,
  category,
  allPosts,
}: {
  currentSlug: string;
  category: string;
  allPosts: BlogPost[];
}) {
  const related = useMemo(
    () =>
      allPosts
        .filter((p) => p.category === category && p.slug !== currentSlug)
        .slice(0, 3),
    [allPosts, category, currentSlug]
  );

  if (related.length === 0) return null;

  return (
    <div className="mt-6 terminal-window animate-fade-in">
      <div className="terminal-titlebar">
        <span className="terminal-dot green" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot red" />
        <span className="terminal-title">related &mdash; articles</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-line text-xs mb-4">
          <span className="prompt">$</span>
          <span className="cmd">find /articles -category &quot;{category}&quot; | head -3</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {related.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group p-3 rounded-lg border border-border hover:border-ring bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono mb-2">
                <Tag className="h-3 w-3" />
                {post.category}
                <span className="mx-1">&bull;</span>
                <Clock className="h-3 w-3" />
                {post.readTime}
              </div>
              <h4 className="text-xs font-semibold font-mono text-foreground group-hover:text-terminal-text transition-colors line-clamp-2 mb-2">
                <span className="text-terminal-prompt mr-1">$</span>
                {post.title}
              </h4>
              <p className="text-[10px] text-muted-foreground font-mono line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-terminal-text font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                read more <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
