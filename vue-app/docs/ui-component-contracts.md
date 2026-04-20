# UI Component Contracts

## Document Purpose
- This file defines reuse boundaries, allowed variants, and implementation rules for shared UI patterns in the Vue redesign.
- Builder should consult this file before creating new UI components or adding new style variants.

## Contract Principles
- Reuse before inventing.
- Extend existing component families before creating adjacent duplicates.
- Keep styling decisions centralized in shared classes, tokens, or shared components when the pattern appears in more than one place.
- Do not let each page define its own button, input, card, or notice language.

## Component Layers

### Layer 1: Design Primitives
These are the baseline reusable patterns that may live as global classes, shared CSS utilities, or small common components.

Required primitive families:
- button
- input
- textarea
- select-like control styling if needed later
- tag / pill
- notice / message box
- card / panel surface
- page section container
- stats tile

These primitives must reference `ui-design-tokens.md`.

### Layer 2: Shared Product Components
These are reusable Vue components already present or expected to become shared patterns.

Current likely shared components:
- `AppHeader`
- `ArticleCard`
- `EmptyState`
- `LoadingState`
- `PagePlaceholder`
- `CommentEditor`
- `CommentItem`
- person-center panels

### Layer 3: Page Composition
Views should compose primitives and shared components rather than reinvent their own visual language.

## Reuse Rules

### Buttons
- Builder must not create page-local button styles if a shared primitive variant can cover the use case.
- Allowed baseline variants:
  - `primary`
  - `secondary`
  - `ghost`
  - `danger`
  - `inline`
- New button variants require Planner approval unless they are purely size-based.
- Size variants allowed:
  - `sm`
  - `md`
  - `lg`

### Inputs and Textareas
- Text inputs and textareas should share border, background, focus, and placeholder behavior.
- Login, register, search, and profile forms must not each invent their own field style.
- If a page needs a large hero search input, it should be a size variant of the same family, not a totally separate visual language.

### Surface Containers
- Shared surface families:
  - `content-card`
  - `panel-card`
  - `notice-card`
  - `stats-tile`
  - `hero-surface`
- Builder should prefer these semantic families instead of introducing arbitrary wrappers with unique shadows and radii.
- If implemented as classes rather than Vue components, names should still stay semantic and shared.

### Tags and Pills
- Allowed variants:
  - `topic`
  - `category`
  - `status`
- These may differ in color emphasis, but should share shape, spacing, and typography rules.

### Notices and Status Blocks
- Error, warning, info, and success states should share one structural pattern:
  - optional emphasis area
  - message body
  - optional action
- Builder should extend existing common state components where practical.

## Existing Component Contracts

### `AppHeader.vue`
Role:
- top-level navigation shell

Rules:
- Must remain the only global site header.
- Can gain internal sub-structure for brand, nav, and auth areas.
- Must not absorb unrelated page content like homepage hero content.
- Mobile treatment may change, but route behavior and auth behavior must stay intact.

### `ArticleCard.vue`
Role:
- primary reusable article preview component

Allowed variants:
- `default`
- `featured`
- `compact`

Rules:
- Variants should share one family, not become separate unrelated components.
- Metadata structure should remain recognizable across variants.
- Image, title, summary, tags, and meta must remain part of the card contract, even if emphasis changes by variant.
- Homepage and search should reuse this component rather than fork a different article preview component.

### `EmptyState.vue`
Role:
- reusable empty-state shell

Rules:
- Should become the default empty-state structure across list pages where practical.
- May support optional title, description, and action slot/prop later if needed.
- Page-specific empty-state styling should be avoided when the shared component can be extended.

### `LoadingState.vue`
Role:
- reusable loading feedback

Rules:
- Should align visually with the redesigned surface system.
- Avoid radically different loading indicators per page unless tied to a specific interaction pattern.

### `PagePlaceholder.vue`
Role:
- temporary or fallback page-level placeholder

