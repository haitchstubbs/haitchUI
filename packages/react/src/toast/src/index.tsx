"use client";

/**
 * @haitch-ui/react/toast — single-file toaster (targets Sonner v2.0.7 API)
 *
 * Exports:
 * - <Toaster /> (Sonner-compatible props incl. id/toasterId support)
 * - toast() + toast.success/error/info/warning/loading/promise/dismiss/getActiveToasts
 * - useToast() hook (Sonner's useSonner equivalent, renamed)
 *
 * Notes:
 * - Includes built-in style injection (disable via <Toaster injectStyles={false} />).
 * - Multiple toasters: <Toaster id="global" /> + toast('x', { toasterId: 'global' })
 * - testId: toast('x', { testId: 'my-toast' }) sets data-testid on the toast element
 */

import * as React from "react";
import { css } from "./stringToCSS";

/* -------------------------------------------------------------------------------------------------
 * Types (Sonner-ish)
 * -----------------------------------------------------------------------------------------------*/

export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export type ToastType = "normal" | "success" | "error" | "info" | "warning" | "loading";
export type ToastId = string;

export type ToastTheme = "light" | "dark" | "system";

export type ToastAction =
	| React.ReactNode
	| {
			label: React.ReactNode;
			onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
	  };

export type Offset =
	| string
	| number
	| Partial<{
			top: string | number;
			right: string | number;
			bottom: string | number;
			left: string | number;
	  }>;

export type SwipeDirection = "left" | "right" | "up" | "down";

export type ToastOptions = {
	/** Updating toasts: pass id to update in-place */
	id?: string;

	description?: React.ReactNode | (() => React.ReactNode);

	/** Sonner prop */
	closeButton?: boolean;

	/** Sonner prop */
	invert?: boolean;

	/** Sonner prop */
	duration?: number;

	/** Sonner prop */
	position?: ToastPosition;

	/** Sonner prop */
	dismissible?: boolean; // default true

	/** Sonner prop */
	icon?: React.ReactNode;

	/** Sonner prop */
	action?: ToastAction;

	/** Sonner prop */
	cancel?: ToastAction;

	/** Sonner prop */
	testId?: string;

	/** Sonner prop (v2.0.7 multiple toasters) */
	toasterId?: string;

	/** Sonner prop */
	onDismiss?: (toast: ToastT) => void;

	/** Sonner prop */
	onAutoClose?: (toast: ToastT) => void;

	/** Sonner prop */
	containerAriaLabel?: string; // default "Notifications"

	/** Sonner props */
	actionButtonStyle?: React.CSSProperties;
	cancelButtonStyle?: React.CSSProperties;

	/** (extra) className support */
	className?: string;

	/** (extra) custom data attrs */
	data?: Record<string, string>;

	/** (extra) override type */
	type?: ToastType;
};

export type ToastT = {
	id: ToastId;
	type: ToastType;

	createdAt: number;

	title?: React.ReactNode | (() => React.ReactNode);
	description?: React.ReactNode | (() => React.ReactNode);

	duration: number; // ms
	closeButton: boolean;
	invert: boolean;
	dismissible: boolean;

	position?: ToastPosition;

	icon?: React.ReactNode;

	action?: ToastAction;
	cancel?: ToastAction;

	testId?: string;
	toasterId?: string;

	onDismiss?: (toast: ToastT) => void;
	onAutoClose?: (toast: ToastT) => void;

	containerAriaLabel?: string;

	actionButtonStyle?: React.CSSProperties;
	cancelButtonStyle?: React.CSSProperties;

	className?: string;
	data?: Record<string, string>;

	/** internal */
	visible: boolean;
	paused: boolean;
	remaining: number;
	timeoutAt?: number;

	/** swipe internal */
	swipe: {
		x: number;
		y: number;
		dragging: boolean;
	};
};

export type ToasterProps = {
	theme?: ToastTheme; // default "light" in docs; we treat default as "light"
	richColors?: boolean; // default false
	expand?: boolean; // default false
	visibleToasts?: number; // default 3
	id?: string; // for multiple toasters
	position?: ToastPosition; // default bottom-right
	closeButton?: boolean; // default false
	offset?: Offset; // default 32px
	mobileOffset?: Offset; // default 16px
	swipeDirections?: SwipeDirection[]; // default "based on position"
	dir?: "ltr" | "rtl"; // default ltr
	hotkey?: string; // default "alt+T"
	invert?: boolean; // default false
	toastOptions?: ToastOptions; // default duration 4000
	gap?: number; // default 14
	icons?: Partial<Record<ToastType, React.ReactNode>>;
	className?: string;
	style?: React.CSSProperties;

	/**
	 * Allow injecting additional CSS (string) or disable injection entirely
	 * - If you pass `false`, styles will not be injected.
	 */
	injectStyles?: boolean | string;
};

