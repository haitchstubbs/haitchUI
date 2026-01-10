"use client";

import * as React from "react";
import {
	autoUpdate,
	flip,
	offset,
	shift,
	size,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
	useTransitionStyles,
	type Middleware as FloatingMiddleware,
	type Placement as FloatingPlacement,
	type Side,
} from "@floating-ui/react";
import { useOverlayDOMManager } from "@haitch/react-overlay";

import { useControllableBoolean, useControllableString, useControllableValue } from "./controllable";
import { clampIndex, findNextEnabledIndex, normalizeTextValue } from "./events";
import { ComboboxProvider, type ItemRecord, type RootCtx } from "./context";
import type { RootProps, Combobox, ComboboxValue, ComboboxAlign } from "./types";


function placementFromSideAlign(side: Side, align: ComboboxAlign = "start"): FloatingPlacement {
	if (align === "center") return side as FloatingPlacement;
	return `${side}-${align}` as FloatingPlacement; // start/end
}

function mapFloatingReasonToComboboxReason(reason: unknown, nextOpen: boolean): Combobox.Root.ChangeEventDetails["reason"] {
	if (nextOpen) return "open";
	if (reason === "outside-press") return "outside-press";
	if (reason === "escape-key") return "escape";
	return "close";
}

function arrayIncludesValue(arr: unknown[], value: unknown) {
	return arr.some((v) => Object.is(v, value));
}

