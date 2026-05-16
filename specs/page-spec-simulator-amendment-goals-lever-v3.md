# Aspire Spec Amendment — Priced goals (Calculator + Simulator) — v3

_Status: **DRAFT v3** (Claude, 2026-05-16). Supersedes v1 and v2 of this amendment. Pending Scott final sign-off before promotion into `specs/page-spec-calculator.md`, `specs/page-spec-simulator.md`, `specs/copy.md`, and `10_CANONICAL/Vocabulary.md`._

_v1 (`page-spec-simulator-amendment-goals-lever.md`) — Simulator-only; Scott markup preserved for audit._
_v2 (`page-spec-simulator-amendment-goals-lever-v2.md`) — Simulator-only with seeded defaults._
_v3 — adds Calculator one-field priced goal per the 2026-05-15 reversal logged in `_DRIFT_REPORT_2026-05-11.md` §11 Conflict 21. Design ancestor: V3.1 build spec at `aspire-gtm/20_PRODUCT_ENGINE/SITE_V3.1_REVIEW/07_V3.1_BUILD_SPEC_PHASE_1.md`._

---

## Why this exists

**There isn't a lot of pain without a dollar shortage.**

The Aspire Rate alone is the math. The Aspire Rate paired with a priced goal is the felt cost. A user with $75k who sees *"Aspire Rate 4.8% at these assumptions"* may not realize that a $1.5M Freedom number is unreachable at any rate inside their timeline — the gap is in starting balance, not in CAGR. The May 11 specs reset replaced V3.1's priced-goal Calculator with a qualitative basket picker on a faster-onboarding rationale. On review, that was a speed call the team reverses 2026-05-15.

The reversal is logged in `_DRIFT_REPORT_2026-05-11.md` §11 Conflict 21. This amendment is the build spec for the reversal.

Per Scott (2026-05-15): *"We need a number to anchor to, to actually show the pain. There isn't a lot of pain without a dollar shortage."*

---

## Scope

Two surfaces, two phases of editing on the same priced-goal object:

| Surface | What user does | Goals exposed |
|---|---|---|
| **Calculator** (first impression, pre-email-gate) | Edits one pre-filled priced goal tied to the basket chip they pick. | One. |
| **Simulator** (post-email-gate, full workspace) | Appends, edits, removes any number of priced goals via a new Goals lever. The Calculator's one goal carries through as the first row. | Many. |

Phasing rationale: smallest-possible Calculator diff lands the dollar-pain moment on the first impression. The Simulator is where multi-goal complexity actually fits the user's attention budget.

What this amendment does **not** do (deferred to a later phase, not killed):

- The V3.1 10-chip goal-type picker on the Calculator. Calculator stays single-goal in this phase.
- Asset-unit goals ("own 5 BTC"). V4 territory.
- Goal prioritization / sequencing across multiple goals. v1 treats goals as independent.
- Probabilistic Monte Carlo coverage. v1 is single-trajectory.

---

## §0 — Calculator change (one priced goal)

The Calculator's existing Home / Family / Freedom chip picker stays. A new editable dollar-amount row appears beside the chips, pre-filled with a Hermes-grounded median that matches the chip selection.

### Anatomy

```
What life are you trying to afford?

[ Home ]  [ Family ]  [ Freedom ]
                 ↑ selection drives the seeded amount below

I'm aiming at:  [ $420,000 ]   in   [ 7 ] years

helper: One goal sets the headline. You'll add the rest in the Simulator.
helper (italic, smaller, under amount): NAR median existing-home price — edit to yours
```

### Field details

| Field | Default | Range | Notes |
|---|---|---|---|
| Amount in today's dollars | seeded per chip (table below) | $1k – $50M; comma-separated; reject negative | Editable on every interaction. On first edit, the source label below the field hides; the field becomes user-owned. |
| Years out | seeded per chip (table below) | 1 – 40 integer | Editable. |

### Seeded defaults per chip (Hermes-grounded 2026-05-15)

| Chip | Seeded amount | Seeded years out | Source-label copy (italic helper under amount) |
|---|---:|---:|---|
| Home | **$420,000** | matches Timeline lever (default 7) | *NAR median existing-home price — edit to yours* |
| Family | **$330,000** | 18 (matches USDA scope: birth through age 17) | *USDA estimate, CPI-inflated — edit to yours* |
| Freedom | **$2,000,000** | matches Timeline lever (default 25 for Freedom) | *25× BLS average spending — edit to yours* |

Sources (per `aspire-gtm/70_AGENT_LAB/threads/2026-05-15-goals-seed-defaults-grounding.md`):