/* -------------------------------------------------------------------------------------------------
 * Constants / helpers
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_VISIBLE_TOASTS = 3;
const DEFAULT_DURATION = 4000;
const DEFAULT_GAP = 14;

const DEFAULT_OFFSET_DESKTOP = 32;
const DEFAULT_OFFSET_MOBILE = 16;
const EXIT_ANIMATION_MS = 260;

const STYLE_ID = "__haitch_react_toast_styles__";

const genId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isReactElement = (v: unknown): v is React.ReactElement => typeof v === "object" && v != null && "type" in (v as any);

const toPx = (v: string | number | undefined) => {
	if (v == null) return undefined;
	return typeof v === "number" ? `${v}px` : v;
};

const normalizeOffset = (
	o: Offset | undefined,
	fallback: number
): Required<{
	top: string;
	right: string;
	bottom: string;
	left: string;
}> => {
	if (o == null) {
		const px = `${fallback}px`;
		return { top: px, right: px, bottom: px, left: px };
	}
	if (typeof o === "string" || typeof o === "number") {
		const px = toPx(o)!;
		return { top: px, right: px, bottom: px, left: px };
	}
	return {
		top: toPx(o.top) ?? `${fallback}px`,
		right: toPx(o.right) ?? `${fallback}px`,
		bottom: toPx(o.bottom) ?? `${fallback}px`,
		left: toPx(o.left) ?? `${fallback}px`,
	};
};

const resolveTheme = (theme: ToastTheme): "light" | "dark" => {
	if (theme === "light" || theme === "dark") return theme;
	if (typeof window === "undefined") return "light";
	return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

const computeDefaultSwipeDirections = (pos: ToastPosition): SwipeDirection[] => {
	// Docs say "based on position" — this is a reasonable mapping.
	if (pos.includes("left")) return ["left"];
	if (pos.includes("right")) return ["right"];
	if (pos.includes("top")) return ["up"];
	return ["down"];
};

const parseHotkey = (hotkey: string) => {
	// supports: "alt+T", "⌥/alt + T", "ctrl+shift+k" (best-effort)
	const cleaned = hotkey
		.toLowerCase()
		.replaceAll(" ", "")
		.replaceAll("⌥/alt", "alt")
		.replaceAll("option", "alt")
		.replaceAll("cmd", "meta")
		.replaceAll("command", "meta");

	const parts = cleaned.split("+").filter(Boolean);
	const key = parts.pop() ?? "";
	const mods = new Set(parts);
	return { key, mods };
};

const matchHotkey = (e: KeyboardEvent, hotkey: string) => {
	const { key, mods } = parseHotkey(hotkey);
	if (!key) return false;

	const pressedKey = e.key.toLowerCase();
	const keyOk = pressedKey === key.toLowerCase();

	const altOk = mods.has("alt") ? e.altKey : !mods.has("alt") || true;
	const ctrlOk = mods.has("ctrl") ? e.ctrlKey : !mods.has("ctrl") || true;
	const shiftOk = mods.has("shift") ? e.shiftKey : !mods.has("shift") || true;
	const metaOk = mods.has("meta") ? e.metaKey : !mods.has("meta") || true;

	// If hotkey includes a modifier, require it; if it doesn't, don't require.
	const requiresAlt = mods.has("alt");
	const requiresCtrl = mods.has("ctrl");
	const requiresShift = mods.has("shift");
	const requiresMeta = mods.has("meta");

	if (requiresAlt && !e.altKey) return false;
	if (requiresCtrl && !e.ctrlKey) return false;
	if (requiresShift && !e.shiftKey) return false;
	if (requiresMeta && !e.metaKey) return false;

	return keyOk && altOk && ctrlOk && shiftOk && metaOk;
};

/* -------------------------------------------------------------------------------------------------
 * Multi-toaster registry (v2.0.7)
 * -----------------------------------------------------------------------------------------------*/

const DEFAULT_TOASTER_ID = "__haitch_default__";
const mountedToasters: string[] = [];

const registerToaster = (id?: string) => {
	const key = id ?? DEFAULT_TOASTER_ID;
	if (!mountedToasters.includes(key)) mountedToasters.push(key);
	return key;
};

const unregisterToaster = (id?: string) => {
	const key = id ?? DEFAULT_TOASTER_ID;
	const idx = mountedToasters.indexOf(key);
	if (idx >= 0) mountedToasters.splice(idx, 1);
};

const pickDefaultToasterTarget = () => {
	// Prefer the unnamed/default toaster if present; otherwise first mounted.
	if (mountedToasters.includes(DEFAULT_TOASTER_ID)) return DEFAULT_TOASTER_ID;
	return mountedToasters[0] ?? DEFAULT_TOASTER_ID;
};

/* -------------------------------------------------------------------------------------------------
 * Store
 * -----------------------------------------------------------------------------------------------*/

type Listener = () => void;

class ToastStore {
	private toasts: ToastT[] = [];
	private listeners = new Set<Listener>();
	private raf: number | null = null;

	subscribe = (listener: Listener) => {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	};

	getSnapshot = () => this.toasts;

	private emit = () => {
		for (const l of this.listeners) l();
	};

	private scheduleTick = () => {
		if (this.raf != null) return;
		const loop = () => {
			this.raf = null;
			this.tick();
			if (this.toasts.some((t) => t.visible && !t.paused && isFinite(t.duration) && t.remaining > 0)) {
				this.scheduleTick();
			}
		};
		this.raf = window.requestAnimationFrame(loop);
	};

