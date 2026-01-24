// keybinder/core.ts
import type { IsTypingTarget } from "./type-guard";
import { defaultIsTypingTarget } from "./type-guard";

export type KeyCombo = string;

export type BindingResult =
  | void
  | boolean
  | {
      handled?: boolean;
      preventDefault?: boolean;
      stopPropagation?: boolean;
      continue?: boolean; // if true, keep searching lower-priority scopes
    };

export type BindingHandler = (event: KeyboardEvent) => BindingResult;

export type BindingOptions = {
  when?: (event: KeyboardEvent) => boolean;

  // Defaults when handled: true/true
  preventDefault?: boolean;
  stopPropagation?: boolean;

  // If true, do not stop resolution even if handled
  continue?: boolean;

  // NEW: run even when focused in input/textarea/contenteditable
  allowWhenTyping?: boolean;
};

export type RegisterScopeOptions = {
  priority?: number;
};

export type CreateKeybinderOptions = {
  isTypingTarget?: IsTypingTarget;
  sequenceTimeoutMs?: number;
};

type Binding = {
  id: string;
  handler: BindingHandler;
  options: BindingOptions;

  // For single-key binding
  combo?: KeyCombo;

  // For sequences/chords
  sequence?: KeyCombo[];
};

type Scope = {
  id: string;
  priority: number;
  active: boolean;
  activationOrder: number;

  // single combo -> list of bindings
  bindings: Map<KeyCombo, Binding[]>;

  // first combo -> list of sequence bindings
  sequences: Map<KeyCombo, Binding[]>;
};

export type Keybinder = {
  registerScope(scopeId: string, opts?: RegisterScopeOptions): void;
  unregisterScope(scopeId: string): void;

  setScopeActive(scopeId: string, active: boolean): void;

  registerBinding(
    scopeId: string,
    comboOrSequence: string,
    handler: BindingHandler,
    options?: BindingOptions
  ): () => void;

  unregisterBinding(bindingId: string): void;

  handleKeydown(event: KeyboardEvent): boolean;

  normalizeCombo(combo: string): string;
  comboFromEvent(event: KeyboardEvent): string;

  // NEW
  setIsTypingTarget(fn: IsTypingTarget): void;
  clearSequenceState(): void;
};

const MOD_ORDER = ["Meta", "Ctrl", "Alt", "Shift"] as const;

function normalizeToken(token: string): string {
  const t = token.trim().toLowerCase();
  if (t === "cmd" || t === "command" || t === "meta") return "Meta";
  if (t === "ctrl" || t === "control") return "Ctrl";
  if (t === "alt" || t === "option") return "Alt";
  if (t === "shift") return "Shift";
  if (t === "esc") return "Escape";
  if (t === "space") return "Space";
  if (t.length === 1) return t.toUpperCase();
  return token.length ? token[0]?.toUpperCase() + token.slice(1) : token;
}

function normalizeCombo(combo: string): string {
  const parts = combo
    .split("+")
    .map((p) => normalizeToken(p))
    .filter(Boolean);

  const mods = new Set<string>();
  let key: string | null = null;

  for (const p of parts) {
    if (p === "Meta" || p === "Ctrl" || p === "Alt" || p === "Shift") mods.add(p);
    else key = p;
  }

  const orderedMods = MOD_ORDER.filter((m) => mods.has(m));
  if (!key) throw new Error(`Invalid combo "${combo}" (missing key)`);

  return [...orderedMods, key].join("+");
}

function normalizeSequence(sequence: string): string[] {
  // split by whitespace; support "Ctrl+K Ctrl+S" or "g g"
  const steps = sequence
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => normalizeCombo(s));

  if (steps.length === 0) throw new Error(`Invalid sequence "${sequence}"`);
  return steps;
}

function keyFromEvent(event: KeyboardEvent): string {
  let k = event.key;
  if (k === " ") k = "Space";
  if (k.length === 1) k = k.toUpperCase();
  if (k === "Esc") k = "Escape";
  return k;
}

function comboFromEvent(event: KeyboardEvent): string {
  const mods: string[] = [];
  if (event.metaKey) mods.push("Meta");
  if (event.ctrlKey) mods.push("Ctrl");
  if (event.altKey) mods.push("Alt");
  if (event.shiftKey) mods.push("Shift");
  const key = keyFromEvent(event);
  return [...mods, key].join("+");
}

function interpretResult(
  result: BindingResult,
  options: BindingOptions
): {
  handled: boolean;
  preventDefault: boolean;
  stopPropagation: boolean;
  continue: boolean;
} {
  if (typeof result === "undefined") {
    const handled = true;
    return {
      handled,
      preventDefault: options.preventDefault ?? true,
      stopPropagation: options.stopPropagation ?? true,
      continue: options.continue ?? false,
    };
  }

  if (typeof result === "boolean") {
    const handled = result;
    return {
      handled,
      preventDefault: handled ? options.preventDefault ?? true : false,
      stopPropagation: handled ? options.stopPropagation ?? true : false,
      continue: handled ? options.continue ?? false : true,
    };
  }

  const handled = result.handled ?? true;
  const preventDefault =
    result.preventDefault ?? (handled ? options.preventDefault ?? true : false);
  const stopPropagation =
    result.stopPropagation ?? (handled ? options.stopPropagation ?? true : false);

  const cont = result.continue ?? options.continue ?? false;

  return {
    handled,
    preventDefault,
    stopPropagation,
    continue: handled ? cont : true,
  };
}

