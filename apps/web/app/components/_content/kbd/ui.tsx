"use client"

import { Kbd, KbdGroup } from "../../../../components/ui/kbd"


export function Primary() {
  return (
    <div className="flex flex-col items-center gap-4 antialiased">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  )
}
