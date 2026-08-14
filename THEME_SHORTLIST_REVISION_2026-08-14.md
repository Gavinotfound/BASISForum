# BASISForum Revised Theme Shortlist

**Revision: remove graphite · prioritize Archive and Verdigris · add Sakura**

## Final shortlist

The recommendation is now a focused three-theme expansion. The graphite-and-yellow **Signal** concept has been removed. The permanent selector should not become a gallery of palettes; each addition should provide a genuinely different reading environment while preserving the same Swiss grid, typography, rule system, and state semantics.

| Rollout order | Theme | Mode character | Best use |
|---|---|---|---|
| 1 | **Archive** | Warm paper and ink | Long daytime reading, humanities, essays, debate |
| 2 | **Verdigris** | Botanical night study | Low-distraction dark reading, science and late-night work |
| 3 | **Sakura** | Petal-paper editorial | A softer, expressive daytime mode for the student community |

## Sakura — petal paper, plum ink

**Sakura** should be a light, editorial theme—not a cartoonish blossom skin. The character comes from a pale petal-paper field, a dark plum ink foreground, precise pink interaction states, and the existing thin-rule Swiss layout. It should use **no floral illustration, gradients, glow, rounded cards, or decorative texture changes**. This keeps the theme recognizably BASISForum while allowing a gentle pink identity.

| Token | Value | Purpose |
|---|---:|---|
| `background` / `surface` | `#FFF6F8` | Very pale petal paper |
| `surfaceHover` | `#F7DDE5` | Controlled blush hover field |
| `text` | `#2A1420` | Dark plum ink |
| `muted` | `#6B4B5B` | Secondary metadata and captions |
| `divider` | `#9A6D7D` | Visible structural rules |
| `controlBorder` | `#B68595` | Input, select, and menu boundaries |
| `interactive` | `#A82E5B` | Active controls, links, keyboard focus |
| `interactiveHover` | `#862447` | Pressed or hover interaction state |
| `destructive` | `#7B263D` | Downvotes and destructive actions |
| `destructiveHover` | `#9B3853` | Destructive hover state |
| `selectionForeground` | `#FFFFFF` | Text on the pink interaction control |

Sakura’s measured pairs are robust: main text is **16.23:1**, muted metadata is **7.11:1**, grid dividers are **4.07:1**, white text on the interactive pink is **6.55:1**, and white text on destructive burgundy is **9.60:1**. This exceeds the ordinary-text and essential-component contrast thresholds used in the initial research.[1] [2]

> Pink must remain functional. Use it for the active sort, focus ring, interactive link treatment, and selected menu item—not as a wash across every component.

## Archive — warm library paper

Archive remains the best first release because it differentiates most clearly from the existing pure-white Light mode. It makes long discussion threads less stark while preserving editorial clarity.

| Token | Value |
|---|---:|
| `background` / `surface` | `#F7F0E3` |
| `surfaceHover` | `#D8E7E4` |
| `text` | `#15211D` |
| `muted` | `#526158` |
| `divider` | `#6C756C` |
| `controlBorder` | `#809087` |
| `interactive` | `#1B5E76` |
| `interactiveHover` | `#174B5E` |
| `destructive` | `#812D37` |
| `destructiveHover` | `#A43B45` |
| `selectionForeground` | `#F7F0E3` |

Archive’s main text contrast is **14.62:1** and its interactive button label contrast is **6.37:1**.

## Verdigris — botanical night study

Verdigris remains the best second release. It is a quiet alternative to AMOT’s electric cobalt: deeply dark, calm, and appropriate for extended study without drifting into graphite.

| Token | Value |
|---|---:|
| `background` / `surface` | `#0D1B16` |
| `surfaceHover` | `#163D34` |
| `text` | `#EAF7EF` |
| `muted` | `#B0C7BA` |
| `divider` | `#557064` |
| `controlBorder` | `#6C8B7B` |
| `interactive` | `#1F7A6E` |
| `interactiveHover` | `#185E55` |
| `destructive` | `#9C3444` |
| `destructiveHover` | `#BC4758` |
| `selectionForeground` | `#FFFFFF` |

Verdigris’s main text contrast is **16.07:1**, its divider contrast is **3.28:1**, and its interactive button label contrast is **5.16:1**.

## Implementation order

The current central configuration makes these additions low-risk, but its `navy` token should be semantically renamed to `interactive` first. That is necessary because Sakura uses pink and Verdigris uses teal; neither should masquerade as “navy.” After the rename, add one `DisplayMode` literal and one object to `themeModes` per theme. The shared selector will discover the modes automatically.

| Stage | Recommendation |
|---|---|
| 1 | Make the semantic token rename: `navy` → `interactive`; add `interactiveHover`. |
| 2 | Implement and visually verify **Archive** across Web and Admin. |
| 3 | Release Archive and gather student feedback. |
| 4 | Add **Verdigris** as the dark-alternative release. |
| 5 | Add **Sakura** after checking its interaction-state distinction, especially active vs destructive controls. |

Color cannot be the only state signal. Therefore, active controls, errors, and destructive actions should continue to use labels, rules, icon direction, and type weight alongside their palette color.[2]

## References

[1]: [U.S. Web Design System — Using color](https://designsystem.digital.gov/design-tokens/color/overview/)

[2]: [Section508.gov — Making Color Usage Accessible](https://www.section508.gov/create/making-color-usage-accessible/)
