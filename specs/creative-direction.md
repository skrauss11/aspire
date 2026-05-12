# Aspire — Creative Direction

_Companion to brief-v2.md. Locked 2026-05-11._

Aspire runs in two visual registers. The wrapper is editorial — magazine typography, cream paper, generous space, the Δ as a recurring glyph. The core — wherever the tool lives — is financial instrument: dense data, saturated gain/loss colors, real numbers presented at instrument-grade clarity.

This is the central tension the design has to hold: **Aspire reads like a magazine and works like a Bloomberg terminal.** Get either side wrong and the brand collapses into a category cliché — fintech app or design blog. Both fail.

---

## 1. The two registers

| | Editorial wrapper | Financial-instrument core |
|---|---|---|
| **Where it lives** | Homepage chrome, /index, /explainers, /report, /manifesto, /methodology, all nav and footer | Calculator inputs and reveal, Simulator, all charts and data viz |
| **Mood** | Sunday New York Times, FT Weekend, Pudding.cool | Robinhood, Stripe Dashboard, Bloomberg Terminal lite |
| **Type** | Fraunces big and loose for headlines, Inter for body | Inter throughout, monospace tabular numerals for figures |
| **Background** | `--paper` (warm cream) | `--surface-dark` for Simulator; `--paper` for Calculator inputs, `--ink` for the reveal moment |
| **Color** | Cream, ink, muted, terracotta accent | Saturated gain/loss palette + ink/paper |
| **Density** | Low — generous whitespace | High — efficient information per pixel |
| **Motion** | Sparse — count-ups on first scroll only | Continuous — levers move numbers in real time |

Transitions between registers are deliberate. Entering the Calculator reveal moment, the surface tightens: type drops in size, the data takes the foreground, the page goes ink for one focused frame. Entering the Simulator, the editorial chrome falls away to a focused dark workspace.

---

## 2. Type

**Display + headlines: Fraunces** (Google Fonts, optical size 9–144, weights 500 and 650).
- Used in: wordmark, all editorial headlines (H1/H2), and the "hero number" reveals (Aspire Rate, Aspire Gap, Index card prices).
- Italics carry the thesis: *vector*, *yours*, *your* basket.
- Display sizes loose: ~76px H1 desktop, 42px mobile. Optical size scales with type size.
- Numerals in Fraunces ONLY for hero number reveals — large, single-figure-of-interest moments. Everything else uses Inter.

**UI + body + tool: Inter** (Google Fonts, weights 400/500/600/700).
- Used in: all body text, all tool labels and inputs, all chart annotations, all nav.
- **Numbers inside the tool surfaces use Inter tabular figures** (`font-feature-settings: "tnum"`) so digits align in tables, levers, and live-updating outputs.
- **Eyebrows and labels:** small caps Inter at 12px with wide tracking (0.08em). Preserves the editorial feel without leaning on a third font.

**Two-font system. No third face.** Resist the urge to add a monospace or a serif body face. Constraint produces consistency.

### Type scale (desktop)

| Token | Size | Family | Weight | Use |
|---|---|---|---|---|
| `display-xl` | 96px | Fraunces | 500 | Hero number reveal (Aspire Rate / Gap) |
| `display-lg` | 76px | Fraunces | 500 | H1 |
| `display-md` | 56px | Fraunces | 500 | Section headers |
| `display-sm` | 42px | Fraunces | 500 | Sub-section headers |
| `body-lg` | 19px | Inter | 400 | Lede paragraphs |
| `body` | 16px | Inter | 400 | Default body |
| `body-sm` | 14px | Inter | 400 | Tool secondary text |
| `label` | 12px | Inter | 600 | Small-caps labels, eyebrows (tracking 0.08em, uppercase) |
| `data-lg` | 32px | Inter | 600 | Tool data values (non-hero) |
| `data` | 16px | Inter | 500 | Tool data values (default) |

Mobile scales: `display-xl` → 56px, `display-lg` → 42px, `display-md` → 36px, `display-sm` → 28px. Body sizes hold.

---

## 3. Color

### Editorial palette (preserved from v1)

```
--ink:     #0f0e0c   /* near-black */
--paper:   #f5f1ea   /* warm cream */
--paper2:  #ebe3d6   /* deeper cream */
--muted:   #6f675b   /* warm gray */
--rule:    #d8cfbf   /* hairline */
--accent:  #c8451f   /* terracotta — Δ glyph, links, eyebrows, primary CTA */
```

### Financial-instrument palette (new)

