"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 1024 // Matches the Tailwind MD breakpoint (768px)

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    onChange()

    // Listen for changes
    mql.addEventListener("change", onChange)

    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  // Returns a boolean; it will be `false` until the effect runs on the client
  return !!isMobile
}