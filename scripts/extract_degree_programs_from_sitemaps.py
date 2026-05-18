#!/usr/bin/env python3
"""
Extract likely Studiengänge / degree program pages from university sitemaps.

Reads unisDE.enriched.csv, follows sitemap indexes recursively, and writes a
flat CSV of likely degree-program URLs. This does not use OpenAI; it relies on
sitemap XML plus URL/title heuristics.

Usage:
  python3 scripts/extract_degree_programs_from_sitemaps.py --limit-universities 3
  python3 scripts/extract_degree_programs_from_sitemaps.py --only-university ebs
  python3 scripts/extract_degree_programs_from_sitemaps.py
"""

from __future__ import annotations

import argparse
import csv
import gzip
import html
import re
import sys
import time
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urlparse, urlsplit, urlunsplit
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "unisDE.enriched.csv"
DEFAULT_OUTPUT = PROJECT_ROOT / "degree_program_urls.csv"
DEFAULT_RAW_OUTPUT = PROJECT_ROOT / "raw_candidates.csv"
DEFAULT_REJECTED_OUTPUT = PROJECT_ROOT / "rejected_candidates.csv"

HTTP_TIMEOUT_SECONDS = 8
USER_AGENT = "studyInDach-degree-program-extractor/1.0"

OUTPUT_COLUMNS = [
    "University ID",
    "University",
    "Location",
    "State",
    "Website URL",
    "Root Sitemap URL",
    "Source Sitemap URL",
    "Program URL",
    "Program Name Guess",
    "Degree Level Guess",
    "Matched Keywords",
    "Score",
]

REJECTED_COLUMNS = OUTPUT_COLUMNS + ["Rejection Reason"]

POSITIVE_KEYWORDS = [
    "studiengang",
    "studiengaenge",
    "studiengänge",
    "studienangebot",
    "studienfach",
    "studienprogramm",
    "studienprogramme",
    "study-program",
    "study-programmes",
    "study-programs",
    "degree-program",
    "degree-programmes",
    "degree-programs",
    "bachelor",
    "master",
    "staatsexamen",
    "state-examination",
    "promotion",
    "phd",
]

HIGH_VALUE_KEYWORDS = [
    "studiengang",
    "studiengaenge",
    "studiengänge",
    "study-program",
    "degree-program",
    "bachelor",
    "master",
]

NEGATIVE_KEYWORDS = [
    "news",
    "aktuelles",
    "event",
    "veranstaltung",
    "presse",
    "kontakt",
    "contact",
    "privacy",
    "datenschutz",
    "impressum",
    "login",
    "search",
    "suche",
    "calendar",
    "kalender",
    "person",
    "staff",
    "team",
    "jobs",
    "career",
    "alumni",
    "application",
    "bewerbung",
    "einschreibung",
    "enrollment",
    "erasmus",
    "evaluation",
    "faq",
    "fristen",
    "forschung",
    "go-abroad",
    "im-studium",
    "incoming",
    "masterarbeit",
    "masterarbeiten",
    "more",
    "outgoing",
    "pruefung",
    "pruef",
    "referenz",
    "referenzen",
    "scholarship",
    "stipend",
    "team",
    "teacher",
    "dozent",
    "dozentinnen",
    "zulassung",
    "workshop",
    "download",
    "fileadmin",
    "typo3",
]

PROGRAM_PATH_PATTERNS = [
    re.compile(r"/studiengaenge?/", re.I),
    re.compile(r"/studiengänge/", re.I),
    re.compile(r"/studienangebot/", re.I),
    re.compile(r"/studienprogramme?/", re.I),
    re.compile(r"/studienfaecher?/", re.I),
    re.compile(r"/studienfächer?/", re.I),
    re.compile(r"/study-program(me)?s?/", re.I),
    re.compile(r"/degree-program(me)?s?/", re.I),
    re.compile(r"/program(me)?s?/(bachelor|master|phd|doctoral)", re.I),
    re.compile(r"/(bachelor|master|staatsexamen|phd|doctoral)/[^/]+", re.I),
]

STRICT_PROGRAM_PATH_PATTERNS = [
    re.compile(r"/studiengaenge/[^/]+$", re.I),
    re.compile(r"/studiengänge/[^/]+$", re.I),
    re.compile(r"/en/(bachelor|master)/[^/]+$", re.I),
    re.compile(r"/(bachelor|master)/[^/]+$", re.I),
    re.compile(r"/degree-program(me)?s?/[^/]+$", re.I),
    re.compile(r"/study-program(me)?s?/[^/]+$", re.I),
]

MODULE_PATH_HINTS = [
    "/lehre/",
    "/studium/bachelor/",
    "/studium/master/",
    "/studium-und-lehre/",
]