- **Home** — NAR Existing-Home Sales, median sale price, April 2026 release. $417,700 actual, rounded to $420k. Refresh: monthly.
- **Family** — USDA *Expenditures on Children by Families, 2015* baseline ($233,610), inflated via BLS CPI-U All Items NSA from 2015 (237.017) to Apr 2026 (333.020). $328,233 calculated, rounded to $330k. Refresh: monthly via CPI; USDA baseline static.
- **Freedom** — BLS Consumer Expenditure Survey 2024 average annual expenditures ($78,535) × 25 per the 4% withdrawal-rate rule (Bengen 1994, Trinity 1998). $1,963,375 calculated, rounded to $2.0M. Refresh: annual via BLS CE.

### Behavior

- Switching chip: if the amount field is still seeded (not user-edited), reseed to the new chip's median. If the user has edited the amount, **keep their edit** — chip switch should not silently overwrite user data.
- The Aspire Rate computation uses the priced goal as the cost target (`amount × (1 + cagr)^years`), not the prior `totalAssets × component.weight` derivation. The cost growth rate (`cagr`) is still the basket-weighted blend at the user's geography — the basket sets the inflation vector; the goal sets the price.
- Submit / email-gate flow: the priced goal lands in `scenario.basket.goals[0]` with a `seeded: true|false` flag indicating whether the user edited it. Persisted through the existing `/api/score` payload and `toPersisted` / `fromPersisted` flow.

### Helper copy on the Calculator (Scott-approved 2026-05-15)

| Location | Copy | Purpose |
|---|---|---|
| Under the goal row | *One goal sets the headline. You'll add the rest in the Simulator.* | Telegraphs the Calculator/Simulator surface split as sequencing, not limitation. |
| Email-gate / submit-button supporting line | *Open the Simulator to add goals, tune assumptions, and run scenarios.* | Sharpens the CTA's value prop with three concrete verbs. |
| Under the amount field (seeded only) | *NAR median existing-home price — edit to yours* (etc., per chip) | Source label. Drops on first user edit. |

Run `npm run check:compliance` before promoting to `copy.md`. None of the above strings trip the banned-phrase list as of the May 11 compliance posture.

### Compliance pairing

The Calculator's headline Aspire Rate output **stays paired** with *"at these assumptions"* per `COMPLIANCE.md`. The new priced-goal row introduces two additional dollar surfaces that need pairing:

- The seeded amount itself: paired implicitly by the italic source-label citation. NAR / USDA / BLS citation serves as the "at these assumptions" pairing for a seeded number.
- The Calculator's "Future cost" display (if rendered post-submit on the reveal page): paired explicitly with *"at these assumptions"* per existing canon.

### Schema impact

Existing `scenario.basket.goals[]` array supports this with one additive change:

- New optional field: `seeded: boolean` (default `false` if absent). Indicates whether the source-label helper should render. Round-trips through `toPersisted` / `fromPersisted` without migration; encrypted blob shape unchanged.
- Existing fields used as-is: `label`, `amount`, `horizon`, `asset`, `growth`, `goalType`.

`buildBasket()` in `aspire/index.html:503-535` updates: `goals` becomes a single-element array carrying the user's priced goal, not a per-basket-component split. The Aspire Rate math in `lib/aspire.js` consumes this without signature change.

---

## §1 — Simulator change (Goals lever)

Adds a new lever between **Lever 4 — Target basket** and **Lever 5 — Geography**. Rationale: basket sets *which inflation vector* applies to each goal; goals live downstream of basket choice.

The Calculator's priced goal arrives as the first row in the Goals lever. The user can edit it, delete it, or append more.

### Anatomy — populated state

```
┌──────────────────────────────────────────────────┐
│ GOALS                          Δ +1.2 closed     │
│                                                  │
│  A home                                          │
│  $420,000 today · 7 yr · housing         [⋯][×]  │
│  NAR median existing-home price — edit to yours  │
│                                                  │
│  Wedding                                         │
│  $80,000 today · 2 yr · CPI              [⋯][×]  │
│                                                  │
│  [ + Add a goal ]                                │
│                                                  │
│  Total future cost: $2.10M at these assumptions  │
│                                                  │
│  current: 1 goal priced                          │
└──────────────────────────────────────────────────┘
```

Seeded rows show the italic source-label helper. User-edited or user-added rows omit it. On first edit of a seeded row, the helper drops and the row becomes user-owned.

### Empty state (only when every priced goal deleted)

