# BASISForum Functionality Roadmap

**Purpose.** BASISForum already covers the essential forum loop: accounts, subject threads, bounded replies, votes, bookmarks, notifications, search, reports, moderation, and an Admin operations portal. The next stage should deepen **academic usefulness and safety**, not add generic social-network mechanics. The recommendations below prioritize structured help, durable knowledge, and opt-in peer support while preserving a youth-appropriate, low-distraction forum.

> **Product principle:** Build features that help a student ask a clearer question, receive a more useful explanation, return to a trustworthy answer, or find a bounded academic support relationship. Do not add features whose primary job is to maximize time on site.

## Prioritized roadmap

| Priority | Functionality | Student value | Existing foundation | Delivery effort | Key safeguard |
|---|---|---|---|---|---|
| 1 | **Resolved answers and answer quality states** | Makes a solved homework or concept question easy to recognize and revisit. | Threads, replies, votes, notifications, Admin. | Medium | Author can mark an answer as resolved; moderators can reverse misuse; no popularity leaderboard. |
| 2 | **Structured academic-help templates** | Improves question quality by prompting students for subject, level, what they tried, and the precise point of confusion. | New-thread form, subjects, search, reports. | Small | An academic-integrity prompt discourages answer-only requests and supports report reasons. |
| 3 | **Safety controls: mute/block, report outcomes, and appeal notes** | Gives students practical control over unwanted interactions and makes moderation more legible. | Users, reports, notifications, moderation logs, Admin. | Medium | Block is private; reports remain confidential; appeals are moderator-visible only. |
| 4 | **Curated knowledge cards** | Converts strong resolved threads into compact, searchable study references. | Threads, replies, bookmarks, campaign, Admin. | Medium | A curator or moderator approves publication; provenance links back to the original discussion. |
| 5 | **Exam hubs and guided study prompts** | Creates finite, subject-specific spaces for review without infinite social feeds. | Campaign slot, subjects, pinned threads, Admin. | Medium | Time-bounded hubs with explicit opening/closing dates and moderation ownership. |
| 6 | **Opt-in study circles** | Helps students find a small, bounded study session around a subject or assessment. | Profiles, subjects, notifications, moderation. | Medium–High | No direct messaging by default; use request-and-accept workflow, time window, capacity, and reportability. |
| 7 | **Peer-review exchange** | Enables structured feedback on essays, lab reports, presentations, and code. | Threads, replies, profiles, reports. | High | Rubrics, consent, no public grades, author controls, and clear rules for personal data. |
| 8 | **Verified peer mentor directory** | Provides a lightweight pathway to ask experienced students for academic guidance. | Roles, profiles, favorite subjects, Admin. | High | Opt-in verification, training acknowledgement, subject/grade limits, periodic review, no default private chat. |

## 1. Resolved answers and answer quality states

The most valuable near-term feature is a **resolved-answer lifecycle**. On a help-oriented thread, the author can mark one reply as “Resolved” once it addresses the question. The marked reply receives a compact `RESOLVED` label and moves directly below the original floor; the rest of the discussion remains intact. A second optional state, `NEEDS SOURCE`, lets a moderator or topic steward flag a factual answer that should be supported before being treated as reference material.

This does not turn BASISForum into a reputation contest. It instead gives a question a clear learning outcome: students can identify whether a thread is still open and locate the explanation that helped. The existing resources and votes model, notification system, and Admin workflow make this a direct extension. It supports the recommendation that forums use clear expectations and facilitation rather than merely accumulating replies.[1] [2]

**Implementation shape.** Add an `answer_status` field to replies or an `accepted_reply_id` field to threads; add a server action limited to the thread author and moderators; emit a resolution notification to the selected answer’s author; add `resolved` and `open` filters to search. This is the recommended **first build**.

## 2. Structured academic-help templates

