# Tasty Taipei — Project Context for Claude Code

## What This Is

**Tasty Taipei** (tastytaipei.com) is a multilingual restaurant discovery platform
for tourists, expats, and locals in Taipei, operated under **Debayette
Enterprises**. It's a B2B2C model: consumers discover restaurants, and restaurant
owners get visibility plus a managed marketing service.

**Vision:** Taipei is the proof-of-concept market. Long-term plan is multi-city
expansion across tourist-dense Asian cities — build with portability in mind, but
operational focus stays on Taipei until the model is proven.

**Differentiators:** five-language support, editorial quality above Google Maps,
verified restaurant data, and a managed marketing service for restaurant partners.

---

## Repository & Deployment

- **GitHub:** github.com/Debaytte2/tastytaipei → auto-deploys to Vercel (~30 sec)
- **Domain:** tastytaipei.com via Namecheap
- **Analytics:** Microsoft Clarity (tracking ID: `vzvl62tnrr`)
- **Instagram:** @tastytaipei_com
- **LINE:** @chrixx7 (personal) is the active contact channel. A LINE Official
  Account ("Tasty Taipei Orders", provider "TastyTaipei") was already created via
  manager.line.biz with a Messaging API webhook — but that flow was deferred in
  favor of the simpler Formspree `orderFormUrl` approach below. It exists but
  isn't currently the active ordering mechanism.
- **Formspree endpoint:** `https://formspree.io/f/mdapwalg`
- **Verify after deploy:** hard refresh (Cmd+Shift+R)

**Git note:** pushes from a Claude Code sandbox don't reliably reach GitHub.
Reliable pattern: Claude prepares the fix, then the exact commands are run in a
separate Terminal.app window using `git -C ~/Desktop/tastytaipei [command]`.

---

## Current Architecture

Refactored from a monolithic `index.html` into a multi-file structure:
`main.css`, `i18n.js`, `ui.js`, `restaurants.js`, `cart.js`, `app.js`.

