"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Type,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Keyboard,
} from "lucide-react";

interface ReadingControlsProps {
  onFontSizeChange?: (size: number) => void;
  onLineHeightChange?: (height: number) => void;
  onFocusModeChange?: (focused: boolean) => void;
}

export function ReadingControls({
  onFontSizeChange,
  onLineHeightChange,
  onFocusModeChange,
}: ReadingControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [focusMode, setFocusMode] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Apply font size and line height to article content
  useEffect(() => {
    const article = document.querySelector(".article-content") as HTMLElement;
    if (!article) return;
    article.style.fontSize = `${fontSize}px`;
    article.style.lineHeight = `${lineHeight}`;
  }, [fontSize, lineHeight]);

  // Focus mode: dim everything except article content
  useEffect(() => {
    const article = document.querySelector(".article-content") as HTMLElement;
    if (!article) return;

    if (focusMode) {
      document.body.classList.add("focus-mode");
      article.style.opacity = "1";
      article.style.transition = "opacity 0.3s ease";
    } else {
      document.body.classList.remove("focus-mode");
      article.style.opacity = "";
    }

    return () => {
      document.body.classList.remove("focus-mode");
    };
  }, [focusMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key) {
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            setFocusMode((prev) => !prev);
          }
          break;
        case "+":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            increaseFontSize();
          }
          break;
        case "-":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            decreaseFontSize();
          }
          break;
        case "?":
          setShowShortcuts((prev) => !prev);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [fontSize, lineHeight]);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const newSize = Math.min(prev + 2, 24);
      onFontSizeChange?.(newSize);
      return newSize;
    });
  }, [onFontSizeChange]);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => {
      const newSize = Math.max(prev - 2, 12);
      onFontSizeChange?.(newSize);
      return newSize;
    });
  }, [onFontSizeChange]);

  const increaseLineHeight = useCallback(() => {
    setLineHeight((prev) => {
      const newHeight = Math.min(prev + 0.2, 2.4);
      onLineHeightChange?.(newHeight);
      return newHeight;
    });
  }, [onLineHeightChange]);

  const decreaseLineHeight = useCallback(() => {
    setLineHeight((prev) => {
      const newHeight = Math.max(prev - 0.2, 1.4);
      onLineHeightChange?.(newHeight);
      return newHeight;
    });
  }, [onLineHeightChange]);

  const resetSettings = useCallback(() => {
    setFontSize(16);
    setLineHeight(1.8);
    setFocusMode(false);
  }, []);

  return (
    <>
      {/* Floating control button */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2">
        {/* Control panel */}
        {isOpen && (
          <div className="mb-2 p-3 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-xl animate-scale-in min-w-[200px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Reading Controls
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close controls"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <Type className="h-3 w-3" />
                  Font Size
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {fontSize}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseFontSize}
                  className="p-1.5 rounded-md border border-border hover:bg-muted hover:border-ring transition-all text-muted-foreground hover:text-foreground"
                  aria-label="Decrease font size"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="flex-1 h-1.5 rounded-full bg-muted relative">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${((fontSize - 12) / (24 - 12)) * 100}%`,
                    }}
                  />
                </div>
                <button
                  onClick={increaseFontSize}
                  className="p-1.5 rounded-md border border-border hover:bg-muted hover:border-ring transition-all text-muted-foreground hover:text-foreground"
                  aria-label="Increase font size"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                  <span className="text-[10px] leading-none">¶</span>
                  Line Spacing
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {lineHeight.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={decreaseLineHeight}
                  className="p-1.5 rounded-md border border-border hover:bg-muted hover:border-ring transition-all text-muted-foreground hover:text-foreground"
                  aria-label="Decrease line height"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <div className="flex-1 h-1.5 rounded-full bg-muted relative">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${((lineHeight - 1.4) / (2.4 - 1.4)) * 100}%`,
                    }}
                  />
                </div>
                <button
                  onClick={increaseLineHeight}
                  className="p-1.5 rounded-md border border-border hover:bg-muted hover:border-ring transition-all text-muted-foreground hover:text-foreground"
                  aria-label="Increase line height"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Focus Mode */}
            <div className="mb-3">
              <button
                onClick={() => setFocusMode((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md border transition-all text-xs font-mono ${
                  focusMode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  {focusMode ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                  Focus Mode
                </span>
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">
                  F
                </kbd>
              </button>
            </div>

            {/* Keyboard Shortcuts Toggle */}
            <div className="mb-2">
              <button
                onClick={() => setShowShortcuts((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-border text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <span className="flex items-center gap-2">
                  <Keyboard className="h-3.5 w-3.5" />
                  Keyboard Shortcuts
                </span>
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">
                  ?
                </kbd>
              </button>
            </div>

            {/* Shortcuts List */}
            {showShortcuts && (
              <div className="mb-3 p-2 rounded-md bg-muted/50 border border-border">
                <div className="space-y-1.5">
                  {[
                    { key: "F", desc: "Toggle Focus Mode" },
                    { key: "+", desc: "Increase font size" },
                    { key: "-", desc: "Decrease font size" },
                    { key: "?", desc: "Toggle shortcuts" },
                  ].map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between text-[10px] font-mono"
                    >
                      <span className="text-muted-foreground">
                        {shortcut.desc}
                      </span>
                      <kbd className="px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={resetSettings}
              className="w-full text-center text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors pt-1 border-t border-border"
            >
              Reset to defaults
            </button>
          </div>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={`p-2.5 rounded-xl border shadow-lg transition-all duration-300 ${
            isOpen
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background/90 backdrop-blur-md border-border hover:border-ring hover:bg-muted/80 text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Reading controls"
          title="Reading Controls (?)"
        >
          <Type className="h-4 w-4" />
        </button>
      </div>
    </>
  );
}