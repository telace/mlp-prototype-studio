# Visual Standard

Use this standard for mobile C-end low-fidelity prototypes.

## Canvas

- Use a strict phone frame of `375px x 812px` by default for the mobile app viewport.
- The phone content should scroll internally when content exceeds the viewport.
- Use a visible hard-coded black or near-black phone shell that clearly separates the phone from the desktop workspace, but keep the actual app viewport exactly sized. The phone shell itself is framework chrome, not app UI, and must not be recolored by the phone `light` / `dark` theme tokens. Keep the app viewport and all in-phone app elements tokenized separately.
- Prefer a structural separation between the phone shell and the app viewport. The shell layer owns the black outer frame, outer radius, and clipping mask only. The viewport layer owns the `375px x 812px` app UI, status bar, top bar, screen content, overlays, and bottom navigation. Do not add an extra black bottom safe-area block behind floating bottom tabs; the shell should read as an outer ring, not a filled bottom band. If a legacy project keeps a single `.phone` wrapper, it must still model these responsibilities with explicit classes, such as `data-page-level`, `screen--primary`, `screen--secondary`, and `screen--custom`, and must not allow light-theme app surfaces to visually replace the black shell.
- The center phone implementation should follow a stable component stack: `PrototypeStage` renders the state switch and `PhoneFrame`; `PhoneFrame` renders the phone shell, status bar, optional secondary `BackBar`, one screen viewport, and optional primary `TabBar`; page-specific screen components render only inside the viewport. Do not spread page-level shell decisions through page components.
- Page hierarchy must be reflected in explicit viewport classes:
  - Primary pages: `screen--primary`, `44px` status bar, `768px` viewport, locked bottom tab bar, no top title/back bar.
  - Secondary pages: `screen--secondary`, `44px` status bar + `44px` top title/back bar + `724px` viewport, no bottom tab bar.
  - Custom tool pages: `screen--custom` only when the product page intentionally owns custom top controls; still keep the total `44px + 768px = 812px` structure unless a different app pattern is explicitly approved.
- Every real phone page and in-phone component preview page must keep the standard phone page horizontal padding, default `16px`. Component library/demo pages are not exempt from page padding, section spacing, typography, or token rules.
- Check page padding on every affected page and state after each UI change. Text, cards, buttons, lists, component sections, and form rows must not touch the phone edge. The only allowed full-bleed elements are intentional structural surfaces: system status bar, top title bar, bottom tab bar, locked bottom action bar, full-screen canvas/media preview, drawer/sheet/modal scrim, and explicitly requested full-bleed media.
- Keep status bar height around `44px`.
- On secondary pages, the phone system status bar background must match the secondary top title bar background. Use a shared phone-scoped token such as `--topbar-bg` for both. Primary pages may keep the status bar matched to the page background.
- Keep bottom tab height around `72-80px`.
- Place prototype-only state chips above the phone. They are not part of the mobile app UI.
- Prototype-only state chips must not appear as Product Notes interaction cards and must not participate in hover connector lines. Product Notes interactions are reserved for real controls and content inside the phone UI.
- Desktop review workspace widths are fixed: project/settings rail `210px`, page directory rail `210px`, center prototype column `431px`, right Product Notes panel `546px`, and column gap `20px`. Total desktop workspace width is `1457px`.
- Do not use elastic `fr`, `minmax`, or content-driven widths for the four desktop columns. Only collapse to a single-column layout at the mobile/tablet breakpoint.
- Small laptop and narrow viewport behavior is mandatory: the shell defines a dynamic panel height from the browser height, with a fixed top/bottom margin. Project/settings, page directory, and Product Notes use that height and scroll internally. At `max-width: 1504px`, keep all four columns in one row with compact fixed widths, so Product Notes remains to the right of the phone; at `max-width: 1180px`, collapse to one column; at `max-width: 680px`, stack settings and directory content; at `max-width: 430px`, scale the phone and state switch together. The review workspace must not require horizontal page scrolling on common laptop widths, and Product Notes must not drop below the prototype on laptop-size screens.

## Style

