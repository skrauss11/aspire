# Aspire Vocabulary

> **Updated 2026-05-11.** Replaces the prior internal/user-facing split (which had "Cost growth," "Money growth," "Your gap" as user-facing terms). Per drift-report Conflict 1, terminology has been consolidated. The canonical source is `specs/brief-v2.md` §1; this file is the quick-reference appendix.

## Canonical terms (used in UI, copy, content, and internal docs alike)

- **Aspire Rate** — the required money-growth rate to cover the priced future at the user's current assumptions. Equivalent to the 5-yr trailing CAGR of the goals basket. The *floor* — what you need to break even.
- **Target Aspire Rate** — Aspire Rate + margin of safety (default +1%, tunable in the Simulator). The *aspirational target* — hitting it means you're ahead of the floor.
- **Aspire Gap** — `(your money growth rate) − Aspire Rate`. **Positive = ahead, negative = behind.** Most first-time users see negative.
- **money growth** — descriptive term for the user's portfolio expected return rate. Used in copy when explaining Aspire Gap.
- **cost growth** — descriptive term for the basket's CAGR. Used in copy when explaining what Aspire Rate represents.

## Formula

```text
Aspire Rate           = 5-yr trailing CAGR of goals basket
Target Aspire Rate    = Aspire Rate + margin of safety (default +1%)
Aspire Gap            = (your money growth rate) − Aspire Rate
Target Aspire Gap     = (your money growth rate) − Target Aspire Rate
```

Sign convention: **positive Aspire Gap = ahead** (good, render `--gain` green). **Negative = behind** (typical first-run case, render `--loss` red).

## Compliance rule (non-negotiable)

Aspire Rate, Target Aspire Rate, money growth, and Aspire Gap are modeled measurements at the user's current assumptions, not recommendations or predictions. Every surfaced rate or gap value in user-facing copy or UI **must be paired with *"at these assumptions"*** or equivalent contextualizing language. Required by `COMPLIANCE.md`. Enforced via `npm run check:compliance`.

Aspire never recommends specific assets, funds, accounts, allocations, or financial products. Recommendations in the Simulator are mathematical exercises about lever changes only — see `specs/page-spec-simulator.md` §8 for the allowed/forbidden recommendation rules.

## Deprecated terms

These were canonical in the prior vocabulary and are no longer surfaced in user-facing copy:

- ~~"Your Aspire Rate"~~ → use "Aspire Rate" (no "Your")
- ~~"Your gap"~~ → use "Aspire Gap"
- ~~"Cost growth" / "Money growth" as branded user-facing labels~~ → these stay as descriptive terms in copy when the underlying concept needs explanation, but they are no longer the primary surfaced labels for Aspire Rate or Aspire Gap
- ~~"Required money-growth rate"~~ as a separate concept → folded into "Aspire Rate" (the Aspire Rate IS the required rate; Target Aspire Rate is the aspirational variant)
- ~~"Aspire Score" (0–100)~~ → deprecated entirely per drift-report Conflict 6. Removed from new UI surfaces. The `score.js` Netlify Function name is preserved as a deploy contract; its return shape changes.

Live-site copy that still uses deprecated terms is being patched in a separate PR by Codex (Calculator HTML, Simulator HTML, score email template).
