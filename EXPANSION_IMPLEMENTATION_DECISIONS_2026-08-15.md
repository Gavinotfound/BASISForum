# Complete Expansion: Implementation Decisions

## Scope

The approved expansion contains two coherent product layers: **structured academic community** and **verified editorial publishing**. Both will use the existing Next.js applications, Drizzle/PostgreSQL database, role-aware server actions, persistent Admin portal, and Swiss visual system.

## Sequencing

The implementation will proceed in dependency order:

1. Add shared database tables, indexes, unique constraints, and validation constants.
2. Add cross-feature data access and server-side authorization helpers.
3. Add Bulletin publishing and creator verification because it introduces the editorial status model and homepage feature source.
4. Add academic-help, resolved answers, knowledge cards, hubs, circles, peer review, and mentorship on the shared safety foundations.
5. Add Admin workspaces and public navigation.
6. Add tests, deploy, and verify every state transition.

## Safety decisions

| Area | Launch decision |
|---|---|
| Direct messages | Not included. Study-circle, review, and mentor requests remain bounded records and do not expose private contact details. |
| Scheduling | Publication and homepage features use `starts_at`/`ends_at` query-time eligibility. This avoids a background worker while posts become visible at the correct time whenever the page is requested. |
| Event expiry | Public queries exclude elapsed events; archive status remains explicit and auditable. |
| Privacy | Event location is a short, campus-safe label; no home addresses, attendee directory, or personal phone field exists. |
| Creator authority | Creator/editor/publisher capability is scoped separately from the existing forum role. Verification does not grant moderation privileges. |
| Editorial trust | New Bulletin material defaults to Draft; creator submissions require review; public corrections and internal revision history are retained. |
| Safety controls | Block/mute is private and server-enforced; reports and appeals stay confidential. |
| Feature selection | Homepage placement is human-selected, audit logged, one slot at a time, and never based on views, votes, profiling, or sponsorship preference. |

## Development constraints

The public UI will follow existing strict design requirements: no rounded-card aesthetic, semantic display-mode tokens, compact editorial tables, responsive mobile layouts, and explicit opaque overlays. New form and list components will be added only after schema, core validation, and server actions are in place.

## Migration strategy

A single additive SQL migration will create all new tables and indexes. Existing `threads`, `resources`, users, reports, and campaign settings remain backwards compatible. New columns added to existing tables will use safe defaults or nullable states, then application paths will enforce valid values.

## Verification strategy

Each server workflow will use explicit authorization checks, unique database constraints for race-sensitive transitions, targeted unit tests for shared validation and state guards, strict type checks, lint, sequential builds, and authenticated production smoke tests. Non-destructive UI paths are tested first; any production content creation or moderation mutation will require user confirmation.
