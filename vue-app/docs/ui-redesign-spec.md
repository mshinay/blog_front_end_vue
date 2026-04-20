# UI Redesign Spec

## Document Purpose
- This file defines the visual direction and shared UI rules for the Vue version of the blog.
- It is the design source of truth for Builder cards related to UI refresh work.
- Builder should follow this spec before introducing any page-level styling changes.

## Project Context
- Product type: personal/content-driven blog platform with article publishing, reading, search, comment, and profile flows.
- Current state: the Vue app already has a basic token layer and card-based UI, but the visual system is still lightweight and page styles are too close to generic CRUD screens.
- Desired shift: move from "student project UI" toward "editorial content platform" without changing architecture or business behavior.

## Working Goals
- Make the Vue app feel cohesive, polished, and content-first.
- Improve first impression on the homepage and global navigation.
- Make article reading noticeably more comfortable and premium.
- Establish reusable visual primitives so later page changes stay consistent.
- Preserve existing Vue architecture, route logic, permission behavior, and API flows.

## Non-goals
- Do not rewrite legacy static pages.
- Do not redesign backend contracts or data structures.
- Do not change route names, auth flow, permission rules, or business copy unless needed for clarity.
- Do not introduce a large component framework or heavy new dependency just for styling.
- Do not turn the blog into a dashboard-like admin product.

## Design Direction

### Chosen Direction
`Editorial Tech`

### Direction Summary
The UI should blend editorial reading qualities with modern product clarity:
- editorial hierarchy over dashboard density
- strong typography over decorative gimmicks
- warm, textured surfaces over flat white panels
- restrained interactions over flashy motion
- content-first layouts over control-first layouts

### Brand Keywords
- calm
- thoughtful
- refined
- human
- modern
- readable

### What Users Should Feel
- The site is made for reading, not just data display.
- The author has taste and intent.
- The interface is modern but not cold.
- The experience is organized, quiet, and trustworthy.

## Visual Principles

### 1. Content Comes First
- Reading surfaces should feel spacious and intentional.
- Titles, summaries, and metadata must have obvious hierarchy.
- Decorative treatment must support content instead of competing with it.

### 2. Warm Structure
- Avoid pure white on pure gray defaults.
- Use subtle warmth in backgrounds and surface layers.
- Use contrast through tone and spacing, not only borders.

### 3. Controlled Personality
- The UI should be memorable, but not loud.
- A single accent family should carry the brand.
- Avoid trendy gradients or generic SaaS polish patterns.

### 4. Consistent Material Language
- Buttons, cards, inputs, tags, and notices should feel like they belong to one system.
- Rounded corners, shadows, borders, and hover states should use repeatable rules.

### 5. Responsive by Default
- Desktop should feel editorial and open.
- Mobile should feel compact but not cramped.
- Avoid layouts that collapse into generic stacked cards without hierarchy.

## Visual System

### Color Strategy
- Base background should be warm and soft, not stark white.
- Surface layers should show depth through slight tonal steps.
- Text should use ink-like dark tones instead of pure black.
- One accent color should carry primary actions and highlights.
- Status colors should be softer and integrated into the palette.

### Suggested Token Families
- Backgrounds:
  - app background
  - elevated page glow / hero wash
  - surface
  - stronger surface / section tint
- Text:
  - primary text
  - muted text
  - soft label text
  - inverse text
- Actions:
  - primary action
  - primary hover
  - subtle action tint
  - active nav indicator
- Borders:
  - default border
  - strong border
  - soft divider
- Status:
  - error bg / text / border
  - success bg / text / border
  - warning bg / text / border
  - info bg / text / border

### Starter Palette Direction
This is a direction, not a locked final palette:
- background: warm parchment / linen
- surface: creamy off-white
- strong surface: muted sand or stone tint
- text: deep blue-gray ink
- muted text: moss-gray or graphite gray
- accent: copper, clay, or deep teal

Builder may refine exact hex values, but the palette must stay warm, editorial, and restrained.

## Typography

### Tone
- Headings should feel authored and confident.
- Body text should be stable and highly readable.
- Metadata should be quieter but still elegant.

### Rules
- Use a more characterful display family for headings when practical.
- Use a clean, readable body family for paragraphs and forms.
- Do not fall back to a generic "everything system font" look if a better pairing can be introduced safely.
- Keep type ramp explicit in tokens.

### Required Type Levels
- display / hero title
- page title
- section title
- card title
- body
- body small
- meta / label
- code text

### Reading Rules
- Article body must have increased line height and controlled line width.
- Summary text and metadata need distinct visual rhythm from article content.
- Avoid dense all-caps overuse except for tiny eyebrow labels.

## Spacing and Layout

### Spacing Principles
- Use generous top-level spacing and tighter internal spacing.
- Separate page sections clearly.
- Avoid crowded card interiors and collapsed header groups.

### Required Layout Tokens
- page max width
- reading column max width
- wide feature section width
- section gap
- card padding
- compact card padding
- control height
- mobile-safe horizontal padding

### Container Strategy
- App shell should support layered backgrounds and a stronger sense of depth.
- Not every page must share the same content width.
- Reading pages should use narrower text columns than listing pages.

## Shape, Borders, and Depth

### Corners
- Use a consistent radius scale across controls, cards, and panels.
- Cards can be softer and larger-radius than controls.

