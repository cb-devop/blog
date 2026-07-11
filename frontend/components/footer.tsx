"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send, Link2, Share2, Rss, Mail, Check, Loader2, Terminal, ChevronRight
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const footerSections = [
    {
      title: "company",
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/disclaimer", label: "Disclaimer" },
      ],
    },
    {
      title: "resources",
      links: [
        { href: "/blog", label: "All Articles" },
        { href: "/blog/getting-started-nextjs-14", label: "Next.js 14 Guide" },
        { href: "/blog/modern-css-techniques-2026", label: "CSS Techniques" },
        { href: "/blog/building-scalable-apis", label: "API Development" },
      ],
    },
  ];

  const socialLinks = [
    { href: "https://twitter.com", icon: Send, label: "Twitter" },
    { href: "https://github.com", icon: Link2, label: "GitHub" },
    { href: "https://linkedin.com", icon: Share2, label: "LinkedIn" },
    { href: "https://instagram.com", icon: Rss, label: "Instagram" },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand - Terminal Style */}
          <div className="md:col-span-1">
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">about.sh</span>
              </div>
              <div className="terminal-body space-y-3">
                <p className="terminal-line text-xs">
                  <span className="prompt">$</span>
                  <span className="cmd">PremiumBlog v1.0.0</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A premium blog and informational portal dedicated to sharing knowledge and insights with developers and makers.
                </p>
                <div className="flex gap-2 pt-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="terminal-btn text-xs px-2.5 py-1.5"
                    >
                      <social.icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Company Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <div className="terminal-window">
                <div className="terminal-titlebar">
                  <span className="terminal-dot green" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot red" />
                  <span className="terminal-title">ls {section.title}/</span>
                </div>
                <div className="terminal-body">
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="terminal-line text-xs hover:bg-muted rounded px-1 -mx-1 transition-colors"
                        >
                          <span className="prompt">$</span>
                          <span className="cmd hover:text-terminal-text transition-colors">
                            cd {link.label.toLowerCase()}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <div className="terminal-window">
              <div className="terminal-titlebar">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
                <span className="terminal-title">subscribe.sh</span>
              </div>
              <div className="terminal-body">
                {success ? (
                  <div className="text-center py-4">
                    <Check className="h-8 w-8 text-terminal-text mx-auto mb-2" />
                    <p className="text-sm font-mono text-terminal-text">✓ Subscribed!</p>
                    <p className="text-xs text-muted-foreground mt-1">Thank you for joining.</p>
                  </div>
                ) : (
                  <>
                    <p className="terminal-line text-xs mb-4">
                      <span className="prompt">$</span>
                      <span className="cmd">echo &quot;Stay updated&quot;</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Subscribe to our newsletter for the latest updates and articles.
                    </p>
                    <form onSubmit={handleSubscribe} className="space-y-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="terminal-input text-xs"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="terminal-btn primary w-full justify-center text-xs"
                      >
                        {loading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                        {loading ? "./processing..." : "./subscribe"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <div className="terminal-line justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="text-terminal-prompt">$</span> echo &copy;{currentYear} PremiumBlog
            </span>
            <span className="text-muted-foreground hidden sm:block">
              <span className="text-terminal-text">✓</span> Built with Next.js
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}