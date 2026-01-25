import { useCallback, useEffect, useMemo, useState } from "react";
import type { RuntimeOptions } from "./types";

export function useRuntimeOptions(initial: RuntimeOptions) {
  const [opts, setOpts] = useState<RuntimeOptions>(() => initial);

  // Keep in sync if parent changes defaults
  useEffect(() => {
    setOpts(initial);
  }, [initial.sideOffset, initial.collisionPadding, initial.delay]);

  const setOptions = useCallback((next: Partial<RuntimeOptions>) => {
    setOpts((prev) => ({ ...prev, ...next }));
  }, []);

  return useMemo(
    () => ({
      opts,
      setOptions,
    }),
    [opts, setOptions]
  );
}