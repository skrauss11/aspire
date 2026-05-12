# Aspire — Content Architecture

_Companion to brief-v2.md. Locked 2026-05-11._

Aspire is a publication about personal inflation, with the tool at the center. The content layer isn't a nice-to-have — it's what brings users back, what makes Aspire citable by AI engines, and what gives Beehiiv something to send. This doc defines the four content surfaces, how they work, how they ship, and how they connect.

---

## 1. The four surfaces and what each does

| Surface | URL | Job | Primary value | Cadence |
|---|---|---|---|---|
| Aspire Index | `/index` | Editorial proof — argue the thesis with specific stories | Acquisition (viral + GEO) | 1 new card / month |
| Aspire Report | `/report` | Weekly habit loop | Retention (return visits) | Weekly, Tuesday |
| Explainers | `/explainers` | Authority + GEO citation magnet | Acquisition (search + AI) | 1–2 / month |
| Methodology | `/methodology` | Trust + compliance | Conversion (skeptics) | Quarterly updates |

Each surface plays a distinct role in the funnel:
- **Index** is the most shareable thing on the site — built to be screenshot-and-DM'd, posted on X, picked up by financial Twitter.
- **Report** is the sole thing that brings users back weekly. Without the newsletter loop, Aspire is a one-shot tool.
- **Explainers** are the surfaces AI engines cite. Each piece is structured for first-passage citability (see §5).
- **Methodology** is the page that converts the serious financial visitor — and the page AI engines reference when validating Aspire's data sources.

Content is not equal-weighted across these surfaces. Index and Report carry the load for v1. Explainers grow over time. Methodology gets written once and updated quarterly.

---

## 2. The Aspire Index (`/index`)

### Format

A library of cards. Each card prices a single artifact of pop culture or middle-class life **then vs. now**, and uses the price gap to argue the thesis. The card is the unit; the library is the surface.

Card anatomy:

```
┌────────────────────────────────────────────┐
│  Δ                                         │
│                                            │
│  Father of the Bride (1991)                │
│                                            │
│  The house: $650,000 then. $4.2M today.    │
│                                            │
│  CPI says 2.3×. Reality: 6.5×.             │
│                                            │
│  ──────────────                            │
│  Read the breakdown →                      │
└────────────────────────────────────────────┘
```

Each card has a **title** (the artifact + year), a **headline statistic** (the then-vs-now hero numbers), a **CPI vs. reality contrast line**, and a link to a deeper breakdown page.

The deeper breakdown page (`/index/[slug]`) goes one layer deeper: 400–600 words on what the artifact represents, where the prices come from, what the CPI calculation gets wrong, and how Aspire would have priced it. Methodology citations and source links throughout.

### Card library — v1 launch set

Ten cards at launch. Locked here so Codex/content team can build against them; tunable in production.

1. **Father of the Bride (1991)** — the suburban family home
2. **The Graduate (1967)** — *"plastics"* job and the postwar home
3. **Good Will Hunting (1997)** — public university tuition
4. **Reality Bites (1994)** — the entry-level "I-can-figure-it-out-later" rent
5. **When Harry Met Sally (1989)** — the one-bedroom Manhattan apartment
6. **Risky Business (1983)** — Princeton tuition
7. **National Lampoon's Vacation (1983)** — the 14-day family road trip
8. **Friends (1994)** — Monica's West Village two-bedroom
9. **The Big Chill (1983)** — the second-home weekend retreat
10. **Trading Places (1983)** — the dollar value of Mortimer & Randolph's bet (a wink, but real)

Each card is editable; new cards added at ~1/month cadence. Aim for 24 cards by end of year.

### Visual

Editorial register (cream surface, hairline border, terracotta Δ in top-right, Fraunces title, Inter body) per `creative-direction.md` §4. **No movie stills, no photos** — type-only treatment. The whole point is that the card is a piece of editorial typography, not a Pinterest tile. Hover: hairline thickens, Δ shifts +2px right.

