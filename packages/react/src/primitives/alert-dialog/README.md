# @haitch-ui/react-alert-dialog

Scaffolded primitive package.

## Install
```sh
pnpm add @haitch-ui/react-alert-dialog
```

## Overview

Alert Dialog primitives compose a modal confirmation experience for destructive or
critical actions. `Root` manages open state, focus, and portal placement, while
`Trigger`, `Content`, `Title`, `Description`, `Action`, and `Cancel` build the
interactive surface.

## Usage

```tsx
import {
 Root,
 Trigger,
 Content,
 Header,
 Footer,
 Title,
 Description,
 Action,
 Cancel,
} from "@haitch-ui/react-alert-dialog";

export function DeleteProjectDialog() {
 return (
  <Root>
   <Trigger>Delete project</Trigger>
   <Content>
    <Header>
     <Title>Delete project?</Title>
     <Description>This action cannot be undone.</Description>
    </Header>
    <Footer>
     <Cancel>Cancel</Cancel>
     <Action>Delete</Action>
    </Footer>
   </Content>
  </Root>
 );
}
```

## Anatomy

- `Root`: owns open state, focus management, and portal root.
- `Trigger`: opens the dialog and exposes ARIA attributes.
- `Content`: renders the alert dialog surface inside a portal and overlay.
- `Title`: labels the dialog and connects to `aria-labelledby`.
- `Description`: provides supporting text and connects to `aria-describedby`.
- `Action`: primary action that closes the dialog after activation.
- `Cancel`: secondary action that closes the dialog and receives initial focus.
- `Header`/`Footer`: layout wrappers for grouping content.
- `Portal`: manual portal utility when composing custom structures.
- `Overlay`: backdrop element rendered alongside `Content`.

## Behavior

- Modal only: Alert Dialog always traps focus and locks page scroll while open.
- Controlled/uncontrolled: use `open` + `onOpenChange` or `defaultOpen`.
- Escape closes when enabled; disabled roots ignore Escape and actions.
- Focus management: initial focus prefers `Cancel`, then first focusable; focus
  returns to the trigger or last active element on close.
- Mounting: `Content` unmounts when closed by default; use `forceMount` to keep it in the DOM.
- Portal placement: pass `container` to `Content` or use `Portal` directly to target
  a specific mount node.

## Accessibility

- `Trigger` sets `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls`.
- `Content` uses `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby`, and
  `aria-describedby`.
- `Title` and `Description` supply IDs and data attributes for styling hooks.

## Testing strategy

- Use Vitest + React Testing Library + user-event, mirroring the accordion test
  coverage for state, ARIA wiring, and slotting behavior.
- Root coverage: default open state, controlled updates, Escape handling, focus
  restoration, and scroll lock.
- Trigger/Action/Cancel coverage: open/close transitions, disabled behavior, and
  `asChild` slotting.
- Content coverage: mount/hidden behavior, focus trapping on Tab, and Escape
  handling from inside the dialog.
- Portal/Overlay coverage: portal targeting and overlay state attributes.
- Utility coverage: `usePresence` timing and `getFocusableWithin` filtering rules.

## Coverage reflection

Current tests validate composition, accessibility wiring, and core open/close
flows. Transition timing is asserted at the hook level rather than visual style
integration, and overlay DOM manager behavior is not exhaustively simulated. Add
integration tests if custom portal roots or overlay event handling become a public
contract.
