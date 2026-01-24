import React, { createContext, useContext, useEffect, useMemo } from "react";
import type { Keybinder, BindingHandler, BindingOptions } from "../core";

type KeybinderProviderProps = {
  keybinder: Keybinder;
  target?: Window | Document | HTMLElement;
  capture?: boolean;
  enabled?: boolean;

  /**
   * Optional global filter. If returns false, keybinder won't run at all.
   * Default: allow everything (core decides per-binding typing behavior).
   */
  shouldHandleEvent?: (e: KeyboardEvent) => boolean;

  children: React.ReactNode;
};

const KeybinderContext = createContext<Keybinder | null>(null);

export function KeybinderProvider({
  keybinder,
  target,
  capture = true,
  enabled = true,
  shouldHandleEvent = () => true,
  children,
}: KeybinderProviderProps) {
  useEffect(() => {
    if (!enabled) return;

    const t: any = target ?? window;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!shouldHandleEvent(e)) return;
      keybinder.handleKeydown(e);
    };

    t.addEventListener("keydown", onKeyDown, { capture });
    return () => {
      t.removeEventListener("keydown", onKeyDown, { capture });
    };
  }, [keybinder, target, capture, enabled, shouldHandleEvent]);

  return <KeybinderContext.Provider value={keybinder}>{children}</KeybinderContext.Provider>;
}

export function useKeybinder(): Keybinder {
  const kb = useContext(KeybinderContext);
  if (!kb) throw new Error("useKeybinder must be used within <KeybinderProvider>");
  return kb;
}

type KeyScopeProps = {
  id: string;
  priority?: number;
  active?: boolean;
  children: React.ReactNode;
};

/**
 * Registers a scope on mount, unregisters on unmount.
 * If active is false, scope stays registered but inactive.
 */
export function KeyScope({ id, priority = 0, active = true, children }: KeyScopeProps) {
  const kb = useKeybinder();

  // register/unregister lifecycle
  useEffect(() => {
    kb.registerScope(id, { priority });
    kb.setScopeActive(id, active);

    return () => {
      kb.unregisterScope(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kb, id]);

  // update priority/active if they change
  useEffect(() => {
    kb.registerScope(id, { priority });
  }, [kb, id, priority]);

  useEffect(() => {
    kb.setScopeActive(id, active);
  }, [kb, id, active]);

  return <>{children}</>;
}

type UseKeybindingOptions = BindingOptions & {
  scope?: string; // default "app"
};

export function useKeybinding(combo: string, handler: BindingHandler, options: UseKeybindingOptions = {}) {
  const kb = useKeybinder();
  const scopeId = options.scope ?? "app";

  // stable options object for dependency sanity
  const opts = useMemo(
    () => ({
      when: options.when,
      preventDefault: options.preventDefault,
      stopPropagation: options.stopPropagation,
      continue: options.continue,
    }),
    [options.when, options.preventDefault, options.stopPropagation, options.continue]
  );

  useEffect(() => {
    // ensure scope exists
    kb.registerScope(scopeId);
    const cleanup = kb.registerBinding(scopeId, combo, handler, opts);
    return cleanup;
  }, [kb, scopeId, combo, handler, opts]);
}
