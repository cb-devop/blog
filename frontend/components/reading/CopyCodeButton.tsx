"use client";

import { useEffect, useRef } from "react";
import hljs from "highlight.js";

// Register common languages for better detection
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import java from "highlight.js/lib/languages/java";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";

// Register all languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("java", java);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);

// Language aliases map for display names
const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  json: "JSON",
  css: "CSS",
  html: "HTML",
  xml: "XML",
  java: "Java",
  go: "Go",
  rust: "Rust",
};

function detectLanguage(pre: HTMLPreElement): string {
  // Try to detect from class name on <code>
  const code = pre.querySelector("code");
  if (code) {
    const cls = code.className || "";
    const match = cls.match(/language-(\w+)/);
    if (match) return match[1].toLowerCase();
  }
  // Try to detect from content
  const text = pre.textContent || "";
  if (text.includes("<!DOCTYPE") || text.includes("<html")) return "html";
  if (text.includes("function ") && text.includes("=>")) return "javascript";
  if (text.includes("import ") && (text.includes(" from ") || text.includes("require"))) return "javascript";
  if ((text.includes("interface ") || text.includes(": string") || text.includes(": number")) && text.includes("const ")) return "typescript";
  if (text.includes("def ") || text.includes("class ") && text.includes(":") || text.includes("import ") && text.includes(":")) return "python";
  if (text.includes("npm ") || text.includes("npx ") || text.startsWith("$ ") || text.startsWith("# ")) return "bash";
  if (text.includes("SELECT ") || text.includes("CREATE TABLE") || text.includes("INSERT INTO")) return "sql";
  if ((text.includes("{") && text.includes("}")) && (text.includes(":") || text.includes(",")) && !text.includes(";")) return "json";
  if (text.includes("margin:") || text.includes("display:") || text.includes("@media")) return "css";
  if (text.includes("func ") || text.includes("package main")) return "go";
  if (text.includes("fn ") || text.includes("let mut") || text.includes("impl ")) return "rust";
  if (text.includes("public class") || text.includes("System.out") || text.includes("@Override")) return "java";
  return "plaintext";
}

function getLanguageDisplayName(lang: string): string {
  return LANGUAGE_DISPLAY_NAMES[lang.toLowerCase()] || lang;
}

/**
 * Highlight a code element using highlight.js.
 * Returns the detected language name (lowercase) or "plaintext" if detection failed.
 */
function highlightCode(codeElement: HTMLElement, pre: HTMLPreElement): string {
  const lang = detectLanguage(pre);
  
  if (lang && lang !== "plaintext") {
    try {
      // If a specific language is detected, try to highlight with it
      if (hljs.getLanguage(lang)) {
        hljs.highlightElement(codeElement);
        return lang;
      }
    } catch {
      // Fall through to auto-detection
    }
  }
  
  // Auto-detect
  try {
    const result = hljs.highlightAuto(pre.textContent || "");
    if (result.language) {
      codeElement.className = `language-${result.language}`;
      codeElement.innerHTML = result.value;
      return result.language;
    }
  } catch {
    // Ignore highlighting errors
  }
  
  return "plaintext";
}

