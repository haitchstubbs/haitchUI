# Avatar Primitives

A set of composable React primitives for building accessible and customizable avatar components.

## Features

- **Composable**: Build avatars using root, image, and fallback primitives.
- **Accessible**: Implements ARIA attributes and keyboard navigation.
- **Customizable**: Style each part independently.
- **Hooks**: Utilities for managing avatar state and fallback logic.
- **TypeScript**: Fully typed API.

## Installation

```bash
npm install @haitchui/react
```

## Usage

```tsx
import {
    AvatarRoot,
    AvatarImage,
    AvatarFallback,
} from '@haitchui/react/primitives/avatar';

<AvatarRoot>
    <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
    <AvatarFallback>AB</AvatarFallback>
</AvatarRoot>
```

## API Reference

### Components

#### `AvatarRoot`

- Provides context and structure for the avatar.
- Handles sizing, accessibility, and fallback logic.

#### `AvatarImage`

- Renders the avatar image.
- Handles loading and error states.

#### `AvatarFallback`

- Displays fallback content (e.g., initials) when the image fails to load.

### Hooks

- `useAvatar`: Manages avatar state and context.
- `useAvatarFallback`: Handles fallback logic.

### Context

- `AvatarContext`: Shares avatar state between components.

### Types

- All components and hooks are fully typed. See `types/` for details.

## Testing

All primitives and hooks are covered by unit tests.

```bash
npm test
```

## File Structure

```
avatar/
    index.ts
    avatar-context/
    avatar-fallback/
    avatar-image/
    avatar-root/
    hooks/
    types/
```

## License

MIT