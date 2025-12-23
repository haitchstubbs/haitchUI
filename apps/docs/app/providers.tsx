'use client';
import * as React from "react";
import { OverlayDOMProvider } from "@haitch/core/client";

export function Providers({ children }: { children: React.ReactNode }) {
  return <OverlayDOMProvider>{children}</OverlayDOMProvider>;
}
