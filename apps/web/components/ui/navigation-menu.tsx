"use client"

import * as React from "react"
import * as Haitch from "@haitch-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { IconChevronDown as ChevronDownIcon } from "@tabler/icons-react"
import { cn } from "../../lib/util"

/* -------------------------------------------------------------------------------------------------
 * Root + List
 * ------------------------------------------------------------------------------------------------- */

function NavigationMenu({
  className,
  children,
  viewport = true, // keep for API parity with shadcn; we only use it for data attributes/styles
  ...props
}: Omit<React.ComponentProps<typeof Haitch.Navbar>, "className"> & {
  viewport?: boolean
  className?: Haitch.NavbarProps["className"]
}) {
  return (
    <Haitch.Navbar
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={(state) =>
        cn(
          "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children}
    </Haitch.Navbar>
  )
}

// Use UL for correct semantics / focus behavior
function NavigationMenuList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Item (dumb wrapper, NOT a dropdown root)
 * ------------------------------------------------------------------------------------------------- */

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"li">) {
  return (
    <li data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
  )
}

/**
 * Expose Haitch dropdown root explicitly (this is your “dropdown item” wrapper).
 */
function NavigationMenuDropdown({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Haitch.NavMenu.Root>, "className"> & {
  className?: Haitch.NavMenuRootProps["className"]
}) {
  return (
    <Haitch.NavMenu.Root
      data-slot="navigation-menu-dropdown"
      className={(state) =>
        cn("relative", typeof className === "function" ? className(state) : className)
      }
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Trigger
 * ------------------------------------------------------------------------------------------------- */

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: Omit<Haitch.NavTriggerProps, "className"> & {
  className?: Haitch.NavTriggerProps["className"]
}) {
  return (
    <Haitch.NavMenu.Trigger
      data-slot="navigation-menu-trigger"
      className={(state) =>
        cn(
          navigationMenuTriggerStyle(),
          "group",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </Haitch.NavMenu.Trigger>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Content (Portal + Positioner + Content)
 *
 * This matches your Haitch primitives:
 * - Portal renders only when open/mounted
 * - Positioner uses Floating UI styles (no sideOffset prop)
 * - Content renders only when open
 * ------------------------------------------------------------------------------------------------- */

function NavigationMenuContent({
  className,
  ...props
}: Omit<Haitch.NavContentProps, "className"> & {
  className?: Haitch.NavContentProps["className"]
}) {
  return (
    <Haitch.NavMenu.Portal>
      <Haitch.NavMenu.Positioner
        className={(state) =>
          cn(
            // make sure it’s above headers etc.
            "z-50",
            typeof className === "function" ? className(state) : className
          )
        }
      >
        <Haitch.NavMenu.Content
          data-slot="navigation-menu-content"
          className={(state) =>
            cn(
              // your existing shadcn-ish animation + layout
              "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",

              // “popover surface” styling (you can tune these)
              "rounded-md border bg-popover text-popover-foreground shadow-md",

              // keep your focus tweaks
              "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",

              typeof className === "function" ? className(state) : className
            )
          }
          {...props}
        />
      </Haitch.NavMenu.Positioner>
    </Haitch.NavMenu.Portal>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Link
 *
 * IMPORTANT: DO NOT force a render prop here.
 * Let Haitch.NavMenu.Link handle:
 * - asChild (Slot)
 * - children (your Next <Link> content)
 * - keyboard highlight registration (if you later switch it to dropdown-item mode)
 * ------------------------------------------------------------------------------------------------- */

function NavigationMenuLink({
  className,
  ...props
}: Omit<Haitch.NavLinkProps, "className"> & {
  className?: Haitch.NavLinkProps["className"]
}) {
  return (
    <Haitch.NavMenu.Link
      data-slot="navigation-menu-link"
      className={(state) =>
        cn(
          "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
          typeof className === "function" ? className(state) : className
        )
      }
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------------------------------
 * Indicator/Viewport (not implemented by Haitch primitives)
 * ------------------------------------------------------------------------------------------------- */

function NavigationMenuViewport(_: React.ComponentProps<"div">) {
  return null
}

function NavigationMenuIndicator(_: React.ComponentProps<"div">) {
  return null
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuDropdown,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