```
┌──────────────────────────────────────────────────┐
│ GOALS                              0.0 unchanged │
│                                                  │
│  No priced goals.                                │
│  The basket above shapes how costs grow.         │
│  A goal turns that shape into a number.          │
│                                                  │
│  [ + Add a goal ]                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

In practice, a user arriving from the Calculator always has at least one priced goal. The empty state appears only if they delete it.

### Add-a-goal form

Inline form (desktop) or bottom sheet (mobile, per `creative-direction.md` §7):

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text, ≤40 chars | yes | placeholder: *"e.g. Home in Brooklyn"* |
| Amount in today's dollars | $ number, comma separators | yes | range $1k–$50M; reject negative |
| Years out | integer | yes | range 1–40; capped by Timeline lever |
| Inflation vector | dropdown | yes | Options: `Housing (geography CAGR)`, `Equity-linked`, `CPI`, `Healthcare`, `Childcare`, `Private K-12`, `Custom %` |
| Custom CAGR | % number | only if `Custom %` | range -5% to 25% |

`[⋯]` opens the same form prefilled for edit. `[×]` deletes with a 250ms collapse, no modal.

### Basket chip switch behavior (consistent with Calculator)

If user switches Target Basket and the Calculator-seeded goal is still in its seeded state (not user-edited): reseed amount, years out, and inflation vector to match the new basket. If user edited it: keep their edit. Same rule as the Calculator.

### Math

- Each goal: `future_value = amount × (1 + cagr)^years_out` where `cagr` is the resolved rate for the chosen inflation vector (housing resolves through Geography lever).
- "Total future cost" line at lever bottom = `Σ future_value` across all goals — paired with *"at these assumptions"*.
- "Required CAGR for this goal" computed for observation panel use only; never surfaced as a primary metric (reads too easily as a recommendation).
- **Aspire Rate (sticky header) — clarified 2026-05-16:** the Aspire Rate metric reflects the **priced goal's primary inflation vector**, not a basket-weighted blend across all components. On the Calculator (single priced goal) it equals that goal's vector. On the Simulator (multi-goal) it is the **dollar-weighted CAGR across priced goals' vectors** — each goal contributes its own inflation vector weighted by its inflated future value. The basket weights remain visible in Block C's bar chart as inflation context, but no longer compute the rate. _Per the deviation-canonized review of PR #28; full provenance in `_DRIFT_REPORT_2026-05-11.md` §11 Conflict 21 sub-resolution._

---

## §2 — Trajectory chart change (resolves v2 chart layer)

Priced goals redefine the existing **"What you need"** line as the running total of inflated goal costs over time. No horizontal goal-line clutter. The intersection of the two existing lines remains the read.

- "What you need" line renders as a **step function**: it jumps up at each goal's target year by that goal's inflated value. Between goal years it grows at the inflation vector's CAGR.
- Each step gets a small tick at the x-axis with the goal name (Inter 500 11px muted, e.g. *"Wedding"* at year 2, *"A home"* at year 7). Truncate to 14 chars + ellipsis.
- Hover over a tick: tooltip shows *"{goal name} — ${future_value} in {N} yr at these assumptions"*.
- The existing crossover Δ marker carries the read: when "What you're building" overtakes the running "What you need" total, the marker labels *"Clears all priced goals at year {N} at these assumptions"*. Singular: *"Clears {goal name} at year {N} at these assumptions"*.
- If "What you're building" clears some goals but not others: line is in `--gain` shading between clearance points and `--loss` shading after. Defer specifics to creative-direction.
- No new color introduced. Existing `--gain` / `--loss` shading and the two existing line colors do the work.

---

## §3 — Sticky header (new conditional metric)

Add a **fourth header metric, conditional** — only renders when ≥1 goal is priced (the default state for any user arriving from the Calculator):

```
Goal coverage     94%
                  AT THESE ASSUMPTIONS
