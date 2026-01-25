export type AspectRatioElement = React.ElementRef<"div">;
export type PrimitiveDivProps = React.ComponentPropsWithoutRef<"div">;

export interface AspectRatioProps extends PrimitiveDivProps {
  ratio?: number;
  asChild?: boolean;
}