import { forwardRef } from "react";
import { useCarouselContext } from "../carousel-context/carousel-context";
import type { ButtonProps } from "../types";
import { Slot } from "@/primitives/slot/slot";

const Previous = forwardRef<HTMLButtonElement, ButtonProps>(function CarouselPrevious(
    { asChild = false, disabled, ...props },
    forwardedRef
) {
    const engine = useCarouselContext("Carousel.Previous");
    const Comp: any = asChild ? Slot : "button";

    return (
        <Comp
            ref={forwardedRef}
            type="button"
            aria-label={props["aria-label"] ?? "Previous slide"}
            disabled={disabled ?? !engine.canScrollPrev}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                props.onClick?.(e);
                if (e.defaultPrevented) return;
                engine.api.scrollPrev();
            }}
            {...props}
        />
    );
});


Previous.displayName = "Carousel.Previous";

export { Previous };