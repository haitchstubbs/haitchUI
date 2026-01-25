import { forwardRef } from "react";
import type { AspectRatioElement, AspectRatioProps } from "../types";
import { Slot } from "@/primitives/slot/slot";


const NAME = "AspectRatio";

const Root = forwardRef<AspectRatioElement, AspectRatioProps>(
  (props, forwardedRef) => {
    const {
      ratio = 1 / 1,
      asChild = false,
      style,
      ...aspectRatioProps
    } = props;

    const Comp = asChild ? Slot : "div";

    return (
      <div
        style={{
          // ensures inner element is contained
          position: "relative",
          // ensures padding bottom trick maths works
          width: "100%",
          paddingBottom: `${100 / ratio}%`,
        }}
        data-aspect-ratio-root=""
      >
        <Comp
          {...aspectRatioProps}
          ref={forwardedRef}
          style={{
            ...style,
            // ensures children expand in ratio
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
        />
      </div>
    );
  }
);

Root.displayName = NAME;

/* -----------------------------------------------------------------------------------------------*/


export { Root };