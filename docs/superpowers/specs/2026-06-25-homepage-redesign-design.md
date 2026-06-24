# Homepage Redesign — Design Spec

Date: 2026-06-25
Scope: `index.html` (homepage UI/UX only — no backend/architecture migration)

## Background

The current homepage has six stacked problems:

1. Two full-width bars are stuck to the top of the screen at once (`<nav>` sticky at `top:0`, `.filter-bar` sticky at `top:64px`), reading as a duplicated nav.
2. Categories are 36 emoji-only cards with no photos.
3. The restaurant grid shows a plain "Loading restaurants…" text placeholder before `fetch('/restaurants.json')` resolves, with no skeleton — feels broken/slow rather than instant.
4. B2B partner content (pricing plans + trial signup form) lives in a bottom-sheet modal triggered from multiple consumer-facing nav/footer touchpoints, mixing B2B and consumer concerns on the same page.
5. The hero still carries leftover complexity from an older two-panel "visitor vs. owner" concept (a language switcher inside the hero; dead CSS/i18n for an unused right-side "owner" panel).
6. Two additional full-width dark promo sections (a "Featured this week / hidden gems" banner and a "Near Me" block with a decorative map-dot grid) add significant visual weight beyond what the user explicitly flagged, and were identified during exploration as candidates for consolidation under the chosen approach.

Decision: **Approach B — aggressive consolidation**, **mobile-first** (majority of users are on smartphones; every layout/sizing decision optimizes for iPhone-sized viewports first, desktop second — thumb-friendly tap targets, single/2-column mobile layouts, fast load times).

Out of scope: any backend/data-architecture change (Next.js, Supabase, splitting CSS/JS into separate files). This is a UI/UX pass on the existing single-file architecture, plus one new static page.

## Current State Reference