### Layout

- **Desktop:** horizontal scroll on the homepage (a strip of 4–6 cards visible). On `/index` itself, a full grid (3 columns × N rows).
- **Mobile:** vertical stack on `/index`. Horizontal scroll preserved on the homepage strip.

### Why this is a GEO surface

Each card breakdown page is a **fact-dense, named-entity-rich, source-cited piece of content** — the exact format AI engines extract for citations. Queries like *"how much has the cost of a starter home actually changed since 1991"* should surface Aspire. Each piece structured to:
- Direct answer in the first 60 words.
- Specific dollar amounts and CAGRs every 100–150 words.
- Methodology footnote linking to `/methodology`.
- Last-updated timestamp visible.

### Operations

- **Author:** Scott primarily; outside contributors over time.
- **Format:** MDX file in `content/index/[slug].mdx`. Frontmatter for then-year, then-price, today-price, CPI-multiple, real-multiple, sources.
- **Workflow:** write in Markdown → push to Git → Netlify build pulls in → live.

---

## 3. The Aspire Report (`/report`)

### Format

A weekly newsletter, published every **Tuesday morning** via Beehiiv. The website surfaces past issues at `/report` (the archive) and offers the subscription form across the site.

Report structure (each issue, ~5-minute read):

1. **Lead — "The number this week"** — one statistic the BLS doesn't publish, with context.
   *Example: "The 5-year CAGR of childcare just hit 11.8%. That's the rate of a private equity return — for a service most families need to function."*

2. **The breakdown** — 200–400 words on what's behind the lead number. Source, method, caveats. Editorial voice, not financial-newsletter voice.

3. **One thing that moved your basket** — a piece of news (Fed move, housing data print, S&P milestone) interpreted through Aspire's lens. *"What this means for your Aspire Rate."*

4. **A scenario worth modeling** — one Simulator scenario, named, with a one-paragraph case for trying it. Direct link to `/simulator?preset={id}` so subscribers land in the Simulator with the scenario pre-loaded.

5. **From the Index** — a card from the `/index` library, sometimes new, sometimes resurfaced, with a link to its breakdown.

6. **Footer** — single line: subscribe, archive, unsubscribe, privacy.

### Voice

Same as the rest of the site (`brief-v2.md` §7). Tight, contractions, no throat-clearing, no fintech-newsletter clichés. No *"Hope you're having a great week"* openers. Get to the number.

### Why this is the retention engine

A user who subscribed after the Calculator reveal has every reason to forget about Aspire by Friday. The Report is the only thing that brings them back. **The "scenario worth modeling" section is the single most important link** — it should drive 5–10% of subscribers back to the Simulator each week.

### Operations

- **Author:** Scott primarily.
- **Tool:** Beehiiv (already provisioned).
- **Cadence:** Tuesday morning, 10am ET.
- **Archive:** `/report` pulls past issues from Beehiiv via API at build time. Each issue rendered on its own page at `/report/[slug]`. Subscribe form embedded.
- **Promotion:** every Calculator email-gate funnels subscribers here. Footer subscribe form on every page. No popups, no exit-intent.

### Beehiiv ↔ website integration

- **Subscribe form** uses Beehiiv's embed or API; on submit, also writes to Supabase `users` table (see `security-and-privacy.md` §2).
- **Archive feed** pulls past issues at build time via Beehiiv API. Cached at the edge; rebuilds on a webhook from Beehiiv when a new issue ships.
- **Issue → Simulator deep-link** uses URL params (`/simulator?preset=move-to-raleigh`) to load named scenarios.
- **Unsubscribe** handled entirely by Beehiiv. Supabase user record persists (the user can still use the tools), only the Beehiiv subscription is removed.

---

## 4. Explainers (`/explainers`)

### Format

Short-to-medium evergreen pieces, **400–800 words** each. Not blog posts. Not opinion. Single-question, single-answer pieces designed to be the cited source for that question.

