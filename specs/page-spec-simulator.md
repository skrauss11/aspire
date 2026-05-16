# Page Spec — Simulator (`/simulator`)

_Companion to brief-v2.md, creative-direction.md, and page-spec-calculator.md. Locked 2026-05-11._

The Simulator is the page that doesn't exist on the current site. The Calculator delivered the diagnosis (Aspire Rate + Aspire Gap). The Simulator is where the user *explores* their gap: live levers they can manipulate to watch the gap respond in real time, plus a panel of sharp observations about the shape of their gap that point them toward levers worth exploring. It is the surface that turns Aspire from a one-shot calculator into a tool people return to weekly. **Aspire measures; the user moves.** The Simulator never tells the user what to do.

This page is the product's defensibility. Spend the design time here.

---

## 1. Page job and success criteria

**Job:** let the user explore — in 90 seconds or 90 minutes — the smallest possible changes that close their Aspire Gap, and persist any scenario they want to come back to.

**Success:**
- ≥60% of visitors who land here (via Calculator → email gate) move at least one lever.
- ≥35% save at least one scenario (Supabase persistence).
- ≥15% return within 7 days (driven by the Aspire Report newsletter loop).
- Every scenario the user creates is shareable via a public URL with a `Use as my starting point` CTA — viral surface.

---

## 2. The mental model

Three things the user is always doing:

1. **Comparing to "current."** Their Calculator inputs are the baseline. Every lever change is implicitly *"how much closer to my goal would I be if I changed this?"* The current state is always visible as a reference, not just an abstract starting point.
2. **Closing the gap.** The Aspire Gap number is the goalpost. Sign convention: positive = ahead, negative = behind. Most users open with a negative gap; every lever change pushes it toward (and ideally past) zero.
3. **Reading the observations.** Aspire surfaces 2–4 sharp observations about *the shape of the user's gap* — descriptive facts about their data, with pointers to related levers or presets they can explore. **No ranked actions. No Apply buttons. No outcome promises.** The user does the moving themselves.

This is the entire product. Levers + Gap + Recommendations + Save.

### The two rates

Per `brief-v2.md` §1, the Simulator works with two related rates:

- **Aspire Rate** = required money-growth rate to cover the priced future (the floor; what you need to break even).
- **Target Aspire Rate** = Aspire Rate + margin of safety (default +1%, tunable). The aspirational target — hitting Target means you're ahead of the floor.

The Simulator's **Margin of Safety** lever (one of the six) controls whether the surfaced Aspire Rate displays as the required floor (default) or the Target rate (with margin). Both Aspire Gap and "vs. Current" recompute against whichever rate is active. The user always sees a tooltip explaining which rate is currently displayed and what the margin is.

---

## 3. Page structure (desktop)

```
Nav (global, dark variant — see §10)

────────────────────────────────────────────────────────────────
STICKY HEADER (always visible)
  Scenario name              Aspire Rate    Aspire Gap   vs. Current
  "Untitled scenario"          11.2%        −3.6 pts    +2.4 pts closed
  [Save scenario]                                       [Reset to current]
────────────────────────────────────────────────────────────────

WORKSPACE
┌────────────────────┐  ┌─────────────────────────────────────┐
│ LEVERS (left, 40%) │  │ CHART + RECOMMENDATIONS (right, 60%)│
│                    │  │                                     │
│ Savings rate       │  │ Trajectory chart                    │
│ ────              │  │ "What you're building" vs.           │
│                    │  │ "What you need"                     │
│ Allocation mix     │  │                                     │
│ ████████──         │  │                                     │
│                    │  │                                     │
│ Timeline           │  │                                     │
│ ──────●─           │  │ Basket breakdown bar chart          │
│                    │  │                                     │
│ Target basket      │  │                                     │
│ Home Family Free   │  │ THE SHAPE OF YOUR GAP                │
│                    │  │ • Housing is 47% of your cost growth.│
│ Geography          │  │   Most of that is your zip code.    │
│ Austin             │  │   → See a comparable metro          │
│                    │  │                                     │
│ Configurable CAGR  │  │ • Your allocation is 62% cash.      │
│ [Open]            │  │   Cash is the slowest-growing bucket.│
│                    │  │   → Move the Allocation lever       │
└────────────────────┘  └─────────────────────────────────────┘

────────────────────────────────────────────────────────────────
SAVED SCENARIOS (horizontal scroll)
  [Move to Raleigh]  [Family at 50]  [Aggressive]  [+ New]
────────────────────────────────────────────────────────────────

Footer (global, dark variant)
```

The page sits on `--surface-dark` (`#0a0908`). All content is in the financial-instrument register from `creative-direction.md`. The editorial wrapper (Fraunces headlines, cream paper) does not appear on this page except in the nav and footer.

---

## 4. The sticky header

Pinned to the top of the viewport. Cannot scroll out of view.

```
┌────────────────────────────────────────────────────────────────────┐
│  Untitled scenario ✏      10.2%       −2.6 pts      +2.4 closed   │
│                          ASPIRE RATE   ASPIRE GAP    VS. CURRENT  │
│                          AT THESE ASSUMPTIONS                     │
│  [View: Required ▾]                                               │
│  [Save scenario]                                  [Reset →current] │
└────────────────────────────────────────────────────────────────────┘
```

**Sign convention reminder:** Aspire Gap = (your money growth rate) − Aspire Rate. Positive = ahead. Negative = behind. Most scenarios open negative; the user's job is to push it toward zero or past.

