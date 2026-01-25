export type {
	Side as CoreSide,
	Align as CoreAlign,
	SelectedState as CoreSelectedState,
	FloatingPlacement as CoreFloatingPlacement,
	FloatingReference as CoreFloatingReference,
	FloatingMiddleware as CoreFloatingMiddleware,
	ReferenceType as CoreReferenceType,
} from "./src/types/portal.types.js";

export { Portal as CorePortal } from "./src/components/FloatingPortal.js";
export { FloatingFocusManager as CoreFloatingFocusManager } from "./src/components/FloatingFocusManager.js";

export {
	useFloating,
	useHover,
	useDismiss,
	useInteractions,
	useRole,
	useTransitionStyles,
	autoUpdate,
	useClick,
} from "./src/hooks/floating.hooks.js";

export { resolveRenderTarget } from "./src/util/public/resolveRenderTarget.js";

export { Placement as CorePlacement } from "./src/services/placement.service.js";
export { MenuFocus as CoreMenuFocus } from "./src/services/menufocus.service.js";
