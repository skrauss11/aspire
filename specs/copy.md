# Aspire — Copy

_Companion to brief-v2.md, creative-direction.md, page-spec-calculator.md, page-spec-simulator.md, content-architecture.md, security-and-privacy.md. Locked 2026-05-11._

This file is the source of truth for every word on every Aspire surface that isn't a piece of editorial content (Index cards, Report issues, Explainers, Methodology). If a page spec and this file disagree, **this file wins.**

The 18 launch editorial pieces (10 Index cards + 8 Explainers) are authored separately in `content/index/*.mdx` and `content/explainers/*.mdx` per `content-architecture.md` §8.

Voice rules live in `brief-v2.md` §7. Reread before editing this file. The short version:
- Sharp, contractions always, no throat-clearing.
- Italics on thesis words only: *vector*, *yours*, *your* basket.
- Banned: *beat inflation*, *guaranteed*, *optimize your portfolio*, *achieve your dreams*, *supercharge*, *unlock*, *in today's economy*, *delve*, *unpack*, *leverage*.
- Banned pattern: *"This isn't X. It's Y."* The single protected exception is the signature line.
- Tool copy is **quieter** than editorial copy. Tool copy is labels, units, and one-line interpretations. Editorial copy is voice.

This doc is organized in three voice registers — **Tool copy**, **Editorial chrome**, **System copy** — plus a **Compliance** section and **Placeholder legal** pages.

---

# Part 1 — Tool copy

The Calculator, the Simulator, and `/account`. Quiet, precise, units always shown.

## 1.1 — Calculator (`/`)

### Hero strip

- Eyebrow: `PERSONAL INFLATION INDEX`
- H1: `Inflation isn't a number. It's a *vector*.`
- Lede: `CPI says 3%. The life you're working toward inflates closer to 12%. Find your number below — then find out what it'll take to close the gap.`

### Block A — The life you want

- Eyebrow: `STEP 1 — THE LIFE YOU WANT`
- Heading: `What basket are you pricing?`

**Life chip labels and hover descriptions:**
- `A home` — *A house in your zip, plus a normal life around it.*
- `A family` — *Kids, school, healthcare, and the house to fit them.*
- `Freedom` — *Stop working when you want to, in the zip you want to.*

**Geography input:**
- Label: `Where?`
- Placeholder: `Zip code or metro`
- Resolved-state helper (italic, muted): `Resolved: {metro name}`
- Unresolved-state helper: `Using national average — enter a US zip for local data.`

**Timeline slider:**
- Label: `When?`
- Unit: `years`
- Helper: `Used in the Simulator to project your trajectory. Doesn't change today's number.`

### Block B — What you're working with

- Eyebrow: `STEP 2 — WHAT YOU'RE WORKING WITH`
- Heading: `And what's working for you?`

**Total assets:**
- Label: `Total assets`
- Placeholder: `$0`
- Helper: `What you've got working toward your goal. Round numbers are fine.`

**Allocation breakdown:**
- Label: `How it's split`
- Bucket labels: `Cash & savings` / `Stocks & index funds` / `Real estate` / `Other`
- Per-bucket assumed-return helper (italic, muted): `assumed {X.X}% — {source short name}, 5-yr trailing`
- Sum-mismatch warning: `Allocations should add up to 100%. Currently {X}%.`

**Monthly contribution:**
- Label: `Adding monthly`
- Placeholder: `$0`
- Helper: `Optional. Used for trajectory projection in the Simulator.`

### Reveal — Block C

- Eyebrow above hero number: `YOUR ASPIRE RATE`
- Hero number format: `{XX.X}%` (one decimal)
- Sub-eyebrow under hero number (non-removable per `aspire/COMPLIANCE.md`): `AT THESE ASSUMPTIONS`
- Aspire Gap label: `ASPIRE GAP`
- Aspire Gap value format: signed pts, e.g., `−5.0 pts` or `+1.2 pts`. Sign convention: positive = ahead of the floor, negative = behind. Most first-time users see negative.
- Bar chart heading (small caps eyebrow): `WHAT'S DRIVING IT`
- Bar chart row label format: `{Component name}` (left) / `{X.X}%` (right)

**Interpretation line — three variants by case (all carry the "at these assumptions" pairing):**

