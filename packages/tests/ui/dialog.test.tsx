// packages/ui/tests/components/dialog.test.tsx
import * as React from "react";
import { describe, expect } from "vitest";
import { screen } from "@testing-library/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@haitch/ui";

import { runDialogContract } from "../contracts/dialog";

function BasicDialog(props?: Partial<React.ComponentProps<typeof Dialog>>) {
  return (
    <Dialog {...props}>
      <DialogTrigger>Open</DialogTrigger>

      {/* Force mount so the contract can assert hidden/aria-hidden when closed */}
      <DialogContent forceMount>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>Dialog description</DialogDescription>

        <div>
          <button type="button">First</button>
          <button type="button">Last</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const parts = {
  root: () => {
    const el = document.querySelector('[data-slot="dialog"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  trigger: () => screen.getByRole("button", { name: "Open" }) as HTMLButtonElement,
  overlay: () => {
    const el = document.querySelector('[data-slot="dialog-overlay"]') as HTMLElement | null;
    expect(el).toBeTruthy();
    return el!;
  },
  content: () => screen.getByRole("dialog") as HTMLElement,
  title: () => screen.getByText("Dialog title") as HTMLElement,
  description: () => screen.getByText("Dialog description") as HTMLElement,
  closeButton: () => screen.getByRole("button", { name: /close/i }) as HTMLButtonElement,
};

describe("Dialog", () => {
  runDialogContract("Dialog", (p) => <BasicDialog {...p} />, parts);
});
