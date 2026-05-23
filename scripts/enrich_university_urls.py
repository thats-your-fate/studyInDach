#!/usr/bin/env python3
"""
Enrich a universities CSV with official website and sitemap URLs.

The script uses the OpenAI Responses API with web search to find the official
website for each university, then tries to discover a sitemap from robots.txt
or common sitemap paths. It writes after each row and keeps a checkpoint so a
run can resume safely.

Usage:
  python3 scripts/enrich_university_urls.py --limit 5
  python3 scripts/enrich_university_urls.py --input unisDE.csv --output unisDE.enriched.csv
  python3 scripts/enrich_university_urls.py --input unisATCH.csv --output unisATCH.enriched.csv --country-hint "Austria and Switzerland" --assume-sitemap-path sitemap.xml
  python3 scripts/enrich_university_urls.py --validate-existing-sitemaps
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "unisDE.csv"
DEFAULT_OUTPUT = PROJECT_ROOT / "unisDE.enriched.csv"
DEFAULT_CHECKPOINT = PROJECT_ROOT / "scripts" / ".university_url_enrichment_checkpoint.json"
ENV_PATH = Path(os.environ.get("EXTERNAL_ENV_FILE", "/home/yaro/project-env/studyInDach.env"))

WEBSITE_COLUMN = "Website URL"
SITEMAP_COLUMN = "Sitemap URL"
CONFIDENCE_COLUMN = "URL Confidence"
NOTES_COLUMN = "URL Notes"
UNIVERSITY_ID_COLUMN = "University ID"
HTTP_TIMEOUT_SECONDS = 4


def main() -> int:
    parser = argparse.ArgumentParser(description="Enrich university rows with official URL and sitemap URL.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--checkpoint", type=Path, default=DEFAULT_CHECKPOINT)
    parser.add_argument("--model", default=os.getenv("OPENAI_URL_MODEL", os.getenv("OPENAI_MODEL", "gpt-4.1-mini")))
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--start-at", type=int, default=0)
    parser.add_argument("--sleep", type=float, default=0.25)
    parser.add_argument("--max-retries", type=int, default=3)
    parser.add_argument("--country-hint", default="Germany", help="Country/region context passed to web search.")
    parser.add_argument(
        "--assume-sitemap-path",
        default="",
        help="Use this path under the official website as the sitemap URL, for example: sitemap.xml",
    )
    parser.add_argument("--force", action="store_true", help="Re-enrich rows even if the checkpoint/output already has URLs.")
    parser.add_argument(
        "--validate-existing-sitemaps",
        action="store_true",
        help="Validate sitemap URLs already present in --output and replace 404/bad values when possible.",
    )
    args = parser.parse_args()

    rows, fieldnames = read_csv(args.input)
    fieldnames = ensure_output_columns(fieldnames)
    assign_university_ids(rows)
    rows = merge_existing_output(rows, args.output)
    assign_university_ids(rows)
    if args.validate_existing_sitemaps:
        validate_existing_sitemaps(rows)
        write_csv(args.output, rows, fieldnames)
    checkpoint = {} if args.force else read_json(args.checkpoint, default={})

    selected_rows = rows[args.start_at :]
    if args.limit is not None:
        selected_rows = selected_rows[: args.limit]

    pending = [
        row
        for row in selected_rows
        if args.force or should_enrich(row, checkpoint)
    ]

    print(f"Rows loaded: {len(rows)}")
    print(f"Rows selected: {len(selected_rows)}")
    print(f"Rows pending enrichment: {len(pending)}")
    print(f"Output: {args.output}")
    if not pending:
        write_csv(args.output, rows, fieldnames)
        print(f"Wrote enriched CSV to {args.output}")
        return 0

    load_env_file(ENV_PATH)
    ensure_openai_available()
    from openai import OpenAI
    client = OpenAI()
    for index, row in enumerate(pending, start=1):
        label = row_label(row)
        print(f"Enriching {index}/{len(pending)}: {label}")
        enrichment = enrich_with_retries(client, args.model, row, args.max_retries, args.country_hint)

        website_url = clean_url(enrichment.get("website_url"))
        sitemap_url = resolve_sitemap(website_url, enrichment.get("sitemap_url"), args.assume_sitemap_path)

        row[WEBSITE_COLUMN] = website_url
        row[SITEMAP_COLUMN] = sitemap_url
        row[CONFIDENCE_COLUMN] = clean_string(enrichment.get("confidence"))
        row[NOTES_COLUMN] = clean_string(enrichment.get("notes"))
        checkpoint[row_key(row)] = {
            "website_url": website_url,
            "sitemap_url": sitemap_url,
            "confidence": row[CONFIDENCE_COLUMN],
        }

        write_json(args.checkpoint, checkpoint)
        write_csv(args.output, rows, fieldnames)
        time.sleep(args.sleep)

    write_csv(args.output, rows, fieldnames)
    print(f"Wrote enriched CSV to {args.output}")
    return 0


def enrich_with_retries(
    client: Any,
    model: str,
    row: dict[str, str],
    max_retries: int,
    country_hint: str,
) -> dict[str, Any]:
    last_error: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            return enrich_row(client, model, row, country_hint)
        except Exception as error:
            last_error = error
            wait = min(12, attempt * 1.7)
            print(f"Attempt {attempt}/{max_retries} failed: {error}. Waiting {wait:.1f}s")
            time.sleep(wait)
    assert last_error is not None
    raise last_error


def enrich_row(client: Any, model: str, row: dict[str, str], country_hint: str) -> dict[str, Any]:
    payload = {
        "university": row.get("University", ""),
        "location": row.get("Location", ""),
        "state": row.get("State", ""),
        "type": row.get("Type", ""),
        "country_or_region_hint": country_hint,
    }
    response = client.responses.create(
        model=model,
        tools=[{"type": "web_search"}],
        input=[
            {
                "role": "system",
                "content": (
                    "You find official university web properties. Use web search. "
                    "Return only the official primary university website URL, never Wikipedia, rankings sites, DAAD profiles, "
                    "social media, or third-party directories. Prefer the canonical domain used by the institution. "
                    "If you can find an official sitemap URL, include it; otherwise use an empty string. "
                    "For DACH universities, official domains often end in .de, .at, .ac.at, .ch, or .edu, but not always. "
                    "Use the country_or_region_hint and city/state to avoid similarly named institutions in other countries. "
                    "Return only valid JSON."
                ),
            },
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "university_url_enrichment",
                "strict": True,
                "schema": enrichment_schema(),
            }
        },
    )
    return json.loads(response.output_text)


def enrichment_schema() -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "website_url": {"type": "string"},
            "sitemap_url": {"type": "string"},
            "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
            "notes": {"type": "string"},
        },
        "required": ["website_url", "sitemap_url", "confidence", "notes"],
        "additionalProperties": False,
    }


def read_csv(path: Path) -> tuple[list[dict[str, str]], list[str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"CSV has no header: {path}")
        raw_headers = reader.fieldnames
        headers = [normalize_header(header) for header in raw_headers]
        rows = [
            {headers[index]: clean_string(value) for index, value in enumerate(raw_row.values())}
            for raw_row in reader
        ]
    return rows, headers


def merge_existing_output(rows: list[dict[str, str]], output_path: Path) -> list[dict[str, str]]:
    if not output_path.exists():
        return rows

    existing_rows, _existing_fields = read_csv(output_path)
    existing_by_key = {row_key(row): row for row in existing_rows}
    for row in rows:
        existing = existing_by_key.get(row_key(row))
        if existing:
            for column in [UNIVERSITY_ID_COLUMN, WEBSITE_COLUMN, SITEMAP_COLUMN, CONFIDENCE_COLUMN, NOTES_COLUMN]:
                row[column] = existing.get(column, row.get(column, ""))
    return rows


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


def should_enrich(row: dict[str, str], checkpoint: dict[str, Any]) -> bool:
    if clean_string(row.get(WEBSITE_COLUMN)) and clean_string(row.get(SITEMAP_COLUMN)):
        return False
    return row_key(row) not in checkpoint


def ensure_output_columns(fieldnames: list[str]) -> list[str]:
    output = list(fieldnames)
    if UNIVERSITY_ID_COLUMN not in output:
        try:
            university_index = output.index("University")
        except ValueError:
            university_index = 0
        output.insert(university_index, UNIVERSITY_ID_COLUMN)
    for column in [WEBSITE_COLUMN, SITEMAP_COLUMN, CONFIDENCE_COLUMN, NOTES_COLUMN]:
        if column not in output:
            output.append(column)
    return output


def assign_university_ids(rows: list[dict[str, str]]) -> None:
    seen: dict[str, int] = {}
    for row in rows:
        base = slugify(row_key(row))
        count = seen.get(base, 0) + 1
        seen[base] = count
        row[UNIVERSITY_ID_COLUMN] = base if count == 1 else f"{base}-{count}"


def normalize_header(header: str) -> str:
    cleaned = clean_string(header)
    if "University" in cleaned and "List of German state-recognized" in cleaned:
        return "University"
    if cleaned == "City":
        return "Location"
    if cleaned == "Number of Students":
        return "Number of students"
    return cleaned


def row_key(row: dict[str, str]) -> str:
    return "|".join([row.get("University", ""), row.get("Location", ""), row.get("State", "")]).lower()


def slugify(value: str) -> str:
    replacements = {
        "ä": "ae",
        "ö": "oe",
        "ü": "ue",
        "ß": "ss",
        "é": "e",
        "è": "e",
        "á": "a",
        "à": "a",
        "ó": "o",
        "ò": "o",
        "–": "-",
        "—": "-",
        "&": " and ",
    }
    text = value.lower()
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def row_label(row: dict[str, str]) -> str:
    return f"{row.get('University', '').strip()} ({row.get('Location', '').strip()})"


def discover_sitemap(website_url: str) -> str:
    for robots_sitemap in sitemaps_from_robots(website_url):
        if is_valid_sitemap(robots_sitemap):
            return robots_sitemap

    base = normalized_base_url(website_url)
    for path in ["sitemap.xml", "sitemap_index.xml", "sitemap-index.xml", "wp-sitemap.xml"]:
        candidate = urljoin(base, path)
        if is_valid_sitemap(candidate):
            return candidate
    return ""


def resolve_sitemap(website_url: str, candidate: Any, assumed_path: str = "") -> str:
    sitemap_url = clean_url(candidate)
    assumed_sitemap = sitemap_from_assumed_path(website_url, assumed_path)
    if assumed_sitemap:
        return assumed_sitemap
    if sitemap_url and is_valid_sitemap(sitemap_url):
        return sitemap_url
    if website_url:
        return discover_sitemap(website_url)
    return ""


def sitemap_from_assumed_path(website_url: str, path: str) -> str:
    cleaned_path = clean_string(path).lstrip("/")
    base = normalized_base_url(website_url)
    if not cleaned_path or not base:
        return ""
    return clean_url(urljoin(base, cleaned_path))


def validate_existing_sitemaps(rows: list[dict[str, str]]) -> None:
    rows_with_websites = [row for row in rows if clean_url(row.get(WEBSITE_COLUMN))]
    for index, row in enumerate(rows_with_websites, start=1):
        website_url = clean_url(row.get(WEBSITE_COLUMN))
        sitemap_url = clean_url(row.get(SITEMAP_COLUMN))
        print(f"Validating sitemap {index}/{len(rows_with_websites)}: {row_label(row)}", flush=True)
        if sitemap_url and is_valid_sitemap(sitemap_url):
            row[SITEMAP_COLUMN] = sitemap_url
            continue

        replacement = discover_sitemap(website_url)
        if replacement != sitemap_url:
            label = row_label(row)
            print(f"Replacing sitemap for {label}: {sitemap_url or '(empty)'} -> {replacement or '(empty)'}")
            row[SITEMAP_COLUMN] = replacement


def sitemaps_from_robots(website_url: str) -> list[str]:
    robots_url = urljoin(normalized_base_url(website_url), "robots.txt")
    try:
        request = Request(robots_url, headers={"User-Agent": "studyInDach-url-enrichment/1.0"})
        with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return []
            body = response.read(150_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return []

    sitemaps = []
    for line in body.splitlines():
        if line.lower().startswith("sitemap:"):
            sitemaps.append(clean_url(line.split(":", 1)[1].strip()))
    return sitemaps


def is_valid_sitemap(url: str) -> bool:
    if not clean_url(url):
        return False
    try:
        request = Request(clean_url(url), headers={"User-Agent": "studyInDach-url-enrichment/1.0"})
        with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return False
            content_type = response.headers.get("content-type", "").lower()
            body = response.read(4096).decode("utf-8", errors="ignore").lower()
    except (HTTPError, URLError, TimeoutError, ValueError):
        return False

    if "<urlset" in body or "<sitemapindex" in body:
        return True
    return "xml" in content_type and ("sitemap" in body or "<url>" in body)


def normalized_base_url(url: str) -> str:
    parsed = urlparse(clean_url(url))
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme}://{parsed.netloc}/"


def clean_url(value: Any) -> str:
    url = clean_string(value)
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        url = f"https://{url}"
    return url.rstrip("/")


def clean_string(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    tmp_path.replace(path)


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def ensure_openai_available() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not set. Add it to .env or export it before running.")
    try:
        import openai  # noqa: F401
    except ImportError as exc:
        raise RuntimeError("Python package 'openai' is missing. Install it with: python3 -m pip install openai") from exc


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
