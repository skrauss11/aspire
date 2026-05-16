# Simulator Spec Amendment — Goals lever (priced goals)

_Status: **DRAFT** (Claude, 2026-05-15). Proposed amendment to `page-spec-simulator.md`. Awaiting Scott review before Codex implementation._

---

## Why this exists

The Simulator today computes a **rate** (Aspire Rate) but never asks the user **how much the life costs in dollars.** The Target Basket lever picks a *shape* of life (Home / Family / Freedom) which drives the cost-growth CAGR, but the user can't say "I want a $1.75M home in 7 years" and see whether their trajectory clears that bar.

Result: a user with $400k in assets can run the Simulator, see "Aspire Rate 4.8% at these assumptions," and still not know whether their actual goal — a specific home, a specific wedding, a specific retirement number — is reachable. The basket abstracts away the one variable that determines affordability: **price.**

This amendment adds a **Goals** lever that lets the user enter priced goals (today's dollars + year), inflates them with the existing basket-weighted cost-growth math, and renders them as horizontal target lines on the trajectory chart. The Aspire Rate / Aspire Gap math is unchanged. This adds a **dollar-based read** alongside the existing **rate-based read** — it does not replace it.

---

## What changes

### New Lever 7 — Goals

Inserts between **Lever 4 — Target basket** and **Lever 5 — Geography**. (Rationale: basket sets *which inflation vector* applies to each goal; goals live downstream of basket choice.)

Card anatomy follows existing lever pattern. Header label: **Goals**. Δ tag fires when goals are added, removed, or edited from baseline.

**Empty state (no goals priced yet):**

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

**Populated state:**

```
┌──────────────────────────────────────────────────┐
│ GOALS                          Δ +1.2 closed     │
│                                                  │
│  Home in Brooklyn                                │
│  $1,750,000 today · 7 yr · housing       [⋯][×]  │
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

### Add-a-goal interaction

`+ Add a goal` opens an inline form (desktop) or bottom sheet (mobile, per `creative-direction.md` §7):

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text, ≤40 chars | yes | placeholder: *"e.g. Home in Brooklyn"* |
| Amount in today's dollars | $ number, comma separators | yes | range $1k–$50M; reject negative |
| Years out | integer | yes | range 1–40; capped by Timeline lever |
| Inflation vector | dropdown | yes | Options: `Housing (geography CAGR)`, `Equity-linked`, `CPI`, `Healthcare`, `Childcare`, `Private K-12`, `Custom %` |
| Custom CAGR | $ number, % | only if `Custom %` | range -5%–25% |

`[⋯]` on an existing goal opens the same form prefilled (edit). `[×]` deletes with a 250ms collapse, no modal.

### Math (already supported by schema)

- Each goal: `future_value = amount × (1 + cagr)^years_out` where `cagr` is the resolved rate for the chosen inflation vector at the chosen geography.
- "Total future cost" = `Σ future_value` across all goals.
- "Required CAGR for this goal" (shown in the trajectory tooltip): `(future_value / current_assets_share)^(1/years_out) − 1`. Not surfaced as a primary metric — too easily misread as a recommendation.

### Compliance

Every dollar figure surfaced by this lever must pair with *"at these assumptions"* per `COMPLIANCE.md`. Specifically:

- **"Total future cost: $2.10M at these assumptions"** — pairing inline, non-removable.
- **Goal row** — no pairing required on the row itself (the row is the user's input echoed back), but the inflated value tooltip on hover (*"$1.75M today → $2.70M in 7 years"*) requires pairing.
- **Chart annotations** — pairing carried by the chart's existing "AT THESE ASSUMPTIONS" header treatment.

Banned patterns to avoid in copy:
- *"You can afford…"* / *"You'll have enough"* — outcome promise.
- *"Reach your goal by…"* — fine when describing the **crossover point** the chart already labels (it's descriptive of the line, not a promise). The existing spec §7 already uses *"You reach your goal at year 23"* — keep that phrasing, scope unchanged.
- *"Recommended timeline"* / *"You should price…"* — prescriptive.

---

## Downstream changes (existing surfaces)

### §7 Trajectory chart

Add a **goal layer** behind the two existing lines:

- Each goal renders as a horizontal dashed line at its inflated future value, anchored at its target year (x).
- Color: a 4th color from the existing palette — proposed `--violet` (`#8b789d`, already in `:root`). Reuse, don't add.
- Label at the line end: *"Home in Brooklyn — $2.7M"* (Inter 500 12px, muted, right-aligned).
- If "What you're building" crosses the goal line **before** the goal's target year: render a small Δ marker at the crossover, label *"Clears Home in Brooklyn at year 5 at these assumptions"*.
- If it doesn't cross: no annotation. The visual gap is the read.
- Multiple goals stack as multiple lines. Beyond 4 goals, group remaining under a single muted "+ 3 more goals" line at the sum.

### §4 Sticky header — new metric

Replace one of the existing three header metrics? No — preserve all three (Aspire Rate, Aspire Gap, vs. Current). Add a **fourth metric, conditional**: only renders when ≥1 goal is priced.

```
Goal coverage     94%
                  AT THESE ASSUMPTIONS
```

Definition: `min(1, projected_portfolio_at_target_year / total_future_cost_at_target_year)`. If multiple goals at different years: weight by future value. Coverage > 100% caps display at "100%" with a `--gain` tint; coverage < 100% shows the actual number with a `--loss` tint when below 70%.

This is the **dollar read** the rate-based metrics don't give. It belongs in the header.

Header grid becomes 4 columns on desktop, stacks on tablet/mobile per existing breakpoints in `simulator/index.html` line 122.

### Summary cards (existing §7 grid below chart)

Currently: `Future cost`, `Projected resources`, `Dollar gap`, `Coverage`. These already exist — they're just opaque today because Future cost is implicit from the basket, not editable.

With this amendment, those four cards become **the priced-goal read** rather than the basket-derived read. No new cards needed. The cards' computation changes:

- **Future cost** = sum of inflated priced goals (or, if no goals priced, falls back to current implicit basket cost — preserves baseline behavior).
- **Coverage** = same definition as the new header metric.

### §8 Observation panel — new card template

Add one template to `aspire/lib/simulator/observations.js`:

| Template | Fires when | Example observation | Pointer |
|---|---|---|---|
| Goal short | ≥1 priced goal AND projected_portfolio < goal_future_value at goal's target year | *"At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}."* | → No pointer. The card is descriptive; the levers above are where the user moves. |

Do **not** add a "Goal cleared" celebration card — preserves the editorial-not-promissory posture. The chart's crossover Δ marker is sufficient.

---

## Schema impact

The existing `scenario.basket.goals` array in [aspire/lib/aspire.js](aspire/lib/aspire.js) already supports goals with `amount`, `horizon`, `growth`, `asset`. **No schema change required.**

What changes is the **user-editable surface**: today goals are written by the Calculator and read by the Simulator's math, but never user-edited inside the Simulator. The amendment exposes that array to direct user editing.

Persistence: goals already persist through the existing `toPersisted` / `fromPersisted` flow in [aspire/lib/schema.js](aspire/lib/schema.js). Codex to verify no encryption-shape changes are needed (goals are part of the encrypted scenario blob — should be a no-op).

---

## Out of scope (deferred)

- Cost-basis-aware affordability (would require holdings cost basis the user doesn't have).
- Goal prioritization / sequencing (e.g. "wedding first, then home"). v1 treats goals as independent.
- Probabilistic Monte Carlo coverage (e.g. "70% probability of clearing the goal"). v1 is single-trajectory.
- Goal templates / suggestions ("typical wedding: $35k").
- Auto-import goals from the Calculator's "what life" picker — Calculator stays qualitative; pricing is a Simulator-only act in v1.

These are all defensible deferrals — see `BUSINESS_MODEL.md` and `content-architecture.md` §12 for paid-tier reserve patterns.

---

## Copy file pointer

Add to `specs/copy.md` §Simulator a new subsection for Goals lever copy. Specifically:

- Empty-state body copy
- Add-goal form labels and placeholders
- Chart goal-line label format
- Header "Goal coverage" tooltip
- Observation card "Goal short" template + 2–3 variants

Draft copy lives at the bottom of this amendment file; promote to `copy.md` on accept.

---

## Open questions for Scott

1. **Terminology.** "Goals" reads neutral. "Priced goals" is more honest about what they are. "Targets" collides with "Target Aspire Rate." `10_CANONICAL/Vocabulary.md` doesn't have an entry yet — what do we call them? Scott: I don't see why this collides with the Aspire Rate. In order for the rate to actually matter to the person you need a goal anchored in some type of cost. If my goal is Freedom (which by likely needs you to have $1.5M+) the Aspire Rate alone does not give you enough information. If I'm starting at $75,000, I literally have zero chance at hitting that goal no matter my Aspire Rate. If you think there is conflict can you propose a recommended update?
2. **Default state.** Should the Goals lever start empty for everyone, or seeded with one goal pulled from the Calculator's "what life" choice (e.g. selecting "Home" pre-fills a $X goal with a placeholder price)? **Recommend empty** — prefilling a fake price would violate the "no fake data presented as real" principle. Scott: Let's assume some average starting price points. Median Home Price, Avg. Cost of a Family. Let's also assume that you want to have at least $1.5M for total freedom
3. **Header metric trade.** Adding "Goal coverage" makes the sticky header 4 columns. Acceptable on desktop, tight on tablet. Alternative: only show Goal coverage in the summary card grid below the chart, not in the header. **Recommend header inclusion** — the dollar read is what the user came for once they've priced a goal. Scott: agreed, this is good
4. **Mobile interaction.** Add-goal as a bottom sheet matches existing pattern. But the goal row with edit/delete needs a clean mobile treatment — swipe-to-delete or tap-to-expand. Defer to Codex on the pattern that fits the existing mobile spec. Scott: ok,sounds good
5. **Goal-line crowding on chart.** Four+ goals on the trajectory chart will look busy. The proposed "+ 3 more goals" sum line is one option. Worth a creative-direction pass before Codex builds. Scott: Does there need to be a specific goal line? It still is all about the rate and which your money grows, versus how much the costs grow. Perhaps we can just point out the intersection of the two?

---

## Recommended next step

If Scott accepts this amendment:

1. Claude merges this draft into `specs/page-spec-simulator.md` as a proper §5.4 (re-numbering existing §5.5 Geography → §5.6 etc.) and an addendum to §4, §7, §8. (Spec edit, no code.)
2. Claude updates `specs/copy.md` with the new copy block.
3. Claude updates `10_CANONICAL/Vocabulary.md` with the chosen terminology.
4. Codex picks up implementation as a separate PR — branch `codex/simulator-goals-lever`.
5. STATUS.md entry under "Currently in flight" before either of us starts.

---

## Draft copy block (for promotion to copy.md)

**Lever header:** Goals

**Empty state:**
> You haven't priced a goal yet.
> The basket above shapes how costs grow. A goal turns that shape into a number.

**Add button:** + Add a goal

**Form labels:**
- Name — *"What is this?"*
- Amount — *"In today's dollars"*
- Years out — *"When do you want it?"*
- Inflation vector — *"How does this cost grow?"*

**Form helper (below inflation dropdown):**
> *We inflate this goal at the rate that matches it — housing at your zip's CAGR, education at K–12 CPI, etc. Change the basket above to change the menu.*

**Total line:**
> Total future cost: $X.XM at these assumptions

**Header metric label:** Goal coverage
**Header metric tooltip:**
> *Your projected portfolio at the goal's target year, divided by the goal's inflated cost. At these assumptions.*

**Chart annotation (crossover):**
> Clears {goal name} at year {N} at these assumptions

**Chart annotation (no crossover, end of line):**
> {goal name} — ${Y.Y}M

**Observation card — Goal short (variants):**
> At your target year, your projected portfolio covers {X}% of {goal name} at these assumptions. The shortfall is ${Y}.

> {Goal name} prices at ${Y} in {N} years at these assumptions. Your projected portfolio at year {N} is ${Z} — a ${Y−Z} shortfall.

> Your trajectory doesn't cross {goal name} within the timeline at these assumptions. The gap at year {N} is ${Y−Z}.
