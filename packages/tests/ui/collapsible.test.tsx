// packages/ui/tests/components/collapsible.test.tsx
import * as React from "react";
import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@haitch-ui/ui";
import { runCollapsibleContract } from "../contracts/collapsible";

function BasicCollapsible(props?: Partial<React.ComponentProps<typeof Collapsible>>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      {/* Force mount so contract can assert hidden/aria-hidden in the closed state */}
      <CollapsibleContent forceMount>Content</CollapsibleContent>
    </Collapsible>
  );
}

const parts = {
  root: () => {
    const el = document.querySelector('[data-slot="collapsible"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  trigger: () => screen.getByRole("button", { name: "Toggle" }) as HTMLButtonElement,
  content: () => screen.getByText("Content").closest("div") as HTMLElement,
};

describe("Collapsible", () => {
  runCollapsibleContract("Collapsible", (p) => <BasicCollapsible {...p} />, parts);
});
