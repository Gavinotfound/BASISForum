# Proposal: BASIS Bulletin — Verified-Creator News and Events

**Recommendation.** Add a separate editorial surface named **BASIS Bulletin** at `/bulletin`, rather than turning the existing discussion index into a news feed. It would publish verified-creator stories, school-community announcements, and time-bounded events in a deliberately editorial format. Discussion remains open and student-led; Bulletin content is attributable, reviewed, and versioned.

> **Core distinction:** A forum thread asks the community to think together. A Bulletin post makes an attributable editorial or event claim that must have a clear owner, publication state, and correction path.

This separation keeps the current Swiss forum index focused while giving creators a credible publishing home. It also follows the common institutional workflow of **Draft → Review → Published → Archived**, with writers unable to publish their own content by default.[1] [2]

## Product model

| Surface | Audience and purpose | Content types | Interaction model |
|---|---|---|---|
| **Forum** | All registered students; peer explanation and discussion. | Threads, replies, study help. | Existing bounded replies, votes, reports, bookmarks. |
| **BASIS Bulletin** | Readers, verified creators, editors, and administrators; attributable community information. | News story, event notice, announcement, editorial update. | Read, bookmark, share link, and open a linked forum discussion. |
| **Creator Desk** | Verified creators and editors; private production work. | Drafts, review notes, scheduled posts, revisions. | Draft, submit for review, revise, schedule, publish, archive. |
| **Editorial Desk** | Editors and administrators; governance and calendar. | Review queue, corrections, event deadlines, creator verification. | Approve, request changes, schedule, unpublish, archive, audit. |

The public Bulletin landing page should use a high-density editorial hierarchy: a single lead item, an event rail, a reverse-chronological news column, and subject or campus tags. It should reuse BASISForum’s thin rules, monochrome type hierarchy, and semantic theme tokens—**not** cards, recommendation feeds, or infinite scroll.

## Creator verification without overloading forum roles

Do not make `creator` a new global user role. Existing `student`, `teacher`, `moderator`, and `admin` permissions serve account and moderation needs; editorial authority should be modeled as **scoped capability**. This allows a student journalist to publish drafts without gaining moderation access and allows a teacher or club officer to own an event notice without gaining editorial approval authority.

| Editorial capability | Typical holder | Allowed actions | Never allowed by this capability alone |
|---|---|---|---|
| **Creator** | Student journalist, club representative, teacher, school office contact. | Create and edit own drafts; submit for review; view own review notes. | Publish, schedule, verify other creators, moderate forum users. |
| **Editor** | Approved student editor or staff adviser. | Review assigned submissions; request changes; approve editorial quality; propose schedule. | Self-verify creators; bypass administrator audit; change account roles. |
| **Publisher** | Administrator or designated staff adviser. | Publish, unpublish, archive, schedule, handle corrections. | Remove moderation audit history. |
| **Creator verifier** | Administrator only in phase 1. | Approve, suspend, or expire creator profiles. | Grant broader Admin permissions through creator verification. |

A public badge should say **VERIFIED CREATOR**, with a plain-language disclosure such as `Student Publication`, `Approved Club`, `Faculty/Staff`, or `School Office`. It should never expose phone numbers, private school data, a home address, follower counts, or any third-party verification material.

## Required publishing workflow

The first release should intentionally use a fixed, comprehensible workflow. Institutional content systems caution against creating overly complex workflows unless there is a genuine operational need; four core states are enough for BASISForum’s launch.[1] [2]

```text
DRAFT
  └─ creator saves privately

IN REVIEW
  └─ editor adds review notes or approves

SCHEDULED / PUBLISHED
  └─ publisher sets a future time or publishes immediately

ARCHIVED
  └─ retained and linkable, but excluded from current Bulletin index
```

`CHANGES REQUESTED` may be represented as `IN REVIEW` plus a required review note during the first release, avoiding an extra workflow state. Every public edit should create a revision snapshot. A correction should appear as a visible `CORRECTED` label with an optional correction note, rather than silently replacing the original statement.

| Action | Actor | Audit entry | Public effect |
|---|---|---|---|
| Save draft | Creator | Revision and timestamp. | None. |
| Submit for review | Creator | Submission event. | None. |
| Request changes | Editor | Note, reviewer, timestamp. | None. |
| Publish or schedule | Publisher | Publication action, publisher, time. | Story or event becomes public. |
| Correct or unpublish | Publisher | Reason and prior revision retained. | Correction label or withdrawal notice. |
| Archive | Publisher or scheduled job | Archive action. | Leaves current index; remains in archive. |

## News and event schemas

The following additions fit the existing Drizzle/PostgreSQL package and Admin audit model. They deliberately avoid user-to-user messaging and do not create a social graph.