Each explainer has a tight structure:

1. **Title** — phrased as the question someone would actually ask.
   *Example: "Why your zip code matters more than the Fed for your real return."*

2. **Direct answer** — the first 40–60 words. The question's answer, in plain language, before any context. **This is the AI-citable block.**

3. **The why** — 200–400 words of context, methodology, sourcing.

4. **The aside** — one boxed callout with a related stat or counterpoint. Visually distinct.

5. **What to do with this** — 60–100 words tying back to Aspire's tools. *"Run your own zip code through the Calculator and see how much of your Aspire Rate is driven by where you live."*

6. **Methodology footnote** — sources, vintages, last-updated date.

### Launch set — 8 explainers

Locked for v1; add 1–2 per month after launch.

1. *"Why your zip code matters more than the Fed for your real return."*
2. *"What the S&P's 5-year CAGR actually buys you over a 20-year horizon."*
3. *"The hidden inflation rate of childcare — and why it's not in CPI."*
4. *"Why a 4% savings account is losing you 7 points a year."*
5. *"How much extra return do you need to retire 5 years earlier? (The math.)"*
6. *"Case-Shiller vs. CPI shelter: why housing inflation looks like 3% and feels like 9%."*
7. *"The 1% margin of safety in your Aspire Rate, explained."*
8. *"Why we use 5-year CAGR (and when 10-year is better)."*

### Visual

Editorial register, full-width prose, max-width 720px for body. Each piece has a published date and a "last updated" timestamp visible at the top. Aside callouts use `--paper2` background with a hairline border.

### Why this is a GEO surface