Rules:
- If still used, it should inherit the new surface and typography language.
- Do not leave it visually out of system.

### `CommentEditor.vue`
Role:
- shared editor for comment creation and editing

Rules:
- Must use the shared form control language.
- Save and cancel actions must map to shared button variants.
- Should not become a one-off styling island inside the comment system.

### `CommentItem.vue`
Role:
- recursive comment display unit

Rules:
- Nested levels may adjust spacing or indentation, but must remain in the same visual family.
- Action area should stay secondary to content.
- Reply indicators should use shared metadata and tag language where practical.

### Person Panels
Applies to:
- `AccountSettingsPanel.vue`
- `MyArticlesPanel.vue`
- `MyCommentsPanel.vue`

Rules:
- These panels should feel like one family.
- Shared heading, panel chrome, spacing, and action placement should be reused.
- Do not restyle each tab panel independently.

## Page Layout Contracts

### `page-shell`
Use for:
- default page body wrapper inside a view

Rules:
- Vertical layout with shared section gap
- Uses page max width unless the page declares a reading or wide layout need

### `page-header`
Use for:
- standard page intro block

Rules:
- Supports eyebrow, title, description, and optional actions
- Shared spacing and max-width behavior across pages

### `hero-section`
Use for:
- homepage hero and large branded intro sections

Rules:
- Reserved for top-of-page emphasis areas
- Uses stronger surface treatment and larger spacing tokens
- Should not be recreated in multiple incompatible styles

### `reading-column`
Use for:
- article content body or other long-form text areas

Rules:
- Must use reading width token
- Must use reading line height and heading rhythm

### `panel-grid`
Use for:
- settings panels, cards, and supporting content groupings

Rules:
- Shared gap and responsive stacking rules
- No page-local margin hacks to simulate structure

## Builder Decision Rules

### When Builder May Create a New Component
Builder may create a new component only if:
- the pattern appears in at least two places already, or
- the current card explicitly calls for a reusable component family, or
- extending an existing component would make it harder to understand or maintain

### When Builder Must Reuse an Existing Component
Builder must reuse or extend an existing component when:
- the visual pattern is already represented by `ArticleCard`, `EmptyState`, `LoadingState`, `CommentEditor`, or a shared panel family
- the change is only a variant or density adjustment
- the page need can be met with props, slots, or shared classes

### When Builder Must Not Reuse Blindly
Builder should not force reuse if:
- an existing component's responsibility would become muddled
- the required layout is structurally different enough that a variant would create confusing logic

In those cases, Builder should create a new component with a clearly different role, not a near-duplicate clone.

## Naming and Variant Rules
- Component names stay PascalCase.
- Shared style hooks should be semantic, not visual-only, when possible.
- Variant props should be explicit, for example `variant="featured"` or `tone="danger"`.
- Avoid boolean prop explosions like `featured`, `compact`, `dense`, `hero`, `soft`, `elevated` all at once on one component.
- Prefer one `variant` prop plus at most one `size` prop for primitive families.

## Styling Boundaries
- Shared primitives and contracts belong in global styles or clearly reusable component styles.
- Page-scoped styles may arrange layout, but should not redefine the core appearance of shared primitive families.
- Component-scoped styles should define that component's structure and variant differences, not invent a second design system.

## Disallowed Patterns
- Copy-pasting button styles into multiple views
- Creating separate article preview components for homepage and search without a real structural reason
- Redefining notice/error blocks independently in each view
- Using unrelated spacing, radius, and shadow values inside shared components
- Introducing a one-off page-only hero style that ignores the shared `hero-section` contract

## Review Checklist for Planner
- Did Builder reuse the shared family when a shared family existed?
- Did any page invent a second button or input language?
- Did `ArticleCard` stay the canonical article preview unit?
- Did empty/loading/error states move closer to one system?
- Did new components have a clear distinct responsibility?
