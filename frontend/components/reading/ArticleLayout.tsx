"use client";

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/reading/ThemeToggle";
import { ReadingProgress } from "./ReadingProgress";
import { cn } from "@/lib/utils";

interface ArticleLayoutProps {
  children: ReactNode;
  title: string;
  publishedAt: string;
  readingTime: number;
  coverImage?: string;
}

export function ArticleLayout({
  children,
  title,
  publishedAt,
  readingTime,
  coverImage,
}: ArticleLayoutProps) {
  return (
    <article className="relative">
      <ReadingProgress />
      
      {/* Header - Minimalist & Elegant */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {readingTime} min read
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Cover Image */}
      {coverImage && (
        <div className="w-full h-[40vh] mt-16 relative overflow-hidden">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content - Typography Optimized */}
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-8">
          {title}
        </h1>
        
        <div className="flex items-center gap-4 mb-12 text-muted-foreground">
          <time className="text-sm">{publishedAt}</time>
          <span className="text-xs">•</span>
          <span className="text-sm">by Author Name</span>
        </div>

        {/* Premium Typography Styles */}
        <div className={cn(
          "prose prose-lg dark:prose-invert",
          "prose-headings:scroll-mt-28 prose-headings:font-semibold",
          "prose-p:leading-relaxed prose-p:my-6",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-img:rounded-xl prose-img:shadow-lg",
          "prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:text-sm",
          "prose-pre:bg-card prose-pre:border prose-pre:rounded-xl"
        )}>
          {children}
        </div>
      </main>

      {/* Social Share & Newsletter */}
      <aside className="fixed top-1/3 left-8 hidden xl:block">
        {/* Sticky social icons */}
      </aside>
    </article>
  );
}