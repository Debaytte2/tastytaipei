#!/usr/bin/env python3
"""
Tasty Taipei — Static page generator.

Run locally:    python3 build.py
Vercel runs it: automatically via buildCommand in vercel.json

Generates:
  /restaurant/[slug]/index.html      — one per restaurant
  /[cuisine-slug]/[district-slug]/   — one per cuisine×district combo with ≥1 restaurant
  sitemap.xml                        — all pages
"""

import html as html_mod
import json
import os
import re
import unicodedata
from collections import defaultdict
from datetime import date
from urllib.parse import quote

BASE = "https://tastytaipei.com"
TODAY = date.today().isoformat()
ROOT = os.path.dirname(os.path.abspath(__file__))


# ── Helpers ───────────────────────────────────────────────────────────────────

def slugify(text):
    t = unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode("ascii")
    t = t.lower()
    t = re.sub(r"[^a-z0-9\s-]", "", t)
    t = re.sub(r"[\s-]+", "-", t)
    return t.strip("-")


def esc(s):
    return html_mod.escape(str(s) if s is not None else "")


def abs_img(url):
    if not url:
        return ""
    if url.startswith("/"):
        return BASE + quote(url, safe="/")
    return url


def parse_review_count(s):
    digits = re.sub(r"[^0-9]", "", str(s))
    return int(digits) if digits else None


def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


# ── Shared HTML fragments ─────────────────────────────────────────────────────

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com"/>'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>'
    '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;1,9..144,400'
    "&family=DM+Sans:wght@300;400;500;600&display=swap\" rel=\"stylesheet\"/>"
)

FAVICONS = """\
<link rel="icon" type="image/x-icon" href="/favicon.ico"/>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>"""

# Inline styles for generated static pages only
STATIC_CSS = """\
<style>
  .sp{max-width:900px;margin:0 auto;padding:40px 24px 80px}
  .sp h1{font-family:'Fraunces',serif;font-size:clamp(26px,5vw,40px);font-weight:800;color:var(--ink);margin:0 0 6px}
  .sp-crumb{font-size:13px;color:var(--muted);margin-bottom:20px}
  .sp-crumb a{color:var(--orange);text-decoration:none}
  .sp-hero{width:100%;height:300px;object-fit:cover;border-radius:16px;margin-bottom:24px;background:var(--warm);display:block}
  .sp-cuisine{font-size:15px;color:var(--muted);margin-bottom:16px}
  .sp-rating{display:inline-flex;align-items:center;gap:6px;font-size:15px;font-weight:700;color:var(--orange);margin-bottom:16px}
  .sp-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
  .sp-tag{background:var(--warm);border:1px solid var(--border);border-radius:20px;padding:4px 13px;font-size:12px;font-weight:600;color:var(--ink)}
  .sp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px}
  .sp-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:13px 15px}
  .sp-label{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .sp-val{font-size:13px;color:var(--ink);font-weight:500;line-height:1.5}
  .sp-desc{font-size:15px;line-height:1.75;color:var(--ink);margin-bottom:28px}
  .sp-actions{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px}
  .sp-btn{display:inline-flex;align-items:center;gap:6px;background:var(--ink);color:var(--cream)!important;text-decoration:none;border-radius:10px;padding:11px 22px;font-size:14px;font-weight:600;transition:background .2s}
  .sp-btn:hover{background:var(--orange)}
  .sp-btn-ghost{background:var(--warm);color:var(--ink)!important;border:1.5px solid var(--border)}
  .sp-btn-ghost:hover{background:var(--border)}
  .sp-r-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px;margin:20px 0 32px}
  .sp-r-card{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;text-decoration:none;color:var(--ink);display:block;transition:transform .2s,box-shadow .2s}
  .sp-r-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.09)}
  .sp-r-img{width:100%;height:170px;object-fit:cover;background:var(--warm);display:block}
  .sp-r-body{padding:13px 15px}
  .sp-r-name{font-family:'Fraunces',serif;font-size:16px;font-weight:700;margin-bottom:2px}
  .sp-r-meta{font-size:12px;color:var(--muted);margin-bottom:4px}
  .sp-r-rating{font-size:13px;font-weight:700;color:var(--orange)}
  .sp-section-title{font-family:'Fraunces',serif;font-size:22px;font-weight:700;margin:32px 0 16px}
</style>"""

NAV = """\
<nav>
  <a class="nav-logo" href="/">Tasty<span> Taipei</span></a>
  <div class="nav-links">
    <a href="/">Discover</a>
    <a href="/#cats-grid">Categories</a>
    <a href="/for-restaurants.html">For Restaurants</a>
    <a href="/about.html">About</a>
  </div>
  <div class="nav-right">
    <a class="nav-cta" href="/for-restaurants.html">List Your Restaurant →</a>
    <button class="nav-hamburger" id="nav-hamburger-btn" onclick="toggleMobileNav()" aria-label="Menu" aria-expanded="false">☰</button>
  </div>
</nav>
<div id="mobile-nav-panel">
  <a class="mnp-link" href="/">Discover</a>
  <a class="mnp-link" href="/#cats-grid">Categories</a>
  <a class="mnp-link" href="/for-restaurants.html">For Restaurants</a>
  <a class="mnp-link" href="/about.html">About</a>
  <a class="mnp-link mnp-cta" href="/for-restaurants.html">List Your Restaurant →</a>
</div>"""

