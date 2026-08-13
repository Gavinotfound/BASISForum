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

## Iteration 05 — 2026-08-13T16:06:45Z

### Completed

- Audited the live homepage and login route; findings are recorded in `UX_AUDIT_2026-08-13.md`.
- Replaced authentication card wrappers with direct editorial form sections structured by top and bottom rules, matching the strict zero-radius, no-card Swiss layout system.
- Added explicit accessible labels and input identifiers, correct autocomplete values, visible localized form state, and meaningful reciprocal navigation between login and registration.
- Removed the inert password-reset control rather than exposing a non-functional interaction.
- Added server-side registration validation for display name length, normalized email format, and an eight-character password minimum to complement browser validation.
- Localized the new authentication labels in English, Simplified Chinese, French, and Icelandic.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 14 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

The authentication flow now has a stronger visual hierarchy and validation path. The next improvement should move the remaining profile `Paper` layouts to direct Swiss structural rules and add test coverage around server-action validation where practical.

## Iteration 06 — 2026-08-13T16:09:36Z

### Completed

- Audited the live profile route and added the result to `UX_AUDIT_2026-08-13.md`.
- Replaced both `Paper` wrappers in the profile editor with semantic `Box` form and aside regions, removing vestigial rounded-card configuration from the implementation.
- Added structural Swiss rule lines to the editor and learning snapshot without changing the existing effective information hierarchy.
- Added stable identifiers for all profile fields and an accessible label relationship for the profile and snapshot regions.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 14 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

The major user-editable forms now use the project’s declared visual language directly. The next highest-value coverage work is making action validation independently testable, followed by reviewing database query efficiency and caching behavior.

## Iteration 07 — 2026-08-13T16:12:30Z

### Completed

- Extracted registration normalization and validation from the Web server action into `@basis-forum/core`, giving account rules one reusable, domain-level source of truth.
- Added typed valid and invalid registration result contracts so callers must handle failure outcomes explicitly.
- Added nine unit-test cases covering input trimming, email lowercasing, valid input, display-name bounds, malformed email addresses, and password length.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

Registration rules are now independently testable. The remaining material quality opportunities are query-path efficiency, route-level error handling, and broader user-flow tests that require a controlled database fixture.