- **Negative gap (typical):** *At these assumptions, your money is growing at ~{X.X}%. You're {Y} points behind the rate the life you want requires.*
- **Positive gap (rare):** *At these assumptions, your money is growing at ~{X.X}% — outpacing the life you're building by {Y} points a year. Watch the rates change every quarter.*
- **Zero gap (rare):** *At these assumptions, your money is keeping pace with the life you're building.*

**Primary CTA (after reveal):** `Open the Simulator →` (or alt: `Explore your gap →`. Both avoid the "what closes the gap" framing — the Simulator is a measurement tool, not an answer engine.)

### Email gate

- Heading: `Explore your gap`
- Sub: `The Simulator lets you measure how your gap responds to different assumptions — savings rate, allocation, timeline, geography — at these assumptions.`
- Email input placeholder: `you@example.com`
- Button label: `Open the Simulator`
- Privacy line (small, muted): `We'll send you the Aspire Report. One email a week. Unsubscribe anytime.`

### Returning visitor

- Persistent reset link (ghost): `Not your numbers? Reset →`
- Reset confirmation toast: `Cleared. Start fresh.`

---

## 1.2 — Simulator (`/simulator`)

### Sticky header

- Default scenario name: `Untitled scenario` (in muted italic)
- Number labels (small caps): `ASPIRE RATE` (or `TARGET ASPIRE RATE` when View toggle is set to Target) / `ASPIRE GAP` / `VS. CURRENT`
- Sub-eyebrow under the rate (non-removable): `AT THESE ASSUMPTIONS`
- View toggle label: `View: Required ▾` / `View: Target ▾`
- View toggle panel — Required option label: `Required (the floor — what you need to break even)`
- View toggle panel — Target option label: `Target (Required + margin of safety)`
- View toggle panel — margin input label: `Margin of safety` with helper *"Default 1.0%. Conservative: 2.0%. Aggressive: 0.5%."*
- `vs. Current` value formats: `+{X.X} closed` (gain — gap moved up), `−{X.X} widened` (loss — gap moved down), `0.0 unchanged`
- Save button label: `Save scenario`
- Reset link label: `Reset to current`
- Reset confirmation toast: `Reset to your current state.`

### Lever cards

Each lever card has a name, a Δ-change tag (when moved), and a *current: …* reference line.

**Lever names (small caps):**
- `SAVINGS RATE`
- `ALLOCATION MIX`
- `TIMELINE`
- `TARGET BASKET`
- `GEOGRAPHY`
- `CONFIGURABLE CAGR`

**Δ-change tag formats:**
- Closing the gap: `Δ +{X.X} closed`
- Widening the gap: `Δ −{X.X} widened`

**Current-state reference line format:** *current: {baseline value}*

**Per-lever helpers:**

- **Savings rate** — `How much you're adding per month.`
- **Allocation mix** — `Drag to rebalance. Locked buckets won't move.` (Plus per-bucket: `assumed {X.X}% — set in Configurable CAGR`)
- **Timeline** — `Used to project your trajectory. Doesn't change your Aspire Rate today.`
- **Target basket** — `Pick a life. Refine the components below if you want to tune the weights.`
- **Geography** — `Drives the housing CAGR. Try a comparable metro to see the swing.`
- **Configurable CAGR** — `Smooth out volatility by choosing a longer window. Or set a custom rate if you have a stronger view.`

**Refine basket toggle:**
- Collapsed: `Refine basket weights →`
- Expanded: `Hide weights ↑`
- Reset link inside: `Reset to default weights`

**Configurable CAGR sheet:**
- Heading: `CAGR overrides`
- Sub: `Smooth out volatility, or set a custom rate.`
- Source dropdown options: `5-yr trailing` / `10-yr trailing` / `20-yr trailing` / `Custom %`
- Reset link: `Reset all to defaults`

### Trajectory chart

- Default-state caption (above chart, small caps): `TRAJECTORY OVER {N} YEARS`
- Two line labels (in legend): `What you're building` / `What you need`
- Reference line label (italic, muted): `Your current trajectory`
- Crossover annotation format: *You reach your goal at year {N}.*
- Toggle: `Show as %` / `Show as $`
- Tooltip format: `Year {N} — Building: ${X}M • Need: ${X}M • Gap: ${X}M`

### The Shape of Your Gap (observation panel)

- Section heading (small caps): `THE SHAPE OF YOUR GAP — AT THESE ASSUMPTIONS`

