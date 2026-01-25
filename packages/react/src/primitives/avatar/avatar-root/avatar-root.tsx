import { forwardRef } from "react";
import { useAvatar } from "../hooks/useAvatar";
import { AvatarContext } from "../avatar-context";
import type { RootElement, RootProps } from "../types";
import { Slot } from "@/primitives/slot/slot";

const Root = forwardRef<RootElement, RootProps>(function AvatarRoot(
    { asChild = false, onLoadingStatusChange, ...props },
    forwardedRef
) {
    const avatar = useAvatar({ onLoadingStatusChange });
    const Comp: any = asChild ? Slot : "span";

    return (
        <AvatarContext.Provider value={avatar}>
            <Comp ref={forwardedRef} {...props} />
        </AvatarContext.Provider>
    );
});

Root.displayName = "Avatar.Root";

export { Root };