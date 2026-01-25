import { forwardRef } from "react";
import { useAlertDialogContext } from "../alert-dialog-context";

export type AlertDialogOverlayProps = React.ComponentPropsWithoutRef<"div">;

export const Overlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(function Overlay(
    { style, ...props },
    forwardedRef
) {
    const { open, isMounted, transitionStyles } = useAlertDialogContext("AlertDialog.Overlay");

    if (!isMounted) return null;

    return (
        <div
            data-slot="alert-dialog-overlay"
            data-state={open ? "open" : "closed"}
            {...props}
            ref={forwardedRef}
            style={{
                opacity: open ? 1 : 0,
                transition: transitionStyles.transition,
                ...style,
            }}
        />
    );
});