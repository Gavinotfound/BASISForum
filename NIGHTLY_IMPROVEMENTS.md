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

## Iteration 02 — 2026-08-13T15:49:07Z

### Completed

- Added a first-class `pnpm test` workspace command backed by a cached Turborepo `test` task.
- Added Vitest with V8 coverage to `@basis-forum/core`, keeping the test runner explicitly declared by the package that uses it.
- Added 14 focused unit tests for the core subject and report taxonomies, moderation-role authorization, profile-subject normalization and cap, and both reply-notification variants.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 14 tests |
| Core V8 coverage | 100% statements, branches, functions, and lines |
| `pnpm lint` | Passed |
| Sequential Web and Admin production builds | Passed |

### Follow-up Audit Note

The application builds still report an avoidable Next.js workspace-root warning because `/home/ubuntu/package-lock.json` is discovered above this pnpm workspace. The next iteration will explicitly set each application’s Turbopack root to the monorepo directory, removing the ambiguity without deleting unrelated files outside the project.

## Iteration 03 — 2026-08-13T15:59:22Z

### Completed

- Set an explicit monorepo `turbopack.root` for both Next.js applications, removing the misleading multi-lockfile workspace-root warning without touching unrelated files.
- Made both applications inherit the shared strict TypeScript baseline, disabled irrelevant declaration generation for app packages, and removed `typescript.ignoreBuildErrors` from both production build configurations.
- Resolved all 14 TypeScript diagnostics found while enabling the gate, including Material UI v9 prop migrations, missing package dependency declarations, a missing notification-thread relation, session null guards, public locale type exports, and valid theme-override selectors.
- Improved registration UX by converting the form to a stateful server-action flow: validation and duplicate-account errors can now remain visible in the form, with localized pending labels in all four supported languages.

### Verification

| Check | Result |
|---|---|
| Strict Web TypeScript check | Passed |
| Strict Admin TypeScript check | Passed |
| `pnpm test` | Passed: 14 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with type validation enabled | Passed for Web and Admin |

### Follow-up Audit Note

The quality gates are now effective, but the test suite currently covers only pure core rules. The next audit should prioritize tests for database query behavior and server-action validation, then address deprecated dependency declarations and remaining Swiss-design inconsistencies in forms and route layouts.

## Iteration 04 — 2026-08-13T16:02:50Z

### Completed

- Removed the deprecated `@types/bcryptjs` stubs from both applications; the installed `bcryptjs` release provides its own TypeScript declarations.
- Added the explicitly required YAML peer dependency to the core test package, eliminating the direct Vitest/Vite peer-version warning during installation.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 14 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

Only transitive deprecation notices remain from third-party tooling. They are not directly actionable without broader framework upgrades; the next iteration will focus on product-controlled coverage and UX improvements instead.
