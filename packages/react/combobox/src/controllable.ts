import * as React from "react";

export function useControllableBoolean(opts: {
  value?: boolean;
  defaultValue?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<boolean>(opts.defaultValue ?? false);
  const controlled = typeof opts.value === "boolean";
  const value = controlled ? (opts.value as boolean) : uncontrolled;

  const setValue = React.useCallback(
    (next: boolean) => {
      if (!controlled) setUncontrolled(next);
      opts.onChange?.(next);
    },
    [controlled, opts.onChange]
  );

  return { value, setValue };
}

export function useControllableString(opts: {
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<string>(opts.defaultValue ?? "");
  const controlled = typeof opts.value === "string";
  const value = controlled ? (opts.value as string) : uncontrolled;

  const setValue = React.useCallback(
    (next: string) => {
      if (!controlled) setUncontrolled(next);
      opts.onChange?.(next);
    },
    [controlled, opts.onChange]
  );

  return { value, setValue };
}

export function useControllableValue<Value>(opts: {
  value?: Value | null;
  defaultValue?: Value | null;
  onChange?: (v: Value | null) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState<Value | null>(opts.defaultValue ?? null);
  const controlled = opts.value !== undefined;
  const value = controlled ? (opts.value ?? null) : uncontrolled;

  const setValue = React.useCallback(
    (next: Value | null) => {
      if (!controlled) setUncontrolled(next);
      opts.onChange?.(next);
    },
    [controlled, opts.onChange]
  );

  return { value, setValue };
}
