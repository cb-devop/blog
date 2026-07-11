import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostCardProps {
  title?: string;
  excerpt?: string;
  image?: string;
  date?: string;
  category?: string;
  slug?: string;
  readingTime?: string;
  className?: string;
}

export function PostCard({
  title = "Understanding Modern Web Development",
  excerpt = "A deep dive into the tools and practices that power today's fastest websites, from edge rendering to component-driven design.",
  image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  date = "Jan 15, 2024",
  category = "Technology",
  slug = "#",
  readingTime = "5 min",
  className,
}: PostCardProps) {
  return (
    <Link
      href={slug}
      className={cn(
        "terminal-window group block",
        className
      )}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <span className="absolute top-2 left-2 terminal-badge blue">
          {category}
        </span>
      </div>

      <div className="terminal-body">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-mono">
          <span>{date}</span>
          <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingTime}
          </span>
        </div>

        <h3 className="terminal-line text-sm font-semibold mb-1 group-hover:text-terminal-text transition-colors">
          <span className="prompt">$</span>
          <span className="cmd">{title}</span>
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {excerpt}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono group-hover:text-terminal-text transition-colors">
            Read article
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="text-xs text-terminal-text font-mono opacity-0 group-hover:opacity-100 transition-opacity">
            ./open
          </span>
        </div>
      </div>
    </Link>
  );
}