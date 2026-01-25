import type { OptionalChildren, HTML, OptionalAsChild } from "@/types/global";
import type { HTMLAttributes } from "react";

export type CarouselAxis = "x" | "y";
export type DragMode = "snap" | "physics";

export type UseCarouselEngineOptions = {
  axis?: CarouselAxis;
  loop?: boolean;
  behavior?: ScrollBehavior;
  keyboard?: boolean;
  boundarySelector?: string;

  dragMode?: DragMode;
  friction?: number;
  minVelocity?: number;
  snapOnRelease?: boolean;

  loopClones?: number;

  /**
   * IntersectionObserver threshold granularity.
   * More steps = more stable "most visible" selection, slightly more work.
   */
  ioSteps?: number; // default 8
};

export type CarouselApi = {
  setRoot: (el: HTMLElement | null) => void;
  setViewport: (el: HTMLElement | null) => void;
  setContent: (el: HTMLElement | null) => void;
  setRealCount: (count: number) => void;

  scrollToIndex: (realIndex: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
};

export type CarouselContextType = {
  axis: CarouselAxis;
  loop: boolean;
  behavior: ScrollBehavior;
  dragMode: DragMode;

  loopClones: number;
  realCount: number;

  selectedIndex: number; // REAL index
  canScrollPrev: boolean;
  canScrollNext: boolean;

  getRootProps: <P extends React.HTMLAttributes<HTMLElement>>(props: P) => P;
  getViewportProps: <P extends React.HTMLAttributes<HTMLElement>>(props: P) => P;

  api: CarouselApi;
};



export type RootProps = HTMLAttributes<HTMLDivElement> & OptionalAsChild &{
    options?: UseCarouselEngineOptions;

    /**
     * Expose the stable API instance to outer layers (shadcn layer).
     * (This is NOT the full reactive engine.)
     */
    onApi?: (api: CarouselApi) => void;
};


export type ViewportProps = HTML.Div & OptionalAsChild;

export type ContentProps = HTML.Div & OptionalAsChild & OptionalChildren;

export type ItemProps = HTML.Div & OptionalAsChild;

export type ButtonProps = HTML.Button & OptionalAsChild;