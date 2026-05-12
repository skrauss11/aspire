# Aspire — Master Design + Product Brief (v2)

_Replaces aspire-claude-design-brief.md. Drafted 2026-05-11 with Scott Krauss. Reconciled with existing `aspire/` canon 2026-05-11 — see `_DRIFT_REPORT_2026-05-11.md` for resolution log._

**Authority:** This brief is canonical for product/design direction. It supersedes the design-direction sections of `aspire/POSITIONING.md`, `aspire/PRODUCT_DNA.md`, and `aspire/CONTENT_STRATEGY.md` where they conflict. Existing canon retains authority for: ICP (`aspire/ICP.md`), compliance posture (`aspire/COMPLIANCE.md`), engineering rules (`aspire/TECHNICAL_CONTEXT.md`), agent workflow (`aspire/AGENT_WORKFLOW.md`), and the Vocabulary appendix (`aspire/10_CANONICAL/Vocabulary.md`, updated to match this brief).

Aspire is a personal inflation index. It gives people the right denominator — the rate of return their money actually needs to earn to keep up with the life they want — and the gap between that target and where they are today. The site is a publication about personal inflation with a calculator and a simulator at its center.

---

## 1. The product — Aspire Rate, Target Aspire Rate, and Aspire Gap

The named numbers Aspire produces:

**Aspire Rate** — the required money-growth rate to cover the priced future at the user's current assumptions.

> Aspire Rate = 5-year trailing CAGR of your goals basket

This is the *floor*. At exactly this rate, your money keeps pace with the cost of the life you want — break-even, no margin.

**Target Aspire Rate** — Aspire Rate plus a margin of safety, so hitting it means you're ahead of the floor, not at it.

> Target Aspire Rate = Aspire Rate + margin of safety (default +1%)

The margin is tunable in the Simulator (conservative: +2%, aggressive: +0.5%). Surfaced as the aspirational target separate from the required floor.

**Aspire Gap** — the delta between what your money is actually earning and your Aspire Rate.

> Aspire Gap = (your money growth rate) − Aspire Rate
>
> Positive Aspire Gap = your resources are outpacing the cost of the life you want (good).
> Negative Aspire Gap = the life you want is getting expensive faster than your resources are growing (typical case at first run).

