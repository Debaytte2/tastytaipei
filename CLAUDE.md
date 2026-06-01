# Tasty Taipei — Project Context for Claude Code

## What This Is

**Tasty Taipei** (tastytaipei.com) is a B2B2C restaurant discovery and marketing platform targeting small restaurants in Taipei, Taiwan. It serves tourists, expats, and locals through multilingual restaurant discovery, while generating revenue through B2B restaurant subscriptions.

The company entity is **Debayette Enterprises**. Always use team framing — never solo founder framing.

---

## Current Architecture (and Why It Needs to Change)

The entire site is a **single `index.html` file** — HTML, CSS, and JavaScript all in one file. This was fine to launch fast but has real limits:

- Search doesn't work (currently just shows toast notifications, doesn't filter restaurant cards)
- All restaurant data is hardcoded as HTML — adding/editing restaurants is painful
- No real backend, no database
- Hard to maintain as the restaurant count grows

**The goal of this Claude Code session is to move toward a proper architecture.** See the Architecture Decision section below.

---

## Repository & Deployment

- **GitHub:** github.com/Debaytte2/tastytaipei
- **Hosting:** Vercel (auto-deploys from GitHub main branch)
- **Vercel URL:** https://tastytaipei-kb8h.vercel.app
- **LINE webhook URL:** https://tastytaipei-kb8h.vercel.app/api/line-webhook
- **Domain:** tastytaipei.com registered on Namecheap
- **Deploy time:** ~30 seconds after commit
- **Verify after deploy:** hard refresh with Cmd+Shift+R in Safari

Additional files in the repo:
- `tools.html` — QR code generator, digital stamp card, reservation manager
- `about.html` — About page
- `sitemap.xml`, `robots.txt`
- Google Search Console verification file

---

## Tech Stack (Current)

- Pure HTML/CSS/JS, single file (plus per-restaurant profile pages)
- **Analytics:** Microsoft Clarity (tracking ID: `vzvl62tnrr`)
- **Forms:** Formspree
  - Lead capture: `https://formspree.io/f/mdapwalg` — `submitSignup()` / `submitSignupZh()`, POSTs before opening LINE
  - Order forms: per-restaurant endpoint stored as `orderFormUrl` in `restaurants.json` — `submitOrderForm()` in each restaurant profile page
- **AI Food Assistant:** Claude Haiku API with multilingual fallbacks
- **Images:** Unsplash (served with `referrerpolicy="no-referrer"` and `&fm=jpg` to prevent hotlink blocking)
- **Payments:** Stripe (primary), ECPay/NewebPay (fallback for owners without cards)
- **Communication:** LINE (ID: chrixx7 personal — to be migrated to LINE Official Account at ~5–10 restaurants)

---

## Architecture Decision

The site needs to move away from a single HTML file. Options in order of preference:

**Option A — Recommended: Next.js on Vercel**
- Restaurant data in Supabase (free tier) — enables real search, filtering, easy CRUD
- Real search via database queries
- Still deploys to Vercel automatically from GitHub
- This is the right long-term foundation

**Option B — Static but proper**
- Restaurant data moves to JSON files
- Search via JavaScript filtering of JSON (no backend needed)
- Static site generator like Astro or 11ty
- Still deploys anywhere easily

**Option C — Keep single file, fix surgically**
- Least disruption, fastest fix for search
- But keeps hitting architectural walls

Ask the owner before making this call if it hasn't been decided yet.

---

## Five-Language Translation System

Full page is translated in: English, Traditional Chinese, French, Japanese, Spanish.
- 122 tagged elements with `data-i18n` attributes
- Language switcher in nav
- `setLang(lang)` function handles all switching
- Body font switches to `Noto Sans TC` for ZH/JA

---

## Restaurant Data (Current State)

**Chess Chicken** is the first real onboarded restaurant with a full profile page (`chess-chicken.html`). All others are placeholders.

Placeholder restaurants in `restaurants.json` (no real profile pages):
1. Din Tai Fung 鼎泰豐
2. Ay-Chung Flour-Rice Noodle 阿宗麵線
3. Smoothie House 思慕昔
4. Chun Shui Tang 春水堂
5. RAW
6. Yongkang Beef Noodle 永康牛肉麵

These need to be replaced with real restaurant partners as they onboard.

### `restaurants.json` schema notes
- `orderFormUrl` — Formspree endpoint for the restaurant's order form. If absent or empty, the "Order Online" button is hidden on the profile page. Chess Chicken currently has a placeholder value (`ORDER_FORM_REPLACE`) — swap it for a real Formspree form ID once created.

