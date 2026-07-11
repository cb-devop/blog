"use client";

import { useState } from "react";
import { Check, Link, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";

interface SocialShareProps {
  title: string;
  slug: string;
  excerpt?: string;
  likes?: number;
}

export function SocialShare({ title, slug, excerpt, likes = 0 }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(0);

  const handleLike = () => {
    if (liked === "up") {
      setLiked(null);
      setLikeCount((c) => c - 1);
    } else {
      if (liked === "down") setDislikeCount((c) => c - 1);
      setLiked("up");
      setLikeCount((c) => c + 1);
    }
  };

  const handleDislike = () => {
    if (liked === "down") {
      setLiked(null);
      setDislikeCount((c) => c - 1);
    } else {
      if (liked === "up") setLikeCount((c) => c - 1);
      setLiked("down");
      setDislikeCount((c) => c + 1);
    }
  };

  const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Twitter / X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "hover:text-white hover:border-white/40",
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "hover:text-blue-500 hover:border-blue-500/40",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "hover:text-blue-600 hover:border-blue-600/40",
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: "hover:text-green-500 hover:border-green-500/40",
    },
    {
      name: "Reddit",
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.633 4.906 1.545a1.984 1.984 0 0 1 1.282-.474c1.104 0 2 .896 2 2a1.998 1.998 0 0 1-2.66 1.875 7.083 7.083 0 0 1-3.388 3.476 7.05 7.05 0 0 1-4.833.364c-.038-.013-.076-.024-.114-.037a1.5 1.5 0 0 1-.094.008c-.532 0-1.03-.225-1.38-.59-.353-.367-.553-.856-.553-1.375 0-1.104.896-2 2-2 .718 0 1.347.38 1.704.934a5.683 5.683 0 0 1 2.47-1.365l.88-4.116a.3.3 0 0 1 .252-.242l3.987-.802s.005-.004.008-.006zm-4.206 6.245c-.44 0-.796.356-.796.796a.795.795 0 1 0 1.592 0 .795.795 0 0 0-.796-.796zm3.676 2.426a.806.806 0 0 0-.793.793.806.806 0 0 0 .793.793.806.806 0 0 0 .793-.793.806.806 0 0 0-.793-.793zm-6.003.577c-.44 0-.796.356-.796.796a.795.795 0 1 0 1.592 0 .795.795 0 0 0-.796-.796zm3.676 2.426a.806.806 0 0 0-.793.793.806.806 0 0 0 .793.793.806.806 0 0 0 .793-.793.806.806 0 0 0-.793-.793z" />
        </svg>
      ),
      color: "hover:text-orange-500 hover:border-orange-500/40",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="terminal-window animate-fade-in">
      <div className="terminal-titlebar">
        <span className="terminal-dot blue" />
        <span className="terminal-dot yellow" />
        <span className="terminal-dot green" />
        <span className="terminal-title">share &mdash; social</span>
      </div>
      <div className="terminal-body">
        <p className="terminal-line text-xs mb-4">
          <span className="prompt">$</span>
          <span className="cmd">./share.sh --platform &quot;all&quot; --url &quot;{slug}&quot;</span>
        </p>

        {/* Like / Dislike */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
          <button
            onClick={handleLike}
            className={`terminal-btn gap-1.5 text-xs ${
              liked === "up"
                ? "border-terminal-prompt text-terminal-prompt bg-terminal-prompt/10"
                : "hover:text-terminal-prompt hover:border-terminal-prompt/40"
            }`}
            title="Like this post"
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${liked === "up" ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleDislike}
            className={`terminal-btn gap-1.5 text-xs ${
              liked === "down"
                ? "border-red-500 text-red-500 bg-red-500/10"
                : "hover:text-red-400 hover:border-red-400/40"
            }`}
            title="Dislike this post"
          >
            <ThumbsDown className={`h-3.5 w-3.5 ${liked === "down" ? "fill-current" : ""}`} />
            <span>{dislikeCount}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`terminal-btn gap-2 text-xs ${link.color}`}
              title={`Share on ${link.name}`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.name}</span>
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </a>
          ))}
          <button
            onClick={copyLink}
            className={`terminal-btn gap-2 text-xs ${copied ? "border-terminal-text text-terminal-text" : "hover:text-terminal-text hover:border-terminal-text/40"}`}
            title="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            {copied ? "copied!" : "copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
