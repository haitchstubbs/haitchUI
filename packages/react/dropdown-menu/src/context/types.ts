import type { useFloating, useFloatingTree, useInteractions } from "@floating-ui/react";
import type { Positioning } from "../types";

export type Ctx = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

    activeIndex: number | null;
    setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;

    /** Root-level modality for FloatingFocusManager */
    modal: boolean;

    refs: ReturnType<typeof useFloating>["refs"];
    floatingStyles: React.CSSProperties;
    context: ReturnType<typeof useFloating>["context"];

    getReferenceProps: ReturnType<typeof useInteractions>["getReferenceProps"];
    getFloatingProps: ReturnType<typeof useInteractions>["getFloatingProps"];
    getItemProps: ReturnType<typeof useInteractions>["getItemProps"];

    elementsRef: React.MutableRefObject<Array<HTMLElement | null>>;
    labelsRef: React.MutableRefObject<Array<string | null>>;

    isNested: boolean;
    nodeId: string;
    parentId: string | null;
    tree: ReturnType<typeof useFloatingTree>;

    // Content-driven positioning (Radix-style props live on Content/SubContent)
    positioning: Positioning;
    setPositioning: (next: Partial<Positioning>) => void;
};