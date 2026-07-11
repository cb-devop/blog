"use client";

import { useState, useEffect } from "react";
import { ArrowUpToLine, Terminal } from "lucide-react";

export function TerminalOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-4 right-4 z-50 h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center group ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      title="Back to top"
      aria-label="Back to top"
    >
      <ArrowUpToLine className="h-5 w-5" />
      <span className="absolute -top-8 right-0 text-xs bg-foreground text-background px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-mono">
        go to top
      </span>
    </button>
  );
}
