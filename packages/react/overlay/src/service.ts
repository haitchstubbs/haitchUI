import type { OverlayDOM, ResolvedDOM } from "./types.js";

type VirtualElement = {
	getBoundingClientRect: () => DOMRect;
	contextElement?: Element | null;
};

type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

/**
 * OverlayDOMManager
 * - Holds resolved dom functions (with defaults)
 * - Implements merging / nested provider overrides
 * - Implements shadow-dom safe outside detection
 * - Provides virtual element creation for canvas/webgl
 *
 * No React imports. Safe to use anywhere.
 */
export class DOM {
	public readonly dom: ResolvedDOM;

	private constructor(dom: ResolvedDOM) {
		this.dom = dom;
	}

	static default(): DOM {
		return new DOM(DOM.resolve(undefined));
	}

	/**
	 * Create a new manager with child overrides applied on top of this manager.
	 */
	fork(child?: OverlayDOM): DOM {
		if (!child) return this;

		const parent = this.dom;

		const merged: OverlayDOM = {
			getDocument: child.getDocument ?? parent.getDocument,
			getRootNode: child.getRootNode ?? parent.getRootNode,
			getPortalContainer: child.getPortalContainer ?? parent.getPortalContainer,
			isEventOutside: child.isEventOutside ?? parent.isEventOutside,
			createVirtualElement: child.createVirtualElement ?? parent.createVirtualElement,
			getActiveElement: child.getActiveElement ?? parent.getActiveElement,
			getOwnerDocument: child.getOwnerDocument ?? parent.getOwnerDocument,
		};

		return new DOM(DOM.resolve(merged));
	}

	/**
	 * Convenience wrappers.
	 */
	isEventOutside(event: Event, inside: Array<Element | null | undefined>): boolean {
		return this.dom.isEventOutside(event, inside);
	}

	createVirtualElement(rect: Rect, options?: { contextElement?: Element | null }): VirtualElement {
		return this.dom.createVirtualElement(rect, options);
	}

	// -------------------------
	// Resolution + Defaults
	// -------------------------

	private static resolve(input?: OverlayDOM): ResolvedDOM {
		const getDocument = input?.getDocument ?? DOM.defaultGetDocument;
		const getOwnerDocument = input?.getOwnerDocument ?? ((node) => DOM.defaultGetOwnerDocument(node, getDocument));
		const getRootNode = input?.getRootNode ?? (() => getDocument());
		const getPortalContainer = input?.getPortalContainer ?? (() => DOM.defaultGetPortalContainer(getDocument));
		const isEventOutside = input?.isEventOutside ?? DOM.defaultIsEventOutside;
		const createVirtualElement = input?.createVirtualElement ?? DOM.defaultCreateVirtualElement;
		const getActiveElement = input?.getActiveElement ?? (() => getDocument().activeElement);

		return {
			getDocument,
			getRootNode,
			getPortalContainer,
			isEventOutside,
			createVirtualElement,
			getActiveElement,
			getOwnerDocument,
		};
	}

	private static defaultGetDocument(): Document {
		// IMPORTANT: don't reference `document` directly (ReferenceError in SSR)
		const d = (globalThis as unknown as { document?: Document }).document;
		if (d) return d;

		throw new Error(
			"[haitch/core] document is not available. " +
				"This code was executed in a non-DOM environment (SSR / Node). " +
				"Ensure DOM-dependent code runs only on the client, or provide a dom/getDocument override."
		);
	}
	private static defaultGetOwnerDocument(node: Node | null | undefined, getDocument: () => Document): Document {
		return (node && (node as any).ownerDocument) || getDocument();
	}

	private static defaultGetPortalContainer(getDocument: () => Document): HTMLElement {
		const doc = getDocument();
		if (!doc.body) {
			throw new Error("OverlayDOM: document.body is not available. Provide getPortalContainer().");
		}
		return doc.body;
	}

	/**
	 * Shadow DOM safe outside detection.
	 * Uses composedPath() when available.
	 */
	private static defaultIsEventOutside(event: Event, inside: Array<Element | null | undefined>): boolean {
		const insideEls = inside.filter(Boolean) as Element[];

		const anyEvent = event as any;
		const path: EventTarget[] | null = typeof anyEvent.composedPath === "function" ? anyEvent.composedPath() : null;

		if (path && path.length) {
			for (const el of insideEls) {
				if (path.includes(el)) return false;
			}
			return true;
		}

		const target = event.target as Node | null;
		if (!target) return true;

		for (const el of insideEls) {
			if (el === target) return false;
			if ((el as any).contains && (el as any).contains(target)) return false;
		}

		return true;
	}

	private static defaultCreateVirtualElement(rect: Rect, options?: { contextElement?: Element | null }): VirtualElement {
		return {
			getBoundingClientRect: () => new DOMRect(rect.x, rect.y, rect.width, rect.height),
			contextElement: options?.contextElement ?? null,
		};
	}
}