**`AT THESE ASSUMPTIONS`** sub-eyebrow under the rate is **non-removable** per `aspire/COMPLIANCE.md`. Required compliance pairing.

**`View: Required ▾`** — a small dropdown/toggle next to the sticky header that switches the surfaced rate between:
- `Required` (default): displays Aspire Rate (the floor — what you need to break even).
- `Target` (+margin): displays Target Aspire Rate = Aspire Rate + margin of safety (default +1%, editable in the dropdown panel).

When the user switches to `Target`, the sticky-header label changes to `TARGET ASPIRE RATE`, the value updates, the Aspire Gap recomputes against the Target rate, and the chart's reference line shifts. The change is animated (250ms tween, no count-up).

### Detail spec

- Background: `--surface-elevated` (`#1a1816`) with 1px `--data-grid` bottom border.
- Height: 96px desktop / 80px mobile (slightly taller than v1 to fit the AT THESE ASSUMPTIONS pairing).
- Scenario name (left): Inter 500 18px, cream. Editable inline (click to edit, Enter to commit). Default: *"Untitled scenario"* in muted-on-dark italic. A small ✏ glyph appears on hover.
- Three numbers (center, evenly spaced):
  - **Aspire Rate (or Target Aspire Rate)** — Inter 600 28px tabular, cream. Updates live as basket lever or margin changes. Label: `ASPIRE RATE` or `TARGET ASPIRE RATE`. Sub-eyebrow underneath: `AT THESE ASSUMPTIONS`.
  - **Aspire Gap** — Inter 600 28px tabular, color is `--loss` if negative (typical case — user is behind), `--gain` if positive (rare — user is ahead). Format: signed (`−3.6 pts` / `+1.2 pts`). Sign: positive = ahead, negative = behind.
  - **vs. Current** — Inter 600 24px tabular, color is `--gain` if the user has made progress (i.e., the gap moved up — closer to zero or further into positive territory) or `--loss` if the gap moved down (further into negative). Format: signed (`+2.4 closed` / `−1.1 widened`). This is the single most important number on the page — it tells the user whether their tinkering is helping.
- Each number has a small caps Inter 12px label underneath (tracking 0.08em).
- **Goal coverage (fourth metric, conditional — added 2026-05-16 per §11 Conflict 21 reversal).** Renders only when ≥1 priced goal exists (the default state for any user arriving from the Calculator). Definition: `min(1, projected_portfolio_at_target_year / total_future_cost_at_target_year)`; with multiple goals at different years, weight by future value. Display: `94%` (or `100%` when ≥1.0). Color: `--gain` tint when ≥100%, `--loss` tint when <70%, neutral cream in between. Carries the `AT THESE ASSUMPTIONS` pairing per `COMPLIANCE.md`. Tooltip: *"Your projected portfolio at the goal's target year, divided by the goal's inflated cost. At these assumptions."* When this metric renders, the sticky header grid becomes four columns on desktop; tablet/mobile stack per existing breakpoints in `simulator/index.html` line 122.
- View toggle:
  - `View: Required ▾` / `View: Target ▾` — small dropdown/button below the scenario name. Default: Required.
  - When opened, shows: a radio toggle (Required / Target) and, for Target, a numerical margin input (default 1.0%, range 0.0%–5.0%, step 0.1%).
- Right side:
  - `Save scenario` — primary terracotta pill button. On click: opens save dialog (see §8).
  - `Reset to current` — ghost link with terracotta Δ on hover. Restores all levers to the user's Calculator baseline (does not reset the View toggle — that's a viewing preference, not part of the scenario).

### Behavior

- Animated transitions on number changes: 250ms tween, ease-out. No counting-up animation here (that's the Calculator's showpiece moment) — just smooth tween.
- The `vs. Current` indicator: when `+`, briefly pulse `--gain` (300ms). When `−`, briefly pulse `--loss`. Subtle — a tiny celebration of progress.
- ARIA live region on the three numbers, throttled to one announcement per 1000ms.

---

## 5. The lever stack

Seven levers in the left rail (desktop) or vertical stack (mobile), in this fixed order (**Lever 5 — Goals** added 2026-05-16 per `_DRIFT_REPORT_2026-05-11.md` §11 Conflict 21; design ancestor V3.1 build spec at `aspire-gtm/20_PRODUCT_ENGINE/SITE_V3.1_REVIEW/07_V3.1_BUILD_SPEC_PHASE_1.md`):

1. Savings rate
2. Allocation mix
3. Timeline
4. Target basket
5. Goals
6. Geography
7. Configurable CAGR

Each lever sits in its own card on `--surface-elevated`, 16px padding, 12px gap between cards.

Each lever card has the same anatomy:

```
┌──────────────────────────────────────┐
│ LEVER NAME             Δ +2.4 closed │  ← header row
│                                      │
│  [the lever control]                 │  ← interaction area
│                                      │
│ "current: $1,200/mo"                 │  ← reference line
└──────────────────────────────────────┘
```

- **LEVER NAME** — small caps Inter 12px, muted-on-dark.
- **Δ change** — only shows when the lever has been moved from baseline. Color is `--gain` for closing the gap, `--loss` for widening. Format: `Δ +2.4 closed` or `Δ −0.6 widened`.
- **Reference line** — small Inter 14px muted-on-dark italic, format: *"current: {baseline value}"*. This is the implicit-compare-to-current model.

### Lever 1 — Savings rate

The dollar amount the user contributes to their portfolio per month.

- Default: pulled from Calculator (monthly contribution input).
- Range: $0 — $20,000/month.
- UI: horizontal slider + tap-to-edit numerical input, $ format with comma separators.
- Slider tick marks at $0, $1k, $2.5k, $5k, $10k, $20k.
- Helper text on first interaction: *"How much you're adding per month."*

