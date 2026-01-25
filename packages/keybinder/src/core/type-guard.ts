function isHTMLElement(x: unknown): x is HTMLElement {
  return typeof x === "object" && x !== null && "tagName" in (x as any);
}

function closestAttr(el: Element | null, attr: string): string | null {
  if (!el) return null;
  const found = (el as HTMLElement).closest?.(`[${attr}]`) as HTMLElement | null;
  return found ? found.getAttribute(attr) : null;
}

export type IsTypingTarget = (e: KeyboardEvent) => boolean;

/**
 * Returns true when the event target is a "typing surface":
 * - input/textarea/select
 * - contenteditable
 *
 * DOM escape hatches:
 * - data-keybinder-allow="true"  => treat as NOT typing surface (shortcuts allowed)
 * - data-keybinder-allow="false" => treat as typing surface (shortcuts blocked)
 */
export const defaultIsTypingTarget: IsTypingTarget = (e) => {
  const target = e.target;
  if (!isHTMLElement(target)) return false;

  const override = closestAttr(target, "data-keybinder-allow");
  if (override === "false") return true;
  if (override === "true") return false;

  const tag = target.tagName.toLowerCase();
  const isFormControl = tag === "input" || tag === "textarea" || tag === "select";

  const isEditable =
    target.isContentEditable || !!target.closest?.('[contenteditable="true"]');

  return isFormControl || isEditable;
};