# AGENTS.md

## Purpose
- This file guides autonomous coding agents working in this repository.
- Scope: `D:\work\project\myproject\blog-front-end\front-end`.
- Follow existing project patterns before introducing new abstractions.

## Project Snapshot
- This repository now contains two front-end tracks:
  - Legacy static front-end (HTML/CSS/vanilla JS) under root folders.
  - New Vue rewrite under `vue-app/` (Vue 3 + Vite + TypeScript).
- Pages live in `ai-html/`, scripts in `js/`, styles in `css/`, assets in `img/`.
- Vue rewrite source lives in `vue-app/src/`.
- Front-end talks to a backend API at `http://localhost:8080`.
- Auth is token-based via `localStorage` key `jwt`.
- Current user object is stored in `localStorage` key `user`.

## Repository Layout
- `ai-html/`: page entry points and reusable HTML fragments under `ai-html/components/`.
- `js/article/`: article list/search/detail/upload/edit flows.
- `js/comment/`: comment list/create/update flows.
- `js/user/`: login/register/profile/header/user-page flows.
- `js/user/components/`: dynamically loaded personal-center modules.
- `js/util/`: shared helpers (`tool.js`, `include-header.js`).
- `css/` and `css/components/`: page/component styles.
- `vue-app/`: parallel Vue implementation (router/store/api/components/views/tests).

## Cursor / Copilot Rules
- No `.cursorrules` file was found.
- No `.cursor/rules/` directory was found.
- No `.github/copilot-instructions.md` file was found.
- If these files are added later, treat them as higher-priority constraints.

## Runtime and Local Dev Commands
- Legacy install step: not required (static files served directly).
- Legacy build/lint/test: not configured.
- Vue app install step:
  - `cd vue-app && npm install`
- Vue app dev/build/lint/test:
  - `cd vue-app && npm run dev`
  - `cd vue-app && npm run build`
  - `cd vue-app && npm run lint`
  - `cd vue-app && npm run test`
- Vue app single-test commands:
  - Single test file: `cd vue-app && npm run test:one -- tests/auth.store.spec.ts`
  - Single test by name: `cd vue-app && npm run test:name -- "auth store"`
- Recommended local server (Python):
  - `python -m http.server 5500`
- Alternative local server (Node, if available):
  - `npx serve . -l 5500`
- Open main page:
  - `http://127.0.0.1:5500/ai-html/main.html`
- Backend dependency for full functionality:
  - API should be running on `http://localhost:8080`.

## Test Commands (Current State)
- Legacy full test suite command: N/A (no framework).
- Vue full test suite command: `cd vue-app && npm run test`.
- Vue single test file command: `cd vue-app && npm run test:one -- <file-path>`.
- Vue pattern/name command: `cd vue-app && npm run test:name -- "<test name>"`.

## Testing Guidance Until Framework Exists
- Do smoke tests manually per touched page:
  - Auth: `ai-html/login.html`, `ai-html/register.html`.
  - Article flows: `ai-html/main.html`, `ai-html/article.html`, `ai-html/upload.html`, `ai-html/edit-article.html`.
  - User center: `ai-html/person.html`, `ai-html/user-page.html`.
  - Search: `ai-html/search.html`.
- Verify authenticated requests send `authentication` header with JWT.
- Verify unauthenticated paths either redirect or alert as expected.
- For infinite-scroll pages, confirm sentinel-triggered pagination works and stops at end.

## If You Add a Test Runner
- Prefer `vitest` for lightweight JS testing in this repo.
- Suggested scripts (if `package.json` is introduced):
  - `test`: `vitest run`
  - `test:watch`: `vitest`
  - `test:one`: `vitest run <file-path>`
  - `test:name`: `vitest run -t "<test name>"`
- Keep this file updated immediately after adding scripts.