TITLE_NEGATIVE_KEYWORDS = [
    "seminar",
    "projekt",
    "grundlagen",
    "übung",
    "uebung",
    "vorlesung",
    "modul",
    "modulhandbuch",
    "formular",
    "vielen dank",
    "anmeldung",
    "ansprechpartner",
    "fachstudienberater",
    "qualifikationsziele",
    "struktur und inhalte",
    "profil",
    "studium",
    "zusammenarbeit",
    "wissenschaft",
]

TITLE_DEGREE_PATTERNS = [
    re.compile(r"\bBachelor\b", re.I),
    re.compile(r"\bMaster\b", re.I),
    re.compile(r"\bB\.?\s?(A|Sc|Ed|Eng|L)\.?\b", re.I),
    re.compile(r"\bM\.?\s?(A|Sc|Ed|Eng|L)\.?\b", re.I),
    re.compile(r"\bStaatsexamen\b", re.I),
]

TITLE_STRONG_DEGREE_PATTERNS = [
    re.compile(r"\bBachelor\s+of\b", re.I),
    re.compile(r"\bMaster\s+of\b", re.I),
    re.compile(r"\bB\.?\s?(A|Sc|Ed|Eng|L)\.?\b", re.I),
    re.compile(r"\bM\.?\s?(A|Sc|Ed|Eng|L)\.?\b", re.I),
    re.compile(r"\bStaatsexamen\b", re.I),
]

DEGREE_LEVEL_PATTERNS = [
    ("Bachelor", re.compile(r"\b(ba|bsc|b\.a|b\.sc|bachelor)\b", re.I)),
    ("Master", re.compile(r"\b(ma|msc|m\.a|m\.sc|master)\b", re.I)),
    ("State Examination", re.compile(r"\b(staatsexamen|state[- ]examination)\b", re.I)),
    ("Doctorate", re.compile(r"\b(promotion|phd|doctoral|doctorate)\b", re.I)),
]


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract likely degree-program URLs from university sitemaps.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--raw-output", type=Path, default=DEFAULT_RAW_OUTPUT)
    parser.add_argument("--rejected-output", type=Path, default=DEFAULT_REJECTED_OUTPUT)
    parser.add_argument("--only-university", default="", help="Case-insensitive substring filter for one university.")
    parser.add_argument("--limit-universities", type=int, default=None)
    parser.add_argument("--max-sitemaps-per-university", type=int, default=80)
    parser.add_argument("--max-urls-per-university", type=int, default=15000)
    parser.add_argument("--max-candidates-per-university", type=int, default=500)
    parser.add_argument("--min-score", type=int, default=5)
    parser.add_argument("--fetch-titles", action=argparse.BooleanOptionalAction, default=True)
    parser.add_argument("--sleep", type=float, default=0.1)
    args = parser.parse_args()

    universities = read_universities(args.input)
    if args.only_university:
        needle = args.only_university.lower()
        universities = [row for row in universities if needle in row.get("University", "").lower()]
    if args.limit_universities is not None:
        universities = universities[: args.limit_universities]

    output_rows: list[dict[str, Any]] = []
    raw_rows: list[dict[str, Any]] = []
    rejected_rows: list[dict[str, Any]] = []
    seen_program_urls: set[str] = set()
    for index, university in enumerate(universities, start=1):
        sitemap_url = clean_string(university.get("Sitemap URL"))
        if not sitemap_url:
            print(f"Skipping {index}/{len(universities)}: {university.get('University')} has no sitemap")
            continue

        print(f"Crawling {index}/{len(universities)}: {university.get('University')} -> {sitemap_url}", flush=True)
        sitemap_entries = crawl_sitemaps(
            sitemap_url,
            max_sitemaps=args.max_sitemaps_per_university,
            max_urls=args.max_urls_per_university,
        )
        candidates = candidate_program_urls(sitemap_entries, args.min_score)
        candidates = candidates[: args.max_candidates_per_university]
        print(f"  URLs found: {len(sitemap_entries)}; candidates: {len(candidates)}", flush=True)

        for candidate in candidates:
            program_url = candidate["url"]
            if program_url in seen_program_urls:
                continue
            seen_program_urls.add(program_url)

            title = ""
            if args.fetch_titles:
                title = fetch_page_title(program_url)
                time.sleep(args.sleep)

            row = build_output_row(university, sitemap_url, candidate, title)
            raw_rows.append(row)

            rejection_reason = clean_degree_program_rejection_reason(
                program_url,
                title,
                candidate["score"],
            )
            if args.fetch_titles and rejection_reason:
                rejected_rows.append({**row, "Rejection Reason": rejection_reason})
                continue

            output_rows.append(row)

        write_csv(args.output, output_rows)
        write_csv(args.raw_output, raw_rows)
        write_csv(args.rejected_output, rejected_rows, REJECTED_COLUMNS)
        time.sleep(args.sleep)

    write_csv(args.output, output_rows)
    write_csv(args.raw_output, raw_rows)
    write_csv(args.rejected_output, rejected_rows, REJECTED_COLUMNS)
    print(f"Wrote {len(raw_rows)} raw candidates to {args.raw_output}")
    print(f"Wrote {len(output_rows)} clean degree-program URLs to {args.output}")
    print(f"Wrote {len(rejected_rows)} rejected candidates to {args.rejected_output}")
    return 0


