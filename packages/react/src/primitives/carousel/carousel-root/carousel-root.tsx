import { forwardRef, useEffect, useRef } from "react";
import { Slot } from "@/primitives/slot/slot";
import { composeRefs } from "@/utils/compose-refs";
import { useCarousel } from "../hooks/useCarousel";
import { CarouselContext } from "../carousel-context/carousel-context";
import type { RootProps } from "../types/types";

const Root = forwardRef<HTMLDivElement, RootProps>(function CarouselRoot(
    { asChild = false, options, onApi, ...props },
    forwardedRef
) {
    const engine = useCarousel(options);
    const Comp: any = asChild ? Slot : "div";

    const onApiRef = useRef(onApi);
    useEffect(() => {
        onApiRef.current = onApi;
    }, [onApi]);

    useEffect(() => {
        onApiRef.current?.(engine.api);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <CarouselContext.Provider value={engine}>
            <Comp
                ref={composeRefs(forwardedRef, engine.api.setRoot)}
                {...engine.getRootProps(props)}
            />
        </CarouselContext.Provider>
    );
});

Root.displayName = "Carousel.Root";

export { Root };