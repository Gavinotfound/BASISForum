# BASISForum Theme Research Notes

## Existing token contract

`packages/ui/src/theme-config.ts` currently exposes a single theme-token shape with background, surface, hover, text, muted, divider, control-border, interactive (`navy`), destructive (`burgundy`), destructive hover, and selection foreground roles. Existing modes are Dark, Light, Low contrast, and AMOT.

## Design and accessibility constraints

The Swiss system should retain a restrained palette, a clear grid, typographic hierarchy, functional—not decorative—accent use, and no reliance on effects or color alone. Swiss Themes describes classic Swiss work as commonly using black, white, and one functional accent, with grids and clarity as the primary organizing devices.[1]

The U.S. Web Design System recommends role-based project tokens rather than uncontrolled custom colors; it emphasizes starting in black and white, adding color to serve a functional purpose, and not relying on hue alone to communicate meaning.[2]

Section 508 guidance states that ordinary text needs at least 4.5:1 contrast, large text at least 3:1, and non-text interface components at least 3:1. It also requires that interaction, status, and information not depend on color perception alone.[3]

## Implication

Every new theme should remain a token-only variation, preserve a high-contrast foreground/background pair, use the current burgundy role for destructive states, and supply textual or shape-based states in addition to any accent color. Themes whose central character demands a different hover/interactive color would benefit from a later semantic rename of the legacy `navy` token to `interactive`.

## References

[1]: https://swissthemes.design/insights/swiss-design-for-web-designers
[2]: https://designsystem.digital.gov/design-tokens/color/overview/
[3]: https://www.section508.gov/create/making-color-usage-accessible/
