// packages/react/dialog/src/dialog.tsx
"use client";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { Slot } from "@haitch/react-slot";
import { composeRefs } from "@haitch/react-compose-refs";
import { useOverlayDOMManager, type OverlayDOM } from "@haitch/react-overlay";

type DialogContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;

  disabled: boolean;
  modal: boolean;

  closeOnEscape: boolean;
  closeOnOutsidePress: boolean;

  titleId: string;
  descriptionId: string;
  contentId: string;

  triggerRef: React.RefObject<HTMLElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  lastActiveElementRef: React.RefObject<HTMLElement | null>;

  portalRoot: HTMLElement | null;
  dom: OverlayDOM;

  isMounted: boolean;
  transitionStyles: React.CSSProperties;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(componentName: string): DialogContextValue {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error(`${componentName} must be used within <Dialog.Root>.`);
  return ctx;
}

function useControllableOpen(opts: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled: boolean;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultOpen ?? false);
  const controlled = typeof opts.open === "boolean";
  const open = controlled ? (opts.open as boolean) : uncontrolled;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (opts.disabled) return;
      if (!controlled) setUncontrolled(next);
      opts.onOpenChange?.(next);
    },
    [controlled, opts.disabled, opts.onOpenChange]
  );

  return { open, setOpen };
}

function getFocusableWithin(root: HTMLElement): HTMLElement[] {
  const candidates = root.querySelectorAll<HTMLElement>(
    [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(",")
  );

  return Array.from(candidates).filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.hidden) return false;
    return true;
  });
}

function usePresence(open: boolean, durations?: { open?: number; close?: number }) {
  const openMs = durations?.open ?? 120;
  const closeMs = durations?.close ?? 100;

  const [isMounted, setIsMounted] = React.useState(open);
  const [styles, setStyles] = React.useState<React.CSSProperties>(() => ({
    opacity: open ? 1 : 0,
    transform: open ? "scale(1)" : "scale(0.95)",
  }));

  const rafRef = React.useRef<number | null>(null);
  const tRef = React.useRef<number | null>(null);

  const clearTimers = React.useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (tRef.current != null) {
      window.clearTimeout(tRef.current);
      tRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    clearTimers();

    if (open) {
      setIsMounted(true);
      setStyles({ opacity: 0, transform: "scale(0.95)" });

      rafRef.current = requestAnimationFrame(() => {
        setStyles({
          opacity: 1,
          transform: "scale(1)",
          transition: `opacity ${openMs}ms ease, transform ${openMs}ms ease`,
        });
      });

      return () => clearTimers();
    }

    setStyles({
      opacity: 0,
      transform: "scale(0.95)",
      transition: `opacity ${closeMs}ms ease, transform ${closeMs}ms ease`,
    });

    tRef.current = window.setTimeout(() => setIsMounted(false), closeMs);
    return () => clearTimers();
  }, [open, openMs, closeMs, clearTimers]);

  return { isMounted, styles };
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------------------------------- */

export type DialogRootProps = {
  dom?: OverlayDOM;

  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;

  modal?: boolean;
  disabled?: boolean;

  closeOnEscape?: boolean;
  closeOnOutsidePress?: boolean;

  children: React.ReactNode;
};

