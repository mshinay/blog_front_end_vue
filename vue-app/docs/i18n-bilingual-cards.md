# Bilingual I18n Cards

## Round Summary

This round adds bilingual UI support to the Vue app through a controlled card sequence.

Builder should receive one active card at a time together with:

- `docs/i18n-bilingual-spec.md`
- any existing stable redesign docs still relevant to touched surfaces

Planner should review each card before the next one starts.

## Card 1

### Title

Implement the global i18n foundation and locale persistence

### Goal

Create the app-level bilingual infrastructure so the Vue app can initialize, persist, and switch locale safely.

### Files Involved

- `vue-app/package.json`
- `vue-app/src/main.ts`
- `vue-app/src/i18n/**`
- optional small locale utility/store files under `vue-app/src/`

### Required Changes

- Add and wire the i18n dependency
- Define supported locales: `en`, `zh-CN`
- Implement locale message dictionaries with enough shared keys for downstream cards
- Initialize locale from persisted preference or browser language fallback
- Persist explicit user locale changes
- Expose a shared switching interface that components can consume

### Non-goals

- Do not translate page components yet
- Do not add header UI yet
- Do not touch route paths or API payloads

### Acceptance Criteria

- App boot selects a valid locale deterministically
- Locale can be switched programmatically without reload
- Persisted locale is respected on refresh
- There is one canonical i18n entry point for the app

## Card 2

### Title

Add the bilingual switcher to the app shell and translate shared primitives

### Goal

Make language selection visible and translate shared UI primitives that appear across multiple pages.

### Files Involved

- `vue-app/src/components/layout/AppHeader.vue`
- `vue-app/src/components/common/EmptyState.vue`
- `vue-app/src/components/common/LoadingState.vue`
- `vue-app/src/components/common/PagePlaceholder.vue`
- any directly related shared styles if needed

### Required Changes

- Add a header language switcher that works on desktop and mobile
- Translate header navigation, auth action labels, and user identity chrome
- Translate shared state components so later pages inherit bilingual support
- Keep styling aligned with the existing Editorial Tech shell

### Non-goals

- Do not translate article/detail/search/auth/person pages yet
- Do not create a second header action language

### Acceptance Criteria

- Users can switch language from the header on desktop and mobile
- Header copy updates immediately
- Shared empty/loading primitives render correctly in both locales

## Card 3

### Title

Translate the public reading entry flow

### Goal

Bring the top public discovery flow into bilingual coverage.

### Files Involved

- `vue-app/src/views/MainView.vue`
- `vue-app/src/components/article/ArticleCard.vue`
- `vue-app/src/views/SearchView.vue`

### Required Changes

- Translate homepage hero, feed framing, and search-discovery copy
- Translate `ArticleCard` UI-owned labels and fallback states
- Keep backend article content untouched

### Non-goals

- Do not translate article markdown body
- Do not touch comments yet

### Acceptance Criteria

- Homepage and search page UI chrome are coherent in both locales
- `ArticleCard` remains the canonical preview family in both languages
- Article titles/summaries from backend still render as authored

## Card 4

### Title

Translate article detail reading chrome and comment entry framing

### Goal

Add bilingual coverage to the article detail shell without translating article content itself.

### Files Involved

- `vue-app/src/views/ArticleDetailView.vue`
- `vue-app/src/components/comment/CommentList.vue`

### Required Changes

- Translate article hero metadata labels, action copy, state pills, and discussion framing
- Translate comment section shell, empty states, auth prompt, and loading/error copy
- Preserve permission logic and article/comment data behavior

### Non-goals

- Do not translate comment markdown content
- Do not translate backend article metadata values themselves

### Acceptance Criteria

- Article detail page reads cleanly in both locales
- Embedded comment flow no longer contains English-only shell text
- User content remains untouched

## Card 5

### Title

Translate auth and person-center user surfaces

### Goal

Cover account entry and personal workspace flows.

### Files Involved

- `vue-app/src/views/LoginView.vue`
- `vue-app/src/views/RegisterView.vue`
- `vue-app/src/views/PersonCenterView.vue`
- `vue-app/src/components/person/**`

### Required Changes

- Translate auth page story copy, form labels, placeholders, CTA copy, and errors
- Translate person center tabs, hero stats, panel framing, and user-owned action labels
- Keep auth redirect behavior and profile update semantics unchanged

### Non-goals

- Do not translate user-entered profile data
- Do not touch admin pages yet

### Acceptance Criteria

- Login/register flows are fully usable in both locales
- Person center shell is coherent in both locales
- User-generated profile content remains untouched

## Card 6

### Title

Translate editor, admin, and remaining residual surfaces

### Goal

Finish coverage for the remaining app-owned UI text.

### Files Involved

- `vue-app/src/components/article/ArticleEditor.vue`
- `vue-app/src/views/UploadArticleView.vue`
- `vue-app/src/views/EditArticleView.vue`
- `vue-app/src/views/AdminArticlesView.vue`
- `vue-app/src/views/AdminCommentsView.vue`
- other residual user/admin shared components as needed

### Required Changes

- Translate editor labels, placeholders, helper text, and button copy
- Translate admin filters, status labels, empty states, and confirmation prompts
- Keep API contracts, admin permissions, and moderation behaviors unchanged

### Non-goals

- Do not localize backend records themselves
- Do not combine unrelated API cleanup into this card

### Acceptance Criteria

- Admin/editor surfaces no longer depend on English-only copy
- Residual untranslated app-owned strings in touched surfaces are removed
- Scope stays limited to bilingual support

## Card 7

### Title

Add targeted i18n regression coverage and documentation cleanup

### Goal

Lock in bilingual behavior with tests and round-specific docs updates.

### Files Involved

- representative `vue-app/tests/**`
- `vue-app/docs/planner/planner-snapshot.md` if needed after round closeout
- small supporting docs if touched by the round

### Required Changes

- Add or update tests for locale bootstrap, locale switch behavior, and translated representative surfaces
- Ensure tests verify that authored content is not translated by the UI layer
- Update planner memory if the round completes

### Non-goals

- Do not start unrelated API/test cleanup work

### Acceptance Criteria

- Bilingual behavior has regression coverage
- The round can be safely handed off or resumed later

## Recommended Start

Start Builder with `Card 1`.

Do not begin with page translation before the global i18n foundation exists, or the repo will drift into mixed one-off string mapping patterns.

