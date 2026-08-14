# Reliability Release Smoke Notes

- Production report cleanup completed: six duplicate pending reports were removed, one pending report remains for the affected reporter/target, and `reports_reporter_target_pending_unique` is present.
- After the reliability release, the live thread `http://49.233.13.58:3000/threads/how-do-i-fall-in-love-with-gavin-xu-70deca34` loads under the authenticated session and renders the floor reply controls plus the report action.
- Remaining production UI checks: verify opaque report dialog and exercise the repaired reply submission with a test reply under the approved user session.

## Completed production checks

The report dialog was opened on the deployed thread after the theme repair and rendered as an explicit opaque dark surface with a visible border. The user-approved verification reply was then posted to floor `#1`; the page reloaded at `#comment-ad7ebd84-7142-4e25-9b1a-20bc50098558`, and the new reply appears as a second-layer item beneath floor `#1`. This confirms parent selection, comment persistence, revalidation, anchor targeting, and the intended two-layer presentation.
