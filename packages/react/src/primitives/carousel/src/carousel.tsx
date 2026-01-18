"use client";

import * as React from "react";
import { Slot } from "@/primitives/slot/src";
import { composeRefs } from "@/primitives/compose-refs/src";
import {
	useCarouselEngine,
	type UseCarouselEngineOptions,
	type CarouselApi,
	type CarouselEngine,
} from "./engine";

type CarouselContextValue = CarouselEngine;
const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarouselContext(component: string) {
	const ctx = React.useContext(CarouselContext);
	if (!ctx) throw new Error(`${component} must be used within Carousel.Root`);
	return ctx;
}

type RootProps = React.HTMLAttributes<HTMLDivElement> & {
	asChild?: boolean;
	options?: UseCarouselEngineOptions;

	/**
	 * Expose the stable API instance to outer layers (shadcn layer).
	 * (This is NOT the full reactive engine.)
	 */
	onApi?: (api: CarouselApi) => void;
};

const Root = React.forwardRef<HTMLDivElement, RootProps>(function CarouselRoot(
	{ asChild = false, options, onApi, ...props },
	forwardedRef
) {
	const engine = useCarouselEngine(options);
	const Comp: any = asChild ? Slot : "div";

	const onApiRef = React.useRef(onApi);
	React.useEffect(() => {
		onApiRef.current = onApi;
	}, [onApi]);

	React.useEffect(() => {
		onApiRef.current?.(engine.api);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<CarouselContext.Provider value={engine}>
			<Comp
				ref={composeRefs(forwardedRef, engine.api.setRoot)}
				{...engine.getRootProps(props)}
			/>
		</CarouselContext.Provider>
	);
});

Root.displayName = "Carousel.Root";

/* -------------------------------------------------------------------------------------------------
 * Viewport
 * -----------------------------------------------------------------------------------------------*/

type ViewportProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };

const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(function CarouselViewport(
	{ asChild = false, ...props },
	forwardedRef
) {
	const engine = useCarouselContext("Carousel.Viewport");
	const Comp: any = asChild ? Slot : "div";

	return (
		<Comp
			ref={composeRefs(forwardedRef, engine.api.setViewport)}
			{...engine.getViewportProps(props)}
		/>
	);
});

Viewport.displayName = "Carousel.Viewport";

/* -------------------------------------------------------------------------------------------------
 * Content
 * -----------------------------------------------------------------------------------------------*/

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
	asChild?: boolean;
	children?: React.ReactNode;
};

function toElements(children: React.ReactNode) {
	return React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement[];
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function CarouselContent(
	{ asChild = false, children, ...props },
	forwardedRef
) {
	const engine = useCarouselContext("Carousel.Content");
	const Comp: any = asChild ? Slot : "div";

	const items = React.useMemo(() => toElements(children), [children]);
	const realCount = items.length;

	// Stable setter lives on api.
	const setRealCount = engine.api.setRealCount;

	React.useEffect(() => {
		setRealCount(realCount);
	}, [setRealCount, realCount]);

	const loopEnabled = engine.loop && realCount > 1 && engine.loopClones > 0;

	const renderedChildren = React.useMemo(() => {
		if (!loopEnabled) return items;

		const n = Math.min(engine.loopClones, realCount);
		if (n <= 0) return items;

		const before = items.slice(realCount - n).map((el, i) =>
			React.cloneElement(el, {
				key: `__clone_before_${i}__${el.key ?? ""}`,
				"data-carousel-clone": "",
			} as any)
		);

		const after = items.slice(0, n).map((el, i) =>
			React.cloneElement(el, {
				key: `__clone_after_${i}__${el.key ?? ""}`,
				"data-carousel-clone": "",
			} as any)
		);

		return [...before, ...items, ...after];
	}, [engine.loopClones, items, loopEnabled, realCount]);

	return (
		<Comp
			ref={composeRefs(forwardedRef, engine.api.setContent)}
			{...props}
		>
			{renderedChildren}
		</Comp>
	);
});

Content.displayName = "Carousel.Content";

/* -------------------------------------------------------------------------------------------------
 * Item
 * -----------------------------------------------------------------------------------------------*/

type ItemProps = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };

const Item = React.forwardRef<HTMLDivElement, ItemProps>(function CarouselItem(
	{ asChild = false, ...props },
	forwardedRef
) {
	const Comp: any = asChild ? Slot : "div";
	return <Comp ref={forwardedRef} {...props} />;
});

Item.displayName = "Carousel.Item";

/* -------------------------------------------------------------------------------------------------
 * Controls
 * -----------------------------------------------------------------------------------------------*/

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

const Previous = React.forwardRef<HTMLButtonElement, ButtonProps>(function CarouselPrevious(
	{ asChild = false, disabled, ...props },
	forwardedRef
) {
	const engine = useCarouselContext("Carousel.Previous");
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={forwardedRef}
			type="button"
			aria-label={props["aria-label"] ?? "Previous slide"}
			disabled={disabled ?? !engine.canScrollPrev}
			onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
				props.onClick?.(e);
				if (e.defaultPrevented) return;
				engine.api.scrollPrev();
			}}
			{...props}
		/>
	);
});

Previous.displayName = "Carousel.Previous";

const Next = React.forwardRef<HTMLButtonElement, ButtonProps>(function CarouselNext(
	{ asChild = false, disabled, ...props },
	forwardedRef
) {
	const engine = useCarouselContext("Carousel.Next");
	const Comp: any = asChild ? Slot : "button";

	return (
		<Comp
			ref={forwardedRef}
			type="button"
			aria-label={props["aria-label"] ?? "Next slide"}
			disabled={disabled ?? !engine.canScrollNext}
			onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
				props.onClick?.(e);
				if (e.defaultPrevented) return;
				engine.api.scrollNext();
			}}
			{...props}
		/>
	);
});

Next.displayName = "Carousel.Next";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/

export const Carousel = { Root, Viewport, Content, Item, Previous, Next };
export { Root, Viewport, Content, Item, Previous, Next };
export type { RootProps, ViewportProps, ContentProps, ItemProps };
