"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useComboboxContext } from "./context";
import type { EmptyProps } from "./types";

export function Empty({ asChild, children, ...props }: EmptyProps) {
  const ctx = useComboboxContext("Combobox.Empty");
  const Comp: any = asChild ? Slot : "div";
  if (!ctx.isEmpty) return null;
  return <Comp {...props}>{children}</Comp>;
}
