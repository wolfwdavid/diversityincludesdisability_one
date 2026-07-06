# Deferred Items — Phase 05 (premium-3d-hero)

Out-of-scope discoveries logged during execution. NOT fixed (not caused by the current plan's changes).

## Pre-existing svelte-check error (discovered 05-01, Task 1)

- **File:** `tests/deploy.smoke.spec.ts:4`
- **Error:** `Cannot find name 'process'. Do you need to install type definitions for node?`
- **Cause:** Pre-existing — the Phase-1 smoke spec references `process.env` without `@types/node` in the tsconfig `types` field. Unrelated to the capability gate or 3D hero work.
- **Suggested fix (future):** add `@types/node` to devDependencies and `"node"` to `tsconfig.json` compilerOptions.types, or type-guard the `process` reference.

## Pre-existing unused-CSS warning (discovered 05-01, Task 1)

- **File:** `src/routes/+page.svelte:37`
- **Warning:** Unused CSS selector `.disclaimer`.
- **Cause:** Pre-existing home-page markup drift; not touched by this plan.
