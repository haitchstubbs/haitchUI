import Link from "next/link"

import { Button } from "../../../../components/ui/button"
import { IconArrowUp } from "@tabler/icons-react"

export function Primary() {
  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <IconArrowUp />
      </Button>
    </div>
  )
}