BASISForum should offer a `Help request` thread type alongside open discussion. The form should collect a concise prompt, subject, course level, optional due-date sensitivity, **what I already tried**, and **where I am stuck**. The resulting thread header can show `HELP REQUEST`, `WHAT I TRIED`, and `LOOKING FOR` as small editorial metadata—not cards.

This feature improves the quality of both questions and replies without requiring a new social graph. It follows academic discussion guidance that prompts should be focused, clear, and aligned to a purpose rather than encouraging generic “I agree” replies.[1] It also provides an appropriate place for an academic-integrity notice: explain concepts, show method, and cite sources; do not submit work as another student.

**Implementation shape.** Store structured fields in `threads.metadata`; use existing `resources` for the starter content; add thread-type tags and search filters. This is a **small, high-confidence build** that can ship in the same release as resolved answers.

## 3. Safety controls before social expansion

Before adding study circles, peer review, or mentorship, BASISForum should provide **private user mute/block controls**, a clearer `report status` timeline, and a narrowly scoped `appeal` record. A muted user’s content can be hidden in the viewing user’s client experience without revealing the mute to the target. A blocked relationship should also prevent optional future contact workflows, including study-circle requests.

Youth-safety guidance emphasizes privacy-protective defaults, minimized data collection, avoidance of engagement-maximizing mechanics, and effective review of moderation systems.[3] The European Commission’s youth moderation guidance likewise frames moderation as ongoing protection and support, not simply post removal.[4] These controls are therefore a product prerequisite, not an administrative add-on.

**Implementation shape.** Add `user_blocks` with a unique blocker/blockee pair and `report_appeals` tied to reports. Existing notifications and Admin roles can support status updates, while the existing reports table remains the source of truth. Do **not** introduce private direct messages as part of this work.

## 4. Curated knowledge cards

A knowledge card is a small editorial reference created from a resolved thread: title, subject, canonical explanation, relevant formulas or source links, and a `READ THE DISCUSSION` link. Cards should be **curated**, not automatically generated or automatically promoted by vote count. This gives students a durable study surface while preserving the original conversation and its context.

The direction matches peer-learning research that values feedback, explanation, and student-led teaching, while acknowledging the quality-control risk when peers spread an inaccurate explanation.[5] A curator step makes the knowledge layer useful without implying that every highly voted answer is authoritative.

**Implementation shape.** Add `knowledge_cards` with source thread/reply relationships, review state, slug, subject, and publication timestamps. Administrators and designated topic stewards can approve cards from the existing operations portal. Cards can initially be read-only and searchable; authoring tools can arrive later.

## 5. Exam hubs and guided study prompts

Exam hubs are limited-duration subject pages—e.g., `AP Calculus AB · Unit 6 Review`—with a visible end date, pinned help-request templates, curated knowledge cards, and a concise moderator or mentor wrap-up. A hub is not a live chat room; it is a **finite index of discussion and study materials**.

This responds to the value of structured prompts, application, synthesis, and student-led discussion while avoiding an engagement feed.[1] [2] It also gives the campaign system a meaningful community use: the top slot can announce a hub, but no student is profiled or targeted.

**Implementation shape.** Add `study_hubs`, `hub_threads`, and date-scoped Admin controls. Reuse subject tags, pinned threads, campaign settings, and notifications. Build this after knowledge cards.

## 6. Opt-in study circles

Study circles should let a student publish a bounded request such as: `AP Biology · 45-minute review · 4 seats · Saturday 14:00`. Other students request a place; the host accepts a finite number of requests. The public record can show purpose, approximate time, academic subject, and capacity—but **not personal contact data**. Logistics should remain through school-approved channels or a carefully designed external-link policy.

Peer-learning evidence supports peer tutoring, small-group collaboration, feedback, and student-led sessions, but also warns about misinformation, uneven participation, and weak structure.[5] The feature therefore needs explicit ground rules, a capacity cap, attendance outcome, host accountability, and reporting. It should launch only after block/mute and moderation outcome tools are complete.

