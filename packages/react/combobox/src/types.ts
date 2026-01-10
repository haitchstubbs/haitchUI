import type * as React from "react";
import type {
  Alignment,
  Middleware as FloatingMiddleware,
  Side,
  Placement as FloatingPlacement,
  FloatingArrowProps,
} from "@floating-ui/react";

export type ComboboxValue = any;

export type InteractionType = "mouse" | "touch" | "pen" | "keyboard" | "unknown";
export type ComboboxAlign = "start" | "center" | "end";
export namespace Combobox {
  export namespace Root {
    export type ChangeEventDetails = {
      reason:
        | "open"
        | "close"
        | "toggle"
        | "input"
        | "select"
        | "clear"
        | "escape"
        | "outside-press";
      nativeEvent?: Event;
    };

    export type Actions = {
      /** When Root is configured to keep mounted, caller can force unmount later. */
      unmount: () => void;
    };
  }

  export namespace Item {
    export type State = {
      selected: boolean;
      highlighted: boolean;
      disabled: boolean;
    };
  }

  export namespace Popup {
    export type State = {
      open: boolean;
      side: Side;
      align: ComboboxAlign;
      empty: boolean;
      instant: boolean;
    };
  }

  export namespace Empty {
    export type State = { empty: boolean };
  }

  export namespace Status {
    export type State = { open: boolean; empty: boolean };
  }
}

export type RootProps<Value = ComboboxValue> = React.PropsWithChildren<{
  name?: string;
  multiple?: boolean;

  defaultValue?: Value | Value[] | null;
  value?: Value | Value[] | null;
  onValueChange?: (value: Value | Value[] | null, details: Combobox.Root.ChangeEventDetails) => void;

  defaultInputValue?: string;
  inputValue?: string;
  onInputValueChange?: (inputValue: string, details: Combobox.Root.ChangeEventDetails) => void;

  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean, details: Combobox.Root.ChangeEventDetails) => void;

  disabled?: boolean;

  /** Floating positioning (Root-level defaults) */
  side?: Side;
  align?: ComboboxAlign;
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  middleware?: FloatingMiddleware[];
  strategy?: "absolute" | "fixed";

  /** Whether popup focus is trapped when open */
  modal?: boolean;

  /**
   * If true, Root will keep internal state/resources mounted when closed.
   * This maps loosely to the README’s `actionsRef`/unmount use-case.
   */
  keepMounted?: boolean;

  actionsRef?: React.RefObject<Combobox.Root.Actions | null>;
}>;

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  asChild?: boolean;
};

export type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export type ValueProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
  placeholder?: React.ReactNode;
};

export type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
};

export type ClearProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export type ChipData<Value = ComboboxValue> = { id: string; value: Value };

export type ChipsProps<Value = ComboboxValue> = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  asChild?: boolean;
  children?: React.ReactNode | ((chips: ChipData<Value>[]) => React.ReactNode);
};

export type ChipProps<Value = ComboboxValue> = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; value: Value };
export type ChipRemoveProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

export type PortalProps = React.PropsWithChildren<{ container?: HTMLElement | null }>;

export type BackdropProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; forceMount?: boolean };

export type PositionerProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  anchor?: React.RefObject<HTMLElement | null> | HTMLElement | null;
  side?: Side;
  align?: ComboboxAlign;
  sideOffset?: number;
  alignOffset?: number;
  collisionPadding?: number;
  /** Escape hatch */
  placement?: FloatingPlacement;
};

export type PopupProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  forceMount?: boolean;
  /**
   * Focus behavior kept minimal here; you can extend later to match README more closely.
   */
  initialFocus?: boolean;
  finalFocus?: boolean;
};

export type ArrowProps = Omit<FloatingArrowProps, "context">;

export type ListProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  asChild?: boolean;
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
};

export type CollectionProps = {
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
};

export type RowProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };

export type ItemProps<Value = ComboboxValue> = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  value: Value;
  disabled?: boolean;
  textValue?: string;
};

export type ItemIndicatorProps = React.HTMLAttributes<HTMLSpanElement> & { asChild?: boolean };
export type EmptyProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
export type StatusProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };

export type GroupProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
export type GroupLabelProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
export type Orientation = "horizontal" | "vertical";
export type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; orientation?: Orientation };