export function CopyCodeButton({ content }: { content: string }) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | null = null;

    const processBlock = (pre: HTMLPreElement) => {
      if (pre.dataset.codeBlock === "processed") return;
      pre.dataset.codeBlock = "processed";

      let code = pre.querySelector("code");
      if (!code) {
        code = document.createElement("code");
        code.textContent = pre.textContent;
        pre.textContent = "";
        pre.appendChild(code);
      }

      const lang = highlightCode(code as HTMLElement, pre);
      const displayLang = getLanguageDisplayName(lang);

      const wrapper = document.createElement("div");
      wrapper.className =
        "code-block-wrapper rounded-lg border border-border overflow-hidden mb-5 mt-4";

      const header = document.createElement("div");
      header.className =
        "code-block-header flex items-center justify-between px-4 py-2 bg-muted/60 border-b border-border";

      const langLabel = document.createElement("div");
      langLabel.className = "flex items-center gap-2";

      const langIcon = document.createElement("span");
      langIcon.className = "code-lang-icon";
      langIcon.textContent = lang.substring(0, 2).toUpperCase();
      langIcon.style.cssText =
        "background: color-mix(in srgb, var(--color-terminal-text) 15%, transparent);" +
        "color: var(--color-terminal-text);width:18px;height:18px;border-radius:3px;" +
        "display:flex;align-items:center;justify-content:center;font-size:8px;" +
        "font-weight:700;flex-shrink:0;";
      langLabel.appendChild(langIcon);

      const langText = document.createElement("span");
      langText.className =
        "text-xs font-mono text-muted-foreground uppercase tracking-wider";
      langText.textContent = displayLang;
      langLabel.appendChild(langText);

      header.appendChild(langLabel);

      const copyBtn = document.createElement("button");
      copyBtn.className =
        "copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md " +
        "text-xs font-mono border border-border " +
        "bg-background hover:bg-accent hover:border-ring " +
        "text-muted-foreground hover:text-foreground " +
        "transition-all duration-200 active:scale-95";
      copyBtn.setAttribute("aria-label", "Copy code to clipboard");
      copyBtn.title = "Copy code (Ctrl+C)";

      const copySvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      copySvg.setAttribute("width", "13");
      copySvg.setAttribute("height", "13");
      copySvg.setAttribute("viewBox", "0 0 24 24");
      copySvg.setAttribute("fill", "none");
      copySvg.setAttribute("stroke", "currentColor");
      copySvg.setAttribute("stroke-width", "2");
      copySvg.classList.add("copy-icon");
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", "9");
      rect.setAttribute("y", "9");
      rect.setAttribute("width", "13");
      rect.setAttribute("height", "13");
      rect.setAttribute("rx", "2");
      rect.setAttribute("ry", "2");
      copySvg.appendChild(rect);
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      );
      copySvg.appendChild(path);
      copyBtn.appendChild(copySvg);

      const copyText = document.createElement("span");
      copyText.className = "copy-text";
      copyText.textContent = "Copy";
      copyBtn.appendChild(copyText);

      const checkSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      checkSvg.setAttribute("width", "13");
      checkSvg.setAttribute("height", "13");
      checkSvg.setAttribute("viewBox", "0 0 24 24");
      checkSvg.setAttribute("fill", "none");
      checkSvg.setAttribute("stroke", "currentColor");
      checkSvg.setAttribute("stroke-width", "2");
      checkSvg.classList.add("check-icon");
      checkSvg.style.display = "none";
      const polyline = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "polyline"
      );
      polyline.setAttribute("points", "20 6 9 17 4 12");
      checkSvg.appendChild(polyline);
      copyBtn.appendChild(checkSvg);

      const showCopied = () => {
        const icon = copyBtn.querySelector(".copy-icon") as HTMLElement;
        const check = copyBtn.querySelector(".check-icon") as HTMLElement;
        const textSpan = copyBtn.querySelector(".copy-text") as HTMLElement;
        if (icon) icon.style.display = "none";
        if (check) check.style.display = "block";
        if (textSpan) textSpan.textContent = "Copied!";
        copyBtn.style.borderColor = "var(--color-terminal-text)";
        copyBtn.style.color = "var(--color-terminal-text)";
        setTimeout(() => {
          if (icon) icon.style.display = "block";
          if (check) check.style.display = "none";
          if (textSpan) textSpan.textContent = "Copy";
          if (document.body.contains(copyBtn)) {
            copyBtn.style.borderColor = "";
            copyBtn.style.color = "";
          }
        }, 2000);
      };

      const doCopy = async () => {
        const codeEl = pre.querySelector("code");
        const text = codeEl?.textContent || pre.textContent || "";
        try {
          await navigator.clipboard.writeText(text);
          showCopied();
          return;
        } catch {
          // clipboard API unavailable (insecure context) - use fallback
        }
        try {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          showCopied();
        } catch {
          // last resort: select the code text for manual copy
          const range = document.createRange();
          range.selectNodeContents(pre.querySelector("code") || pre);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      };

      copyBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        doCopy();
      });

      // Keyboard copy: when the code block is focused, Ctrl/Cmd+C copies
      // the entire block (no manual selection needed).
      pre.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
          const sel = window.getSelection();
          const hasSelection = sel && sel.toString().length > 0;
          // If the user already selected specific text, let the browser copy
          // that selection instead of the whole block.
          if (hasSelection) return;
          e.preventDefault();
          doCopy();
        }
      });

      header.appendChild(copyBtn);
      wrapper.appendChild(header);

      pre.style.margin = "0";
      pre.style.border = "none";
      pre.style.borderRadius = "0";
      pre.style.background = "var(--color-terminal-bg)";
      pre.style.padding = "1rem 1.25rem";
      pre.style.overflowX = "auto";
      pre.style.position = "relative";
      pre.style.fontSize = "13px";
      pre.style.lineHeight = "1.65";
      // make pre focusable so Ctrl+C works on it
      pre.setAttribute("tabindex", "0");

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
    };

    const addedWrappers: HTMLDivElement[] = [];

    const processAll = () => {
      const article = document.querySelector(".article-content");
      if (!article) return false;
      const codeBlocks = article.querySelectorAll<HTMLPreElement>("pre");
      if (codeBlocks.length === 0) return false;
      codeBlocks.forEach((pre) => {
        processBlock(pre);
        const wrapper = pre.closest(".code-block-wrapper") as HTMLDivElement | null;
        if (wrapper) addedWrappers.push(wrapper);
      });
      return true;
    };

    // Try immediately, then retry a few times (covers slow client hydration),
    // finally watch the DOM for any code blocks added later.
    const trySchedule = [0, 50, 200, 600];
    let attempt = 0;

    const attemptRun = () => {
      if (cancelled) return;
      if (processAll()) {
        // success - stop scheduling, but observe for future additions
        startObserver();
        return;
      }
      attempt++;
      if (attempt < trySchedule.length) {
        setTimeout(attemptRun, trySchedule[attempt]);
      } else {
        // no code blocks found yet; observe DOM for late-injected content
        startObserver();
      }
    };

    const startObserver = () => {
      if (observer || cancelled) return;
      const article = document.querySelector(".article-content");
      if (!article) return;
      observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            const el = node as HTMLElement;
            if (el.tagName === "PRE") {
              processBlock(el as HTMLPreElement);
              const wrapper = el.closest(".code-block-wrapper") as HTMLDivElement | null;
              if (wrapper && !addedWrappers.includes(wrapper)) {
                addedWrappers.push(wrapper);
              }
            } else {
              const pres = el.querySelectorAll?.("pre") || [];
              pres.forEach((pre) => {
                processBlock(pre as HTMLPreElement);
                const wrapper = pre.closest(".code-block-wrapper") as HTMLDivElement | null;
                if (wrapper && !addedWrappers.includes(wrapper)) {
                  addedWrappers.push(wrapper);
                }
              });
            }
          });
        }
      });
      observer.observe(article, { childList: true, subtree: true });
    };

    setTimeout(attemptRun, trySchedule[0]);

    cleanupRef.current = () => {
      cancelled = true;
      observer?.disconnect();
      observer = null;
      addedWrappers.forEach((wrapper) => {
        const pre = wrapper.querySelector("pre");
        if (pre) {
          pre.style.margin = "";
          pre.style.border = "";
          pre.style.borderRadius = "";
          pre.style.background = "";
          pre.style.padding = "";
          pre.style.overflowX = "";
          pre.style.position = "";
          pre.style.fontSize = "";
          pre.style.lineHeight = "";
          pre.removeAttribute("tabindex");
          delete pre.dataset.codeBlock;
          if (wrapper.parentNode) {
            wrapper.parentNode.insertBefore(pre, wrapper);
          }
        }
        wrapper.remove();
      });
    };

    return () => {
      cancelled = true;
      observer?.disconnect();
      observer = null;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [content]);

  return null;
}
