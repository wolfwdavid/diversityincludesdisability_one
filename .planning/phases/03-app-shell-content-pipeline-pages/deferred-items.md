# Deferred Items — Phase 03

Out-of-scope discoveries logged during execution. Not fixed in the plan that found them.

## From 03-01 (App Shell, Landmarks & Nav)

- **`tests/deploy.smoke.spec.ts:4` — `Cannot find name 'process'` (svelte-check error).**
  Pre-existing Phase-1 live-smoke harness file. It references `process.env` without
  `@types/node` in the check tsconfig scope. Does NOT block `npm run build` (svelte-check
  is advisory here). Out of scope for 03-01 (not caused by this plan's changes). Fix later
  by adding `@types/node` / `node` to the tests tsconfig types, or scoping the smoke tests
  out of `svelte-check`.
