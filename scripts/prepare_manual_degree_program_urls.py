#!/usr/bin/env python3
"""Normalize manually collected degree-program URLs into extractor input CSV.

The output is compatible with scripts/extract_degree_program_details_with_openai.py.
It accepts mostly-tab-separated files, but also tolerates accidental comma-separated
rows from spreadsheet/template copy-paste.
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path
from urllib.parse import urlparse


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "templateManual.tsv"
DEFAULT_OUTPUT = PROJECT_ROOT / "degree_program_urls_manual.csv"
DEFAULT_EXISTING_URLS = [
    PROJECT_ROOT / "degree_program_urls_dach.csv",
    PROJECT_ROOT / "degree_program_structured_dach.csv",
    PROJECT_ROOT / "degree_program_structured_dach.en.csv",
]

INPUT_COLUMNS = [
    "university_id",
    "university_name",
    "city",
    "state",
    "country",
    "program_url",
    "program_name_hint",
    "degree_level_hint",
    "source_note",
]

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


def main() -> int:
    parser = argparse.ArgumentParser(description="Prepare manually collected degree-program URLs.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--include-existing", action="store_true", help="Do not drop URLs already present in existing DACH files.")
    args = parser.parse_args()

    manual_rows = read_manual_rows(args.input)
    existing_urls = set() if args.include_existing else read_existing_urls(DEFAULT_EXISTING_URLS)
    output_rows: list[dict[str, str]] = []
    seen_urls: set[str] = set()
    skipped_placeholder = 0
    skipped_existing = 0
    skipped_duplicate = 0

    for row in manual_rows:
        program_url = clean(row.get("program_url", ""))
        if not is_real_url(program_url):
            skipped_placeholder += 1
            continue
        normalized_url = normalize_url(program_url)
        if normalized_url in seen_urls:
            skipped_duplicate += 1
            continue
        if normalized_url in existing_urls:
            skipped_existing += 1
            continue

        seen_urls.add(normalized_url)
        output_rows.append(build_output_row(row, normalized_url))

    write_csv(args.output, output_rows)
    print(f"Read {len(manual_rows)} manual rows from {args.input}")
    print(f"Wrote {len(output_rows)} new candidate URLs to {args.output}")
    print(f"Skipped placeholders/invalid: {skipped_placeholder}")
    print(f"Skipped duplicates in manual file: {skipped_duplicate}")
    print(f"Skipped already existing: {skipped_existing}")
    return 0


def read_manual_rows(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        lines = [line.rstrip("\n\r") for line in handle if line.strip()]

    for line_number, line in enumerate(lines, start=1):
        if line_number == 1:
            continue
        values = parse_manual_line(line)
        if len(values) < len(INPUT_COLUMNS):
            values = values + [""] * (len(INPUT_COLUMNS) - len(values))
        rows.append({column: clean(values[index]) for index, column in enumerate(INPUT_COLUMNS)})
    return rows


def parse_manual_line(line: str) -> list[str]:
    delimiter = "\t" if "\t" in line else ","
    return next(csv.reader([line], delimiter=delimiter))


def build_output_row(row: dict[str, str], program_url: str) -> dict[str, str]:
    website_url = origin_url(program_url)
    source_note = clean(row.get("source_note", ""))
    matched_keywords = "manual"
    if source_note:
        matched_keywords = f"manual, {source_note}"

    return {
        "University ID": clean(row.get("university_id", "")),
        "University": clean(row.get("university_name", "")),
        "Location": clean(row.get("city", "")),
        "State": clean(row.get("state", "")),
        "Website URL": website_url,
        "Root Sitemap URL": "",
        "Source Sitemap URL": "manual",
        "Program URL": program_url,
        "Program Name Guess": clean(row.get("program_name_hint", "")),
        "Degree Level Guess": normalize_degree_level(clean(row.get("degree_level_hint", ""))),
        "Matched Keywords": matched_keywords,
        "Score": "10",
    }


def read_existing_urls(paths: list[Path]) -> set[str]:
    urls: set[str] = set()
    for path in paths:
        if not path.exists():
            continue
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            for row in csv.DictReader(handle):
                url = row.get("Program URL", "")
                if is_real_url(url):
                    urls.add(normalize_url(url))
    return urls


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


def is_real_url(value: str) -> bool:
    value = clean(value)
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc) and "..." not in value


def normalize_url(value: str) -> str:
    return clean(value).rstrip("/")


def origin_url(value: str) -> str:
    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return ""
    return f"{parsed.scheme}://{parsed.netloc}"


def normalize_degree_level(value: str) -> str:
    normalized = value.lower()
    if "bachelor" in normalized or normalized in {"ba", "b.a.", "bsc", "b.sc."}:
        return "Bachelor"
    if "master" in normalized or normalized in {"ma", "m.a.", "msc", "m.sc.", "mba"}:
        return "Master"
    if "phd" in normalized or "doctor" in normalized or "promotion" in normalized:
        return "Doctorate"
    if "state" in normalized or "staatsexamen" in normalized:
        return "State Examination"
    if "certificate" in normalized or "zertifikat" in normalized:
        return "Certificate"
    return value


def clean(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


if __name__ == "__main__":
    raise SystemExit(main())