	private tick = () => {
		const now = Date.now();
		let changed = false;

		for (const t of this.toasts) {
			if (!t.visible) continue;
			if (t.paused) continue;
			if (!isFinite(t.duration)) continue;

			if (!t.timeoutAt) t.timeoutAt = now + t.remaining;

			const remaining = Math.max(0, t.timeoutAt - now);
			if (remaining !== t.remaining) {
				t.remaining = remaining;
				changed = true;
			}

			if (t.remaining <= 0) {
				this.dismiss(t.id, { reason: "auto" });
				changed = true;
			}
		}

		if (changed) this.emit();
	};

	private has = (id: ToastId) => this.toasts.some((t) => t.id === id);

	addOrUpdate = (toast: ToastT) => {
		if (this.has(toast.id)) {
			this.update(toast.id, toast, { resetTimer: true, revive: true });
			return;
		}
		this.toasts = [toast, ...this.toasts];
		this.emit();
		this.scheduleTick();
	};

	update = (
		id: ToastId,
		patch: Partial<ToastT>,
		opts?: {
			resetTimer?: boolean;
			revive?: boolean;
		}
	) => {
		let changed = false;
		const now = Date.now();

		this.toasts = this.toasts.map((t) => {
			if (t.id !== id) return t;
			changed = true;

			const next: ToastT = {
				...t,
				...patch,
			};

			if (opts?.revive) next.visible = true;

			if (opts?.resetTimer) {
				next.remaining = isFinite(next.duration) ? next.duration : Number.POSITIVE_INFINITY;
				next.timeoutAt = isFinite(next.duration) ? now + next.remaining : undefined;
			} else if (patch.duration !== undefined) {
				next.remaining = isFinite(next.duration) ? next.duration : Number.POSITIVE_INFINITY;
				next.timeoutAt = isFinite(next.duration) ? now + next.remaining : undefined;
			}

			return next;
		});

		if (changed) {
			this.emit();
			this.scheduleTick();
		}
	};

	pause = (id: ToastId) => {
		const now = Date.now();
		this.toasts = this.toasts.map((t) => {
			if (t.id !== id) return t;
			if (t.paused) return t;
			const next = { ...t, paused: true };
			if (t.timeoutAt && isFinite(t.duration)) {
				next.remaining = Math.max(0, t.timeoutAt - now);
				next.timeoutAt = undefined;
			}
			return next;
		});
		this.emit();
	};

	resume = (id: ToastId) => {
		const now = Date.now();
		this.toasts = this.toasts.map((t) => {
			if (t.id !== id) return t;
			if (!t.paused) return t;
			const next = { ...t, paused: false };
			if (isFinite(next.duration)) next.timeoutAt = now + next.remaining;
			return next;
		});
		this.emit();
		this.scheduleTick();
	};

	dismiss = (id?: ToastId, meta?: { reason: "user" | "auto" | "program" | "swipe" }) => {
		const ids = id == null ? this.toasts.map((t) => t.id) : [id];
		let changed = false;

		this.toasts = this.toasts.map((t) => {
			if (!ids.includes(t.id)) return t;
			if (!t.visible) return t;
			changed = true;

			try {
				t.onDismiss?.(t);
			} catch {
				// ignore
			}

			if (meta?.reason === "auto") {
				try {
					t.onAutoClose?.(t);
				} catch {
					// ignore
				}
			}

			return {
				...t,
				visible: false,
				timeoutAt: undefined,
				remaining: 0,
				paused: false,
				swipe: { x: 0, y: 0, dragging: false },
			};
		});

		if (changed) {
			this.emit();
			window.setTimeout(() => {
				this.remove(ids);
			}, EXIT_ANIMATION_MS);
		}
	};

	remove = (ids: ToastId[] | ToastId) => {
		const idList = Array.isArray(ids) ? ids : [ids];
		const before = this.toasts.length;
		this.toasts = this.toasts.filter((t) => !idList.includes(t.id));
		if (this.toasts.length !== before) this.emit();
	};

	clear = () => {
		this.toasts = [];
		this.emit();
	};

	getActiveToasts = () => this.toasts.filter((t) => t.visible);
}

const store = new ToastStore();

/* -------------------------------------------------------------------------------------------------
 * Public API (toast)
 * -----------------------------------------------------------------------------------------------*/

type CreateFn = (message?: React.ReactNode | (() => React.ReactNode), opts?: ToastOptions) => ToastId;
type CreateToast = (message?: React.ReactNode | (() => React.ReactNode), opts?: ToastOptions, typeOverride?: ToastType) => ToastT;

const normalizeToast = (
	message: React.ReactNode | (() => React.ReactNode) | undefined,
	opts: ToastOptions | undefined,
	typeOverride?: ToastType
): ToastT => {
	const id = opts?.id ?? genId();
	const duration = opts?.duration ?? DEFAULT_DURATION;
	const now = Date.now();

	const toasterId = opts?.toasterId ?? pickDefaultToasterTarget();
	const dismissible = opts?.dismissible ?? true;

	return {
		id,
		type: typeOverride ?? "normal",
		createdAt: now,
		title: message,
		description: opts?.description,

		duration,
		closeButton: opts?.closeButton ?? false,
		invert: opts?.invert ?? false,
		dismissible,

		position: opts?.position,

		icon: opts?.icon,
		action: opts?.action,
		cancel: opts?.cancel,

		testId: opts?.testId,
		toasterId,

		onDismiss: opts?.onDismiss,
		onAutoClose: opts?.onAutoClose,

		containerAriaLabel: opts?.containerAriaLabel,
		actionButtonStyle: opts?.actionButtonStyle,
		cancelButtonStyle: opts?.cancelButtonStyle,

		className: opts?.className,
		data: opts?.data,

		visible: true,
		paused: false,
		remaining: isFinite(duration) ? duration : Number.POSITIVE_INFINITY,
		timeoutAt: isFinite(duration) ? now + duration : undefined,

		swipe: { x: 0, y: 0, dragging: false },
	};
};