The previous green/red pair (`#2f7d48` / `#c8451f`) is too muted for live data. Inside the tool, we need Robinhood-grade saturation so gain/loss reads instantly:

```
--gain:             #00c853   /* saturated green — positive deltas in tools */
--loss:             #ff3838   /* saturated red — negative deltas in tools */
--surface-dark:     #0a0908   /* Simulator background, deeper than --ink */
--surface-elevated: #1a1816   /* lever cards, inputs in dark mode */
--data-grid:        #2a2724   /* hairline rules in dark mode */
--ink-on-dark:      #f5f1ea   /* primary text on dark surfaces — cream, not pure white */
--muted-on-dark:    #8a8278   /* secondary text on dark surfaces */
```

Color rules:
- **Terracotta is for brand.** Δ glyph, primary CTAs, links, brand annotations on charts. Never used for gain/loss.
- **Gain/loss saturated colors are for data only.** Never for body text or chrome.
- **The Calculator's Aspire Gap reveal uses gain/loss colors** — saturated red if negative (typical case), saturated green if positive (rare and worth celebrating).
- **Editorial surfaces never show gain/loss colors.** They're a tool-only register.
- **Cream-on-dark, not white-on-dark.** Even in the Simulator, primary text uses `--ink-on-dark` (`#f5f1ea`) instead of pure white. Subtle but it preserves the brand warmth.

### Contrast floors
- Ink-on-paper: AAA at all sizes.
- Cream-on-dark: AAA at body sizes.
- Muted-on-paper: AA at 16px+.
- Gain/loss on dark: AA at 16px+ — verified against `--surface-dark`.
- Terracotta on cream: accent only; never used for body text.

---

## 4. Component primitives

### Buttons

- **Primary** — terracotta pill (`--accent` background), Inter 600, white text. One per page maximum. Used for `See your number`, `Save scenario`, `Subscribe`. Hover: subtle 4% lighten + Δ glyph fades in to the right of the label (150ms ease).
- **Secondary** — ink outline, transparent fill, Inter 500, ink text. Used for `Read the manifesto`, `Refine basket`, navigational CTAs. Hover: fill flips to ink, text flips to paper.
- **Tool button (dark)** — `--surface-elevated` background, cream text, Inter 500. Used inside the Simulator. Hover: surface lightens 6%.
- **Ghost link** — underlined ink text, no chrome. Hover: terracotta Δ fades in to the right.

### Inputs

- **Editorial inputs** (newsletter, contact form): cream background, ink text, hairline ink underline (no box border). Inter 400 18px. Focus: underline thickens to 2px terracotta.
- **Tool inputs** (Calculator, Simulator):
  - Calculator inputs: cream surface, ink text, soft inset border (`--rule`), Inter 500 18px. Units always shown as suffixes/prefixes in muted gray ("$", "%"). Focus: border becomes 2px terracotta.
  - Simulator inputs (dark): `--surface-elevated` background, cream text, no visible border. Focus: 2px terracotta outline. Tabular numerals.
- Touch targets: 48px minimum height across all inputs.

### Cards

- **Editorial cards** (Index, Explainers, Report archive): `--paper` background, 1px `--rule` border, Fraunces title, Inter body, terracotta Δ in top-right corner (12px). No drop shadows ever. Hover: hairline thickens to 1.5px and Δ shifts +2px right.
- **Tool cards** (Simulator levers, scenario presets): `--surface-elevated` background, no border, 8px corner radius, Inter throughout. No Δ accent inside the dark register — would feel decorative against the data.

### Tables

- **Editorial tables** (contrast strips, comparison tables): hairline `--rule` rules, Fraunces numerals, generous row padding (24px vertical), small-caps Inter labels.
- **Tool tables** (Methodology, Simulator data view): tabular Inter numerals, tight row padding (12px vertical), background row banding using `--paper2` (light) or 4% white-on-dark (dark).

### Chrome

- Nav: cream background, ink wordmark left, Inter 500 14px nav links right, primary CTA pill far right. 1px `--rule` bottom border. Sticks to top on scroll with a 200ms fade-in of background opacity.
- Footer: `--paper` background, Inter 400 14px throughout, 1px `--rule` top border. Compliance line in `--muted`.

---

## 5. Charts and data viz

The hardest creative problem on the project. Charts must:

