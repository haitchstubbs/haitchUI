// app/components/[slug]/use-right-toc.ts
"use client";

import * as React from "react";

export type TocItem = {
	id: string;
	text: string;
	level: 1 | 2 | 3 | 4 | 5;
	el: HTMLElement;
};

export type UseRightTocOptions = {
	basePath: string;
	containerId?: string;
	selector?: string;

	/**
	 * Headings inside any of these containers will be ignored.
	 * Keep it as selectors (uses Element.closest()).
	 */
	ignoreParents?: string[];

	/**
	 * If you have a sticky header, offset the "active" boundary from the top.
	 * This is used for IO rootMargin and scroll fallback.
	 */
	topOffsetPx?: number;

	/**
	 * If true, skip the first heading item (often the page title).
	 * Your existing UI does items.slice(1), so default true.
	 */
	skipFirst?: boolean;
};

const DEFAULT_IGNORE_PARENTS = ["pre", "code", "[data-code-preview]", ".code-preview"];

function slugify(input: string) {
	return input
		.toLowerCase()
		.trim()
		.replace(/['"]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

function headingLevelFromTag(tagName: string): 1 | 2 | 3 | 4 | 5 {
	const t = tagName.toLowerCase();
	if (t === "h1") return 1;
	if (t === "h2") return 2;
	if (t === "h3") return 3;
	if (t === "h4") return 4;
	return 5;
}

function getHashId(): string {
	if (typeof window === "undefined") return "";
	const raw = window.location.hash;
	if (!raw || raw.length < 2) return "";
	try {
		return decodeURIComponent(raw.slice(1));
	} catch {
		return raw.slice(1);
	}
}

function isIgnored(el: HTMLElement, ignoreParents: string[]) {
	return ignoreParents.some((sel) => !!el.closest(sel));
}

function rafThrottle<T extends (...args: any[]) => void>(fn: T) {
	let raf = 0;
	let lastArgs: any[] | null = null;

	const run = () => {
		raf = 0;
		if (!lastArgs) return;
		fn(...lastArgs);
		lastArgs = null;
	};

	return (...args: any[]) => {
		lastArgs = args;
		if (raf) return;
		raf = window.requestAnimationFrame(run);
	};
}

function sameToc(a: TocItem[], b: TocItem[]) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i]!.id !== b[i]!.id || a[i]!.text !== b[i]!.text || a[i]!.level !== b[i]!.level) return false;
	}
	return true;
}

function shouldHideForScreenWidth() {
	if (typeof window === "undefined") return false;
	return window.innerWidth < 1024; // example: hide on screens smaller than 1024px
}

