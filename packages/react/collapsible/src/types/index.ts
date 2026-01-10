"use client";

import type * as React from "react";

export type RootProps = {
  asChild?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
} & Omit<React.HTMLAttributes<HTMLElement>, "onChange">;

export type TriggerProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ContentProps = {
  asChild?: boolean;
  forceMount?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