const createToast: CreateToast = (message, opts, typeOverride = "normal") => {
	const t = normalizeToast(message, opts, typeOverride);
	// Important: update-in-place when passing id (Sonner pattern)
	store.addOrUpdate(t);
	return t;
};

type ToastApi = CreateFn & {
	success: CreateFn;
	error: CreateFn;
	info: CreateFn;
	warning: CreateFn;
	loading: CreateFn;

	/**
	 * Starts in loading state, updates on resolve/reject.
	 * Supports returning a string/node OR a full ToastOptions object for success/error.
	 */
	promise: <T>(
		promise: Promise<T>,
		opts: {
			loading: React.ReactNode | ((data?: undefined) => React.ReactNode);
			success: React.ReactNode | ((data: T) => React.ReactNode) | ((data: T) => ToastOptions & { message?: React.ReactNode });
			error: React.ReactNode | ((err: unknown) => React.ReactNode) | ((err: unknown) => ToastOptions & { message?: React.ReactNode });
			description?: React.ReactNode | ((data: T) => React.ReactNode);
			id?: string;
			toasterId?: string;
		}
	) => ToastId;

	dismiss: (id?: ToastId) => void;
	getActiveToasts: () => ToastT[];
};

const toast = ((message?: React.ReactNode | (() => React.ReactNode), opts?: ToastOptions) => {
	const t = createToast(message, opts);
	return t.id;
}) as ToastApi;

toast.success = (message, opts) => {
	const t = createToast(message, opts, "success");
	return t.id;
};
toast.error = (message, opts) => {
	const t = createToast(message, opts, "error");
	return t.id;
};
toast.info = (message, opts) => {
	const t = createToast(message, opts, "info");
	store.addOrUpdate(t);
	return t.id;
};
toast.warning = (message, opts) => {
	const t = createToast(message, opts, "warning");
	store.addOrUpdate(t);
	return t.id;
};
toast.loading = (message, opts) => {
	const t = createToast(message, { ...opts, duration: opts?.duration ?? Number.POSITIVE_INFINITY }, "loading");
	store.addOrUpdate(t);
	return t.id;
};

toast.promise = <T,>(
	promise: Promise<T>,
	opts: {
		loading: React.ReactNode | ((data?: undefined) => React.ReactNode);
		success: React.ReactNode | ((data: T) => React.ReactNode) | ((data: T) => ToastOptions & { message?: React.ReactNode });
		error: React.ReactNode | ((err: unknown) => React.ReactNode) | ((err: unknown) => ToastOptions & { message?: React.ReactNode });
		description?: React.ReactNode | ((data: T) => React.ReactNode);
		id?: string;
		toasterId?: string;
	}
) => {
	const id = opts.id ?? genId();

	// loading toast (infinite)
	store.addOrUpdate(
		normalizeToast(
			typeof opts.loading === "function" ? opts.loading(undefined) : opts.loading,
			{
				id,
				type: "loading",
				duration: Number.POSITIVE_INFINITY,
				toasterId: opts.toasterId,
			},
			"loading"
		)
	);

	promise
		.then((data) => {
			const res = opts.success;
			if (typeof res === "function") {
				const out = (res as any)(data);
				if (out && typeof out === "object" && !isReactElement(out) && !Array.isArray(out)) {
					const o = out as ToastOptions & { message?: React.ReactNode };
					const message = o.message ?? (o as any).title ?? "Success";
					const t = createToast(message, { ...o, id, toasterId: o.toasterId ?? opts.toasterId }, "success");
					store.addOrUpdate(t);
					return;
				}
				const t = createToast(out as React.ReactNode, { id, toasterId: opts.toasterId }, "success");
				store.addOrUpdate(t);
				return;
			}

			const t = createToast(res, { id, toasterId: opts.toasterId }, "success");
			store.addOrUpdate(t);
		})
		.catch((err) => {
			const res = opts.error;
			if (typeof res === "function") {
				const out = (res as any)(err);
				if (out && typeof out === "object" && !isReactElement(out) && !Array.isArray(out)) {
					const o = out as ToastOptions & { message?: React.ReactNode };
					const message = o.message ?? (o as any).title ?? "Error";
					const t = createToast(message, { ...o, id, toasterId: o.toasterId ?? opts.toasterId }, "error");
					store.addOrUpdate(t);
					return;
				}
				const t = createToast(out as React.ReactNode, { id, toasterId: opts.toasterId }, "error");
				store.addOrUpdate(t);
				return;
			}

			const t = createToast(res, { id, toasterId: opts.toasterId }, "error");
			store.addOrUpdate(t);
		});

	return id;
};

