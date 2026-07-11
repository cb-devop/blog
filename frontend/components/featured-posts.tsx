"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { fetchAllPosts, BlogPost } from "@/lib/blog-data";
import { StaggerCards } from "@/components/home-animations";

export function FeaturedPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts().then((allPosts) => {
      setPosts(allPosts.slice(0, 6));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 md:px-6 max-w-7xl pb-8 relative z-10">
        <div className="flex justify-center pt-8">
          <div className="terminal-window inline-block min-w-[200px]">
            <div className="terminal-titlebar">
              <span className="terminal-dot green" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot red" />
              <span className="terminal-title">loading...</span>
            </div>
            <div className="terminal-body flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-6 max-w-7xl pb-16 md:pb-20 relative z-10">
      {/* Centered Section Header */}
      <div className="mb-8 flex justify-center">
        <div className="terminal-window inline-block min-w-[300px] w-full max-w-lg">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">ls -la ./posts/latest/</span>
          </div>
          <div className="terminal-body flex items-center justify-between">
            <div>
              <p className="terminal-line text-xs">
                <span className="prompt">$</span>
                <span className="cmd">Latest Articles</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Curated insights from our team
              </p>
            </div>
            <Link
              href="/blog"
              className="terminal-btn text-xs"
            >
              view_all.sh
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Staggered card entrance */}
      <StaggerCards>
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="terminal-window group block"
          >
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <span className="absolute top-2 left-2 terminal-badge blue">
                {post.category}
              </span>
              <span className="absolute top-2 right-2 terminal-badge green">
                {post.readTime}
              </span>
            </div>
            <div className="terminal-body">
              <p className="terminal-line text-xs mb-2">
                <span className="text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
              <h3 className="terminal-line text-sm font-semibold mb-1 group-hover:text-terminal-text transition-colors">
                <span className="prompt">$</span>
                <span className="cmd">{post.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-mono text-terminal-prompt">
                      {post.author.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {post.author.name}
                  </span>
                </div>
                <span className="text-xs text-terminal-text font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  ./read_more &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </StaggerCards>
    </section>
  );
}
