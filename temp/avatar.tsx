"use client"

import * as React from "react"

import { cn } from "../lib/cn.js"
import { Slot } from "../lib/slot.js"

type AvatarProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { className, asChild, ...props },
  ref
) {
  const classNames = cn(
    "relative flex size-8 shrink-0 overflow-hidden rounded-full",
    className
  )

  if (asChild) {
    return (
      <Slot
        data-slot="avatar"
        ref={ref as React.Ref<HTMLElement>}
        className={classNames}
        {...props}
      />
    )
  }

  return (
    <span data-slot="avatar" ref={ref} className={classNames} {...props} />
  )
})

type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  asChild?: boolean
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  function AvatarImage({ className, asChild, ...props }, ref) {
    const classNames = cn("aspect-square size-full", className)

    if (props.src === "" || !props.src) {
      return null
    }
    if (asChild) {
      return (
        <Slot
          data-slot="avatar-image"
          ref={ref as React.Ref<HTMLElement>}
          className={classNames}
          {...props}
        />
      )
    }

    return (
      <img
        data-slot="avatar-image"
        ref={ref}
        className={classNames}
        {...props}
      />
    )
  }
)

type AvatarFallbackProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  function AvatarFallback({ className, asChild, ...props }, ref) {
    const classNames = cn(
      "bg-muted flex size-full items-center justify-center rounded-full",
      className
    )

    if (asChild) {
      return (
        <Slot
          data-slot="avatar-fallback"
          ref={ref as React.Ref<HTMLElement>}
          className={classNames}
          {...props}
        />
      )
    }

    return (
      <span
        data-slot="avatar-fallback"
        ref={ref}
        className={classNames}
        {...props}
      />
    )
  }
)

export { Avatar, AvatarImage, AvatarFallback }