- **Use Inter tabular figures** for all axis labels, tooltips, and inline value annotations.
- **Use saturated `--gain` / `--loss`** for direction. Never use the editorial palette inside a chart.
- **Default chart types:**
  - Line + area for time series (CAGR over time, projected value over years)
  - Horizontal bar for comparisons (your CAGR vs. each basket component)
  - Stacked bar for allocation breakdowns
  - Sparklines (no axes) for inline number annotations
- **Animate on first paint only.** Values count up over 600ms ease-out. No idle motion. No looping animations ever.
- **Axis lines are `--data-grid`**, never full-opacity. Gridlines are 1px, never dashed.
- **Annotations** (e.g., "Your Aspire Rate" marker on a chart) use Inter 500 small caps with a terracotta Δ marker. **This is the only place terracotta appears inside a chart.**
- **Tooltips:** dark surface (`--surface-elevated`) with cream text, even on light-mode pages. Tabular numerals. 8px padding. No drop shadow — a 1px `--ink` border instead.
- **Empty states:** an editorial sentence in `--muted` Fraunces italic. *"You haven't added any assets yet."* Never an icon. Never an illustration.

Reference: study how Robinhood handles intraday line charts and gain/loss tags. Match that information density and reading speed. Reject Robinhood's playful color treatment everywhere else — Aspire is more serious.

---

## 6. Motion

**Editorial motion is sparse:**
- Numbers count up on first scroll into view (ease-out, 600ms). One-shot.
- Hover: terracotta Δ fades in beside links and CTAs (150ms ease).
- Page transitions: none. Standard navigation.

**Tool motion is continuous:**
- Lever changes in the Simulator update the Aspire Gap number in real time (250ms tween, ease-out, no debounce).
- Chart values morph between scenarios (500ms ease-in-out).
- Scenario load transitions: 400ms cross-fade between configurations.
- Reveal moment in the Calculator: a 1200ms choreographed sequence — inputs fade out, surface darkens, hero number counts up from 0, breakdown reveals beneath. This is the only "showpiece" animation in the product. Earn it.

**Reduced-motion media query disables count-ups, lever tweens, scenario fades, and the reveal choreography.** Final values render immediately without animation.

---

## 7. Mobile

Breakpoint at 860px. All grids collapse to single column.

**Editorial register on mobile** keeps generous whitespace; type scales down (H1 76px → 42px) but never below readable.

**Tool register on mobile** is the harder design problem:
- Calculator inputs stack vertically with full-width touch targets. The reveal moment works at any width — `display-xl` scales to fit.
- Simulator gets **full lever control on mobile** — no watered-down sibling — but ordered differently: **preset-led entry**. A horizontal scroll of scenario presets (`Aggressive` / `Conservative` / `Move to a cheaper city` / `Save 5 more years` / `Custom`) sits at the top. Tap a preset, lever values populate, the Aspire Gap updates. Below the presets, the full lever stack scrolls vertically; the user can tune any individual lever as deep as they want.
- The Aspire Gap stays pinned to the top of the viewport as the user scrolls levers underneath. Sticky header. This is non-negotiable — without it, the cause-and-effect loop breaks on mobile.
- Sliders are paired with tap-to-edit numerical inputs as a secondary affordance. Slider for fast exploration, tap-to-edit for precision.
- The **Allocation Mix** lever (N inputs summing to 100%) opens its own focused sheet rather than sitting inline.
- The **Configurable CAGR** lever opens a modal sheet — too data-dense for the inline scroll.
- Charts simplify on mobile — line charts only, no multi-series stacks. Comparison views become horizontal scroll of single-metric cards.

**The Simulator is desktop-first** in the sense that it's optimized for desktop workflows, but mobile is fully featured. No "view on desktop" gates anywhere in the flow.

---

## 8. Accessibility

- Single `<h1>` per page. Section landmarks throughout (`<main>`, `<nav>`, `<aside>`, `<footer>`).
- AAA contrast for editorial body. AA contrast for tool data.
- Keyboard: every Simulator lever operable via arrow keys (slider) or tab + space (toggle). Skip-link to main content on every page.
- ARIA: `aria-live="polite"` regions on the Aspire Gap and Aspire Rate so screen readers announce updates as levers move. Throttle to one announcement per 1000ms to avoid noise.
- Reduced motion respected throughout (see Motion section).
- Focus rings: 2px terracotta on editorial surfaces, 2px cream on dark tool surfaces. Never remove.
- Charts ship with a tabular fallback view (toggle button: *"Show data table"*) that screen readers can navigate row-by-row.

---

## 9. References — what to take from each, what not to

