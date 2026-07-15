# Image Pipeline Audit — restaurants.json

Generated 2026-07-15. Read-only audit — no files or JSON were modified.

## TL;DR — root cause of the plate/fork fallback icon

It's **not** a filename mismatch problem. Every restaurant whose `image_url`
points at a local file (`/images/restaurant-photos/...`) resolves to a file
that exists, with an exact-match filename (16/16, verified byte-for-byte
including spaces, parentheses, and case). There are **zero** MISSING FILE and
**zero** MISMATCH cases in the strict sense the audit was scoped for.

The actual bug: **16 of 47 restaurants have `"image_url": ""` — an empty
string, not a broken path.** Nothing 404s; there's simply no image reference
at all, so the frontend renders its fallback plate/fork icon. `URBAN
PARADISE` and `Le Blanc` are both in this group, which matches what's live on
site. `Mikkeller Taipei` is in the "OK, local file" group, which is why it
renders fine.

A second, separate issue: 15 restaurants use hotlinked Unsplash stock photos
as `image_url`. These load fine (no fallback icon), so they're not part of
this bug, but they overlap with the already-tracked "32 restaurants sharing
stock/placeholder images" item in CLAUDE.md — worth keeping distinct from the
empty-field bug when scoping the fix.

| Group | Count |
|---|---|
| a. Empty `image_url` field (renders fallback icon) | 16 |
| b. Local file path, exact match in folder (renders fine) | 16 |
| c. Unsplash stock URL (renders fine, but is the known stock-photo issue, not this bug) | 15 |
| **Total restaurants** | **47** |

---

## a. MISSING FILE / EMPTY FIELD (16) — causes the fallback icon

None of these point at a nonexistent filename — the field itself is blank.
Grouped here because the *symptom* (fallback icon) is identical to a true
missing-file case, and because it's the direct explanation for
`URBAN PARADISE` and `Le Blanc`.

| Slug | Name | `image_url` |
|---|---|---|
| le-blanc | Le Blanc | *(empty)* |
| red-alley | Red Alley | *(empty)* |
| ay-chung-flour-rice-noodle | Ay-Chung Flour-Rice Noodle | *(empty)* |
| wow-bistro | WOW Bistro | *(empty)* |
| addiction-aquatic-development | Addiction Aquatic Development | *(empty)* |
| moon-moon-rice-noodles | Moon Moon Rice Noodles | *(empty)* |
| liu-shan-dong-homemade-noodles | Liu Shan Dong Homemade Noodles | *(empty)* |
| lei-hou-shandong-steamed-buns | Lei Hou Shandong Steamed Buns | *(empty)* |
| urban-paradise | URBAN PARADISE | *(empty)* |
| smith-wollensky-taipei | Smith & Wollensky Taipei | *(empty)* |
| shilin-night-market | Shilin Night Market | *(empty)* |
| fujin-tree-353 | Fujin Tree 353 | *(empty)* |
| aqua-kiss | Aqua Kiss | *(empty)* |
| ny-bagels-cafe | NY Bagels Café | *(empty)* |
| maokong-teahouse | Maokong Teahouse | *(empty)* |
| zhinan-vegetarian-kitchen | Zhinan Vegetarian Kitchen | *(empty)* |

## b. MISMATCH (0)

No cases found. Every local-file `image_url` in restaurants.json matches a
file in `images/restaurant-photos/` exactly (verified with a byte-level
comparison, not just eyeballing) — no case, typo, extension, or
dash/underscore mismatches exist in the current data.

## c. OK — exact match (16)

| Slug | Name | Filename |
|---|---|---|
| an-kitchen | AN Kitchen | `AN Kitchen.webp` |
| yongkang-beef-noodle | Yongkang Beef Noodle | `Yongkang Beef Noodle.webp` |
| fuhong-beef-noodles | Fuhong Beef Noodles | `Fuhong Beef Noodles.webp` |
| yuan-fang-gua-bao | Yuan Fang Gua Bao | `Yuan Fang Gua Bao.webp` |
| modern-toilet-restaurant | Modern Toilet Restaurant | `Modern Toilet Restaurant.webp` |
| shin-yeh | Shin Yeh | `Shin Yeh.webp` |
| raw | RAW | `RAW fine dining.webp` |
| din-tai-fung-zhongzheng | Din Tai Fung (Zhongzheng) | `Din Tai Fung (Zhongzheng).webp` |
| dadaocheng-braised-pork-rice | Dadaocheng Braised Pork Rice | `Dadaocheng Braised Pork Rice.webp` |
| mikkeller-taipei | Mikkeller Taipei | `Mikkeller Taipei craft beer and kitchen.webp` |
| din-tai-fung-taipei-101 | Din Tai Fung (Taipei 101) | `Din Tai Fung (Taipei 101).webp` |
| dimsum-kitchen | Dimsum Kitchen | `Dimsum Kitchen.webp` |
| good-friend-noodle-house | Good Friend Noodle House | `Good Friend Noodle House.webp` |
| zhang-nan-fried-chicken | Zhang Nan Fried Chicken | `Zhang Nan Fried Chicken.webp` |
| shuang-yue-japanese-ramen | Shuang Yue Japanese Ramen | `Shuang Yue Japanese Ramen.webp` |
| four-ways-pasta | Four Ways Pasta | `Four Ways Pasta.webp` |