toast.dismiss = (id?: ToastId) => store.dismiss(id, { reason: "program" });
toast.getActiveToasts = () => store.getActiveToasts();

export { toast };

/* -------------------------------------------------------------------------------------------------
 * useToast (renamed useSonner)
 * -----------------------------------------------------------------------------------------------*/

export function useToast() {
	const toasts = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
	return {
		toasts: toasts.filter((t) => t.visible),
	};
}

/* -------------------------------------------------------------------------------------------------
 * Styles (injected once)
 * -----------------------------------------------------------------------------------------------*/

const baseCss = css`
/* @haitch-ui/react/toast base styles */
[data-ht-toaster]{
  position: fixed;
  z-index: 9999;
  pointer-events: none;
  width: min(420px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  gap: var(--ht-gap, 14px);
  box-sizing: border-box;
}

[data-ht-toaster][data-position="top-left"]{ top: var(--ht-top); left: var(--ht-left); align-items: flex-start; }
[data-ht-toaster][data-position="top-center"]{ top: var(--ht-top); left: 50%; transform: translateX(-50%); align-items: center; }
[data-ht-toaster][data-position="top-right"]{ top: var(--ht-top); right: var(--ht-right); align-items: flex-end; }
[data-ht-toaster][data-position="bottom-left"]{ bottom: var(--ht-bottom); left: var(--ht-left); align-items: flex-start; }
[data-ht-toaster][data-position="bottom-center"]{ bottom: var(--ht-bottom); left: 50%; transform: translateX(-50%); align-items: center; }
[data-ht-toaster][data-position="bottom-right"]{ bottom: var(--ht-bottom); right: var(--ht-right); align-items: flex-end; }

/* --- Overlapping stack layout when expand=false --- */
[data-ht-toaster][data-expand="false"]{
  /* switch from flex flow to overlapping stack */
  display: grid;
  grid-template-columns: 1fr;
  gap: 0; /* remove flex gap so items don't reserve space */
}

/* put all toasts in the same grid cell so they overlap */
[data-ht-toaster][data-expand="false"] [data-ht-toast]{
  grid-column: 1;
  grid-row: 1;
}

/* stack direction relative to position */
[data-ht-toaster][data-position^="top"]{ --ht-stack-dir: -1; }
[data-ht-toaster][data-position^="bottom"]{ --ht-stack-dir: 1; }

/* nicer scale origin */
[data-ht-toaster][data-position^="top"] [data-ht-toast]{ transform-origin: top; }
[data-ht-toaster][data-position^="bottom"] [data-ht-toast]{ transform-origin: bottom; }

[data-ht-toast]{
  pointer-events: auto;
  width: 100%;
  box-sizing: border-box;

  /* shell only */
  background: transparent;
  border: 0;
  box-shadow: none;
  backdrop-filter: none;
  border-radius: 0;

  will-change: transform;
  user-select: none;
  touch-action: pan-y pan-x;
}

[data-ht-toaster][data-expand="true"]{
  display: flex;
  flex-direction: column;
  gap: var(--ht-gap, 14px);
}

/* For bottom positions, newest should be closest to bottom edge */
[data-ht-toaster][data-expand="true"][data-position^="bottom"]{
  flex-direction: column-reverse;
}


/* Inner layout wrapper */
[data-ht-toast] [data-ht-toast-inner]{
  /* card visuals moved here */
  border-radius: var(--border-radius, 12px);
  background: var(--normal-bg, rgba(255,255,255,0.95));
  color: var(--normal-text, rgba(0,0,0,0.9));
  border: 1px solid var(--normal-border, rgba(0,0,0,0.08));

  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  backdrop-filter: saturate(180%) blur(12px);

  /* layout */
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  padding: 12px;

  will-change: transform, opacity;
}
[data-ht-toast] [data-ht-icon]{
  display:flex;
  align-items:center;
  justify-content:center;
  margin-top: 1px;
  flex: 0 0 auto;
}

[data-ht-toast] [data-ht-content]{
  min-width: 0;
  min-height: 0;
}

[data-ht-toast] [data-ht-title]{
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}

[data-ht-toast] [data-ht-description]{
  font-size: 13px;
  line-height: 1.25;
  margin-top: 2px;
}

[data-ht-toast] [data-ht-actions]{
  align-self: center;
  display:flex;
  gap: 8px;
  align-items:center;
  justify-content:flex-end;
  flex: 0 0 auto;
  min-height: 0;
}

[data-ht-toast] button{
  font: inherit;
  white-space: nowrap;
}

[data-ht-toast] [data-ht-action],
[data-ht-toast] [data-ht-cancel],
[data-ht-toast] [data-ht-close]{
  pointer-events: auto;
  border: 1px solid var(--normal-border, rgba(0,0,0,0.12));
  background: transparent;
  color: inherit;
  border-radius: calc(var(--border-radius, 12px) - 6px);
  padding: 6px 10px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

[data-ht-toast] [data-ht-close]{ padding: 6px 8px; }

[data-ht-toast] [data-ht-action]:hover,
[data-ht-toast] [data-ht-cancel]:hover,
[data-ht-toast] [data-ht-close]:hover{
  opacity: 1;
}

[data-ht-toaster][data-position^="top"]{ --ht-enter-y: -48px; --ht-exit-y: -24px; }
[data-ht-toaster][data-position^="bottom"]{ --ht-enter-y: 48px; --ht-exit-y: 24px; }

/* Keyframes use the variable */
@keyframes ht-enter {
  from { opacity: 0; transform: translateY(var(--ht-enter-y, 8px)) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes ht-exit {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(var(--ht-exit-y, 8px)) scale(0.98); }
}

/* Apply to inner wrapper (as you already do) */
[data-ht-toast][data-state="enter"] [data-ht-toast-inner]{ animation: ht-enter 180ms ease-out; }
[data-ht-toast][data-state="exit"]  [data-ht-toast-inner]{ animation: ht-exit 260ms ease-in forwards; }

/* Stacking (expand=false): compress older toasts a bit (direction-aware) */
[data-ht-toaster][data-expand="false"]{
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

[data-ht-toaster][data-expand="false"] [data-ht-toast]{
  grid-column: 1;
  grid-row: 1;
  position: relative;
  z-index: calc(1000 - var(--ht-index)); /* stable layering */
}

/* Stack grows AWAY from the viewport edge */
[data-ht-toaster][data-position^="top"]{ --ht-stack-dir: 1; }      /* older go DOWN */
[data-ht-toaster][data-position^="bottom"]{ --ht-stack-dir: -1; }  /* older go UP */

/* Make older toasts smaller (never bigger) */
[data-ht-toaster][data-expand="false"]
[data-ht-toast][data-index="1"],
[data-ht-toaster][data-expand="false"]
[data-ht-toast][data-index="2"]{
  transform:
    translateY(calc(var(--ht-stack-dir) * 16px * var(--ht-index)))
    scale(calc(1 - (0.05 * var(--ht-index))));
}
[data-ht-toaster][data-expand="false"] [data-ht-toast]{
  transition: transform 180ms ease-out, opacity 180ms ease-out;
  will-change: transform, opacity;
}
[data-ht-toast][data-dragging="true"]{ transition: none; }

@media (prefers-reduced-motion: reduce){
  [data-ht-toast][data-state="enter"],
  [data-ht-toast][data-state="exit"]{ animation: none !important; }
}

/* Theme helpers */
[data-ht-toaster][data-theme="dark"] [data-ht-toast] [data-ht-toast-inner]{
  background: var(--normal-bg, rgba(20,20,20,1));
  color: var(--normal-text, rgba(255,255,255,1));
  border-color: var(--normal-border, rgba(255,255,255,1));
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
`;

