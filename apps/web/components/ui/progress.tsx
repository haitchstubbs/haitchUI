"use client"

import * as React from "react"
import * as ProgressPrimitive from "@haitch-ui/react/progress"

import { cn } from "../../lib/util"

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.ProgressRoot>) {
  return (
    <ProgressPrimitive.ProgressRoot
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.ProgressIndicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.ProgressRoot>
  )
}

export { Progress }
