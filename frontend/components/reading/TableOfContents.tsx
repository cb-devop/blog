"use client";

import { useState, useEffect, useRef } from "react";
import { List, ChevronRight } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Wait for DOM to render article content using requestAnimationFrame
    const checkDom = () => {
      const article = document.querySelector(".article-content");
      if (!article) {
        rafRef.current = requestAnimationFrame(checkDom);
        return;
      }

      const elements = article.querySelectorAll("h2, h3");
      const items: TOCItem[] = [];

      elements.forEach((el) => {
        const text = el.textContent || "";
        const level = el.tagName === "H2" ? 2 : 3;
        if (!el.id) {
          el.id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        }
        items.push({ id: el.id, text, level });
      });

      setHeadings(items);
    };

    rafRef.current = requestAnimationFrame(checkDom);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [content]);

  // Track active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 100;
      let current = headings[headings.length - 1]?.id;

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el && el.offsetTop <= scrollPos) {
          current = headings[i].id;
          break;
        }
      }

      setActiveId((prev) => (prev !== current ? current : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <div className="mb-8">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="terminal-btn w-full flex items-center justify-between text-xs"
      >
        <span className="flex items-center gap-2">
          <List className="h-3.5 w-3.5" />
          Table of Contents
        </span>
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isCollapsed ? "" : "rotate-90"
          }`}
        />
      </button>

      {!isCollapsed && (
        <nav className="mt-2 border border-border rounded-lg bg-muted/30 p-3 max-h-[300px] overflow-y-auto">
          <ul className="space-y-1">
            {headings.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full text-left text-xs font-mono px-2 py-1.5 rounded transition-all ${
                    activeId === item.id
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border-l-2 border-transparent"
                  }`}
                  style={{ paddingLeft: `${(item.level - 2) * 12 + 8}px` }}
                >
                  <span className="text-terminal-prompt mr-1">
                    {item.level === 2 ? "##" : "###"}
                  </span>
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
