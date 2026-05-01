# Aspire — Design Standards

> Brand: **Aspire** | Product/metric: **the Aspire Rate**
> Visual identity locked: 2026-05-01

---

## Logo

**Wordmark:** Italic "Aspire" in Fraunces, with a terracotta Δ (delta) as the accent mark.

The Δ reads as both a typographic accent and a mathematical symbol — "change in" or "rate of." The wordmark literally reads *Aspire [rate of change].* Math-literate readers clock it; everyone else just sees a clean italic logotype.

**Do not:** use a period, dot, or any other accent — only Δ.  
**Do not:** use upright/roman weight — the wordmark is always italic.

### Asset files

| File | Use |
|---|---|
| `documents/aspire/social/x-profile.png` | Primary profile image (italic Aspire + terracotta Δ) |
| `documents/aspire/social/x-banner.png` | Banner: wordmark left, stat ladder right |
| `documents/aspire/social/favicon-512.png` | Favicon / app icon (Δ only, 512px) |
| `documents/aspire/social/favicon-32.png` | Favicon (Δ only, 32px) |

---

## Colors

| Role | Name | Hex | Notes |
|---|---|---|---|
| Brand accent | Terracotta | `#C8451F` | Δ symbol, CTAs, highlights, high-energy stats (NVDA/BTC) |
| Background | Near-black | `#0F0E0C` | Primary background — all assets |
| Wordmark / text | Cream | `#F5F1EA` | Wordmark, body text on dark backgrounds |
| Muted text | Warm gray | `#8A8074` | Labels, subtext, secondary copy |
---

## Typography

| Role | Typeface | Style | Notes |
|---|---|---|---|
| Wordmark / display | Fraunces | Italic, serif | Primary brand font |
| Body / UI | TBD | — | Not yet specified |

**Fraunces** is a Google Font — free, web-safe, and variable. Load via:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,400;1,700&display=swap" rel="stylesheet">
```

---

## The Delta System

Δ is a standalone brand element, not just part of the logo. Uses:

- **Favicon** — `favicon-512.png` / `favicon-32.png`
- **App icon** — same Δ glyph on terracotta
- **Calculator** — repeated Δ motif
- **Newsletter** — section divider
- **Landing page** — wordmark accent in nav and footer
- **Social** — profile image primary mark

---

## Voice (quick reference)

- **Comps:** Morgan Housel × Matt Levine × Nassim Taleb
- **Sharp, not sales-y.** Every claim ties to a real index.
- **Contrarian but provable.** Respects the reader — smart and impatient.
- **No financial-services cosplay.** No stock tickers in gradients. No "achieving your dreams" copy.

Full positioning and messaging: `documents/aspire/brand/positioning.md`  
Full manifesto: `documents/aspire/brand/manifesto.md`

---

## What Aspire Is Not

- Not a robo-advisor
- Not an alpha promise
- Not doom-porn about inflation
- Not a crypto maxi product

It's a **measurement and planning lens.**

---

## Tagline

> *How much of tomorrow can you afford?*

---

## Usage Notes for Asset Generation

When generating images, graphics, or UI components:

1. Always use **Fraunces italic** for any "Aspire" wordmark rendering
2. The Δ accent is **terracotta** — warm, earthy, not red
3. Dark backgrounds lean charcoal/near-black (not pure black)
4. Light backgrounds are **cream** (not pure white)
5. Keep stat-heavy layouts clean — sparse, high contrast, the number does the work
6. The stat ladder format (CPI 3% → BTC 40%+) is a core visual motif for social/banner use
