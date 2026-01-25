# Carousel Primitives

A set of composable, accessible React components and hooks for building carousels in [haitchUI](https://github.com/haitchstubbs/haitchUI).

## Features

- **Composable**: Use only the parts you need.
- **Accessible**: Keyboard navigation and ARIA attributes.
- **Unstyled**: Bring your own styles.
- **TypeScript**: Fully typed API.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import {
    CarouselRoot,
    CarouselViewport,
    CarouselContent,
    CarouselItem,
    CarouselButtonNext,
    CarouselButtonPrevious,
} from '@haitchui/react/primitives/carousel';

function ExampleCarousel() {
    return (
        <CarouselRoot>
            <CarouselViewport>
                <CarouselContent>
                    <CarouselItem>Slide 1</CarouselItem>
                    <CarouselItem>Slide 2</CarouselItem>
                    <CarouselItem>Slide 3</CarouselItem>
                </CarouselContent>
            </CarouselViewport>
            <CarouselButtonPrevious>Previous</CarouselButtonPrevious>
            <CarouselButtonNext>Next</CarouselButtonNext>
        </CarouselRoot>
    );
}
```

## Components

### `<CarouselRoot />`

Root provider for carousel context and state.

### `<CarouselViewport />`

Container for the visible area of the carousel.

### `<CarouselContent />`

Wrapper for carousel items. Handles scrolling logic.

### `<CarouselItem />`

Represents a single slide/item in the carousel.

### `<CarouselButtonNext />` / `<CarouselButtonPrevious />`

Buttons to navigate forward/backward.

## Hooks

### `useCarousel()`

Access carousel state and helpers from context.

```tsx
import { useCarousel } from '@haitchui/react/primitives/carousel';

function CustomControls() {
    const { next, previous, selectedIndex } = useCarousel();
    // ...
}
```

## Types

Type definitions are available in the `types` directory for advanced usage.

## Accessibility

- Keyboard navigation (arrow keys, tab, etc.)
- Proper ARIA roles and attributes
- Focus management

## Testing

Each component and hook is covered by unit tests.

## License

MIT