- Use grayscale only, unless the user explicitly requests color.
- Prefer a black/white/gray low-fidelity prototype, not a blue/green product skin.
- Support exactly two phone-prototype grayscale UI themes: `light` and `dark`.
- Each project must define a default phone theme, such as `project.defaultTheme: 'light' | 'dark'`.
- The framework example template defaults to `light`, but real projects may default to `dark` when that better matches the product direction.
- On first open, or when no saved theme exists for the project, use `project.defaultTheme`.
- Theme choice must be saved per project, using a key that includes `project.slug` such as `mlp-theme:<project.slug>`. Do not use one shared browser key that causes different prototype projects to overwrite each other's theme.
- The workspace must use two separate left rails. The first `project-settings-rail` contains project card, theme card, and interaction guide card; the second left rail contains only the page directory card. The theme switch and `交互引导` switch must be in the project/settings rail, not inside the directory footer or Product Notes panel. Switching theme changes only the phone prototype page colors through variables scoped to the phone canvas. It must not change the workspace background, project card, left directory, prototype state switch, docs pages, Product Notes, page data, page state, Product Notes content, or the UI checklist.
- Framework shell colors, the phone outer shell, left directory colors, docs page colors, state switch colors, and Product Notes colors are fixed framework styling. Do not bind them to the light/dark prototype theme. Everything outside the phone viewport is framework UI and stays on the fixed bright shell colors. The phone outer shell may use hard-coded black values; App content inside the phone must use global phone theme tokens.
- Hard-code the framework shell to a bright readable scheme: workspace background `#F5F6F8`; project card, theme card, page directory, Product Notes, UI checklist, UI spec, prompt docs, and component docs panels `#FFFFFF`; muted strips and active note cards `#F3F4F6`; panel borders/separators `#E5E7EB`; muted shell text `#5F6670`; primary shell text `#222222`. Do not replace these with phone variables such as `--app-bg`, `--surface-*`, `--text-strong`, or `--border`.
- Treat the following dark UI tokens as fixed defaults. Do not invent new colors or sizes during ordinary prototype work:
  - `--app-bg: #171A1D` for all phone page backgrounds.
  - `--surface-1: #202326` for primary panels, bottom tabs, cards, form areas, and modal bodies.
  - `--surface-2: #282B2E` for secondary panels and weak controls.
  - `--surface-3: #34373A` for filled buttons, selected chips, and stronger controls.
  - `--placeholder: #5C5F61` for image/video/template/upload placeholders.
  - `--border: #33373A` for control borders and separators.
  - `--text-strong: #F4F4F1` for primary text.
  - `--text-muted: #A7A9A8` for helper text.
  - `--text-soft: #D5D6D3` for secondary labels.
  - `--inverse-bg: #F4F4F1` and `--inverse-text: #111111` only for high-emphasis selected controls or primary one-tap login actions.
  - `--topbar-bg: #202326` for secondary page status bar and top title bar.
  - `--tabbar-bg: #202326`, `--tabbar-border: #303437`, `--tabbar-active-bg: #F4F4F1`, `--tabbar-active-text: #111111` for the floating bottom navigation.
- Prototype page CSS must define these phone colors as variables in a phone-scoped theme selector such as `.phone[data-theme="light"]` and `.phone[data-theme="dark"]`. Do not use these variables to theme the review workspace shell, left directory, docs pages, or Product Notes.
- Phone App selectors must not use workspace variables such as `--workspace-bg`, `--workspace-panel`, `--workspace-panel-muted`, `--workspace-panel-border`, `--workspace-panel-text`, `--workspace-panel-muted-text`, or `--workspace-text`. Use the phone theme tokens instead so light/dark mode cannot create unreadable text or mismatched surfaces.
- Required radius variables:
  - `--radius-phone: 34px`
  - `--radius-card: 16px`
  - `--radius-control: 12px`
  - `--radius-icon: 10px`
  - `--radius-pill: 999px`
- Required spacing variables:
  - `--space-page-x: 16px`
  - `--space-section: 16px`
  - `--space-section-lg: 22px`
  - `--space-list: 10px`
  - `--space-inline: 8px`
  - `--space-card: 12px`
  - `--space-card-lg: 16px`
- Required border variable:
  - `--line: 1px solid`
