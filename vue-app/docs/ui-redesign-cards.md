# UI Redesign Cards

## Purpose
- This file sequences the Vue UI refresh work into Builder-ready cards.
- The order is intentional: design foundation first, shared shell second, high-traffic pages third, supporting pages afterward.
- Builder should not skip earlier cards unless Planner explicitly reorders the round.

## Round Strategy
- Round 1 establishes the visual system and shared shell.
- Round 2 upgrades the main content experience.
- Round 3 upgrades supporting flows and system consistency.
- Round 4 handles polish and review cleanup.

## Card 0: Finalize Design Spec

### Goal
Review `ui-redesign-spec.md`, resolve any open visual decisions, and lock the reference direction for implementation.

### Files Involved
- `vue-app/docs/ui-redesign-spec.md`

### Required Changes
- Confirm the chosen aesthetic direction remains `Editorial Tech`.
- Resolve open choices that would otherwise force Builder to improvise.
- Update wording where needed so later cards can be executed without guessing.

### Reference Intent
Builder should implement a visual system, not invent one page by page.

### Non-goals
- Do not edit Vue source files yet.
- Do not start page implementation in this card.

### Acceptance Criteria
- The design spec is concrete enough to guide implementation.
- Accent direction, typography approach, and homepage emphasis are no longer ambiguous.

## Card 1: Implement Global Visual Foundation

### Goal
Translate the approved redesign spec into reusable design tokens, global base styles, and a stronger app shell foundation.

### Files Involved
- `vue-app/src/styles/tokens.css`
- `vue-app/src/styles/base.css`
- `vue-app/src/App.vue`
- `vue-app/docs/ui-redesign-spec.md`
- `vue-app/docs/ui-design-tokens.md`
- `vue-app/docs/ui-component-contracts.md`

### Required Changes
- Implement `tokens.css` directly from `ui-design-tokens.md`, keeping semantic token names aligned with the spec.
- Introduce consistent global styles for typography, links, form controls, buttons, notices, surface containers, and page/container primitives defined by `ui-component-contracts.md`.
- Update the app shell background and content container treatment to match `ui-redesign-spec.md`.
- Avoid hardcoded one-off values when an approved token or primitive contract already exists.

### Reference Intent
This card should make later page work easier and more consistent, not just prettier in isolation.

### Non-goals
- Do not redesign the header navigation yet.
- Do not rework individual pages beyond shell-level structure.
- Do not modify business logic.

### Acceptance Criteria
- Tokens match the baseline values and naming rules in `ui-design-tokens.md`.
- Base styles implement the shared primitive families required by `ui-component-contracts.md`.
- Base styles create visible improvement across the app without page-level rewrites.
- App shell feels aligned with `ui-redesign-spec.md`.

## Card 2: Rebuild the Global Header and Navigation

### Goal
Turn the current header into a branded, responsive navigation system that matches the new visual foundation.

### Files Involved
- `vue-app/src/components/layout/AppHeader.vue`
- `vue-app/src/styles/base.css`
- `vue-app/src/App.vue`
- `vue-app/docs/ui-redesign-spec.md`
- `vue-app/docs/ui-design-tokens.md`
- `vue-app/docs/ui-component-contracts.md`

### Required Changes
- Redesign the header layout, spacing, nav hierarchy, and auth action presentation according to the global shell and `page-header`/surface conventions from the contracts.
- Use only approved tokens from `ui-design-tokens.md` for spacing, radius, color, shadow, and motion.
- Improve mobile behavior so navigation does not degrade into simple wrapped links.
- Ensure admin links are visually present but appropriately deprioritized.
- Keep the header as the sole global navigation shell defined in `ui-component-contracts.md`.

### Reference Intent
The header is the strongest cross-page impression point and should establish the site's tone.

### Non-goals
- Do not change route behavior or auth logic.
- Do not implement a site-wide search backend change.

### Acceptance Criteria
- Header feels branded and intentional.
- Navigation remains usable on mobile.
- Existing login, logout, and admin visibility behavior still works.
- Header styling does not introduce a parallel button or nav language outside the approved primitive families.

## Card 3: Upgrade Homepage Layout and Article Card System

### Goal
Rework the homepage into an editorial landing surface and upgrade article cards into a reusable content card system.

### Files Involved
- `vue-app/src/views/MainView.vue`
- `vue-app/src/components/article/ArticleCard.vue`
- `vue-app/docs/ui-redesign-spec.md`
- `vue-app/docs/ui-design-tokens.md`
- `vue-app/docs/ui-component-contracts.md`

### Required Changes
- Add a homepage hero or featured section consistent with `ui-redesign-spec.md` and using the shared `hero-section` and `page-shell` conventions where practical.
- Introduce clearer list rhythm and stronger content hierarchy without changing feed behavior.
- Expand `ArticleCard` within its approved contract so it supports at least `featured` and `default` presentation, with `compact` available if needed.
- Refine article metadata, tags, summary treatment, and image handling using shared tag, card, and text primitives from `ui-component-contracts.md`.
- Use only approved token families from `ui-design-tokens.md`; do not invent a page-local article preview language.

### Reference Intent
The homepage should sell the product experience immediately and become the visual anchor for later list-based pages.

### Non-goals
- Do not change article API loading behavior.
- Do not add new backend dependencies or ranking logic.

### Acceptance Criteria
- Homepage feels meaningfully different from a plain feed.
- Article cards are more expressive and reusable while remaining the canonical article preview component.
- Infinite scroll behavior still works.
- Homepage hero and card treatments remain visibly part of the same system established in Cards 1 and 2.

