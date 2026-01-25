import * as React from "react";

type ErrorMessage<TName extends string> =
  | string
  | ((component: string, contextName: TName) => string);

type CreateContextCreatorOptions<TName extends string> = {
  /**
   * Used in error messages and React DevTools.
   * Example: "Avatar"
   */
  name: TName;

  /**
   * Optional custom error message (string or function).
   * Defaults to: `${component} must be used within ${name}.Root`
   */
  errorMessage?: ErrorMessage<TName>;

  /**
   * Optional, used for Context.displayName.
   */
  displayName?: string;
};

/**
 * Factory that returns a typed Context + typed hook.
 * The hook throws if used outside the provider.
 */
export function createTypedContext<
  TContextValue,
  const TName extends string
>(options: CreateContextCreatorOptions<TName>) {
  const {
    name,
    displayName = `${name}Context`,
    errorMessage = (component: string, contextName: TName) =>
      `${component} must be used within ${contextName}.Root`,
  } = options;

  const Context = React.createContext<TContextValue | undefined>(undefined);
  Context.displayName = displayName;

  function useTypedContext(component: string): TContextValue {
    const ctx = React.useContext(Context);
    if (ctx === undefined) {
      const msg =
        typeof errorMessage === "function"
          ? errorMessage(component, name)
          : errorMessage;
      throw new Error(msg);
    }
    return ctx;
  }

  return {
    Context,
    useContext: useTypedContext,
  } as const;
}