function toggleValueInArray(arr: unknown[], value: unknown) {
	return arrayIncludesValue(arr, value) ? arr.filter((v) => !Object.is(v, value)) : [...arr, value];
}
export function Root(props: RootProps) {
	const parentManager = useOverlayDOMManager();
	const dom = parentManager.dom;

	const { value: open, setValue: setOpenRaw } = useControllableBoolean({
		value: props.open,
		defaultValue: props.defaultOpen,
	});

	const multiple = !!props.multiple;

	const { value, setValue: setValueRaw } = useControllableValue<ComboboxValue | ComboboxValue[]>({
		value: props.value,
		defaultValue: props.defaultValue ?? null,
	});

	const { value: inputValue, setValue: setInputRaw } = useControllableString({
		value: props.inputValue,
		defaultValue: props.defaultInputValue,
	});

	const setOpen = React.useCallback(
		(next: boolean, details: Combobox.Root.ChangeEventDetails) => {
			setOpenRaw(next);
			props.onOpenChange?.(next, details);
		},
		[props, setOpenRaw]
	);

	const setValue = React.useCallback(
		(next: ComboboxValue | ComboboxValue[] | null, details: Combobox.Root.ChangeEventDetails) => {
			setValueRaw(next);
			props.onValueChange?.(next, details);
		},
		[props, setValueRaw]
	);

	const setInputValue = React.useCallback(
		(next: string, details: Combobox.Root.ChangeEventDetails) => {
			setInputRaw(next);
			props.onInputValueChange?.(next, details);
		},
		[props, setInputRaw]
	);

	const [activeIndex, setActiveIndex] = React.useState(-1);
	const listboxId = React.useId();

	const [positionerOverrides, setPositionerOverridesState] = React.useState<{
		placement?: FloatingPlacement;
		side?: Side;
		align?: ComboboxAlign;
		sideOffset?: number;
		alignOffset?: number;
		collisionPadding?: number;
	}>({});

	const setPositionerOverrides = React.useCallback(
		(overrides: {
			placement?: FloatingPlacement;
			side?: Side;
			align?: ComboboxAlign;
			sideOffset?: number;
			alignOffset?: number;
			collisionPadding?: number;
		}) => {
			setPositionerOverridesState(overrides);
		},
		[]
	);

	const side = positionerOverrides.side ?? props.side ?? "bottom";
	const align: ComboboxAlign = positionerOverrides.align ?? props.align ?? "start";
	const sideOffset = positionerOverrides.sideOffset ?? props.sideOffset ?? 4;
	const alignOffset = positionerOverrides.alignOffset ?? props.alignOffset ?? 0;
	const collisionPadding = positionerOverrides.collisionPadding ?? props.collisionPadding ?? 8;

	const placement = React.useMemo(
		() => positionerOverrides.placement ?? placementFromSideAlign(side, align),
		[positionerOverrides.placement, side, align]
	);

	const middleware = React.useMemo(() => {
		const m: FloatingMiddleware[] = [];
		m.push(offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }));
		m.push(flip());
		m.push(shift({ padding: collisionPadding }));
		m.push(
			size({
				apply(args: any) {
					const { rects, elements, availableWidth, availableHeight } = args;

					Object.assign(elements.floating.style, {
						minWidth: `${rects.reference.width}px`,
						["--anchor-width" as any]: `${rects.reference.width}px`,
						["--anchor-height" as any]: `${rects.reference.height}px`,
						["--available-width" as any]: `${availableWidth}px`,
						["--available-height" as any]: `${availableHeight}px`,
					});
				},
			})
		);
		if (props.middleware?.length) m.push(...props.middleware);
		return m;
	}, [sideOffset, alignOffset, collisionPadding, props.middleware]);

	const floating = useFloating({
		open,
		onOpenChange(nextOpen, event, reason) {
			setOpen(nextOpen, { reason: mapFloatingReasonToComboboxReason(reason, nextOpen), nativeEvent: event });
		},
		placement,
		strategy: props.strategy ?? "fixed",
		middleware,
		whileElementsMounted: autoUpdate,
		transform: false,
	});

	const dismiss = useDismiss(floating.context, {
		enabled: true,
		escapeKey: false,
		outsidePressEvent: "pointerdown",
	});

	const role = useRole(floating.context, { role: "listbox" });
	const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

	const [portalRoot, setPortalRoot] = React.useState<HTMLElement | null>(() => {
		if (typeof document === "undefined") return null;
		return dom.getPortalContainer();
	});
	React.useLayoutEffect(() => {
		if (typeof document === "undefined") return;
		setPortalRoot(dom.getPortalContainer());
	}, [dom]);

	const { isMounted, styles: transitionStyles } = useTransitionStyles(floating.context, {
		duration: { open: 150, close: 150 },
		initial: { opacity: 0, transform: "scale(0.98)" },
		open: { opacity: 1, transform: "scale(1)" },
		close: { opacity: 0, transform: "scale(0.98)" },
	});

	const itemsRef = React.useRef<ItemRecord[]>([]);
	const [, bumpItemsVersion] = React.useState(0);

	const registerItem = React.useCallback((record: ItemRecord) => {
		itemsRef.current.push(record);
		return () => {
			const idx = itemsRef.current.indexOf(record);
			if (idx >= 0) itemsRef.current.splice(idx, 1);
		};
	}, []);

	const getItems = React.useCallback(() => itemsRef.current, []);
	const notifyItemsChanged = React.useCallback(() => bumpItemsVersion((v) => v + 1), []);

	const inputRef = React.useRef<HTMLInputElement | null>(null);
	const suppressOpenOnFocusRef = React.useRef(false);

	const referenceElementRef = React.useRef<HTMLElement | null>(null);
	const anchorElementRef = React.useRef<HTMLElement | null>(null);
	const setReferenceElement = React.useCallback(
		(node: HTMLElement | null) => {
			referenceElementRef.current = node;
			if (!anchorElementRef.current) floating.refs.setReference(node);
		},
		[floating.refs]
	);
	const setAnchorElement = React.useCallback(
		(node: HTMLElement | null) => {
			anchorElementRef.current = node;
			floating.refs.setReference(node ?? referenceElementRef.current);
		},
		[floating.refs]
	);

	const isEmpty = itemsRef.current.length === 0;

	// actionsRef (minimal): supports “keepMounted + manual unmount”
	const keepMounted = props.keepMounted ?? false;
	const [forceUnmounted, setForceUnmounted] = React.useState(false);

	React.useLayoutEffect(() => {
		if (!props.actionsRef) return;
		props.actionsRef.current = {
			unmount() {
				setForceUnmounted(true);
			},
		};
		return () => {
			if (props.actionsRef) props.actionsRef.current = null;
		};
	}, [props.actionsRef]);

	// Keyboard navigation (kept close to your current approach)
	const onKeyDown = React.useCallback(
		(event: React.KeyboardEvent) => {
			if (props.disabled) return;

			const items = getItems();
			const len = items.length;

			if (event.key === "ArrowDown") {
				event.preventDefault();
				if (!open) setOpen(true, { reason: "open", nativeEvent: event.nativeEvent });
				const next = findNextEnabledIndex(items, activeIndex < 0 ? -1 : activeIndex, 1, true);
				setActiveIndex(next);
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				if (!open) setOpen(true, { reason: "open", nativeEvent: event.nativeEvent });
				const next = findNextEnabledIndex(items, activeIndex < 0 ? len : activeIndex, -1, true);
				setActiveIndex(next);
				return;
			}

			if (event.key === "Enter") {
				if (!open) return;
				event.preventDefault();
				const rec = items[clampIndex(activeIndex, len)];
				if (!rec || rec.disabled) return;
				if (multiple) {
					const current = Array.isArray(value) ? value : [];
					const next = toggleValueInArray(current, rec.value) as ComboboxValue[];
					setValue(next, { reason: "select", nativeEvent: event.nativeEvent });
					setInputValue("", { reason: "select", nativeEvent: event.nativeEvent });
					if (!open) setOpen(true, { reason: "open", nativeEvent: event.nativeEvent });
				} else {
					setValue(rec.value, { reason: "select", nativeEvent: event.nativeEvent });
					setInputValue(normalizeTextValue(rec), { reason: "select", nativeEvent: event.nativeEvent });
					setOpen(false, { reason: "close", nativeEvent: event.nativeEvent });
				}
				return;
			}

			if (event.key === "Escape") {
				if (!open) return;
				event.preventDefault();
				setOpen(false, { reason: "escape", nativeEvent: event.nativeEvent });
			}
		},
		[activeIndex, getItems, multiple, open, props.disabled, setInputValue, setOpen, setValue, value]
	);

	// Expose the “reference” element as the input by default.
	// Input/Trigger will attach getReferenceProps / refs.reference.
	const ctx = React.useMemo<RootCtx>(
		() => ({
			disabled: !!props.disabled,
			modal: props.modal ?? true,
			multiple,

			open,
			setOpen,

			value,
			setValue,

			inputValue,
			setInputValue,

			activeIndex,
			setActiveIndex,

			listboxId,

			placement,
			side,
			align,
			floatingStrategy: props.strategy ?? "fixed",
			middleware,
			setPositionerOverrides,

			refs: {
				reference: setReferenceElement,
				floating: floating.refs.setFloating,
			},
			setAnchorElement,
			floatingStyles: floating.floatingStyles,
			getReferenceProps: getReferenceProps as unknown as (userProps?: Record<string, any>) => Record<string, any>,
			getFloatingProps: getFloatingProps as unknown as (userProps?: Record<string, any>) => Record<string, any>,
			floatingContext: floating.context,
			isMounted: keepMounted ? !forceUnmounted : isMounted,
			transitionStyles,

			portalRoot,

			registerItem,
			getItems,
			notifyItemsChanged,

			inputRef,
			suppressOpenOnFocusRef,

			isEmpty,
			onKeyDown,
		}),
		[
			props.disabled,
			props.modal,
			multiple,
			open,
			setOpen,
			value,
			setValue,
			inputValue,
			setInputValue,
			activeIndex,
			placement,
			side,
			align,
			props.strategy,
			middleware,
			setPositionerOverrides,
			setReferenceElement,
			floating.refs.setFloating,
			setAnchorElement,
			floating.context,
			floating.floatingStyles,
			getReferenceProps,
			getFloatingProps,
			keepMounted,
			forceUnmounted,
			isMounted,
			transitionStyles,
			portalRoot,
			registerItem,
			getItems,
			notifyItemsChanged,
			isEmpty,
			onKeyDown,
		]
	);

	// Root renders no element (per README)
	// We still need to wire keyboard handling somewhere: do it on Input via getReferenceProps.
	return (
		<ComboboxProvider value={ctx}>
			{props.name ? (
				multiple && Array.isArray(value) ? (
					value.map((v, i) => <input key={i} type="hidden" name={props.name} value={v == null ? "" : String(v)} />)
				) : (
					<input type="hidden" name={props.name} value={value == null ? "" : String(value)} />
				)
			) : null}
			{props.children}
		</ComboboxProvider>
	);
}
