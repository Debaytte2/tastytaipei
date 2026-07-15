#!/usr/bin/env python3
"""
Tasty Taipei — Restaurant description translator.

For every restaurant in restaurants.json, fills in any empty zh/fr/ja/es
description with a translation of the English description, via the Claude API.

Safe to re-run: only fills empty language fields, never overwrites existing
non-empty translations (so manual edits made later won't get clobbered).

Usage:
    python3 translate_descriptions.py           # translate + write + log
    python3 translate_descriptions.py --dry-run # log what would change, don't write

Requires ANTHROPIC_API_KEY in the environment (or an `ant auth login` profile).
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

import anthropic

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(ROOT, "restaurants.json")
LOG_FILE = os.path.join(ROOT, "translate_descriptions.log")

MODEL = "claude-sonnet-4-6"

TARGET_LANGS = {
    "zh": "Traditional Chinese (Taiwan Mandarin, 繁體中文 as used in Taipei)",
    "fr": "French",
    "ja": "Japanese",
    "es": "Spanish",
}

SYSTEM_PROMPT = """\
You translate restaurant descriptions for Tasty Taipei, a restaurant discovery \
site for tourists, expats, and locals in Taipei. The tone is warm, editorial, \
and specific — never generic travel-blog voice ("hidden gem", "must-try", \
"foodie paradise"). Preserve that same specific, editorial tone in the \
translation; don't flatten it into generic marketing language.

Rules:
- Translate the restaurant description into the requested target language.
- Keep restaurant names and other proper nouns (dish names, street/district \
names) untransliterated and in their original form, UNLESS there is a \
commonly used name for that place/thing in the target language's locale — in \
that case use the commonly used local form.
- Do not add information that isn't in the source text. Do not add hedging, \
disclaimers, or meta-commentary.
- Output ONLY the translated description text. No quotes, no labels, no \
explanation, nothing else.
"""


def build_user_prompt(lang_name, name, en_description):
    return (
        f"Restaurant name: {name}\n"
        f"Target language: {lang_name}\n\n"
        f"English description:\n{en_description}\n\n"
        "Translate this description into the target language, following the "
        "system instructions."
    )


def translate_one(client, lang_name, name, en_description):
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": build_user_prompt(lang_name, name, en_description),
            }
        ],
    )
    text = "".join(block.text for block in response.content if block.type == "text")
    return text.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Log what would be translated without writing restaurants.json",
    )
    args = parser.parse_args()

    with open(DATA_FILE, encoding="utf-8") as f:
        restaurants = json.load(f)

    client = anthropic.Anthropic()

    log_lines = []
    translated_count = 0
    skipped_count = 0

    for r in restaurants:
        desc = r.get("description")
        if not isinstance(desc, dict):
            continue
        en_text = (desc.get("en") or "").strip()
        if not en_text:
            print(f"WARN: {r.get('id')} has no English description — skipping", file=sys.stderr)
            continue

        for lang, lang_name in TARGET_LANGS.items():
            existing = (desc.get(lang) or "").strip()
            if existing:
                skipped_count += 1
                continue

            translated = translate_one(client, lang_name, r.get("name", r.get("id")), en_text)
            if not args.dry_run:
                desc[lang] = translated
            translated_count += 1

            line = f"{r.get('id')} [{lang}]: {translated}"
            print(line)
            log_lines.append(line)

    if not args.dry_run and translated_count:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(restaurants, f, ensure_ascii=False, indent=2)
            f.write("\n")

    timestamp = datetime.now(timezone.utc).isoformat()
    mode = "DRY RUN — nothing written" if args.dry_run else "WRITTEN to restaurants.json"
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"\n=== translate_descriptions.py run at {timestamp} ({mode}) ===\n")
        f.write(f"Translated: {translated_count}  Skipped (already filled): {skipped_count}\n")
        for line in log_lines:
            f.write(line + "\n")

    print(f"\nDone. Translated {translated_count} field(s), skipped {skipped_count} already-filled field(s).")
    print(f"Log written to {LOG_FILE}")


if __name__ == "__main__":
    main()