### Lever 2 — Allocation mix

The user's portfolio split across the four buckets from the Calculator.

- Default: pulled from Calculator.
- UI: horizontal stacked bar (240px wide, 32px tall) with draggable handles between segments. Each segment colored with a distinct hue from a desaturated dark-mode palette (Cash: `#3a4a5a` slate, Stocks: `#2d5a3a` muted green, RE: `#5a4a2d` muted brown, Other: `#4a3a5a` muted purple — verify these against AA contrast).
- Each segment labeled inside the bar with name + percentage in tabular Inter 11px.
- Beneath the bar: 4 numerical inputs (one per bucket), each with its assumed return shown in muted gray underneath:
  > *"Cash 25% — assumed 4.0%"*
- Auto-balance: when one input changes, the others adjust proportionally to maintain 100%. Small lock icon next to each — clicking locks that bucket so the others bear all adjustments.
- Each bucket's assumed return is editable via Lever 7 (Configurable CAGR), not here.

### Lever 3 — Timeline

Years until the user wants this life.

- Default: pulled from Calculator.
- Range: 1 — 40 years.
- UI: horizontal slider with tick marks at 5/10/15/20/25/30/40. Numerical value to the right (Inter 600 28px tabular).
- Tap-to-edit on mobile.
- Behavior: timeline doesn't change the Aspire Rate (it's a CAGR), but it changes the **trajectory chart** (see §7) and the **observation cards** (see §8). When timeline moves, the chart's x-axis re-scales smoothly (500ms ease-in-out).

### Lever 4 — Target basket

Which preset basket the user is pricing.

- Default: pulled from Calculator (Home / Family / Freedom).
- UI: horizontal pill chip selector (3 chips), single-select.
- Below the chips: an expandable "Refine basket" section showing the basket's component weights (e.g., Home: 50% housing, 25% S&P, 15% CPI, 10% childcare). Each component has a numerical weight input. Auto-balance to 100% as in Allocation Mix.
- Default: collapsed. Expand on click. State persists per scenario.
- Changing the basket fully resets the component weights to the new preset's defaults.
- Adding new components (e.g., "add private K-12 tuition") is **not** in v1. Component set is fixed; only weights are editable.

### Lever 5 — Goals

_Added 2026-05-16. The Calculator's priced goal (Input A4) arrives as the first row. The lever lets the user edit it, delete it, or append additional priced goals. The Aspire Rate without a priced Goal is a number without an anchor — see `10_CANONICAL/Vocabulary.md` for the canonical `Goal` definition._

The list of priced goals the user is pricing. Each goal has a name, an amount in today's dollars, a target year, and an inflation vector that determines how the amount inflates to its future value.

**Populated state (the default — every user arriving from the Calculator has at least one priced goal):**

```
GOALS                          Δ +1.2 closed

  A home
  $420,000 today · 7 yr · housing       [⋯][×]
  NAR median existing-home price — edit to yours

  Wedding
  $80,000 today · 2 yr · CPI            [⋯][×]

  [ + Add a goal ]

  Total future cost: $2.10M at these assumptions

  current: 1 goal priced
```

