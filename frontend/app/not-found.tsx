"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, ArrowLeft, Home, Search, ChevronRight } from "lucide-react";

export default function NotFound() {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 5 + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[128px] animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-lg">
        {/* Terminal Card */}
        <div className="rounded-2xl border border-muted-foreground/20 bg-background/80 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 hover:border-red-500/30">
          {/* Terminal Header */}
          <div className="border-b border-muted-foreground/10 bg-gradient-to-r from-background via-muted/30 to-background">
            <div className="flex items-center gap-2 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-3 text-xs font-mono text-muted-foreground">
                guest@premiumblog:~/404
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Error Code */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="text-7xl md:text-8xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-red-400 to-amber-500">
                  404
                </div>
                <div className="absolute -top-2 -right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-500 animate-pulse">
                    ERROR
                  </span>
                </div>
              </div>
              <h1 className="text-xl font-bold text-foreground mt-4 font-mono">
                <span className="text-red-500">$</span> Page Not Found
              </h1>
              <p className="text-muted-foreground mt-2 font-mono text-sm">
                The requested resource could not be located
              </p>
            </div>

            {/* Diagnostic Output */}
            <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 font-mono text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Terminal className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-emerald-500">$</span>{" "}
                    <span className="text-blue-500">curl</span> -I{" "}
                    <span className="text-amber-500">{typeof window !== "undefined" ? window.location.pathname : "/unknown"}</span>
                  </div>
                  <div className="text-red-500">
                    <span className="text-red-500/70">❌</span> HTTP/1.1{" "}
                    <span className="font-bold text-red-500">404 Not Found</span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-violet-500">[RESOLVING]</span> Looking up route{dots}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="text-red-500">[FAILED]</span> No matching route found in{" "}
                    <span className="text-blue-500">route_table</span>
                  </div>
                  {progress < 100 ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-amber-500">[RETRY]</span> Attempting recovery...
                      <span className="text-primary font-semibold">{Math.round(progress)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <span className="text-emerald-500">[INFO]</span> Suggesting alternatives below
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-200 ease-out"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium font-mono text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                <Home className="h-4 w-4" />
                ./go_home.sh
              </Link>
              <Link
                href="/blog"
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-input bg-background font-medium font-mono text-sm hover:bg-muted transition-colors"
              >
                <Search className="h-4 w-4" />
                ./browse_blog.sh
              </Link>
            </div>

            {/* Quick Links */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-3">
                <ChevronRight className="h-3 w-3 text-primary" />
                <span>suggested_pages</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: "/blog", label: "Blog" },
                  { href: "/about", label: "About" },
                  { href: "/contact", label: "Contact" },
                  { href: "/privacy", label: "Privacy" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-muted-foreground/10 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:border-primary/30"
                  >
                    <ArrowLeft className="h-3 w-3 rotate-180 text-primary/70" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
