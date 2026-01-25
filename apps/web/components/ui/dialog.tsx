// packages/ui/src/components/dialog.tsx
"use client";

import * as React from "react";
import { cn } from "../../lib/util";

import { Dialog as DialogPrimitive } from "@haitch-ui/react/dialog";
import type {
  DialogRootProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogCloseProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from "@haitch-ui/react/dialog";

import { IconX } from "@tabler/icons-react";

/* -------------------------------------------------------------------------------------------------
 * Root / Trigger / Portal
 * ------------------------------------------------------------------------------------------------- */

const Dialog = DialogPrimitive.Root;

const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(function DialogTrigger(
  { className, ...props },
  ref
) {
  return <DialogPrimitive.Trigger ref={ref} className={className} {...props} />;
});

function DialogPortal(props: DialogPortalProps) {
  return <DialogPrimitive.Portal {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Overlay
 * ------------------------------------------------------------------------------------------------- */

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(function DialogOverlay(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

type ShadcnDialogContentProps = DialogContentProps & {
  /** If true, renders default close button (top-right) */
  showClose?: boolean;
};

const DialogContent = React.forwardRef<HTMLDivElement, ShadcnDialogContentProps>(function DialogContent(
  { className, children, showClose = true, ...props },
  ref
) {
  return (
    <DialogPortal container={props.container}>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4",
          "border bg-background p-6 shadow-lg outline-none rounded-ui-radius",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}

        {showClose ? (
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
              "hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:pointer-events-none"
            )}
          >
            <IconX className="h-4 w-4" />
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Close
 * ------------------------------------------------------------------------------------------------- */

const DialogClose = React.forwardRef<HTMLElement, DialogCloseProps>(function DialogClose(
  { className, ...props },
  ref
) {
  return <DialogPrimitive.Close ref={ref} className={className} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Header / Footer
 * ------------------------------------------------------------------------------------------------- */

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(function DialogHeader(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
});

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(function DialogFooter(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------------------------------
 * Title / Description
 * ------------------------------------------------------------------------------------------------- */

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { className, ...props },
  ref
) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, ...props }, ref) {
    return (
      <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

/* -------------------------------------------------------------------------------------------------
 * Exports (shadcn shape)
 * ------------------------------------------------------------------------------------------------- */

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
