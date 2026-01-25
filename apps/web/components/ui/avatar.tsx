"use client"

import * as React from "react"
import * as AvatarPrimitive from "@haitch-ui/react/avatar"

import { cn } from "../../lib/util"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.AvatarRoot>) {
  return (
    <AvatarPrimitive.AvatarRoot
      data-slot="avatar-root"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.AvatarImage>) {
  return (
    <AvatarPrimitive.AvatarImage
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.AvatarFallback>) {
  return (
    <AvatarPrimitive.AvatarFallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
