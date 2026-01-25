function composeEventHandlers<E extends { defaultPrevented?: boolean }>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler: (event: E) => void
) {
  return (event: E) => {
    theirHandler?.(event)
    if (event.defaultPrevented) return
    ourHandler(event)
  }
}

export { composeEventHandlers }