---

## Known Bugs to Fix

1. **Search is broken** — the search input doesn't filter restaurant cards. It either does nothing or shows a toast. This is the most urgent fix.
2. **Category filters** — category cards may only be showing toasts rather than actually filtering results.
3. **Near Me** — geolocation feature had Safari-specific issues (no `innerHTML` on cloned nodes, `enableHighAccuracy: false` required).

---

## Business Model

**Free trial → paid subscription conversion.**

Trial length: **2 weeks** (changed from 4 weeks — make sure this is consistent everywhere)

### Pricing Tiers

1. **Basic Listing** — visibility only, appears in search results, no priority placement
2. **Featured Listing** — homepage placement, "Top Picks" section, priority in search results
3. **Featured + Social Bundle** — everything in Featured, plus Instagram content posted to @tastytaipei_com. Priced just slightly above Featured-only to feel like an obvious upgrade.

Social posting frequency is a paid add-on within the bundle tier (more posts per week = higher price).

**Founding Partner Pricing:** Early restaurants lock in permanently lower rates. This creates real urgency without fabricating scarcity. Standard rates apply to all subsequent sign-ups.

### Conversion Flow

Week 2 results meeting → show dashboard with real numbers → "I'll send you a quick link" → Stripe payment link → they tap, enter card once → auto-charges monthly → automatic receipts → money never discussed again.

One-page contract signed at conversion meeting.

---

## Social Media

All restaurant content lives on a **single @tastytaipei account** — NOT individual accounts per restaurant. This is intentional and operationally critical.

- **Instagram:** @tastytaipei_com
- **LINE:** @chrixx7 (personal, to be migrated to LINE Official Account)

---

## Content & Copy Rules

These are non-negotiable:

- **No fake statistics** — restaurant owners will fact-check. No "200+ restaurants," no fabricated ratings.
- **No "coming soon" language anywhere** — kills FOMO and signals newness.
- **No specific numerical promises** — use confident broad language instead.
- **Team framing** — say "we" and "our team," never "I" or "solo founder."
- **LINE preferred over WhatsApp** for contact privacy.
- **Honest, verifiable copy only.**

---

## Signup Flow

1. User fills out signup form (name, restaurant, phone, email, district, language)
2. `submitSignup()` / `submitSignupZh()` POSTs to Formspree (captures lead to email)
3. Opens LINE with pre-filled message to chrixx7
4. Try/catch ensures LINE opens even if Formspree fails

---

## Separation of Concerns

**Client-facing materials** (what restaurant owners see):
- Pitch cards, pricing pages, the website itself, profile mockups, trial results dashboard

**Internal-only** (never show to restaurant owners):
- Revenue projections, ownership strategy, sales playbook scripts, objection handling docs, internal pricing rationale

---

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main site — everything |
| `chess-chicken.html` | Chess Chicken profile page (first real restaurant) |
| `about.html` | About page |
| `tools.html` | QR code generator, stamp card, reservation manager |
| `restaurants.json` | Restaurant data — source of truth for profile pages |
| `images/taipei-hero.jpg` | Hero background image (Taipei 101 night skyline) |
| `sitemap.xml` | SEO sitemap |
| `robots.txt` | Crawler rules |

---

## Environment Notes

- **Browser:** Safari (primary). Test on Safari first.
- **GitHub editor:** CodeMirror 6 — browser automation cannot access the internal EditorView. For large file edits, write the file and download rather than trying to automate the editor.
- **Python image generation:** Use Pillow. The `canvas` npm package fails in this environment.
- **PDF generation:** ReportLab (Python).
- **Word docs:** `docx` npm package.

---

## What to Work On Next

Priority order:
1. Fix search — this is broken and was called out by the first potential client in person
2. Decide on architecture direction (Next.js vs static JSON vs surgical fix)
3. Replace placeholder restaurant data with real restaurant as it onboards
4. **Set up Chess Chicken's Formspree order form** — create the form at formspree.io, replace `ORDER_FORM_REPLACE` in `restaurants.json` with the real form ID
5. Make category filters actually work (not just toast notifications)
6. Migrate to LINE Official Account when restaurant count warrants it
7. Per-restaurant analytics as a value-add feature
8. Real backend (Supabase) as restaurant count grows

---

## Contact & Accounts

- LINE: chrixx7
- Instagram: @tastytaipei_com
- GitHub: Debaytte2
- Domain registrar: Namecheap
- Formspree endpoint: https://formspree.io/f/mdapwalg
- Clarity tracking ID: vzvl62tnrr