- **Stripe** — Component polish. Button states. Form input rhythm. Generous spacing inside dense product surfaces. The way Stripe makes complex UI feel calm.
  *Take:* tool component primitives, input behavior, micro-interactions, table treatment.
  *Don't take:* brand color (purple), gradient meshes, dashboard layouts, illustration style.

- **Robinhood** — Chart treatment. Live-updating numbers. Saturated gain/loss reads. Tabular numeral discipline. The way numbers feel like instruments rather than text.
  *Take:* chart visual language, gain/loss color saturation, real-time number behavior.
  *Don't take:* gamification, confetti, party-time animations, social-feed elements, friend-finder language.

- **NYT / FT** — Editorial typography. The way a serif headline can carry a page. Long-form respect. Italic discipline.
  *Take:* type scale, italic restraint, generous leading, hairline rules.
  *Don't take:* photojournalism, masthead density, op-ed bylines, comment threads.

- **Pudding.cool** — Narrative + data hybrid. The way the Aspire Index cards should feel.
  *Take:* editorial framing of statistical content, the rhythm of fact + voice, color-restraint with one accent.
  *Don't take:* scrollytelling complexity for its own sake, multi-step interactive essays for short pieces.

---

## 10. Anti-patterns — explicit rejections

- No gradients. No glass morphism. No gradient meshes.
- No stock photography. No lifestyle imagery. No "diverse hands holding a phone."
- No emojis in product or marketing copy.
- No fintech clichés: rocket ships, charts going up-and-to-the-right with no axis, neon-on-dark "future" aesthetic, pastel pink/purple finance.
- No third typeface. Two faces. Hold the line.
- No third primary color. Terracotta is the only chrome accent.
- No motion that doesn't serve a purpose. No parallax. No animated SVG decorations. No Lottie files.
- No dark patterns on the email gate. The reveal happens before the ask.
- No dark mode on editorial surfaces. The split between light editorial and dark tool is the system; don't blur it with a global toggle.
- No skeletons or shimmers — Aspire's loading states are quick and quiet, not theatrical.

---

## 11. Resolved decisions (locked 2026-05-11, reconciled with existing canon)

- **Calculator reveal:** hero number + small horizontal bar chart of basket components, each labeled with its 5-year CAGR. The Aspire Rate sits as the headline; the bar chart underneath shows what's pulling the average. **The "AT THESE ASSUMPTIONS" eyebrow under the hero number is non-removable** per `aspire/COMPLIANCE.md`. Detail in `page-spec-calculator.md`.
- **Simulator scenario model:** every scenario implicitly compares to the user's current state. A "current state" reference line/value persists in the UI until the user explicitly clears it. Detail in `page-spec-simulator.md`.
- **Mobile Simulator:** full lever control, ordered as preset-led entry → vertical lever stack. Details in section 7 above.
- **Number formatting:** one decimal everywhere (`10.2%`) except the Methodology page, which carries two decimals (`10.24%`) for source fidelity.
- **The Δ glyph at display sizes (>96px):** develop a crafted display variant — slightly more refined optical balance than scaling up the wordmark Δ. Treat as a separate brand asset to commission alongside this work. Pairs with Fraunces at hero scale.
- **Aspire Gap sign convention:** `Aspire Gap = (your money growth rate) − Aspire Rate`. Positive = ahead, negative = behind. **Color treatment unchanged:** negative gap renders `--loss` (saturated red), positive gap renders `--gain` (saturated green), zero renders muted. The behind-the-floor case (most users on first run) is the bad case visually, which matches the existing convention.
- **Tagline placement:**
  - **Primary tagline** (footer of every page, OG card, social header, brand identity uses): *"How much of tomorrow can you afford?"*
  - **Secondary punchline** (Calculator H1, occasional editorial accent, social posts when warranted): *"Inflation isn't a number. It's a vector."*
  - The secondary punchline is a protected exception to the "no negation pattern" voice rule. Use sparingly — it loses force if it's everywhere.

## 12. Brand assets to produce alongside this work

- **Display Δ glyph** — a refined optical version for use at display sizes (>96px). Used in: hero number reveals, large editorial section markers, the Aspire Index card corner accent at full-bleed sizes. Maintains brand continuity with the wordmark Δ but holds up at scale.
- **Favicon and OG card system** — derived from the wordmark Δ. Update `aspire/og-card.html` and the favicons in `aspire/` to align with the new spec where they drift.
- **Editorial illustration policy:** none for v1. If we ever add illustration, it's a separate creative pass with its own brief.

