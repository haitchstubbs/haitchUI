// packages/react/carousel/src/engine.ts
"use client";

import * as React from "react";

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
};

export type CarouselApi = {
  // stable API (for shadcn layer)
  setRoot: (el: HTMLElement | null) => void;
  setViewport: (el: HTMLElement | null) => void;
  setContent: (el: HTMLElement | null) => void;
  setRealCount: (count: number) => void;

  scrollToIndex: (realIndex: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
};

export type CarouselEngine = {
  // reactive fields used by primitives
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

  // stable api object for outer layers
  api: CarouselApi;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getBoundary(root: HTMLElement | null, selector: string) {
  if (!root) return null;
  return root.closest(selector) ?? root;
}

function nowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function useCarouselEngine(options: UseCarouselEngineOptions = {}): CarouselEngine {
  const {
    axis = "x",
    loop = false,
    behavior = "smooth",
    keyboard = true,
    boundarySelector = ".ui-root",
    dragMode = "physics",
    friction = 0.92,
    minVelocity = 0.02,
    snapOnRelease = true,
    loopClones: loopClonesOption = 1,
  } = options;

  const rootRef = React.useRef<HTMLElement | null>(null);
  const viewportRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLElement | null>(null);

  const [realCount, setRealCount] = React.useState(0);

  const loopClones = React.useMemo(() => {
    if (!loop) return 0;
    if (realCount <= 1) return 0;
    return clamp(loopClonesOption, 1, realCount);
  }, [loop, loopClonesOption, realCount]);

  const clonesBefore = loopClones;

  const [selectedIndex, _setSelectedIndex] = React.useState(0);
  const selectedIndexRef = React.useRef(0);
  const setSelectedIndex = React.useCallback((next: number) => {
    selectedIndexRef.current = next;
    _setSelectedIndex(next);
  }, []);

  const [canScrollPrev, _setCanScrollPrev] = React.useState(false);
  const [canScrollNext, _setCanScrollNext] = React.useState(false);

  const canScrollPrevRef = React.useRef(false);
  const canScrollNextRef = React.useRef(false);

  const setCanScrollPrev = React.useCallback((v: boolean) => {
    canScrollPrevRef.current = v;
    _setCanScrollPrev(v);
  }, []);
  const setCanScrollNext = React.useCallback((v: boolean) => {
    canScrollNextRef.current = v;
    _setCanScrollNext(v);
  }, []);

  const snapPointsRef = React.useRef<number[]>([]);

  // physics refs
  const isDraggingRef = React.useRef(false);
  const pointerIdRef = React.useRef<number | null>(null);
  const lastPointerPosRef = React.useRef(0);
  const lastTRef = React.useRef(0);
  const velocityRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  const getScrollPos = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return 0;
    return axis === "x" ? viewport.scrollLeft : viewport.scrollTop;
  }, [axis]);

  const setScrollPos = React.useCallback(
    (pos: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (axis === "x") viewport.scrollLeft = pos;
      else viewport.scrollTop = pos;
    },
    [axis]
  );

  const scrollToPos = React.useCallback(
    (pos: number, behaviorOverride?: ScrollBehavior) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const b = behaviorOverride ?? behavior;
      if (axis === "x") viewport.scrollTo({ left: pos, behavior: b });
      else viewport.scrollTo({ top: pos, behavior: b });
    },
    [axis, behavior]
  );

  const normalizeLoopScroll = React.useCallback(() => {
    if (!loop || realCount <= 1 || clonesBefore === 0) return;

    const points = snapPointsRef.current;
    const startIndex = clonesBefore;
    const endIndex = clonesBefore + realCount;

    const start = points[startIndex];
    const end = points[endIndex];
    if (start == null || end == null) return;

    const span = end - start;
    if (span <= 0) return;

    const pos = getScrollPos();
    if (pos < start) setScrollPos(pos + span);
    else if (pos >= end) setScrollPos(pos - span);
  }, [clonesBefore, getScrollPos, loop, realCount, setScrollPos]);

  const recomputeSnapPoints = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    const items = Array.from(content.children) as HTMLElement[];
    const points = items.map((el) => (axis === "x" ? el.offsetLeft : el.offsetTop));
    snapPointsRef.current = points;

    // place at first real item on init
    if (loop && realCount > 1 && clonesBefore > 0) {
      const start = points[clonesBefore];
      if (start != null) scrollToPos(start, "auto");
    }

    // update selection + ability
    const maxReal = Math.max(0, realCount - 1);
    setSelectedIndex(clamp(selectedIndexRef.current, 0, maxReal));

    if (loop && realCount > 1) {
      setCanScrollPrev(true);
      setCanScrollNext(true);
      return;
    }

    const pos = getScrollPos();
    const maxScroll =
      axis === "x"
        ? viewport.scrollWidth - viewport.clientWidth
        : viewport.scrollHeight - viewport.clientHeight;

    setCanScrollPrev(pos > 0);
    setCanScrollNext(pos < maxScroll - 1);
  }, [
    axis,
    clonesBefore,
    getScrollPos,
    loop,
    realCount,
    scrollToPos,
    setCanScrollNext,
    setCanScrollPrev,
    setSelectedIndex,
  ]);

  const findNearestRenderedIndex = React.useCallback((scrollPos: number) => {
    const points = snapPointsRef.current;
    if (points.length === 0) return 0;

    let nearest = 0;
    let bestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (p == null) continue;
      const d = Math.abs(p - scrollPos);
      if (d < bestDist) {
        bestDist = d;
        nearest = i;
      }
    }
    return nearest;
  }, []);

  const renderedToRealIndex = React.useCallback(
    (renderedIndex: number) => {
      if (!loop || realCount <= 0) return clamp(renderedIndex, 0, Math.max(0, realCount - 1));
      const raw = renderedIndex - clonesBefore;
      const mod = ((raw % realCount) + realCount) % realCount;
      return mod;
    },
    [clonesBefore, loop, realCount]
  );

  const realToRenderedIndex = React.useCallback(
    (realIndex: number) => {
      if (!loop || realCount <= 1) return clamp(realIndex, 0, Math.max(0, realCount - 1));
      return clonesBefore + (((realIndex % realCount) + realCount) % realCount);
    },
    [clonesBefore, loop, realCount]
  );

  const onScroll = React.useCallback(() => {
    normalizeLoopScroll();

    const pos = getScrollPos();
    const renderedNearest = findNearestRenderedIndex(pos);
    const realNearest = renderedToRealIndex(renderedNearest);

    setSelectedIndex(realNearest);

    if (loop && realCount > 1) {
      setCanScrollPrev(true);
      setCanScrollNext(true);
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxScroll =
      axis === "x"
        ? viewport.scrollWidth - viewport.clientWidth
        : viewport.scrollHeight - viewport.clientHeight;

    setCanScrollPrev(pos > 0);
    setCanScrollNext(pos < maxScroll - 1);
  }, [
    axis,
    findNearestRenderedIndex,
    getScrollPos,
    loop,
    normalizeLoopScroll,
    realCount,
    renderedToRealIndex,
    setCanScrollNext,
    setCanScrollPrev,
    setSelectedIndex,
  ]);

  const scrollToIndex = React.useCallback(
    (realIndex: number) => {
      const points = snapPointsRef.current;
      if (points.length === 0 || realCount === 0) return;

      let nextReal = realIndex;
      if (loop && realCount > 1) nextReal = ((nextReal % realCount) + realCount) % realCount;
      else nextReal = clamp(nextReal, 0, realCount - 1);

      const renderedIndex = realToRenderedIndex(nextReal);
      const pos = points[renderedIndex] ?? 0;
      scrollToPos(pos, behavior);
    },
    [behavior, loop, realCount, realToRenderedIndex, scrollToPos]
  );

  // IMPORTANT: these use refs (stable, never stale)
  const scrollPrev = React.useCallback(() => {
    scrollToIndex(selectedIndexRef.current - 1);
  }, [scrollToIndex]);

  const scrollNext = React.useCallback(() => {
    scrollToIndex(selectedIndexRef.current + 1);
  }, [scrollToIndex]);

  // resize observer
  React.useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    recomputeSnapPoints();

    const ro = new ResizeObserver(() => recomputeSnapPoints());
    ro.observe(viewport);
    ro.observe(content);
    return () => ro.disconnect();
  }, [recomputeSnapPoints]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll as any);
  }, [onScroll]);

  const stopRaf = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const snapToNearest = React.useCallback(() => {
    if (!snapOnRelease) return;
    const pos = getScrollPos();
    const rendered = findNearestRenderedIndex(pos);
    const real = renderedToRealIndex(rendered);
    scrollToIndex(real);
  }, [findNearestRenderedIndex, getScrollPos, renderedToRealIndex, scrollToIndex, snapOnRelease]);

  const startInertia = React.useCallback(() => {
    stopRaf();

    const step = () => {
      const t = nowMs();
      const dt = Math.max(1, t - (lastTRef.current || t));
      lastTRef.current = t;

      velocityRef.current *= Math.pow(friction, dt / 16);

      if (Math.abs(velocityRef.current) < minVelocity) {
        stopRaf();
        snapToNearest();
        return;
      }

      setScrollPos(getScrollPos() - velocityRef.current * dt);
      normalizeLoopScroll();

      rafRef.current = requestAnimationFrame(step);
    };

    lastTRef.current = nowMs();
    rafRef.current = requestAnimationFrame(step);
  }, [friction, getScrollPos, minVelocity, normalizeLoopScroll, setScrollPos, snapToNearest, stopRaf]);

  React.useEffect(() => () => stopRaf(), [stopRaf]);

  const getRootProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(props: P) => {
      if (!keyboard) return props;

      const onKeyDown = props.onKeyDown;
      const boundary = getBoundary(rootRef.current, boundarySelector);

      const handler: React.KeyboardEventHandler<HTMLElement> = (e) => {
        onKeyDown?.(e);
        if (boundary && !boundary.contains(e.target as Node)) return;

        if (axis === "x") {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollPrev();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollNext();
          }
        }
      };

      return { ...props, onKeyDown: handler };
    },
    [axis, boundarySelector, keyboard, scrollNext, scrollPrev]
  );

  const getViewportProps = React.useCallback(
    <P extends React.HTMLAttributes<HTMLElement>>(props: P) => {
      if (dragMode !== "physics") return props;

      const userOnPointerDown = (props as any).onPointerDown as React.PointerEventHandler<HTMLElement> | undefined;
      const userOnPointerMove = (props as any).onPointerMove as React.PointerEventHandler<HTMLElement> | undefined;
      const userOnPointerUp = (props as any).onPointerUp as React.PointerEventHandler<HTMLElement> | undefined;
      const userOnPointerCancel = (props as any).onPointerCancel as React.PointerEventHandler<HTMLElement> | undefined;

      const onPointerDown: React.PointerEventHandler<HTMLElement> = (e) => {
        userOnPointerDown?.(e);
        if (e.defaultPrevented) return;

        const viewport = viewportRef.current;
        if (!viewport) return;
        if (e.button != null && e.button !== 0) return;

        stopRaf();
        isDraggingRef.current = true;
        pointerIdRef.current = e.pointerId;

        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {}

        lastPointerPosRef.current = axis === "x" ? e.clientX : e.clientY;
        lastTRef.current = nowMs();
        velocityRef.current = 0;
        (e.currentTarget as HTMLElement).style.userSelect = "none";
      };

      const onPointerMove: React.PointerEventHandler<HTMLElement> = (e) => {
        userOnPointerMove?.(e);
        if (!isDraggingRef.current) return;
        if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;

        const pos = axis === "x" ? e.clientX : e.clientY;
        const t = nowMs();
        const dt = Math.max(1, t - lastTRef.current);

        const delta = pos - lastPointerPosRef.current;
        lastPointerPosRef.current = pos;
        lastTRef.current = t;

        const instVel = delta / dt;
        velocityRef.current = velocityRef.current * 0.7 + instVel * 0.3;

        setScrollPos(getScrollPos() - delta);
        normalizeLoopScroll();

        e.preventDefault();
      };

      const endDrag = (e: React.PointerEvent<HTMLElement>) => {
        isDraggingRef.current = false;
        pointerIdRef.current = null;

        const viewport = viewportRef.current;
        if (viewport) {
          try {
            viewport.releasePointerCapture(e.pointerId);
          } catch {}
        }

        (e.currentTarget as HTMLElement).style.userSelect = "";

        velocityRef.current = -velocityRef.current;
        if (Math.abs(velocityRef.current) >= minVelocity) startInertia();
        else snapToNearest();
      };

      const onPointerUp: React.PointerEventHandler<HTMLElement> = (e) => {
        userOnPointerUp?.(e);
        if (!isDraggingRef.current) return;
        if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;
        endDrag(e);
      };

      const onPointerCancel: React.PointerEventHandler<HTMLElement> = (e) => {
        userOnPointerCancel?.(e);
        if (!isDraggingRef.current) return;
        if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;
        endDrag(e);
      };

      return { ...props, onPointerDown, onPointerMove, onPointerUp, onPointerCancel };
    },
    [axis, dragMode, getScrollPos, minVelocity, normalizeLoopScroll, setScrollPos, snapToNearest, startInertia, stopRaf]
  );

  // ✅ Stable API object for outer layers (identity never changes)
  const apiRef = React.useRef<CarouselApi | null>(null);
  if (apiRef.current == null) {
    apiRef.current = {
      setRoot: (el) => (rootRef.current = el),
      setViewport: (el) => (viewportRef.current = el),
      setContent: (el) => (contentRef.current = el),
      setRealCount,
      scrollToIndex,
      scrollPrev,
      scrollNext,
    };
  } else {
    // keep methods fresh (in case callbacks change)
    apiRef.current.setRealCount = setRealCount;
    apiRef.current.scrollToIndex = scrollToIndex;
    apiRef.current.scrollPrev = scrollPrev;
    apiRef.current.scrollNext = scrollNext;
  }

  // ✅ Reactive context value (new object when state changes)
  return React.useMemo(
    () => ({
      axis,
      loop,
      behavior,
      dragMode,

      loopClones,
      realCount,

      selectedIndex,
      canScrollPrev: loop && realCount > 1 ? true : canScrollPrev,
      canScrollNext: loop && realCount > 1 ? true : canScrollNext,

      getRootProps,
      getViewportProps,

      api: apiRef.current!,
    }),
    [
      axis,
      loop,
      behavior,
      dragMode,
      loopClones,
      realCount,
      selectedIndex,
      canScrollPrev,
      canScrollNext,
      getRootProps,
      getViewportProps,
    ]
  );
}
