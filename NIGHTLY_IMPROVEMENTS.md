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

## Iteration 08 — 2026-08-13T16:15:30Z

### Completed

- Added global client route-error boundaries to both Web and Admin applications, addressing the audit finding that unexpected route failures had no user-facing recovery path.
- Built concise Swiss-style recovery states with safe retry actions, non-destructive return links, descriptive accessible headings, and no error-stack disclosure to users.
- Logged the underlying error only to the browser console for technical diagnosis.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

The route layer now has loading and error recovery states. The next audit should focus on database query patterns and deliberate caching/revalidation behavior, because this is the remaining area most likely to affect real-user responsiveness as the forum grows.

## Iteration 09 — 2026-08-13T16:18:25Z

### Completed

- Added explicit `id` and `htmlFor` associations for the shared new-discussion subject, title, and detail controls.
- Added an accessible label to the shared comment editor, preserving the compact visual design while making its purpose available to assistive technologies.
- Kept all validation constraints and existing form behavior unchanged.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

The primary authoring controls now have explicit accessible names. Future accessibility work should concentrate on full keyboard-flow verification and live-region feedback after server actions, which benefits from browser-based interaction tests.

## Iteration 10 — 2026-08-13T16:23:27Z

### Completed

- Removed the final explicit `any` annotations from authored source code by introducing a shared `ForumUser` UI contract and using `unknown` for database JSON metadata at the system boundary.
- Added runtime-safe parsing of reply metadata before it is consumed by the two-layer discussion renderer, protecting the UI from malformed or legacy JSON without weakening the public metadata type.
- Confirmed that all authored TypeScript and TSX files are free of explicit `any` annotations; generated Next.js artifacts are excluded from this result.

### Verification

| Check | Result |
|---|---|
| Authored-source explicit-`any` scan | Passed: none found |
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

The project now has strict application builds, no explicit untyped escape hatches in authored source, and guarded JSON consumption at the UI boundary. Further improvements should target data-path scalability or add controlled integration fixtures rather than broad type cleanup.

## Iteration 11 — 2026-08-13T16:26:30Z

### Completed

- Extended `getThreads` with optional indexed author, subject, and thread-ID filters while retaining the original sorting API for existing callers.
- Replaced in-memory filtering in profile-thread and bookmarked-thread retrieval with database-level author and primary-key filtering.
- Applied the existing subject index directly in thread search before content matching, reducing unnecessary thread hydration and vote/comment summary work for category-scoped searches.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Audit Note

Profile, bookmark, and subject-filter pathways now use their supporting schema indexes. The homepage remains intentionally unpaginated for the current small community; introducing pagination requires a deliberate product-level UX decision so older discussions are not silently hidden.

## Iteration 12 — 2026-08-13T16:31:00Z

### Final Production Verification

- Confirmed the deployed forum homepage responds after the final PM2 restart and retains the intended Swiss thread-grid interface.
- Confirmed the registration route remains reachable through a text-only fallback after a one-off interactive browser timeout; it returned the expected application shell and loading state.
- Verified the repository now contains eleven focused, clean commits spanning linting, test infrastructure, strict typing, accessibility, resiliency, UX, and indexed query performance.

### Achieved Quality Gates

| Gate | Final State |
|---|---|
| Git working tree before verification record | Clean |
| Core unit tests | 23 passing, 100% core coverage |
| Monorepo lint | Passing with zero warnings |
| Web and Admin production builds | Passing with strict type validation enabled |
| Authored explicit `any` annotations | None |
| PM2 production processes | Web and Admin online after latest restart |

### Remaining Deliberate Product Decisions

Pagination, cursor design, and a controlled database-backed integration test fixture remain worthwhile future work, but each changes forum-product behavior or test-environment architecture rather than correcting a defect. No critical, safe, independently actionable issue remains in the current codebase audit.

## Iteration 13 — 2026-08-14T00:57:20Z

### Completed

