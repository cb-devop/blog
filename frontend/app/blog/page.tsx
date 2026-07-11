"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Clock, Terminal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fetchAllPosts, BlogPost } from "@/lib/blog-data";

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts().then((posts) => {
      setAllPosts(posts);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.04),transparent_60%)]" />
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="mx-auto max-w-3xl">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">bash — blog.sh</span>
                <span className="terminal-title-right">articles</span>
              </div>
              <div className="terminal-body space-y-2">
                <p className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="cmd">~/premiumblog</span>
                  <span className="text-muted-foreground">$ </span>
                  <span className="text-terminal-text">ls ./articles/</span>
                </p>
                <p className="terminal-line">
                  <span className="prompt">$</span>
                  <span className="text-green-500">✓</span>
                  <span className="text-muted-foreground ml-2">Found {allPosts.length} articles</span>
                </p>
                <hr className="terminal-divider" />
                <h1 className="text-2xl md:text-3xl font-bold font-mono">
                  <span className="text-terminal-prompt">$</span> Our Blog
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Discover insightful articles about web development, design, and technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Info */}
      <div className="container mx-auto px-4 md:px-6 max-w-6xl mb-8">
        <div className="terminal-window inline-block">
          <div className="terminal-body py-2 px-4 flex items-center gap-4 text-xs">
            <span className="terminal-line">
              <span className="prompt">$</span>
              <span className="cmd">sort_by=date</span>
            </span>
            <span className="terminal-line">
              <span className="prompt">$</span>
              <span className="cmd">order=desc</span>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="status-dot online" />
            <span className="text-terminal-text">active</span>
            <span className="text-muted-foreground">|</span>
            <span className="terminal-line">
              <span className="prompt">$</span>
              <span className="cmd">page={currentPage}/{totalPages}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <section className="container mx-auto px-4 md:px-6 max-w-6xl pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {currentPosts.map((post) => (
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
                    <Clock className="h-3 w-3" />
                    {post.readTime.replace(" min read", "m")}
                  </span>
                </div>
                <div className="terminal-body">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

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
                        <span className="text-xs font-mono text-terminal-prompt">{post.author.name.charAt(0)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{post.author.name}</span>
                    </div>
                    <span className="text-xs text-terminal-text font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      ./read →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <section className="container mx-auto px-4 md:px-6 max-w-6xl pb-16 md:pb-20">
          <div className="terminal-window">
            <div className="terminal-titlebar">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">pagination.sh</span>
            </div>
            <div className="terminal-body">
              <p className="terminal-line text-xs mb-3">
                <span className="prompt">$</span>
                <span className="cmd">Showing page {currentPage} of {totalPages}</span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="terminal-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Newer Posts
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`h-8 w-8 rounded-lg text-xs font-mono transition-all ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="terminal-btn flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Older Posts
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
