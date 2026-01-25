// packages/react/scroll-area/src/index.tsx
"use client";

import * as React from "react";

/* -------------------------------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------------------------------- */

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
	return (node: T) => {
		for (const ref of refs) {
			if (!ref) continue;
			if (typeof ref === "function") ref(node);
			else (ref as React.MutableRefObject<T | null>).current = node;
		}
	};
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

function createRafBatcher(fn: () => void) {
	let raf = 0;
	return () => {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			fn();
		});
	};
}

function ensureScrollAreaGlobalStyles() {
	if (typeof document === "undefined") return;
	const id = "__haitch_scroll_area_styles__";
	if (document.getElementById(id)) return;

	const style = document.createElement("style");
	style.id = id;
	style.textContent = `
:where([data-scroll-area-viewport]) {
  -webkit-overflow-scrolling: touch;
}
:where([data-scroll-area-viewport])::-webkit-scrollbar {
  width: 0px;
  height: 0px;
}
:where([data-scroll-area-viewport])::-webkit-scrollbar-thumb {
  background: transparent;
}
`;
	document.head.appendChild(style);
}

function readTrackPadding(track: HTMLElement, orientation: Orientation) {
	const cs = getComputedStyle(track);
	if (orientation === "vertical") {
		const padStart = parseFloat(cs.paddingTop || "0") || 0;
		const padEnd = parseFloat(cs.paddingBottom || "0") || 0;
		return { padStart, padEnd };
	}
	const padStart = parseFloat(cs.paddingLeft || "0") || 0;
	const padEnd = parseFloat(cs.paddingRight || "0") || 0;
	return { padStart, padEnd };
}

function ensurePositionedTrack(track: HTMLElement) {
	// We need a stable containing block for an absolutely-positioned thumb.
	// Only set if the author hasn't already positioned it.
	const pos = getComputedStyle(track).position;
	if (pos === "static") track.style.position = "relative";
}

function ensureAbsoluteThumb(thumb: HTMLElement, orientation: Orientation) {
	// Thumb movement math assumes the thumb origin is the track border-box origin.
	// This makes the math padding-stable and avoids “double padding” when the track has p-*.
	thumb.style.position = "absolute";
	thumb.style.margin = "0";
	thumb.style.flex = "0 0 auto";
	thumb.style.willChange = "transform";

	if (orientation === "vertical") {
		thumb.style.left = "0";
		thumb.style.right = "0";
		thumb.style.top = "0";
		thumb.style.bottom = "auto";
	} else {
		thumb.style.top = "0";
		thumb.style.bottom = "0";
		thumb.style.left = "0";
		thumb.style.right = "auto";
	}
}

/* -------------------------------------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------------------------------------- */

type Orientation = "vertical" | "horizontal";

type LayoutState = {
	canScrollX: boolean;
	canScrollY: boolean;
	scrollWidth: number;
	scrollHeight: number;
	clientWidth: number;
	clientHeight: number;
	maxScrollX: number;
	maxScrollY: number;
};

type VisibilityState = {
	type: "hover" | "scroll" | "auto" | "always";
	hovered: boolean;
	focusWithin: boolean;
	scrolling: boolean;
};

/* -------------------------------------------------------------------------------------------------
 * Tiny external store (no rerenders on scroll ticks)
 * ------------------------------------------------------------------------------------------------- */

function shallowEqual<T extends Record<string, unknown>>(a: T, b: T) {
	for (const k in a) if (a[k] !== b[k]) return false;
	for (const k in b) if (!(k in a)) return false;
	return true;
}

function createStore<T extends Record<string, unknown>>(initial: T) {
	let state = initial;
	const listeners = new Set<() => void>();

	return {
		getSnapshot: () => state,
		setSnapshot: (next: T) => {
			if (shallowEqual(state, next)) return;
			state = next;
			for (const l of listeners) l();
		},
		subscribe: (fn: () => void) => {
			listeners.add(fn);
			return () => listeners.delete(fn);
		},
	};
}

