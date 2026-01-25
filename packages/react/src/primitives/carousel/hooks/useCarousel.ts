// packages/react/carousel/src/engine.ts
"use client";

import * as React from "react";
import { autoUpdate } from "@floating-ui/dom"; // :contentReference[oaicite:0]{index=0}
import type { CarouselApi, CarouselAxis, CarouselContextType, UseCarouselEngineOptions } from "../types";



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

/**
 * Robust "scroll position to align target with viewport start" using DOMRects.
 * Works better than offsetLeft/offsetTop in many nested/layout cases.
 */
function getTargetScrollPos(viewport: HTMLElement, target: HTMLElement, axis: CarouselAxis) {
  const v = viewport.getBoundingClientRect();
  const t = target.getBoundingClientRect();

  if (axis === "x") {
    return viewport.scrollLeft + (t.left - v.left);
  }
  return viewport.scrollTop + (t.top - v.top);
}

function makeThresholds(steps: number) {
  const s = Math.max(2, Math.min(20, Math.floor(steps)));
  const arr: number[] = [];
  for (let i = 0; i <= s; i++) arr.push(i / s);
  return arr;
}

export function useCarousel(options: UseCarouselEngineOptions = {}): CarouselContextType {
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
    ioSteps = 8,
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

  const setCanScrollPrev = React.useCallback((v: boolean) => _setCanScrollPrev(v), []);
  const setCanScrollNext = React.useCallback((v: boolean) => _setCanScrollNext(v), []);

  // ----- Loop index helpers (same semantics as your current engine)
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

  // ----- IO-driven selection (no scroll listeners)
  const ioRef = React.useRef<IntersectionObserver | null>(null);
  const ratiosRef = React.useRef<Map<number, number>>(new Map()); // renderedIndex -> ratio

  const refreshCanScroll = React.useCallback(
    (realSel: number) => {
      const maxReal = Math.max(0, realCount - 1);

      // keep selection in range
      setSelectedIndex(clamp(realSel, 0, maxReal));

      if (loop && realCount > 1) {
        setCanScrollPrev(true);
        setCanScrollNext(true);
        return;
      }

      setCanScrollPrev(realSel > 0);
      setCanScrollNext(realSel < maxReal);
    },
    [loop, realCount, setCanScrollNext, setCanScrollPrev, setSelectedIndex]
  );

  const setupIntersectionObserver = React.useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    // Cleanup old observer
    ioRef.current?.disconnect();
    ioRef.current = null;
    ratiosRef.current.clear();

    const items = Array.from(content.children) as HTMLElement[];
    if (items.length === 0) return;

    const thresholds = makeThresholds(ioSteps);

    const io = new IntersectionObserver(
      (entries) => {
        let bestRendered = -1;
        let bestRatio = -1;

        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const idx = items.indexOf(target);
          if (idx === -1) continue;

          const ratio = entry.intersectionRatio ?? 0;
          ratiosRef.current.set(idx, ratio);
        }

        // pick the most visible rendered index
        for (const [idx, ratio] of ratiosRef.current.entries()) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestRendered = idx;
          }
        }

        // Fallback: if nothing intersecting, pick nearest by rect distance
        if (bestRendered === -1) {
          const vRect = viewport.getBoundingClientRect();
          let nearest = 0;
          let bestDist = Infinity;

          for (let i = 0; i < items.length; i++) {
            const r = items[i]!.getBoundingClientRect();
            const d =
              axis === "x"
                ? Math.abs(r.left - vRect.left)
                : Math.abs(r.top - vRect.top);
            if (d < bestDist) {
              bestDist = d;
              nearest = i;
            }
          }
          bestRendered = nearest;
        }

        const nextReal = renderedToRealIndex(bestRendered);
        refreshCanScroll(nextReal);
      },
      {
        root: viewport,
        threshold: thresholds, // intersectionRatio is meaningful across steps :contentReference[oaicite:1]{index=1}
      }
    );

    for (const el of items) io.observe(el);

    ioRef.current = io;

    // initial canScroll based on current selection
    refreshCanScroll(selectedIndexRef.current);
  }, [axis, ioSteps, refreshCanScroll, renderedToRealIndex]);

  // ----- Floating UI autoUpdate: re-run IO wiring on resize/layout changes
  React.useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    // setup IO now
    setupIntersectionObserver();

    // Keep IO stable across: element resize, ancestor resize, layout shift, etc. :contentReference[oaicite:2]{index=2}
    const cleanup = autoUpdate(
      viewport,
      content,
      () => {
        setupIntersectionObserver();
      },
      {
        ancestorScroll: false, // IO handles scroll updates itself
        ancestorResize: true,
        elementResize: true,
        layoutShift: true,
      }
    );

    // Also watch DOM child changes (slides added/removed/reordered)
    const mo = new MutationObserver(() => setupIntersectionObserver());
    mo.observe(content, { childList: true });

    return () => {
      cleanup();
      mo.disconnect();
      ioRef.current?.disconnect();
      ioRef.current = null;
      ratiosRef.current.clear();
    };
  }, [setupIntersectionObserver]);

  // ----- Scroll helpers
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

  const scrollToIndex = React.useCallback(
    (realIndex: number) => {
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (!viewport || !content || realCount === 0) return;

      const items = Array.from(content.children) as HTMLElement[];
      if (items.length === 0) return;

      let nextReal = realIndex;
      if (loop && realCount > 1) nextReal = ((nextReal % realCount) + realCount) % realCount;
      else nextReal = clamp(nextReal, 0, realCount - 1);

      const renderedIndex = realToRenderedIndex(nextReal);
      const el = items[renderedIndex];
      if (!el) return;

      const pos = getTargetScrollPos(viewport, el, axis);
      scrollToPos(pos, behavior);
    },
    [axis, behavior, loop, realCount, realToRenderedIndex, scrollToPos]
  );

  const scrollPrev = React.useCallback(() => {
    scrollToIndex(selectedIndexRef.current - 1);
  }, [scrollToIndex]);

  const scrollNext = React.useCallback(() => {
    scrollToIndex(selectedIndexRef.current + 1);
  }, [scrollToIndex]);

  // ----- Optional "snap on release" for physics mode (uses IO-selected target)
  const snapToSelected = React.useCallback(() => {
    if (!snapOnRelease) return;
    scrollToIndex(selectedIndexRef.current);
  }, [scrollToIndex, snapOnRelease]);

  // ----- Physics drag (kept, but selection is IO-driven)
  const isDraggingRef = React.useRef(false);
  const pointerIdRef = React.useRef<number | null>(null);
  const lastPointerPosRef = React.useRef(0);
  const lastTRef = React.useRef(0);
  const velocityRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  const stopRaf = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startInertia = React.useCallback(() => {
    stopRaf();

    const step = () => {
      const t = nowMs();
      const dt = Math.max(1, t - (lastTRef.current || t));
      lastTRef.current = t;

      velocityRef.current *= Math.pow(friction, dt / 16);

      if (Math.abs(velocityRef.current) < minVelocity) {
        stopRaf();
        snapToSelected();
        return;
      }

      setScrollPos(getScrollPos() - velocityRef.current * dt);
      rafRef.current = requestAnimationFrame(step);
    };

    lastTRef.current = nowMs();
    rafRef.current = requestAnimationFrame(step);
  }, [friction, getScrollPos, minVelocity, setScrollPos, snapToSelected, stopRaf]);

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
        else snapToSelected();
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
    [axis, dragMode, getScrollPos, minVelocity, setScrollPos, snapToSelected, startInertia, stopRaf]
  );

  // Stable API object
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
    apiRef.current.setRealCount = setRealCount;
    apiRef.current.scrollToIndex = scrollToIndex;
    apiRef.current.scrollPrev = scrollPrev;
    apiRef.current.scrollNext = scrollNext;
  }

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