def crawl_sitemaps(root_sitemap_url: str, max_sitemaps: int, max_urls: int) -> list[dict[str, str]]:
    pending = [root_sitemap_url]
    visited_sitemaps: set[str] = set()
    url_entries: list[dict[str, str]] = []

    while pending and len(visited_sitemaps) < max_sitemaps and len(url_entries) < max_urls:
        sitemap_url = pending.pop(0)
        if sitemap_url in visited_sitemaps:
            continue
        visited_sitemaps.add(sitemap_url)

        try:
            body = fetch_bytes(sitemap_url)
        except Exception as error:
            print(f"  Could not fetch sitemap {sitemap_url}: {error}", flush=True)
            continue

        sitemap_urls, page_urls = parse_sitemap(body)
        for child_sitemap in sitemap_urls:
            if child_sitemap not in visited_sitemaps and child_sitemap not in pending:
                pending.append(child_sitemap)
        for page_url in page_urls:
            url_entries.append({"url": page_url, "source_sitemap": sitemap_url})
            if len(url_entries) >= max_urls:
                break

    return url_entries


def parse_sitemap(body: bytes) -> tuple[list[str], list[str]]:
    text = decode_possible_gzip(body)
    try:
        root = ET.fromstring(text)
        root_tag = strip_namespace(root.tag).lower()
        locs = [
            clean_url(element.text)
            for element in root.iter()
            if strip_namespace(element.tag).lower() == "loc" and clean_url(element.text)
        ]
        if root_tag == "sitemapindex":
            return locs, []
        if root_tag == "urlset":
            return [], locs
        return [], locs
    except ET.ParseError:
        locs = [clean_url(match) for match in re.findall(r"<loc>\s*([^<]+)\s*</loc>", text, flags=re.I)]
        return [], [url for url in locs if url]


def candidate_program_urls(entries: list[dict[str, str]], min_score: int) -> list[dict[str, Any]]:
    candidates = []
    for entry in entries:
        url = entry["url"]
        score, matched_keywords = score_program_url(url)
        if score >= min_score:
            candidates.append(
                {
                    "url": url,
                    "source_sitemap": entry["source_sitemap"],
                    "score": score,
                    "matched_keywords": matched_keywords,
                }
            )
    candidates.sort(key=lambda item: (-item["score"], item["url"]))
    return candidates


def score_program_url(url: str) -> tuple[int, list[str]]:
    parsed = urlparse(url)
    haystack = unquote(f"{parsed.path} {parsed.query}").lower()
    matched = [keyword for keyword in POSITIVE_KEYWORDS if keyword in haystack]
    negatives = [keyword for keyword in NEGATIVE_KEYWORDS if keyword in haystack]

    if not any(pattern.search(haystack) for pattern in PROGRAM_PATH_PATTERNS):
        return 0, matched
    if not looks_like_program_detail_path(parsed.path):
        return 0, matched

    score = len(matched)
    score += sum(2 for keyword in HIGH_VALUE_KEYWORDS if keyword in haystack)
    score -= len(negatives) * 2

    path_segments = [segment for segment in parsed.path.split("/") if segment]
    if any(segment in {"de", "en"} for segment in path_segments):
        score += 1
    if len(path_segments) >= 3:
        score += 1
    if re.search(r"/(bachelor|master|studiengang|study-program|degree-program)[-/]", haystack):
        score += 2

    return score, matched


def looks_like_program_detail_path(path: str) -> bool:
    segments = [unquote(segment).lower() for segment in path.split("/") if segment]
    markers = {
        "studiengang",
        "studiengaenge",
        "studiengänge",
        "studienangebot",
        "studienfach",
        "studienfaecher",
        "studienfächer",
        "studienprogramm",
        "studienprogramme",
        "study-program",
        "study-programs",
        "study-programmes",
        "degree-program",
        "degree-programs",
        "degree-programmes",
    }
    for index, segment in enumerate(segments):
        if segment in markers:
            tail = segments[index + 1 :]
            if not tail:
                return False
            if len(tail) > 2:
                return False
            return True

    degree_segments = {"bachelor", "master", "staatsexamen", "phd", "doctoral"}
    for index, segment in enumerate(segments):
        if segment in degree_segments:
            tail = segments[index + 1 :]
            if len(tail) == 1:
                return True
            return False
    return False


