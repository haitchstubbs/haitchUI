// packages/react/avatar/index.ts
export { Avatar, Root, Image, Fallback } from "./avatar";
export type { RootProps, ImageProps, FallbackProps } from "./avatar";

export {
	useAvatarEngine,
	useAvatarFallbackVisible,
	type AvatarEngine,
	type AvatarLoadingStatus,
} from "./engine";
