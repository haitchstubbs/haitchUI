import { forwardRef } from "react";
import { Slot } from "@/primitives/slot";
import { composeRefs } from "@/utils/compose-refs";
import { useCarouselContext } from "../carousel-context/carousel-context";
import type { ViewportProps } from "../types";


const Viewport = forwardRef<HTMLDivElement, ViewportProps>(function CarouselViewport(
    { asChild = false, ...props },
    forwardedRef
) {
    const engine = useCarouselContext("Carousel.Viewport");
    const Comp: any = asChild ? Slot : "div";

    return (
        <Comp
            ref={composeRefs(forwardedRef, engine.api.setViewport)}
            {...engine.getViewportProps(props)}
        />
    );
});

Viewport.displayName = "Carousel.Viewport";

export { Viewport };