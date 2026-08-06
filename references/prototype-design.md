# MLP Mobile Prototype Design Process

Use this reference whenever creating a new product flow, redesigning a phone page, or when the user says the prototype feels generic, inconsistent, or poorly designed.

## Design Objective

MLP turns product intent into a reviewable mobile C-end experience. The phone prototype must help a product manager decide:

1. whether the user flow is complete;
2. whether each screen gives the next action enough priority;
3. whether states and recovery paths are credible;
4. whether UI and development can implement the same component system;
5. whether the selected direction is better than plausible alternatives.

Do not optimize for decorative novelty. Optimize for task clarity, coherent interaction, consistent composition, and fast product review.

## Required Design Brief

Before implementing new business pages, fill `src/project/design.js`. Use concise statements, not a speculative PRD.

- `audience`: primary user and relevant context.
- `job`: the task the user is trying to complete.
- `businessGoal`: the product outcome this flow should support.
- `experienceGoal`: one measurable or observable UX priority.
- `reference`: existing product, screenshot, code, or design system to preserve or learn from.
- `contentPriority`: ordered information/actions for the key screen.
- `constraints`: platform, market, authentication, media, accessibility, or technical constraints.

If a field cannot be inferred safely and materially changes the design, ask one focused question. Otherwise state the assumption in the brief and continue.

## Design Context First

Before drawing:

1. Inspect existing MLP pages, components, tokens, routes, and screenshots supplied by the user.
2. Identify recurring navigation, cards, form controls, sheets, empty states, and bottom actions.
3. Preserve established product conventions unless the user is explicitly redesigning them.
4. Record the selected design direction and reference in `designContract`.

Starting from real context is preferred. Never invent a new palette page by page.

## Flow Before Screens

Write the core flow as a short state sequence:

```text
entry -> decision/input -> processing -> result -> recovery/next action
```

Then define:

- real routes/screens;
- states within each screen;
- the primary action for every state;
- failure, empty, loading, permission, and cancellation paths;
- where the user can safely go back without losing work.

Do not start visual composition until the core path and state ownership are coherent.

## Explore Before Committing

For a new key page or a material redesign, create 2-3 genuinely different layout concepts before changing the formal MLP page.

- **Safe:** extends the current component and navigation patterns.
- **Focused:** removes secondary content and prioritizes the core task.
- **Exploratory:** uses a different interaction model only when it plausibly improves the experience goal.

Describe each concept with:

- information hierarchy;
- primary interaction model;
- advantage against `experienceGoal`;
- main risk or trade-off;
- components that can be reused.

Recommend one concept. Do not create five cosmetic variants of the same layout. For small edits, skip concept generation and preserve the accepted direction.

Concepts are temporary design artifacts. Do not add them to the real page directory, Product Notes, Test Cases, or deployment output. Implement only the selected concept in `src/pages/`.

## Mobile Composition Rules

Design for the `375 x 812` viewport and real touch behavior.

- Give every state one visually dominant next action.
- Keep primary navigation stable across primary pages.
- Use top back navigation only on real secondary screens.
- Put persistent form actions in the shared bottom action pattern.
- Prefer progressive disclosure over showing every setting at once.
- Keep tap targets at least `44px` for primary actions and navigation.
- Use one clear page title, one section hierarchy, and restrained metadata.
- Avoid repeated cards when spacing, dividers, or grouped rows communicate structure better.
- Avoid nested cards, decorative dashboards, marketing hero layouts, and arbitrary floating actions.
- Use realistic content lengths and test the longest labels.
- Show useful loading, empty, failure, and disabled states instead of generic placeholders.
- Treat the phone canvas as one continuous app surface: status chrome must follow the page/top-bar tone, the page root must fill the viewport, and only the outer ring may expose the black phone shell. A mismatched status strip or uncovered bottom block is a structural defect.

## Binding Visual Contract

Treat `designContract` and phone theme tokens as a binding design system.

- Business pages use semantic variables from `src/framework/framework.css` and shared `prototype-ui` components.
- Do not write raw hex, rgb, hsl, or named colors in `src/pages/`.
- Do not create page-local color variables.
- Default low-fi mode is grayscale. Allow a brand accent only after the user approves a colored direction and the contract records it.
- One project has one palette policy. Light and dark themes must use the same semantic token names.
- Do not introduce one-off radius, spacing, shadow, or type scales when a token or shared component exists.
- If a repeated pattern appears twice, promote it to `prototype-ui` or a shared page component before making a third copy.

Framework shell colors are separate and fixed. Never use workspace tokens inside the phone UI or phone tokens in workspace panels.

## Component-First Implementation

Before coding a screen, map each block to an existing primitive:

- page shell: `PhonePage`, `TopBar`, `BottomTabBar`;
- actions: `Button`, `IconButton`, shared bottom action pattern;
- choices: `SegmentedControl`, `ChipScroller`;
- content: `TemplateCard`, `PlaceholderImage`;
- forms: `FormField`;
- overlays: `BottomSheet`, `Modal`, `Toast`;
- states: `EmptyState`, `LoadingState`.

Add a shared component only when it removes real duplication or stabilizes behavior. Page components own product composition, not a second design system.

## Design Review

Before asking for design confirmation, check:

1. **Goal:** the dominant action advances the experience goal.
2. **Hierarchy:** the screen remains understandable when color is removed.
3. **Consistency:** repeated functions use the same component and state treatment.
4. **Palette:** page code contains no raw colors and both themes remain readable.
5. **Density:** content is complete but not crowded; secondary details are deferred.
6. **Flow:** primary, back, cancel, retry, and failure paths work.
7. **Mobile fit:** labels, controls, bottom actions, sheets, and modals fit the phone viewport.
8. **Distinctiveness:** the selected concept reflects product context rather than a generic template.

Run `npm run mlp:fast-check` after implementation. Run screenshot-producing visual review only when the user explicitly asks for visual review, consistent with the MLP verification contract.

## Competitive Ideas Adopted

This process adapts three proven mechanisms without importing competitor frameworks:

- Baoyu Design: design context and a binding, versioned visual contract.
- Claude Wireframe Skill: safe plus exploratory concepts and goal-based recommendation.
- Wireframe Prototyper: semantic palette roles, component-first screens, and compliance checks.

MLP remains the source of truth for mobile canvas, routes, states, documentation, acceptance, and deployment.
