export { AvatarContext, useAvatarContext } from "./avatar-context";
export { AvatarFallback } from "./avatar-fallback";
export { AvatarImage } from "./avatar-image";
export { AvatarRoot } from "./avatar-root";
export { useAvatarFallbackVisible } from "./hooks/useAvatarFallback";
export { useAvatar } from "./hooks/useAvatar";

export type {
	AvatarLoadingStatus,
	UseAvatarOptions,
	AvatarContextProps,
	RootElement as AvatarRootElement,
	RootProps as AvatarRootProps,
	ImageElement as AvatarImageElement,
	ImageProps as AvatarImageProps,
	FallbackElement as AvatarFallbackElement,
	FallbackProps as AvatarFallbackProps,
} from "./types";
