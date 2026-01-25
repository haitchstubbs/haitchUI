import { forwardRef } from "react";
import type { FallbackElement, FallbackProps } from "../types";
import { useAvatarContext } from "../avatar-context";
import { useAvatarFallbackVisible } from "../hooks/useAvatarFallback";
import { Slot } from "@/primitives/slot/slot";

const Fallback = forwardRef<FallbackElement, FallbackProps>(
	function AvatarFallback({ asChild = false, delayMs, ...props }, forwardedRef) {
		const engine = useAvatarContext("Avatar.Fallback");
		const visible = useAvatarFallbackVisible(engine.loadingStatus, delayMs);

		if (!visible) return null;

		const Comp: any = asChild ? Slot : "span";
		return <Comp ref={forwardedRef} {...props} />;
	}
);

Fallback.displayName = "Avatar.Fallback";

export { Fallback };