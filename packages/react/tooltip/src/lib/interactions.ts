import { useDismiss, useFocus, useHover, useInteractions, useRole } from "@floating-ui/react";

export function useTooltipInteractions(params: {
  context: any; // floating-ui types are awkward here; keep it internal
  enabled: boolean;
  delay: number;
}) {
  const { context, enabled, delay } = params;

  const hover = useHover(context, {
    move: false,
    enabled,
    delay: { open: delay, close: 0 },
  });

  const focus = useFocus(context, { enabled });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  return useInteractions([hover, focus, dismiss, role]);
}