## JavaScript Style Guidelines
- Legacy: use modern JS (`const`/`let`, async/await where reasonable).
- Vue app: prefer TypeScript-first code (`<script setup lang="ts">`, typed API and store contracts).
- Keep functions focused and page-scoped unless shared behavior is needed.
- Prefer early returns for invalid state (missing token, missing IDs, empty inputs).
- Use strict equality (`===`, `!==`).
- Avoid deeply nested conditionals; flatten with guard clauses.
- Do not introduce heavy frameworks without explicit request.

## Imports and Modules
- Existing code mixes classic scripts and ES modules; preserve per-page behavior.
- Vue app uses ESM with alias imports from `@/`.
- For files using imports, keep explicit `.js` extensions in relative imports.
- Shared helpers belong in `js/util/` and should be exported explicitly.
- For dynamic component loading, follow `loadComponent()` + `init()` pattern.
- Avoid circular imports; keep utilities dependency-light.

## Formatting and File Organization
- Match existing indentation style in edited files (many files use 2 spaces or 4 spaces inconsistently).
- Vue app formatting is enforced by ESLint + Prettier.
- Keep line lengths readable; break long template strings when clarity improves.
- Prefer one logical concern per file.
- Keep DOM selectors near top-level constants when reused.
- Keep side effects inside `DOMContentLoaded` handlers for page scripts.

## Naming Conventions
- File names: kebab-case for multiword files (e.g., `edit-article.js`).
- Vue component files: PascalCase in `vue-app/src/components` and `vue-app/src/views`.
- Variables/functions: camelCase.
- Constants: camelCase for runtime values, UPPER_SNAKE_CASE only for true constants if introduced.
- CSS classes/IDs: descriptive kebab-case; align selectors with HTML naming.
- LocalStorage keys: reuse existing keys (`jwt`, `user`) rather than creating variants.

## API and Data Handling
- Legacy API base URL is hardcoded (`http://localhost:8080`).
- Vue app API base URL comes from `VITE_API_BASE_URL` in `.env.development`.
- Authenticated requests should include header `authentication: <token>`.
- For JSON requests, include `Content-Type: application/json`.
- Check response status (`response.ok`) for network/protocol errors.
- Parse JSON once per response and validate expected fields before use.
- Handle empty list responses explicitly in paginated views.

## Error Handling and UX
- Wrap async network code in `try/catch` (or `.catch` for promise chains).
- Log actionable errors via `console.error` with context.
- Show user-facing alerts/messages for failure states already exposed in UI.
- Never swallow errors silently.
- Avoid breaking entire page render when one component request fails.

## DOM and Event Patterns
- Wait for DOM readiness before querying elements that may not exist yet.
- Cache frequently reused DOM nodes.
- Prefer event delegation for dynamic list items (already used in management pages).
- Remove/rebind listeners when components can mount multiple times.
- Guard null selectors before dereferencing.

## Security and Content Safety
- Treat backend-provided HTML (`innerHTML`) as trusted only if server sanitizes it.
- When rendering plain text, use `textContent` instead of `innerHTML`.
- Do not log secrets or tokens.
- Do not commit credentials or environment secrets.

## CSS / UI Guidelines
- Reuse existing layout patterns and class naming when editing current pages.
- Prefer external CSS for reusable styling; avoid growing large inline `<style>` blocks.
- Keep mobile behavior usable; test at narrow viewport widths.
- Preserve current visual language unless user asks for redesign.

## Change Management for Agents
- Make minimal, targeted changes.
- Keep legacy and Vue tracks isolated; do not break legacy pages while migrating Vue code.
- Do not rename endpoints, storage keys, or DOM IDs/classes without updating all references.
- Legacy new files should stay in existing domain folders (`article`, `comment`, `user`, `util`).
- Vue rewrite files should stay inside `vue-app/src` by domain (`api`, `stores`, `views`, `components`).
- If introducing tooling (lint/tests/build), document commands here in the same change.

## Pre-Completion Checklist
- Confirm edited pages load from static server without console-breaking errors.
- Confirm related API calls still hit the expected endpoint and headers.
- Confirm imports resolve in browser context (correct relative paths and `.js` extension).
- Confirm no missing DOM elements for added selectors.
- Update this `AGENTS.md` if conventions or commands changed.
