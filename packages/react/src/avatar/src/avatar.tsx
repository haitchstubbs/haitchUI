// packages/react/avatar/avatar.tsx
"use client";

import * as React from "react";
import { Slot } from "@/slot/src";
import {
	type AvatarEngine,
	type AvatarLoadingStatus,
	useAvatarEngine,
	useAvatarFallbackVisible,
} from "./engine";

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const AvatarContext = React.createContext<AvatarEngine | null>(null);

function useAvatarContext(component: string) {
	const ctx = React.useContext(AvatarContext);
	if (!ctx) throw new Error(`${component} must be used within Avatar.Root`);
	return ctx;
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

type RootElement = HTMLSpanElement;

export type RootProps = React.ComponentPropsWithoutRef<"span"> & {
	asChild?: boolean;
	onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export const Root = React.forwardRef<RootElement, RootProps>(function AvatarRoot(
	{ asChild = false, onLoadingStatusChange, ...props },
	forwardedRef
) {
	const engine = useAvatarEngine({ onLoadingStatusChange });
	const Comp: any = asChild ? Slot : "span";

	return (
		<AvatarContext.Provider value={engine}>
			<Comp ref={forwardedRef} {...props} />
		</AvatarContext.Provider>
	);
});

Root.displayName = "Avatar.Root";

/* -------------------------------------------------------------------------------------------------
 * Image
 * -----------------------------------------------------------------------------------------------*/

type ImageElement = HTMLImageElement;

export type ImageProps = React.ComponentPropsWithoutRef<"img"> & {
	asChild?: boolean;
	onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export const Image = React.forwardRef<ImageElement, ImageProps>(function AvatarImage(
	{ asChild = false, onLoadingStatusChange, ...props },
	forwardedRef
) {
	const engine = useAvatarContext("Avatar.Image");
	const Comp: any = asChild ? Slot : "img";

	return (
		<Comp
			{...engine.getImageProps<ImageElement>({
				...(props as React.ComponentPropsWithoutRef<"img">),
				ref: forwardedRef,
				onLoadingStatusChange,
			})}
		/>
	);
});

Image.displayName = "Avatar.Image";

/* -------------------------------------------------------------------------------------------------
 * Fallback
 * -----------------------------------------------------------------------------------------------*/

type FallbackElement = HTMLSpanElement;

export type FallbackProps = React.ComponentPropsWithoutRef<"span"> & {
	asChild?: boolean;
	delayMs?: number;
};

export const Fallback = React.forwardRef<FallbackElement, FallbackProps>(
	function AvatarFallback({ asChild = false, delayMs, ...props }, forwardedRef) {
		const engine = useAvatarContext("Avatar.Fallback");
		const visible = useAvatarFallbackVisible(engine.loadingStatus, delayMs);

		if (!visible) return null;

		const Comp: any = asChild ? Slot : "span";
		return <Comp ref={forwardedRef} {...props} />;
	}
);

Fallback.displayName = "Avatar.Fallback";

/* -------------------------------------------------------------------------------------------------
 * Exports (Radix-ish)
 * -----------------------------------------------------------------------------------------------*/

export const Avatar = { Root, Image, Fallback };
export type { AvatarLoadingStatus };
