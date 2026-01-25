import * as React from "react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { IconChevronDown } from "@tabler/icons-react"

const engagements = [
  "12 Likes",
  "4 Comments",
  "3 Shares",
  "5 New Followers",
]

export function CollapsibleAlt() {

  function getEngagementTotal() {
    let total = 0
    for (const engagement of engagements) {
      const [count] = engagement.split(" ")
      total += Number(count)
    }
    return total
  }

  const totalEngagement = getEngagementTotal()

  return (
    <Collapsible
      defaultOpen={false}
      className="w-87.5 rounded-lg border"
    >
      <CollapsibleTrigger asChild>
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50"
        >
          <div>
            <p className="text-sm font-semibold">
              This post has {totalEngagement} interactions
            </p>
            <p className="text-xs text-muted-foreground">
              Click to expand
            </p>
          </div>

          <IconChevronDown
            className="size-4 transition-transform duration-200 data-[state=open]:rotate-180"
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-2 px-4 pb-4">
        {engagements.map((engagement) => (
          <div
            key={engagement}
            className="rounded-md border px-4 py-2 font-mono text-sm"
          >
            {engagement}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

export const Primary = CollapsibleAlt;