- Do not use more than these grayscale tokens in the phone UI unless the user explicitly requests a new visual direction.
- The light theme uses the same framework layout and this light grayscale token set:
  - `--app-bg: #F5F5F2` for phone page backgrounds.
  - `--surface-1: #FFFFFF` for primary cards, form areas, bottom tabs, and modal bodies.
  - `--surface-2: #EFEFED` for secondary panels and weak controls.
  - `--surface-3: #E3E3DF` for feature blocks and stronger neutral panels.
  - `--placeholder: #B8B8B1` for image/video/template/upload placeholders.
  - `--border: #E1E1DD` for control borders and separators.
  - `--text-strong: #1C1C1A` for primary text.
  - `--text-muted: #74746E` for helper text.
  - `--text-soft: #4F4F4A` for secondary labels.
  - Primary actions in light style use `#1C1C1A` background with `#FFFFFF` text; secondary actions use `#FFFFFF` background with `#E1E1DD` border and `#1C1C1A` text.
  - `--topbar-bg: #FFFFFF` for secondary page status bar and top title bar.
  - `--tabbar-bg: #FFFFFF`, `--tabbar-border: #E5E5E0`, `--tabbar-active-bg: #1C1C1A`, `--tabbar-active-text: #FFFFFF` for the floating bottom navigation.
  - Keep all other rules unchanged: no colors, no photos, no gradients, no semi-transparent effects, no dashed wireframes, and the same typography/spacing/radius scale.
- New projects must not create additional phone color systems. If a project needs a different visual direction, ask the user explicitly before adding any third phone theme or non-grayscale accent.
- Directory status indicators are the only default color exception: finalized/approved uses blue, adjusting/in-progress uses yellow, and update badges remain small metadata.
- Do not use semi-transparent fills, blur, glass, glow, gradient, or colorful accents unless explicitly requested.
- Use solid fills, not dashed lines:
  - App background: near black or dark gray.
  - Primary blocks: mid-dark gray.
  - Secondary blocks: darker/lighter gray.
  - Product notes panel: white or very light gray.
- Avoid wireframe outlines as the main visual language.
- Use borders only to clarify interactive controls. Main cards and lists should be readable through contrast, spacing, and solid fills.
- Avoid photos, polished final UI, decorative gradients, and marketing visuals.
- Banner/media placeholders should be grayscale block areas. Homepage banner placeholders should be plain solid blocks with no text.
- Template covers should be grayscale block placeholders with no text inside the image area.
- Put template titles below the cover, not on top of the cover.
- Video templates should use the same cover placeholder style, with a small video/play icon overlay to communicate media type.

## Typography

- Keep letter spacing at `0`.
- Do not scale font sizes with viewport width. Use fixed token sizes.
- Use this mobile typography scale:
  - App/hero title: `26px`, line-height `31px`, weight `900`. Use only for real page hero areas such as login headings or major landing-style page titles.
  - Large page title: `22px`, line-height `27px`, weight `900`.
  - Mobile top bar title: `16px`, line-height `22px`, weight `800`.
  - Section title: `18px`, line-height `22px`, weight `900`.
  - Compact section title: `15px`, line-height `20px`, weight `900`.
  - Card title / list item title: `14px`, line-height `18px`, weight `800-900`.
  - Body text: `13px`, line-height `18px`, weight `700`.
  - Helper/caption/meta text: `12px`, line-height `16-17px`, weight `700`.
  - Tiny labels: `11px`, line-height `15px`, weight `700`. Use sparingly.
  - Button text: `14px`, line-height `17px`, weight `800-900`.
  - Bottom tab label: `11px`, line-height `15px`, weight `700`.
  - Product Notes body: `14px`, line-height `20px`, weight `500-700`.
- Do not use font sizes outside this scale unless the user explicitly asks for a different visual direction or the existing template has a clearly defined exception.
- Text must fit inside buttons/cards without clipping.
- Do not add secondary subtitles to secondary page top bars unless the product UI actually needs them.

## Spacing And Radius

- Use the following spacing tokens by default:
  - Phone page horizontal padding: `16px`.
  - Dense page horizontal padding: `14px` only for tool-heavy screens that must fit controls.
  - Section vertical gap: `16px`.
  - Large section gap: `22px`.
  - Repeated list/grid gap: `10px`.
  - Compact inline gap: `8px`.
  - Card/control internal padding: `12px`.
  - Larger information-card padding: `16px`.
  - Compact chip padding: `8px 12px`.
- Use the following radius tokens by default:
  - Phone shell radius: `34px`.
  - Main panel/card radius: `16px`.
  - Small card/control radius: `12px`.
  - Input/control radius: `12px`.
  - Small icon button radius: `10px`.
  - Pill/chip radius: `999px`.
  - Bottom action button radius: `12px`.
- Do not create arbitrary one-off spacing or radius values unless matching an existing component in the same template.
- Do not create nested cards. If a card already frames a tool area, inner controls should be simple buttons, fields, or placeholders.
- Framework-template CSS should use global variables for shared colors, radii, spacing, and line widths. A hard-coded value is acceptable only for fixed canvas/workspace dimensions, typography tokens, or a local layout measurement that is not a reusable visual token.
- Framework-template theme CSS must define both `light` and `dark` scopes with the same variable names so all components can switch theme without page-specific overrides.

