"use client";
import { isDisabled } from "../isDisabled/isDisabled.js";
import { isInHiddenGroup } from "../isInHiddenGroup/isInHiddenGroup.js";

export function firstChildTreeItem(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;

  const groupId = el.getAttribute("aria-controls");
  if (!groupId) return null;

  const group = document.getElementById(groupId);
  if (!group) return null;

  // If the controlled group itself is hidden, treat as no visible children.
  if (
    group.getAttribute("role") === "group" &&
    ((group as HTMLElement).hidden || group.getAttribute("aria-hidden") === "true")
  ) {
    return null;
  }

  // Only consider children inside the controlled group.
  const candidates = Array.from(
    group.querySelectorAll<HTMLElement>('[role="treeitem"][data-treeitem="true"]'),
  );

  for (const child of candidates) {
    if (isDisabled(child)) continue;
    if (isInHiddenGroup(child)) continue;
    return child;
  }

  return null;
}
