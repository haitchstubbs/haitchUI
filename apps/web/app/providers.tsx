'use client';
import * as React from "react";
import { OverlayDOMProvider } from "@haitchui/core/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const portalRef = React.useRef<HTMLDivElement | null>(null);

  const dom = React.useMemo(
    () => ({
      getPortalContainer: () => portalRef.current ?? document.body,
    }),
    []
  );

  return (
    <OverlayDOMProvider dom={dom}>
      {children}
      <div ref={portalRef} data-overlay-root />
    </OverlayDOMProvider>
  );
}
