import { forwardRef, useEffect, useMemo, cloneElement } from "react";
import { Slot } from "@/primitives/slot";
import { composeRefs } from "@/utils/compose-refs";
import { reactChildrenToElements } from "@/utils/reactChildrenToElements";
import { useCarouselContext } from "../carousel-context/carousel-context";
import type { ContentProps } from "../types";

const Content = forwardRef<HTMLDivElement, ContentProps>(function CarouselContent(
    { asChild = false, children, ...props },
    forwardedRef
) {
    const engine = useCarouselContext("Carousel.Content");
    const Comp: any = asChild ? Slot : "div";

    const items = useMemo(() => reactChildrenToElements(children), [children]);
    const realCount = items.length;

    // Stable setter lives on api.
    const setRealCount = engine.api.setRealCount;

    useEffect(() => {
        setRealCount(realCount);
    }, [setRealCount, realCount]);

    const loopEnabled = engine.loop && realCount > 1 && engine.loopClones > 0;

    const renderedChildren = useMemo(() => {
        if (!loopEnabled) return items;

        const n = Math.min(engine.loopClones, realCount);
        if (n <= 0) return items;

        const before = items.slice(realCount - n).map((el, i) =>
            cloneElement(el, {
                key: `__clone_before_${i}__${el.key ?? ""}`,
                "data-carousel-clone": "",
            } as any)
        );

        const after = items.slice(0, n).map((el, i) =>
            cloneElement(el, {
                key: `__clone_after_${i}__${el.key ?? ""}`,
                "data-carousel-clone": "",
            } as any)
        );

        return [...before, ...items, ...after];
    }, [engine.loopClones, items, loopEnabled, realCount]);

    return (
        <Comp
            ref={composeRefs(forwardedRef, engine.api.setContent)}
            {...props}
        >
            {renderedChildren}
        </Comp>
    );
});

Content.displayName = "Carousel.Content";

export { Content };