- Added the approved **Archive**, **Verdigris**, and **Sakura** display modes to the centralized `themeModes` configuration; all selector labels and persisted-mode validation derive from this single source of truth.
- Replaced the legacy color-named `navy` role with semantic `interactive` and `interactiveHover` tokens throughout shared Material UI styling, global native-control CSS, and the Admin active-navigation rule.
- Updated Web and Admin server-side cookie parsing to use the shared `isDisplayMode` guard, so every configured display mode survives a full request without falling back to Dark.
- Preserved the existing Dark, Light, Low Contrast, and AMOT token values and interaction behavior while giving new modes their own purposeful accents: Archive blue-teal, Verdigris teal, and Sakura pink.
- Validated the approved themes’ text, metadata, divider, interactive, and destructive contrast pairs with the repository contrast checker.

### Verification

| Check | Result |
|---|---|
| Archive contrast pairs | Main text 14.62:1; interactive button text 6.37:1 |
| Verdigris contrast pairs | Main text 16.07:1; interactive button text 5.16:1 |
| Sakura contrast pairs | Main text 16.23:1; interactive button text 6.55:1 |
| Legacy token and manual mode-allowlist scan | Passed: none found |
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Follow-up Note

The selector now offers seven mode entries. Future additions should be treated as explicit product decisions rather than incremental palette accumulation, so the interface remains concise and the theme system retains its editorial discipline.

## Iteration 14 — 2026-08-14T01:01:00Z

### Production Regression Repair

- The first production smoke check exposed a server-rendering regression: importing `isDisplayMode` through the UI package’s client-marked root entry caused Next.js to reject the function call from Web and Admin server components.
- Moved both server-side imports to the pure `@basis-forum/ui/src/theme-config` module, retaining the same guard while keeping the UI root entry client-only.
- The repair is deliberately minimal and restores persisted display-mode SSR without changing the approved mode tokens or selector behavior.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed |
| Sequential production builds with strict type validation | Passed for Web and Admin |

### Deployment Note

The initial theme release is superseded by this repair commit. The repaired build must be redeployed and smoke-tested before the new modes are declared live.

### Repaired Deployment Verification

- Rebuilt and restarted both PM2 services after the repair; `basis-forum-web` and `basis-forum-admin` are online.
- The live Web service returned HTTP 200 without the route-error fallback.
- Direct server rendering with `basis_display_mode=archive`, `verdigris`, and `sakura` each returned a healthy page and emitted its configured palette token, confirming persisted-mode SSR support for all approved modes.
- The external interactive browser navigation timed out once after the restart, but the direct HTTP and server-rendered palette checks completed successfully and showed no current application error.

## Iteration 15 — 2026-08-14T01:48:42Z

### Completed

- Completed a responsive visual audit at 320px, 375px, 768px, 1366px, and 1920px across the public index and login surfaces, with source-level review of authenticated discussion, profile, search, and Admin interfaces.
- Rebuilt the shared header as a two-tier mobile composition and a compact single-row tablet/desktop composition, removing clipped utility controls at narrow widths.
- Added fluid shared page gutters and bounded wide-screen content widths so the interface uses 1920px canvases intentionally without losing editorial hierarchy.
- Reworked the mobile discussion index: sorting now occupies its own row, compact rows prioritize category/title/replies, and the full metadata grid returns at desktop widths.
- Improved responsive profile fields, subject controls, nested-reply indentation, discussion composer rhythm, and search-filter progression.
- Replaced the Admin queue’s forced 760px mobile table with stacked moderation records below the medium breakpoint; desktop retains the dense table view.
- Created `RESPONSIVE_AUDIT_2026-08-14.md` with evidence, findings, specific changes, and verification limitations.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: 23 tests, 100% core coverage |
| `pnpm lint` | Passed with zero warnings |
| Strict sequential production build | Passed for Web and Admin |
| Post-change local visual checks | Passed at 320px, 375px, 768px, and 1920px |

### Live Deployment Verification

- Deployed the responsive release with sequential strict Web/Admin builds and PM2 restarts; both services are online.
- Re-captured the public index with live data at 320px and 1920px. The former mobile clipping and sort/header collision are absent, while the expanded wide-screen grid remains bounded and readable.

## Iteration 16 — 2026-08-14T04:00:19Z

### Completed

