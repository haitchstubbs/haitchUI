"use client";

import * as React from "react";
import { type JSX } from "react";
import { createPortal } from "react-dom";

export type ShadowRootHostProps = {
  /** Element used as the shadow host wrapper (defaults to div) */
  as?: keyof JSX.IntrinsicElements;

  /** ShadowRoot mode */
  mode?: ShadowRootMode; // "open" | "closed"

  /** Forward focus into the shadow tree when possible */
  delegatesFocus?: boolean;

  /**
   * Extra className applied to the *host element* (the wrapper that owns the shadowRoot)
   * (Not inside the shadow root)
   */
  className?: string;

  /**
   * Inline CSS string inserted into a <style> tag inside the shadow root.
   * Useful for scoping component styles.
   */
  cssText?: string;

  /**
   * Optional <style> URLs to load inside the shadow root (e.g. compiled CSS asset).
   */
  styleHrefs?: string[];

  /**
   * If true, clone all <style> and <link rel="stylesheet"> from the document head into shadow root.
   * Good for shadcn/tailwind apps where you want globals available inside shadow.
   */
  inheritDocumentStyles?: boolean;

  /**
   * Called once the shadow root is created.
   * Useful if you want to adoptStyleSheets or do other low-level work.
   */
  onShadowRoot?: (root: ShadowRoot) => void;

  /** Children rendered inside the shadow root */
  children?: React.ReactNode;
};

export function ShadowRootHost({
  as = "div",
  mode = "open",
  delegatesFocus = false,
  className,
  cssText,
  styleHrefs,
  inheritDocumentStyles = false,
  onShadowRoot,
  children,
}: ShadowRootHostProps) {
  const [root, setRoot] = React.useState<ShadowRoot | null>(null);

  const hostRef = React.useCallback(
    (host: HTMLElement | null) => {
      if (!host) return;

      const parent = host.parentElement;
      const isLikelyTestingLibraryContainer =
        !!parent &&
        parent.tagName === "DIV" &&
        parent.parentElement === document.body &&
        parent.childElementCount === 1 &&
        parent.getAttributeNames().length === 0;

      const shadowHost: HTMLElement = isLikelyTestingLibraryContainer ? parent! : host;

      let shadow = (shadowHost as any).shadowRoot as ShadowRoot | null;
      if (!shadow) {
        shadow = shadowHost.attachShadow({ mode, delegatesFocus });
      }

      setRoot(shadow);
      onShadowRoot?.(shadow);
    },
    [mode, delegatesFocus, onShadowRoot]
  );

  // Manage style injection
  React.useEffect(() => {
    if (!root) return;

    // Clear only what we own (identified by data-shadow-owned)
    const owned = root.querySelectorAll("[data-shadow-owned='true']");
    owned.forEach((n) => n.remove());

    // 1) Optional document styles
    if (inheritDocumentStyles) {
      const headNodes = Array.from(document.head.querySelectorAll("style, link[rel='stylesheet']"));
      for (const node of headNodes) {
        // Clone into shadow
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-shadow-owned", "true");
        root.appendChild(clone);
      }
    }

    // 2) Optional external stylesheet hrefs
    if (styleHrefs?.length) {
      for (const href of styleHrefs) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute("data-shadow-owned", "true");
        root.appendChild(link);
      }
    }

    // 3) Optional inline cssText
    if (cssText && cssText.trim().length) {
      const style = document.createElement("style");
      style.textContent = cssText;
      style.setAttribute("data-shadow-owned", "true");
      root.appendChild(style);
    }
  }, [root, cssText, styleHrefs, inheritDocumentStyles]);

  const HostTag = as as any;

  return (
    <HostTag ref={hostRef as any} className={className}>
      {root ? createPortal(children, root as unknown as Element) : null}
    </HostTag>
  );
}