## Buttons And Actions

- Primary bottom actions must use a consistent height, radius, and grayscale treatment across AI video, work/detail/result, member purchase, login, and other production pages.
- Use a darker or stronger filled/outlined treatment for primary actions.
- Use a lighter outlined treatment for secondary actions.
- Primary page bottom tab navigation must use the shared floating style: `12px` side inset, `10px` bottom inset, `64px` height, `24px` container radius, tokenized background and border, `6px 8px` internal padding, and three equal columns. Each tab button uses `min-height: 52px`, `16px` radius, `11px/15px` label text, and transparent background. The active tab label must remain readable with `--text-strong`; only the icon block uses inverse active tokens. The icon block must be a fixed `30px x 30px` rounded square with `10px` radius and `6px` internal padding. Do not apply `--tabbar-active-text` to the whole active tab button because it can make labels unreadable in dark or light themes.
- On primary pages with a floating bottom tabbar, do not create a phone-level bottom shell layer, including `.phone:has(.tabbar)::after`. The app viewport background should extend behind the bottom navigation, and the phone shell should remain visible only as the outer black ring.
- Bottom sheets, action sheets, drawers, and blocking modals must include a full-screen background scrim inside the phone canvas. For secondary-page sheets and modals, the scrim must cover the phone system status bar as well as the page content. Use a solid grayscale scrim token such as `--drawer-scrim`; do not use transparent overlays or blur effects.
- If a secondary-page sheet or modal is mounted inside `.screen` or another clipped content area and cannot physically cover the phone system status bar, add a phone-level status-bar scrim, such as `.phone-status-scrim`, tied to the same open state. It must cover the `44px` status bar area, use the same solid scrim token, and close or return state when tapped.
- Every visible button inside drawers, sheets, action sheets, and modals must have a defined click result in the prototype. Backdrop/close/cancel controls should close the layer or return to the previous state; primary/confirm/select controls should navigate, update state, or show feedback such as Toast.
- Toast should appear near the top of the active phone page by default. On secondary pages, place it below the locked top title bar so it does not cover the back button or page title.
- Standard full-width action button: min-height `44px`, radius `12px`, font `14px/17px`, weight `800`.
- Large login/authorization action may use min-height `48-50px` and pill radius only when matching the accepted login pattern.
- Avoid two-layer bottom action backgrounds unless the bottom area itself contains multiple independent controls.
- Floating send buttons may be circular when attached to an input composer.
- Disabled actions should remain visible but lower contrast; do not introduce new colors for disabled state.

### Button Tokens

Use these exact button tokens unless the user explicitly approves a different visual system:

- Border width:
  - Standard button/control border: `1px solid`.
  - Separator border: `1px solid`.
  - Do not use `2px+` borders, dashed borders, double borders, or mixed border widths for ordinary controls.
- Standard primary button:
  - Height: `44px` minimum.
  - Border radius: `12px`.
  - Adjacent button gap: `10px` in a dual action group.
  - Padding: `0 14px`.
  - Background: `#2A2A2A`.
  - Border: `1px solid #2A2A2A`.
  - Text: `#FFFFFF`.
  - Font: `14px / 17px`, weight `800`.
- Standard secondary button:
  - Height: `44px` minimum.
  - Border radius: `12px`.
  - Adjacent button gap: `10px` in a dual action group.
  - Padding: `0 14px`.
  - Background: `#1C1C1C`.
  - Border: `1px solid #3A3A3A`.
  - Text: `#F2F2F2`.
  - Font: `14px / 17px`, weight `800`.
- Compact button/chip:
  - Height: `32px`.
  - Border radius: `999px` for chips or `10px` for square-ish controls.
  - Adjacent chip gap: `8px`.
  - Padding: `0 12px`.
  - Border: `1px solid #3A3A3A` unless selected.
  - Selected state: background `#F2F2F2`, border `1px solid #F2F2F2`, text `#111111`.
  - Font: `12px / 16px`, weight `800`.
- Icon button:
  - Size: `32px x 32px` for compact controls, `36px x 36px` for navigation-level controls.
  - Border radius: `10px`.
  - Adjacent icon-button gap: `8px`.
  - Background: `#222222` or transparent when inside a top bar.
  - Border: `1px solid #3A3A3A` only when the button needs a visible hit area.
  - Icon size: `16-20px` based on control size.
