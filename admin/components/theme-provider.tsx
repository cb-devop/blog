"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Polyfill for matchMedia.addListener which is deprecated and may be missing
// in some environments with React 19 / Next.js 16
if (typeof window !== "undefined") {
  const _matchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    const mql = _matchMedia(query);
    if (mql && !mql.addListener) {
      mql.addListener = (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => {
        mql.addEventListener("change", listener);
      };
    }
    if (mql && !mql.removeListener) {
      mql.removeListener = (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => unknown) => {
        mql.removeEventListener("change", listener);
      };
    }
    return mql;
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
