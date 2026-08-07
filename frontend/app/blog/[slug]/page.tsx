import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar, Clock, Tag,
  Eye,
  ChevronLeft, ChevronRight, Terminal
} from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { CommentsSection } from "@/components/comments";
import { getPostBySlugSync, getAllPostsSync, fetchPostBySlug, fetchAllPosts, BlogPost } from "@/lib/blog-data";
import { ReadingProgress } from "@/components/reading/ReadingProgress";
import { ReadingControls } from "@/components/reading/ReadingControls";
import { TableOfContents } from "@/components/reading/TableOfContents";
import { CopyCodeButton } from "@/components/reading/CopyCodeButton";
import { RelatedPosts } from "@/components/reading/RelatedPosts";
import { SocialShare } from "@/components/reading/SocialShare";
import { ArticleContent as ArticleContentInteractive } from "@/components/reading/ArticleContent";

// Allow dynamic rendering for non-pre-rendered slugs
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = getAllPostsSync();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Content wrapper for client-side interactivity (TOC, copy code, heading anchors, lightbox)
function ArticleContentWrapper({ content, readTime }: { content: string; readTime: string }) {
  return (
    <>
      <CopyCodeButton content={content} />
      <TableOfContents content={content} />
      <div className="article-typography">
        {/* Reading time indicator at top of content */}
        <div className="flex items-center gap-2 mb-8 pb-6 border-b border-border/50">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/30 border border-border/50">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-terminal-prompt"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
              {readTime} &middot; Scroll to read
            </span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
        </div>

        <ArticleContentInteractive content={content} />
      </div>
    </>
  );
}

export default async function SinglePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Try fallback data first, then API
  let post = getPostBySlugSync(slug);
  if (!post) {
    post = await fetchPostBySlug(slug);
  }

  if (!post) {
    notFound();
  }

  // Find prev/next posts for navigation
  const allPosts = await fetchAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article className="min-h-screen">
      <ReadingProgress />

      {/* Header section */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl pt-8 md:pt-12">
        <div className="terminal-window mb-6 animate-fade-in">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">navigation</span>
          </div>
          <div className="terminal-body py-3">
            <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground flex-wrap">
              <Link href="/" className="hover:text-terminal-text transition-colors">~/home</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/blog" className="hover:text-terminal-text transition-colors">blog</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-terminal-text truncate max-w-[200px] md:max-w-none">{post.slug}</span>
            </nav>
          </div>
        </div>

        <div className="terminal-window animate-slide-up">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">cat ./articles/{post.slug}.md</span>
            <span className="terminal-title-right">{post.readTime}</span>
          </div>
          <div className="terminal-body md:p-8 p-6">
            <div className="terminal-line text-xs md:text-sm mb-1">
              <span className="prompt">$</span>
              <span className="path">~/premiumblog</span>
              <span className="text-muted-foreground"> articles/</span>
              <span className="text-terminal-text">{post.slug}</span>
            </div>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <span className="terminal-badge blue">
                <Tag className="h-3 w-3" />
                {post.category}
              </span>
              <span className="terminal-badge green">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-bold font-display leading-tight mb-4">
              <span className="text-terminal-prompt font-mono">$</span> {post.title}
            </h1>

            <div className="border-l-2 border-terminal-text/30 pl-4 py-2 mb-6">
              <p className="text-sm md:text-base text-muted-foreground font-mono italic">
                &quot;{post.excerpt}&quot;
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 md:p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-terminal-prompt">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-mono text-foreground">
                    <span className="text-terminal-prompt">@</span>{post.author.name.toLowerCase().replace(/\s+/g, "_")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {post.author.bio}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image - staying at the top as before */}
        <div className="mt-6 terminal-window overflow-hidden animate-fade-in">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">image &mdash; featured</span>
          </div>
          <div className="relative aspect-video w-full image-elegant-wrap">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover image-elegant"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
            />
          </div>
          <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
            <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="h-3 w-3" />
              <span>Featured image &mdash; {post.title}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl py-10">
        <ReadingControls />
        <div className="terminal-window">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">content &mdash; reader</span>
            <span className="terminal-title-right">{post.readTime}</span>
          </div>
          <div className="terminal-body md:p-8 p-6">
            <ArticleContentWrapper content={post.content} readTime={post.readTime} />
          </div>
        </div>

        {/* Share - below the post */}
        <div className="mt-6">
          <SocialShare title={post.title} slug={post.slug} excerpt={post.excerpt} likes={post.likes} />
        </div>

        <div className="mt-6 terminal-window animate-fade-in">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">tags &mdash; metadata</span>
          </div>
          <div className="terminal-body">
            <p className="terminal-line text-xs mb-3">
              <span className="prompt">$</span>
              <span className="cmd">cat .tags | grep --color</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="terminal-badge blue text-xs">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 terminal-window animate-fade-in">
          <div className="terminal-titlebar">
            <span className="terminal-dot green" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot red" />
            <span className="terminal-title">author &mdash; info</span>
          </div>
          <div className="terminal-body">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold font-mono text-terminal-prompt">
                  {post.author.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-foreground">
                  <span className="text-terminal-prompt">@</span>{post.author.name.toLowerCase().replace(/\s+/g, "_")}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {post.author.bio}
                </p>
                <Link href="/blog">
                  <button className="terminal-btn mt-3 text-xs">view all posts &rarr;</button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <RelatedPosts currentSlug={post.slug} category={post.category} allPosts={allPosts} />

        <div className="mt-6 animate-fade-in">
          <CommentsSection slug={slug} />
        </div>

        <div className="mt-6 animate-fade-in">
          <NewsletterForm />
        </div>

        <div className="mt-6 terminal-window animate-fade-in">
          <div className="terminal-titlebar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">pagination &mdash; prev/next</span>
          </div>
          <div className="terminal-body">
            <div className="flex justify-between gap-4">
              {prevPost ? (
                <Link href={`/blog/${prevPost.slug}`} className="terminal-btn flex-1 justify-start">
                  <ChevronLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs">{prevPost.title}</span>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              {nextPost ? (
                <Link href={`/blog/${nextPost.slug}`} className="terminal-btn flex-1 justify-end">
                  <span className="truncate text-xs">{nextPost.title}</span>
                  <ChevronRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