- Ran post-deployment mobile-device emulation with iPhone 13-style and Pixel 5-style viewport, device scale factor, coarse pointer, and touch input profiles.
- Verified touch-driven vertical scroll movement on both profiles, with no horizontal document overflow at 390px and 393px viewports.
- Identified 38px top navigation buttons as the only confirmed compact touch-target issue and raised their mobile hit area to 44px.
- Raised the actual MUI input-root and outer hit containers for compact language and display-mode selectors to 44px; DOM hierarchy diagnostics confirmed the visible text node is smaller but the actionable parent receives the full 44px target.
- Added `MOBILE_DEVICE_EMULATION_AUDIT_2026-08-14.md` documenting measurements, limitations, and recommended physical-device follow-up.
- Deployed the fix after successful 23-test, zero-warning lint, and strict sequential Web/Admin build gates.

## Iteration 17 — 2026-08-14T04:35:38Z

### Completed

- Eliminated report spam at three layers: the report modal closes and disables after successful submission, the server action returns a clear existing-report message, and a partial production database uniqueness index now allows only one pending report per reporter and target.
- Safely consolidated production report spam before enforcing the index: the deduplication migration retained the earliest pending report and removed six duplicate records from the affected queue entry.
- Reworked reply submission to return structured success state instead of interrupting the stateful form with a server redirect. The discussion composer now reloads the revalidated thread at the newly created comment anchor, preserving the existing two-layer flattening behavior and `@author` metadata.
- Made Dialog, Autocomplete, Tooltip, Snackbar, Menu, and Popover surfaces explicitly opaque through the shared token-driven Material UI theme.
- Verified 23 unit tests at 100% core coverage, zero-warning lint, and strict sequential Web/Admin production builds.

### Production verification

The deduplication migration removed six duplicate pending report rows, left one canonical report for the affected target, and established the partial uniqueness index. The report dialog was visually confirmed opaque after deployment. A user-approved labelled verification reply was submitted beneath floor `#1`; it persisted, reloaded at its comment anchor, and rendered as a second-layer response.

## Iteration 18 — 2026-08-14T05:05:45Z

### Bookmark recovery

- Diagnosed the live Save failure as a stale Next.js server-action reference after deployment (`Server Reference ID did not match the expected format`), which could drive the active route into its recovery boundary.
- Replaced the build-specific bookmark server-action transport with an authenticated `POST /api/bookmarks/[threadId]` endpoint. The endpoint validates the signed-in user and target thread, toggles the database bookmark, revalidates the saved-list and thread paths, and returns a structured JSON error instead of allowing an unhandled route error.
- Updated the client Save control to use the stable endpoint and show recoverable network or API errors in place; it no longer depends on a stale server-action identifier.
- Passed 23 unit tests at 100% core coverage, zero-warning lint, and strict sequential Web/Admin builds. The production save/unsave and saved-list smoke checks remain scheduled immediately after deployment.

### Follow-up stabilization

The live API endpoint successfully returned `{ "bookmarked": true }` and persisted the bookmark, confirming the route repair. The final client follow-up removes `useTransition` from the imperative fetch path and uses an explicit `isSaving` state with `try`/`catch`/`finally`, preventing a completed save request from leaving the button permanently disabled. The full test, lint, and strict Web/Admin build gates passed again.

### Production smoke confirmation

After the final deployment, an authenticated Playwright smoke test logged in as the test account and exercised the exact forum Save control plus `/bookmarks`: saving returned HTTP 200 and changed the article control to **Saved**; the discussion appeared in the saved list; unsaving returned HTTP 200, restored **Save**, and removed the discussion from that list. The harness completed with `login`, `saved`, `listed`, `unsaved`, and `removed` all set to `true`.

### Theme, reply hierarchy, and campaign-slot release

- Repaired light-mode readability leaks in the discussion header, comment body, and vote controls by replacing hard-coded dark-theme values with centralized semantic CSS tokens. Archive now measures **14.62:1** main-text contrast and Sakura **16.23:1** against their backgrounds; their muted text remains above 5.7:1.
- Corrected the floor grouping rule: replies to a floor remain visible below that floor, while only truly third-or-deeper legacy records are flattened back to the floor and annotated with `@author` context.
- Added a modular `forumCampaignSlot` configuration object plus an optional top-of-index campaign module. It supports `cinematic` monochrome-plus-accent, `swiss-grid`, and `widescreen-photo` templates; swapping templates, copy, target link, or sponsor designation requires only a configuration edit. The default uses a generated independent-cinema 21:9 auditorium still with a text-safe left field.
- Verification passed: 23 core tests at 100% coverage, zero-warning lint, and strict sequential Web/Admin production builds.

