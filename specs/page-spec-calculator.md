# Page Spec — Calculator (`/`)

_Companion to brief-v2.md and creative-direction.md. Locked 2026-05-11._

The Calculator is the homepage. Not a button leading to a calculator — the calculator IS the page. A first-time visitor's entire job here is: enter a small set of inputs, see their **Aspire Rate** and **Aspire Gap**, feel the math, and decide whether to open the Simulator.

---

## 1. Page job and success criteria

**Job:** in under 90 seconds, give the visitor two memorable numbers — their Aspire Rate (the floor required by their priced future) and their Aspire Gap (how their money growth compares against that floor) — and convince them the Simulator is worth their email.

Definitions per `brief-v2.md` §1:
- **Aspire Rate** = the required money-growth rate to cover the priced future at the user's current assumptions (= 5-yr trailing CAGR of the goals basket).
- **Aspire Gap** = (your money growth rate) − Aspire Rate. **Positive = ahead, negative = behind.** Typical first-time visitor sees a negative Aspire Gap.
- **Target Aspire Rate** = Aspire Rate + margin of safety (default +1%) — *not surfaced on the Calculator*. It's a Simulator concept (margin-of-safety lever).

**Success:**
- ≥40% of unique visitors complete inputs and see the reveal.
- ≥25% of those who see the reveal submit email and continue to the Simulator.
- The bouncer who leaves in 8 seconds still encounters the thesis — *"Inflation isn't a number. It's a vector"* — because it's in the hero above the inputs.

---

## 2. Page structure (top to bottom)

```
Nav  (global, see brief-v2.md §3)

Hero strip
  Eyebrow:   PERSONAL INFLATION INDEX
  H1:        Inflation isn't a number. It's a vector.
  Lede:      one sentence positioning the calculator below

Calculator — Block A: "The life you want"
  Life chip (Home / Family / Freedom)
  Geography (zip or metro)
  Timeline (5–30 years)

Calculator — Block B: "What you're working with"
  Total current assets ($)
  Allocation breakdown (4 buckets)
  Monthly contribution ($)

Reveal — Block C: "Your Aspire Rate"
  Hero number: Aspire Rate (Fraunces, display-xl)
  Sub-hero number: Aspire Gap (gain/loss color)
  Horizontal bar chart: basket components vs. their 5-yr CAGR
  One-line interpretation

Email gate
  Heading + sub + email input + button
  Reveal stays visible above; the gate is the doorway, not a paywall

Footer (global)
```

The whole page sits on `--paper`. The reveal moment briefly drops to `--ink` (full-bleed) for visual climax — see Section 6.

---

## 3. Hero strip

Above the inputs, no chart, no image. Pure type.

**Eyebrow** (small caps Inter, terracotta, tracking 0.08em):
> PERSONAL INFLATION INDEX

**H1** (Fraunces 500, display-lg, ink):
> Inflation isn't a number. It's a *vector*.

**Lede** (Inter 400, body-lg, muted):
> CPI says 3%. The life you're working toward inflates closer to 12%. Find your number below — then find out what it'll take to close the gap.

That's the entire hero. No CTA buttons. The CTA is the calculator itself, immediately underneath.

---

## 4. Block A — "The life you want"

Section eyebrow: `STEP 1 — THE LIFE YOU WANT` (small caps, terracotta).
Section heading (Fraunces 500, display-md): *"What basket are you pricing?"*

Three inputs, side-by-side on desktop, stacked on mobile.

### Input A1 — Life chip
**Single-select pill chips:** `A home` · `A family` · `Freedom`
- Default: none selected. The reveal is gated on this being chosen.
- Selecting a chip pre-fills a basket of priced components used in the bar chart and the CAGR calculation. The user never sees or edits the basket on this page — that's the Simulator's job. (The Simulator's "Refine basket" is the surface where they tune; the Calculator just commits to a preset.)

Basket presets (locked here for Codex; tweakable in `methodology.md`):
- **A home:** 50% housing (Case-Shiller for selected metro), 25% S&P 500, 15% CPI-U, 10% childcare/family CPI subindex
- **A family:** 30% housing, 25% S&P 500, 20% childcare, 15% private K-12 tuition, 10% healthcare
- **Freedom:** 35% S&P 500, 30% housing, 20% healthcare, 15% CPI-U

Each chip shows a one-line description on hover (desktop) or tap-and-hold (mobile):
- *A home* → *"A house in your zip, plus a normal life around it."*
- *A family* → *"Kids, school, healthcare, and the house to fit them."*
- *Freedom* → *"Stop working when you want to, in the zip you want to."*

### Input A2 — Geography
Single text input with autodetect.
- Auto-fills from IP geolocation on first load (silently, no prompt).
- Format: zip code or metro name. The input accepts either; we resolve to the nearest Case-Shiller metro for housing CAGR.
- Editable inline. Show resolved metro in muted gray underneath: *"Resolved: Austin–Round Rock MSA"*
- If unresolvable: fall back to national CAGR and label the result accordingly.

### Input A3 — Timeline
Slider from 5 to 30 years, default 10.
- Tick marks at 5, 10, 15, 20, 25, 30.
- Numerical value shown to the right (Inter 600, tabular).
- Tap-to-edit on mobile — slider moves to the value entered.

Timeline doesn't affect the Aspire Rate (that's a CAGR), but it affects the projection chart users see on the next page (Simulator). Document this in copy under the slider:
> *"Used in the Simulator to project your trajectory. Doesn't change today's number."*

