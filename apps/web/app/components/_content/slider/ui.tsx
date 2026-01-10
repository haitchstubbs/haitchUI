import { cn } from "../../../../lib/util"
import { Slider } from "../../../../components/ui/slider"

type SliderProps = React.ComponentProps<typeof Slider>

export function Primary({ className, ...props }: SliderProps) {
  return (
    <Slider
      defaultValue={50}
      max={100}
      step={1}
      className={cn("w-[60%]", className)}
      {...props}
    />
  )
}