FOOTER = """\
<footer>
  <div class="footer-logo">Tasty<span> Taipei</span></div>
  <div class="footer-links">
    <a href="/about.html">About</a>
    <a href="/for-restaurants.html">For Restaurants</a>
    <a href="https://www.instagram.com/tastytaipei_com" target="_blank" rel="noopener">Instagram</a>
    <a href="https://line.me/ti/p/@chrixx7" target="_blank" rel="noopener">LINE Us</a>
    <a href="https://line.me/ti/p/@chrixx7" target="_blank" rel="noopener">Contact</a>
  </div>
  <div class="footer-copy">© 2026 Tasty Taipei — Built with ♥ in Taiwan</div>
</footer>"""

SCRIPTS = '<script src="/js/ui.js"></script>'


def page_head(title, desc, canonical, og_img=""):
    og_img_tag = (
        f'<meta property="og:image" content="{esc(og_img)}"/>\n'
        if og_img else ""
    )
    return f"""\
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="referrer" content="no-referrer"/>
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="{canonical}"/>
{FAVICONS}
<meta property="og:type" content="website"/>
<meta property="og:url" content="{canonical}"/>
<meta property="og:title" content="{esc(title)}"/>
<meta property="og:description" content="{esc(desc)}"/>
{og_img_tag}<meta property="og:site_name" content="Tasty Taipei"/>
{FONTS}
<link rel="stylesheet" href="/css/main.css"/>
{STATIC_CSS}
</head>"""


# ── Restaurant page ───────────────────────────────────────────────────────────

TAG_LABELS = {"dine": "🪑 Dine-in", "pickup": "📦 Pickup", "delivery": "🛵 Delivery"}


def restaurant_page(r):
    slug = slugify(r["name"])
    canonical = f"{BASE}/restaurant/{slug}/"

    title = f"{r['name']} — {r['cuisine']} in {r['district']}, Taipei | Tasty Taipei"
    desc = (
        r.get("description")
        or f"Discover {r['name']}, a {r['cuisine']} restaurant in {r['district']}, Taipei. Rated {r['rating']} with {r.get('review_count','many reviews')}."
    )

    img_url = abs_img(r.get("image_url", ""))

    # JSON-LD
    rc = parse_review_count(r.get("review_count", ""))
    aggregate = (
        f',\n  "aggregateRating": {{"@type":"AggregateRating","ratingValue":"{r["rating"]}","reviewCount":{rc}}}'
        if rc else ""
    )
    schema = f"""\
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "{esc(r['name'])}",
  "image": "{esc(img_url)}",
  "url": "{canonical}",
  "servesCuisine": "{esc(r['cuisine'])}",
  "priceRange": "{esc(r.get('price_range', ''))}",
  "address": {{
    "@type": "PostalAddress",
    "streetAddress": "{esc(r.get('address', ''))}",
    "addressLocality": "Taipei",
    "addressCountry": "TW"
  }}{aggregate}
}}
</script>"""

    tags_html = "".join(
        f'<span class="sp-tag">{TAG_LABELS.get(t, esc(t))}</span>'
        for t in (r.get("tags") or [])
    )

    def info_card(label, val):
        return f'<div class="sp-card"><div class="sp-label">{label}</div><div class="sp-val">{esc(val)}</div></div>'

    info_grid = ""
    if r.get("address"):      info_grid += info_card("📍 Location", r["address"])
    if r.get("hours"):        info_grid += info_card("🕐 Hours", r["hours"])
    if r.get("price_range"):  info_grid += info_card("💰 Price Range", r["price_range"])
    if r.get("phone"):        info_grid += info_card("📞 Phone", r["phone"])
    if r.get("mrt"):          info_grid += info_card("🚇 MRT", r["mrt"])

    desc_block = f'<p class="sp-desc">{esc(r["description"])}</p>' if r.get("description") else ""

    img_tag = (
        f'<img class="sp-hero" src="{esc(img_url)}" alt="{esc(r["name"])}" referrerpolicy="no-referrer" loading="eager"/>'
        if img_url else ""
    )

    maps_url = r.get("maps_url") or f"https://www.google.com/maps/search/{esc(r['name'])}+Taipei"

    cuisine_district = f"{r['district']}, Taipei"

    page = f"""\
<!DOCTYPE html>
<html lang="en">
{page_head(title, desc, canonical, img_url)}
{schema}
<body>
{NAV}
<main class="sp">
  <p class="sp-crumb"><a href="/">Tasty Taipei</a> › <a href="/">Restaurants</a> › {esc(r['name'])}</p>
  {img_tag}
  <h1>{esc(r['name'])}</h1>
  <p class="sp-cuisine">{esc(r['cuisine'])} · {esc(cuisine_district)}</p>
  <p class="sp-rating">⭐ {esc(str(r['rating']))} <span style="font-weight:400;color:var(--muted);font-size:13px;">({esc(r.get('review_count',''))})</span></p>
  <div class="sp-tags">{tags_html}</div>
  <div class="sp-grid">{info_grid}</div>
  {desc_block}
  <div class="sp-actions">
    <a class="sp-btn" href="{esc(maps_url)}" target="_blank" rel="noopener">📍 View on Google Maps</a>
    <a class="sp-btn sp-btn-ghost" href="/">← Back to Discover</a>
  </div>
</main>
{FOOTER}
{SCRIPTS}
</body>
</html>"""

    out = os.path.join(ROOT, "restaurant", slug, "index.html")
    write_file(out, page)
    return slug, canonical