---

## 5. Block B — "What you're working with"

Section eyebrow: `STEP 2 — WHAT YOU'RE WORKING WITH` (small caps, terracotta).
Section heading (Fraunces 500, display-md): *"And what's working for you?"*

### Input B1 — Total current assets
Single dollar input.
- Format: `$0` placeholder, comma-separated as user types.
- Inter 600, tabular numerals.
- Right-aligned in a 320px-wide input.

### Input B2 — Allocation breakdown
Four inputs as percentages, summing to 100%. Live validation — if total ≠ 100%, the reveal is gated and a soft warning appears: *"Allocations should add up to 100%. Currently 95%."*

Buckets:
1. **Cash & savings** (assumed 4.0% expected return — high-yield savings rate)
2. **Stocks & index funds** (assumed 10.4% expected — S&P 500 5-yr CAGR)
3. **Real estate** (assumed 9.0% expected — Case-Shiller national)
4. **Other** (assumed 6.0% expected — blended/conservative default)

Default values pre-populated to a sensible national average:
- Cash 25 / Stocks 50 / Real Estate 20 / Other 5

Each bucket shows its assumed return in muted gray underneath:
> *"Cash — assumed 4.0% (national HYSA average, 5-yr trailing)"*

A small `?` next to each bucket opens a tooltip with the source.

### Input B3 — Monthly contribution
Single dollar input, optional but encouraged.
- Placeholder: `$0`
- Helper text: *"How much you're adding per month. Used for trajectory in the Simulator."*

This input doesn't affect the Aspire Rate or Gap shown on this page (those are pure CAGR comparisons). It's collected here so the Simulator can show projected trajectory without re-asking.

---

## 6. Block C — The reveal

This is the visual climax of the page. Once Block A and Block B are valid, the reveal animates in.

### The reveal choreography (only "showpiece" animation in the product)

Trigger: all required inputs filled (life chip selected, geography resolved, allocation = 100%, total assets > 0).

Sequence (1200ms total, respects `prefers-reduced-motion`):
1. **0–300ms:** the page background under the reveal block transitions from `--paper` to `--ink`. Block C becomes a full-bleed dark panel.
2. **300–500ms:** eyebrow fades in (cream): `YOUR ASPIRE RATE`
3. **500–1100ms:** hero number counts up from `0.0%` to the calculated Aspire Rate. Fraunces, display-xl (96px), color is `--paper` cream.
4. **1100–1200ms:** sub-hero (Aspire Gap), bar chart, and interpretation line fade in beneath, staggered by 80ms each.

After the choreography, the reveal stays visible. No fade-out. The user can scroll back up to edit inputs; the reveal updates live (no choreography on subsequent updates — just smooth tween, 250ms).

### What the reveal contains

```
                     YOUR ASPIRE RATE
                         10.2%
                  AT THESE ASSUMPTIONS
                  ─────────────────────
                  Aspire Gap    −5.0 points
                  ─────────────────────

  WHAT'S DRIVING IT
  ┌──────────────────────────────────────┐
  │ Housing in Austin–Round Rock  ●●●●●●●●●  9.0% │
  │ S&P 500                       ●●●●●●●●●●●  10.4% │
  │ Childcare                     ●●●●●●●●●●●●  11.8% │
  │ CPI-U                         ●●●●  3.3% │
  └──────────────────────────────────────┘

  At these assumptions, your money is growing at ~5.2%.
  You're 5 points behind the rate the life you want requires.

           ┌──────────────────────────┐
           │  Open the Simulator → │
           └──────────────────────────┘
```

The "AT THESE ASSUMPTIONS" eyebrow under the hero number is **non-removable.** It is the compliance pairing required by `aspire/COMPLIANCE.md`. If a build proposes removing it, push back.

### Detail spec

