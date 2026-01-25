import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { ImageElement, ImageProps } from "../types";
import { useAvatarContext } from "../avatar-context";
import { Slot } from "@/primitives/slot/slot";

const Image = forwardRef<ImageElement, ImageProps>(function AvatarImage({ asChild = false, onLoadingStatusChange, ...props }, forwardedRef) {
	const engine = useAvatarContext("Avatar.Image");
	const Comp: any = asChild ? Slot : "img";

	return (
		<Comp
			{...engine.getImageProps<ImageElement>({
				...(props as ComponentPropsWithoutRef<"img">),
				ref: forwardedRef,
				onLoadingStatusChange,
			})}
		/>
	);
});

Image.displayName = "Avatar.Image";

export { Image };
