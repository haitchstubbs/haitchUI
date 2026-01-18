export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";

export type Positioning = {
	side: Side;
	align: Align;
	sideOffset: number;
	alignOffset: number;
	collisionPadding: number;
};

export type PortalProps = {
	children: React.ReactNode;
	container?: HTMLElement | null;
};

export type TriggerProps = React.HTMLAttributes<HTMLElement> & { asChild?: boolean };

export type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
	side?: Side;
	align?: Align;
	sideOffset?: number;
	alignOffset?: number;
	collisionPadding?: number;

	portal?: boolean;
	modal?: boolean;

	forceMount?: boolean;
};

export type ItemProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	disabled?: boolean;
	onSelect?: (event: Event) => void;
	textValue?: string;
	closeOnSelect?: boolean;
};

export type IndicatorState = { checked: boolean; disabled?: boolean };

export type CheckboxItemProps = Omit<React.HTMLAttributes<HTMLElement>, "onChange"> & {
	asChild?: boolean;
	checked?: boolean;
	defaultChecked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	disabled?: boolean;
	closeOnSelect?: boolean;
	textValue?: string;
};

export type RadioGroupCtx = {
	value: string | undefined;
	setValue: (next: string) => void;
	disabled?: boolean;
};

export type RadioGroupProps = {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
	children: React.ReactNode;
};

export type RadioItemProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	value: string;
	disabled?: boolean;
	closeOnSelect?: boolean;
	textValue?: string;
};

export type SubProps = {
	children: React.ReactNode;
	open?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export type SubTriggerProps = React.HTMLAttributes<HTMLElement> & {
	asChild?: boolean;
	disabled?: boolean;
};

export type SubContentProps = Omit<ContentProps, "portal"> & { portal?: boolean };