**Deliberately removed features (don't rebuild without checking first):** an AI
Food Assistant powered by the Claude Haiku API was built in April, then
intentionally removed in a May redesign — it's not a gap, it was a decision.

**SEO infrastructure** was recently overhauled:
- Static restaurant pages at `/restaurant/[slug]/`
- Cuisine + district landing pages
- `sitemap.xml` with 96 URLs, proper canonicals, hreflang tags
- DNS corrected from GitHub Pages A records to the Vercel A record
- Sitemap submitted to Google Search Console

**Restaurant data:** two separate datasets currently exist —
- **Live `restaurants.json`:** ~35 entries as of July 13. This is what's actually
  on the site right now.
- **200 restaurants across 19 cuisine categories** (a 20th, indigenous Taiwanese
  cuisine, was planned but never built) exist as individual `.md` files from a
  July 2 research batch. **These have almost certainly not been merged into
  `restaurants.json` yet** — confirm the actual current count with Claude Code
  before assuming either way.

**Intentional cross-category duplicates in the `.md` set (not bugs — don't
"fix" these):**
- Old Sichuan appears in both Hot Pot and Sichuan
- Master of Mushroom appears in both Hot Pot and Vegetarian
- Din Tai Fung and Hang Zhou XLB appear in both Dim Sum and Shanghainese

**Data quality flags from the July 2 research session (still need action once
merged):**
- `noodle3.md` has an approximate address only
- Some Shilin night market stall hours fluctuate seasonally
- Most Hakka entries beyond the top 3 have district-level addresses, not street
  numbers
- `tang-dynasty-hotpot.md` (filed as "Master Shen") needs its Chinese name and
  address field-verified
- Two Dadaocheng braised pork rice entries may overlap and need consolidation —
  **note:** the "no duplicates found" check elsewhere in this file was run
  against the live 35-entry set, not the full 200-file batch, so this specific
  flag is still open

---

## Language Support

Site is translated into: **English, Traditional Chinese, French, Japanese,
Spanish** (5 languages) — confirmed consistently across every session that
mentions it, no Korean anywhere. `i18n.js` holds the translation object.

---

## Known Bugs — Status

These came directly from Terry's feedback (see Restaurant Partners below) and are
the minimum bar before resuming any partner outreach.

1. ✅ **Combined cuisine + district filtering** — fixed, verified, and pushed
   (July 13 session). No longer an open bug.
2. 🔴 **Photos: 32 restaurants are sharing stock/placeholder images**, 17 of them
   flagged urgent. This isn't a code fix — it needs real photos sourced from the
   restaurants or pulled from their Google Business listings. Still open.
3. 🔴 **Hakka and Hot Pot categories don't exist in live data at all** — this is
   the "incomplete data fields" issue. Blocked on verifying candidates from a CSV
   of ~150 options. A July 2 research session already fully verified 10 Hakka +
   10 hot pot candidates with real addresses — use those instead of
   re-researching from scratch. Still open.
4. ✅ **Braised pork rice duplicates** — checked, there weren't any. Nothing to fix.

**Unconfirmed:** whether the `.md` → `restaurants.json` conversion happened as
part of recent `build.py` work. Confirm with Claude Code directly before assuming
either way (see Restaurant Data above — the live count as of July 13 suggests it
hasn't).

**Already fixed (July 13 session — historical reference, don't redo):**
- `.cat-card` vs `.cat-item` class mismatch
- Undefined `showAllCategories` function
- `requestNearMe` geolocation TypeError
- i18n keys `rp_reserve` and `rp_pickup` were defined but unused — now wired into
  the correct components

---

## Restaurant Partners

**Current status:** zero confirmed paying partners.

**Terry (Chess Chicken)** never signed — the reason was time constraints on his
end plus genuine product gaps, not product failure. His feedback identified four
specific issues, which are the actual minimum bar any partner conversation needs
to clear:
1. Broken combined cuisine + district filtering (fixed July 13)
2. Insufficient restaurant listings
3. Incorrect or missing restaurant data
4. Duplicate placeholder images

Chess Chicken's dedicated page and `restaurants.json` entry have since been
fully removed from the site (June 21). Resume outreach to Terry once the
remaining open items — photos, Hakka/Hot Pot data, and general listing depth —
are addressed.

---

## Business Model

- **Free-trial / conversion model is being revised** — don't assume 2 weeks, the
  old "Prove It First" framing, or the 3-month minimum commitment below still
  apply. Check with Tux for the current approach before referencing trial terms
  anywhere (site copy, partner scripts, contracts).
- **Pricing — tier structure exists but names are unsettled.** Most detailed
  numeric version (May 20): Basic / Featured / Featured+Social at founding rates
  NT$2,500 / 4,500 / 5,500 per month, rising to NT$3,500 / 6,000 / 7,500 for
  restaurants signing after the founding period. However, a later session
  (June 24) shows tier *names* still undecided and a separate Basic/Growth/Premium
  framing explored. **Confirm current pricing before quoting a restaurant** —
  don't treat either version as final.
- **Sales approach:** lead with the ROI story (tourist/expat spend differential vs.
  Uber Eats commissions), not features or price. Use qualifying questions so owners
  self-anchor on value before price is introduced.
- **Honest stats only** — never use unverifiable claims (restaurant counts,
  ratings). Owners will fact-check.
- **Payments:** manual Fubon bank transfers currently. Local Taiwanese payment
  gateways planned post-registration.

**Business registration milestone:** the **5th paying restaurant** is the hard
trigger to register the business and book an accountant (會計師) appointment.

---

## Content & Copy Rules

- **Bilingual requirement:** all client-facing materials need English and
  Traditional Chinese versions.
- **AI-generated restaurant data risk:** Claude Haiku can produce plausible but
  fictitious restaurant names and addresses. Always verify real establishments
  independently before adding them to the database — especially relevant for the
  upcoming dessert/bakery category, which has no real entries yet.

---

## Division of Labor

- **Claude (claude.ai chat)** — strategy, copy, contracts, outreach scripts,
  pricing, partner communications.
- **Claude Code** — all codebase work: HTML, JSON, CSS, new pages, SEO.

### Claude Code session workflow
- Use the Haiku model for lighter tasks to minimize credit usage.
- Brainstorm in claude.ai chat first, then execute in Claude Code.
- Give Claude Code single focused tasks, 2–3 batched per session, with the
  `--dangerously-skip-permissions` flag. Large individual tasks get their own
  session — this avoids context-window compaction loops.

---

## Established Patterns & Environment Notes

- **Photo workflow:** drop files in a flat `images/restaurant-photos/` folder,
  named lowercase-with-dashes matching the restaurant slug (e.g.
  `yongkang-beef-noodle.webp`). Ask Claude Code to auto-match filenames to
  `restaurants.json` entries rather than editing the JSON by hand.
- **`/frontend-design` skill** requires explicit invocation each session — it
  doesn't auto-trigger. Must be run *after* `cd`-ing into
  `~/Desktop/tastytaipei`, or it treats the session as a greenfield build.
- **Superpowers plugin was removed** (`/plugin remove superpowers`) — it was
  intercepting prompts with unwanted planning/spec-writing behavior.
- **GitHub PAT:** use Classic type with `repo` scope. Tokens have expired before
  and needed regeneration — if pushes suddenly fail, check token expiry first.
- **Vercel domain config:** `tastytaipei.com` (non-www) is the canonical serving
  domain; `www.tastytaipei.com` 308-redirects to it. `tastytaipei.vercel.app`
  also points directly at the non-www domain, not through www, to avoid a
  redirect chain.

## Content Gaps (not code bugs — copy/UX only)

Flagged in a June 24 homepage review, not confirmed fixed:
- Consumer hero section doesn't mention the 5-language differentiator and has no
  social proof
- B2B plan cards are missing pricing display
- Redundant phrase in the B2B headline
- "List Your Restaurant" nav CTA has low visibility

---

## What to Work On Next

Priority order:
1. **Dessert/bakery category — fully scoped, zero decisions left, do this first.**
   Paste into a fresh Claude Code session:
   ```
   Add these 6 real, verified establishments to restaurants.json, matching the
   exact field structure of an existing entry:
   1. Xing Fu Tang (幸福堂) — bubble tea, Ximending
   2. Chun Shui Tang (春水堂) — bubble tea, Xinyi
   3. Bai-Shui Douhua (白水豆花) — traditional douhua, Da'an/Yongkang St
   4. Taro King (芋頭大王) — traditional Taiwanese dessert, Da'an/Yongkang St
   5. Smoothie House (思慕昔本館) — mango shaved ice, Da'an/Yongkang St
   6. Sunmerry Dongmen Shop (聖瑪莉東門店) — bakery, Da'an/Yongkang St

   Do not invent additional entries or alter these names/locations — verify
   hours/exact address against current sources before finalizing. Source
   images following the WebP/sub-100KB/Unsplash-preferred approach used
   elsewhere in the project.
   ```
2. Confirm with Claude Code whether the `.md` → `restaurants.json` conversion
   already happened as part of recent `build.py` work
3. Ship the 3 already-verified Hakka entries and spot-check the "Master Shen" hot
   pot entry from the July 2 research batch, rather than re-verifying all 150 CSV
   candidates from scratch
4. Source real photos for the 17 urgent restaurants currently on stock images
   (pull from Google Business listings where possible; bundle photo requests into
   partner outreach messages rather than treating as a separate task)
5. Resume outreach to Terry once photos/data gaps are addressed
6. Decide whether to activate the existing LINE Official Account for ordering
   once partner count hits 5–10 (it's already created, just unused — see
   Repository & Deployment)
7. Register the business + book an accountant once the 5th paying partner signs

---

## Tools & Resources

- **Development:** Claude Code (`npm @anthropic-ai/claude-code`), VS Code, GitHub,
  Vercel
- **Analytics:** Microsoft Clarity
- **Forms/notifications:** Formspree, LINE Messaging API
- **SEO:** Google Search Console, structured data (JSON-LD)
- **Image optimization:** squoosh.app (WebP compression, target sub-100KB per
  image)
- **Marketing skills installed in Claude:** ad-creative, copywriting, pricing,
  product-marketing, seo-audit, social

---

## Contact & Accounts

- GitHub: Debaytte2/tastytaipei
- Domain registrar: Namecheap
- Instagram: @tastytaipei_com
- LINE: @chrixx7 (personal, active channel); LINE Official Account "Tasty
  Taipei Orders" exists but is unused
- Formspree endpoint: https://formspree.io/f/mdapwalg
- Clarity tracking ID: vzvl62tnrr