- **`YOUR ASPIRE RATE`** — eyebrow, Inter small caps 12px, tracking 0.08em, color `--accent` (terracotta on dark — verify contrast, may need to brighten the terracotta variant for use on `--ink`; if so introduce `--accent-on-dark: #e26449`).
- **Aspire Rate value** — Fraunces 500, 96px desktop / 56px mobile, `--paper` color, tabular numerals on. Format: one decimal, `%` suffix in 50% scale.
- **`AT THESE ASSUMPTIONS`** — sub-eyebrow directly under the Aspire Rate value, Inter small caps 11px, tracking 0.08em, `--muted-on-dark`. **Required by compliance per `aspire/COMPLIANCE.md` — non-removable.**
- **Aspire Gap label and value** — label in small caps Inter, value in Fraunces 500 56px desktop / 36px mobile. Sign convention: positive = ahead, negative = behind. Color: `--loss` if negative (typical), `--gain` if positive (rare). Format: signed (`−5.0 points` or `+1.2 points`).
- **Bar chart** — horizontal bars showing each basket component and its 5-yr CAGR.
  - Bar color: gradient from `--gain` to `--loss` based on rate magnitude relative to the user's money growth. Or simpler: all bars `--paper` semi-transparent, with the value label in `--paper`. (Pick the simpler treatment first; reserve gradient for v2.)
  - Bar order: descending CAGR (highest at top).
  - Each bar labeled left (component name in Inter 500 14px) and right (CAGR in Inter 600 16px tabular).
- **Interpretation line** — Inter 400 18px, `--paper` cream, max-width 480px, centered. Templated to always include "at these assumptions":
  > *"At these assumptions, your money is growing at ~{X.X}%. You're {Y} points behind the rate the life you want requires."*
  - If gap is positive (rare): *"At these assumptions, your money is growing at ~{X.X}% — outpacing the life you're building by {Y} points a year. Watch the rates change every quarter."*
  - If gap is exactly 0 (rare): *"At these assumptions, your money is keeping pace with the life you're building."*
- **CTA button** — primary terracotta pill, label `Open the Simulator →`. Triggers the email gate.

---

## 7. Email gate

After the user clicks `Open the Simulator →`, the reveal stays visible above; the email gate appears below it as a dedicated section.

The reveal does NOT fade or get covered. The user has already seen their numbers. The gate is the doorway to the Simulator, not a paywall on the result.

```
                  Open the Simulator

   The Simulator lets you model what changes — savings rate,
   allocation, timeline, geography — and watch your gap close
   in real time.

   ┌─────────────────────────────┐  ┌──────────────────┐
   │ you@example.com             │  │ Open the Simulator │
   └─────────────────────────────┘  └──────────────────┘

   We'll send you the Aspire Report. One email a week. Unsubscribe anytime.
```

### Detail spec

- Section sits on `--paper` (page returns to cream below the dark reveal panel).
- Heading: Fraunces 500, display-md, ink.
- Sub: Inter 400, body-lg, muted, max-width 560px.
- Email input: editorial input style (cream, ink underline), full-width on mobile, 320px on desktop.
- Button: primary terracotta pill, label `Open the Simulator`.
- Privacy line: Inter 400, body-sm, muted.
- On submit:
  1. Email POSTs to Beehiiv (publication: Aspire Report) and Supabase (creates anonymous user record keyed to email).
  2. Calculator state (life chip, geography, timeline, assets, allocation, monthly contribution) is written to Supabase under the user record.
  3. User is redirected to `/simulator` with state already loaded — no re-entering inputs.
- Validation: email format only. No double-opt-in confirmation required to enter the Simulator (we don't gate the product behind email verification — that's friction).
- Error state: if Beehiiv or Supabase fails, still proceed to the Simulator with state in localStorage. Log the error; show the user nothing.

---

## 8. State and persistence

- **All inputs persist in localStorage** as the user types/selects. If they leave the page and return, inputs are restored. No reset button — let them edit.
- **On email submission**, state moves to Supabase under the user record. localStorage stays as a cache.
- **Returning visitors with a stored email** see their last-entered Calculator state pre-filled and the reveal already animated to its end state (no choreography on return). A small ghost link reads: *"Not your numbers? Reset →"* — clears state and starts fresh.

---

## 9. Edge cases

| Case | Behavior |
|---|---|
| Allocation doesn't sum to 100% | Reveal is gated. Soft warning under the allocation block. No error red — just muted text. |
| Assets entered as 0 | Reveal is gated. Helper text: *"Enter what you have working for you, even an estimate."* |
| Geography unresolvable | Fall back to national Case-Shiller. Label: *"Using national average — enter a US zip for local data."* |
| Aspire Gap is positive (>0) | Switch interpretation copy and color (`--gain` instead of `--loss`). Don't celebrate too hard — the Simulator is still useful for projection. |
| Aspire Rate would be undefined (e.g., bad inputs) | Don't show the reveal. Show nothing. Never show `NaN%` or placeholder dashes. |
| User refreshes mid-input | localStorage restores partial state. Reveal stays gated until valid. |
| Mobile keyboard covers the inputs | Standard scroll-into-view on focus. No special handling needed. |
| Slow network / Beehiiv down | Email submit doesn't block the redirect. Simulator opens with state from localStorage. Sync attempted again on the Simulator page. |