## Card 4: Rebuild Article Detail for Reading Comfort

### Goal
Transform the article detail page into a content-first reading experience aligned with the editorial direction.

### Files Involved
- `vue-app/src/views/ArticleDetailView.vue`
- markdown content styling in the relevant Vue/CSS scope

### Required Changes
- Redesign the article header hierarchy.
- Improve reading width, text rhythm, and markdown content presentation.
- Rebalance the relationship between article content, stats, actions, and comments.

### Reference Intent
This page should become the most polished reading surface in the product.

### Non-goals
- Do not change edit/delete permissions.
- Do not refactor comment fetching logic.

### Acceptance Criteria
- Article body is easier to read.
- Header and metadata feel premium and structured.
- Comments remain functional and better visually separated from content.

## Card 5: Unify Search and Empty-State Experience

### Goal
Give the search flow a distinct, intentional interface and align list/status presentation with the new homepage card system.

### Files Involved
- `vue-app/src/views/SearchView.vue`
- reusable common state components if needed

### Required Changes
- Make the search form the page focal point.
- Improve result context, no-result, and error presentation.
- Reuse and adapt the article card language established in earlier cards.

### Reference Intent
Search should feel like a purposeful discovery tool rather than a lightly altered feed page.

### Non-goals
- Do not alter search API semantics.
- Do not build advanced filtering unless explicitly requested later.

### Acceptance Criteria
- Search page has its own visual identity.
- Empty and error states feel designed, not incidental.
- Existing query sync behavior still works.

## Card 6: Redesign Login and Register as Branded Entry Pages

### Goal
Upgrade the authentication pages into polished entry points that match the redesigned product identity.

### Files Involved
- `vue-app/src/views/LoginView.vue`
- `vue-app/src/views/RegisterView.vue`

### Required Changes
- Introduce a more intentional auth layout and stronger visual hierarchy.
- Improve form field, button, helper text, and error state styling.
- Keep registration form density manageable on both desktop and mobile.

### Reference Intent
Authentication should reinforce trust and product quality without becoming visually noisy.

### Non-goals
- Do not change auth flow, validation rules, or submit behavior.
- Do not add social login or new auth options.

### Acceptance Criteria
- Both auth pages feel clearly related and more premium.
- Forms remain clear and easy to complete.
- Existing submit states and errors still work.

## Card 7: Rebuild Person Center as an Author Space

### Goal
Turn the person center into a more authored, structured space while preserving its current tab behavior and data flows.

### Files Involved
- `vue-app/src/views/PersonCenterView.vue`
- `vue-app/src/components/person/AccountSettingsPanel.vue`
- `vue-app/src/components/person/MyArticlesPanel.vue`
- `vue-app/src/components/person/MyCommentsPanel.vue`

### Required Changes
- Redesign the profile summary area.
- Improve tab styling and content panel hierarchy.
- Align account, article, and comment panels under one visual system.

### Reference Intent
This area should feel like a creator workspace, not a default account tab screen.

### Non-goals
- Do not change tab routing behavior.
- Do not refactor profile APIs.

### Acceptance Criteria
- Profile hero and tab system feel more intentional.
- Subpanels look related and consistent.
- Existing account management behavior still works.

## Card 8: Redesign Comment Surfaces and Discussion Hierarchy

### Goal
Improve the readability and polish of the comment system so it feels integrated with the article reading experience.

### Files Involved
- `vue-app/src/components/comment/CommentItem.vue`
- `vue-app/src/components/comment/CommentList.vue`
- `vue-app/src/components/comment/CommentEditor.vue`

### Required Changes
- Refine nested comment structure and reply visibility.
- Improve visual hierarchy for author name, time, content, and actions.
- Align editor and action controls with the shared form/button system.

### Reference Intent
Discussion should feel structured and calm rather than cramped or utility-first.

### Non-goals
- Do not change comment permission logic.
- Do not change comment tree data structure.

### Acceptance Criteria
- Nested replies remain readable on desktop and mobile.
- Actions are visible but not visually dominant.
- Comment styling feels consistent with article and profile surfaces.

## Card 9: Global Consistency Pass and UI Regression Cleanup

### Goal
Review the updated experience across pages, fix style inconsistencies, and align shared states after the main redesign cards land.

### Files Involved
- any touched Vue UI files from previous cards
- shared common components as needed

### Required Changes
- Clean up one-off visual drift introduced during earlier cards.
- Normalize empty, loading, and error states across major pages.
- Address responsive issues and small interaction mismatches.

### Reference Intent
The final result should feel like one system rather than a stack of good-looking individual pages.

### Non-goals
- Do not start new redesign scope for admin pages unless explicitly added.
- Do not perform unrelated refactors.

### Acceptance Criteria
- Major pages feel visually coherent.
- Shared states are aligned.
- No obvious responsive regressions remain in the touched flows.

## Suggested Execution Order
1. Card 0
2. Card 1
3. Card 2
4. Card 3
5. Card 4
6. Card 5
7. Card 6
8. Card 7
9. Card 8
10. Card 9

## Why This Order
- Spec lock first prevents Builder improvisation.
- Foundation before pages avoids rework.
- Header and homepage come early because they define first impression and shared patterns.
- Article detail follows because it is the most important content-reading page.
- Search and auth benefit from the card and form language established earlier.
- Person center and comments come after the main content system is stable.
- Final cleanup is reserved for system-wide consistency.