- Large login/authorization button:
  - Height: `48px`.
  - Border radius: `24px`.
  - Vertical gap between stacked login buttons: `12px`.
  - Padding: `0 16px`.
  - Primary one-tap variant may use background `#F2F2F2`, border `1px solid #F2F2F2`, text `#111111`.
  - Secondary login variant uses background `#111111`, border `1px solid #3A3A3A`, text `#F2F2F2`.
- Disabled button:
  - Keep the same size, radius, and border width as the enabled state.
  - Use lower contrast only: background `#222222`, border `1px solid #3A3A3A`, text `#A8A8A8`.
- Flow switch text button:
  - Height: `30px`.
  - Border: `0`.
  - Background: transparent.
  - Text: `#A8A8A8`.
  - Font: `12px / 16px`, weight `800`.
- Do not mix pill buttons and rectangular buttons within the same action group. Bottom action groups always use the standard `12px` radius, not pill radius.

## Reusable Component Templates

Use `component-patterns.md` as the canonical component pattern reference for:

- Fixed primary/secondary buttons
- Compact chips and icon buttons
- Row-based form fields
- Locked bottom action bars
- Bottom sheets
- Action sheets
- Left-side drawers
- Toast feedback
- Modal/dialog overlays
- Empty, loading, and error state cards

These components are not allowed to introduce new visual systems. They must inherit the fixed grayscale tokens, `1px` border rule, typography scale, spacing scale, and radius scale in this document.

### Locked Bottom Action Bar

Use the accepted content-analysis page bottom action pattern as the standard for all bottom buttons.

- For long or form-like secondary pages, split the phone page into `mobile-scroll-with-actions`, `mobile-scroll-content`, and `bottom-action-bar`.
- `mobile-scroll-with-actions` fills the phone screen and hides outer overflow.
- `mobile-scroll-content` owns vertical scrolling and leaves only a small bottom buffer.
- `bottom-action-bar` stays visible at the bottom of the phone page, uses the same page background, and has a top separator `1px solid #2A2A2A`.
- Bottom action bar padding is `12px 0 16px`.
- Single action layout: `bottom-action-bar single`, one full-width primary button.
- Dual action layout: `bottom-action-bar dual`, grid columns `112px minmax(0, 1fr)`, `10px` gap; secondary on the left, primary on the right.
- Bottom buttons are not pill buttons: use `min-height: 44px`, `border-radius: 12px`, `font-size: 14px`, `line-height: 1.2`, and `font-weight: 800`.
- Primary button `bottom-cta`: background `#2A2A2A`, border `#2A2A2A`, text `#FFFFFF`.
- Secondary button `ghost-cta`: background `#1C1C1C`, border `#3A3A3A`, text `#F2F2F2`.
- Do not place bottom actions in ordinary page flow when the page content can scroll. Do not wrap bottom actions in another card.

## Lists And Cards

- Double-column feeds and template grids should not sit inside an extra framed outer container.
- Individual template cards should be simple: `3:4` cover placeholder plus title below. Do not add extra tags unless the requirement asks for them.
- Template grouping chips should switch the list content in place. Use horizontal scroll when chips exceed the phone width.
- For works lists, support image/video tabs when the product distinguishes them. Use a double-column masonry or staggered grid when appropriate.
- Avoid excessive stacked-card visual hierarchy. Prefer clean spacing between repeated items.
- Repeated cards should use the same cover radius and title typography across a page.
- Do not put text inside cover placeholders except a tiny media-type icon when needed, such as a video/play indicator.
- Do not add extra parent backgrounds behind double-column grids; the page background should remain visible between items.

## Image Placeholder Tokens

Use these placeholder rules for all low-fidelity image, video, upload, banner, and cover blocks:

- Placeholder colors:
  - Default placeholder: `#333333`.
  - Alternate placeholder tones may use only `#2A2A2A`, `#333333`, and `#3A3A3A`.
  - Do not use photos, gradients, blur, semi-transparent overlays, or color accents unless explicitly requested.
- Placeholder borders:
  - Default: no border.
  - Selected placeholder: `1px solid #F2F2F2` or `1px solid #3A3A3A` depending on contrast.
  - Do not use dashed outlines.
- Placeholder radius:
  - Template/list cover: `12px`.
  - Large preview/media block: `16px`.
  - Banner block: `16px`.
  - Avatar/profile image: `50%` circle.
  - Small thumbnail/history image: `8px`.