- `index.html` is ~1657 lines, single file (HTML+CSS+JS).
- `restaurants.json` has 41 real restaurant entries with real Google Places `image_url` photos, ratings, descriptions, hours, categories, district, price — not placeholders (CLAUDE.md's "placeholder restaurants" note is stale).
- Search/filter (`applyFilters()`) already functions client-side against `window.allRestaurants` — CLAUDE.md's "search is broken" note is also stale.
- District cards (`.district-card`, 12 of them) already use the photo-card pattern (CSS `background-image` + overlay + label) this design reuses for categories.
- Hero background `images/taipei-hero.jpg` is 8MB — confirmed during exploration, and is the largest single mobile load-time risk on the page.

## Design

### 1. Nav & filter bar

- Single persistent sticky bar (`<nav>`): logo, "Discover" / "Categories" / "For Restaurants" / "About" links, a compact language switcher (moved here from the hero — flag/text dropdown, collapses into the mobile hamburger panel on small screens), cart icon, and a "List Your Restaurant" CTA button linking to `/for-restaurants.html` (desktop only; on mobile it appears inside the hamburger panel instead of as a second visible button).
- `.filter-bar` (search input + price/distance/rating/cuisine/sort/service-type filters) **stops being globally sticky** and stops rendering directly under the nav on every page state. It moves to sit immediately above the restaurant grid inside the "Top Picks Near You" section — contextual to what it filters, not pinned site-wide. This removes the second permanently-stuck bar, which is the literal fix for "duplicate nav."
- Mobile: filter bar defaults to collapsed behind the existing "Filters ▾" toggle; all filter buttons and nav links keep/get ≥44px tap targets.
- `#mobile-nav-panel` (hamburger dropdown) keeps its current links, updated so "For Restaurants" and "List Your Restaurant" both point to `/for-restaurants.html` instead of calling `openModal()`.

### 2. Hero

- One section, one message: optional small eyebrow, one bold `<h1>` headline ("Discover Taipei's Best Food"), one short subhead, one CTA button ("Explore Restaurants →" linking to `#top-picks-section`).
- Language switcher removed from the hero markup (now lives in the nav per section 1).
- Dead CSS/markup from the old two-panel "visitor vs. owner" hero concept (unused `.hero-title`, `.hero-sub`, `.hero-feature-card` rules, and the never-rendered `hero_right_*` i18n strings — see section 4 for where those strings get used instead) is removed from the homepage hero, since only the single-panel `.hero-split`/`.hero-panel` markup is actually in use today.
- `images/taipei-hero.jpg` is compressed and resized for web delivery (target: well under 1MB, with a mobile-sized variant) before being reused as the hero background. This is the single biggest first-load speed win on the page.
- Hero height reduced on small viewports (current `min-height:70vh` is too tall for a phone screen at the top of the scroll) — exact breakpoint values to be finalized during implementation, not fixed numbers here.

### 3. Categories ("Browse by Category")

- Reduced from 36 emoji-only cards to **8–10 curated categories**, chosen from categories actually well-represented in `restaurants.json` (e.g. Noodles, Hot Pot, Bubble Tea, Night Market, Dumplings, Japanese, Dessert, Vegetarian, Street Food, Café — final list confirmed against actual category counts in the data during implementation).
- Each card becomes a photo card: real `<img loading="lazy">` element + gradient overlay + label, reusing the existing district-card visual pattern (CSS classes adapted, not duplicated from scratch).
- Images sourced from curated Unsplash photos, one per category — same sourcing approach already used for the 12 district cards. Not tied to any specific restaurant's photo.
- Mobile: 2-column grid. Desktop: 4–5 column grid.
- "See all →" (currently calls `showToast('36 categories and growing')`, a non-functional stub) is fixed to scroll to `#top-picks-section` and open the existing cuisine filter dropdown, which already lists all categories — so full category coverage is preserved, just not all rendered as photo cards on first load.

### 4. Restaurant grid ("Top Picks Near You")

- The contextual filter bar (moved per section 1) renders directly above this grid.
- The plain-text "Loading restaurants…" placeholder is replaced with skeleton card placeholders (gray pulse blocks matching real `.r-card` dimensions) shown between `DOMContentLoaded` and the `restaurants.json` fetch resolving, so there's no layout jump and the page feels like it's rendering immediately rather than stalling.
- Card markup (`renderRestaurantGrid()`) is not rewritten — it already renders real photos, ratings, district badges, descriptions, hours, and a directions button from real data. Only padding/typography is adjusted for more whitespace, and mobile single-column stacking is confirmed/adjusted in the grid's responsive CSS.

### 5. Featured Banner + Near Me → consolidated utility strip

- The existing `.featured-banner` ("Featured this week" / hidden gems teaser) and `.near-me-section` (map-dot visual + "Find Food Near Me") — both full-width dark blocks with heavy padding and decorative backgrounds — are replaced by **one slim strip** containing two pill-style links:
  - "✦ This week's hidden gems →" — still calls the existing `showHiddenGems()` handler.
  - "📍 Find food near me →" — still calls the existing `requestNearMe()` handler.
- No decorative gradient backgrounds or map-dot grid carry over. Click behavior is unchanged — only the visual container changes from two heavy sections to one light strip.
- Placement: between the Categories section and the Top Picks section.
- Mobile: the two pills stack full-width. Desktop: they sit inline in one row.

### 6. B2B extraction → `/for-restaurants.html`

- New static HTML page, sharing the site's nav/footer chrome.
- Content moved (not rewritten) from the current `#modal` bottom-sheet:
  - Pitch copy — this is where the currently-unused `hero_right_*` i18n strings ("For Restaurant Owners" / "Grow Your Restaurant" / "Reach tourists, expats and locals…") get used, since they're already translated into all 5 languages and otherwise dead.
  - The Basic / Featured pricing plan cards (`#modal-plan-basic`, `#modal-plan-featured`), unchanged content.
  - The trial signup form and its existing submit flow (Formspree POST to `https://formspree.io/f/mdapwalg`, then opens LINE with a pre-filled message) — logic unchanged, just moved out of the modal and into normal page markup.
- `index.html`'s nav CTA, mobile nav panel link, and footer link for "For Restaurants" / "List Your Restaurant" all point to `/for-restaurants.html` instead of calling `openModal()`.
- `#modal`, `#modal-overlay`, and the `openModal()`/`closeModal()` JS are removed from `index.html` once their content has moved, trimming homepage HTML/CSS/JS weight (also a mobile load-time win).
- `sitemap.xml` gets the new page added.

### 7. Footer

- Same links as today (About, Instagram, LINE, Contact, For Restaurants), restyled with more spacing/whitespace. "For Restaurants" becomes a plain link to `/for-restaurants.html` instead of an `openModal()` call.

### 8. Mobile-first conventions (applied throughout, not a separate component)

- All interactive elements (cards, buttons, pills, nav links, filter buttons) have ≥44px tap targets.
- Every grid (categories, restaurant cards, districts, utility strip) defaults to single- or 2-column layout under 640px, expanding at larger breakpoints.
- Photo cards (categories, districts) use real `<img loading="lazy">` elements instead of CSS `background-image`, so they genuinely lazy-load on mobile instead of all downloading on first paint.
- Hero image is the only asset explicitly called out for compression/resizing in this spec; if other Unsplash-sourced images turn out to be unexpectedly large during implementation, the same lazy-loading/sizing principle applies, but no other specific asset is known to be oversized today.

## Out of Scope

- Any change to `restaurants.json` schema, the AI Food Assistant feature (i18n strings exist but the feature isn't rendered on the homepage today — left untouched), the cart feature, or `about.html` / `TastyTaipei_Tools.html`.
- Any backend, database, or multi-file architecture migration (per CLAUDE.md's Architecture Decision section) — explicitly declined for this pass.
- Rewriting the 5-language i18n system — existing `data-i18n` / `setLang()` mechanism is reused as-is; new visible strings introduced by this redesign (e.g. utility strip pill text) get i18n keys added in the same pattern as existing ones, in all 5 languages, but the mechanism itself is unchanged.

## Testing / Verification

- Manual check in Safari (per CLAUDE.md's stated primary browser) at iPhone viewport width and desktop width, for: nav (no duplicate sticky bars), hero (single CTA, image loads fast), category cards (photos load, "See all" opens cuisine filter), restaurant grid (skeleton shows briefly then real cards render), utility strip (both pills trigger their existing handlers), `/for-restaurants.html` (pricing + signup form submit flow works end to end, same as the current modal does today).
- Confirm `restaurants.json` fetch and `applyFilters()` still work unchanged after the filter bar is relocated.