/* -------------------------------------------------------------------------------------------------
 * Toaster component
 * -----------------------------------------------------------------------------------------------*/

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function Toaster({
	theme = "light",
	richColors = false,
	expand = false,
	visibleToasts = DEFAULT_VISIBLE_TOASTS,
	id,
	position = "bottom-right",
	closeButton = false,
	offset = DEFAULT_OFFSET_DESKTOP,
	mobileOffset = DEFAULT_OFFSET_MOBILE,
	swipeDirections,
	dir = "ltr",
	hotkey = "alt+T",
	invert = false,
	toastOptions,
	gap = DEFAULT_GAP,
	icons,
	className,
	style,
	injectStyles = true,
}: ToasterProps) {
	const toasterKeyRef = React.useRef<string>(DEFAULT_TOASTER_ID);
	const containerRef = React.useRef<HTMLDivElement | null>(null);

	const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(theme === "dark" ? "dark" : "light");
	const [isMobile, setIsMobile] = React.useState(false);

	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	useIsoLayoutEffect(() => {
		toasterKeyRef.current = registerToaster(id);
		return () => unregisterToaster(id);
	}, [id]);

	useIsoLayoutEffect(() => {
		if (injectStyles !== false) {
			const existing = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
			if (!existing) {
				const tag = document.createElement("style");
				tag.id = STYLE_ID;
				tag.textContent = typeof injectStyles === "string" ? `${baseCss}\n${injectStyles}` : baseCss;
				document.head.appendChild(tag);
			} else if (typeof injectStyles === "string") {
				if (!existing.textContent?.includes(injectStyles)) {
					existing.textContent = `${existing.textContent ?? ""}\n${injectStyles}`;
				}
			}
		}
	}, [injectStyles]);

	React.useEffect(() => {
		const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
		const updateTheme = () => setResolvedTheme(resolveTheme(theme));
		updateTheme();
		mq?.addEventListener?.("change", updateTheme);
		return () => mq?.removeEventListener?.("change", updateTheme);
	}, [theme]);

	React.useEffect(() => {
		const mq = window.matchMedia?.("(max-width: 599px)");
		const update = () => setIsMobile(mq?.matches ?? false);
		update();
		mq?.addEventListener?.("change", update);
		return () => mq?.removeEventListener?.("change", update);
	}, []);

	React.useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (!hotkey) return;
			if (!matchHotkey(e, hotkey)) return;
			// Focus the toaster container for quick screen-reader / keyboard access
			e.preventDefault();
			containerRef.current?.focus();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [hotkey]);

	const allToasts = React.useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

	// Filter: this toaster shows only matching toasterId (or default routing)
	const myKey = toasterKeyRef.current;
	const visible = React.useMemo(() => {
		// all toasts for this toaster (VISIBLE + EXITING)
		const list = allToasts.filter((t) => (t.toasterId ?? pickDefaultToasterTarget()) === myKey);

		// Canonical order: newest first
		list.sort((a, b) => b.createdAt - a.createdAt);

		// Show up to N active toasts, but always include any exiting ones so animations can play
		const active = list.filter((t) => t.visible).slice(0, visibleToasts);
		const exiting = list.filter((t) => !t.visible);

		return [...active, ...exiting];
	}, [allToasts, myKey, visibleToasts]);

	const effectiveSwipe = swipeDirections ?? computeDefaultSwipeDirections(position);

	const effectiveOffset = React.useMemo(() => {
		return normalizeOffset(isMobile ? mobileOffset : offset, isMobile ? DEFAULT_OFFSET_MOBILE : DEFAULT_OFFSET_DESKTOP);
	}, [isMobile, offset, mobileOffset]);

	const themeToUse = React.useMemo(() => {
		let t = resolvedTheme;
		const shouldInvert = invert;
		if (!shouldInvert) return t;
		return t === "dark" ? "light" : "dark";
	}, [resolvedTheme, invert]);

	const iconFor = (t: ToastT) => {
		if (t.icon != null) return t.icon;
		return icons?.[t.type] ?? icons?.normal ?? null;
	};

	const defaults = toastOptions;

	const getBool = (val: boolean | undefined, fallback: boolean) => (val == null ? fallback : val);
	const getNum = (val: number | undefined, fallback: number) => (val == null ? fallback : val);

	const onPointerEnter = (tid: ToastId) => store.pause(tid);
	const onPointerLeave = (tid: ToastId) => store.resume(tid);

	const tryDismissFromActionClick = (toast: ToastT, e: React.MouseEvent) => {
		// Sonner semantics: allow user to prevent dismissal
		if (e.defaultPrevented) return;
		if (!toast.dismissible) return;
		store.dismiss(toast.id, { reason: "user" });
	};

	const renderAction = (toast: ToastT, kind: "action" | "cancel") => {
		const node = kind === "action" ? toast.action : toast.cancel;
		if (!node) return null;

		const dataAttr = kind === "action" ? "data-ht-action" : "data-ht-cancel";

		// 1) JSX element: clone and wire click
		if (isReactElement(node)) {
			const el = node as React.ReactElement<any>;
			const originalOnClick = el.props?.onClick as ((e: React.MouseEvent) => void) | undefined;

			return React.cloneElement(el, {
				...{ [dataAttr]: true },
				onClick: (e: React.MouseEvent) => {
					originalOnClick?.(e);
					tryDismissFromActionClick(toast, e);
				},
			});
		}

		// 2) Object form: { label, onClick }
		if (typeof node === "object" && node !== null && "label" in node && "onClick" in node) {
			const obj = node as { label: React.ReactNode; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void };

			const btnStyle =
				kind === "action"
					? { ...(defaults?.actionButtonStyle ?? {}), ...(toast.actionButtonStyle ?? {}) }
					: { ...(defaults?.cancelButtonStyle ?? {}), ...(toast.cancelButtonStyle ?? {}) };

			return (
				<button
					type="button"
					{...{ [dataAttr]: true }}
					style={btnStyle}
					onClick={(e) => {
						obj.onClick(e);
						tryDismissFromActionClick(toast, e);
					}}
				>
					{obj.label}
				</button>
			);
		}

		// 3) Sonner-ish fallback: treat strings/nodes as a button label
		// This is the reason your cancel wasn't dismissing: it used to render a <span>.
		const btnStyle =
			kind === "action"
				? { ...(defaults?.actionButtonStyle ?? {}), ...(toast.actionButtonStyle ?? {}) }
				: { ...(defaults?.cancelButtonStyle ?? {}), ...(toast.cancelButtonStyle ?? {}) };

		return (
			<button
				type="button"
				{...{ [dataAttr]: true }}
				style={btnStyle}
				onClick={(e) => {
					// no user handler available
					tryDismissFromActionClick(toast, e);
				}}
			>
				{node as React.ReactNode}
			</button>
		);
	};

	const applySwipeTransform = (toast: ToastT) => {
		const x = toast.swipe.x;
		const y = toast.swipe.y;
		return `translate3d(${x}px, ${y}px, 0)`;
	};

	const canSwipe = (dir: SwipeDirection, dx: number, dy: number) => {
		if (dir === "left") return dx < 0 && Math.abs(dx) > Math.abs(dy);
		if (dir === "right") return dx > 0 && Math.abs(dx) > Math.abs(dy);
		if (dir === "up") return dy < 0 && Math.abs(dy) > Math.abs(dx);
		if (dir === "down") return dy > 0 && Math.abs(dy) > Math.abs(dx);
		return false;
	};

	const isInteractiveTarget = (target: EventTarget | null) => {
		if (!(target instanceof HTMLElement)) return false;

		return Boolean(
			target.closest(
				["button", "a", "input", "textarea", "select", "[role='button']", "[data-ht-action]", "[data-ht-cancel]", "[data-ht-close]"].join(",")
			)
		);
	};

	const attachSwipeHandlers = (t: ToastT) => {
		let startX = 0;
		let startY = 0;
		let active = false;

		const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
			if (!t.dismissible) return;

			// ✅ If user is interacting with buttons/links/etc, don't capture pointer / don't swipe.
			if (isInteractiveTarget(e.target)) return;

			active = true;
			startX = e.clientX;
			startY = e.clientY;

			store.update(t.id, { swipe: { ...t.swipe, dragging: true } });

			// Optional: only capture for touch/pen if you want
			(e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
		};

		const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
			if (!active) return;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			const allowed = effectiveSwipe.find((d) => canSwipe(d, dx, dy));
			if (!allowed) return;

			const nextX = allowed === "left" || allowed === "right" ? dx : 0;
			const nextY = allowed === "up" || allowed === "down" ? dy : 0;

			store.update(t.id, { swipe: { x: nextX, y: nextY, dragging: true } });
		};

		const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
			if (!active) return;
			active = false;

			const dx = e.clientX - startX;
			const dy = e.clientY - startY;

			const allowed = effectiveSwipe.find((d) => canSwipe(d, dx, dy));
			const threshold = 80;

			if (allowed) {
				const dist = allowed === "left" || allowed === "right" ? Math.abs(dx) : Math.abs(dy);
				if (dist >= threshold) {
					store.dismiss(t.id, { reason: "swipe" });
					return;
				}
			}

			store.update(t.id, { swipe: { x: 0, y: 0, dragging: false } });
		};

		return { onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };
	};
	return (
		<div
			ref={containerRef}
			tabIndex={-1}
			data-ht-toaster
			data-position={position}
			data-theme={mounted ? themeToUse : undefined}
			data-expand={String(Boolean(expand))}
			data-rich-colors={String(Boolean(richColors))}
			data-dir={dir}
			className={className}
			style={
				{
					...style,
					["--ht-gap" as any]: `${gap}px`,
					["--ht-top" as any]: effectiveOffset.top,
					["--ht-right" as any]: effectiveOffset.right,
					["--ht-bottom" as any]: effectiveOffset.bottom,
					["--ht-left" as any]: effectiveOffset.left,
				} as React.CSSProperties
			}
			dir={dir}
			aria-live="polite"
			aria-relevant="additions removals"
			aria-label={defaults?.containerAriaLabel ?? "Notifications"}
		>
			{visible.map((raw, idx) => {
				// Apply Toaster defaults (toastOptions override) per Sonner docs
				const duration = getNum(raw.duration, getNum(defaults?.duration, DEFAULT_DURATION));
				const mergedCloseButton = getBool(raw.closeButton, getBool(defaults?.closeButton, closeButton));
				const mergedInvert = getBool(raw.invert, getBool(defaults?.invert, invert));
				const mergedDismissible = getBool(raw.dismissible, getBool(defaults?.dismissible, true));

				const t: ToastT = {
					...raw,
					duration,
					closeButton: mergedCloseButton,
					invert: mergedInvert,
					dismissible: mergedDismissible,
				};

				const state = t.visible ? "enter" : "exit";

				const themeForToast = mergedInvert ? (themeToUse === "dark" ? "light" : "dark") : themeToUse;
				const themeForAttr = mounted ? themeToUse : "light";
				const dataAttrs = t.data ? Object.fromEntries(Object.entries(t.data).map(([k, v]) => [`data-${k}`, v])) : undefined;

				const contentTitle = typeof t.title === "function" ? t.title() : t.title;
				const contentDesc = typeof t.description === "function" ? t.description() : t.description;

				const swipeHandlers = attachSwipeHandlers(t);
				const swipeTransform = applySwipeTransform(t);
				const isDragging = t.swipe.dragging;
				const dragStyle: React.CSSProperties = isDragging
					? { transform: swipeTransform, transition: "none" }
					: t.swipe.x !== 0 || t.swipe.y !== 0
						? { transform: swipeTransform, transition: "transform 180ms ease-out" }
						: {};

				return (
					<div
						key={t.id}
						data-ht-toast
						data-type={t.type}
						data-state={state}
						data-index={idx}
						data-theme={mounted ? themeToUse : undefined}
						data-testid={t.testId}
						className={t.className}
						style={
							{
								...(dragStyle ?? {}),
								["--ht-index" as any]: idx,
							} as React.CSSProperties
						}
						onPointerEnter={() => onPointerEnter(t.id)}
						onPointerLeave={() => onPointerLeave(t.id)}
						{...(dataAttrs as any)}
						{...swipeHandlers}
					>
						<div data-ht-toast-inner>
							{/* icon */}
							<div data-ht-icon>{iconFor(t)}</div>

							{/* content */}
							<div data-ht-content>
								{contentTitle != null ? <div data-ht-title>{contentTitle}</div> : null}
								{contentDesc != null ? <div data-ht-description>{contentDesc}</div> : null}
							</div>

							{/* actions */}
							<div data-ht-actions>
								{renderAction(t, "cancel")}
								{renderAction(t, "action")}

								{t.closeButton && t.dismissible ? (
									<button
										type="button"
										data-ht-close
										aria-label="Close toast"
										onClick={() => store.dismiss(t.id, { reason: "user" })}
									>
										×
									</button>
								) : null}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