**Observation card template:**
- Observation (Inter 500 16px cream): `{Two-line factual statement about the user's data — descriptive, not prescriptive.}` Example: *"Housing is 47% of your cost growth. Most of that exposure is your zip code."*
- Pointer (Inter 500 14px terracotta on hover): `→ {Invitation to explore — never an instruction}` Example: *"→ See a comparable metro"*
- **No Apply button. No outcome promised. The user does the moving themselves.**

**Card copy variants** (per `page-spec-simulator.md` §8 templates — 2–3 variants per template so the panel doesn't feel templated):

- **Largest cost-growth driver:**
  - *"{Component} is {X}% of your cost growth — the largest single driver."* → See related preset
  - *"Most of your cost growth — {X}% — comes from {component}."* → Try the {component} basket weight
  - *"Your basket leans {component}-heavy: {X}% of your weighted cost growth."* → Refine the basket

- **Allocation skew:**
  - *"Your allocation is {X}% {bucket}. {Bucket} is assumed to grow at {X.X}% — the lowest of your four buckets."* → Move the Allocation lever
  - *"You're {X}% in {bucket}, the slowest-growing bucket in your model."* → See what the Allocation lever does
  - *"Most of your money — {X}% — is in {bucket}, growing at {X.X}%."* → Move the Allocation lever

- **High-CAGR component:**
  - *"{Component} is your highest-CAGR component — {X.X}% over the last five years."* → See the Smaller life preset
  - *"{Component} grew {X.X}% over five years — faster than anything else you're pricing."* → Try a different basket
  - *"Your basket prices {component}, which has been compounding at {X.X}% — well above CPI."* → See what trimming it does

- **Geography spread:**
  - *"Housing in {metro} grew {X.X}% over five years — well above the national {Y.Y}%."* → See a comparable metro
  - *"{Metro} sits in the top quartile of US metros for housing CAGR ({X.X}%)."* → Try the Move to a cheaper city preset
  - *"Your zip pulls your gap up: {Metro} housing has compounded at {X.X}%."* → Try a different metro

- **Long timeline:**
  - *"Your timeline is {X} years. Long horizons compound small contribution changes meaningfully."* → Try the Save 5 more years preset
  - *"At {X} years out, even small changes to savings rate accumulate substantially."* → Move the Savings rate lever
  - *"You have {X} years to compound. Most of that compounding happens in the back half."* → Try Save 5 more years

- **Low money growth:**
  - *"Your money is growing at {X.X}% — close to the cash-only baseline of 4.0%."* → Move the Allocation lever
  - *"At {X.X}% money growth, you're earning roughly the HYSA rate, not the market rate."* → See what allocation does
  - *"Your projected money growth ({X.X}%) is below the broad equity index 5-yr CAGR."* → Try a different mix

- **Big gap (gap < −15 pts):**
  - *"Your gap is {X} pts. At these assumptions, no single lever closes it alone — moving several together is the realistic path to explore."* (no pointer)
  - *"At {X} pts behind, you're looking at multiple-lever territory. The presets are designed to bundle plausible combinations to compare against."* (no pointer)

- **User is ahead (gap > 0):**
  - *"At these assumptions, you're ahead by {X.X} pts. Markets and rates move quarterly — worth checking back."* → See the Configurable CAGR lever
  - *"You're outpacing the life you're building by {X.X} pts. The Configurable CAGR lever lets you stress-test that surplus."* → Try stressing the assumptions

- **No cards fire (boring scenario):**
  - *"Your scenario sits close to the model's baseline assumptions. Move any lever to see your gap respond."* (no pointer)

**Footer beneath the panel** (passive editorial pointer, not a "we have nothing to show you" fallback):
> *More observations like these in the Aspire Report. Tuesdays.* → `Subscribe`

**Required disclaimer below the panel** (Inter 400 12px muted-on-dark, non-removable):
> *Aspire shows you the shape of your gap at your current assumptions. It does not recommend specific assets, allocations, or actions. Talk to a fiduciary advisor before acting on anything you see here.*

**Empty / edge state copy:**

- Gap already ≤ 0: `You're ahead — for now. Lock-it-in suggestions below.`
- Lock-it-in headline example: `Reduce equity allocation to lower volatility while staying ahead.`
- Big gap (>15 pts) preface: *This is a big gap. Small changes won't close it alone — these are the highest-leverage moves we see.*
- No viable suggestions: *You've explored most of the high-impact moves. The Aspire Report has weekly ideas the Simulator doesn't model yet.* (Below: button → `Subscribe`)

### Comparison patterns row (formerly "scenario presets")

- Section heading (small caps): `COMPARE TO A PATTERN`
- Section sub (small body, muted-on-dark): *Each pattern bundles assumptions you could compare against your current scenario. Loading one keeps your current state as the baseline reference.*

**Comparison pattern card titles and one-line descriptions** (descriptive comparisons, not recommended actions):
- `Aggressive` — *A pattern that bundles higher savings and higher equity weighting. See how it compares to your current.*
- `Conservative` — *A pattern that bundles lower equity, longer timeline. See how it compares to your current.*
- `Move to a cheaper city` — *Same life, different zip. Compare your current geography against a comparable but lower-CAGR metro.*
- `Save 5 more years` — *Same plan, longer horizon. Compare what an extra five years of compounding does at these assumptions.*
- `Smaller life` — *Downgrade the basket one tier. Compare a smaller-life basket against your current.*
- `Custom` — *Start clean. Tune everything yourself.*

**Per-pattern projected impact tag** (descriptive, not prescriptive): `At these assumptions, this pattern shifts your gap by Δ {X.X} pts vs. your current state`

**Card action button label:** `Load to compare` (NOT `Apply`. The word *Apply* is removed everywhere in the Simulator — it implies recommended action.)

**Behavior on tap:** the pattern's lever values load into the Simulator. The user's *previous current state* is preserved as the baseline reference (visible as the dashed line on the chart and the "vs. Current" delta in the sticky header). The user can `Reset to current` to revert.

### Saved scenarios row

- Section heading (small caps): `YOUR SCENARIOS`
- Empty state: *No saved scenarios yet. Tinker, then hit Save.*
- Card timestamp format: `Last edited {time ago}`
- Cap-reached helper on Save button: `Delete one to save another. (Cap: 10.)`
- Card menu actions: `Rename` / `Make this my new baseline` / `Share link` / `Delete`

### Save scenario modal

- Heading: `Name this scenario`
- Input placeholder: `{auto-suggested name}`
- Public toggle label: `Make this scenario shareable via public link`
- Public toggle helper: `Anyone with the link can see this scenario. They won't see your email or any other scenarios.`
- Save button: `Save`
- Cancel button: `Cancel`
- Success toast: `Saved. Find it under Your Scenarios below.`

### Make-this-my-baseline confirmation

- Heading: `Make this scenario your new baseline?`
- Sub: `Future Δ Closed numbers will compare against this scenario instead of your original Calculator inputs.`
- Confirm button: `Make it my baseline`
- Cancel button: `Keep the original baseline`
- Success toast: `Baseline updated.`

### Share modal

- Heading: `Share this scenario`
- Sub: `Anyone with the link can see this scenario. They won't see your email or any other scenarios.`
- URL display label: `Public link`
- Copy button: `Copy link`
- Copied toast: `Copied.`
- Revoke link button: `Revoke link`
- Revoke confirmation toast: `Link revoked. The URL no longer works.`

### Shared-scenario view (`/simulator/s/[shareId]`)

- Top banner: `You're viewing someone's scenario.`
- CTA: `Make it your starting point →`
- If visitor has no Calculator baseline: `Run the Calculator first to compare against your own numbers →` (button → `/`)
- Footer credit (no attribution): `This scenario was shared anonymously.`

### Auth-gate redirect (visitor lands on /simulator without baseline)

- Banner copy: `Run the Calculator first to see your gap. Then come back here to close it.`
- CTA: `Open the Calculator →` (button → `/`)

### Returning-visitor toast

- `Picking up where you left off — {scenario name}.`

---

## 1.3 — Account (`/account`)

The settings page. Minimal, plain.

- H1: `Your account`
- Email field label: `Email` (read-only, muted display)
- Newsletter status: `Subscribed to the Aspire Report ✓` / `Not subscribed.` (with `Resubscribe →` link)
- Sessions section heading: `Active sessions`
- Session row format: `{device} — {last seen, e.g., "Last used 2 days ago"}` with `Revoke` button
- Revoke-all button: `Sign out everywhere`
- Privacy summary heading: `Your data`
- Privacy summary body: see Part 4 — Compliance.
- Export your data link (if implemented): `Download my data`

**Delete account flow:**

- Delete section heading: `Delete account`
- Sub: `Permanently deletes your account, your saved scenarios, and removes you from the Aspire Report. This can't be undone.`
- Button label (destructive, but no scary red — just clear): `Delete my account`
- Confirmation modal heading: `Delete your account?`
- Modal sub: `This permanently deletes your saved scenarios, your Calculator state, and your subscription to the Aspire Report. We can't restore it later.`
- Final confirm button: `Yes, delete it all`
- Cancel button: `Keep my account`
- Success toast (then redirect): `Your account is gone.`

---

# Part 2 — Editorial chrome

For the content surfaces. Page-chrome only — actual editorial pieces live in MDX.

## 2.1 — Aspire Index (`/index`)

- H1: `The Aspire Index`
- Lede: `A library of what middle-class life has actually cost — then and now. Each card prices a piece of pop culture against today's numbers. None of these inflate at 3%.`
- Listing section heading (small caps, above the grid): `THE LIBRARY`
- Card pattern (rendered from MDX frontmatter):
  - Title: `{Artifact} ({year})`
  - Body line: `{component description}: ${then} then. ${now} today.`
  - Contrast line: `CPI says {X.X}×. Reality: {X.X}×.`
  - CTA: `Read the breakdown →`

### Index card breakdown page (`/index/[slug]`)

- Eyebrow above title: `THE ASPIRE INDEX`
- Page back-link: `← All Index cards`
- Sources section heading (small caps): `SOURCES`
- Sources format: bullet list, plain text with hyperlinks
- Methodology footnote pointer: `See methodology →` (links to `/methodology`)
- Updated stamp: `Last updated {date}`
- Tool CTA at end of page: `Run your own basket through the Calculator →`

## 2.2 — Aspire Report (`/report`)

- H1: `The Aspire Report`
- Lede: `The rates the BLS doesn't publish. Every Tuesday morning. Five minutes.`
- Subscribe form (above the fold):
  - Email input placeholder: `you@example.com`
  - Button label: `Subscribe`
  - Privacy line: `One email a week. Unsubscribe anytime.`
- Archive section heading (small caps): `THE ARCHIVE`
- Archive item pattern:
  - Date format: `{Month DD, YYYY}` in muted small caps
  - Title: `{issue title}` (Fraunces 500 28px)
  - Excerpt: `{first 120 chars of issue}` — Inter 400 16px muted

### Issue page (`/report/[slug]`)

- Page back-link: `← All issues`
- Eyebrow above title: `THE ASPIRE REPORT — {Month DD, YYYY}`
- Tool CTA at end of issue (when relevant scenario is referenced): `Open this scenario in the Simulator →`

## 2.3 — Explainers (`/explainers`)

- H1: `Explainers`
- Lede: `Short pieces on the math behind the Aspire Rate. Read one in three minutes; come back when a number makes you curious.`
- Listing section heading (small caps): `BY TOPIC` (or `RECENT` — author's call)
- Listing item pattern:
  - Title: `{title}` (Fraunces 500 32px)
  - Summary: `{frontmatter summary, the citation block}` — Inter 400 18px muted
  - Read time: `{N}-minute read` — Inter 500 12px small caps

### Explainer page (`/explainers/[slug]`)

- Page back-link: `← All explainers`
- Eyebrow above title: `EXPLAINER`
- Author byline (top of body): `By Scott Krauss · Updated {date}`
- Aside callout pattern: a boxed block with no heading, italic body, hairline border on `--paper2`.
- Sources section heading (small caps): `SOURCES`
- Methodology footnote pointer: `See methodology →`
- Tool CTA at end: `See how this affects your number →` (links to `/`)

## 2.4 — Methodology (`/methodology`)

- H1: `Methodology`
- Lede: `Every rate, every source, every formula. Boring on purpose. If a number on Aspire surprises you, it should be defensible here.`
- Version block (top of page, small caps muted): `Version {N} · Last refreshed {date}`
- Section heading pattern (Fraunces 500 32px) + small caps eyebrow above (`§{N}`)
- Disclaimer block (boxed, near the top): see Part 4 — Compliance.
- Change log section heading: `Change log`
- Change log entry format: `{date} — {one-line summary of what changed}`

## 2.5 — Manifesto (`/manifesto`)

Existing page. Untouched. No new copy required from this doc.

## 2.6 — Author bio (`/author/scott`)

- H1: `Scott Krauss`
- Eyebrow: `WRITING ASPIRE`
- Body: 100–200 words on Scott — credentials relevant to financial commentary, why he's writing Aspire, links to other work. **Author to draft.** Used in JSON-LD Author schema for E-E-A-T signal.
- Footer link: `Contact: scott@aspirerate.com` (or whatever the contact route is)

---

# Part 3 — System copy

Errors, empty states, transactional emails, edge cases. Calm, never alarming, never apologetic-to-the-point-of-cringey.

## 3.1 — Form validation

- Required field empty (generic): *Need a value here.*
- Email format invalid: *That doesn't look like a valid email.*
- Number format invalid: *Numbers only, please.*
- Allocation sum ≠ 100%: *Allocations should add up to 100%. Currently {X}%.*
- Geography unresolvable: *Couldn't resolve that location. Using national average instead.*
- Timeline = 0 (clamp message): *Timeline needs at least 1 year.*

## 3.2 — Empty states

- Saved scenarios (Simulator): *No saved scenarios yet. Tinker, then hit Save.*
- Recommendations (no viable suggestions): *You've explored most of the high-impact moves. The Aspire Report has weekly ideas the Simulator doesn't model yet.*
- Index listing (during initial load only — should never persist): *Loading the library…*
- Report archive (during initial load only): *Loading recent issues…*
- Explainers listing (initial load only): *Loading explainers…*

## 3.3 — Error pages

### 404

- Page heading: `Nothing here.`
- Sub: `There's no page at that address. The math is still around, though.`
- CTA: `Run your number →` (button → `/`)

### 500

- Page heading: `Something broke.`
- Sub: `The math is fine. Something around it isn't. Try again in a moment.`
- CTA: `Reload` (button → window.location.reload)

### Auth — magic link expired

- Heading: `That link expired.`
- Sub: `Magic links last five minutes for security. Send a new one to keep going.`
- CTA: `Email me a new link` (button)

### Auth — too many magic-link requests

- Heading: `Too many requests.`
- Sub: `We've sent five magic links to this email in the past hour. Try again in {N} minutes, or reach out at help@aspirerate.com if something's wrong.`

## 3.4 — Confirmation toasts

- `Saved.`
- `Copied.`
- `Reset to your current state.`
- `Baseline updated.`
- `Link revoked. The URL no longer works.`
- `Subscribed. Look for the Report in your inbox Tuesday.`
- `Unsubscribed. You won't get any more emails from us.`

## 3.5 — Transactional emails

### Magic-link sign-in

- Subject: `Your Aspire sign-in link`
- Body: *Click the link below to sign in. It expires in five minutes.*
- Button label: `Sign in to Aspire`
- Footer line: *If you didn't request this, you can ignore the email — no action needed.*

### New-device login notification

- Subject: `You signed in to Aspire from a new device`
- Body: *Someone — probably you — signed in to Aspire just now from a new device.*
- Details block: `Device: {UA-summary} · Location: {city, region} · Time: {timestamp}`
- CTA: `Wasn't you? Revoke all sessions →` (links to `/account?revoke=all`)
- Footer line: *We send this once per new device. We don't track location beyond city level.*

### Account deletion confirmation

- Subject: `Your Aspire account has been deleted`
- Body: *Your account and all of your saved scenarios are gone. Your subscription to the Aspire Report has been cancelled. We don't keep a backup. Thanks for trying it out.*

### Beehiiv welcome (if not handled by Beehiiv natively)

- Subject: `Welcome to the Aspire Report`
- Body: *Every Tuesday morning. The numbers behind the numbers. Five minutes. The first issue you'll get is the next one we publish — no catch-up dump.*
- Footer: *You can unsubscribe anytime from the bottom of any issue.*

## 3.6 — Cookie / consent (if needed)

If a banner is required for legal compliance (TBD per legal review):

- Body: *Aspire uses essential cookies to keep you signed in and remember your scenarios. We don't run ads or sell your data.*
- Buttons: `Got it` / `Manage` (the second opens a small panel listing the actual cookies — auth, theme — both essential)

If not required, no banner. (Preferred outcome.)

---

# Part 4 — Compliance copy

The same compliance lines used everywhere. **Do not paraphrase these per page** — copy them verbatim from this section so a single legal-review change updates the whole site.

## 4.1 — Footer compliance line (every page)

> Outputs are educational measurements at your current assumptions, not investment advice. Past rates are not guarantees of future results.

Format: Inter 400, body-sm, `--muted`. Centered or left-aligned per footer layout.

## 4.0 — Tagline placement (verbatim)

- **Primary tagline** (footer mast, OG card, social profile, brand identity): *"How much of tomorrow can you afford?"*
- **Secondary punchline** (Calculator H1, occasional editorial accent, social posts): *"Inflation isn't a number. It's a vector."* — protected exception to the no-negation-pattern voice rule. Use sparingly.

## 4.2 — The Shape of Your Gap observation panel disclaimer (Simulator)

Small text below the Shape of Your Gap observation panel (mirrors the in-spec disclaimer in `page-spec-simulator.md` §8):

> Aspire shows you the shape of your gap at your current assumptions. It does not recommend specific assets, allocations, or actions. Talk to a fiduciary advisor before acting on anything you see here.

## 4.3 — Methodology disclaimer block

Boxed at the top of `/methodology`:

> Aspire is not a registered investment advisor. The figures and methods on this page are published for educational purposes — to help readers understand the assumptions behind their personal inflation rate. Nothing here is a recommendation to buy, sell, or hold any asset. Past CAGRs are not guarantees of future returns. Always check with a fiduciary advisor before making financial decisions.

## 4.4 — Privacy summary (footer + `/privacy` excerpt)

Used in three places verbatim: `/account` privacy section, `/privacy` policy page (as the plain-English summary), and the footer of every page (linked, not inlined).

> ### What we keep
> Your email and the numbers you enter — assets, allocation, contributions, geography, goals — so the Simulator can pick up where you left off.
>
> ### How we keep it
> Sensitive financial fields are encrypted in our database. Connections use TLS. Magic-link sign-in means we never store passwords.
>
> ### What we don't do
> Sell or share your data. Track you with ads. Aggregate accounts. Store your name, IP, or anything you didn't type into Aspire.
>
> ### What you can do
> Delete your account anytime at /account. Unsubscribe from the Aspire Report at any time. Email privacy@aspirerate.com with questions.

---

# Part 5 — Placeholder legal pages

> ## ⚠️ LEGAL REVIEW REQUIRED
>
> The two pages below are **placeholders only.** They are written in plain English, accurately describe Aspire's data and compliance posture per `security-and-privacy.md`, and are safe to ship at launch — but they are not a substitute for a real privacy policy and terms of service drafted by a US lawyer with consumer-fintech experience. Schedule legal review before launch and replace these in full. Flag any conflict between these placeholders and the final attorney-drafted versions.

## 5.1 — Placeholder `/privacy`

```
# Privacy

_Last updated: 2026-05-11. PLACEHOLDER pending legal review._

Aspire is operated by [Aspire LLC / your legal entity] ("Aspire," "we"). This page describes what data we collect, how we keep it, and what you can do about it. Plain English first; the formal version follows legal review.

## What we collect

When you use the Calculator and Simulator, we collect:

- **Your email address**, so we can sign you in (we use magic-link authentication — there are no passwords) and so you can subscribe to the Aspire Report newsletter.
- **The numbers you enter**: total assets, allocation breakdown, monthly contribution, geography (zip or metro), timeline, life-goal selection, and any scenarios you save.
- **Computed values** derived from your inputs (your Aspire Rate and Aspire Gap), cached so pages load quickly when you return.

We do not collect: your name, your IP address (we don't log it with calculator submissions), precise geolocation (zip is the maximum precision), browser fingerprints, income, demographic data, or anything you typed into a form but didn't submit.

## How we keep it

- Sensitive financial fields (total assets, allocation, contribution, scenario lever data) are encrypted at the application layer using libsodium with a key held in Supabase Vault. Even our database engineers cannot read these fields without the key.
- All other fields are encrypted at rest by our database provider (Supabase) and in transit via TLS.
- Row-level security policies prevent any user from reading another user's data.
- We use magic-link authentication with five-minute expiration on sign-in links. We never store passwords.

## How we use it

- To run the Calculator and Simulator for you.
- To pick up where you left off when you return.
- To send you the Aspire Report newsletter, if you subscribed.
- To compute aggregate, anonymized statistics about how the Aspire user base's personal inflation rates are trending. Aggregate data only — never anything that identifies you individually.

## What we don't do

- We don't sell, rent, or share your data with third parties for marketing purposes.
- We don't run ads on Aspire and we don't allow third-party tracking pixels on the Calculator or Simulator pages.
- We don't recommend specific investments, funds, or financial products of any kind. (We're not allowed to, and we don't want to.)

## Service providers

We use these vendors to operate Aspire. Each has access only to the data they need:

- **Supabase** — database, authentication. Stores your email and your encrypted scenarios.
- **Beehiiv** — newsletter delivery. Stores your email address only, for the Aspire Report.
- **Netlify** — site hosting. Does not store user data.

Each vendor has its own privacy policy. We work only with vendors whose practices align with the commitments on this page.

## Your rights

You can:

- Access your data at /account.
- Delete your account and all of your data at /account. Deletion is permanent.
- Unsubscribe from the Aspire Report from any issue's footer.
- Email privacy@aspirerate.com with questions.

If you are a California resident, you have additional rights under the CCPA, including the right to request specific data, the right to deletion, and the right to opt out of the sale of personal information (which we do not do anyway). Contact privacy@aspirerate.com to exercise these rights.

If you are in the EU/UK, GDPR-equivalent rights apply. We do not currently target users outside the US, but we honor these rights regardless.

## Children

Aspire is not directed at children under 16. We do not knowingly collect data from children. If you believe we have, contact privacy@aspirerate.com and we will delete it.

## Changes to this policy

When we update this policy, we'll change the "Last updated" date at the top and announce material changes in the Aspire Report. Continued use of Aspire after a material change means you accept the updated policy.

## Contact

privacy@aspirerate.com
```

## 5.2 — Placeholder `/terms`

```
# Terms of Service

_Last updated: 2026-05-11. PLACEHOLDER pending legal review._

By using Aspire (the website at aspirerate.com and any associated services), you agree to these terms. If you don't agree, don't use the service.

## What Aspire is

Aspire is a web tool and publication that helps people understand their personal inflation rate — that is, the rate of return their assets need to earn to keep up with the cost of the life they want. The Calculator computes a number called the Aspire Rate. The Simulator lets you model scenarios that change that rate. The Aspire Report is a weekly newsletter on personal inflation.

## What Aspire is not

- Aspire is not a registered investment advisor.
- Aspire does not provide personalized investment advice.
- Nothing on Aspire is a recommendation to buy, sell, or hold any specific asset, fund, or financial product.
- Aspire's outputs are educational measurements based on publicly available data. Past inflation and return rates are not guarantees of future results.
- You should consult a fiduciary financial advisor before making any financial decision.

## Your use of Aspire

You agree to use Aspire only for lawful purposes. You agree not to:

- Attempt to access another user's data.
- Reverse-engineer, scrape, or systematically extract Aspire's content (the Aspire Index, Explainers, Methodology) for commercial use without permission.
- Submit knowingly false data to manipulate aggregate statistics.
- Use Aspire's brand or content in a way that suggests Aspire endorses you or your product, without permission.

## Your account

You can create an account by submitting your email address through the Calculator's email gate. We use magic-link authentication; you do not set a password. You are responsible for keeping access to your email secure. You can delete your account at any time from /account.

## Subscriptions

The free tier of Aspire is available at no cost. Paid tiers, if and when introduced, will be governed by additional terms presented at the time of subscription.

## Intellectual property

Aspire's content (the Index card library, Explainers, Methodology, Aspire Report archive, the Aspire Rate methodology, the brand and visual identity) is owned by Aspire. You may share individual pieces and quote them with attribution, but you may not republish them in full without permission.

Public scenarios you share via /simulator/s/[id] are visible to anyone with the link. By making a scenario public, you grant us the right to display it on the public page.

## Disclaimer of warranties

Aspire is provided "as is." We do our best to keep the data accurate and the service running, but we make no warranties about uptime, accuracy, or fitness for any particular purpose.

## Limitation of liability

To the maximum extent permitted by law, Aspire is not liable for any indirect, incidental, or consequential damages arising from your use of the service or reliance on its outputs.

## Changes to these terms

We may update these terms. When we do, we'll change the "Last updated" date at the top and announce material changes in the Aspire Report. Continued use of Aspire after a material change means you accept the updated terms.

## Governing law

These terms are governed by the laws of the State of [TBD pending legal review], without regard to conflict-of-laws principles.

## Contact

legal@aspirerate.com
```

---

## Maintenance notes

- **When you change a phrase here**, change it in only this file. The page specs and content architecture docs reference this file as source of truth.
- **When you ship a new lever, scenario preset, or surface**, add its copy here in the appropriate Part before merging the build.
- **When legal review delivers final `/privacy` and `/terms`**, replace Part 5 in full and update the "Last updated" timestamp at the top of this doc.
- **When voice rules in `brief-v2.md` §7 change**, audit this file end-to-end against the new rules.
