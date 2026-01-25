"use client";

export type {
	ComboboxValue as ComboboxValueType,
	InteractionType as ComboboxInteractionType,
	ComboboxAlign,
	RootProps as ComboboxRootProps,
	InputProps as ComboboxInputProps,
	TriggerProps as ComboboxTriggerProps,
	ValueProps as ComboboxValueProps,
	IconProps as ComboboxIconProps,
	ClearProps as ComboboxClearProps,
	ChipData as ComboboxChipData,
	ChipsProps as ComboboxChipsProps,
	ChipProps as ComboboxChipProps,
	ChipRemoveProps as ComboboxChipRemoveProps,
	PortalProps as ComboboxPortalProps,
	BackdropProps as ComboboxBackdropProps,
	PositionerProps as ComboboxPositionerProps,
	PopupProps as ComboboxPopupProps,
	ArrowProps as ComboboxArrowProps,
	ListProps as ComboboxListProps,
	CollectionProps as ComboboxCollectionProps,
	RowProps as ComboboxRowProps,
	ItemProps as ComboboxItemProps,
	ItemIndicatorProps as ComboboxItemIndicatorProps,
	EmptyProps as ComboboxEmptyProps,
	StatusProps as ComboboxStatusProps,
	GroupProps as ComboboxGroupProps,
	GroupLabelProps as ComboboxGroupLabelProps,
	Orientation as ComboboxOrientation,
	SeparatorProps as ComboboxSeparatorProps,
} from "./src/types";

import { Root } from "./src/root";
import { Value } from "./src/value";
import { Icon } from "./src/icon";
import { Input } from "./src/input";
import { Trigger } from "./src/trigger";
import { Clear } from "./src/clear";
import { Chips } from "./src/chips";
import { Chip } from "./src/chip";
import { ChipRemove } from "./src/chip-remove";
import { Portal } from "./src/portal";
import { Backdrop } from "./src/backdrop";
import { Positioner } from "./src/positioner";
import { Popup } from "./src/popup";
import { Arrow } from "./src/arrow";
import { List } from "./src/list";
import { Collection } from "./src/collection";
import { Row } from "./src/row";
import { Item } from "./src/item";
import { ItemIndicator } from "./src/item-indicator";
import { Group } from "./src/group";
import { GroupLabel } from "./src/group-label";
import { Separator } from "./src/separator";
import { Empty } from "./src/empty";
import { Status } from "./src/status";
import { useFilter } from "./src/use-filter";

export {
	Root as ComboboxRoot,
	Value as ComboboxValue,
	Icon as ComboboxIcon,
	Input as ComboboxInput,
	Trigger as ComboboxTrigger,
	Clear as ComboboxClear,
	Chips as ComboboxChips,
	Chip as ComboboxChip,
	ChipRemove as ComboboxChipRemove,
	Portal as ComboboxPortal,
	Backdrop as ComboboxBackdrop,
	Positioner as ComboboxPositioner,
	Popup as ComboboxPopup,
	Arrow as ComboboxArrow,
	List as ComboboxList,
	Collection as ComboboxCollection,
	Row as ComboboxRow,
	Item as ComboboxItem,
	ItemIndicator as ComboboxItemIndicator,
	Group as ComboboxGroup,
	GroupLabel as ComboboxGroupLabel,
	Separator as ComboboxSeparator,
	Empty as ComboboxEmpty,
	Status as ComboboxStatus,
	useFilter as useComboboxFilter,
};

export const Combobox = {
	Root,
	Value,
	Icon,
	Input,
	Trigger,
	Clear,
	Chips,
	Chip,
	ChipRemove,
	Portal,
	Backdrop,
	Positioner,
	Popup,
	Arrow,
	List,
	Collection,
	Row,
	Item,
	ItemIndicator,
	Group,
	GroupLabel,
	Separator,
	Empty,
	Status,
} as const;
