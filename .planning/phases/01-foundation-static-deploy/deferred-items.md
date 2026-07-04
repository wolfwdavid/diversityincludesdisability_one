# Deferred Items — Phase 01 (foundation-static-deploy)

Out-of-scope discoveries found during execution, not fixed (per deviation SCOPE BOUNDARY).

## 1. svelte-check: `Cannot find name 'process'` in tests/deploy.smoke.spec.ts
- **Found during:** 01-03 Task 3 (svelte-check run before rebuild)
- **Origin:** Latent from 01-02 — the smoke spec uses `process.env.BASE_URL` but the project has no `@types/node` and no `"node"` in `tsconfig` `types`.
- **Impact:** Type-check only. Does NOT block `npm run build` (exit 0) or Playwright (esbuild transpiles it; live smoke ran 4/4 green). Not in the deploy gate.
- **Suggested fix (later pass):** `npm i -D @types/node` and add `"types": ["node"]` (or `/// <reference types="node" />`) — a dependency/tsconfig change intentionally left outside 01-03's scope.