| Entity | Essential fields | Notes |
|---|---|---|
| `creator_profiles` | `user_id`, `type`, `status`, `display_name`, `verified_by`, `verified_at`, `expires_at`, `suspension_note`. | One profile per user; types: student_publication, club, faculty_staff, school_office. |
| `editorial_posts` | `id`, `slug`, `headline`, `dek`, `body`, `kind`, `status`, `author_id`, `editor_id`, `publisher_id`, `published_at`, `scheduled_at`, `archived_at`, `correction_note`, `discussion_thread_id`. | Kinds: news, announcement, event, editorial_update. |
| `editorial_post_revisions` | `post_id`, `revision_number`, `content_snapshot`, `status`, `created_by`, `review_note`, `created_at`. | Preserves accountability and allows a private forward revision while the current story remains live. |
| `editorial_events` | `post_id`, `starts_at`, `ends_at`, `timezone`, `location_label`, `registration_url`, `capacity_note`, `organizer_contact_label`. | `location_label` is campus-safe, e.g., `Library Seminar Room`; never a home address. |
| `editorial_tags` + joins | `name`, `slug`; post/tag relationship. | Supports News, Events, Academics, Arts, Athletics, Clubs, Community, and subject tags. |
| `editorial_creator_requests` | `requester_id`, `requested_type`, `statement`, `status`, `reviewed_by`, `review_note`. | Keeps verification requests out of generic reports. |

The database package should expose query methods for a lead story, chronological index, events window, archive, creator drafts, review queue, and schedule queue. All mutations should write `moderation_logs` with target type `editorial_post` or `creator_profile`.

## Events: useful but privacy-protective

Events are a distinct post type because their usefulness depends on time, status, and expiry. The public event card should show only what a student needs to decide whether to attend: title, date/time, time zone, general location label, organizer type, registration destination, and a clear `CANCELLED` or `UPDATED` state.

Youth-platform guidance recommends minimizing personal data and using protective defaults.[4] Accordingly, the initial event model should apply these rules:

| Rule | Decision |
|---|---|
| Personal contact information | Do not publish it. Use an official public link or a neutral organizer label. |
| Location | Allow only approved campus/general labels; reject residential addresses and live location. |
| RSVP | Link to a school-approved registration page or expose a simple interest count only; no attendee directory. |
| Recurrence | Do not build recurrence in phase 1; duplicate event notices deliberately until operational demand is proven. |
| Expiry | Auto-archive after the end time and retain it only in a past-events archive. |
| Sponsorship | If a post is sponsored or partnered, display a clear disclosure; do not target students based on behavior. |

## Public and Admin experience

### Public Bulletin

`/bulletin` should be a concise news landing page with `NEWS`, `EVENTS`, and `ARCHIVE` sections. A story page at `/bulletin/[slug]` should use a masthead, author attribution, verified creator disclosure, published/updated times, source list, event metadata when applicable, and a single `DISCUSS THIS STORY` link to a conventional BASISForum thread. This keeps the two-layer reply system and community moderation in one place rather than duplicating comments under articles.

### Creator Desk

`/creator` is visible only to verified creators and editors. It should contain a compact draft list, `NEW STORY` and `NEW EVENT` actions, a status column, last updated time, and review-note indicator. A creator can edit only their own drafts and withdrawn submissions. It does not show community analytics, rankings, or popularity metrics.

### Editorial Desk in Admin

The existing Admin portal gains an **Editorial** navigation area with three dense tables: `Review Queue`, `Schedule`, and `Creator Verification`. The schedule should work as an editorial calendar showing publish dates, event dates, owner, state, and deadline—an approach consistent with institutional calendar guidance.[3] A first version can be a chronological week list rather than a drag-and-drop calendar.

## Governance and safety requirements

A verified creator area must be a governance system, not merely a “verified badge.” Youth moderation guidance stresses clear harmful-content definitions, rapid review, and continuous operational evaluation.[4] The minimum governance policy should define:

| Policy topic | Minimum rule for launch |
|---|---|
| Verification | An Admin manually confirms a creator’s affiliation or portfolio and records a time-bounded approval. |
| Editorial standards | Factual claims need attributable sources; opinion is labelled; promotional content is disclosed. |
| Review SLA | Define an achievable internal target, such as review within two school days; do not promise real-time review. |
| Correction | Any verified factual correction receives a dated correction label and preserved revision. |
| Removal | Publisher can unpublish urgent harmful or inaccurate content; the action and reason remain in the audit log. |
| Appeals | Creator can request reconsideration through an editorial request record, not a public thread. |
| Events | No home locations, personal numbers, or attendee lists. Event fields are subject to the same report process as posts. |
| Creator conduct | Abuse of verified status can suspend the creator profile without changing the user’s forum account role. |

## Phased delivery plan

| Release | Build scope | Explicitly deferred |
|---|---|---|
| **E1 — Bulletin foundation** | Database schema, creator verification requests, Draft/Review/Published/Archived workflow, news posts, `/bulletin`, Creator Desk, Admin review queue, revision audit. | Events, scheduling, rich embeds, external creator accounts. |
| **E2 — Events and editorial calendar** | Event fields, upcoming/past events index, schedule queue, cancellation/correction labels, source disclosure. | Recurrence, RSVP lists, maps, direct chat. |
| **E3 — Editorial maturity** | Scheduled publishing, forward revisions, source-list validation, creator profile expiry review, Bulletin archive filters. | Behavioral recommendation engine, engagement statistics, public creator follower counts. |

