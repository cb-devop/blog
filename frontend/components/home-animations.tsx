"use client";

import { useEffect, useState, useRef } from "react";

// ─── TypingText: types out text character by character ───
export function TypingText({
  lines,
  className = "",
  speed = 40,
  onComplete,
}: {
  lines: string[];
  className?: string;
  speed?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState<string[]>(lines.map(() => ""));
  const [done, setDone] = useState(false);

  useEffect(() => {
    let currentLine = 0;
    let currentChar = 0;
    let timer: NodeJS.Timeout;

    const type = () => {
      if (currentLine >= lines.length) {
        setDone(true);
        onComplete?.();
        return;
      }
      const line = lines[currentLine];
      if (currentChar <= line.length) {
        setDisplayed((prev) => {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentChar);
          return next;
        });
        currentChar++;
        timer = setTimeout(type, speed + Math.random() * speed);
      } else {
        currentLine++;
        currentChar = 0;
        timer = setTimeout(type, speed * 2);
      }
    };
    timer = setTimeout(type, 300);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={className}>
      {displayed.map((text, i) => (
        <p key={i} className="terminal-line text-sm md:text-base">
          <span className="prompt">$</span>
          <span className="cmd">{text}</span>
          {!done && i === displayed.length - 1 && (
            <span className="inline-block w-[0.45em] h-[1.1em] bg-terminal-text align-text-bottom ml-[1px] animate-pulse" />
          )}
        </p>
      ))}
    </div>
  );
}

// ─── StaggerCards: animated entrance for post cards ───
export function StaggerCards({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cards = el.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    Array.from(cards).forEach((card, i) => {
      (card as HTMLElement).style.opacity = "0";
      (card as HTMLElement).style.transform = "translateY(24px)";
      (card as HTMLElement).style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {children}
    </div>
  );
}

// ─── MatrixRain: subtle green characters falling in background ───
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);

    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/{}[]|&^%$#@!";

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(34, 197, 94, 0.08)";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        if (y > 0 && y < canvas.height) {
          ctx.fillText(char, x, y);
        }
        drops[i]++;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
    />
  );
}