## d. Unsplash stock URLs (15) — not part of this bug

Render correctly (no fallback icon), but not local files, so excluded from
a/b/c. Listed for completeness since they're the other reason a card might
*not* be showing a real photo.

9-birds-bistro, zha-nan-crispy-chicken, texas-roadhouse-taipei,
man-lai-ramen, kiki-restaurant-beitou, mayur-indian-kitchen, la-rotisserie,
second-floor-cafe, moon-moon-taiwanese-set-meals, xing-fu-tang,
chun-shui-tang, bai-shui-douhua, taro-king, smoothie-house, sunmerry-dongmen

---

## Naming convention check

CLAUDE.md specifies the convention as: **lowercase-with-dashes matching the
restaurant's slug** (e.g. `yongkang-beef-noodle.webp`).

**All 16 of the "OK" local-file entries violate this convention.** Every
single one uses `Title Case With Spaces.webp` instead of the documented
`lowercase-dash-slug.webp` pattern — this isn't a handful of stragglers, it's
100% of the local files currently in the folder. None of them 404 (spaces in
URLs get encoded fine by the browser/Vercel), so this isn't causing the
fallback-icon bug today, but it means the actual on-disk convention and the
documented convention have diverged completely.

| Slug (expected filename) | Actual filename |
|---|---|
| `an-kitchen.webp` | `AN Kitchen.webp` |
| `yongkang-beef-noodle.webp` | `Yongkang Beef Noodle.webp` |
| `fuhong-beef-noodles.webp` | `Fuhong Beef Noodles.webp` |
| `yuan-fang-gua-bao.webp` | `Yuan Fang Gua Bao.webp` |
| `modern-toilet-restaurant.webp` | `Modern Toilet Restaurant.webp` |
| `shin-yeh.webp` | `Shin Yeh.webp` |
| `raw.webp` | `RAW fine dining.webp` |
| `din-tai-fung-zhongzheng.webp` | `Din Tai Fung (Zhongzheng).webp` |
| `dadaocheng-braised-pork-rice.webp` | `Dadaocheng Braised Pork Rice.webp` |
| `mikkeller-taipei.webp` | `Mikkeller Taipei craft beer and kitchen.webp` |
| `din-tai-fung-taipei-101.webp` | `Din Tai Fung (Taipei 101).webp` |
| `dimsum-kitchen.webp` | `Dimsum Kitchen.webp` |
| `good-friend-noodle-house.webp` | `Good Friend Noodle House.webp` |
| `zhang-nan-fried-chicken.webp` | `Zhang Nan Fried Chicken.webp` |
| `shuang-yue-japanese-ramen.webp` | `Shuang Yue Japanese Ramen.webp` |
| `four-ways-pasta.webp` | `Four Ways Pasta.webp` |

---

## Bonus finding: orphaned files in `images/restaurant-photos/`

9 files exist in the folder that no restaurant's `image_url` points to. Not
requested by the audit scope, but relevant if the plan is to fill in the 16
empty-field restaurants above — some of these look like they may have been
sourced for exactly that purpose and never wired up:

| Filename | Note |
|---|---|
| `Beef Wellington.webp` | Possibly intended for a steakhouse — `smith-wollensky-taipei` is one of the 16 empty-field entries and has no image at all |
| `Bubble Tea Aesthetic — Kolorowe Boba.webp` | Possibly intended for a boba entry, but `xing-fu-tang`/`chun-shui-tang` currently use Unsplash stock, not local files |
| `boba tea.webp` | Same as above |
| `Brunch Aesthetic.webp` | No obvious matching restaurant |
| `Filipino Restaurant Hiraya Is Opening With Rainbow Lattes and All-Day Breakfast.webp` | Reads like a scraped article title, not a restaurant photo filename — no restaurant in restaurants.json matches "Hiraya" |
| `Irresistible Bao Bun Recipes to Make at Home.webp` | Same pattern — reads like a scraped recipe-article title |
| `pasta1.webp` | `four-ways-pasta` already has its own exact-match file; this looks like a leftover/duplicate attempt |
| `pasta 2.webp` | Same |
| `raw dine diningwebp.webp` | Looks like a malformed duplicate/earlier attempt at `RAW fine dining.webp` (note the literal "webp" baked into the name before the real extension) |

These don't affect the current live bug, but flagging them now since sourcing
real photos for the 16 empty-field restaurants is on the roadmap — some of
this work may already be half-done and just needs verification + wiring up
rather than starting from scratch.

---

## Recommended next step (not done in this pass)

The fix for the plate/fork icon is straightforward and low-risk: populate
`image_url` for the 16 empty-field restaurants (starting with `Le Blanc` and
`URBAN PARADISE` since they're the confirmed-live cases). The naming
convention drift (Title Case + spaces vs. documented lowercase-dash) is a
separate, lower-priority cleanup — it isn't causing any bug today, so it's
safe to defer or to fix opportunistically as new photos are sourced rather
than doing a disruptive rename-everything pass.