export function useToc({
	basePath,
	containerId = "docs-content",
	selector = "h1, h2, h3, h4, h5",
	ignoreParents = DEFAULT_IGNORE_PARENTS,
	topOffsetPx = 96,
	skipFirst = true,
}: UseRightTocOptions) {
	const [items, setItems] = React.useState<TocItem[]>([]);
	const [activeId, setActiveId] = React.useState<string | null>(null);
	const [isHidden, setIsHidden] = React.useState<boolean>(shouldHideForScreenWidth());
	// We keep a stable ref to the latest items for observers without re-subscribing too often.
	const itemsRef = React.useRef<TocItem[]>([]);
	React.useEffect(() => {
		itemsRef.current = items;
	}, [items]);


	const rebuild = React.useCallback(() => {
		const container = document.getElementById(containerId);
		if (!container) {
			setItems([]);
			setActiveId(null);
			return;
		}

		const headings = Array.from(container.querySelectorAll(selector)) as HTMLElement[];

		// Track IDs already present in the DOM to avoid duplicates when generating.
		const existingIds = new Set<string>();
		// Only within container is enough, but document-wide is safer if your page has repeated IDs.
		document.querySelectorAll("[id]").forEach((n) => {
			const id = (n as HTMLElement).id;
			if (id) existingIds.add(id);
		});

		const used = new Map<string, number>();
		const next: TocItem[] = [];

		for (const el of headings) {
			if (isIgnored(el, ignoreParents)) continue;

			const text = (el.textContent ?? "").trim();
			if (!text) continue;

			let id = el.id?.trim();

			// If no id (or empty), generate one with collision handling.
			if (!id) {
				const base = slugify(text) || "section";
				// Start with count based on base usage
				let count = (used.get(base) ?? 0) + 1;
				used.set(base, count);

				let candidate = count === 1 ? base : `${base}-${count}`;

				// If candidate exists in DOM already, keep incrementing until it's unique.
				while (existingIds.has(candidate)) {
					count += 1;
					used.set(base, count);
					candidate = `${base}-${count}`;
				}

				id = candidate;
				el.id = id;
				existingIds.add(id);
			}

			const level = headingLevelFromTag(el.tagName);
			next.push({ id, text, level, el });
		}

		setItems((prev) => (sameToc(prev, next) ? prev : next));

		// Prefer hash if it matches a real item.
		const hash = getHashId();
		if (hash && next.some((x) => x.id === hash)) {
			setActiveId(hash);
			return;
		}

		// Otherwise choose first "content" heading.
		const nextActive = hash && next.some((x) => x.id === hash) ? hash : (next[skipFirst ? 1 : 0]?.id ?? next[0]?.id ?? null);

		setActiveId((prev) => (prev === nextActive ? prev : nextActive));
	}, [containerId, selector, ignoreParents, skipFirst]);

	// Initial build + respond to changes in inputs.
	React.useEffect(() => {
		rebuild();

		if (process.env.NODE_ENV !== "production") {
			const container = document.getElementById(containerId);

			console.groupCollapsed("[useRightToc] rebuild", { basePath, containerId, selector });
			console.log("container exists:", !!container);
			console.log(
				"found headings:",
				itemsRef.current.map((item) => ({
					tag: item.el.tagName,
					id: item.id,
					text: item.text.slice(0, 80),
					ignored: ignoreParents.some((sel) => !!item.el.closest(sel)),
					path: item.el.closest("main")?.id,
				})),
			);
			console.groupEnd();
		}
	}, [rebuild, basePath, containerId, selector, ignoreParents]);

	// Rebuild when the MDX content changes (late renders, client islands, etc.)
	React.useEffect(() => {
		const container = document.getElementById(containerId);
		if (!container) return;

		const mo = new MutationObserver(() => {
			// rAF keeps it from thrashing when a bunch of nodes change.
			window.requestAnimationFrame(rebuild);
		});

		mo.observe(container, {
			subtree: true,
			childList: true,
			characterData: true,
		});

		return () => mo.disconnect();
	}, [containerId, rebuild]);

	// Keep activeId in sync with hash changes (user clicks, back/forward, manual edits).
	React.useEffect(() => {
		const onHash = () => {
			const hash = getHashId();
			if (!hash) return;

			const next = itemsRef.current;
			if (next.some((x) => x.id === hash)) setActiveId(hash);
		};

		window.addEventListener("hashchange", onHash, { passive: true });
		return () => window.removeEventListener("hashchange", onHash);
	}, []);

	// Scrollspy: IntersectionObserver + fallback.
	React.useEffect(() => {
		const container = document.getElementById(containerId);
		const currentItems = itemsRef.current;
		if (!container || !currentItems.length) return;

		const startIndex = skipFirst ? 1 : 0;
		const observed = currentItems.slice(startIndex);

		if (!observed.length) return;

		// Keep "best" candidates around.
		// Store last known top so we can choose consistently.
		const visible = new Map<string, number>();

		const computeAndSetBest = rafThrottle(() => {
			if (!visible.size) return;

			// Rule:
			// - Prefer headings that are above the boundary (top <= topOffsetPx) but closest to it
			// - Otherwise, choose the smallest top (closest to boundary from below)
			let bestId: string | null = null;
			let bestScore = Number.POSITIVE_INFINITY;

			for (const [id, top] of visible) {
				// Normalize: boundary is topOffsetPx
				const delta = top - topOffsetPx;

				// If above boundary, score by absolute distance (small negative = close above)
				// If below boundary, score by delta (small positive = close below)
				const score = delta <= 0 ? Math.abs(delta) : 100000 + delta; // strongly prefer above-boundary when available

				if (score < bestScore) {
					bestScore = score;
					bestId = id;
				}
			}

			if (bestId) setActiveId(bestId);
		});

		const supportsIO = typeof window !== "undefined" && "IntersectionObserver" in window;

		if (supportsIO) {
			const io = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						const id = (entry.target as HTMLElement).id;
						if (!id) continue;

						if (entry.isIntersecting) {
							visible.set(id, entry.boundingClientRect.top);
						} else {
							visible.delete(id);
						}
					}
					computeAndSetBest();
				},
				{
					root: null,
					// Activate once it passes below sticky header.
					rootMargin: `-${topOffsetPx}px 0px -70% 0px`,
					threshold: [0, 1],
				},
			);

			for (const it of observed) {
				// Skip ignored nodes defensively (in case items were built from older DOM snapshot)
				if (isIgnored(it.el, ignoreParents)) continue;
				io.observe(it.el);
			}

			return () => io.disconnect();
		}

		// Fallback: scroll + resize scanning.
		const onScroll = rafThrottle(() => {
			const hash = getHashId();
			// Hash wins if valid (prevents scrollspy fighting anchor navigation)
			if (hash && currentItems.some((x) => x.id === hash)) {
				setActiveId(hash);
				return;
			}

			const boundary = topOffsetPx + 1;

			let bestId: string | null = null;
			let bestDistance = Number.POSITIVE_INFINITY;

			for (const it of observed) {
				if (!it.el.isConnected) continue;
				const rect = it.el.getBoundingClientRect();

				// Consider headings that have crossed boundary (rect.top <= boundary).
				if (rect.top <= boundary) {
					const distance = boundary - rect.top; // smaller = closer to boundary
					if (distance < bestDistance) {
						bestDistance = distance;
						bestId = it.id;
					}
				}
			}

			// If nothing crossed yet, pick the first observed item.
			setActiveId(bestId ?? observed[0]?.id ?? null);
		});

		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		// Run once initially.
		onScroll();

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [containerId, ignoreParents, skipFirst, topOffsetPx, items]);

	const linkFor = React.useCallback((id: string) => `${basePath}#${encodeURIComponent(id)}`, [basePath]);

	return {
		isHidden,
		items,
		activeId,
		setActiveId, // exposed for click handlers if you ever want to set it eagerly
		rebuild, // exposed in case you want manual rebuild (rare)
		linkFor,
	};
}
