# Repository Guidelines

## Project Structure & Module Organization
Nuxt 3 drives the app: `app.vue` wires layouts, `pages/` holds route-level views, and `components/` stores reusable Vue components (PascalCase filenames). Domain logic belongs in `composables/` for shared hooks and `stores/` for Pinia state. Server routes and integrations live under `server/` (e.g., `server/api/*.ts`), while Supabase assets (SQL, policies, seed data) sit in `supabase/` alongside helper scripts in `scripts/` such as `run-migration.sh`. Typed contracts and DTOs live in `types/`, middleware in `middleware/`, and transactional emails in `email-templates/`. Reference the FAMILY_CHART*.md docs for data modeling context before editing chart logic.

## Build, Test, and Development Commands
- `yarn dev`: hot-reload Nuxt dev server with Supabase client wired.
- `yarn build`: production build (SSR bundles + Nitro server output).
- `yarn preview`: serve the last build locally for smoke-testing.
- `yarn generate`: prerender static assets for deployment scenarios.
- `yarn lint` / `yarn typecheck`: gate changes with ESLint (Nuxt preset) and Vue TSC.
- `yarn db:migrate`: run `scripts/run-migration.sh` to apply Supabase migrations; `yarn supabase:setup` prints CLI bootstrap guidance.

## Coding Style & Naming Conventions
Use TypeScript in `<script setup lang="ts">` blocks, 2-space indentation, and keep template sections lean (move data shaping to composables). Components and stores use PascalCase (`FamilyChart.vue`, `useProfileStore()`), utility functions use camelCase, and composables follow `useX` naming. TailwindCSS (configured in `tailwind.config.ts`) defines design tokens—prefer utility classes over inline styles. Run Prettier (inherits from ESLint config) before committing; CI assumes zero lint warnings.

## Testing Guidelines
There is no dedicated unit-test runner yet, so rely on `yarn lint` and `yarn typecheck` as the minimum bar. When adding tests, co-locate Vitest specs under `tests/` mirroring the source path (e.g., `tests/components/FamilyChart.spec.ts`) and name files `*.spec.ts`. Aim for smoke coverage around new stores/composables plus regression tests for Supabase RPC boundaries. Document any manual QA steps in PRs until automated suites exist.

## Commit & Pull Request Guidelines
Git history follows conventional prefixes (`feat:`, `docs:`, etc.); match that format, keep subject lines under 72 characters, and describe scope succinctly. Squash local work before opening a PR. Each PR should include: purpose summary, linked issue or doc, screenshots/GIFs for UI changes, migration notes (if `supabase/` changed), and test evidence (`yarn lint`, `yarn typecheck`, manual steps). Label breaking changes clearly and request a review from at least one Supabase-focused contributor.

## Security & Configuration Notes
Store Supabase anon and service keys in `.env` files loaded by Nuxt runtime config; never commit credentials or the generated `.output/`. When running `yarn db:migrate`, ensure `SUPABASE_ACCESS_TOKEN` is set and double-check migrations on a disposable branch before promoting to production. Rotate webhook secrets exposed in `server/api` if they leak, and document any new required env vars in `SUPABASE_INTEGRATION_SUMMARY.md`.
