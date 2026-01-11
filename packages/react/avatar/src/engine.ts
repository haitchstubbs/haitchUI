// packages/react/avatar/engine.ts
"use client";

import * as React from "react";
import { composeRefs } from "@haitch-ui/react-compose-refs";

export type AvatarLoadingStatus = "idle" | "loading" | "loaded" | "error";

export type UseAvatarEngineOptions = {
	/**
	 * Optional default handler for status changes.
	 * Individual images can still provide their own handler.
	 */
	onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export type AvatarEngine = {
	loadingStatus: AvatarLoadingStatus;
	setLoadingStatus: (next: AvatarLoadingStatus) => void;

	/**
	 * Build props for an <img> (or an asChild image) that:
	 * - emits status changes
	 * - handles cached/hydrated "complete" fast-path when underlying node is HTMLImageElement
	 */
	getImageProps: <T extends HTMLElement = HTMLImageElement>(
		props: React.ComponentPropsWithoutRef<"img"> & {
			ref?: React.Ref<T>;
			onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
		}
	) => React.ComponentPropsWithoutRef<"img"> & { ref: React.RefCallback<T> };
};

/**
 * Headless Avatar engine.
 * Use directly for custom render trees, or via the compound components.
 */
export function useAvatarEngine(
	options: UseAvatarEngineOptions = {}
): AvatarEngine {
	const defaultHandlerRef = React.useRef(options.onLoadingStatusChange);
	React.useEffect(() => {
		defaultHandlerRef.current = options.onLoadingStatusChange;
	}, [options.onLoadingStatusChange]);

	const [loadingStatus, setLoadingStatus] =
		React.useState<AvatarLoadingStatus>("idle");

	// Keep the function stable; use refs for handlers.
	const getImageProps = React.useCallback(
		<T extends HTMLElement = HTMLImageElement>(
			props: React.ComponentPropsWithoutRef<"img"> & {
				ref?: React.Ref<T>;
				onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
			}
		): React.ComponentPropsWithoutRef<"img"> & { ref: React.RefCallback<T> } => {
			const {
				ref: theirRef,
				onLoad,
				onError,
				onLoadingStatusChange,
				src,
				...rest
			} = props;

			const perImageHandlerRef = React.useRef(onLoadingStatusChange);
			React.useEffect(() => {
				perImageHandlerRef.current = onLoadingStatusChange;
			}, [onLoadingStatusChange]);

			const emit = (next: AvatarLoadingStatus) => {
				setLoadingStatus(next);
				perImageHandlerRef.current?.(next);
				defaultHandlerRef.current?.(next);
			};

			// We need a stable ref callback that can run the "complete" fast-path.
			const setNode = (node: T | null) => {
				// Sync initial state once we have a node.
				if (!src) {
					emit("idle");
					return;
				}

				// Only introspect if it's a real <img>. If asChild uses something else,
				// rely on events to drive status.
				if (typeof window === "undefined") return;

				const img = node instanceof HTMLImageElement ? node : null;
				if (!img) {
					emit("loading");
					return;
				}

				if (img.complete) {
					emit(img.naturalWidth > 0 ? "loaded" : "error");
				} else {
					emit("loading");
				}
			};

			const mergedRef = composeRefs<T>(
				theirRef as React.Ref<T> | undefined,
				setNode
			);

			return {
				...(rest as React.ComponentPropsWithoutRef<"img">),
				src,
				// Let your Slot compose event handlers when asChild is used.
				onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
					onLoad?.(e);
					emit("loaded");
				},
				onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
					onError?.(e);
					emit("error");
				},
				ref: mergedRef,
			};
		},
		[]
	) satisfies AvatarEngine["getImageProps"];

	return React.useMemo(
		() => ({
			loadingStatus,
			setLoadingStatus,
			getImageProps,
		}),
		[loadingStatus, getImageProps]
	);
}

/**
 * Visibility helper for fallback with delay.
 * Keeps timers minimal: only runs when fallback is actually needed.
 */
export function useAvatarFallbackVisible(
	loadingStatus: AvatarLoadingStatus,
	delayMs?: number
) {
	const shouldShow = loadingStatus !== "loaded";

	const [visible, setVisible] = React.useState(() => {
		if (!shouldShow) return false;
		return delayMs == null;
	});

	React.useEffect(() => {
		if (!shouldShow) {
			setVisible(false);
			return;
		}

		if (delayMs == null) {
			setVisible(true);
			return;
		}

		setVisible(false);
		const t = window.setTimeout(() => setVisible(true), delayMs);
		return () => window.clearTimeout(t);
	}, [shouldShow, delayMs]);

	return shouldShow && visible;
}