type BindingIndexRef =
  | { kind: "single"; scopeId: string; combo: string }
  | { kind: "sequence"; scopeId: string; first: string };

type SequenceCandidate = {
  scope: Scope;
  binding: Binding; // has sequence
  nextIndex: number; // next expected index
  registeredOrder: number;
};

export function createKeybinder(opts: CreateKeybinderOptions = {}): Keybinder {
  const scopes = new Map<string, Scope>();
  const bindingIndex = new Map<string, BindingIndexRef>();

  let activationCounter = 0;
  let registrationCounter = 0;

  let isTypingTarget: IsTypingTarget = opts.isTypingTarget ?? defaultIsTypingTarget;
  const sequenceTimeoutMs = opts.sequenceTimeoutMs ?? 800;

  // sequence state
  let inProgress: {
    startedAt: number;
    candidates: SequenceCandidate[];
  } | null = null;

  function clearSequenceState() {
    inProgress = null;
  }

  function getOrCreateScope(scopeId: string, sopts?: RegisterScopeOptions): Scope {
    const existing = scopes.get(scopeId);
    if (existing) return existing;

    const scope: Scope = {
      id: scopeId,
      priority: sopts?.priority ?? 0,
      active: true,
      activationOrder: ++activationCounter,
      bindings: new Map(),
      sequences: new Map(),
    };
    scopes.set(scopeId, scope);
    return scope;
  }

  function sortActiveScopes(): Scope[] {
    const active = Array.from(scopes.values()).filter((s) => s.active);
    active.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.activationOrder - a.activationOrder;
    });
    return active;
  }

  function registerScope(scopeId: string, sopts?: RegisterScopeOptions): void {
    const scope = getOrCreateScope(scopeId, sopts);
    if (typeof sopts?.priority === "number") scope.priority = sopts.priority;
    scope.activationOrder = ++activationCounter;
  }

  function unregisterScope(scopeId: string): void {
    const scope = scopes.get(scopeId);
    if (!scope) return;

    for (const [, list] of scope.bindings.entries()) {
      for (const b of list) bindingIndex.delete(b.id);
    }
    for (const [, list] of scope.sequences.entries()) {
      for (const b of list) bindingIndex.delete(b.id);
    }

    scopes.delete(scopeId);
  }

  function setScopeActive(scopeId: string, active: boolean): void {
    const scope = getOrCreateScope(scopeId);
    scope.active = active;
    if (active) scope.activationOrder = ++activationCounter;
    if (!active) {
      // if a scope is deactivated mid-sequence, safest is to clear
      clearSequenceState();
    }
  }

  function registerBinding(
    scopeId: string,
    comboOrSequence: string,
    handler: BindingHandler,
    options: BindingOptions = {}
  ): () => void {
    const scope = getOrCreateScope(scopeId);

    const steps = normalizeSequence(comboOrSequence);
    const binding: Binding = {
      id: crypto.randomUUID(),
      handler,
      options,
    };

    const registeredOrder = ++registrationCounter;

    if (steps.length === 1) {
      binding.combo = steps[0];

      const combo = steps[0]!;
      const list = scope.bindings.get(combo) ?? [];
      list.push(binding);
      scope.bindings.set(combo, list);

      bindingIndex.set(binding.id, { kind: "single", scopeId, combo });

      return () => unregisterBinding(binding.id);
    }

    binding.sequence = steps;

    const first = steps[0];
    if (typeof first !== "string") {
      throw new Error("First step of sequence must be a string");
    }
    const list = scope.sequences.get(first) ?? [];
    // stash order via (binding as any) for LIFO-ish inside scope
    (binding as any).__order = registeredOrder;
    list.push(binding);
    scope.sequences.set(first, list);

    bindingIndex.set(binding.id, { kind: "sequence", scopeId, first });

    return () => unregisterBinding(binding.id);
  }

  function unregisterBinding(bindingId: string): void {
    const ref = bindingIndex.get(bindingId);
    if (!ref) return;

    const scope = scopes.get(ref.scopeId);
    if (!scope) {
      bindingIndex.delete(bindingId);
      return;
    }

    if (ref.kind === "single") {
      const list = scope.bindings.get(ref.combo);
      if (list) {
        const next = list.filter((b) => b.id !== bindingId);
        if (next.length === 0) scope.bindings.delete(ref.combo);
        else scope.bindings.set(ref.combo, next);
      }
    } else {
      const list = scope.sequences.get(ref.first);
      if (list) {
        const next = list.filter((b) => b.id !== bindingId);
        if (next.length === 0) scope.sequences.delete(ref.first);
        else scope.sequences.set(ref.first, next);
      }
    }

    bindingIndex.delete(bindingId);
    clearSequenceState();
  }

  function canRunBinding(event: KeyboardEvent, binding: Binding): boolean {
    if (binding.options.when && !binding.options.when(event)) return false;

    // typing guard w/ per-binding override
    const typing = isTypingTarget(event);
    if (typing && !binding.options.allowWhenTyping) return false;

    return true;
  }

  function chooseBestCandidate(cands: SequenceCandidate[]): SequenceCandidate | null {
    if (cands.length === 0) return null;
    // already filtered by active scopes; choose by scope ordering + registration order
    cands.sort((a, b) => {
      if (a.scope.priority !== b.scope.priority) return b.scope.priority - a.scope.priority;
      if (a.scope.activationOrder !== b.scope.activationOrder)
        return b.scope.activationOrder - a.scope.activationOrder;
      return b.registeredOrder - a.registeredOrder;
    });
    return cands[0] ?? null;
  }

  function startSequenceCandidates(step: string, event: KeyboardEvent): SequenceCandidate[] {
    const activeScopes = sortActiveScopes();
    const candidates: SequenceCandidate[] = [];

    for (const scope of activeScopes) {
      const seqs = scope.sequences.get(step);
      if (!seqs || seqs.length === 0) continue;

      for (let i = seqs.length - 1; i >= 0; i--) {
        const b = seqs[i];
        if (!b) continue;
        if (!b.sequence) continue;

        // first step matched; ensure allowed to run at this moment
        if (!canRunBinding(event, b)) continue;

        candidates.push({
          scope,
          binding: b,
          nextIndex: 1,
          registeredOrder: (b as any).__order ?? 0,
        });
      }
    }

    return candidates;
  }

  function handleKeydown(event: KeyboardEvent): boolean {
    const now = Date.now();
    const step = normalizeCombo(comboFromEvent(event));

    // expire chord state
    if (inProgress && now - inProgress.startedAt > sequenceTimeoutMs) {
      clearSequenceState();
    }

    // If chord in progress, try to advance it first
    if (inProgress) {
      const advanced: SequenceCandidate[] = [];

      for (const cand of inProgress.candidates) {
        const seq = cand.binding.sequence!;
        const expected = seq[cand.nextIndex];
        if (expected !== step) continue;

        // re-check constraints at this step
        if (!canRunBinding(event, cand.binding)) continue;

        // advance
        if (cand.nextIndex + 1 >= seq.length) {
          // complete -> fire best match among completions
          advanced.push({ ...cand, nextIndex: cand.nextIndex + 1 });
        } else {
          advanced.push({ ...cand, nextIndex: cand.nextIndex + 1 });
        }
      }

      if (advanced.length > 0) {
        // if any completed, pick best completed; else continue with updated candidates
        const completed = advanced.filter(
          (c) => c.binding.sequence && c.nextIndex >= c.binding.sequence.length
        );

        if (completed.length > 0) {
          const winner = chooseBestCandidate(completed)!;
          const res = interpretResult(winner.binding.handler(event), winner.binding.options);

          if (res.handled) {
            if (res.preventDefault) event.preventDefault();
            if (res.stopPropagation) event.stopPropagation();
          }

          clearSequenceState();
          return res.handled;
        }

        // still in progress
        inProgress = { startedAt: now, candidates: advanced };

        // consume by default (sequence steps usually shouldn't type)
        // Use binding option defaults (handled semantics) by treating as handled with defaults:
        event.preventDefault();
        event.stopPropagation();

        return true;
      }

      // no match: cancel chord and fall through to normal handling for THIS key
      clearSequenceState();
    }

    // Start a new chord if any sequences begin with this step
    const newCandidates = startSequenceCandidates(step, event);
    if (newCandidates.length > 0) {
      inProgress = { startedAt: now, candidates: newCandidates };

      // consume start step so "g" doesn't type into non-typing surfaces.
      // If you want opt-out, we can add a per-sequence option.
      event.preventDefault();
      event.stopPropagation();

      return true;
    }

    // Normal single-binding resolution
    const orderedScopes = sortActiveScopes();
    let anyHandled = false;

    for (const scope of orderedScopes) {
      const bindings = scope.bindings.get(step);
      if (!bindings || bindings.length === 0) continue;

      for (let i = bindings.length - 1; i >= 0; i--) {
        const binding = bindings[i];
        if (!binding) continue;

        if (!canRunBinding(event, binding)) continue;

        const res = interpretResult(binding.handler(event), binding.options);

        if (res.handled) {
          anyHandled = true;
          if (res.preventDefault) event.preventDefault();
          if (res.stopPropagation) event.stopPropagation();
        }

        if (!res.continue) return true;
      }
    }

    return anyHandled;
  }

  return {
    registerScope,
    unregisterScope,
    setScopeActive,
    registerBinding,
    unregisterBinding,
    handleKeydown,
    normalizeCombo,
    comboFromEvent: (e) => normalizeCombo(comboFromEvent(e)),
    setIsTypingTarget: (fn) => {
      isTypingTarget = fn;
      clearSequenceState();
    },
    clearSequenceState,
  };
}