- Placeholder ratios:
  - Template/material cover: `3 / 4`.
  - Video/template thumbnail: `3 / 4` with a small play icon overlay.
  - Work cover in masonry/list: `3 / 4` unless a specific work type requires `1 / 1`.
  - History/result thumbnail: `1 / 1`.
  - Banner: `16 / 7` or a fixed-height solid block; no text inside.
  - Large AI video preview: use a tall visual area, typically around `4 / 5` or larger within the phone page.
  - Upload/canvas area: fill available task space; ratio may adapt to the tool page but must use a stable min-height.
- Text rules:
  - Do not put titles, labels, or explanatory text inside template/material cover placeholders.
  - Put titles below covers using card-title typography.
  - Video covers may show only a small play icon overlay, sized `16-18px`.
  - Empty/upload placeholders may include one icon plus one primary action label and one short helper line when needed.
- Grid rules:
  - Double-column cover grids use `10px` gap.
  - Horizontal thumbnail strips use `8px` gap.
  - Cover cards do not get extra tags, subtitles, locks, badges, or outer backgrounds unless the user explicitly asks.

## Homepage Pattern

For an AI image/video editing app homepage:

- Keep membership entry near the top.
- Use functional task entrances near the top when the product has multiple creation paths.
- If a banner is used, make it a plain solid grayscale block. Do not put text, labels, icons, or nested mini-blocks inside it unless the user explicitly requests annotation.
- Show template/content recommendations as large enough cover cards, usually with `3:4` cover proportions.
- Template grouping controls should switch the current list in place. They should not navigate away unless the user explicitly asks for a separate list page.
- If group controls exceed the phone width, implement horizontal scrolling with stable chip/button sizes.
- Keep bottom tabs for Home, Create, Profile.

## Authentication Pattern

For C-end mobile apps that require login, include a login page by default:

- Use the login method requested for the project, such as email login, phone verification-code login, or one-tap login.
- Include input field states, agreement checkbox if applicable, disabled/enabled button states, loading state, error state, and success transition.
- Treat login as a secondary page unless the app is explicitly login-first.
- If domestic and overseas login are both needed, split them into two secondary pages: `国内登录` and `海外登录`.
- Domestic login should default directly to one-tap phone authorization. Do not show a separate domestic method-choice page.
- Domestic one-tap authorization should focus on masked phone number, carrier certification, primary one-tap button, alternate `其他手机号登录` entry, and agreement text. Do not add an extra top hero block with icon/title/service subtitle.
- Domestic SMS verification should be a row-based form reached from `其他手机号登录`. Avoid card-heavy wrappers and avoid a redundant hero block.
- Domestic login states should normally be `一键登录`, `验证码登录`, and `验证码已发`; do not add a domestic failure-popup state unless explicitly requested.
- Overseas login may show a lightweight user-facing heading above method choices or email form. Use real user value copy, for example `登录你的账号` / `同步作品和能量记录`. Do not use internal or instructional copy.
- Overseas login can include `邮箱验证码登录`, `Google 登录`, `Google 授权弹窗`, and failure modal states.
- Do not place an additional top-left flow-back button inside login forms. Page-level back already exists for secondary pages. Put flow switches below the primary login button or as small bottom/icon text controls.
- When login pages share state variables, switching directory pages must reset invalid states to the new page's default login state.

## Product Notes Panel