Worked example:
- Goals basket (a home in your zip + a year of family expenses) inflates at 10.2% over 5 years.
- Your **Aspire Rate is 10.2%** (the required floor).
- Your **Target Aspire Rate is 11.2%** (with the default +1% margin).
- Your portfolio is allocated to earn ~5.2% expected.
- Your **Aspire Gap is −5.0 points** (you're behind the floor by 5 points).
- Your Target Aspire Gap is −6.0 points (you're behind the target by 6 points).

The Calculator surfaces Aspire Rate and Aspire Gap (against the floor — the foundational numbers). The Simulator adds a margin-of-safety lever that toggles the displayed rate to Target Aspire Rate and the gap to Target Aspire Gap.

### Why "Rate" and "Gap" — two named concepts, not one

Two named numbers give you two distinct things to put on screen, two distinct things to discuss, and two distinct things to write about. "My Aspire Rate is 10%" is a memorable identity number people can carry around. "My Aspire Gap is −5 points" is the thing the Simulator solves for. They work as a pair: the Rate defines the floor, the Gap measures the distance.

### Compliance pairing — non-negotiable

Every surfaced Aspire Rate, Target Aspire Rate, money growth value, or Aspire Gap value in user-facing copy or UI **must be paired with "at these assumptions"** or equivalent contextualizing language. This is enforced via `npm run check:compliance` and is required by `aspire/COMPLIANCE.md`. Do not ship a rate or gap without the pairing.

### CAGR baseline

All baseline rates use **5-year trailing CAGR** to smooth volatility while staying current. The Simulator lets users override per-asset CAGRs (e.g., "use 10-year for housing, 3-year for BTC"). 5-year is the default because it spans roughly one Fed cycle and avoids the distortion of either zero-rate or peak-rate periods alone.

Sources we'll use and cite:
- Housing: Case-Shiller national + metro indices
- Equity: S&P 500 total return
- Tuition: College Board *Trends in College Pricing*
- Healthcare: CMS National Health Expenditure Accounts
- Childcare: Care.com Cost of Care + BLS series
- General CPI (for contrast): BLS CPI-U

The Methodology page documents every series, vintage, and formula. This is critical for credibility with serious financial readers and for AI citation (see content rationale below).

---

## 2. Why a publication, not just a tool

A calculator is a one-shot experience. A simulator extends the visit. Neither brings people back weekly. Aspire's defensibility comes from being the publication of record for personal inflation — the place readers go when a CPI print drops, when the Fed moves, when housing data updates, when they're rethinking a life decision.

The content layer also drives acquisition. AI engines cite content with methodology, fact density, and freshness — not bare tools. Aspire's content is what makes Aspire the cited source when someone asks ChatGPT *"how do I calculate my real personal inflation rate."*

**Reframe:** Aspire is a publication about personal inflation, with the tool at the center.

---

## 3. Site architecture

```
/              Calculator (homepage)
/simulator     Simulator
/index         Aspire Index — pop-culture pricing then-vs-now
/report        Aspire Report archive (Beehiiv-fed newsletter)
/explainers    Short to medium editorial pieces
/methodology   How the rates are calculated
/manifesto     Existing manifesto (untouched)
/account       Self-serve settings + delete-my-account flow (see security-and-privacy.md §8)
/privacy       Privacy policy (drafting flagged for legal review)
/terms         Terms of service (drafting flagged for legal review)
```

Nav (consistent across all pages):
- Wordmark left
- Right: `Manifesto` · `Index` · `Report` · `Explainers` · `Methodology` · primary CTA `See your number`
- Authenticated users also see a small avatar/email link to `/account` in the right cluster

Footer (quiet):
- Wordmark · Manifesto · Index · Report · Explainers · Methodology · Contact · Privacy · Terms
- Compliance line in muted gray: *"Outputs are educational measurements, not investment advice. Past rates are not guarantees of future results."*

---

## 4. The user flow

```
Land on /  →  Calculator  →  Inputs (basket + assets)  →  Aspire Rate & Gap reveal
            →  Email capture (gated entry to Simulator)
            →  Simulator  →  Configure scenarios  →  Save scenario (Supabase)
            →  Return weekly via Aspire Report (Beehiiv)
```

Email capture rules:
- **Never on the Calculator inputs.** Friction kills the funnel before the payoff.
- The user always sees their Aspire Rate and Aspire Gap *before* the email ask.
- The email gate is the doorway to the Simulator, framed as: **"Explore your gap →"**
- Saving a scenario in the Simulator confirms or creates the account (Supabase auth).

---

## 5. Page summaries

Detailed specs live in their own files. One paragraph per page here.

### `/` — Calculator (homepage)
The front door. The hero is the calculator itself, not a button that leads to one. A small number of robust inputs (target life basket, dollar amount working toward it, current asset allocation across a few categories) produce a fully-loaded reveal: the Aspire Rate, the Aspire Gap, and a breakdown of what's driving each. The reveal moment is the visual climax of the page. Single secondary CTA: `Explore your gap →` → email gate → Simulator. Detail in `page-spec-calculator.md`.

### `/simulator` — Simulator
The page that doesn't exist yet. Live levers — savings rate, allocation mix, timeline, target basket, geography, configurable CAGR — that move the Aspire Gap in real time. Opinionated: tells you what to change to close the gap (e.g., *"Shifting from 100% cash to 70/30 closes 4.1 points"*). Never recommends specific assets, funds, or tickers. Scenarios save and persist via Supabase. Desktop-first; mobile works but is not the primary surface. Detail in `page-spec-simulator.md`.

### `/index` — The Aspire Index
Editorial proof. A library of pop-culture artifacts — movies, songs, life moments — priced then-vs-now. Each card argues the thesis with a specific story: the house from *Father of the Bride* in 1991 vs. today; college tuition in *Good Will Hunting* vs. today; the family vacation in *National Lampoon* vs. today. Horizontal scroll on desktop, vertical stack on mobile. Each card links to a deeper breakdown page. The most shareable surface — built for organic distribution and AI citation. Detail in `content-architecture.md`.

### `/report` — The Aspire Report
Beehiiv archive. Weekly newsletter: *"the rates the BLS doesn't publish."* Five minutes. The website surfaces past issues; subscribe form embedded; primary subscription CTA across the site funnels here. Beehiiv is the spine of the content layer; the website surface is its archive and entry point. Detail in `content-architecture.md`.

### `/explainers` — Explainers
Short to medium evergreen pieces, 400–800 words. Examples: *"Why your zip code matters more than the Fed."* *"What the S&P's 5-year CAGR actually buys."* *"The hidden inflation rate of childcare."* Each piece is structured for AI citation: direct answer in the first 60 words, citable stat density (one fact per 150–200 words), methodology footnote, "last updated" timestamp. Embedded video where it adds. Detail in `content-architecture.md`.

### `/methodology` — Methodology
Boring on purpose. Every CAGR series, every source, every formula, every assumption. Required for credibility with serious financial readers and for AI citation authority. The page nobody reads but everyone trusts.

### `/manifesto` — Manifesto
Existing page. Untouched. Linked from nav.

---

## 6. Brand system (preserved + clarified)

The editorial-magazine brand stays. The Stripe/Robinhood reference applies inside the **tool surfaces** (charts, gain/loss color, data density) — not to the editorial wrapper. Two registers, one brand.

**Wordmark** — italic "Aspire" in Fraunces with a terracotta Δ. Unchanged.

**The Δ glyph** — the brand anchor. Recurring system element across editorial and tool surfaces alike: section markers, bullet glyphs, hover accents, scenario badges in the Simulator. Not just decoration — the Δ signals rate-of-change, which is the entire product.

Full type, color, motion, and component spec lives in `creative-direction.md`.

---

## 7. Voice rules

Comps: **Morgan Housel × Matt Levine × Nassim Taleb.**

- Sharp, not sales-y. Contrarian but provable. Calm about risk. Honest about uncertainty. Economically literate without being academic. Free of financial-services cosplay.
- Contractions always. Get to the point. No throat-clearing.
- Italics earn their keep on key thesis words: *vector*, *yours*, *your* basket.
- **Never use** (union of existing canon and new specs): "beat inflation," "guaranteed," "optimize your portfolio," "the best asset," "risk-free," "achieve your dreams," "supercharge," "unlock," "in today's economy," "delve," "unpack," "leverage," doom-driven fear copy, alpha promises, crypto maximalism, advisor cosplay, generic personal finance.
- **Never use the negation pattern:** *"This isn't X. It's Y."* Just state Y. (One protected exception: the secondary punchline *"Inflation isn't a number. It's a vector."* Used sparingly — see §Tagline below.)
- **Preferred phrases:** *"the inflation rate of the life you want," "your future has its own inflation rate," "measure the gap," "close the gap," "make the assumptions visible," "the cost of optionality," "a planning lens," "at these assumptions."*

The Calculator and Simulator are quieter than the editorial surfaces. Tool copy is precise and minimal — labels, units, one-line interpretations. No headlines inside the tool flow.

### Tagline

- **Primary tagline (durable, footer, brand identity):** *"How much of tomorrow can you afford?"*
- **Secondary punchline (one-time hero use, social posts, occasional editorial accent):** *"Inflation isn't a number. It's a vector."*

The primary tagline is a question — invites engagement, ages well, fits compliance posture. The secondary punchline is a thesis statement — earns its place in moments of editorial impact (the Calculator H1, social copy, occasional Report opener) but is not a substitute for the brand line.

### ICP

Aspire's ICP is canonized in `aspire/ICP.md` (the upwardly mobile planner, age 28–50, financially aware, triggered by life events like home purchase, kids, tuition, relocation, healthcare, retirement, or feeling behind despite income growth). The new specs inherit that ICP without modification. Any change to ICP scope routes through `aspire/ICP.md`, not through these specs.

---

## 8. Definition of done

A first-time visitor who lands on `/` and bounces in 8 seconds walks away with their **Aspire Rate** and **Aspire Gap** memorized — and a clear sense that there's a Simulator waiting for them when they're ready to do something about it.

A returning visitor opens the Aspire Report on Tuesday morning, reads it in five minutes, clicks one link to the Simulator, models a scenario in 90 seconds, and saves it. **That loop is the product.**

A relevant query in ChatGPT, Perplexity, or Google AI Overviews about personal inflation, real returns, or "the rate I need to hit to retire" cites Aspire. That's the GEO definition of done.

---

## 9. Decisions deferred to subsequent docs

- Specific Calculator input set (3 inputs vs. 5 vs. 7) — `page-spec-calculator.md`
- Simulator lever interaction model (sliders vs. dropdowns vs. scenario presets) — `page-spec-simulator.md`
- "The Shape of Your Gap" observation panel for the Simulator (formerly the recommendation engine, scrapped per drift-report Conflict 6 because ranked actions + outcome promises + Apply buttons are advisory in form even without naming specific securities) — `page-spec-simulator.md` §8
- Editorial cadence and content sequencing — `content-architecture.md`
- All copy, every word — `copy.md`
- Type sizing, color values, component primitives, chart treatment — `creative-direction.md`

---

## 10. Out of scope (v1)

- Investment recommendations of any kind. Aspire never recommends specific assets, funds, products, or tickers. **This applies at every tier — never relaxed for paying users.**
- Account aggregation (Plaid, etc.). Inputs are user-entered.
- Mobile app. Web only for v1.
- Localization. US-only baseline data for v1.
- Real-time market data. CAGR figures refresh quarterly with vintage timestamps.
- User-to-user social features. Saved scenarios are private (public sharing is opt-in per scenario).
- **Paid tiers.** v1 ships fully free. Aspire Report Premium lands in v1.5; Aspire Pro lands in v2 (if Premium converts). Locked tier shape and what's free vs. paid: `content-architecture.md` §12. Any future feature decision that touches scenario depth, multi-goal modeling, tax modeling, or partner/spouse modeling must reference that section.
