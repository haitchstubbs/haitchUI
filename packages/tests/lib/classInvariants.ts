// test-utils/classInvariants.ts
import { expect } from "vitest";

export function classTokens(el: Element): string[] {
  return (el.getAttribute("class") ?? "")
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function expectClassInvariants(el: Element, required: string[]) {
  const tokens = classTokens(el);
  for (const t of required) {
    expect(tokens, `Expected class token "${t}"`).toContain(t);
  }
}

export function expectNoClassTokens(el: Element, forbidden: string[]) {
  const tokens = classTokens(el);
  for (const t of forbidden) {
    expect(tokens, `Did not expect class token "${t}"`).not.toContain(t);
  }
}
