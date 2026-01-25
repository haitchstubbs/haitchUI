import { Children, isValidElement } from "react";

export function reactChildrenToElements(children: React.ReactNode) {
    return Children.toArray(children).filter(isValidElement) as React.ReactElement[];
}