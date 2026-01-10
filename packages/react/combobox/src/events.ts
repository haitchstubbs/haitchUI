export function composeEventHandlers<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void
) {
  return (event: E) => {
    theirs?.(event);
    // If consumer prevented default on a DOM event, don’t run ours.
    // (Works for most React SyntheticEvents)
    // @ts-expect-error - best-effort
    if (event?.defaultPrevented) return;
    ours(event);
  };
}

export function getInteractionTypeFromEvent(event: unknown): "mouse" | "touch" | "pen" | "keyboard" | "unknown" {
  // Minimal heuristic (extend later if you need exact parity)
  const e = event as any;
  if (!e) return "unknown";
  if (e.type?.startsWith("key")) return "keyboard";
  if (e.pointerType === "mouse") return "mouse";
  if (e.pointerType === "touch") return "touch";
  if (e.pointerType === "pen") return "pen";
  return "unknown";
}

export function normalizeTextValue(item: { textValue?: string; value: any }) {
  return (item.textValue ?? "").toString() || String(item.value ?? "");
}

export function clampIndex(index: number, len: number) {
  if (len <= 0) return -1;
  return Math.max(0, Math.min(index, len - 1));
}

export function findNextEnabledIndex(
  items: Array<{ disabled: boolean }>,
  start: number,
  dir: 1 | -1,
  loop: boolean
) {
  const len = items.length;
  if (len === 0) return -1;

  let idx = start;
  for (let i = 0; i < len; i++) {
    idx += dir;
    if (loop) idx = (idx + len) % len;
    if (!loop && (idx < 0 || idx >= len)) return -1;
    if (!items[idx]?.disabled) return idx;
  }
  return -1;
}