- Place product notes to the right of the phone on desktop. Keep the panel visually stable while page/state changes.
- Desktop width must be fixed at `546px`; use internal scrolling when content is long.
- Use hard-coded `#FFFFFF` for the Product Notes panel background and dark text so documentation is readable and distinct from the phone UI. Use `#F3F4F6` for context strips and active/secondary note surfaces, `#E5E7EB` for separators, and `#5F6670` for secondary text. These values are framework colors and must not follow phone `light` / `dark` theme tokens.
- Use `18px` panel padding, `16px` radius, and a subtle solid border or separator. Do not use dashed dividers.
- Header structure: small label such as `Product Notes`, then current page/state title, then concise context metadata.
- Show page number and state number in the notes header or first section, not in the phone UI or state chips.
- Structure detailed notes in this order: `Product Notes`, `1. 页面说明`, `2. 页面元素清单`, `3. 交互说明`, and `4. 状态/异常矩阵`. Test cases are not a separate page-level block; they are embedded inside each interaction element card as `测试用例`.
- `页面元素清单` defines the page objects before interaction behavior. Each row/card should show component number, element name, element type, purpose, required rule, backend API dependency, and display rule.
- `交互说明` is for研发和测试 and must show: basic operation, interaction result, upload/input rule and boundary, backend API dependency, required rule, feedback state, exception handling, data boundary, permission logic, tracking suggestion, and acceptance criteria when relevant.
- `状态/异常矩阵` summarizes page-level loading, empty, error, disabled, permission, backend failure, and boundary states.
- `测试用例` are generated from each element and interaction model. Each interaction card should include its own applicable functional, boundary, exception, permission, and tracking cases. Each test case has id, associated component/state, test type, steps, and expected result.
- Keep notes scannable: use compact cards/rows for interaction blocks, not long unstructured paragraphs.
- Do not include prototype viewer controls in interaction blocks. Exclude the state switch above the phone, left directory navigation, theme switch, update toast, and other workbench controls from page-level Product Notes interactions.
- Hover linkage: when hovering a phone component, highlight the corresponding note block; when hovering a note block, highlight the corresponding phone component.
- Anchor linkage: each interaction block should have a stable anchor id based on its component number. The project/settings rail must include a `交互引导` switch. When off, no automatic notes scrolling and no connector lines are shown. When on, hover/focus from the prototype scrolls only the notes panel to the matched block, highlights it, and draws a connector between the source element and the note card using the hard-coded light blue path `rgba(147, 197, 253, 0.78)` and dots `rgba(147, 197, 253, 0.92)`. Do not use page-level `scrollIntoView` that moves the whole review workspace.
- Connector color is a framework-level hard-coded exception, not a phone UI theme token. In light mode, use dark blue path `rgba(16, 46, 96, 0.58)` and dot fill `rgba(16, 46, 96, 0.72)`. In dark mode, use light blue path `rgba(147, 197, 253, 0.68)` and dot fill `rgba(147, 197, 253, 0.82)`. Keep the white dot stroke hard-coded as `#FFFFFF`.
- Keep the notes panel height aligned with the full prototype area, including the state switch above the phone. With the default `375 x 812` phone and `42px` state switch, use `866px` for the desktop notes panel and let the panel scroll internally. Do not shrink the notes panel based on viewport height on desktop.
- During design iteration, keep notes short and focused on layout/behavior. After explicit design confirmation, expand every confirmed page/state into full interaction documentation.
- On narrow screens, allow notes to stack below the phone while preserving page/state context.

## Page Directory

- Add a left-side page directory on desktop for every multi-page prototype. Keep it visually separate from the phone and notes panel.
- Desktop width must be fixed at `210px` for both left rails. Use the same width for the project card, theme card, and directory list.
- Place a compact project card in the first project/settings rail. It should include project name, short product description, and lightweight progress/status summary.
- Place a compact theme card below the project card in the first project/settings rail. It contains the light/dark theme switch and uses the same fixed `210px` width.
- Place a compact interaction guide card below the theme card in the first project/settings rail. It contains the `交互引导` switch, uses the same fixed `210px` width, and must visually match the color-mode card: `theme-card` container plus `theme-toggle` button, compact label/status/action text, no long explanatory paragraph.
- Keep both left rails fixed to the prototype/notes height on desktop. The page directory card should fill the directory rail height and scroll only its page-list body; the directory header, title, and status legend stay pinned at the top of the card.
- Use a solid light or neutral panel background with readable dark text; do not use dashed borders or wireframe styling.
- Use `16px` radius, `14px` internal padding, and `10px` vertical spacing between groups.
- Group pages by hierarchy first: Primary Pages, Secondary Pages, Docs/Components.
- Directory group labels should be small, muted, and stable. Do not overemphasize them compared with page names.
- Directory items should show page name and optional short description/status metadata, but page numbers do not need to be visible in the directory.
- Do not list page states as separate directory items. Page states belong in the prototype state switch above the phone.
- Directory buttons should navigate directly to pages without requiring the phone UI flow.
- The active page must be visually highlighted with solid fill, stronger text, or a left accent bar in grayscale.
- Page status indicators:
  - Finalized/approved: small blue indicator, only after explicit user confirmation.
  - Adjusting/in progress: small yellow indicator for unfinished pages.
  - Updated: small secondary badge layered on the item; it is not a legend-level state. Show it only when the page's current `updatedAt`/`version` differs from the user's locally stored viewed value for that page.
