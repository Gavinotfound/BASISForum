# BASISForum Nightly Improvements

## Iteration 01 — 2026-08-13T15:42:56Z

### Completed

- Replaced the removed `next lint` workflow with the official ESLint CLI and a monorepo flat configuration compatible with Next.js 16.
- Added `eslint`, `eslint-config-next`, and `eslint-config-prettier`; pinned ESLint to the compatible 9.x line and TypeScript to 5.9.x across the workspace.
- Added App Router-aware ESLint settings and ignored generated build artifacts.
- Removed lint-blocking `any` casts from Web and Admin authentication callbacks by introducing explicit role, JWT, and session extension types.
- Removed unused imports and catch bindings reported by lint.
- Added `.gitignore` and initialized nightly improvement tracking.

### Verification

| Check | Result |
|---|---|
| `pnpm lint` | Passed |
| Uncached Admin ESLint CLI | Passed |
| Existing production build baseline | Previously passing; retained for the next iteration’s full verification |

### Audit Findings Queued

1. The repository had no Git history, so the first commit will establish a clean baseline for future nightly iterations.
2. There is no unit or integration test suite. The next iteration should add focused tests for pure `packages/core` logic and a `test` workspace task.
3. Both Next.js applications currently bypass TypeScript build errors with `typescript.ignoreBuildErrors: true`; this should be removed only after type checks are established and passing.
4. A deprecated `@types/bcryptjs` dependency and several minor dependency updates are available; dependency updates will be handled after coverage and type-safety gates are in place.

### Blockers for Review

None.
