"use client"

import * as React from "react"

import { Progress } from "../../../../components/ui/progress"

export function Primary() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 200)
    return () => clearTimeout(timer)
  }, [])

  return <Progress value={progress || 0} className="w-[60%]" />
}
