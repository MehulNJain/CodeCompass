# Landing Page Overrides

> **PROJECT:** CodeCompass
> **Generated:** 2026-08-24 11:05:07
> **Page Type:** Landing / Marketing

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content
- **Sections:** 1. Hero with device mockup, 2. Screenshots carousel, 3. Features with icons, 4. Reviews/ratings, 5. Download CTAs

### Spacing Overrides

- No overrides — use Master spacing

### Typography Overrides

- No overrides — use Master typography

### Color Overrides

- **Strategy:** Dark/light matching app store feel. Star ratings in gold. Screenshots with device frames.

### Component Overrides

- Avoid: Single large bundle
- Avoid: Force linear unskippable tour

---

## Page-Specific Components

- No unique components for this page

---

## Recommendations

- Effects: Product animation playback, step progression animations, hover reveal effects, smooth zoom on interaction
- Performance: Split code by route/feature
- Onboarding: Provide Skip and Back buttons
- CTA Placement: Download buttons prominent (App Store + Play Store) throughout

---

## Page Overrides (hand-authored)

### Surface ramp — overrides MASTER.md

MASTER.md lists a **slate** ramp (`#0F172A` background, `#1E293B` primary,
`#334155` secondary, `#94A3B8`/`#64748B` text). In practice the slate read as
visibly *blue*, not black. The style category this project resolved to is
"Dark Mode (OLED)", whose own description calls for **deep black** — so a true
neutral ramp is closer to the intent, and it is the correct choice for OLED
panels.

| Role | MASTER.md (slate) | **In use (neutral)** |
|---|---|---|
| Background | `#0F172A` | **`#000000`** |
| Surface / cards | `#1E293B` | **`#101010`** |
| Surface raised | `#272F42` | **`#181818`** |
| Elevated | `#334155` | **`#262626`** |
| Text | `#F8FAFC` | **`#FAFAFA`** |
| Text muted | `#94A3B8` | **`#A3A3A3`** |
| Text faint | `#64748B` | **`#818181`** |
| Hairline | — | **`#242424`** |
| Interactive border | `#475569` | **`#5A5A5A`** |

The accent (`#22C55E`) is unchanged.

**Two consequences worth knowing:**

- **Translucent surfaces stop working.** `bg-surface/40` over slate read as a
  card; over `#000` it computes to roughly `#060606` and disappears. Card
  backgrounds on this page are therefore **solid** tokens, not opacity
  modifiers. Do not reintroduce `bg-surface/NN`.
- **Paint black before CSS loads.** `index.html` carries an inline
  `style="background-color: #000000"` on `<html>` so there is no white flash on
  first paint.

### Accent button contrast — overrides MASTER.md

MASTER.md specifies `.btn-primary { background: #22C55E; color: white }`.
**Do not use that.** White on `#22C55E` measures **2.28:1** and fails WCAG AA
(4.5:1 minimum). Black on the same green measures **9.22:1**.

```css
/* correct */
background: var(--color-accent);   /* #22C55E */
color: var(--color-canvas);        /* #000000 — 9.22:1 */
```

Implemented in `frontend/src/components/ui/Button.tsx` (`variants.accent`).

### Verified contrast (measured, not estimated)

| Pair | Ratio | Verdict |
|---|---|---|
| `ink` `#FAFAFA` on `#000` | 20.12:1 | AA pass |
| `ink-muted` `#A3A3A3` on `#000` | 8.33:1 | AA pass |
| `ink-faint` `#818181` on `#000` | 5.39:1 | AA pass |
| `ink-faint` `#818181` on `#181818` | 4.56:1 | AA pass (worst case) |
| `accent` `#22C55E` on `#000` | 9.22:1 | AA pass |
| `canvas` on `accent` | 9.22:1 | AA pass |
| `line-strong` `#5A5A5A` on `#000` | 3.04:1 | 1.4.11 pass |

`line-strong` is the border on inputs and outline buttons, so it must clear
**3:1** under WCAG 1.4.11 (non-text contrast) — `#3F3F3F` measured 1.99:1 and
was rejected. `ink-faint` was solved against `#181818`, the lightest surface it
ever sits on, rather than against `#000`.

### No fabricated social proof

The landing page deliberately has **no testimonials, customer logos, or
conversion metrics**. This is an unreleased student project; inventing them
would be dishonest and a viva liability. The trust signals used instead are the
real technology stack and the project's academic attribution.

### Section order as built

1. Sticky header (transparent → blurred on scroll)
2. Hero — value prop, repo-URL input, illustrative tour mockup
3. `#problem` — before/after contrast, plus the design-invariant callout
4. `#how-it-works` — the five pipeline stages from documentation §11
5. `#features` — six cards (F5, F7, F8, F10, F12, F15)
6. Final CTA — GitHub and email sign-in at equal weight
7. Footer — stack chips, team attribution
