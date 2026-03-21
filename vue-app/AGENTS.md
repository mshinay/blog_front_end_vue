# Repository Guidelines

## Project Structure & Module Organization
This repository contains the Vue 3 rewrite of the blog frontend. Main code lives in `src/`: `api/` for Axios modules, `components/` for reusable UI, `router/` for route guards, `stores/` for Pinia state, `utils/` for shared helpers, and `views/` for page-level screens. Tests live in `tests/`. Static assets belong in `public/`. Build output is generated in `dist/` and should not be edited manually.

## Build, Test, and Development Commands
- `npm run dev`: start the Vite dev server for local development.
- `npm run build`: run `vue-tsc` type checks and produce a production build.
- `npm run preview`: preview the built app locally.
- `npm run lint`: run ESLint across the project.
- `npm run lint:fix`: auto-fix lint issues where possible.
- `npm run test`: run the full Vitest suite once.
- `npm run test:watch`: run tests in watch mode.
- `npm run test:one -- tests/permissions.spec.ts`: run a single test file.
- `npm run test:name -- "permissions"`: run tests matching a name.

## Coding Style & Naming Conventions
Use Vue SFCs with `<script setup lang="ts">` and prefer alias imports such as `@/api/client`. Avoid `any`; add or extend shared types instead. Component files use PascalCase like `ArticleEditor.vue`; variables and functions use camelCase. Keep permission logic in `src/utils/permissions.ts`, route/auth rules in the router and auth store, and API calls in `src/api/client.ts`. Formatting is enforced with ESLint and Prettier.

## Testing Guidelines
Vitest is the test runner, with `jsdom` and Vue Test Utils available for component coverage. Add or update tests whenever logic changes, especially for permissions, route guards, comment actions, and markdown sanitization. Follow the existing `*.spec.ts` naming pattern under `tests/`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative Chinese commit subjects such as `统一权限规则并完成管理员删除管理页`. Keep commits focused and descriptive. For pull requests, include a brief summary, affected views or modules, linked issue if one exists, and screenshots for UI changes. Before opening a PR, run `npm run lint`, `npm run test`, and `npm run build`.

## Security & Configuration Tips
Use `VITE_API_BASE_URL` from `.env.development` or `.env.example`; do not commit secrets. Send auth as `authentication: <token>`, never log tokens, and sanitize markdown-rendered HTML before using `v-html`.