Seeded rows display the italic source-label helper. User-edited and user-added rows omit it. On first edit of a seeded row, the helper drops and the row converts to user-owned (the row's `seeded` flag flips to `false` in the persisted schema).

**Empty state** (renders only after every priced goal has been deleted; in practice rare because the Calculator always submits one):

```
GOALS                              0.0 unchanged

  No priced goals.
  The basket above shapes how costs grow.
  A goal turns that shape into a number.

  [ + Add a goal ]
```

**Add-a-goal form** — inline on desktop, bottom sheet on mobile per `creative-direction.md` §7:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text, ≤40 chars | yes | placeholder: *"e.g. Home in Brooklyn"* |
| Amount in today's dollars | $ number, comma separators | yes | range $1k–$50M; reject negative |
| Years out | integer | yes | range 1–40; capped by Timeline lever |
| Inflation vector | dropdown | yes | Options: `Housing (geography CAGR)`, `Equity-linked`, `CPI`, `Healthcare`, `Childcare`, `Private K-12`, `Custom %` |
| Custom CAGR | % number | only if `Custom %` selected | range -5% to 25% |

`[⋯]` opens the same form prefilled for edit. `[×]` deletes with a 250ms collapse, no modal.

**Basket-chip switch behavior** (mirrors Calculator Input A4): if the user changes the Target Basket lever and the Calculator-seeded goal is still in its seeded state, reseed amount, years out, and inflation vector to match the new basket. If the user has edited the row, keep their edit. Same rule as the Calculator's chip-switch behavior.

**Math:**

- Each goal: `future_value = amount × (1 + cagr)^years_out` where `cagr` is the resolved rate for the chosen inflation vector (housing resolves through Geography lever).
- "Total future cost" line at lever bottom = `Σ future_value` across all goals — paired with *"at these assumptions"*, non-removable.
- "Required CAGR for this goal" is computed for use in the §8 observation panel only; never surfaced as a primary metric (reads too easily as a recommendation).

**Schema:** `scenario.basket.goals[]` already supports priced goals. One additive field — `seeded: boolean` — tells the lever whether to render the source-label helper. Round-trips through `toPersisted` / `fromPersisted` without schema migration.

**Seeded values (Hermes-grounded 2026-05-15, full thread at `aspire-gtm/70_AGENT_LAB/threads/2026-05-15-goals-seed-defaults-grounding.md`):**

| Calculator chip → Simulator first row | Amount | Years out | Source-label copy |
|---|---:|---:|---|
| A home | **$420,000** | matches Timeline lever | *NAR median existing-home price — edit to yours* |
| A family | **$330,000** | 18 | *USDA estimate, CPI-inflated — edit to yours* |
| Freedom | **$2,000,000** | matches Timeline lever | *25× BLS average spending — edit to yours* |

Sources: NAR Existing-Home Sales Apr 2026 release ($417,700, rounded). USDA *Expenditures on Children by Families, 2015* baseline $233,610 × BLS CPI-U All Items NSA 2015→Apr 2026 (237.017 → 333.020) = $328,233, rounded. BLS Consumer Expenditure Survey 2024 average annual expenditures $78,535 × 25 per 4% rule (Bengen 1994 / Trinity 1998) = $1,963,375, rounded.

**Compliance:**

- "Total future cost" line is paired with *"at these assumptions"* — non-removable.
- Per-row hover tooltip showing inflated future value carries the same pairing.
- Source-label italics on seeded rows serve as implicit pairing for the seeded numbers.
- Banned patterns: *"You can afford…"*, *"You'll have enough"*, *"Recommended price"*, *"Locked in"*. Existing pattern *"You reach your goal at year N"* on the chart's crossover marker is allowed (descriptive of the line, not a promise).
- Run `npm run check:compliance` before merging.

### Lever 6 — Geography

The metro/zip used for housing CAGR.

- Default: pulled from Calculator.
- UI: text input with type-ahead autocomplete (Case-Shiller metros + zip → metro resolution).
- Resolved metro shown beneath the input in muted gray italic: *"Resolved: Austin–Round Rock MSA — 5-yr CAGR 9.2%"*.
- A small "Compare to..." secondary action opens a side-by-side metro picker (this is the lever that powers the *"Move to a cheaper city"* preset).

### Lever 7 — Configurable CAGR

Per-asset-class expected return overrides. The data-dense lever.

- UI on desktop: a `[Open]` button that expands a modal panel inline, showing each asset class with:
  - Current value (e.g., `S&P 500 — 10.4%`)
  - Dropdown to switch the source: `5-yr trailing` (default) / `10-yr trailing` / `20-yr trailing` / `Custom %`
  - When `Custom %` is selected, a numerical input appears.
- UI on mobile: button opens a bottom sheet (full-height) per `creative-direction.md` §7.
- Includes both portfolio asset classes (Cash, Stocks, RE, Other) and basket components (Housing, Childcare, Tuition, Healthcare, CPI-U).
- Helper text at the top: *"Smooth out volatility by choosing a longer window. Or set a custom rate if you have a stronger view."*
- A "Reset all to defaults" link at the bottom.

---

## 6. The compare-to-current model

The user's Calculator inputs are the baseline. Every lever change is measured against it.

### Where the baseline shows up

- **Sticky header:** the `vs. Current` number tells the user how much gap they've closed (or widened).
- **Each lever card:** the *"current: {value}"* reference line under each lever shows what the baseline was.
- **Trajectory chart:** the user's current trajectory is drawn as a muted dashed line behind their scenario trajectory.
- **Reset button:** in the sticky header, the `Reset to current` ghost link restores all levers to the baseline in one move (with confirmation — a 250ms tween of all sliders, no scary "are you sure" modal).

### When the baseline updates

- Only when the user explicitly chooses to update it. After saving a scenario the user might want as their new starting point, a small action `Make this my new baseline` is available in the scenario card menu. This rewrites the baseline in Supabase.
- The Calculator inputs themselves can also be re-edited (link in nav), which updates the baseline directly.

The baseline is sticky — it doesn't drift quietly. The user always knows what they're comparing to.

---

## 7. The trajectory chart

The center-right of the workspace. The single most-watched element after the sticky Gap.

### What it shows

A line chart over the timeline (x-axis: years from today, scaled to the Timeline lever value). Two lines:

1. **"What you're building"** — projected portfolio value over time, given current assets, savings rate, and allocation mix.
2. **"What you need"** — projected cost of the priced goals over time. Per the 2026-05-16 amendment (§11 Conflict 21 reversal), this is rendered as a **step function**: it jumps up at each priced goal's target year by that goal's inflated future value, and between goal years it grows at the relevant inflation vector's CAGR. Goals are the priced rows in Lever 5 (Goals).

The area between the two lines is shaded:
- `--loss` (semi-transparent ~15%) when "What you need" > "What you're building" — the typical case.
- `--gain` (semi-transparent ~15%) when "What you're building" > "What you need" — the user has crossed over.

### Annotations

- **Crossover point:** if "What you're building" overtakes "What you need" within the timeline, mark the year with a small terracotta Δ marker. Label varies by goal count (per 2026-05-16 amendment): single priced goal → *"Clears {goal name} at year {N} at these assumptions"*; multiple priced goals → *"Clears all priced goals at year {N} at these assumptions"*. The legacy single-goal phrasing *"You reach your goal at year 23"* is replaced. This is the most rewarding visual moment in the product.
- **Goal-year ticks (added 2026-05-16):** at each priced goal's target year, render a small x-axis tick with the goal name (Inter 500 11px muted, truncated to 14 chars + ellipsis). Hover tooltip: *"{goal name} — ${future_value} in {N} yr at these assumptions"*. Goals are sourced from Lever 5.
- **Endpoint values:** the dollar value at the end of the timeline for both lines, shown as right-edge annotations.
- **Today (year 0):** small marker on the y-axis with the user's current asset value.

### Behavior

- On lever change: lines morph between scenarios over 500ms ease-in-out.
- Hover: tooltip shows year, "What you're building" value, "What you need" value, and the gap in dollars. Tooltip uses `--surface-elevated` background, cream text, tabular numerals.
- Below the chart: a small toggle `Show as %` switches the y-axis from dollars to CAGR — less useful but available for power users.
- Empty state: never. As long as the user has any baseline (which they do, from the Calculator), the chart renders.

### Reference line

Behind the active "What you're building" line, the user's **baseline trajectory** is drawn as a 1px dashed line in `--muted-on-dark`. This is the visible compare-to-current — the user can see at a glance how their scenario diverges from where they started.

---

## 8. The Shape of Your Gap (observation panel)

The editorial layer. 3–4 sharp observations about the *shape* of the user's gap — descriptive facts, not prescribed actions. Each observation points at a related lever or preset where the user can explore further. **Never prescribes.** **Never ranks recommended moves.** **Never promises an outcome.** This is a measurement and education layer, not a recommendation engine.

This design is a deliberate compliance posture (drift-report Conflict 6, refined 2026-05-11). The prior recommendation-engine concept was scrapped because ranked actions + outcome promises + Apply buttons constitute investment advice in form even when no specific securities are named. The Shape of Your Gap preserves the energy of an opinionated panel through *sharp observation* without crossing into *prescription*.

### What a card looks like

Each card sits in the right column, beneath the trajectory chart:

```
┌────────────────────────────────────────────────────┐
│ Housing is 47% of your cost growth.                │
│ Most of that exposure is your zip code.            │
│                                                    │
│                       → See a comparable metro    │
└────────────────────────────────────────────────────┘
```

Two parts per card:
- **Observation** — a specific factual statement about the user's data (Inter 500 16px cream). Two lines max. Defensible from the user's inputs and the rates in `rates.json`. **No actions, no "you should," no "best."**
- **Pointer** — a small arrow link to a related lever or preset (Inter 500 14px terracotta on hover, muted otherwise). **No "Apply." No outcome promised.** Just an invitation to explore.

Visual: `--surface-elevated` background, no border, 16px padding, 12px gap between cards. Δ glyph deliberately absent inside the dark register (would feel decorative against editorial observation).

### Card templates and firing rules

The cards are generated from the user's data via a pure function — **no LLM, no recommendation algorithm.** Each template fires based on conditions in the current scenario.

| Template | Fires when | Example observation | Pointer |
|---|---|---|---|
| Largest cost-growth driver | Always | *"{Component} is {X}% of your cost growth — the largest single driver."* | → Try the {related preset or component lever} |
| Allocation skew | Any one bucket > 50% of allocation | *"Your allocation is {X}% {bucket}. {Bucket} is assumed to grow at {X.X}% — the {lowest/highest} of your four buckets."* | → Move the Allocation lever |
| High-CAGR component | Any component CAGR > 10% | *"{Component} is your highest-CAGR component — {X.X}% over the last five years."* | → See the {related preset or basket lever} |
| Geography spread | User in top-quartile Case-Shiller metro | *"Housing in {metro} grew {X.X}% over five years — well above the national {Y.Y}%."* | → See a comparable metro in Geography |
| Long timeline | Timeline ≥ 20 years | *"Your timeline is {X} years. Long horizons compound small contribution changes meaningfully."* | → Try the Save 5 more years preset |
| Low money growth | Computed money growth < 5% | *"Your money is growing at {X.X}% — close to the cash-only baseline of 4.0%."* | → Move the Allocation lever |
| Big gap | Gap < −15 pts | *"Your gap is {X} pts. At these assumptions, no single lever closes it alone — moving several together is the realistic path to explore."* | (No pointer — this card stands alone as compassionate framing) |
| User is ahead | Gap > 0 | *"At these assumptions, you're ahead by {X.X} pts. Markets and rates move quarterly — worth checking back."* | → See the Configurable CAGR lever (test stress assumptions) |
| Goal short _(added 2026-05-16 per §11 Conflict 21)_ | ≥1 priced goal AND projected_portfolio < goal_future_value at goal's target year | *"At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}."* | (No pointer — descriptive; the levers above are where the user moves. Do **not** add a "Goal cleared" celebration card — preserves the editorial-not-promissory posture; the chart's crossover Δ marker is sufficient.) |

