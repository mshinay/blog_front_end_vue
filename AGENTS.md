# AGENTS.md

## Purpose
- This file defines build/test commands and coding conventions for autonomous agents.
- Scope: `D:\work\project\myproject\blog-front-end\front-end`.
- Prefer minimal, targeted changes that preserve current behavior.

## Project Snapshot
- The repository has two front-end tracks:
  - Legacy static app: HTML/CSS/vanilla JS at repository root (`ai-html`, `js`, `css`).
  - Vue rewrite: `vue-app/` using Vue 3 + Vite + TypeScript.
- Backend API target: `http://localhost:8080`.
- Auth storage keys: `localStorage.jwt` and `localStorage.user`.

## Repository Layout
- `ai-html/`: legacy pages and HTML fragments (`ai-html/components/`).
- `js/article`, `js/comment`, `js/user`, `js/util`: legacy scripts.
- `css/`, `css/components/`: legacy styles.
- `vue-app/src/api`: axios client + API modules.
- `vue-app/src/stores`: Pinia stores (`auth`).
- `vue-app/src/router`: routes + guards (`requiresAuth`, `requiresAdmin`).
- `vue-app/src/views`: page views.
- `vue-app/src/components`: reusable UI.
- `vue-app/src/utils`: shared helpers (`markdown`, `permissions`).
- `vue-app/tests`: Vitest tests.

## Cursor / Copilot Rules
- No `.cursorrules` found.
- No `.cursor/rules/` found.
- No `.github/copilot-instructions.md` found.
- If these files appear later, treat them as higher-priority constraints.

## Build / Lint / Test Commands
- Legacy app:
  - Install: N/A.
  - Build: N/A.
  - Lint: N/A.
  - Test: N/A.
- Vue app setup:
  - `cd vue-app && npm install`
- Vue app run/build/lint:
  - `cd vue-app && npm run dev`
  - `cd vue-app && npm run build`
  - `cd vue-app && npm run lint`
  - `cd vue-app && npm run lint:fix`
- Vue app tests:
  - All tests: `cd vue-app && npm run test`
  - Watch mode: `cd vue-app && npm run test:watch`
  - Single test file: `cd vue-app && npm run test:one -- tests/permissions.spec.ts`
  - Single test by name: `cd vue-app && npm run test:name -- "permissions"`

## Local Run Notes
- Legacy static serve examples:
  - `python -m http.server 5500`
  - `npx serve . -l 5500`
- Legacy entry page: `http://127.0.0.1:5500/ai-html/main.html`.
- Vue dev URL is printed by Vite (`npm run dev`).

## Current Architecture Rules
- Keep legacy and Vue tracks isolated.
- Do not rewrite legacy pages when implementing Vue features unless requested.
- Vue API calls go through `vue-app/src/api/client.ts`.
- Keep route/auth logic centralized in router guards + auth store.

## TypeScript and Types
- Use `<script setup lang="ts">` in Vue SFCs.
- Avoid `any`; introduce/extend interfaces in `vue-app/src/types`.
- Type API payloads and responses explicitly in API modules.
- Keep nullable states explicit (`T | null`) for async-loaded data.

## Imports and Module Conventions
- Vue imports should prefer alias paths (`@/...`).
- Keep one concern per module where practical (view, API module, utility).
- Avoid circular dependencies between stores, API modules, and components.
- Legacy JS files can keep relative imports and existing script patterns.

## Formatting and Naming
- Vue code style is enforced by ESLint + Prettier.
- Naming:
  - Vue components: PascalCase (`ArticleEditor.vue`).
  - Variables/functions: camelCase.
  - File names in legacy JS/HTML/CSS: existing kebab-case style.
- Keep templates readable; avoid deeply nested conditional markup.

## API and Data Handling
- API base URL:
  - Vue: `VITE_API_BASE_URL` from `.env.development`.
  - Legacy: hardcoded `http://localhost:8080` in scripts.
- Auth header must be `authentication: <token>`.
- Use `try/catch` around async API calls and return actionable messages.
- Handle empty paging responses (`records.length === 0`) as end-of-list.

## Markdown / Editor Conventions
- Article content format is Markdown in Vue flow.
- ByteMD is used for article create/edit (`split` mode).
- Markdown rendering uses shared utility with sanitize (`marked` + `dompurify`).
- Do not store editor HTML snapshots as source-of-truth content.

## Permission Model (Important)
- `role === 0` is admin.
- Author-only edit:
  - Articles: only author can edit.
  - Comments: only comment owner can edit.
- Delete permissions:
  - Author/owner can delete own content.
  - Admin can delete articles/comments but should not get edit UI for others.
- Reuse `vue-app/src/utils/permissions.ts`; do not duplicate ad-hoc checks.

## Error Handling and UX
- Never fail silently.
- Prefer contextual error text in UI (not only `console.error`).
- Keep loading, empty, and error states explicit in list/detail pages.
- Guard route params and missing IDs before API calls.

## DOM / Event Patterns (Legacy)
- Wait for `DOMContentLoaded` before querying page-level nodes.
- Use event delegation for dynamic list items where possible.
- Guard nullable selectors before dereferencing.
- Keep repeated selectors in constants for readability.

## Security and Content Safety
- Sanitize markdown-generated HTML before `v-html` rendering.
- Prefer `textContent` for plain text insertion in legacy pages.
- Do not log tokens, auth headers, or sensitive payloads.
- Do not commit secrets (`.env*`, credentials, API keys).

## CSS / UI Guidance
- Follow existing visual language unless a redesign is explicitly requested.
- Keep pages responsive; verify at mobile widths.
- Avoid large inline styles in new Vue code; use scoped style blocks or shared CSS.
- Reuse existing spacing and typography tokens in Vue styles.

## Dependency and Tooling Rules
- Keep dependencies minimal; add packages only when required by feature scope.
- Document any new scripts in `vue-app/package.json` and this file.
- If introducing new environment variables, add `.env.example` updates.
- Do not switch package managers; project currently uses npm.

## Testing Expectations
- When changing logic, add or update Vitest coverage in `vue-app/tests`.
- Good targets for regression tests:
  - Permission rules.
  - Route guards.
  - Comment action visibility.
  - Markdown rendering/sanitization.
- Before finishing, run at least: lint + test + build in `vue-app`.

## Agent Change Checklist
- Confirm only intended files are modified.
- Confirm no credential/token files are added.
- Confirm route names and API endpoints match existing conventions.
- Confirm author-edit/admin-delete behavior remains consistent.
- Update this file when commands or architectural rules change.
