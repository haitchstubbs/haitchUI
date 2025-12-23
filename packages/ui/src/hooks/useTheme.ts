"use client";

import { useEffect, useState } from "react";
import type { ThemeName } from "../theme/types";

type UseThemeResult = {
  theme: ThemeName | null;
  isReady: boolean;
};

/**
 * Reads the current theme from the nearest `.ui-root[data-theme]`
 */
export function useTheme(): UseThemeResult {
  const [theme, setTheme] = useState<ThemeName | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ui-root");

    if (!root) {
      setIsReady(true);
      return;
    }

    const readTheme = () => {
      const value = root.getAttribute("data-theme") as ThemeName | null;
      setTheme(value);
      setIsReady(true);
    };

    // Initial read
    readTheme();

    // Observe runtime changes (theme switchers, etc.)
    const observer = new MutationObserver(readTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return { theme, isReady };
}
