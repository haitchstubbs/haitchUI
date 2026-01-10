"use client";

import type * as React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  asChild?: boolean;
};
