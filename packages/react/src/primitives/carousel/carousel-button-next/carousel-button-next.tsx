import { forwardRef } from "react";
import { useCarouselContext } from "../carousel-context/carousel-context";
import type { ButtonProps } from "../types";
import { Slot } from "@/primitives/slot/slot";

const Next = forwardRef<HTMLButtonElement, ButtonProps>(function CarouselNext(
    { asChild = false, disabled, ...props },
    forwardedRef
) {
    const engine = useCarouselContext("Carousel.Next");
    const Comp: any = asChild ? Slot : "button";

    return (
        <Comp
            ref={forwardedRef}
            type="button"
            aria-label={props["aria-label"] ?? "Next slide"}
            disabled={disabled ?? !engine.canScrollNext}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                props.onClick?.(e);
                if (e.defaultPrevented) return;
                engine.api.scrollNext();
            }}
            {...props}
        />
    );
});

Next.displayName = "Carousel.Next";

export { Next };