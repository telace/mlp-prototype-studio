# Reusable Component Patterns

Use these patterns when creating or updating MLP low-fidelity prototypes. Prefer these components before inventing page-specific UI.

## General Rules

- Components must use the grayscale tokens, typography scale, spacing scale, radius scale, and border rules from `visual-standard.md`.
- Do not use semi-transparent overlays. For blocked layers, use a solid dark overlay area such as `#111111` or `#222222`.
- Do not use dashed borders, gradients, blur, glow, or photo assets in low-fidelity placeholders.
- Every reusable component added to a real product page must have Product Notes entries for each interactive control inside it.
- Every visible button/control inside a reusable layer component must have a concrete prototype click result. This includes backdrop buttons, close icons, cancel buttons, row actions, select buttons, and confirm buttons. Do not ship a component example with no-op layer controls.
- Component examples belong on the `组件库` docs page when the project will reuse them across multiple screens.

## Buttons

Use the shared button classes as the default implementation:

- Primary action: `.bottom-cta` or `.primary-btn`
  - Min height `44px`
  - Radius `12px`
  - Background `#2A2A2A`
  - Border `1px solid #2A2A2A`
  - Text `#FFFFFF`
- Secondary action: `.ghost-cta` or `.secondary-btn`
  - Min height `44px`
  - Radius `12px`
  - Background `#1C1C1C`
  - Border `1px solid #3A3A3A`
  - Text `#F2F2F2`
- Compact chip: `.chip`
  - Height `32px`
  - Radius `999px`
  - Border `1px solid #3A3A3A`
  - Selected state uses `#F2F2F2` background and `#111111` text.
- Icon button: `.icon-btn`
  - Size `32px` compact or `36px` navigation
  - Radius `10px`
  - Icon size `16-20px`

Do not mix pill buttons and 12px-radius buttons inside the same action group. Bottom operation areas always use the locked bottom action bar standard.

## Form Field

Use a row-based form field for phone/email/code inputs:

- Container `.form-field`
- Height `44px` minimum
- Radius `12px`
- Background `#111111` or `#1C1C1C`
- Border `1px solid #3A3A3A`
- Label width should remain compact; input text uses body typography.
- Inline actions such as `获取验证码` stay inside the row and use flow-switch text treatment.

## Bottom Sheet

Use bottom sheets for temporary selections, photo albums, filter choices, and confirmation details that keep the user on the current page.

- Layer: `.bottom-sheet-layer`
- Solid overlay: `.sheet-backdrop`
- Sheet body: `.bottom-sheet`
- The backdrop must be a clickable control that closes the sheet or returns to the previous state.
- On secondary pages, the sheet layer and backdrop must cover the phone system status bar as well as the page content.
- If the sheet is mounted inside `.screen` or another clipped content area and cannot physically cover the status bar, add a phone-level status-bar scrim tied to the sheet open state. The phone-level scrim must use the same solid scrim token and close the sheet when tapped.
- Anchored to the bottom of the phone viewport.
- Width fills the phone viewport.
- Radius `22px 22px 0 0`.
- Background `#1C1C1C`.
- Border top `1px solid #3A3A3A`.
- Padding `16px`.
- Max height about `70%` of the phone viewport; content scrolls internally when needed.
- Include a `36px x 4px` handle when useful.
- Primary and secondary actions inside the sheet reuse standard button classes.
- Each sheet row/action must either navigate, update page state, or show feedback such as a toast. Avoid display-only rows in prototype examples unless explicitly marked disabled.

Product Notes must document:

- What opens the sheet.
- What closes the sheet.
- Each selectable row or action.
- Empty/loading/error states if the sheet loads remote data.

## Action Sheet

Use an action sheet for a short list of mutually exclusive commands.

- Reuse bottom sheet layer structure.
- Rows use `.action-sheet-row`.
- Each row must have a defined click result.
- Row height `48px`.
- Radius `12px`.
- Border `1px solid #3A3A3A`.
- Cancel action is visually separated by `10px` vertical gap.

## Left Drawer

Use a left drawer for menu, filters, layered navigation, or advanced settings.

- Layer: `.drawer-layer`
- Solid overlay: `.drawer-backdrop`
- Drawer body: `.left-drawer`
- The backdrop and close icon must be clickable and close the drawer or return to the previous state.
- Width `292px` or `78%` of phone viewport, whichever is smaller.
- Full phone height.
- Background `#1C1C1C`.
- Border right `1px solid #3A3A3A`.
- Padding `16px`.
- No floating desktop-style shadow.
- Close action should be a top-right or top-row icon button.
- Every drawer row must have a defined result such as navigation, applying a filter, closing the drawer, or showing feedback.

Use a drawer only when the product interaction genuinely benefits from persistent side navigation or filter grouping. Do not use it for simple two-option switches.

## Toast

Use toast for short feedback after a tap or system event.

- Class `.toast-message`.
- Position inside the phone viewport near the top by default. On secondary pages, place it below the locked top title bar so it does not cover navigation.
- Min height `36px`.
- Max width `calc(100% - 32px)`.
- Radius `12px`.
- Background `#F2F2F2`.
- Text `#111111`.
- Padding `0 12px`.
- Font `12px / 16px`, weight `800`.
- Prototype may keep the toast visible as a state; real behavior should auto-dismiss after about `2-3s`.

## Modal Dialog

Use modal dialogs for blocking confirmations, insufficient energy, payment retention, permission failures, and unrecoverable errors.

- Layer: `.modal-layer`
- Solid overlay: `.modal-backdrop`
- Modal body: `.prototype-modal`
- The backdrop must be clickable and close the modal or return to the previous state unless the product intentionally requires a non-dismissible blocking modal.
- On secondary pages, the modal layer and backdrop must cover the phone system status bar as well as the page content.
- If the modal is mounted inside `.screen` or another clipped content area and cannot physically cover the status bar, add a phone-level status-bar scrim tied to the modal open state. The phone-level scrim must use the same solid scrim token and close or return modal state when tapped unless the modal is intentionally non-dismissible.
- Width `303px` or phone width minus `44px`.
- Radius `16px`.
- Background `#1C1C1C`.
- Border `1px solid #3A3A3A`.
- Padding `16px`.
- Title uses compact section/title typography.
- Body copy uses helper/body typography.
- Actions use `.modal-actions`, with secondary on the left and primary on the right unless the flow has only one action.
- Cancel/secondary actions close the modal or return to the previous state. Confirm/primary actions must navigate, update state, submit, or show feedback such as a toast.

Product Notes must document close behavior, primary action result, secondary action result, and any data/permission boundary.

## Empty, Loading, Error

Reusable state components should use:

- Empty state: icon placeholder, short title, one helper line, optional primary action.
- Loading state: neutral skeleton blocks or progress text; no animated decorative effects required.
- Error state: concise error title, recovery action, and optional support/help entry.
- Use `.state-card` for compact states and `.large-empty-state` for full-area states.

## Component Library Page

When a project keeps a `组件库` page, it should show reusable components that are actually available in the project:

- Button set.
- Chips/tabs.
- Form field.
- Template cover placeholder.
- Bottom action bar.
- Bottom sheet.
- Left drawer.
- Toast.
- Modal/dialog.
- Empty/loading/error state cards when used.

Do not keep an empty component library page. Do not add business-specific page content to the component library.
