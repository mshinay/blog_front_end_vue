# Bilingual I18n Spec

## Goal

Add a user-facing language switcher for the Vue app so the product UI can be viewed in:

- English
- Simplified Chinese

The switch should feel like part of the existing editorial product shell rather than a separate utility feature.

## Product Intent

The site is currently English-led in its interface copy. This round adds bilingual UI support so users can switch between English and Chinese without changing:

- route structure
- API payloads
- permission logic
- user-generated content

This is a UI internationalization round, not a content translation round.

## Scope

### In Scope

- Global locale state for the Vue app
- A visible language switcher in the global shell
- Persistent user language preference
- Browser-language-based initial default when no explicit preference exists
- Translation coverage for shared UI chrome and the highest-traffic pages first
- Test updates for locale switching behavior and translated rendering

### Out of Scope

- Translating article titles, summaries, article body markdown, comments, usernames, categories, or backend content
- Changing route paths to localized URLs
- Changing API request or response schemas
- Server-side locale negotiation
- A full CMS-style translation workflow for authored content

## Assumptions

- Supported locales in this round are `en` and `zh-CN`.
- English remains the safe fallback locale.
- If the browser language starts with `zh`, default to `zh-CN`; otherwise default to `en`.
- Once a user explicitly switches language, that preference wins over browser language on future visits.

## UX Rules

### Locale Selection

- The app should expose a language switcher in the header.
- The control should be reachable on desktop and mobile.
- The selected locale should update visible UI copy immediately without requiring a page reload.
- The switcher label should be short and stable. Prefer explicit locale names over flags.

Recommended labels:

- `English`
- `中文`

### Persistence

- Store the user-selected locale in local storage.
- Recommended storage key: `localStorage.blog-locale`
- On app bootstrap:
  1. read persisted locale if present and valid
  2. otherwise derive locale from browser language
  3. otherwise fall back to `en`

### Copy Strategy

- Shared chrome and system copy should always come from translation dictionaries.
- Dynamic content from the backend should remain untouched.
- Where a UI string includes dynamic values, use message templates instead of string concatenation where practical.

Examples:

- good: translated labels like `Log in`, `Search`, `No results found`
- good: translated shell copy like `Written by {name}`
- out of scope: translating `{article.title}` or comment markdown content

## Technical Direction

### I18n Approach

Use a lightweight in-app i18n layer for the Vue rewrite.

Recommended implementation:

- add `vue-i18n`
- create a dedicated i18n setup module under `src/i18n/`
- keep message dictionaries in locale files
- expose a small locale composable/store for switching and persistence

This is preferred over ad hoc string maps inside components because current copy is already spread across many views and shared components.

### Suggested Structure

- `src/i18n/index.ts`
- `src/i18n/messages/en.ts`
- `src/i18n/messages/zh-CN.ts`
- optional shared helpers such as `src/i18n/locale.ts`

### Integration Rules

- Initialize i18n once in `src/main.ts`
- Locale switching should not recreate the app
- Components should read translated copy via the shared i18n interface, not custom page-level dictionaries
- Avoid mixing direct hardcoded UI strings with translated strings in touched files

## Translation Coverage Strategy

Because the app has many hardcoded strings, this round should be executed in slices rather than a repo-wide uncontrolled rewrite.

### Coverage Priority 1

- `AppHeader.vue`
- global shared states:
  - `EmptyState.vue`
  - `LoadingState.vue`
  - `PagePlaceholder.vue`

### Coverage Priority 2

- homepage
- search
- article detail
- login
- register

### Coverage Priority 3

- person center
- comment list
- comment item
- comment editor
- account settings / user-facing author panels

### Coverage Priority 4

- upload/edit article editor surfaces
- admin article/comments pages
- residual user/account/admin surfaces

## Translation Content Rules

### Must Translate

- navigation
- button labels
- headings
- empty/loading/error states
- helper text
- form labels and placeholders
- confirmation prompts that are UI-owned

### Must Not Translate

- backend-provided article content
- backend-provided category names unless the backend already returns localized values
- markdown body content
- usernames / nicknames
- arbitrary text authored by users

## Formatting and Locale Behavior

- This round may keep existing raw date strings unchanged if they come preformatted from the backend.
- If a touched component already formats dates locally in the UI, prefer making the surrounding label translatable even if the date value itself is unchanged.
- Do not introduce a partial date-formatting rewrite unless a card explicitly covers it.

## Risks

### Scope Explosion

The biggest risk is trying to translate every component in one pass. The app has many hardcoded strings across views and shared components. This should be controlled through card-based rollout.

### Mixed-Language Surfaces

Partially migrated pages may briefly mix translated chrome with untranslated local strings. Each builder card should finish the full surface it touches so the visible result is coherent.

### Dirty Worktree Overlap

There are existing unrelated modified files in admin/user/API/test areas. Builder should only touch those files when the active card explicitly targets them.

## Acceptance Bar For The Round

The bilingual feature should be considered successful when:

- the app boots with a valid locale every time
- users can switch between English and Chinese from the header
- locale choice persists across refreshes
- the main public reading flow is translated in both locales
- person/comment/auth surfaces are translated where planned
- untouched backend content still renders exactly as authored
- tests cover locale initialization, switching, and at least representative translated surfaces

