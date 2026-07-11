"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Phase = "typing" | "paused" | "erasing";

export function LiveLogo() {
  const text = "cd ~/pb";
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [showCursor, setShowCursor] = useState(true);
  const [glow, setGlow] = useState(false);

  // Blink cursor during typing/erasing, hide during pause
  useEffect(() => {
    if (phase === "paused") {
      setShowCursor(false);
    } else {
      const interval = setInterval(() => setShowCursor((c) => !c), 530);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Glow pulse on $ every 4s regardless of phase
  const glowRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const pulse = setInterval(() => {
      setGlow(true);
      glowRef.current = setTimeout(() => setGlow(false), 600);
    }, 4000);
    return () => {
      clearInterval(pulse);
      if (glowRef.current) clearTimeout(glowRef.current);
    };
  }, []);

  // Typing animation loop
  useEffect(() => {
    if (phase === "typing" && displayed.length < text.length) {
      const t = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length + 1)),
        60 + Math.random() * 60
      );
      return () => clearTimeout(t);
    }
    if (displayed.length === text.length && phase === "typing") {
      const t = setTimeout(() => setPhase("paused"), 2500);
      return () => clearTimeout(t);
    }
    if (phase === "paused") {
      const t = setTimeout(() => setPhase("erasing"), 200);
      return () => clearTimeout(t);
    }
    if (phase === "erasing" && displayed.length > 0) {
      const t = setTimeout(
        () => setDisplayed(text.slice(0, displayed.length - 1)),
        30
      );
      return () => clearTimeout(t);
    }
    if (displayed.length === 0 && phase === "erasing") {
      const t = setTimeout(() => setPhase("typing"), 400);
      return () => clearTimeout(t);
    }
  }, [displayed, phase, text]);

  return (
    <Link href="/" className="flex items-center gap-1 sm:gap-2 group min-w-0 flex-shrink overflow-hidden">
      <span className="text-terminal-text font-mono text-xs sm:text-sm truncate relative">
        <span
          className={`text-terminal-prompt transition-all duration-300 ${
            glow ? "drop-shadow-[0_0_6px_hsl(39_100%_60%)]" : ""
          }`}
        >
          ${" "}
        </span>
        {displayed}
        {showCursor && (
          <span className="inline-block w-[0.5em] h-[1.1em] bg-terminal-text align-text-bottom ml-[1px] animate-pulse" />
        )}
      </span>
      <span
        className={`text-xs text-muted-foreground hidden sm:inline font-mono transition-all duration-300 ${
          glow ? "text-terminal-text drop-shadow-[0_0_4px_hsl(143_70%_65%)]" : ""
        }`}
      >
        [main]
      </span>
    </Link>
  );
}