"use client";

export { Root as DropdownMenuRoot } from "./src/root/component";
export { Trigger as DropdownMenuTrigger } from "./src/trigger/component";
export { Content as DropdownMenuContent } from "./src/content/component";
export { Item as DropdownMenuItem } from "./src/item/component";
export { Group as DropdownMenuGroup } from "./src/group/component";
export { Label as DropdownMenuLabel } from "./src/label/component";
export { Separator as DropdownMenuSeparator } from "./src/separator/component";
export { CheckboxItem as DropdownMenuCheckboxItem } from "./src/checkbox/component";
export { RadioGroup as DropdownMenuRadioGroup } from "./src/radio/group";
export { RadioItem as DropdownMenuRadioItem } from "./src/radio/item";
export { ItemIndicator as DropdownMenuItemIndicator } from "./src/indicator/component";
export { Shortcut as DropdownMenuShortcut } from "./src/shortcut/component";
export { Portal as DropdownMenuPortal } from "./src/portal/component";
export { Sub as DropdownMenuSub } from "./src/sub-menu/sub-menu";
export { SubTrigger as DropdownMenuSubTrigger } from "./src/sub-menu/sub-trigger";
export { SubContent as DropdownMenuSubContent } from "./src/sub-menu/sub-content";

export { RootContext as DropdownMenuContext } from "./src/context/rootContext";
export { useCtx as useDropdownMenuContext } from "./src/context/useRootContext";
export { SubContext as DropdownMenuSubContext } from "./src/sub-menu/context";
export { useSubCtx as useDropdownMenuSubContext } from "./src/sub-menu/useSubContext";
export { RadioGroupContext as DropdownMenuRadioGroupContext } from "./src/radio/context";
export { useRadioGroupCtx as useDropdownMenuRadioGroupContext } from "./src/radio/useRadioGroupContext";
export { ItemIndicatorContext as DropdownMenuItemIndicatorContext } from "./src/indicator/context";
export { useIndicatorState as useDropdownMenuIndicatorState } from "./src/indicator/useIndicatorState";

export { useControllableState as useDropdownMenuControllableState } from "./src/hooks/useControllableState";

export { composeEventHandlers as dropdownMenuComposeEventHandlers } from "./src/lib/composeEventHandlers";
export { shallowEqual as dropdownMenuShallowEqual } from "./src/lib/shallowEqual";
export { toPlacement as dropdownMenuToPlacement } from "./src/lib/toPlacement";
export { getUiRootFromReference as dropdownMenuGetUiRootFromReference } from "./src/lib/getUIFromRoot";

export { useMenuInstance as useDropdownMenuInstance } from "./src/root/instance";

export type { RootProps as DropdownMenuRootProps } from "./src/root/types";
export type {
	Side as DropdownMenuSide,
	Align as DropdownMenuAlign,
	Positioning as DropdownMenuPositioning,
	PortalProps as DropdownMenuPortalProps,
	TriggerProps as DropdownMenuTriggerProps,
	ContentProps as DropdownMenuContentProps,
	ItemProps as DropdownMenuItemProps,
	IndicatorState as DropdownMenuIndicatorState,
	CheckboxItemProps as DropdownMenuCheckboxItemProps,
	RadioGroupCtx as DropdownMenuRadioGroupContextValue,
	RadioGroupProps as DropdownMenuRadioGroupProps,
	RadioItemProps as DropdownMenuRadioItemProps,
	SubProps as DropdownMenuSubProps,
	SubTriggerProps as DropdownMenuSubTriggerProps,
	SubContentProps as DropdownMenuSubContentProps,
} from "./src/types";
export type { Ctx as DropdownMenuContextValue } from "./src/context/types";
