import * as React from "react";
import type {
  AvatarContextProps,
  AvatarLoadingStatus,
  UseAvatarOptions,
} from "../types";
import { composeRefs } from "@/utils/compose-refs";

type PerImageState = {
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
  src?: string;
};

export function useAvatar(options: UseAvatarOptions = {}): AvatarContextProps {
  const defaultHandlerRef = React.useRef(options.onLoadingStatusChange);
  React.useEffect(() => {
    defaultHandlerRef.current = options.onLoadingStatusChange;
  }, [options.onLoadingStatusChange]);

  const [loadingStatus, setLoadingStatus] =
    React.useState<AvatarLoadingStatus>("idle");

  // Per DOM node state (does not prevent GC)
  const perNodeRef = React.useRef<WeakMap<HTMLElement, PerImageState> | null>(null);
  if (!perNodeRef.current) perNodeRef.current = new WeakMap();
  const perNode = perNodeRef.current;

  // Keep the function stable; use refs/maps for handlers.
  const getImageProps = React.useCallback(
    (<T extends HTMLElement = HTMLImageElement>(
      props: React.ComponentPropsWithoutRef<"img"> & {
        ref?: React.Ref<T>;
        onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
      }
    ): React.ComponentPropsWithoutRef<"img"> & { ref: React.RefCallback<T> } => {
      const {
        ref: theirRef,
        onLoad,
        onError,
        onLoadingStatusChange,
        src,
        ...rest
      } = props;

      const emit = (node: T | null, next: AvatarLoadingStatus) => {
        setLoadingStatus(next);

        if (node) {
          const st = perNode.get(node as unknown as HTMLElement);
          st?.onLoadingStatusChange?.(next);
        }

        defaultHandlerRef.current?.(next);
      };

      const setNode = (node: T | null) => {
        // Unregister previous nodes automatically by GC; no need to delete
        // but we *do* want to keep per-node handler in sync when we have a node.
        if (node) {
          perNode.set(node as unknown as HTMLElement, {
            onLoadingStatusChange,
            src,
          });
        }

        // Sync initial state once we have a node.
        if (!src) {
          emit(node, "idle");
          return;
        }

        // Only introspect if it's a real <img>. If asChild uses something else,
        // rely on events to drive status.
        if (typeof window === "undefined") return;

        const img = node instanceof HTMLImageElement ? node : null;
        if (!img) {
          emit(node, "loading");
          return;
        }

        if (img.complete) {
          emit(node, img.naturalWidth > 0 ? "loaded" : "error");
        } else {
          emit(node, "loading");
        }
      };

      const mergedRef = composeRefs<T>(
        theirRef as React.Ref<T> | undefined,
        setNode
      );

      return {
        ...(rest as React.ComponentPropsWithoutRef<"img">),
        src,
        // Note: do NOT pass onLoadingStatusChange to the DOM.
        onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
          onLoad?.(e);

          // Use currentTarget if possible; it will be the <img> even if bubbling.
          const node = (e.currentTarget ?? null) as unknown as T | null;
          emit(node, "loaded");
        },
        onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
          onError?.(e);
          const node = (e.currentTarget ?? null) as unknown as T | null;
          emit(node, "error");
        },
        ref: mergedRef,
      };
    }) satisfies AvatarContextProps["getImageProps"],
    []
  );

  return React.useMemo(
    () => ({
      loadingStatus,
      setLoadingStatus,
      getImageProps,
    }),
    [loadingStatus, getImageProps]
  );
}
