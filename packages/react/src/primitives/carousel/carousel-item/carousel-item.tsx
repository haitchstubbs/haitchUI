import { forwardRef } from "react";
import type { ItemProps } from "../types";
import { Slot } from "@/primitives/slot/slot";

const Item = forwardRef<HTMLDivElement, ItemProps>(function CarouselItem(
    { asChild = false, ...props },
    forwardedRef
) {
    const Comp: any = asChild ? Slot : "div";
    return <Comp ref={forwardedRef} {...props} />;
});

Item.displayName = "Carousel.Item";

export { Item };