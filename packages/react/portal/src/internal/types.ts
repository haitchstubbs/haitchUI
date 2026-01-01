export type VirtualElement = {
	getBoundingClientRect: () => DOMRect;
	contextElement?: Element | null;
};

export type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};


export type OverlayDOM = {
	getDocument?: () => Document;
	getRootNode?: () => Document | ShadowRoot;
	getPortalContainer?: () => HTMLElement;

	/**
	 * Shadow DOM safe outside detection.
	 * Default uses event.composedPath() when available.
	 */
	isEventOutside?: (event: Event, inside: Array<Element | null | undefined>) => boolean;

	/**
	 * Canvas/WebGL: create a virtual reference for positioning.
	 */
	createVirtualElement?: (rect: Rect, options?: { contextElement?: Element | null }) => VirtualElement;

	/**
	 * Optional overrides.
	 */
	getActiveElement?: () => Element | null;
	getOwnerDocument?: (node: Node | null | undefined) => Document;
};

export type ResolvedDOM = {
	getDocument: () => Document;
	getRootNode: () => Document | ShadowRoot;
	getPortalContainer: () => HTMLElement;
	isEventOutside: (event: Event, inside: Array<Element | null | undefined>) => boolean;
	createVirtualElement: (rect: Rect, options?: { contextElement?: Element | null }) => VirtualElement;
	getActiveElement: () => Element | null;
	getOwnerDocument: (node: Node | null | undefined) => Document;
};