"use client";

import { useState, useEffect, useRef } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      if (scrollHeight <= 0) return;

      const pct = Math.min((scrollPosition / scrollHeight) * 100, 100);
      setProgress(pct);
    };

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Click on progress bar to go to top/bottom
  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = pct * scrollHeight;

    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <>
      {/* Thin progress bar at top */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-muted/30 cursor-pointer group"
        onClick={handleClick}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-primary via-terminal-text to-primary transition-all duration-150 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          {/* Glow effect */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-primary/50 blur-sm" />
        </div>
        {/* Hover handle */}
        <div
          className="absolute top-0 bottom-0 w-4 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%` }}
        >
          <div className="w-2 h-2 rounded-full bg-primary mx-auto mt-[-2px]" />
        </div>
      </div>

    </>
  );
}