# ── Cuisine × district page ───────────────────────────────────────────────────

def cuisine_district_page(cuisine, district, restaurants):
    cs = slugify(cuisine)
    ds = slugify(district)
    canonical = f"{BASE}/{cs}/{ds}/"

    n = len(restaurants)
    title = f"Best {cuisine} in {district}, Taipei | Tasty Taipei"
    desc = (
        f"Find the {n} best {cuisine} restaurant{'s' if n > 1 else ''} in {district}, Taipei. "
        f"See hours, location, and ratings on Tasty Taipei."
    )

    cards = ""
    for r in sorted(restaurants, key=lambda x: -x["rating"]):
        rslug = slugify(r["name"])
        img = r.get("image_url", "")
        img_tag = (
            f'<img class="sp-r-img" src="{esc(img)}" alt="{esc(r["name"])}" referrerpolicy="no-referrer" loading="lazy"/>'
            if img else '<div class="sp-r-img"></div>'
        )
        cards += f"""\
<a class="sp-r-card" href="/restaurant/{rslug}/">
  {img_tag}
  <div class="sp-r-body">
    <div class="sp-r-name">{esc(r['name'])}</div>
    <div class="sp-r-meta">{esc(r.get('address', r['district']))}</div>
    <div class="sp-r-rating">⭐ {esc(str(r['rating']))} · {esc(r.get('price_range', ''))}</div>
  </div>
</a>
"""

    schema = f"""\
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "{esc(title)}",
  "description": "{esc(desc)}",
  "url": "{canonical}"
}}
</script>"""

    page = f"""\
<!DOCTYPE html>
<html lang="en">
{page_head(title, desc, canonical)}
{schema}
<body>
{NAV}
<main class="sp">
  <p class="sp-crumb"><a href="/">Tasty Taipei</a> › {esc(cuisine)} › {esc(district)}</p>
  <h1>Best {esc(cuisine)} in {esc(district)}, Taipei</h1>
  <p class="sp-cuisine">{n} restaurant{"s" if n > 1 else ""} in {esc(district)}</p>
  <div class="sp-r-grid">
{cards}  </div>
  <a class="sp-btn sp-btn-ghost" href="/">← Explore All Restaurants</a>
</main>
{FOOTER}
{SCRIPTS}
</body>
</html>"""

    out = os.path.join(ROOT, cs, ds, "index.html")
    write_file(out, page)
    return canonical


# ── Sitemap ───────────────────────────────────────────────────────────────────

def build_sitemap(pages):
    urls = "\n".join(
        f"  <url><loc>{loc}</loc><lastmod>{lastmod}</lastmod></url>"
        for loc, lastmod in pages
    )
    return f"""\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>"""


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    DATA_FILE = os.path.join(ROOT, "restaurants.json")
    with open(DATA_FILE, encoding="utf-8") as f:
        restaurants = json.load(f)

    sitemap_pages = [
        (f"{BASE}/", TODAY),
        (f"{BASE}/about.html", TODAY),
        (f"{BASE}/for-restaurants.html", TODAY),
    ]

    # Group by cuisine × district
    cd_map = defaultdict(list)
    for r in restaurants:
        cd_map[(r["cuisine"], r["district"])].append(r)

    # Restaurant pages
    print(f"Generating {len(restaurants)} restaurant pages…")
    for r in restaurants:
        slug, canonical = restaurant_page(r)
        sitemap_pages.append((canonical, TODAY))
        print(f"  /restaurant/{slug}/")

    # Cuisine × district pages
    print(f"\nGenerating {len(cd_map)} cuisine×district pages…")
    for (cuisine, district), rs in sorted(cd_map.items()):
        canonical = cuisine_district_page(cuisine, district, rs)
        sitemap_pages.append((canonical, TODAY))
        print(f"  /{slugify(cuisine)}/{slugify(district)}/")

    # Sitemap
    sitemap = build_sitemap(sitemap_pages)
    write_file(os.path.join(ROOT, "sitemap.xml"), sitemap)
    print(f"\nWrote sitemap.xml — {len(sitemap_pages)} URLs total")
    print(f"Done. {len(restaurants)} restaurant pages + {len(cd_map)} cuisine×district pages.")


if __name__ == "__main__":
    main()
