import type { HTMLAttributes } from "react";
import type { ThemeName } from "./types";

export type ThemeRootProps = HTMLAttributes<HTMLDivElement> & {
  theme: ThemeName;
};

export function ThemeRoot({ theme, className, ...props }: ThemeRootProps) {
  const classes = ["ui-root", className].filter(Boolean).join(" ");

  return <div data-theme={theme} className={classes} {...props} />;
}
