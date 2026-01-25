import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

namespace HTML {
    export type Div = HTMLAttributes<HTMLDivElement>
    export type Button = ButtonHTMLAttributes<HTMLButtonElement>
    export type Element = HTMLAttributes<HTMLElement>
}

export type { HTML };

export type OptionalAsChild = { asChild?: boolean };

export type OptionalChildren = { children?: ReactNode };