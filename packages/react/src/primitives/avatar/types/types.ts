export type AvatarLoadingStatus = "idle" | "loading" | "loaded" | "error";

export type UseAvatarOptions = {
    /**
     * Optional default handler for status changes.
     * Individual images can still provide their own handler.
     */
    onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export type AvatarContextProps = {
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


export type RootElement = HTMLSpanElement;
export type RootProps = React.ComponentPropsWithoutRef<"span"> & {
    asChild?: boolean;
    onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export type ImageElement = HTMLImageElement;

export type ImageProps = React.ComponentPropsWithoutRef<"img"> & {
    asChild?: boolean;
    onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

export type FallbackElement = HTMLSpanElement;

export type FallbackProps = React.ComponentPropsWithoutRef<"span"> & {
    asChild?: boolean;
    delayMs?: number;
};