Each template has 2–3 copy variants so the panel doesn't feel templated. Variants live in `aspire/lib/simulator/observations.js`.

### Card selection and ordering

- All eligible templates evaluate. The ones whose conditions fire return candidate cards.
- Cards are ordered by **interestingness** (largest absolute deviation from baseline / largest magnitude in user's data) — **not** by "recommended priority." This is a critical distinction. We're surfacing what's *most distinctive about the user's situation*, not what they should *act on first.*
- Show 3–4 of the top eligible cards.
- If only 1 card fires (boring scenario), show 1. Don't pad.
- Never show more than 4. The panel is editorial, not exhaustive.

### Pure function spec for Codex

```js
// aspire/lib/simulator/observations.js
function observe(currentScenario, baseline, rates) {
  // Run all templates against the scenario. Each returns null or a card.
  // Rank by interestingness (a function of magnitude / deviation, not "should-do").
  // Return top 3–4 cards.
  return Card[]
}

type Card = {
  id: string                    // template id
  observation: string           // the two-line factual statement
  pointer: {
    label: string               // e.g., "See a comparable metro in Geography"
    target:                     // where the link goes
      | { type: 'lever', name: 'savings' | 'allocation' | 'timeline' | 'basket' | 'geography' | 'cagr' }
      | { type: 'preset', id: string }
      | null                    // some cards stand alone with no pointer
  } | null
}
```

**The function does not modify any lever values. It does not return suggested values. It returns observations and pointers. Apply behavior does not exist anywhere in the Simulator.**

### Required disclaimer below the panel

Inter 400 12px muted-on-dark, non-removable:

> *Aspire shows you the shape of your gap at your current assumptions. It does not recommend specific assets, allocations, or actions. Talk to a fiduciary advisor before acting on anything you see here.*

### Edge cases

- **No cards fire** (extreme baseline, no distinguishing features): show a single quiet card — *"Your scenario sits close to the model's baseline assumptions. Move any lever to see your gap respond."* No pointer.
- **User is significantly ahead (gap > +5):** show the "User is ahead" card and one observational card about whichever component is highest. No "lock-it-in" framing — that's prescriptive.
- **The Aspire Report can be referenced as a passive footer link** below the panel — *"More observations like these in the Aspire Report. Tuesdays."* — but never as a "we don't have a card to show you" fallback. The newsletter is editorial, not a fallback.

---

## 9. Scenario presets and saved scenarios

### Presets (the mobile entry path; also useful on desktop)

A horizontal scroll of preset cards. On mobile, sits at the top of the workspace; on desktop, sits below the workspace as a quick-start row.

Locked v1 presets:

1. **Aggressive** — savings rate ×1.5, allocation 75% equity / 25% other, timeline unchanged.
2. **Conservative** — savings rate unchanged, allocation 30% equity / 50% cash / 20% other, timeline +5 years.
3. **Move to a cheaper city** — geography swapped to a similar metro 20% cheaper on Case-Shiller; everything else unchanged.
4. **Save 5 more years** — timeline +5 years, everything else unchanged.
5. **Smaller life** — basket downgraded one tier (Freedom → Family → Home).
6. **Custom** — a blank "start tinkering" entry point that doesn't pre-apply anything.

Each preset is a card on `--surface-elevated`, with a title, a one-line description, and a small projected `Δ closed` indicator showing what it would do for *this user's* baseline.

Tap → all relevant levers animate to the preset values (250ms staggered).

### Saved scenarios

Below the preset row, a horizontal scroll of the user's saved scenarios.

- Each card shows: scenario name, Aspire Gap value, `Δ vs. baseline`, and a small `Last edited X ago` timestamp.
- Tap → loads the scenario into the Simulator.
- Long-press / hover-X → menu with `Rename`, `Make this my new baseline`, `Share link`, `Delete`.
- Cap: 10 saved scenarios per user (cap to prevent abuse and keep the UI manageable). When cap reached, the `Save scenario` button shows: *"Delete one to save another."*

### Saving a scenario

When the user clicks `Save scenario` in the sticky header:

1. Modal opens (`--surface-elevated`, 480px wide on desktop, full-screen on mobile).
2. Single text input: *"Name this scenario"* — pre-filled with a guess based on what changed (*"Cash → Equities"*, *"Move to Raleigh"*, etc.).
3. Optional public toggle: *"Make this scenario shareable via public link"*. If on, the scenario gets a `/simulator/s/[id]` URL on save.
4. `[Save]` button (primary terracotta pill).

On save: scenario writes to Supabase, modal closes, sticky header updates with the saved name, and a small toast confirms: *"Saved. Find it under Scenarios below."*

### Sharing a scenario

Public scenarios are accessible at `/simulator/s/[id]`. The shared view:

- Loads the scenario read-only.
- Shows a banner: *"You're viewing someone's scenario. Make it your starting point →"* — CTA loads the scenario's lever values into the visitor's own Simulator session.
- If the visitor doesn't have a Calculator baseline yet, the CTA redirects to `/` first.

This is Aspire's primary viral surface. Designed to be screenshotted and shared in DMs as much as via link.

---

## 10. Mobile layout

Breakpoint at 860px.

```
┌─────────────────────────────────┐
│ STICKY HEADER (72px)            │  ← always visible
│ Gap: −3.6 pts  vs.Current: +2.4 │
├─────────────────────────────────┤
│                                 │
│ [Aggressive] [Cheaper city] →   │  ← preset horizontal scroll
│                                 │
│ ─── LEVERS ───                 │
│                                 │
│ Savings rate          Δ closed  │
│ ▶                               │  ← tap to expand
│                                 │
│ Allocation mix        Δ closed  │
│ ▶                               │
│                                 │
│ Timeline              Δ closed  │
│ ▶                               │
│                                 │
│ Target basket         Δ closed  │
│ ▶                               │
│                                 │
│ Geography             Δ closed  │
│ ▶                               │
│                                 │
│ Configurable CAGR     Δ closed  │
│ ▶                               │
│                                 │
│ ─── CHART ───                  │
│ [trajectory line chart]         │
│                                 │
│ ─── THE SHAPE OF YOUR GAP ───  │
│ • Housing is 47% of your cost   │
│   growth. Most of that is your  │
│   zip code.                     │
│   → See a comparable metro      │
│                                 │
│ ─── SAVED SCENARIOS ───        │
│ [Move to Raleigh] [+ New]       │
│                                 │
│ Footer                          │
└─────────────────────────────────┘
                         ┌─────┐
                         │  +  │  ← FAB: save scenario
                         └─────┘
```

### Mobile-specific behavior

- **Sticky header collapses on scroll** — after scrolling 200px, only the Gap and `vs. Current` remain visible (the row collapses from 72px to 48px).
- **Each lever card is collapsed by default.** Tap the header row to expand inline. Only one lever expanded at a time (collapses others). The current value and Δ closed always visible in the collapsed header so the user can see the state without expanding.
- **Allocation Mix** opens its own bottom sheet (full-height) when tapped — too dense for inline.
- **Configurable CAGR** opens its own bottom sheet, as on desktop.
- **Floating Action Button (bottom-right):** primary terracotta, label `+` glyph. On tap: opens save scenario modal. The only floating UI in the product.
- **Chart simplifies:** dashed baseline line is dropped on mobile (visual noise). Just the active scenario line + the cost line + shaded gap area.
- **The Shape of Your Gap cards stack vertically** in the lever scroll position; each card full-width. No swiping, no Apply button — pointers are always-tap-to-jump links to the relevant lever or preset above.

---

## 11. State and persistence

### Schema (Supabase)

Sketch below. Full schema with RLS policies and column-encryption types (`bytea` for money fields) lives in `security-and-privacy.md` §3. **Use the security doc as the source of truth** for table DDL — this is a summary.

```sql
-- existing from Calculator
users (id, email, created_at)
calculator_states (user_id, life_chip, geography, timeline,
                   total_assets, allocation_json, monthly_contribution,  -- ENCRYPTED
                   aspire_rate, aspire_gap, updated_at)

-- new for Simulator
scenarios (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  name text,
  levers bytea,           -- ENCRYPTED — full lever state including money fields
  derived jsonb,          -- aspire_rate, aspire_gap, basket components (display cache)
  is_public boolean default false,
  share_id text unique,   -- 20-char random slug, generated on is_public=true
  created_at timestamptz,
  updated_at timestamptz
)

baseline_overrides (   -- only if user uses "Make this my new baseline"
  user_id uuid primary key references users(id) on delete cascade,
  levers bytea,           -- ENCRYPTED
  set_at timestamptz
)
```

### Security model
- RLS enabled on every table; owners can read/write their own rows; public scenarios readable by anyone via `is_public = true`.
- The money fields (allocation, contributions, total assets) and the full `scenarios.levers` JSONB are encrypted at the application layer (libsodium + key from Supabase Vault) before write. Decrypted server-side for authorized reads. Client never sees the key.
- See `security-and-privacy.md` §3–§4 for full RLS policies and encryption pattern.

### Sync model

- On every lever change: update local state, recompute Gap (debounce 50ms), update UI.
- On every lever change: also write to localStorage as `simulator-draft` (debounce 500ms). This catches the user closing the tab mid-tinker.
- On `Save scenario`: write to Supabase `scenarios` table.
- On scenario load (from URL or saved card): full lever state hydrates, chart re-renders, observation cards recompute.

### Returning visitor flow

1. User lands on `/simulator`.
2. If no auth (no email captured): redirect to `/` with a banner — *"Run the Calculator to see your gap, then come back here to close it."*
3. If auth and has scenarios: load the most-recently-edited scenario by default. Show toast: *"Picking up where you left off — {scenario name}."*
4. If auth and no scenarios yet: load baseline (Calculator state) as Untitled scenario.

---

## 12. Edge cases

| Case | Behavior |
|---|---|
| Visitor lands on /simulator with no Calculator state | Redirect to `/` with banner explaining they need a baseline first. |
| User clears all levers / sets nonsense values | Show baseline trajectory only. Gap calculation requires valid inputs — gate the chart with helper text if invalid. |
| Allocation auto-balance creates negative percentages | Hard floor at 0% per bucket. The most-recently-touched bucket adjusts; locked buckets don't. |
| Recommendation engine returns 0 viable suggestions | Show the "explored most of the high-impact moves" message that funnels to newsletter. |
| Saved scenario count exceeds 10 | Disable Save with helper text. Don't auto-delete. |
| User shares a scenario, then deletes it | Public URL returns a 404 with a redirect to `/simulator` after 3s. |
| User unsubscribes from newsletter but keeps scenarios | Scenarios stay. Beehiiv contact is removed; Supabase user persists. |
| Geography lever set to non-US zip | Block at input level — autocomplete only includes US metros. |
| Timeline = 0 | Slider minimum is 1; never allow 0. Math breaks otherwise. |
| Aspire Gap is exactly 0 in a scenario | Header shows `0.0 pts` in muted-on-dark (neither gain nor loss). Recommendations show "lock-it-in" variant. |
| User reaches gap closure but only at the end of a 30-yr timeline | Crossover annotation on chart at year ~30. Recommendation may suggest shortening timeline. |

---

## 13. Tech notes for Codex

### Architecture
- Same stack as Calculator: **vanilla HTML + CSS + JS on Netlify** (Phase A — see drift-report Conflict 4). No framework, no build step. Framework migration deferred to v2 if Pro complexity demands.
- Supabase, Beehiiv, Resend per `aspire/TECHNICAL_CONTEXT.md`.
- All math is client-side. No serverless function needed for lever computation. Recommendation engine is a pure JS module in `aspire/lib/simulator/recommend.js`.
- Persistence via Supabase JS client with row-level security. Full RLS policies in `security-and-privacy.md` §3. Schema migrates fully (the existing `public.scenarios` table drops once the new schema lands — no data preservation needed per drift-report Conflict 5).
- **Encrypted writes:** all writes to encrypted columns (`scenarios.levers`, `baseline_overrides.levers`) go through Netlify Functions that call `aspire/lib/encryption.js`. The browser never writes plaintext to these columns. Reads similarly go through a server-side decrypt step before returning to the client. Pattern documented in `security-and-privacy.md` §4.
- **Auth:** Supabase Auth magic-link for sign-in. Existing `aspire/netlify/functions/score.js` flow is the entry point — it creates the user record, writes the encrypted Calculator state, and triggers the magic-link email via Supabase Auth. Resend stays for transactional score emails.
- **Aspire Score deprecation:** the existing 0–100 score is removed from the Simulator UI. The `score.js` function name is preserved (deploy contract) but its return shape changes to `{ aspireRate, aspireGap, scenarioId, simulatorUrl, emailSent }`. Codex should update `score.js` in a single PR alongside the Simulator refactor.
- **Compliance:** every Aspire Rate / Target Aspire Rate / Aspire Gap surfaced in any UI or email must include the "at these assumptions" pairing. The Shape of Your Gap panel disclaimer (see §8) is non-removable. The simulator never displays a ranked list of moves, an Apply button, or an outcome-promise like "closes X pts." Verify with `npm run check:compliance`.

### Key files to create

```
app/simulator/page.tsx                  Main simulator page (auth-gated)
app/simulator/s/[shareId]/page.tsx      Shared scenario view (public)
components/simulator/
  StickyHeader.tsx
  LeverStack.tsx
  Lever[Name].tsx                       One per lever (6 files)
  TrajectoryChart.tsx
  ShapeOfYourGapPanel.tsx
  SavedScenarios.tsx
  PresetRow.tsx
  SaveScenarioModal.tsx
lib/
  simulator/
    compute.ts                          Aspire Rate/Gap math, trajectory projection
    observations.js                     Pure observation function (returns Card[] — no recommendation logic, no apply behavior)
    presets.ts                          Locked preset definitions
    types.ts                            Scenario, Lever, Suggestion types
```

### Performance budget
- LCP under 2.5s (heavier than Calculator, acceptable).
- Lever interaction: lever-change → UI update under 100ms (debounce on math, not on UI).
- Chart re-render under 250ms.
- No layout shift on lever expansion (mobile) — use fixed-height containers with overflow.

### State management
- Use React Context for the active scenario (read by header, levers, chart, observation panel). Note: the spec uses vanilla HTML/JS for v1 per `aspire/TECHNICAL_CONTEXT.md`; "React Context" pattern translates to a single shared in-page state object passed by reference.
- Reducer pattern for lever changes; every change is an action that produces a new scenario state.
- Recommendation engine recomputes on scenario change (memoized; cheap).

### Charts
- Hand-rolled SVG strongly preferred over Recharts here. The chart needs custom annotations (crossover marker, baseline reference line, dashed lines) that Recharts makes harder than necessary. ~150 lines of SVG + a small projection function.
- Animations on the chart use Framer Motion's `<motion.path>` with `d` interpolation.

### Auth
- Supabase magic-link auth tied to the email captured on the Calculator. User doesn't enter a password. Returning users get a magic-link email if their browser doesn't have a session.
- The `/simulator/s/[shareId]` route is fully public — no auth required to view.

### Telemetry (future, not v1)
- Anonymous analytics: which levers are moved most, which comparison patterns get loaded, which observation pointers get clicked. Use PostHog or similar; gated behind a consent banner. Never log lever values or money fields.

---

## 14. Out of scope (v1) — and what's reserved for paid tiers

Some of these are simply not v1; others are deliberately reserved for **Aspire Pro** (v2 paid tier — see `content-architecture.md` §12). Marked accordingly.

| Feature | Status | Notes |
|---|---|---|
| Multi-user / team scenarios | Out of scope, no current plan | One scenario belongs to one user. |
| Scenario commenting / collaboration | Out of scope, no current plan | |
| Scenario versioning / undo history beyond Reset to Current | **Reserved for Aspire Pro (v2)** | Don't build into free tier. |
| **Multi-goal modeling** (home + retirement + kids' college simultaneously) | **Reserved for Aspire Pro (v2)** | Headline Pro feature. Don't ship to free Simulator. |
| **Tax-aware lever family** (401k / Roth / taxable / HSA buckets with effective-return modeling) | **Reserved for Aspire Pro (v2)** | Don't add to free Simulator's Allocation Mix lever. |
| **Spouse/partner mode** (joint scenarios) | **Reserved for Aspire Pro (v2)** | Don't ship as free feature. |
| **PDF export of scenarios** | **Reserved for Aspire Pro (v2)** | Advisor handoff format. |
| **Quarterly refresh alerts** on saved scenarios | **Reserved for Aspire Pro (v2)** | |
| **Unlimited saved scenarios** | **Reserved for Aspire Pro (v2)** | Free cap stays at 10 (per §9 of this spec). The Pro cap is unlimited. |
| Custom basket components (adding new categories beyond the locked set) | Out of scope v1; revisit v2 | May land as Pro feature; may stay out indefinitely. |
| Real-time market data integration | Out of scope v1 | Quarterly refresh is the cadence. |
| Mobile app | Out of scope v1 | Web only. |
| Shareable image / OG card for scenarios | v1.5 candidate | Generates a screenshot-friendly card. Free feature when it ships. |

**Engineering rule:** any reserved-for-Pro feature must be explicitly out of v1 free Simulator. If a contributor proposes adding one of these to the free tier, push back and reference this table + `content-architecture.md` §12.

---

## 15. Copy file pointer

All on-page copy lives in `copy.md` under `## /simulator`. If any drift appears between this doc and `copy.md`, **`copy.md` wins.**
