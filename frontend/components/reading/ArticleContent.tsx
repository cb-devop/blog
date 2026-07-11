"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function ArticleContent({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Inject heading anchors, process images, add drop caps
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Process headings: add anchor links ---
    const headings = container.querySelectorAll("h2, h3, h4");
    headings.forEach((heading) => {
      if (heading.querySelector(".heading-anchor")) return; // skip if already processed

      const text = heading.textContent || "";
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        || "section";

      heading.id = id;

      const anchor = document.createElement("a");
      anchor.href = `#${id}`;
      anchor.className = "heading-anchor ml-2 opacity-0 group-hover:opacity-100 transition-opacity no-underline inline-flex items-center";
      anchor.setAttribute("aria-label", `Link to ${text}`);
      anchor.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;

      heading.classList.add("group", "relative");
      heading.appendChild(anchor);

      // Click handler to copy link
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(url).catch(() => {});
        window.history.pushState(null, "", `#${id}`);

        // Visual feedback
        const btn = anchor;
        btn.classList.add("text-terminal-text");
        setTimeout(() => btn.classList.remove("text-terminal-text"), 1500);
      });
    });

    // --- Process images: add lightbox capability ---
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      if (img.closest(".code-block-wrapper") || img.dataset.processed) return;
      img.dataset.processed = "true";

      img.classList.add("cursor-pointer", "transition-all", "duration-300", "hover:ring-2", "hover:ring-primary/50", "hover:scale-[1.02]", "active:scale-[0.98]");

      // Add zoom icon overlay on hover
      const wrapper = document.createElement("div");
      wrapper.className = "relative inline-block max-w-full my-8";
      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      const zoomIcon = document.createElement("div");
      zoomIcon.className = "absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none";
      zoomIcon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>`;
      wrapper.classList.add("group");
      wrapper.appendChild(zoomIcon);

      img.addEventListener("click", () => {
        setLightboxSrc(img.src);
      });
    });

    // --- Process first paragraph for drop cap ---
    const firstParagraph = container.querySelector("p:first-of-type");
    if (firstParagraph && !firstParagraph.classList.contains("lead") && !firstParagraph.querySelector(".drop-cap")) {
      const firstChar = firstParagraph.textContent?.charAt(0);
      if (firstChar && /[A-Za-z]/.test(firstChar)) {
        firstParagraph.classList.add("first-paragraph");
      }
    }

    // --- Add reading time markers ---
    const allParagraphs = container.querySelectorAll("p");
    const totalParas = allParagraphs.length;
    if (totalParas > 8) {
      const midPoint = Math.floor(totalParas / 2);
      const midPara = allParagraphs[midPoint];
      if (midPara && !midPara.querySelector(".reading-marker")) {
        const marker = document.createElement("div");
        marker.className = "reading-marker flex items-center gap-2 my-8";
        marker.innerHTML = `
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
          <span class="text-[10px] font-mono text-muted-foreground tracking-widest uppercase px-3">Continue Reading</span>
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
        `;
        midPara.parentNode?.insertBefore(marker, midPara.nextSibling);
      }
    }

  }, [content]);

  // Close lightbox on escape
  useEffect(() => {
    if (!lightboxSrc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxSrc(null);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxSrc]);

  return (
    <>
      {/* Image Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            onClick={() => setLightboxSrc(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-background/20 backdrop-blur-sm border border-white/20 text-white hover:bg-background/40 transition-all z-10"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxSrc}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Article Content */}
      <div
        ref={containerRef}
        id="article-content"
        className="article-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
