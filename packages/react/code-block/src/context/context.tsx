"use client";

import * as React from "react";

type CodeBlockCtx = {
  code: string;
  lang: string;
  highlightedHtml: string;

  expanded: boolean;
  setExpanded: (next: boolean | ((v: boolean) => boolean)) => void;

  copy: () => Promise<void>;
};

const CodeBlockContext = React.createContext<CodeBlockCtx | null>(null);

export function useCodeBlockContext() {
  const ctx = React.useContext(CodeBlockContext);
  if (!ctx) throw new Error("CodeBlock components must be wrapped in <CodeBlock.Root />");
  return ctx;
}

export function CodeBlockProvider({
  value,
  children,
}: {
  value: CodeBlockCtx;
  children: React.ReactNode;
}) {
  return <CodeBlockContext.Provider value={value}>{children}</CodeBlockContext.Provider>;
}