def build_output_row(
    university: dict[str, str],
    sitemap_url: str,
    candidate: dict[str, Any],
    title: str,
) -> dict[str, Any]:
    program_url = candidate["url"]
    return {
        "University": university.get("University", ""),
        "University ID": university.get("University ID", ""),
        "Location": university.get("Location", ""),
        "State": university.get("State", ""),
        "Website URL": university.get("Website URL", ""),
        "Root Sitemap URL": sitemap_url,
        "Source Sitemap URL": candidate["source_sitemap"],
        "Program URL": program_url,
        "Program Name Guess": title or name_from_url(program_url),
        "Degree Level Guess": degree_level_guess(program_url, title),
        "Matched Keywords": ", ".join(candidate["matched_keywords"]),
        "Score": str(candidate["score"]),
    }


def is_clean_degree_program(url: str, title: str, score: int) -> bool:
    return not clean_degree_program_rejection_reason(url, title, score)


def clean_degree_program_rejection_reason(url: str, title: str, score: int) -> str:
    parsed = urlparse(url)
    path = unquote(parsed.path).lower()
    title_for_validation = html.unescape(clean_string(title))
    title_l = title_for_validation.lower()

    strict_path = any(pattern.search(path) for pattern in STRICT_PROGRAM_PATH_PATTERNS)
    title_has_degree = any(pattern.search(title_for_validation) for pattern in TITLE_DEGREE_PATTERNS)
    title_has_strong_degree = any(pattern.search(title_for_validation) for pattern in TITLE_STRONG_DEGREE_PATTERNS)
    title_bad = any(word in title_l for word in TITLE_NEGATIVE_KEYWORDS)
    module_path = any(hint in path for hint in MODULE_PATH_HINTS)

    if title_bad and not title_has_degree:
        return "title negative keyword without degree marker"

    if module_path and not title_has_strong_degree:
        return "department teaching/module path without strong degree marker"

    if strict_path:
        return ""

    if title_has_degree and score >= 6:
        return ""

    return "not a strict program path and title/score are not strong enough"


def fetch_page_title(url: str) -> str:
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return ""
            content_type = response.headers.get("content-type", "").lower()
            if "html" not in content_type:
                return ""
            body = response.read(180_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return ""

    parser = TitleParser()
    parser.feed(body)
    return clean_title(parser.h1 or parser.title)


def name_from_url(url: str) -> str:
    path = urlparse(url).path.strip("/")
    if not path:
        return ""
    segment = unquote(path.split("/")[-1])
    segment = re.sub(r"[-_]+", " ", segment)
    return clean_title(segment)


def degree_level_guess(url: str, title: str) -> str:
    haystack = f"{url} {title}"
    levels = [label for label, pattern in DEGREE_LEVEL_PATTERNS if pattern.search(haystack)]
    return ", ".join(dict.fromkeys(levels))


def read_universities(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [{key: clean_string(value) for key, value in row.items()} for row in csv.DictReader(handle)]


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str] | None = None) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames or OUTPUT_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


def fetch_bytes(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
        if response.status >= 400:
            raise RuntimeError(f"HTTP {response.status}")
        return response.read(5_000_000)


def decode_possible_gzip(body: bytes) -> str:
    if body.startswith(b"\x1f\x8b"):
        body = gzip.decompress(body)
    return body.decode("utf-8", errors="ignore")


def strip_namespace(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def clean_url(value: Any) -> str:
    return normalize_url(html.unescape(clean_string(value))).rstrip("/")


def normalize_url(url: str) -> str:
    if not url:
        return ""
    try:
        parsed = urlsplit(url)
    except ValueError:
        return url
    if not parsed.scheme or not parsed.netloc:
        return url

    path = quote(unquote(parsed.path), safe="/%:@!$&'()*+,;=")
    query = quote(unquote(parsed.query), safe="/%:@!$&'()*+,;=?")
    fragment = quote(unquote(parsed.fragment), safe="/%:@!$&'()*+,;=?")
    return urlunsplit((parsed.scheme, parsed.netloc, path, query, fragment))


def clean_string(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


def clean_title(value: str) -> str:
    title = html.unescape(clean_string(value))
    title = re.sub(r"\s+[-|]\s+.*$", "", title).strip()
    return title


class TitleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.h1 = ""
        self._capture: str | None = None
        self._parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"title", "h1"} and not getattr(self, tag, ""):
            self._capture = tag
            self._parts = []

    def handle_endtag(self, tag: str) -> None:
        if self._capture == tag:
            value = clean_string(" ".join(self._parts))
            if tag == "title":
                self.title = value
            elif tag == "h1":
                self.h1 = value
            self._capture = None
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._capture:
            self._parts.append(data)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
