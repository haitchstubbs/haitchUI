"use client";

import * as React from "react";
import { Slot } from "@haitch/react-slot";
import { useComboboxContext } from "./context";
import type { ListProps } from "./types";

export function List({ asChild, children, ...props }: ListProps) {
  useComboboxContext("Combobox.List");
  const Comp: any = asChild ? Slot : "div";

  return (
    <Comp {...props}>
      {children as any}
    </Comp>
  );
}
