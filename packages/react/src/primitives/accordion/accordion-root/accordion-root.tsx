"use client";
import { useId, forwardRef, useCallback, useMemo } from "react";
import { Slot } from "@/primitives/slot";
import { FloatingTree, useFloatingNodeId, useFloatingTree, type FloatingTreeType } from "@floating-ui/react";
import { useControllableState } from "@/primitives/hooks/useControllableState";
import { AccordionRootContext } from "../accordion-context";
import type { RootProps, } from "../accordion-types";

function dataAttrDisabled(disabled: boolean) {
	return disabled ? "" : undefined;
}

const RootImpl = forwardRef<HTMLElement, RootProps>(function RootImpl(props, ref) {
	const {
		asChild = false,
		disabled = false,
		orientation = "vertical",
		dir = "ltr",
		type,
		collapsible: collapsibleProp, // ✅ remove from rest
		value,
		defaultValue,
		onValueChange,
		...rest
	} = props;

	const tree = useFloatingTree();
	const nodeId = useFloatingNodeId() ?? useId();

	// normalize
	const collapsible = type === "single" ? !!collapsibleProp : true;

	// ----- state
	const singleStateProps: any = {
		value: type === "single" ? (value as string | undefined) : undefined,
		defaultValue: type === "single" ? ((defaultValue as string | undefined) ?? "") : "",
	};
	if (type === "single" && onValueChange) {
		singleStateProps.onChange = onValueChange as (v: string) => void;
	}
	const [singleValue, setSingleValue] = useControllableState<string>(singleStateProps);

	const multiStateProps: any = {
		value: type === "multiple" ? (value as string[] | undefined) : undefined,
		defaultValue: type === "multiple" ? ((defaultValue as string[] | undefined) ?? []) : [],
	};
	if (type === "multiple" && onValueChange) {
		multiStateProps.onChange = onValueChange as (v: string[]) => void;
	}
	const [multiValue, setMultiValue] = useControllableState<string[]>(multiStateProps);

	const isItemOpen = useCallback(
		(v: string) => {
			return type === "single" ? singleValue === v : multiValue.includes(v);
		},
		[type, singleValue, multiValue]
	);

	const openItem = useCallback(
		(v: string) => {
			if (disabled) return;

			if (type === "single") {
				setSingleValue(v);
				tree?.events.emit("accordion:itemopen", { nodeId, value: v });
				return;
			}

			setMultiValue((prev) => (prev.includes(v) ? prev : [...prev, v]));
			tree?.events.emit("accordion:itemopen", { nodeId, value: v });
		},
		[disabled, type, setSingleValue, setMultiValue, tree, nodeId]
	);

	const closeItem = useCallback(
		(v: string) => {
			if (disabled) return;

			if (type === "single") {
				if (singleValue !== v) return;
				if (!collapsible) return;
				setSingleValue("");
				tree?.events.emit("accordion:itemclose", { nodeId, value: v });
				return;
			}

			setMultiValue((prev) => prev.filter((x) => x !== v));
			tree?.events.emit("accordion:itemclose", { nodeId, value: v });
		},
		[disabled, type, singleValue, collapsible, setSingleValue, setMultiValue, tree, nodeId]
	);

	const toggleItem = useCallback(
		(v: string) => {
			if (isItemOpen(v)) closeItem(v);
			else openItem(v);
		},
		[isItemOpen, closeItem, openItem]
	);

	// ids per item value
	const idBase = useId();
	const getTriggerId = useCallback((v: string) => `${idBase}-trigger-${v}`, [idBase]);
	const getContentId = useCallback((v: string) => `${idBase}-content-${v}`, [idBase]);

	// Optional: Tree listener (kept conservative)
	// We do NOT auto-close siblings here because Root state already governs it.
	// This is mainly to satisfy "FloatingTree usage" and enable future cross-root behaviors.

	const ctx = useMemo(
		() => ({
			type,
			orientation,
			dir,
			collapsible,
			disabled,
			isItemOpen,
			toggleItem,
			openItem,
			closeItem,
			getTriggerId,
			getContentId,
			tree: tree as FloatingTreeType | null,
			nodeId,
		}),
		[type, orientation, dir, collapsible, disabled, isItemOpen, toggleItem, openItem, closeItem, getTriggerId, getContentId, tree, nodeId]
	);

	const Comp: any = asChild ? Slot : "div";

	return (
		<AccordionRootContext.Provider value={ctx}>
			<Comp
				ref={ref as any}
				data-slot="accordion"
				data-orientation={orientation}
				data-disabled={dataAttrDisabled(disabled)}
				dir={dir}
				{...rest} // ✅ safe now
			/>
		</AccordionRootContext.Provider>
	);
});

export const Root = forwardRef<HTMLElement, RootProps>(function Root(props, ref) {
	// ✅ ensure tree exists for all descendants
	return (
		<FloatingTree>
			<RootImpl {...props} ref={ref} />
		</FloatingTree>
	);
});