- The directory status legend must always show both `已定稿` and `调整中`, even when every current page is already finalized or every current page is still adjusting.
- Status indicator lights are workbench metadata, so blue/yellow are allowed exceptions to the otherwise black/white/gray prototype visual system.
- Keep status indicators small. They should not compete with page navigation labels.
- At the end of the directory, include entries for UI design checklist and UI specification pages when the project needs them.
- The UI design checklist itself should be a separate docs page, not an expanded list embedded in the directory.
- The UI design checklist should include only real app/prototype page states that require UI output. Do not include prompt pages, appendix pages, UI spec pages, or empty component library pages in the checklist.
- The UI design checklist docs page should include a compact quantity summary based on the checklist row/page-state count, and be interactive: selecting a checklist row shows the corresponding page/state preview on the right. That preview must reuse the real prototype/phone components at the original phone ratio and size; do not shrink it into a thumbnail or replace it with a static screenshot unless the user explicitly requests a compact overview. Do not show the prototype-only state switch or an extra title/header bar above the phone inside this checklist preview. Position the right-side preview vertically to follow the selected checklist row, but clamp the vertical offset so the preview remains visible and is not pushed below the viewport.
- On narrow screens, stack the directory above the phone and keep page buttons tappable.

## Prototype State Switch

- The state switch sits outside the phone above the canvas.
- Always show it, even when there is only one state.
- Do not show a leading title such as "状态"; show only the state chips.
- Chips should size to their text content and remain centered.
- The state switch wrapper must not have a gray or framed background. Use a transparent wrapper, transparent unselected chips, and only the active chip gets a filled selected background.
- Do not add custom mouse-drag behavior by default. Clicking a chip switches the state and centers the selected chip in the state switch when the list overflows.
- Page/state numbers should not be shown on the chips. Put numbers in Product Notes instead.
- Treat this switch as prototype review UI, not shipped app UI.

## Page Hierarchy

- Primary pages are the first-level app tabs.
- Primary pages show bottom navigation and do not show a top title/back bar.
- Secondary pages show a top title/back bar and do not show bottom navigation.
- Do not show both top back/title and bottom tabs on the same phone page unless the user explicitly asks for that exception.
- For a typical C-end app, default primary pages are Home, Create, and Profile.
- Treat feature flows, details, settings, PRD, and meaningful component libraries as secondary or docs pages according to the project structure. Do not keep an empty component library page.
- If a feature flow contains multiple real steps, list each real step as its own secondary page instead of hiding the flow behind prototype-only state chips.
- Multi-step secondary pages should show the same compact stepper at the top of every step page.
- Keep dense mobile tool pages restrained: page H1 around `18px`, card titles around `15px`, module titles around `13-14px`, and helper text around `11-12px`.
- For long secondary pages, make the content area scroll and lock the bottom action area to the bottom of the phone screen. The locked action area should use a solid background and separator.

## Reusable Components

Turn repeated prototype patterns into components instead of rewriting markup:

- `PrototypeStage`
- `PhoneFrame`
- `PageDirectory`
- `SpecPanel`
- `TabBar`
- `HeroBlock`
- `BannerPlaceholder`
- `PrimaryActionGrid`
- `TemplateCard`
- `TemplateCover`
- `HorizontalCategoryTabs`
- `ToolGrid`
- `UploadBox`
- `StateCard`
- `ListRow`
- `MembershipCard`
- `LoginPage`
- `EmailLogin`
- `VerificationCodeLogin`
- `PrototypeStateSwitch`
- `BottomActionBar`
- `UiChecklistPage`
- `UiSpecPage`

For projects that will iterate, include a "Component Library" page inside the prototype that shows the current low-fi component set.

## Visual QA Checklist

Before finishing a prototype iteration, audit the UI against this standard:

- Phone pages use `#111111` as the app background unless an existing accepted page in the same project defines a different single project background.
- Phone UI colors are restricted to the defined grayscale tokens, plus only the directory status indicator exceptions.
- No semi-transparent fills, blur, glow, gradient, dashed wireframe boxes, decorative orbs, or stock/photo assets have been introduced.
- Mobile font sizes come from the typography scale above.
- Button heights, radii, and colors match the button standard.
- Cards, inputs, chips, and placeholders use the radius and spacing tokens above.
- Double-column grids and template lists do not have extra outer cards or framed backgrounds.
- Secondary pages show only one page-level top back/title bar; in-page flow switches are not implemented as a second top-left back button.
- State chips above the phone are prototype-only, compact, centered, and do not show page numbers.