```

Definition: `min(1, projected_portfolio_at_target_year / total_future_cost_at_target_year)`. With multiple goals at different years: weight by future value. Coverage ≥ 100% caps display at "100%" with a `--gain` tint; coverage < 100% shows the actual number; below 70% takes the `--loss` tint.

Header grid becomes 4 columns on desktop; stacks per existing breakpoints in `simulator/index.html` line 122.

---

## §4 — Summary cards (existing grid below chart)

Existing cards: `Future cost`, `Projected resources`, `Dollar gap`, `Coverage`. Computation becomes priced-goal-aware:

- **Future cost** = sum of inflated priced goals (always populated post-Calculator).
- **Coverage** = same definition as the new header metric.

No new cards, no layout change.

---

## §5 — Observation panel (new card template)

Add one template to `aspire/lib/simulator/observations.js`:

| Template | Fires when | Example observation | Pointer |
|---|---|---|---|
| Goal short | ≥1 priced goal AND projected_portfolio < goal_future_value at goal's target year | *"At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}."* | → No pointer. Descriptive; levers above are where the user moves. |

Do **not** add a "Goal cleared" celebration card — preserves the editorial-not-promissory posture. The chart's crossover Δ marker is sufficient.

---

## §6 — Vocabulary.md entry

Single new entry for `10_CANONICAL/Vocabulary.md`:

> **Goal** — a priced future cost anchored to the user's life. Has three required fields: a name, an amount in today's dollars, a target year. Has one resolved field: an inflation vector (housing / equity-linked / CPI / healthcare / childcare / private K-12 / custom %), which determines how the today's-dollar amount inflates to its future value. Goals are user-editable on both the Calculator (one goal, pre-filled from basket choice) and the Simulator (Goals lever, multi-goal). The Aspire Rate without a priced Goal is a number without an anchor.

No collision with `Target Aspire Rate` — "Target" there is the *aspirational rate read* (Aspire Rate + margin); "Goal" here is the *dollar anchor*.

---

## §7 — Out of scope (deferred, not killed)

- V3.1's full 10-chip goal-type picker on the Calculator (Home, College, Retirement, Wedding, Car, Children, Time off, Business, …). Calculator stays single-goal in this phase. Revisit after Option 2 ships and we have opt-in / engagement signal.
- Cost-basis-aware affordability.
- Goal prioritization / sequencing.
- Probabilistic Monte Carlo coverage.
- Goal templates / suggestions beyond the basket-tied seed.
- The V3.1 hero copy *"Tell us what life you're trying to afford. We'll show you the rate your money has to grow to get there."* — recommend revisiting in a separate voice pass; not in scope here.

---

## §8 — Tasks generated by this amendment

1. **Hermes — complete.** Seeded values landed in `aspire-gtm/70_AGENT_LAB/threads/2026-05-15-goals-seed-defaults-grounding.md`.
2. **Claude — spec promotion.** Fold §0 into `specs/page-spec-calculator.md`; §1–§5 into `specs/page-spec-simulator.md`; copy block (below) into `specs/copy.md`; the §6 entry into `10_CANONICAL/Vocabulary.md`. All four edits in one PR.
3. **Claude — drift report cross-reference.** `_DRIFT_REPORT_2026-05-11.md` §11 Conflict 21 references this amendment. Verify links resolve after spec promotion.
4. **Codex — Calculator implementation.** Branch `codex/calculator-priced-goal`. Adds the one new field, the basket-keyed seed loader, the source-label helper, the chip-switch reseed rule, the `seeded` flag in the goal object, the `buildBasket()` rewrite, the helper copy, the CTA supporting line. Updates `lib/aspire.js` if needed (verify `project()` math accepts the new single-goal shape).
5. **Codex — Simulator implementation.** Branch `codex/simulator-goals-lever`. Adds the Goals lever UI, add-goal form, step-function chart change, conditional header metric, Goal short observation template. Verifies Calculator's priced goal carries through as the first row.
6. **STATUS.md entry** in `aspire/STATUS.md` under "Currently in flight" before either Codex branch starts. Format per existing convention.

Order: spec promotion first (Claude), then Codex Calculator branch, then Codex Simulator branch. Calculator change is the smaller and earlier shippable; Simulator can follow in a separate PR without blocking the Calculator going live.

---

## §9 — Draft copy block (for promotion to `specs/copy.md`)

### Calculator (new lines)

**Goal row helper (under amount + years fields):**
> One goal sets the headline. You'll add the rest in the Simulator.

**Source labels (italic helper under seeded amount; drops on user edit):**
> *NAR median existing-home price — edit to yours*
> *USDA estimate, CPI-inflated — edit to yours*
> *25× BLS average spending — edit to yours*

**Email-gate / submit supporting line:**
> Open the Simulator to add goals, tune assumptions, and run scenarios.

### Simulator (new lines)

**Lever header:** Goals

**Empty state (only after all priced goals deleted):**
> No priced goals.
> The basket above shapes how costs grow. A goal turns that shape into a number.

**Add button:** + Add a goal

**Form labels:**
- Name — *"What is this?"*
- Amount — *"In today's dollars"*
- Years out — *"When do you want it?"*
- Inflation vector — *"How does this cost grow?"*

**Form helper (below inflation dropdown):**
> *We inflate this goal at the rate that matches it — housing at your zip's CAGR, education at K–12 CPI, etc. Change the basket above to change the menu.*

**Total line (lever bottom):**
> Total future cost: $X.XM at these assumptions

**Header metric label:** Goal coverage
**Header metric tooltip:**
> *Your projected portfolio at the goal's target year, divided by the goal's inflated cost. At these assumptions.*

**Chart x-axis tick (per goal year):**
> {goal name truncated to 14 chars}

**Chart tick tooltip:**
> {goal name} — ${future_value} in {N} yr at these assumptions

**Chart crossover annotation (all goals clear within timeline):**
> Clears all priced goals at year {N} at these assumptions

**Chart crossover annotation (single goal):**
> Clears {goal name} at year {N} at these assumptions

**Observation card — Goal short (variants):**
> At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}.

> {Goal name} prices at ${Y} in {N} years at these assumptions. Your projected portfolio at year {N} is ${Z} — a ${Y−Z} shortfall.

> Your trajectory doesn't cross {goal name} within the timeline at these assumptions. The gap at year {N} is ${Y−Z}.
