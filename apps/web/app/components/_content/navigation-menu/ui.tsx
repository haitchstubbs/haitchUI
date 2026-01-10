"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCircleCheck as CircleCheckIcon,
  IconHelpCircle as CircleHelpIcon,
  IconCircle as CircleIcon,
} from "@tabler/icons-react"

import { useIsMobile } from "../../../../hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuDropdown,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../../../../components/ui/navigation-menu"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

export function Primary() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        {/* Home (dropdown) */}
        <NavigationMenuItem>
          <NavigationMenuDropdown>
            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 md:w-100 lg:w-125 lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-4 no-underline outline-hidden transition-all duration-200 select-none focus:shadow-md md:p-6"
                      href="/"
                    >
                      <div className="mb-2 text-lg font-medium sm:mt-4">
                        shadcn/ui
                      </div>
                      <p className="text-muted-foreground text-sm leading-tight">
                        Beautifully designed components built with Tailwind CSS.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>

                <ListItem href="/docs" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="/docs/installation" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="/docs/primitives/typography" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuDropdown>
        </NavigationMenuItem>

        {/* Components (dropdown) */}
        <NavigationMenuItem>
          <NavigationMenuDropdown>
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-2 sm:w-100w-[500px] md:grid-cols-2 lg:w-150">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuDropdown>
        </NavigationMenuItem>

        {/* Docs (simple link) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/docs">Docs</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* List (dropdown) */}
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuDropdown>
            <NavigationMenuTrigger>List</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-75 gap-4">
                <li className="grid gap-2">
                  <NavigationMenuLink asChild>
                    <Link href="#" className="grid gap-0.5">
                      <div className="font-medium">Components</div>
                      <div className="text-muted-foreground text-sm">
                        Browse all components in the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link href="#" className="grid gap-0.5">
                      <div className="font-medium">Documentation</div>
                      <div className="text-muted-foreground text-sm">
                        Learn how to use the library.
                      </div>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink asChild>
                    <Link href="#" className="grid gap-0.5">
                      <div className="font-medium">Blog</div>
                      <div className="text-muted-foreground text-sm">
                        Read our latest blog posts.
                      </div>
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuDropdown>
        </NavigationMenuItem>

        {/* Simple (dropdown) */}
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuDropdown>
            <NavigationMenuTrigger>Simple</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-50 gap-4">
                <li className="grid gap-2">
                  <NavigationMenuLink asChild>
                    <Link href="#">Components</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">Documentation</Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#">Blocks</Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuDropdown>
        </NavigationMenuItem>

        {/* With Icon (dropdown) */}
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuDropdown>
            <NavigationMenuTrigger>With Icon</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-50 gap-4">
                <li className="grid gap-2">
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex flex-row items-center gap-2">
                      <CircleHelpIcon className="size-4" />
                      Backlog
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex flex-row items-center gap-2">
                      <CircleIcon className="size-4" />
                      To Do
                    </Link>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <Link href="#" className="flex flex-row items-center gap-2">
                      <CircleCheckIcon className="size-4" />
                      Done
                    </Link>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuDropdown>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link href={href} className="grid gap-0.5">
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
