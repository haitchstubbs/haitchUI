import { FloatingTree, useFloatingParentNodeId } from "@floating-ui/react";
import type { RootProps } from "./types";
import { RenderRoot } from "./renderRoot";

export function Root(props: RootProps) {
    const parentId = useFloatingParentNodeId();
    if (parentId == null) {
        return (
            <FloatingTree>
                <RenderRoot {...props} />
            </FloatingTree>
        );
    }
    return <RenderRoot {...props} />;
}