**Implementation shape.** Add `study_circles`, `study_circle_requests`, host cancellation controls, time-zone-safe timestamps, capacity constraints, and an Admin audit view. Treat it as a medium–high effort feature because safety and coordination matter more than the calendar UI.

## 7. Peer-review exchange

The peer-review exchange should be a request type, not a document-hosting system at first. A student posts a bounded review request with a rubric—clarity, evidence, argument, organization, or correctness—and optionally links a document through an approved external provider. Reviewers leave structured comments associated with rubric criteria. The requester can close the round and mark feedback as useful.

This supports the documented peer-learning pattern in which giving feedback strengthens the reviewer’s own critical analysis, while avoiding public grades or follower-like social comparison.[5] It needs clear consent, removal paths, and policies on personally identifying work; it is a deliberate later build.

**Implementation shape.** Add review-request metadata first, then `review_feedback` and rubric templates. Do not build file uploads until storage, access controls, deletion, and moderation workflows are designed.

## 8. Verified peer mentor directory

A peer mentor directory can be valuable, but only as an opt-in, institution-supported program. Students request mentor status for subjects and grade ranges; an administrator verifies status, records a basic training acknowledgement, and periodically reviews activity. Students can request a **bounded academic question** or study-circle seat rather than open a private conversation.

Mentoring guidance emphasizes intentional matching, mentor preparation, ongoing support, and the reciprocal development of mentor leadership skills.[6] [7] These requirements make this desirable but not an early feature. It should follow block/mute controls and study-circle infrastructure.

**Implementation shape.** Extend user profiles with opt-in mentor subjects and availability; add `mentor_verifications`, `mentor_requests`, review dates, and a staff-only audit screen. Avoid public endorsement counts, follower metrics, or unmoderated direct messages.

## Recommended release sequence

| Release | Scope | Why now |
|---|---|---|
| **R1 — Better questions and answers** | Help-request templates, resolved answers, open/resolved filters. | High learning value with modest schema and UI work; fully leverages current threads and notifications. |
| **R2 — Safety and durable knowledge** | Block/mute, appeal record, report outcome timeline, curated knowledge cards. | Builds safety controls before relationship features and preserves high-value answers. |
| **R3 — Finite study infrastructure** | Exam hubs, guided prompts, study circles. | Adds peer coordination in a bounded, moderator-owned form. |
| **R4 — Deliberate peer programs** | Peer review exchange, verified mentor directory. | Higher operational and safety load; should follow policy, review, and staff capacity decisions. |

## Explicitly not recommended now

BASISForum should avoid direct messages, followers, streaks, public popularity leaderboards, auto-playing media, personalized feed ranking, and location sharing. These mechanics do not solve the current learning or forum-quality gaps and conflict with youth-safety guidance to minimize social comparison and engagement-maximizing design.[3]

## References

[1]: https://teaching-resources.delta.ncsu.edu/discussion-forums/ "NC State DELTA — Discussion Forum Best Practices"
[2]: https://teachingcommons.stanford.edu/news/online-discussion-forums "Stanford Teaching Commons — Online Discussion Forums"
[3]: https://www.ntia.gov/report/2024/kids-online-health-and-safety/online-health-and-safety-for-children-and-youth/taskforce-guidance/recommended-practices-for-industry "NTIA — Recommended Practices for Industry"
[4]: https://better-internet-for-kids.europa.eu/en/dsaforyouth-toolkit/moderation-keeping-platforms-safe-and-respectful "European Commission — Moderation: Keeping Platforms Safe and Respectful"
[5]: https://www.nextgenlearning.org/articles/peer-learning-pods-where-peer-to-peer-learning-thrives "NGLC — Peer Learning Pods"
[6]: https://www.centerforengagedlearning.org/peer-mentoring-for-belonging-inclusion-and-student-development/ "Elon Center for Engaged Learning — Peer Mentoring"
[7]: https://www.naspa.org/blog/peer-mentorship-a-lifeline-for-international-students-navigating-success-and-growth "NASPA — Peer Mentorship"