### Borders
- Borders should guide structure, not dominate the design.
- Prefer low-contrast borders combined with tonal backgrounds.

### Shadows
- Shadows should feel diffused and editorial, not floating app-store cards.
- Elevation should be subtle and used sparingly.

## Interaction and Motion

### Motion Principle
- Favor calm transitions over flashy choreography.
- Use motion to communicate depth, focus, and state change.

### Required Interactions
- hover state for cards
- hover and focus state for buttons
- focus-visible treatment for links and fields
- active tab / nav state
- soft page-entry or section-entry reveal where appropriate

### Motion Limits
- Avoid over-animating article reading pages.
- Avoid exaggerated bounces or glassmorphism-style flourishes.

## Core UI Patterns

### Buttons
Need consistent variants:
- primary
- secondary
- ghost
- danger
- inline action

Rules:
- Primary actions should use the brand accent or strong ink fill.
- Secondary and ghost variants should remain tactile, not invisible.
- Danger actions must feel distinct without looking alarmist by default.

### Inputs and Textareas
Rules:
- Use stronger focus states than the current default.
- Inputs should feel aligned with the card system.
- Error states must be explicit and contextual.
- Placeholder text should not compete with entered content.

### Cards and Panels
Need a clear distinction between:
- content card
- settings panel
- status notice
- stats tile
- empty state container

Rules:
- Article cards should prioritize title and summary.
- Profile and settings panels should feel more structured and utility-focused.
- Stats tiles should support small numerical highlights without dashboard overkill.

### Tags and Pills
Rules:
- Tags should feel editorial and curated, not generic chip controls.
- Category and topic tags should share a family but allow subtle role differences.

### Empty, Loading, and Error States
Rules:
- Never feel like raw fallback placeholders.
- Use consistent spacing, icon area or emphasis area, and supportive copy structure.
- Error states should feel calm and actionable.

## Page-Level Guidance

### Global App Shell
Applies to:
- `src/App.vue`
- `src/components/layout/AppHeader.vue`

Intent:
- Establish brand tone immediately.
- Create a stronger frame for all pages.

Rules:
- Header should feel like a branded navigation bar, not just a row of links.
- Main background should have subtle atmosphere.
- Content shell should preserve breathing room on large screens and mobile.

### Homepage
Applies to:
- `src/views/MainView.vue`
- `src/components/article/ArticleCard.vue`

Intent:
- Feel like a real editorial homepage, not just an infinite list.

Rules:
- Include a stronger top section or hero.
- Support at least one visually emphasized article treatment.
- Make list rhythm more varied than identical repeated cards.
- Preserve current data-loading behavior.

### Article Detail
Applies to:
- `src/views/ArticleDetailView.vue`
- markdown-rendered content styles

Intent:
- Deliver the best reading experience in the app.

Rules:
- Strong article header hierarchy.
- Comfortable body width and line height.
- Clear separation between content, metadata, stats, and comments.
- Action buttons should stay available without hijacking the page.

### Search
Applies to:
- `src/views/SearchView.vue`

Intent:
- Make search feel like a dedicated tool rather than a reused list page.

Rules:
- Search form should become the page focal point.
- Result state should clearly communicate query context.
- Empty search and no-result states should feel intentionally designed.

### Login and Register
Applies to:
- `src/views/LoginView.vue`
- `src/views/RegisterView.vue`

Intent:
- Make authentication feel branded and trustworthy.

Rules:
- Preserve current form behavior.
- Add stronger visual identity and better state presentation.
- Maintain simple, clear, accessible field layout.

### Person Center
Applies to:
- `src/views/PersonCenterView.vue`
- related person panels

Intent:
- Feel like an author space, not a default tabbed account page.

Rules:
- Profile summary should feel more premium and authored.
- Tab navigation should feel integrated with the visual system.
- Content panels should share a common panel language.

### Comments
Applies to:
- `src/components/comment/CommentList.vue`
- `src/components/comment/CommentItem.vue`
- `src/components/comment/CommentEditor.vue`

Intent:
- Make discussion feel structured and readable.

Rules:
- Nested replies should stay legible.
- Action buttons should be present but visually secondary.
- Comment content should feel like part of the reading surface ecosystem.

## Accessibility and UX Requirements
- Maintain clear focus-visible states.
- Preserve readable contrast for text and controls.
- Keep tap targets comfortable on mobile.
- Do not rely on color alone for critical states.
- Preserve explicit loading, empty, and error feedback.

## Technical Constraints for Builder
- Keep legacy and Vue tracks isolated.
- Use existing alias import conventions.
- Avoid changing route logic, store behavior, or permission utilities during visual-only cards.
- Prefer tokenized CSS and reusable page patterns over one-off styling.
- Keep dependency additions minimal and justified.

## Definition of Done for UI Cards
A UI card should be considered done only if:
- The implementation clearly follows this spec's visual direction.
- Changes remain scoped to the card's target files.
- Mobile layout is checked.
- Existing behavior still works.
- New styling improves consistency rather than adding another one-off pattern.

## Open Decisions for Planner Review
These should be confirmed before Builder begins large page-level work:
- exact accent color family: copper, clay-red, or deep teal
- whether to introduce an external font source or stay with safe local stacks
- whether homepage hero includes quick filters, featured article, or both
- whether article stats remain visible above the fold or move lower in the detail page
