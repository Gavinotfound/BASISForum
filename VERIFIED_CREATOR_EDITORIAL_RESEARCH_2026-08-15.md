# Verified-Creator Editorial Section: Research Notes

## Existing BASISForum fit

The current schema has `student`, `moderator`, `teacher`, and `admin` user roles, established moderation logs, reports, notifications, campaign settings, and an Admin portal. It does not yet distinguish **editorial authority** from forum moderation authority, and it has no article/event-specific publishing workflow. The recommended extension is therefore a separate, opt-in creator capability layered on top of the existing account and moderation system—not a new public social role.

## Research findings

| Source | Finding | BASISForum implication |
|---|---|---|
| Iowa DX, *Content Moderation Workflow* | A simple editorial workflow separates Draft, Review, Published, and Archived content. Published content can retain a live revision while a later revision is reviewed. | Editorial posts should use explicit lifecycle states rather than an immediate public publish toggle. |
| Princeton Site Builder, *Draft Content, Publishing, and Moderation* | Writers should create unpublished drafts, editors should control final publication, and workflow complexity should stay proportional to team size. | Begin with four fixed states and no custom state builder. Creator submissions must never publish automatically. |
| Michigan State University, *Editorial Calendars* | An editorial calendar makes responsibility, timing, event dates, production deadlines, and content lifecycle visible. | The Admin editorial desk should show a date-sorted publish queue and event calendar, rather than a generic post list. |
| European Commission, *Moderation: Keeping Platforms Safe and Respectful* | Youth moderation needs clear harmful-content definitions, rapid response, trained review, and continuing evaluation. | Creator verification, takedown paths, revision notes, and event safety fields must be designed alongside publishing. |
| NTIA, *Recommended Practices for Industry* | Youth-facing products should minimize data, use privacy-protective defaults, avoid targeted advertising to minors, and avoid unnecessary engagement mechanics. | Events should never publish precise home locations, creators should expose minimal profile data, and “sponsor” labels must be clear without behavioral targeting. |

## Sources

1. https://dxtraining.iowa.gov/content-types/content-moderation-workflow
2. https://sitebuilder.princeton.edu/content/draft-content-publishing-and-moderation
3. https://comms.msu.edu/social-media/social-media-resources/editorial-calendars
4. https://better-internet-for-kids.europa.eu/en/dsaforyouth-toolkit/moderation-keeping-platforms-safe-and-respectful
5. https://www.ntia.gov/report/2024/kids-online-health-and-safety/online-health-and-safety-for-children-and-youth/taskforce-guidance/recommended-practices-for-industry
