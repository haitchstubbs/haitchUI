// apps/web/components/ui/carousel.tsx
"use client";

import * as React from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

import { cn } from "../../lib/util";
import { Button } from "./button";

import {
  Carousel as CarouselPrimitive,
  type CarouselApi,
  type UseCarouselEngineOptions,
} from "@haitch-ui/react-carousel";

type CarouselOptions = UseCarouselEngineOptions;
type CarouselPlugin = never;

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: (node: HTMLDivElement | null) => void;
  api: CarouselApi | null;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error("useCarousel must be used within a <Carousel />");
  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins, // unused
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const axis = orientation === "horizontal" ? "x" : "y";

  const options = React.useMemo<UseCarouselEngineOptions>(() => {
    return {
      ...(opts ?? {}),
      axis,
      dragMode: opts?.dragMode ?? "physics",
      loop: opts?.loop ?? true,
      boundarySelector: opts?.boundarySelector ?? ".ui-root",
      loopClones: opts?.loopClones ?? 1,
      friction: opts?.friction ?? 0.92,
      minVelocity: opts?.minVelocity ?? 0.02,
      snapOnRelease: opts?.snapOnRelease ?? true,
    };
  }, [axis, opts]);

  const [api, setLocalApi] = React.useState<CarouselApi | null>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onApi = React.useCallback(
    (next: CarouselApi) => {
      setLocalApi(next);
      setApi?.(next);
    },
    [setApi]
  );

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  const viewportNodeRef = React.useRef<HTMLDivElement | null>(null);

  const carouselRef = React.useCallback((node: HTMLDivElement | null) => {
    viewportNodeRef.current = node;
  }, []);

  React.useEffect(() => {
    if (!api) return;

    api.setViewport(viewportNodeRef.current);

    // Minimal “shadcn flags” support:
    // - if loop is on, both should always be possible (unless only 1 slide)
    // - we don’t have real canScrollPrev/Next on the stable API yet
    const hasApi = true;
    setCanScrollPrev(hasApi);
    setCanScrollNext(hasApi);
  }, [api]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        plugins,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <CarouselPrimitive.Root
        options={options}
        onApi={onApi}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </CarouselPrimitive.Root>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <CarouselPrimitive.Viewport
      ref={carouselRef as any}
      className={cn(
        "overflow-hidden",
        orientation === "horizontal" ? "touch-pan-y select-none" : "touch-pan-x select-none"
      )}
      data-slot="carousel-content"
    >
      <CarouselPrimitive.Content
        className={cn("flex", orientation === "horizontal" ? "" : "-mt-4 flex-col", className)}
        {...props}
      />
    </CarouselPrimitive.Viewport>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <CarouselPrimitive.Item
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "" : "pt-4",
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <IconArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <IconArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