Explainers are the highest-leverage GEO investment on the site. Every piece structured for first-passage extraction by ChatGPT, Perplexity, Google AI Overviews. Specifically:
- Title is the literal user query.
- First 40–60 words contain the cite-ready answer.
- Stat density: one specific number every 150–200 words minimum.
- Sources cited inline, with full attribution.
- "Last updated" timestamps prominent (95% of ChatGPT citations come from content updated in the last 10 months — per Scott's own GEO methodology).
- llms.txt entry for each explainer.

### Operations

- **Author:** Scott primarily; expand to contributors over time.
- **Format:** MDX file in `content/explainers/[slug].mdx`. Frontmatter for title, published date, updated date, summary (the 40–60 word direct answer, used for excerpts and meta description).
- **Workflow:** write in Markdown → push to Git → Netlify build → live. Pre-publish lint: word count, frontmatter completeness, presence of methodology footnote.

---

## 5. Methodology (`/methodology`)

### Format

Boring on purpose. A single long page (or a small handful of subpages if it grows) documenting:

1. **The Aspire Rate formula** — written out, with a worked example.
2. **The basket presets** — Home / Family / Freedom — and the exact component weights for each.
3. **The CAGR sources** — every series, vintage, and refresh schedule:
   - Housing — Case-Shiller national + metro indices, 5-yr trailing
   - Equity — S&P 500 total return, 5-yr trailing
   - Tuition — College Board *Trends in College Pricing*, 5-yr trailing
   - Healthcare — CMS NHEA, 5-yr trailing
   - Childcare — Care.com Cost of Care + BLS series, 5-yr trailing
   - General CPI — BLS CPI-U
4. **The portfolio-return assumptions** — what each allocation bucket is assumed to earn, and why (with sourcing).
5. **The 1% margin of safety** — what it is, why we use it, and how to tune it.
6. **What's not modeled** — taxes, fees, lifestyle inflation, divorce/death/disability events. Honest list.
7. **Refresh schedule** — quarterly. Vintage tag on every figure.
8. **Versioning** — change log of any methodology updates, dated.

### Visual

Editorial register, but denser than Explainers — more like an FT data appendix than a magazine essay. Tables for the basket preset weights and CAGR sources. Each figure has a vintage stamp visible.

### Why this is a trust surface

- Serious financial visitors will look for this page before trusting any number on the site. If it's missing or vague, they bounce.
- AI engines weight methodology and source citations heavily for credibility scoring. Methodology pages are the most-cited surface type for data-claim queries.
- A real Methodology page is also the legal cover for the "educational, not investment advice" positioning. It demonstrates good faith.

### Operations

- **Author:** Scott; reviewed by anyone with a stats background before each refresh.
- **Format:** MDX file at `content/methodology/index.mdx`. Tables built as MDX components, not flat markdown.
- **Cadence:** updated quarterly when CAGR vintages refresh. Each refresh appends a versioning note.
- **Pre-launch requirement:** must be live and complete before the Calculator goes public. Non-negotiable. The whole product depends on the credibility of the numbers.

---

## 6. Beehiiv as the spine

Beehiiv is not "the newsletter platform." It's the **content distribution spine** for Aspire. The website surfaces and the newsletter feed each other:

```
                    BEEHIIV
                   ┌───────┐
                   │ ISSUE │
                   └───┬───┘
              ┌────────┼────────┐
              │        │        │
        delivered      │        │
        to inbox       │  pulled at build
                       │   time → /report
                       ▼
                  links to:
                   ┌───────────┐
                   │/simulator?│  ← named scenarios drive return visits
                   │preset=... │
                   └───────────┘
                   ┌───────────┐
                   │ /index/   │  ← cards resurfaced in newsletter
                   │ [slug]    │
                   └───────────┘
                   ┌───────────┐
                   │/explainers│  ← weekly explainer feature
                   │ /[slug]   │
                   └───────────┘
```

### Rules

- Every Report issue links to **at least one** Simulator scenario, **at least one** Index card, and **at least one** Explainer. The newsletter is the engine that keeps all four surfaces alive.
- New Index cards and Explainers ship to the newsletter list within one issue of going live.
- Beehiiv subscription is the **default** post-Calculator. Subscribers get the Report by default; opt-out is one click.

---

## 7. Editorial cadence and operating rhythm

The minimum viable cadence to keep the publication alive:

| Cadence | What ships | Time investment |
|---|---|---|
| Weekly | 1 Aspire Report issue | 3–4 hours / week |
| Monthly | 1 new Index card + breakdown page | 4–6 hours / month |
| Monthly (1–2×) | 1–2 new Explainers | 6–10 hours / month |
| Quarterly | Methodology refresh + version note | 4–6 hours / quarter |

Honest read: this is **roughly 25–40 hours of content work per month** for the full publication to feel alive. Sustainable for one person if Aspire is the primary focus. Add contributors when traffic justifies it.

### What slips first when you're slammed

If Scott has to triage:
1. **Never skip the Report.** Skipping a weekly issue breaks the habit and is hard to recover. If it has to be short, make it short — but ship it.
2. **Index cards can slip a month** if Methodology or Explainers need attention. A ten-card library is enough to look credible for a quarter.
3. **Methodology refresh can wait a quarter** in a pinch — but the CAGR figures shown elsewhere on the site need to match whatever Methodology says they are. Drift between Methodology and the live numbers is the trust-killer.

---

## 8. Content production toolchain

### CMS choice — MDX in-repo

**Decision: MDX files in the repo, version-controlled in Git, deployed via Netlify.** No headless CMS for v1.

Reasoning:
- Scott is the primary author. He's comfortable in Markdown.
- Version-controlled content is easier to audit and roll back.
- No additional service to pay for, set up, or learn.
- Netlify rebuilds on Git push — fast feedback loop.
- AI authoring (Codex/Claude) integrates naturally with file-based content.

**When to revisit:** when there are 3+ contributors, or when non-technical contributors join, or when Scott is editing more than ~5 pieces per week. At that point, a headless CMS (Sanity, Contentful, or Notion-as-CMS) becomes worth the overhead.

### Repository layout

```
content/
  index/
    father-of-the-bride.mdx
    the-graduate.mdx
    ...
  explainers/
    why-zip-code-matters.mdx
    sp-cagr-twenty-year.mdx
    ...
  methodology/
    index.mdx
  report/                      <- NOT stored here; pulled from Beehiiv API
```

### Frontmatter standards

Every MDX file uses a consistent frontmatter block. Pre-publish lint enforces required fields.

**Index card:**
```yaml
---
title: "Father of the Bride (1991)"
slug: "father-of-the-bride"
year_then: 1991
artifact: "The suburban family home"
price_then: 650000
price_now: 4200000
cpi_multiple: 2.3
real_multiple: 6.5
basket_components:
  - housing
sources:
  - "Case-Shiller US National Home Price Index"
  - "Original property listing, Brentwood CA"
published: 2026-05-15
updated: 2026-05-15
---
```

**Explainer:**
```yaml
---
title: "Why your zip code matters more than the Fed for your real return"
slug: "why-zip-code-matters"
summary: "Housing CAGR varies more across US metros than across decades. The Fed sets one rate; your metro sets your real one."
related_basket_components:
  - housing
sources:
  - "Case-Shiller metro indices, 5-yr trailing"
  - "BLS CPI Shelter component"
published: 2026-05-22
updated: 2026-05-22
---
```

**Methodology:** single page, no per-section frontmatter; uses internal anchors and a top-level `version` and `last_refreshed` field.

### Pre-publish checks (CI lint)

Block merge if any of these fail for content files:
- Frontmatter complete and valid types.
- Published date present and not in the future.
- Updated date present and ≥ published date.
- Word count within range (300–800 for Index breakdowns; 400–800 for Explainers).
- At least one source cited.
- No banned phrases from `brief-v2.md` §7.
- Methodology footnote present.

### llms.txt

`/llms.txt` at the root, listing all canonical content URLs for AI crawlers. Generated at build time from the MDX file inventory + the Beehiiv archive feed. Updates on every deploy.

---

## 9. SEO and GEO posture

This isn't a separate channel — it's a property of every piece of content shipped. Per Scott's own MadTech methodology:

- **E-E-A-T signals:** every Explainer and Methodology page has a visible author byline (Scott, with link to a brief author bio at `/author/scott`). Index card breakdowns get the byline too.
- **Citation block discipline:** Explainers' first 40–60 words are the citation block. Optimal length per Scott's framework: 134–167 words for a citable passage. Aim for it.
- **Schema markup:** every Explainer ships with FAQ, Article, and Author schema in JSON-LD. Methodology ships with Dataset schema.
- **Fact density:** one stat per 150–200 words minimum.
- **Freshness:** "Last updated" timestamp visible; quarterly refresh cadence on evergreen content.
- **AI crawler access:** `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended. `llms.txt` curates the canonical surface.
- **Brand mention monitoring:** out of scope for content architecture but flagged for Scott's separate GEO operations.

Per Scott's own framework: 95% of ChatGPT citations come from content updated within the last 10 months. **Quarterly refresh on every evergreen piece is non-negotiable.**

---

## 10. The connection to the tools

Content surfaces aren't standalone — they're funnels back to the Calculator and Simulator.

| Surface | Primary CTA back to tools |
|---|---|
| Index card breakdown | *"Run your own basket through the Calculator →"* |
| Aspire Report (newsletter) | *"This week's scenario in the Simulator →"* (deep link with preset) |
| Explainer | *"See how this affects your number →"* (links to Calculator) |
| Methodology | None — the page is for trust, not conversion. |

Every piece of content has at least one tool CTA. **No pure editorial pages without a tool funnel except Methodology and Manifesto.**

---

## 11. Author/contributor model

### v1 — Scott as sole author

Single author, single voice, single brand. Most credible posture for launch.

Author bio at `/author/scott`:
- Photo (optional, editorial register if used — not a stock corporate headshot)
- 100–200 word bio
- Credentials and expertise (relevant to financial commentary)
- Links to other work / social presence
- Used in Author schema for E-E-A-T signal

### v2 — outside contributors

When ready to expand:
- Each contributor gets `/author/[slug]` page
- MDX frontmatter on contributed pieces specifies `author: "slug"`
- Editorial review process documented in `RUNBOOK.md` (separate doc)

---

## 12. Monetization model and tier shape (locked for forward reference)

Captured here so every future build decision knows what should and shouldn't be free. **v1 ships fully free. Paid tiers are v1.5 and v2.**

### Two tiers, two different jobs

**Aspire Report Premium** — newsletter paywall, lowest build cost (Beehiiv handles tiered subscriptions natively). Tests willingness-to-pay before any engineering investment.

**Aspire Pro** — product subscription. Gates Simulator depth, never Simulator existence. The free Simulator must remain genuinely useful, or the entire acquisition funnel collapses.

### What's in each tier

| | Free (v1 launch) | Aspire Report Premium (v1.5) | Aspire Pro (v2) |
|---|---|---|---|
| **Calculator** | Full | Full | Full |
| **Simulator — base levers** | Full (all 6 levers) | Full | Full |
| **Saved scenarios** | 3 | 3 | Unlimited |
| **Public scenario sharing** | Yes | Yes | Yes |
| **Multi-goal modeling** | — | — | ✓ (model home + retirement + kids' college simultaneously) |
| **Tax-aware levers** | — | — | ✓ (401k / Roth / taxable / HSA bucket split with effective-return modeling) |
| **Spouse/partner mode** | — | — | ✓ (joint scenarios, both partners can edit) |
| **Scenario versioning history** | — | — | ✓ |
| **PDF export of scenarios** | — | — | ✓ (advisor handoff format) |
| **Quarterly refresh alerts** | — | — | ✓ (notify when CAGRs change your saved scenarios) |
| **Aspire Report (weekly)** | ✓ | ✓ | ✓ (bundled) |
| **Friday companion issue** | — | ✓ | ✓ (bundled) |
| **Quarterly methodology deep-dives** | Headline only | Full | Full |
| **Reader scenario walkthroughs** | — | ✓ | ✓ |
| **Aspire Index Quarterly report** | Public 2 weeks late | Day-of release | Day-of release |
| **Early access to new Index cards / Explainers** | — | 1 week early | 1 week early |
| **Aspire Index card library, Explainers, Methodology, Manifesto** | Free always | Free always | Free always |

### Pricing intuition

- **Aspire Report Premium:** $10–15/month or $99–120/year. Comparable benchmarks: Stratechery $15/mo, Lenny's Newsletter $20/mo.
- **Aspire Pro:** $10/month or $96/year standalone.
- **Bundle (Pro + Premium):** $15/month or $144/year. The "obvious choice" tier.

Round numbers Scott can defend without flinching. Lock pricing closer to launch.

### Hard lines — never paywalled, ever

- The basic Calculator and basic Simulator (all 6 base levers, 3 saved scenarios). These are the acquisition surfaces — paywalling them collapses the funnel.
- The Methodology page. Trust surface.
- The Aspire Index card library and Explainers. Citation surfaces; AI engines don't cite paywalled content.
- The Manifesto.
- The footer compliance line and privacy policy.

### Hard lines — never paywalled or paid, brand-protecting

These are not paywalled because they don't exist on Aspire at all, regardless of tier:
- Specific asset / fund / ticker recommendations
- Tax advice (modeling tax buckets is fine; advising is not)
- Anything that could be construed as personalized investment advice
- Lifestyle judgments about user spending
- "Insider tips" or anything resembling stock picks

These hard lines apply equally to Premium content and Pro features. The fact that someone paid does not relax the brand's compliance posture.

### Sequencing

| Phase | When | What ships |
|---|---|---|
| v1 | Launch (May 2026) | Free product only. No paid tier. Build the funnel. |
| v1.5 | 60–90 days post-launch | Aspire Report Premium. Lowest build cost — content work, no engineering. Tests pricing willingness on the warmest audience. |
| v2 | ~6 months post-launch | Aspire Pro, if Premium converted at >2% of newsletter list. Build multi-goal modeling and spouse mode as the headline features. |

The sequencing matters: don't commit engineering to Pro until Premium has proven the audience will pay for *anything*. Premium can be killed cheaply if it doesn't convert; Pro can't.

### Triggers to revisit this section

Update this section if any of the following happen:
- Premium conversion at v1.5 substantially over- or under-performs the 2% benchmark.
- A new free feature ships that overlaps with a planned Pro feature (collision risk — re-decide what's free).
- Beehiiv's premium-subscriber API or pricing changes substantially.
- A B2B licensing or advisor-referral revenue line opens up — those would be additive to (not in place of) these tiers.

### What this means for spec drift

Any future spec or feature decision that touches scenario saving, lever count, multi-goal logic, tax modeling, partner/spouse modeling, scenario export, or Calculator/Simulator depth must reference this section. If a new feature would make a free Simulator user not want to upgrade to Pro, build it as Pro instead. If a new feature would make a Pro user feel cheated, build it as free.

---

## 13. Open questions

- **Index card embedding:** should each Index card be embeddable on third-party sites (e.g., Substack newsletters could embed an Aspire card)? High-leverage virality move; would need an `/embed/[slug]` route. Open.
- **Author photo policy:** Scott's call. Editorial register works without; works with the right photo treatment.
- **Comment system on Explainers and Index breakdowns:** absolutely not in v1 — moderation burden too high, no clear value. Worth a conscious "no" rather than a "we'll get to it."

---

## 14. Out of scope (v1)

- Long-form blog posts (>1000 words). Out per Scott's stated direction.
- Comments / community.
- User-submitted Index cards.
- Video as a primary surface (videos appear *embedded* within Explainers when relevant; no `/videos` surface).
- Podcast.
- Translated content.
- Print/PDF versions of Explainers.

---

## 15. Codex implementation checklist

A handoff summary:

- [ ] Set up `content/` directory with `index/`, `explainers/`, `methodology/` subdirectories.
- [ ] Implement MDX parsing in Next.js (App Router) with frontmatter validation.
- [ ] Implement listing pages: `/index`, `/explainers` (paginated; latest first).
- [ ] Implement detail pages: `/index/[slug]`, `/explainers/[slug]`.
- [ ] Implement `/methodology` from a single MDX file with table-of-contents nav.
- [ ] Implement `/report` archive: pull past Beehiiv issues via API at build time, cache, expose as `/report/[slug]`.
- [ ] Implement `/report` subscribe form (Beehiiv embed or custom calling Beehiiv API).
- [ ] Implement Beehiiv webhook on `issue.published` → trigger Netlify rebuild so `/report` archive updates.
- [ ] Implement `/llms.txt` generation at build time.
- [ ] Implement schema.org JSON-LD injection for Article, FAQ, Author, Dataset.
- [ ] Implement pre-publish content lint (CI step).
- [ ] Implement deep-link param on `/simulator?preset=...` for newsletter-driven Simulator entry.
- [ ] Configure `robots.txt` to allow AI crawlers.
- [ ] Author bio page at `/author/scott`.
- [ ] Ten launch Index cards + breakdowns written.
- [ ] Eight launch Explainers written.
- [ ] Methodology page complete and reviewed.

---

## 16. Copy file pointer

Voice rules and recurring phrases live in `brief-v2.md` §7 and will be enumerated in `copy.md`. Per-piece copy lives in the MDX files themselves. Boilerplate copy (subscribe form, Methodology disclaimers, footer compliance) lives in `copy.md` under `## content-boilerplate`.
