# Deferred Items — Phase 02 (design-system-dual-theme)

Out-of-scope discoveries logged during execution (NOT fixed here per scope boundary).

## From 02-01 (Tokens & Dual-Theme CSS)

- **Pre-existing type error in `tests/deploy.smoke.spec.ts`** — `svelte-check` reports
  "Cannot find name 'process'. Do you need to install type definitions for node?"
  This is Phase-1 smoke-harness code in the untouchable `tests/` dir (playwright.config.ts
  harness). Not caused by 02-01. Fix would be adding `@types/node` / a `node` types entry to
  tsconfig. Deferred — does not affect `npm run build` (which is what gates the static deploy).

## Expected RED (NOT deferred — by design)

- `src/lib/theme/theme.test.ts` fails `svelte-check` with "Cannot find module './theme.svelte.ts'".
  This is intentional: the `theme.svelte.ts` runes store is created in plan **02-02**. The unit
  test is a scaffold that goes green in 02-02. Documented in the 02-01 plan and SUMMARY.