## Recommendation

Build **E1 first**. It is both feasible and genuinely useful: student journalists, club representatives, teachers, and school offices can submit drafts; verified editors can review; administrators can publish; the entire community can read a stable Bulletin and take debate back to the forum. The events system should be E2 because time and location handling require its own safety and operational rules.

## References

[1]: https://dxtraining.iowa.gov/content-types/content-moderation-workflow "Iowa Department of Management — Content Moderation Workflow"
[2]: https://sitebuilder.princeton.edu/content/draft-content-publishing-and-moderation "Princeton Site Builder — Draft Content, Publishing, and Moderation"
[3]: https://comms.msu.edu/social-media/social-media-resources/editorial-calendars "Michigan State University — Editorial Calendars"
[4]: https://better-internet-for-kids.europa.eu/en/dsaforyouth-toolkit/moderation-keeping-platforms-safe-and-respectful "European Commission — Moderation: Keeping Platforms Safe and Respectful"
[5]: https://www.ntia.gov/report/2024/kids-online-health-and-safety/online-health-and-safety-for-children-and-youth/taskforce-guidance/recommended-practices-for-industry "NTIA — Recommended Practices for Industry"


## Homepage placement: Featured from Bulletin

Approved Bulletin posts should be able to appear on the forum homepage through a single, editor-controlled **FEATURED FROM BULLETIN** module. This is a strong way to surface good reporting or urgent event information without turning the homepage into an algorithmic feed.

The placement belongs **below the optional campaign slot and above the forum index controls**. It therefore has a clear editorial role without displacing the campaign system or interrupting the normal thread scan. If the campaign slot is disabled, Featured from Bulletin becomes the primary opening module; if both are disabled, the current forum index begins as it does today.

| Homepage element | Rule |
|---|---|
| Label | Always show `FEATURED FROM BULLETIN`, the post type, and published or updated date. |
| Attribution | Show the verified creator name and creator type, for example `Student Publication · Verified Creator`. |
| Content | Headline, concise dek, one `READ THE STORY` action, and optional event date. |
| Visual system | Editorial rule layout, no card chrome, no popularity count, no comment count, and no recommendation controls. |
| Selection | Chosen manually by an editor or publisher from already published, non-archived content. |
| Duration | Optional start/end dates; otherwise the item remains featured until explicitly replaced. |
| Corrections | A corrected article keeps a visible `CORRECTED` label in the module. An unpublished or archived article is automatically removed. |
| Sponsorship | A sponsored or partner post must retain its disclosure in the homepage placement; it cannot be featured as ordinary editorial content. |

### Governance

Feature selection must be a documented editorial act, not a reward for engagement. An editor or publisher should select items using usefulness, timeliness, verification status, and relevance to the student community. View count, vote score, creator seniority, or advertiser preference must not determine placement. This protects the youth-facing product from the engagement-maximizing or targeted-promotion patterns that the platform’s safety model avoids.[5]

| Who | Feature permission |
|---|---|
| Creator | Cannot feature their own work. |
| Editor | Can propose an eligible published post for feature. |
| Publisher / Admin | Can set, schedule, replace, or remove the live homepage feature. |
| System | Removes expired, unpublished, or archived items automatically. |

### Data and workflow extension

Use a dedicated singleton-style `editorial_homepage_features` record rather than an `is_featured` boolean on posts. This keeps homepage selection auditable, supports timed campaigns, and guarantees one primary placement.

| Field | Purpose |
|---|---|
| `slot` | Primary key, initially fixed to `forum_home_primary`. |
| `post_id` | References an eligible published `editorial_posts` record. |
| `starts_at`, `ends_at` | Optional scheduling window. |
| `featured_by` | Editor/publisher who selected the item. |
| `selection_note` | Private editorial rationale. |
| `created_at`, `updated_at` | Audit and operational review. |

The Admin Editorial Desk should expose a `Homepage Feature` panel showing the live item, scheduled replacement, eligibility checks, and a concise selection history. Each change writes an `editorial_feature` moderation log action. The public homepage query loads the active feature in the same server pass as campaign settings and the thread index.

### Revised release plan

| Release | Added scope |
|---|---|
| **E1 — Bulletin foundation** | Creator verification, news posts, review workflow, Creator Desk, Admin review queue, **Featured from Bulletin selection and homepage rendering**. |
| **E2 — Events and calendar** | Event records, schedule queue, cancellation labels, and event-aware featured placement. |
| **E3 — Editorial maturity** | Scheduled feature rotations, forward revisions, correction handling, and feature-selection history. |

This feature should ship with E1 because it lets the new editorial system visibly contribute to the forum homepage from day one while retaining accountable human selection.