function useStoreSelector<S extends Record<string, unknown>, T>(
	subscribe: (fn: () => void) => () => void,
	getSnapshot: () => S,
	selector: (s: S) => T
) {
	return React.useSyncExternalStore(subscribe, () => selector(getSnapshot()), () => selector(getSnapshot()));
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * ------------------------------------------------------------------------------------------------- */

type ScrollAreaCtx = {
	rootRef: React.RefObject<HTMLDivElement | null>;
	viewportRef: React.RefObject<HTMLDivElement | null>;
	viewportId: string;

	layoutSubscribe: (fn: () => void) => () => void;
	layoutGetSnapshot: () => LayoutState;

	visibilitySubscribe: (fn: () => void) => () => void;
	visibilityGetSnapshot: () => VisibilityState;

	registerScrollbar: (orientation: Orientation, el: HTMLDivElement | null) => void;
	registerThumb: (orientation: Orientation, el: HTMLDivElement | null) => void;
	registerCorner: (el: HTMLDivElement | null) => void;

	getScrollbarEl: (orientation: Orientation) => HTMLDivElement | null;
	getThumbEl: (orientation: Orientation) => HTMLDivElement | null;

	requestUpdate: (reason: "scroll" | "layout" | "track") => void;
};

const ScrollAreaContext = React.createContext<ScrollAreaCtx | null>(null);

function useScrollAreaCtx(name: string) {
	const ctx = React.useContext(ScrollAreaContext);
	if (!ctx) throw new Error(`${name} must be used within <ScrollArea.Root>.`);
	return ctx;
}

const ScrollbarOrientationContext = React.createContext<Orientation>("vertical");
function useScrollbarOrientation() {
	return React.useContext(ScrollbarOrientationContext);
}

/* -------------------------------------------------------------------------------------------------
 * Internal mapping + imperative DOM writes
 * ------------------------------------------------------------------------------------------------- */

const MIN_THUMB_PX = 16;

type AxisCache = {
	padStart: number;
	padEnd: number;
	trackInnerPx: number;
	thumbSizePx: number;
	thumbMaxOffsetPx: number;
	lastOffsetPx: number;
	lastSizePx: number;
};

function getSizesForOrientation(layout: LayoutState, orientation: Orientation) {
	if (orientation === "vertical") {
		return {
			viewportPx: layout.clientHeight,
			contentPx: layout.scrollHeight,
			maxScrollPx: layout.maxScrollY,
			canScroll: layout.canScrollY,
		};
	}
	return {
		viewportPx: layout.clientWidth,
		contentPx: layout.scrollWidth,
		maxScrollPx: layout.maxScrollX,
		canScroll: layout.canScrollX,
	};
}

function computeThumbSizePx(trackInnerPx: number, viewportPx: number, contentPx: number) {
	if (trackInnerPx <= 0) return 0;
	if (contentPx <= 0) return trackInnerPx;
	const raw = (trackInnerPx * viewportPx) / contentPx;
	return clamp(raw, MIN_THUMB_PX, trackInnerPx);
}

function applyThumbSize(thumb: HTMLElement, orientation: Orientation, sizePx: number) {
	if (orientation === "vertical") thumb.style.height = `${sizePx}px`;
	else thumb.style.width = `${sizePx}px`;
}

function applyThumbOffset(thumb: HTMLElement, orientation: Orientation, offsetPx: number) {
	thumb.style.transform =
		orientation === "vertical"
			? `translate3d(0, ${offsetPx}px, 0)`
			: `translate3d(${offsetPx}px, 0, 0)`;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

export type ScrollAreaRootProps = React.HTMLAttributes<HTMLDivElement> & {
	type?: "hover" | "scroll" | "auto" | "always";
	scrollHideDelay?: number;
};

export const Root = React.forwardRef<HTMLDivElement, ScrollAreaRootProps>(function ScrollAreaRoot(
	{ children, type = "hover", scrollHideDelay = 600, onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture, ...props },
	ref
) {
	const rootRef = React.useRef<HTMLDivElement>(null);
	const viewportRef = React.useRef<HTMLDivElement>(null);
	const viewportId = React.useId();

	const scrollbarVRef = React.useRef<HTMLDivElement | null>(null);
	const scrollbarHRef = React.useRef<HTMLDivElement | null>(null);
	const thumbVRef = React.useRef<HTMLDivElement | null>(null);
	const thumbHRef = React.useRef<HTMLDivElement | null>(null);
	const cornerRef = React.useRef<HTMLDivElement | null>(null);

	const contentElRef = React.useRef<Element | null>(null);

	const layoutStoreRef = React.useRef<ReturnType<typeof createStore<LayoutState>> | null>(null);
	if (!layoutStoreRef.current) {
		layoutStoreRef.current = createStore<LayoutState>({
			canScrollX: false,
			canScrollY: false,
			scrollWidth: 0,
			scrollHeight: 0,
			clientWidth: 0,
			clientHeight: 0,
			maxScrollX: 0,
			maxScrollY: 0,
		});
	}
	const layoutStore = layoutStoreRef.current;

	const visibilityStoreRef = React.useRef<ReturnType<typeof createStore<VisibilityState>> | null>(null);
	if (!visibilityStoreRef.current) {
		visibilityStoreRef.current = createStore<VisibilityState>({
			type,
			hovered: false,
			focusWithin: false,
			scrolling: false,
		});
	}
	const visibilityStore = visibilityStoreRef.current;

	React.useEffect(() => {
		const s = visibilityStore.getSnapshot();
		if (s.type !== type) visibilityStore.setSnapshot({ ...s, type });
	}, [type, visibilityStore]);

	React.useEffect(() => {
		ensureScrollAreaGlobalStyles();
	}, []);

	const axisCacheRef = React.useRef<{ vertical: AxisCache; horizontal: AxisCache }>({
		vertical: { padStart: 0, padEnd: 0, trackInnerPx: 0, thumbSizePx: 0, thumbMaxOffsetPx: 0, lastOffsetPx: NaN, lastSizePx: NaN },
		horizontal: { padStart: 0, padEnd: 0, trackInnerPx: 0, thumbSizePx: 0, thumbMaxOffsetPx: 0, lastOffsetPx: NaN, lastSizePx: NaN },
	});

	const flagsRef = React.useRef({
		measureViewport: true,
		measureTracks: true,
		updateOffsets: true,
	});

	const roRef = React.useRef<ResizeObserver | null>(null);

	const flush = React.useCallback(() => {
		const vp = viewportRef.current;
		if (!vp) return;

		const flags = flagsRef.current;

		let nextLayout: LayoutState | null = null;

		if (flags.measureViewport) {
			const nextContent = vp.firstElementChild;
			const ro = roRef.current;
			if (ro) {
				const prev = contentElRef.current;
				if (prev && prev !== nextContent) ro.unobserve(prev);
				if (nextContent && nextContent !== prev) ro.observe(nextContent);
			}
			contentElRef.current = nextContent;

			const scrollWidth = vp.scrollWidth;
			const scrollHeight = vp.scrollHeight;
			const clientWidth = vp.clientWidth;
			const clientHeight = vp.clientHeight;

			const maxScrollX = Math.max(0, scrollWidth - clientWidth);
			const maxScrollY = Math.max(0, scrollHeight - clientHeight);

			nextLayout = {
				canScrollX: maxScrollX > 0,
				canScrollY: maxScrollY > 0,
				scrollWidth,
				scrollHeight,
				clientWidth,
				clientHeight,
				maxScrollX,
				maxScrollY,
			};

			layoutStore.setSnapshot(nextLayout);

			flags.measureViewport = false;
			flags.measureTracks = true;
			flags.updateOffsets = true;
		}

		const layout = nextLayout ?? layoutStore.getSnapshot();

		const measureTrack = (orientation: Orientation, track: HTMLElement | null) => {
			if (!track) return;
			ensurePositionedTrack(track);

			const { padStart, padEnd } = readTrackPadding(track, orientation);
			const clientLen = orientation === "vertical" ? track.clientHeight : track.clientWidth; // padding included, border excluded
			const trackInnerPx = Math.max(0, clientLen - padStart - padEnd);

			const cache = orientation === "vertical" ? axisCacheRef.current.vertical : axisCacheRef.current.horizontal;
			cache.padStart = padStart;
			cache.padEnd = padEnd;
			cache.trackInnerPx = trackInnerPx;
		};

		if (flags.measureTracks) {
			measureTrack("vertical", scrollbarVRef.current);
			measureTrack("horizontal", scrollbarHRef.current);

			const computeAndApply = (orientation: Orientation) => {
				const thumb = orientation === "vertical" ? thumbVRef.current : thumbHRef.current;
				const track = orientation === "vertical" ? scrollbarVRef.current : scrollbarHRef.current;
				if (!thumb || !track) return;

				ensureAbsoluteThumb(thumb, orientation);

				const cache = orientation === "vertical" ? axisCacheRef.current.vertical : axisCacheRef.current.horizontal;
				const { viewportPx, contentPx, maxScrollPx, canScroll } = getSizesForOrientation(layout, orientation);

				if (!canScroll || cache.trackInnerPx <= 0 || maxScrollPx <= 0) {
					thumb.style.display = "none";
					cache.thumbSizePx = 0;
					cache.thumbMaxOffsetPx = 0;
					cache.lastOffsetPx = NaN;
					cache.lastSizePx = NaN;
					return;
				}

				thumb.style.display = "";

				const sizePx = computeThumbSizePx(cache.trackInnerPx, viewportPx, contentPx);
				cache.thumbSizePx = sizePx;
				cache.thumbMaxOffsetPx = Math.max(0, cache.trackInnerPx - sizePx);

				if (cache.lastSizePx !== sizePx) {
					applyThumbSize(thumb, orientation, sizePx);
					cache.lastSizePx = sizePx;
				}
			};

			computeAndApply("vertical");
			computeAndApply("horizontal");

			flags.measureTracks = false;
			flags.updateOffsets = true;
		}

		if (flags.updateOffsets) {
			const applyOffset = (orientation: Orientation) => {
				const thumb = orientation === "vertical" ? thumbVRef.current : thumbHRef.current;
				const track = orientation === "vertical" ? scrollbarVRef.current : scrollbarHRef.current;
				if (!thumb || !track) return;

				const cache = orientation === "vertical" ? axisCacheRef.current.vertical : axisCacheRef.current.horizontal;
				const { maxScrollPx, canScroll } = getSizesForOrientation(layout, orientation);

				if (!canScroll || cache.thumbMaxOffsetPx <= 0 || maxScrollPx <= 0) return;

				const scrollPos = orientation === "vertical" ? vp.scrollTop : vp.scrollLeft;
				const innerOffset = clamp((scrollPos / maxScrollPx) * cache.thumbMaxOffsetPx, 0, cache.thumbMaxOffsetPx);

				// Since thumb is absolute at border-box origin, we add padStart to reach the inner rail start.
				const offsetPx = cache.padStart + innerOffset;

				if (cache.lastOffsetPx !== offsetPx) {
					applyThumbOffset(thumb, orientation, offsetPx);
					cache.lastOffsetPx = offsetPx;
				}
			};

			applyOffset("vertical");
			applyOffset("horizontal");
			flags.updateOffsets = false;
		}
	}, [layoutStore]);

	const requestFlush = React.useMemo(() => createRafBatcher(flush), [flush]);

	const requestUpdate = React.useCallback(
		(reason: "scroll" | "layout" | "track") => {
			const flags = flagsRef.current;
			if (reason === "scroll") {
				flags.updateOffsets = true;
			} else if (reason === "layout") {
				flags.measureViewport = true;
				flags.measureTracks = true;
				flags.updateOffsets = true;
			} else {
				flags.measureTracks = true;
				flags.updateOffsets = true;
			}
			requestFlush();
		},
		[requestFlush]
	);

	React.useLayoutEffect(() => {
		const vp = viewportRef.current;
		if (!vp) return;

		const ro = new ResizeObserver((entries) => {
			let needsViewport = false;
			let needsTrack = false;

			for (const entry of entries) {
				const t = entry.target;
				if (t === vp || t === contentElRef.current) needsViewport = true;
				else needsTrack = true;
			}

			if (needsViewport) requestUpdate("layout");
			else if (needsTrack) requestUpdate("track");
		});

		roRef.current = ro;
		ro.observe(vp);

		const content = vp.firstElementChild;
		if (content) {
			contentElRef.current = content;
			ro.observe(content);
		}

		if (scrollbarVRef.current) ro.observe(scrollbarVRef.current);
		if (scrollbarHRef.current) ro.observe(scrollbarHRef.current);

		requestUpdate("layout");

		return () => {
			ro.disconnect();
			roRef.current = null;
		};
	}, [requestUpdate]);

	React.useLayoutEffect(() => {
		const vp = viewportRef.current;
		if (!vp) return;

		const hideTimerRef = { current: 0 as number | 0 };
		let scrollingActive = false;

		const onScroll = () => {
			requestUpdate("scroll");

			const vis = visibilityStore.getSnapshot();
			if (vis.type === "auto" || vis.type === "always") return;

			if (!scrollingActive) {
				scrollingActive = true;
				visibilityStore.setSnapshot({ ...vis, scrolling: true });
			}

			if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
			hideTimerRef.current = window.setTimeout(() => {
				scrollingActive = false;
				const next = visibilityStore.getSnapshot();
				if (next.scrolling) visibilityStore.setSnapshot({ ...next, scrolling: false });
				hideTimerRef.current = 0;
			}, scrollHideDelay);

			const layout = layoutStore.getSnapshot();
			if (vp.scrollHeight !== layout.scrollHeight || vp.scrollWidth !== layout.scrollWidth) {
				requestUpdate("layout");
			}
		};

		vp.addEventListener("scroll", onScroll, { passive: true });

		return () => {
			vp.removeEventListener("scroll", onScroll);
			if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
		};
	}, [layoutStore, requestUpdate, scrollHideDelay, visibilityStore]);

	const registerScrollbar = React.useCallback(
		(orientation: Orientation, el: HTMLDivElement | null) => {
			const ro = roRef.current;

			if (orientation === "vertical") {
				const prev = scrollbarVRef.current;
				if (ro && prev && prev !== el) ro.unobserve(prev);
				scrollbarVRef.current = el;
			} else {
				const prev = scrollbarHRef.current;
				if (ro && prev && prev !== el) ro.unobserve(prev);
				scrollbarHRef.current = el;
			}

			if (el) ensurePositionedTrack(el);
			if (ro && el) ro.observe(el);

			requestUpdate("track");
		},
		[requestUpdate]
	);

	const registerThumb = React.useCallback(
		(orientation: Orientation, el: HTMLDivElement | null) => {
			if (orientation === "vertical") thumbVRef.current = el;
			else thumbHRef.current = el;

			if (el) ensureAbsoluteThumb(el, orientation);

			requestUpdate("track");
		},
		[requestUpdate]
	);

	const registerCorner = React.useCallback((el: HTMLDivElement | null) => {
		cornerRef.current = el;
	}, []);

	const getScrollbarEl = React.useCallback((orientation: Orientation) => {
		return orientation === "vertical" ? scrollbarVRef.current : scrollbarHRef.current;
	}, []);

	const getThumbEl = React.useCallback((orientation: Orientation) => {
		return orientation === "vertical" ? thumbVRef.current : thumbHRef.current;
	}, []);

	const setHovered = React.useCallback(
		(next: boolean) => {
			const s = visibilityStore.getSnapshot();
			if (s.hovered !== next) visibilityStore.setSnapshot({ ...s, hovered: next });
		},
		[visibilityStore]
	);

	const setFocusWithin = React.useCallback(
		(next: boolean) => {
			const s = visibilityStore.getSnapshot();
			if (s.focusWithin !== next) visibilityStore.setSnapshot({ ...s, focusWithin: next });
		},
		[visibilityStore]
	);

	const handlePointerEnter: React.PointerEventHandler<HTMLDivElement> = (e) => {
		onPointerEnter?.(e);
		if (!e.defaultPrevented) setHovered(true);
	};

	const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
		onPointerLeave?.(e);
		if (!e.defaultPrevented) setHovered(false);
	};

	const handleFocusCapture: React.FocusEventHandler<HTMLDivElement> = (e) => {
		onFocusCapture?.(e);
		if (!e.defaultPrevented) setFocusWithin(true);
	};

	const handleBlurCapture: React.FocusEventHandler<HTMLDivElement> = (e) => {
		onBlurCapture?.(e);
		if (e.defaultPrevented) return;

		const root = rootRef.current;
		const next = e.relatedTarget as HTMLElement | null;
		if (!root || (next && root.contains(next))) return;
		setFocusWithin(false);
	};

	const ctx = React.useMemo<ScrollAreaCtx>(
		() => ({
			rootRef,
			viewportRef,
			viewportId,

			layoutSubscribe: layoutStore.subscribe,
			layoutGetSnapshot: layoutStore.getSnapshot,

			visibilitySubscribe: visibilityStore.subscribe,
			visibilityGetSnapshot: visibilityStore.getSnapshot,

			registerScrollbar,
			registerThumb,
			registerCorner,

			getScrollbarEl,
			getThumbEl,

			requestUpdate,
		}),
		[
			getScrollbarEl,
			getThumbEl,
			layoutStore,
			registerCorner,
			registerScrollbar,
			registerThumb,
			requestUpdate,
			visibilityStore,
			viewportId,
		]
	);

	return (
		<ScrollAreaContext.Provider value={ctx}>
			<div
				ref={composeRefs(rootRef, ref)}
				{...props}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
				onFocusCapture={handleFocusCapture}
				onBlurCapture={handleBlurCapture}
				data-scroll-area-root=""
			>
				{children}
			</div>
		</ScrollAreaContext.Provider>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Viewport
 * ------------------------------------------------------------------------------------------------- */

export type ScrollAreaViewportProps = React.HTMLAttributes<HTMLDivElement> & {
	tabIndex?: number;
};

export const Viewport = React.forwardRef<HTMLDivElement, ScrollAreaViewportProps>(function ScrollAreaViewport(
	{ style, tabIndex, onKeyDown, id, ...props },
	ref
) {
	const ctx = useScrollAreaCtx("ScrollArea.Viewport");

	const mergedStyle: React.CSSProperties = {
		overflow: "auto",
		scrollbarWidth: "none",
		msOverflowStyle: "none",
		overscrollBehavior: "contain",
		...style,
	};

	const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
		onKeyDown?.(e);
		if (e.defaultPrevented) return;
		if (e.target !== e.currentTarget) return;

		const vp = ctx.viewportRef.current;
		if (!vp) return;

		const canScrollY = vp.scrollHeight > vp.clientHeight + 1;
		const canScrollX = vp.scrollWidth > vp.clientWidth + 1;

		const line = 40;
		const pageY = Math.max(1, Math.floor(vp.clientHeight * 0.9));
		const pageX = Math.max(1, Math.floor(vp.clientWidth * 0.9));

		switch (e.key) {
			case " ":
				if (!canScrollY) return;
				e.preventDefault();
				vp.scrollTop = vp.scrollTop + (e.shiftKey ? -pageY : pageY);
				return;

			case "ArrowDown":
				if (!canScrollY) return;
				e.preventDefault();
				vp.scrollTop = vp.scrollTop + line;
				return;

			case "ArrowUp":
				if (!canScrollY) return;
				e.preventDefault();
				vp.scrollTop = vp.scrollTop - line;
				return;

			case "PageDown":
				if (canScrollY) {
					e.preventDefault();
					vp.scrollTop = vp.scrollTop + pageY;
					return;
				}
				if (canScrollX) {
					e.preventDefault();
					vp.scrollLeft = vp.scrollLeft + pageX;
					return;
				}
				return;

			case "PageUp":
				if (canScrollY) {
					e.preventDefault();
					vp.scrollTop = vp.scrollTop - pageY;
					return;
				}
				if (canScrollX) {
					e.preventDefault();
					vp.scrollLeft = vp.scrollLeft - pageX;
					return;
				}
				return;

			case "Home":
				if (!canScrollY) return;
				e.preventDefault();
				vp.scrollTop = 0;
				return;

			case "End":
				if (!canScrollY) return;
				e.preventDefault();
				vp.scrollTop = vp.scrollHeight;
				return;

			case "ArrowRight":
				if (!canScrollX) return;
				e.preventDefault();
				vp.scrollLeft = vp.scrollLeft + line;
				return;

			case "ArrowLeft":
				if (!canScrollX) return;
				e.preventDefault();
				vp.scrollLeft = vp.scrollLeft - line;
				return;

			default:
				return;
		}
	};

	return (
		<div
			ref={composeRefs(ctx.viewportRef, ref)}
			{...props}
			id={id ?? ctx.viewportId}
			tabIndex={tabIndex ?? 0}
			style={mergedStyle}
			onKeyDown={handleKeyDown}
			data-scroll-area-viewport=""
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Scrollbar
 * ------------------------------------------------------------------------------------------------- */

export type ScrollAreaScrollbarProps = React.HTMLAttributes<HTMLDivElement> & {
	orientation?: Orientation;
};

export const Scrollbar = React.forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(function ScrollAreaScrollbar(
	{ orientation = "vertical", style, onPointerDown, onWheel, children, ...props },
	ref
) {
	const ctx = useScrollAreaCtx("ScrollArea.Scrollbar");
	const localRef = React.useRef<HTMLDivElement | null>(null);

	const setRef = React.useMemo(
		() =>
			composeRefs<HTMLDivElement>(
				(node) => {
					localRef.current = node;
					ctx.registerScrollbar(orientation, node);
				},
				ref
			),
		[ctx, orientation, ref]
	);

	const canScroll = useStoreSelector(ctx.layoutSubscribe, ctx.layoutGetSnapshot, (s) =>
		orientation === "vertical" ? s.canScrollY : s.canScrollX
	);

	const type = useStoreSelector(ctx.visibilitySubscribe, ctx.visibilityGetSnapshot, (s) => s.type);
	const showInteractive = useStoreSelector(ctx.visibilitySubscribe, ctx.visibilityGetSnapshot, (s) => s.hovered || s.focusWithin || s.scrolling);
	const scrolling = useStoreSelector(ctx.visibilitySubscribe, ctx.visibilityGetSnapshot, (s) => s.scrolling);

	const visible =
		type === "always" || type === "auto" ? canScroll : type === "scroll" ? canScroll && scrolling : canScroll && showInteractive;

	const mergedStyle: React.CSSProperties = {
		...style,
		display: canScroll ? (style?.display ?? undefined) : "none",
		touchAction: "none",
		...(style?.opacity === undefined ? { opacity: visible ? 1 : 0 } : null),
		...(style?.pointerEvents === undefined ? { pointerEvents: visible ? "auto" : "none" } : null),
	};

	const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
		onPointerDown?.(e);
		if (e.defaultPrevented) return;
		if (e.button !== 0) return;

		const vp = ctx.viewportRef.current;
		const track = localRef.current;
		if (!vp || !track) return;

		// If pressed on (or inside) the thumb, Thumb owns the drag.
		const target = e.target as HTMLElement | null;
		if (target?.closest?.("[data-scroll-area-thumb]")) return;

		const layout = ctx.layoutGetSnapshot();
		const { viewportPx, contentPx, maxScrollPx, canScroll: canScrollAxis } = getSizesForOrientation(layout, orientation);
		if (!canScrollAxis || maxScrollPx <= 0) return;

		e.preventDefault();

		const rect = track.getBoundingClientRect();
		const { padStart, padEnd } = readTrackPadding(track, orientation);

		// IMPORTANT: use client* for lengths (border excluded) to match the main measurement path.
		const trackLen = orientation === "vertical" ? track.clientHeight : track.clientWidth;
		const trackInnerPx = Math.max(0, trackLen - padStart - padEnd);

		const thumbSizePx = computeThumbSizePx(trackInnerPx, viewportPx, contentPx);
		const thumbMaxOffsetPx = Math.max(0, trackInnerPx - thumbSizePx);

		const pointerPos = orientation === "vertical" ? e.clientY : e.clientX;
		const trackStart = orientation === "vertical" ? rect.top : rect.left;
		const clickInner = clamp(pointerPos - trackStart - padStart, 0, trackInnerPx);

		const scrollPos = orientation === "vertical" ? vp.scrollTop : vp.scrollLeft;
		const thumbOffsetInner = thumbMaxOffsetPx > 0 ? (scrollPos / maxScrollPx) * thumbMaxOffsetPx : 0;
		const thumbStart = thumbOffsetInner;
		const thumbEnd = thumbOffsetInner + thumbSizePx;

		const page = Math.max(1, Math.floor(viewportPx * 0.9));
		let nextScroll = scrollPos;

		if (clickInner < thumbStart) nextScroll = scrollPos - page;
		else if (clickInner > thumbEnd) nextScroll = scrollPos + page;
		else return;

		nextScroll = clamp(nextScroll, 0, maxScrollPx);

		if (orientation === "vertical") vp.scrollTop = nextScroll;
		else vp.scrollLeft = nextScroll;
	};

	const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
		onWheel?.(e);
		if (e.defaultPrevented) return;

		const vp = ctx.viewportRef.current;
		if (!vp) return;

		e.preventDefault();
		vp.scrollTop += e.deltaY;
		vp.scrollLeft += e.deltaX;
	};

	return (
		<ScrollbarOrientationContext.Provider value={orientation}>
			<div
				ref={setRef}
				{...props}
				style={mergedStyle}
				data-orientation={orientation}
				data-scroll-area-scrollbar=""
				data-state={visible ? "visible" : "hidden"}
				aria-hidden="true"
				tabIndex={-1}
				onPointerDown={handlePointerDown}
				onWheel={handleWheel}
			>
				{children}
			</div>
		</ScrollbarOrientationContext.Provider>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Thumb
 * ------------------------------------------------------------------------------------------------- */

export type ScrollAreaThumbProps = React.HTMLAttributes<HTMLDivElement>;

export const Thumb = React.forwardRef<HTMLDivElement, ScrollAreaThumbProps>(function ScrollAreaThumb(
	{ style, onPointerDown, ...props },
	ref
) {
	const ctx = useScrollAreaCtx("ScrollArea.Thumb");
	const orientation = useScrollbarOrientation();

	const localRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		ctx.registerThumb(orientation, localRef.current);
		return () => ctx.registerThumb(orientation, null);
	}, [ctx, orientation]);

	const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
		onPointerDown?.(e);
		if (e.defaultPrevented) return;
		if (e.button !== 0) return;

		const thumb = localRef.current;
		const vp = ctx.viewportRef.current;
		const track = ctx.getScrollbarEl(orientation);
		if (!thumb || !vp || !track) return;

		e.preventDefault();
		thumb.setPointerCapture(e.pointerId);

		// One-time measurement on pointerdown (allowed).
		const trackRect = track.getBoundingClientRect();
		const thumbRect = thumb.getBoundingClientRect();
		const { padStart, padEnd } = readTrackPadding(track, orientation);

		const trackLen = orientation === "vertical" ? track.clientHeight : track.clientWidth; // border excluded
		const trackInnerPx = Math.max(0, trackLen - padStart - padEnd);

		const layout = ctx.layoutGetSnapshot();
		const { viewportPx, contentPx, maxScrollPx, canScroll } = getSizesForOrientation(layout, orientation);
		if (!canScroll || maxScrollPx <= 0 || trackInnerPx <= 0) return;

		const thumbSizePx = computeThumbSizePx(trackInnerPx, viewportPx, contentPx);
		const thumbMaxOffsetPx = Math.max(1, trackInnerPx - thumbSizePx);

		const pointerPos0 = orientation === "vertical" ? e.clientY : e.clientX;
		const thumbStart0 = orientation === "vertical" ? thumbRect.top : thumbRect.left;
		const pointerOffsetInThumb = clamp(pointerPos0 - thumbStart0, 0, thumbSizePx);

		const trackStart = orientation === "vertical" ? trackRect.top : trackRect.left;

		const prevUserSelect = document.documentElement.style.userSelect;
		document.documentElement.style.userSelect = "none";

		let latestPointerPos = pointerPos0;
		let raf = 0;

		const applyMove = () => {
			raf = 0;

			const desiredThumbStartInner = clamp(
				latestPointerPos - trackStart - padStart - pointerOffsetInThumb,
				0,
				thumbMaxOffsetPx
			);

			const nextScroll = (desiredThumbStartInner / thumbMaxOffsetPx) * maxScrollPx;

			if (orientation === "vertical") vp.scrollTop = nextScroll;
			else vp.scrollLeft = nextScroll;
		};

		const onMove = (ev: PointerEvent) => {
			ev.preventDefault();
			latestPointerPos = orientation === "vertical" ? ev.clientY : ev.clientX;
			if (!raf) raf = requestAnimationFrame(applyMove);
		};

		const onUp = () => {
			document.documentElement.style.userSelect = prevUserSelect;
			if (raf) cancelAnimationFrame(raf);

			window.removeEventListener("pointermove", onMove, true);
			window.removeEventListener("pointerup", onUp, true);
			window.removeEventListener("pointercancel", onUp, true);
		};

		window.addEventListener("pointermove", onMove, { passive: false, capture: true });
		window.addEventListener("pointerup", onUp, { passive: true, capture: true });
		window.addEventListener("pointercancel", onUp, { passive: true, capture: true });
	};

	const mergedStyle: React.CSSProperties = {
		...style,
		touchAction: "none",
	};

	return (
		<div
			ref={composeRefs(
				(node) => {
					localRef.current = node;
				},
				ref
			)}
			{...props}
			style={mergedStyle}
			onPointerDown={handlePointerDown}
			data-scroll-area-thumb=""
			aria-hidden="true"
			tabIndex={-1}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Corner
 * ------------------------------------------------------------------------------------------------- */

export type ScrollAreaCornerProps = React.HTMLAttributes<HTMLDivElement>;

export const Corner = React.forwardRef<HTMLDivElement, ScrollAreaCornerProps>(function ScrollAreaCorner({ style, ...props }, ref) {
	const ctx = useScrollAreaCtx("ScrollArea.Corner");

	const localRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		ctx.registerCorner(localRef.current);
		return () => ctx.registerCorner(null);
	}, [ctx]);

	const show = useStoreSelector(ctx.layoutSubscribe, ctx.layoutGetSnapshot, (s) => s.canScrollX && s.canScrollY);

	const mergedStyle: React.CSSProperties = {
		...style,
		display: show ? (style?.display ?? undefined) : "none",
	};

	return (
		<div
			ref={composeRefs(
				(node) => {
					localRef.current = node;
				},
				ref
			)}
			{...props}
			style={mergedStyle}
			data-scroll-area-corner=""
			aria-hidden="true"
			tabIndex={-1}
		/>
	);
});

/* -------------------------------------------------------------------------------------------------
 * Radix-ish alias exports (to ease migration)
 * ------------------------------------------------------------------------------------------------- */

export const ScrollAreaScrollbar = Scrollbar;
export const ScrollAreaThumb = Thumb;

export { Root as ScrollAreaRoot, Viewport as ScrollAreaViewport, Scrollbar as ScrollAreaScrollbarPrimitive, Thumb as ScrollAreaThumbPrimitive, Corner as ScrollAreaCorner };

