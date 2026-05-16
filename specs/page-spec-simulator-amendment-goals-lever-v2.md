# Simulator Spec Amendment — Goals lever (priced goals) — v2

_Status: **DRAFT v2** (Claude, 2026-05-15). Proposed amendment to `page-spec-simulator.md`. v1 + Scott's markup resolved; awaiting final Scott sign-off before promotion to canon and Codex implementation._

_v1 history: `page-spec-simulator-amendment-goals-lever.md` (with Scott's inline markup, preserved for audit trail)._

---

## Why this exists

The Aspire Rate tells the user the math they need to hit. A **priced goal** tells the user whether the math is even reachable from where they start. Both are required for the read to mean anything.

Today the Simulator stops at the rate. A user with $75k can run the Simulator, see "Aspire Rate 4.8% at these assumptions," and not know that a $1.5M Freedom number is unreachable at any rate inside the timeline — the gap is in starting balance and contribution, not in CAGR. The Target Basket lever picks the *shape* of a life (Home / Family / Freedom). It does not price it.

This amendment lets the user enter priced goals (today's dollars + target year + inflation vector), inflates them using the existing basket-weighted cost-growth math, and threads the result through the existing "What you need" line on the trajectory chart. The Aspire Rate / Aspire Gap math is unchanged. This adds a **dollar-based read** alongside the existing **rate-based read** — it does not replace it.

---

## What changes

### New Lever 7 — Goals

Inserts between **Lever 4 — Target basket** and **Lever 5 — Geography**. Rationale: basket sets *which inflation vector* applies to each goal; goals live downstream of basket choice. Geography sets the housing CAGR that the housing inflation vector resolves to.

Card anatomy follows existing lever pattern. Header label: **Goals**. Δ tag fires when goals are added, removed, or edited from baseline.

**Empty state — only renders if seeded defaults were dismissed.** Default-seeded state is the norm (see §"Seeded defaults" below).

```
┌──────────────────────────────────────────────────┐
│ GOALS                              0.0 unchanged │
│                                                  │
│  You haven't priced a goal yet.                  │
│  The basket above shapes how costs grow.         │
│  A goal turns that shape into a number.          │
│                                                  │
│  [ + Add a goal ]                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Populated state (seeded or user-added):**

```
┌──────────────────────────────────────────────────┐
│ GOALS                          Δ +1.2 closed     │
│                                                  │
│  A home                                          │
│  $420,400 today · 7 yr · housing         [⋯][×]  │
│  Median US existing-home price — edit to yours   │
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

Seeded rows include a small italic helper line under the amount-and-year line (Inter 400 12px muted) naming the source and inviting edit. User-added rows omit that line. Once a seeded row is edited, the helper line drops away — the row becomes user-owned.

### Seeded defaults (resolves v1 Q2)

When the user lands on the Simulator for the first time, the Goals lever pre-populates one or more goals based on their **Target basket** choice. Every seeded value is anchored to a published median or a clearly-labeled rule-of-thumb. The user can edit or delete each in one tap.

| Basket | Seeded goal(s) | Today's $ | Years out | Inflation vector | Source / label |
|---|---|---|---|---|---|
| Home | "A home" | $420,400 | matches Timeline | Housing | NAR US median existing-home sale price (Q1 2026 — **Hermes to verify before promotion**) |
| Family | "Raise a child to 18" | $310,605 | 18 | CPI | USDA *Expenditures on Children by Families* (last issued 2017, inflated to 2026 via CPI — **Hermes to verify**) |
| Family | "A home" | $420,400 | matches Timeline | Housing | (same as Home basket) |
| Freedom | "Financial freedom" | $1,500,000 | matches Timeline | Equity-linked | Heuristic: 25× $60k annual spend at the 4% rule — **labeled as a rule-of-thumb anchor, not a published median.** Hermes to assess whether a stronger anchor exists. |

Seed behavior rules:

- Seeded goals render with a one-line italic source label *"Median US existing-home price — edit to yours"* (Inter 400 12px muted).
- The source label is non-removable until the user **edits** the goal. On first edit the row converts to a user-owned row and the source label disappears.
- The `[×]` button deletes a seeded goal exactly like a user goal — no "are you sure you want to skip this default" friction.
- If the user changes Basket lever after seeded goals were edited, **already-edited goals stay as-is**. Newly added seeded goals (e.g. switching Home → Family adds a "Raise a child" goal) append; existing user-edited goals never get overwritten.
- If the user changes Basket lever and the original seed rows were untouched, the lever fully refreshes to the new basket's seeded defaults.

**Open data risk to flag:** the Freedom $1.5M is the softest of the three. Recommend Hermes scope a task — "ground the Freedom seed in a defensible source, or downgrade to an explicit rule-of-thumb anchor" — before Codex builds. If no defensible source surfaces, the seed copy says *"A common rule-of-thumb target — edit to your number"* and lives with that.

### Add-a-goal interaction

`+ Add a goal` opens an inline form (desktop) or bottom sheet (mobile, per `creative-direction.md` §7):

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text, ≤40 chars | yes | placeholder: *"e.g. Home in Brooklyn"* |
| Amount in today's dollars | $ number, comma separators | yes | range $1k–$50M; reject negative |
| Years out | integer | yes | range 1–40; capped by Timeline lever |
| Inflation vector | dropdown | yes | Options: `Housing (geography CAGR)`, `Equity-linked`, `CPI`, `Healthcare`, `Childcare`, `Private K-12`, `Custom %` |
| Custom CAGR | % number | only if `Custom %` | range -5% to 25% |

`[⋯]` on an existing goal opens the same form prefilled (edit). `[×]` deletes with a 250ms collapse, no modal.

### Math (already supported by schema)

- Each goal: `future_value = amount × (1 + cagr)^years_out`, where `cagr` is the resolved rate for the chosen inflation vector (housing resolves through Geography lever).
- "Total future cost" line at lever bottom = `Σ future_value` across all goals — labeled with *"at these assumptions"*.
- "Required CAGR for this goal" is computed for use in the observation panel only; never surfaced as a primary metric because it reads too easily as a recommendation.

### Compliance

Every dollar figure surfaced by this lever pairs with *"at these assumptions"* per `COMPLIANCE.md`. Specifically:

- **"Total future cost: $X.XM at these assumptions"** — pairing inline, non-removable.
- **Goal row amount** — no pairing required on the row itself (the row is the user's input echoed back). Hover tooltip showing the inflated future value (*"$420,400 today → $649,000 in 7 yr at these assumptions"*) requires pairing.
- **Source labels on seeded goals** — every seeded amount cites a source. The source citation itself serves as the "at these assumptions" pairing for the seeded number.
- **Chart annotations** — pairing carried by the chart's existing `AT THESE ASSUMPTIONS` header treatment.

Banned patterns in copy:
- *"You can afford…"* / *"You'll have enough"* — outcome promise.
- *"Recommended timeline"* / *"You should price…"* / *"Locked in"* — prescriptive.
- *"Reach your goal by year N"* is **allowed** when used as the existing §7 crossover descriptor — it describes the line, not a promise. Stays scoped to the chart annotation.

Run `npm run check:compliance` against the final copy before merge.

---

## Downstream changes to existing surfaces

### §7 Trajectory chart — resolves v1 Q5

**The goal layer is not a new layer.** Priced goals redefine the existing **"What you need"** line as the running total of inflated goal costs over time. No horizontal goal-line clutter. The intersection of the two existing lines remains the read.

Specific changes:

- "What you need" line renders as a **step function**: it jumps up at each goal's target year by that goal's inflated value. Between goal years it grows at the inflation vector's CAGR. This is honest about *when* each cost actually comes due rather than amortizing it smoothly across the timeline.
- Each step gets a small tick at the x-axis with the goal name (Inter 500 11px muted, e.g. *"Wedding"* at year 2, *"A home"* at year 7). Truncate to 14 chars + ellipsis to prevent overlap.
- Hover over a tick: tooltip shows *"{goal name} — ${future_value} in {N} yr at these assumptions"*.
- The existing crossover Δ marker carries the read: when "What you're building" overtakes the running "What you need" total, the marker labels *"Clears all priced goals at year {N} at these assumptions"*. Singular goal: *"Clears {goal name} at year {N} at these assumptions"*.
- If "What you're building" clears some goals but not others (e.g. wedding cleared, home not): the line is in `--gain` shading between clearance points and `--loss` shading after. Specifics for Codex/creative-direction.
- No additional color introduced. Existing `--gain` / `--loss` shading and the two existing line colors do the work.

### §4 Sticky header — new metric (resolves v1 Q3)

Add a **fourth header metric, conditional** — only renders when ≥1 goal is priced (seeded or user-added):

```
Goal coverage     94%
                  AT THESE ASSUMPTIONS
```

Definition: `min(1, projected_portfolio_at_target_year / total_future_cost_at_target_year)`. With multiple goals at different years: weight by future value. Coverage ≥ 100% caps display at "100%" with a `--gain` tint; coverage < 100% shows the actual number; below 70% takes the `--loss` tint.

Header grid becomes 4 columns on desktop; stacks per existing breakpoints in `simulator/index.html` line 122.

### §7 Summary cards (existing grid below chart)

Existing cards: `Future cost`, `Projected resources`, `Dollar gap`, `Coverage`. These already exist. With this amendment their computation becomes priced-goal-aware:

- **Future cost** = sum of inflated priced goals (or, if zero goals priced — i.e., user deleted every seed — falls back to the current implicit basket cost so the card never goes blank).
- **Coverage** = same definition as the new header metric.

No new cards; no layout change.

### §8 Observation panel — new card template

Add one template to `aspire/lib/simulator/observations.js`:

| Template | Fires when | Example observation | Pointer |
|---|---|---|---|
| Goal short | ≥1 priced goal AND projected_portfolio < goal_future_value at goal's target year | *"At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}."* | → No pointer. Descriptive; levers above are where the user moves. |

Do **not** add a "Goal cleared" celebration card — preserves the editorial-not-promissory posture. The chart's crossover Δ marker is sufficient.

---

## Schema impact

The existing `scenario.basket.goals` array in [aspire/lib/aspire.js](aspire/lib/aspire.js) already supports goals with `amount`, `horizon`, `growth`, `asset`. **No schema change required.**

What changes is the **user-editable surface**: today goals are written by the Calculator and read by the Simulator's math, but never user-edited inside the Simulator. The amendment exposes that array to direct user editing and adds a `seeded: true/false` flag (or equivalent) so the source-label helper line knows when to render.

Persistence: goals already flow through `toPersisted` / `fromPersisted` in [aspire/lib/schema.js](aspire/lib/schema.js). Codex to verify the new `seeded` flag round-trips through the encrypted scenario blob — should be a small addition, not a migration.

---

## Vocabulary.md entry (proposed)

Single new entry for `10_CANONICAL/Vocabulary.md`:

> **Goal** — a priced future cost anchored to the user's life. Has three required fields: a name, an amount in today's dollars, a target year. Has one resolved field: an inflation vector (housing / equity-linked / CPI / healthcare / childcare / private K-12 / custom %), which determines how the today's-dollar amount inflates to its future value. Goals are user-editable in the Simulator only; the Calculator stays qualitative ("what life") and does not collect prices. Aspire Rate without a Goal is a number without an anchor.

No conflict with `Target Aspire Rate` — "Target" there is the *aspirational rate read* (Aspire Rate + margin); "Goal" here is the *dollar anchor*. Different mental registers, different surfaces.

---

## Out of scope (deferred)

- Cost-basis-aware affordability (would require holdings cost basis the user doesn't have).
- Goal prioritization / sequencing (e.g. "wedding first, then home"). v1 treats goals as independent.
- Probabilistic Monte Carlo coverage (e.g. "70% probability of clearing the goal"). v1 is single-trajectory.
- Goal templates beyond the basket-tied seeds (no "typical wedding: $35k" library in v1).
- Auto-import goals from the Calculator's "what life" picker — Calculator stays qualitative; pricing is a Simulator-only act in v1.

All defensible deferrals — see `BUSINESS_MODEL.md` and `content-architecture.md` §12 for paid-tier reserve patterns.

---

## Tasks generated by this amendment

Before Codex implementation can start:

1. **Hermes task** — verify NAR median home price (Q1 2026), inflate USDA child-rearing cost from 2017 baseline to 2026 via CPI with timestamp, and either ground the Freedom $1.5M number in a defensible source or confirm we ship it as an explicit rule-of-thumb anchor with the 25×-at-4% derivation cited.
2. **Claude task — spec promotion** — fold this v2 into `specs/page-spec-simulator.md` as a proper §5.4 (and re-number §5.5 Geography → §5.6 / §5.6 Configurable CAGR → §5.7); update §4 header spec, §7 trajectory chart spec, §8 observation panel spec inline.
3. **Claude task — copy promotion** — promote the draft copy block (below) into `specs/copy.md` §Simulator. Run `npm run check:compliance` before merge.
4. **Claude task — vocabulary** — add the `Goal` entry to `10_CANONICAL/Vocabulary.md`.
5. **Codex task — implementation** — branch `codex/simulator-goals-lever`. Add `seeded` flag to schema. Build the lever UI, the form, the seeded-default loader keyed off basket. Update [aspire/lib/simulator/observations.js](aspire/lib/simulator/observations.js) with the Goal-short template. Update the chart's "What you need" line to step-function with goal ticks. Add the conditional fourth header metric.
6. **STATUS.md entry** — added by whichever agent starts first, under "Currently in flight."

---

## Draft copy block (for promotion to `copy.md` §Simulator on accept)

**Lever header:** Goals

**Empty state (only after all seeded defaults deleted):**
> You haven't priced a goal yet.
> The basket above shapes how costs grow. A goal turns that shape into a number.

**Seed source labels:**
> *Median US existing-home price — edit to yours*
> *USDA child-rearing estimate, inflated to today — edit to yours*
> *A common rule-of-thumb target — edit to yours*

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