---

## 10. Mobile behavior

Breakpoint at 860px.

- Hero strip: H1 scales to 42px. Lede holds at body-lg.
- Block A: chips stack vertically (full-width). Geography input full-width. Timeline slider full-width.
- Block B: total assets full-width. Allocation breakdown becomes 4 stacked rows (label left, percent input right). Monthly contribution full-width.
- Reveal: full-bleed dark panel as on desktop, but the hero number scales to 56px. Bar chart compresses — labels truncate with ellipsis if needed; full label shows on tap.
- Email gate: heading scales to display-sm. Email input and button stack vertically (input on top, button beneath).
- The reveal choreography is preserved on mobile — same 1200ms sequence, same showpiece feel.

---

## 11. Tech notes for Codex

- **Stack assumption (v1 / Phase A):** vanilla HTML + CSS + JavaScript on Netlify. **No framework, no build step.** This matches the existing `aspire/index.html` stack per `aspire/TECHNICAL_CONTEXT.md`. Framework migration (React/Next.js) is deferred to v2 if Pro-tier complexity demands it — never ship a stack migration and a redesign in the same release.
- **State management:** plain JS modules with a single in-page state object; sync to `localStorage` on every change (debounced 200ms); sync to Supabase via `POST /api/score` (the existing Netlify Function, refactored to accept the new schema) on email submit only.
- **Math:** all client-side, in `aspire/lib/aspire.js` (the existing module, refactored for the new input model). CAGR figures live in `aspire/rates.json` (the existing data file, kept). Compute function returns `{ aspireRate, aspireGap, moneyGrowth, components: [{ name, cagr, weight }] }`. Sign convention: `aspireGap = moneyGrowth − aspireRate`, positive = ahead.
- **Geography resolution:** `ip-api` or Netlify edge for autodetect. Case-Shiller metro lookup against a static `metros.json` (new file alongside `rates.json`).
- **Animations:** vanilla CSS transitions and `requestAnimationFrame`-driven count-ups. Avoid Framer Motion or other React-coupled libraries. Reuse the existing animation helpers in `aspire/lib/`.
- **Bar chart:** hand-rolled SVG. Only 4–6 bars, no axis, full control over labels. Existing `aspire/lib/chart-*.js` modules cover similar patterns — extend rather than introducing a chart library.
- **Beehiiv integration:** keep the existing `aspire/netlify/functions/score.js` flow. It already POSTs to Beehiiv subscriptions API server-side. Refactor its payload shape to accept the new Calculator input schema; preserve the function name and route to avoid breaking the deploy contract.
- **Supabase schema:** new tables `users`, `calculator_states`, `scenarios`, `baseline_overrides` per `security-and-privacy.md` §3. **Full migration: the existing `public.scenarios` table will be dropped after the new schema lands** (per drift-report Conflict 5, no real user data to preserve). Schema migration is a Codex-led task with its own PR.
- **Security model:** RLS enabled on every table; the money fields (`total_assets`, `allocation_json`, `monthly_contribution`) are stored as `bytea` and encrypted at the application layer using libsodium with a key from Supabase Vault. All encryption/decryption happens server-side in Netlify Functions — the browser never sees the key. See `security-and-privacy.md` §4.
- **Auth:** Supabase Auth magic-link for sign-in. Resend stays for *transactional* email (the score email). Two channels, different jobs.
- **Aspire Score deprecation:** the existing 0–100 score concept is being deprecated (drift-report Conflict 6). Don't surface it on this page. Existing `score.js` keeps its function name (deploy contract) but its return shape changes to surface `aspireRate` + `aspireGap` instead of `score`.
- **Accessibility:** all inputs labeled. ARIA live region on the Aspire Rate and Gap. Keyboard-navigable chip selector (arrow keys + space). Reduced-motion media query bypasses the reveal choreography.
- **Performance budget:** LCP under 2.0s. Static HTML hero — no JS hydration needed for the H1 and lede. Calculator JS loads after.
- **Don't ship:** chart libraries beyond what's needed. No Chart.js, no full D3, no React. Hand-rolled SVG only.
- **Compliance check:** existing `npm run check:compliance` script in `aspire/scripts/check-compliance.sh` must pass before merge. Ensure the "at these assumptions" pairing is preserved everywhere a rate or gap is surfaced.

---

## 12. Copy file pointer

All on-page copy lives in `copy.md` under `## /` so you can edit voice in one place. This spec uses the canonical strings inline; if any drift appears between this doc and `copy.md`, **`copy.md` wins.**
