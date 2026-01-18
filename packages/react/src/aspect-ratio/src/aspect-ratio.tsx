import * as React from "react";
import { Slot } from "@/slot/src";

/* -------------------------------------------------------------------------------------------------
 * AspectRatio
 * -----------------------------------------------------------------------------------------------*/

const NAME = "AspectRatio";

type AspectRatioElement = React.ElementRef<"div">;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;

interface AspectRatioProps extends PrimitiveDivProps {
  ratio?: number;
  asChild?: boolean;
}

const AspectRatio = React.forwardRef<AspectRatioElement, AspectRatioProps>(
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

AspectRatio.displayName = NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root = AspectRatio;

export { AspectRatio, Root };
export type { AspectRatioProps };