- Production smoke testing also exposed that direct thread loads did not seed the selected display mode from the `basis_display_mode` cookie. The thread route now passes the validated cookie mode into `BasisProvider`, eliminating dark-default flashes and ensuring Archive/Sakura foreground tokens apply before hydration.

- Final deployment smoke testing caught a server-component boundary error caused by importing `isDisplayMode` through the client-facing UI barrel. The thread route now imports the pure validator directly from `@basis-forum/ui/src/theme-config`, matching the homepage’s proven server-safe pattern; strict Web type checking and lint pass again.

- Final production validation passed. A browser run seeded with the same local preference as the display selector measured Archive at `rgb(247, 240, 227)` background with `rgb(21, 33, 29)` thread text, and Sakura at `rgb(255, 246, 248)` background with `rgb(42, 20, 32)` thread text. The live hierarchy check confirmed three second-layer replies render directly beneath floor #1, including the flattened `@test` legacy reply. The homepage serves the campaign headline and the widescreen image returns HTTP 200.

### Persistent Admin campaign management

A singleton `campaign_settings` record and idempotent migration now store the live top-forum placement. The Admin portal includes an administrator-only campaign editor for visibility, template, community/sponsor label, eyebrow, title, copy, CTA, destination, accent, and widescreen image source. Server-side validation constrains template and kind choices, text limits, URLs, image sources, and hex accents; every saved change creates a moderation log entry and revalidates the homepage. The Web index now reads the persistent record rather than a source-level campaign object. The full test suite, zero-warning lint gate, and strict sequential Web/Admin build all passed.

- Live campaign-management smoke verification passed under the administrator session. Saving the unchanged seeded campaign returned the in-portal success state, persisted the singleton row, wrote the `campaign_update` moderation log, and left the public homepage campaign headline and CTA visible after revalidation.

### Identifiable reply-to-reply context

The reply hierarchy audit confirmed that second-layer records already persisted and rendered, but the prior minimal `@author` marker made a flattened response difficult to identify. Flattened replies now display a dedicated `IN REPLY TO @AUTHOR` cue with a one-line quoted excerpt of the original target. New deeper replies also persist that excerpt in reply metadata, while legacy records derive it from their direct parent. The normal thread path again receives the selected display mode from the server, so this cue remains readable in every palette. Full tests, lint, and strict production builds pass.

- Approved end-to-end production verification passed: the test account selected second-layer comment `37131471-5430-4936-ab5f-fc670fd193d7`, the composer retained that exact parent ID, and the posted verification message rendered beneath floor #1 with `IN REPLY TO @TEST` and its quoted target context. The reply-to-reply path is now both functional and identifiable.

### Nested reply visual-surface repair

A production DOM and computed-style audit confirmed that the affected nested reply content was present but rendered against an ambiguous transparent Paper/hover surface. Second-layer replies now use an explicit semantic surface, force readable foreground and caption colors, and add a high-contrast `REPLY TO FLOOR #…` identity strip. This removes the visually blank card state across all display modes. Full tests, lint, and strict Web/Admin production builds pass.

The final nested-reply visual repair replaced the affected Material UI Paper wrapper with a plain semantic article surface. This eliminates the generated Paper layer implicated in the visually blank child card, retains the Swiss rule-based layout, and preserves explicit background, foreground, floor, author, and recipient-context styling.

A follow-up compositor audit added explicit stacking isolation to nested replies and elevated every direct article child above inherited layers. This prevents an overlapping visual layer from masking nested author or body text while retaining the semantic surface and Swiss divider structure. Full quality gates pass.

The final visual diagnostic proved that an elevated foreground renders correctly above the affected nested-card mask. The permanent component contract now applies that elevated paint order to nested reply boxes, typography, and controls, preserving the regular semantic colors while preventing blank child surfaces. The complete test, lint, and strict-build gate passes.