function Root({
  dom: domOverride,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,

  modal = true,
  disabled = false,

  closeOnEscape = true,
  closeOnOutsidePress = true,

  children,
}: DialogRootProps) {
  const parentManager = useOverlayDOMManager();
  const manager = React.useMemo(() => parentManager.fork(domOverride), [parentManager, domOverride]);
  const dom = manager.dom;

  const { open, setOpen } = useControllableOpen({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
  });

  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);

  const titleId = React.useId();
  const descriptionId = React.useId();
  const contentId = React.useId();

  const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setPortalRoot(dom.getPortalContainer());
  }, [dom]);

  const { isMounted, styles: transitionStyles } = usePresence(open, { open: 120, close: 100 });

  // Track last active element before opening; restore focus on close.
  React.useEffect(() => {
    if (typeof document === "undefined") return;

    if (open) {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body && active !== document.documentElement) {
        lastActiveElementRef.current = active;
      }
    } else {
      queueMicrotask(() => {
        (triggerRef.current ?? lastActiveElementRef.current)?.focus?.();
      });
    }
  }, [open]);

  // Scroll lock when modal open
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open || !modal) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, modal]);

  // Escape to close
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open) return;
    if (!closeOnEscape) return;
    if (disabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", onKeyDown, { capture: true } as any);
  }, [open, closeOnEscape, disabled, setOpen]);

  // Outside press (shadow-dom safe)
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open) return;
    if (!closeOnOutsidePress) return;
    if (disabled) return;

    const onPointerDown = (event: PointerEvent) => {
      const trigger = triggerRef.current;
      const content = contentRef.current;
      if (!content) return;

      const target = event.target as Node | null;

      // Normal DOM fast-path
      if (target && (content.contains(target) || trigger?.contains(target))) return;

      // Shadow/portal safe fallback
      if (!dom.isEventOutside(event, [trigger as any, content as any])) return;

      setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
  }, [open, closeOnOutsidePress, disabled, dom, setOpen]);

  // Focus management (modal trap)
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    if (!open) return;

    const node = contentRef.current;
    if (!node) return;

    queueMicrotask(() => {
      const focusables = getFocusableWithin(node);
      (focusables[0] ?? node).focus?.();
    });

    if (!modal) return;

    const onFocusIn = (event: FocusEvent) => {
      const contentEl = contentRef.current;
      if (!contentEl) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (contentEl.contains(target)) return;

      const focusables = getFocusableWithin(contentEl);
      (focusables[0] ?? contentEl).focus?.();
    };

    document.addEventListener("focusin", onFocusIn, { capture: true });
    return () => document.removeEventListener("focusin", onFocusIn, { capture: true } as any);
  }, [open, modal]);

  const value = React.useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,

      disabled,
      modal,
      closeOnEscape,
      closeOnOutsidePress,

      titleId,
      descriptionId,
      contentId,

      triggerRef,
      contentRef,
      lastActiveElementRef,

      portalRoot,
      dom,

      isMounted,
      transitionStyles,
    }),
    [
      open,
      setOpen,
      disabled,
      modal,
      closeOnEscape,
      closeOnOutsidePress,
      titleId,
      descriptionId,
      contentId,
      portalRoot,
      dom,
      isMounted,
      transitionStyles,
    ]
  );

  return (
    <DialogContext.Provider value={value}>
      <div data-slot="dialog-root">{children}</div>
    </DialogContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

export type DialogTriggerProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

const Trigger = React.forwardRef<HTMLElement, DialogTriggerProps>(function Trigger(
  { asChild, onClick, children, ...props },
  forwardedRef
) {
  const { open, setOpen, contentId, triggerRef, disabled } = useDialogContext("Dialog.Trigger");

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (e.currentTarget instanceof HTMLButtonElement && e.currentTarget.type === "submit") {
      e.preventDefault();
    }

    setOpen(true);
  };

  const triggerProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
    ...props,
    "data-slot": "dialog-trigger",
    "data-state": open ? "open" : "closed",
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    "aria-controls": contentId,
    "aria-disabled": disabled ? "true" : undefined,
    onClick: disabled ? undefined : handleClick,
    ref: composeRefs(forwardedRef, (node: HTMLElement | null) => {
      triggerRef.current = node;
    }),
  };

  if (asChild) return <Slot {...triggerProps}>{children}</Slot>;

  return (
    <button
      {...(triggerProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
      ref={triggerProps.ref as React.Ref<HTMLButtonElement>}
      type="button"
    >
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Portal
 * ------------------------------------------------------------------------------------------------- */

export type DialogPortalProps = {
  container?: Element | null;
  children: React.ReactNode;
};

function Portal({ container, children }: DialogPortalProps) {
  const { portalRoot } = useDialogContext("Dialog.Portal");
  if (typeof document === "undefined") return null;

  const target = (container ?? portalRoot) ?? document.body;
  return ReactDOM.createPortal(<div data-slot="dialog-portal">{children}</div>, target);
}

/* -------------------------------------------------------------------------------------------------
 * Close
 * ------------------------------------------------------------------------------------------------- */

export type DialogCloseProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
};

const Close = React.forwardRef<HTMLElement, DialogCloseProps>(function Close(
  { asChild, onClick, children, ...props },
  forwardedRef
) {
  const { setOpen, disabled } = useDialogContext("Dialog.Close");

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    setOpen(false);
  };

  const closeProps: React.HTMLAttributes<HTMLElement> & Record<string, unknown> = {
    ...props,
    "data-slot": "dialog-close",
    "aria-disabled": disabled ? "true" : undefined,
    onClick: disabled ? undefined : handleClick,
    ref: forwardedRef,
  };

  if (asChild) return <Slot {...closeProps}>{children}</Slot>;

  return (
    <button
      {...(closeProps as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "ref">)}
      ref={forwardedRef as React.Ref<HTMLButtonElement>}
      type="button"
    >
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Overlay
 * ------------------------------------------------------------------------------------------------- */

export type DialogOverlayProps = React.ComponentPropsWithoutRef<"div">;

const Overlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(function Overlay(
  { style, ...props },
  forwardedRef
) {
  const { open, isMounted, transitionStyles, modal } = useDialogContext("Dialog.Overlay");

  if (!modal || !isMounted) return null;

  return (
    <div
      data-slot="dialog-overlay"
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

/* -------------------------------------------------------------------------------------------------
 * Content
 * ------------------------------------------------------------------------------------------------- */

export type DialogContentProps = Omit<React.ComponentPropsWithoutRef<"div">, "role"> & {
  forceMount?: boolean;
  container?: Element | null;
};

const Content = React.forwardRef<HTMLDivElement, DialogContentProps>(function Content(
  { children, forceMount = false, container, style, onKeyDown, ...props },
  forwardedRef
) {
  const {
    open,
    setOpen,
    contentId,
    titleId,
    descriptionId,
    contentRef,
    modal,
    disabled,
    isMounted,
    transitionStyles,
  } = useDialogContext("Dialog.Content");

  const mounted = forceMount || isMounted;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (disabled) return;

    if (e.key === "Escape") {
      e.stopPropagation();
      setOpen(false);
      return;
    }

    if (!modal) return;
    if (e.key !== "Tab") return;

    const node = contentRef.current;
    if (!node) return;

    const focusables = getFocusableWithin(node);
    if (focusables.length === 0) {
      e.preventDefault();
      node.focus();
      return;
    }

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !node.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (!active || active === last || !node.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!mounted) return null;

  return (
    <Portal container={container}>
      <Overlay />
      <div
        data-slot="dialog-content"
        data-state={open ? "open" : "closed"}
        {...props}
        ref={composeRefs(forwardedRef, (node: HTMLDivElement | null) => {
          contentRef.current = node;
        })}
        id={contentId}
        role="dialog"
        aria-modal={modal ? "true" : undefined}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        aria-hidden={open ? "false" : "true"}
        hidden={!open}
        style={{
          ...transitionStyles,
          ...style,
        }}
      >
        {children}
      </div>
    </Portal>
  );
});

/* -------------------------------------------------------------------------------------------------
 * Header / Footer
 * ------------------------------------------------------------------------------------------------- */

export type DialogHeaderProps = React.ComponentPropsWithoutRef<"div">;
function Header(props: DialogHeaderProps) {
  return <div data-slot="dialog-header" {...props} />;
}

export type DialogFooterProps = React.ComponentPropsWithoutRef<"div">;
function Footer(props: DialogFooterProps) {
  return <div data-slot="dialog-footer" {...props} />;
}

/* -------------------------------------------------------------------------------------------------
 * Title / Description
 * ------------------------------------------------------------------------------------------------- */

export type DialogTitleProps = React.ComponentPropsWithoutRef<"h2"> & { asChild?: boolean };

const Title = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function Title(
  { asChild, ...props },
  forwardedRef
) {
  const { titleId } = useDialogContext("Dialog.Title");
  const Comp = asChild ? Slot : "h2";
  return <Comp data-slot="dialog-title" {...props} ref={forwardedRef} id={titleId} />;
});

export type DialogDescriptionProps = React.ComponentPropsWithoutRef<"p"> & { asChild?: boolean };

const Description = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(function Description(
  { asChild, ...props },
  forwardedRef
) {
  const { descriptionId } = useDialogContext("Dialog.Description");
  const Comp = asChild ? Slot : "p";
  return <Comp data-slot="dialog-description" {...props} ref={forwardedRef} id={descriptionId} />;
});

/* -------------------------------------------------------------------------------------------------
 * Public API (Radix-ish)
 * ------------------------------------------------------------------------------------------------- */

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Close,
  Header,
  Footer,
  Title,
  Description,
} as const;

export {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Close,
  Header,
  Footer,
  Title,
  Description,
};
