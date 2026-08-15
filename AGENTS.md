# BASISForum Agent Collaboration Protocol

This file is the **binding operating contract** for every coding agent and human contributor working in this repository. Read it before inspecting, editing, testing, committing, or deploying BASISForum.

> **Goal:** Keep `main` continuously deployable, make every change traceable, and prevent parallel work from silently overwriting another contributor’s code.

## 1. Source of truth and non-negotiable rules

GitHub repository: <https://github.com/Gavinotfound/BASISForum>

The remote `main` branch is the sole shared source of truth. No contributor may treat a local checkout, copied archive, or deployed server directory as canonical. Do not commit directly to `main`, force-push `main`, rewrite shared history, or deploy unmerged feature branches.

All behavior must preserve the project’s established constraints:

| Area | Required contract |
|---|---|
| Architecture | pnpm workspace plus Turborepo; Web in `apps/web`, Admin in `apps/admin`, reusable UI in `packages/ui`, pure domain rules in `packages/core`, and persistence/migrations in `packages/database`. |
| UI system | Swiss editorial system: semantic tokens from `packages/ui/src/theme-config.ts`, zero-radius surfaces, rule-based layouts, seven supported modes, responsive 44px touch targets. |
| Forum safety | Two-layer reply model, bounded social interactions, no direct messages/follower mechanics, safe event location labels, and server-side authorization for privileged actions. |
| Database | PostgreSQL via Drizzle; every production schema change requires a new idempotent SQL migration in `packages/database/schema/`. Never modify a migration that has been deployed. |
| Deployment | Only merged `main` is deployable. Production deployment uses the established rsync, sequential build, PM2 restart, and smoke-test sequence. |

## 2. Required start-of-session procedure

Before making any change, run the following commands from the repository root:

```bash
git switch main
git pull --ff-only origin main
git status --short
git log --oneline -5
```

The working tree must be clean before new work begins. Create one focused branch from the newly updated `main` branch:

```bash
git switch -c feat/short-topic
# or: fix/short-topic, refactor/short-topic, docs/short-topic
```

Never work from another contributor’s feature branch. Never run `git reset --hard`, rebase shared branches, or use `git push --force` without explicit repository-owner approval.

## 3. Coordination protocol

Every substantive task must have a GitHub Issue or Pull Request before implementation proceeds. The Issue/PR is the coordination record; do not create a mutable in-repository “current work” file that becomes another merge-conflict hotspot.

Before editing, search active Issues and Pull Requests for overlap. Announce overlap early in the PR or Issue if another contributor is touching any of these shared hotspots:

| Shared hotspot | Coordination requirement |
|---|---|
| `packages/database/schema.ts` and `packages/database/index.ts` | One owner at a time, or agree on exact table/function boundaries before both change it. |
| `packages/database/schema/*.sql` | Each contributor creates a uniquely numbered, idempotent migration. Review SQL before deployment. |
| `packages/ui/src/theme-config.ts` | Coordinate all token or mode changes; never add hard-coded color workarounds in application code. |
| `packages/ui/src/components/index.tsx` or `packages/ui/index.tsx` | Separate component-level work by explicit file/section ownership or sequence it. |
| Auth, shared navigation, server actions, and root routes | State intended files and public behavior in the PR before editing. |
| `NIGHTLY_IMPROVEMENTS.md` | Only the release/deployment owner edits the production verification section. Feature contributors describe changes in their PR instead. |

A PR description must include: user-facing purpose, files/subsystems changed, database migration impact, verification commands/results, screenshots for visual work, and a production/deployment note.

## 4. Quality gate: mandatory before every pull request

Run the complete gate from the repository root. Do not claim completion when any command fails, warns, or has been skipped.

```bash
pnpm test
pnpm lint
pnpm turbo run build --filter=web --filter=admin --concurrency=1
```

The expected baseline is **zero lint warnings**, strict TypeScript production builds, and complete core coverage for modifications to pure domain helpers. New core validators require focused Vitest coverage in `packages/core/index.test.ts`.

For UI work, also inspect affected desktop and mobile breakpoints. For server actions, validate authorization, input bounds, revalidation paths, and meaningful recoverable errors. For database work, test migration idempotency against a non-production database before approval.

## 5. Database and migration rules

Schema changes are high-risk shared work. Follow this order exactly:

1. Define or update Drizzle contracts in `packages/database/schema.ts`.
2. Add a **new** ordered migration file under `packages/database/schema/` using defensive SQL such as `IF NOT EXISTS` where appropriate.
3. Add or update the typed query/mutation API in `packages/database/index.ts`.
4. Update actions and UI only after the persistence contract is clear.
5. Document migration effects in the PR.
6. A designated deployment owner applies the migration to production before application deployment.

Do not use destructive migration statements, modify deployed migration files, expose direct database credentials, or silently rely on local schema drift.

## 6. Commit and pull-request rules

Keep commits narrow, reviewable, and imperative:

```text
feat(web): add accepted-answer callout
fix(database): prevent duplicate circle requests
test(core): cover safe campus location validation
docs: record production smoke verification
```

Commit only intentional source, migration, documentation, and test files. Do not commit `.env` files, `node_modules`, `.next`, `.turbo`, credentials, build outputs, downloaded private data, or production database dumps.

Before opening a PR:

```bash
git status --short
git diff --check
git fetch origin
git rebase origin/main
# rerun the complete quality gate after resolving any conflict
```

Use an ordinary merge or squash merge through GitHub after required review and checks pass. Delete merged feature branches after confirming the merge.

## 7. Production release rules

Only the release owner may perform production actions. A release requires:

1. An approved and merged `main` commit.
2. Passing full quality gate recorded in the PR.
3. Reviewed, idempotent migration if the schema changed.
4. Migration applied before application code.
5. Sequential production Web and Admin builds.
6. PM2 restart and save.
7. Smoke checks for changed public routes and relevant Admin views.
8. A concise production entry in `NIGHTLY_IMPROVEMENTS.md`.

Never “quick-fix” a production server directory without committing the identical change to GitHub first.

## 8. Codex execution prompt

Use the following prompt at the start of any Codex task in this repository:

> You are a contributor to BASISForum. Read and obey `AGENTS.md` before any work. Treat remote `main` as the only source of truth. Start by fast-forwarding local `main`, confirm a clean tree, then work only on a new focused branch. Check active GitHub Issues and PRs for overlapping files before editing. Preserve the pnpm/Turborepo architecture, strict TypeScript, Swiss token system, safety model, and migration rules. Do not edit deployed migrations, commit secrets/generated artifacts, force-push shared branches, merge your own PR, or deploy unless explicitly appointed release owner. Run `pnpm test`, `pnpm lint`, and the sequential Web/Admin build before requesting review. In your final PR summary, state behavior changes, files touched, migration impact, quality results, screenshots where relevant, and release notes.

## 9. Handoff format

Every agent handoff or PR comment must state the following explicitly:

| Field | Required value |
|---|---|
| Branch and base | Feature branch name and current `origin/main` base commit |
| Scope | What changed and what was intentionally left unchanged |
| Shared hotspots | Any shared files or migrations touched |
| Verification | Exact commands run and whether they passed |
| Risks | Migration, authorization, accessibility, responsive, or deployment risks |
| Next action | Review, merge, deployment, or follow-up owner |

If a requirement conflicts with this document, pause and ask the repository owner before proceeding.