Final production visual verification confirmed the nested reply no longer renders as a blank grey field: the black semantic surface visibly displays the `REPLY TO FLOOR #1` strip, author, timestamp, body text, vote controls, and report action.

### Bounded UI-aesthetics loop

This loop captured desktop and mobile dark, Archive, and Sakura baselines; corrected campaign accent foregrounds for Admin-configurable light accents; reinforced Swiss-grid campaign text contrast; made mobile category and reply metadata semantic and scanable; and made selected sort state explicit. The full test, lint, and strict sequential build gate passed. An independent stop-gate reviewer found no further objectively compelled UI changes under readability, responsive layout, accessibility, or Swiss-system consistency criteria; speculative styling changes are intentionally stopped.

Production smoke confirmation: the deployed Archive mobile homepage now renders a visible `PROGRAM / 01` accent module, high-contrast campaign title, explicit selected sort state, and scanable category/reply metadata with no horizontal overflow.


## Iteration 19 — 2026-08-15T08:40:29Z

### Complete forum expansion

- Added the idempotent `07_complete_forum_expansion.sql` migration and Drizzle contracts for verified creator publishing, editorial revisions and events, homepage Bulletin features, report appeals, user blocks, accepted-answer resolutions, curated knowledge cards, finite Study Hubs and Study Circles, peer-review exchanges, and mentor verification.
- Built **BASIS Bulletin** as a verified-creator workflow: creators request access, create drafts, submit them for review, and publish only after administrator approval. Public Bulletin index and story routes include bylines, revision-aware editorial content, safe event metadata, and a controlled homepage feature placement.
- Added structured academic help threads with an explicit post type, assignment context, and “what have you tried?” prompt. Question authors and moderators can mark a reply as the accepted answer; the resolution is persisted and visibly labelled in the discussion floor.
- Completed user safety controls with per-user blocking. Blocked authors’ replies are excluded from the blocker’s thread retrieval, while the floor interface presents an unambiguous block/unblock control. The existing reporting and report-appeal data model remains available for moderation workflows.
- Built the public **Study Center** around deliberate, finite interactions: time-bounded 2–12 member Study Circles, actionable peer-review exchanges created from review-request threads, administrator-curated Study Hubs, and opt-in verified mentorship without direct messages, following lists, attendee lists, or feed mechanics.
- Added a public **Knowledge Base** route for reviewed cards and a signed-in proposal workflow. Cards remain drafts until approved through the administrator queue.
- Expanded the Admin portal with a unified academic operations desk for knowledge-card curation, Study Hub drafting and publication, and mentor-verification decisions, in addition to the Editorial Desk’s creator-verification and Bulletin-review queues.
- Extended the shared navigation and responsive layout contracts for Bulletin, Study Center, Creator Desk, and Knowledge Base routes. All new screens retain the rule-based Swiss visual system, semantic theme tokens, mobile overflow containment, and 44px navigation targets.
- Added automatic peer-review record creation for structured review-request threads, including rubric validation and an optional safe HTTPS work link.
- Refactored the academic review queue shell outside render to comply with React static-component rules, and removed all resulting lint warnings.

### Verification

| Check | Result |
|---|---|
| `pnpm test` | Passed: **53 tests** |
| Core V8 coverage | **100%** statements, branches, functions, and lines |
| `pnpm lint` | Passed with **zero warnings** |
| Strict Web TypeScript check | Passed |
| Strict Admin TypeScript check | Passed |
| `pnpm turbo run build --filter=web --filter=admin --concurrency=1` | Passed sequentially for Web and Admin |
| New production routes included in build | `/bulletin`, `/bulletin/[slug]`, `/creator`, `/knowledge`, `/study`, `/threads/[slug]` |

### Deployment status

The complete expansion has passed all local quality gates and is ready for the idempotent production database migration, rsync deployment, sequential production build, PM2 restart, and live smoke verification. No production schema or application changes have been applied in this iteration yet.

### Follow-up audit note

The feature surface is now complete for the requested bounded community model. The remaining work is operational rather than architectural: deploy the verified source, apply the migration exactly once using its idempotent contract, and smoke-test public empty states and the administrator queues against the live service.
