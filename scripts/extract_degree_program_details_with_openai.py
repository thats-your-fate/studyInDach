#!/usr/bin/env python3
"""
Extract structured degree-program details from candidate program URLs with OpenAI.

Reads degree_program_urls.csv, fetches each program page, asks OpenAI for a
strict JSON object, and writes a public-facing CSV plus a JSONL audit trail.

Setup:
  python3 -m pip install -r scripts/requirements.txt
  export OPENAI_API_KEY=...
  # or put OPENAI_API_KEY=... in .env at the project root

Examples:
  python3 scripts/extract_degree_program_details_with_openai.py --limit 5
  python3 scripts/extract_degree_program_details_with_openai.py --only-university bamberg --limit 10
  OPENAI_MODEL=gpt-4.1-mini python3 scripts/extract_degree_program_details_with_openai.py
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import os
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "degree_program_urls.csv"
DEFAULT_OUTPUT = PROJECT_ROOT / "degree_program_structured.csv"
DEFAULT_JSONL_OUTPUT = PROJECT_ROOT / "degree_program_structured.jsonl"

HTTP_TIMEOUT_SECONDS = 15
USER_AGENT = "studyInDach-degree-program-openai-extractor/1.0"
DEFAULT_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")

INPUT_COLUMNS_TO_KEEP = [
    "University ID",
    "University",
    "Location",
    "State",
    "Website URL",
    "Program URL",
]

DETAIL_COLUMNS = [
    "Program Name",
    "Degree Level",
    "Academic Degree",
    "Subject Area",
    "Language of Instruction",
    "Campus Location",
    "Duration",
    "ECTS",
    "Start Terms",
    "Application Deadlines",
    "Admission Requirements",
    "Tuition or Fees",
    "Study Mode",
    "Restricted Admission",
    "Application URL",
    "Contact Email",
    "Hero Image URL",
    "Summary",
]

OUTPUT_COLUMNS = INPUT_COLUMNS_TO_KEEP + DETAIL_COLUMNS

PROGRAM_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "program_name": {"type": "string"},
        "degree_level": {
            "type": "string",
            "enum": ["Bachelor", "Master", "State Examination", "Doctorate", "Certificate", "Other", "Unknown"],
        },
        "academic_degree": {"type": "string"},
        "subject_area": {"type": "string"},
        "language_of_instruction": {"type": "array", "items": {"type": "string"}},
        "campus_location": {"type": "string"},
        "duration": {"type": "string"},
        "ects": {"type": "string"},
        "start_terms": {"type": "array", "items": {"type": "string"}},
        "application_deadlines": {"type": "array", "items": {"type": "string"}},
        "admission_requirements": {"type": "array", "items": {"type": "string"}},
        "tuition_or_fees": {"type": "string"},
        "study_mode": {"type": "string"},
        "restricted_admission": {"type": "string", "enum": ["Yes", "No", "Unknown"]},
        "application_url": {"type": "string"},
        "contact_email": {"type": "string"},
        "hero_image_url": {"type": "string"},
        "summary": {"type": "string"},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "extraction_notes": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "program_name",
        "degree_level",
        "academic_degree",
        "subject_area",
        "language_of_instruction",
        "campus_location",
        "duration",
        "ects",
        "start_terms",
        "application_deadlines",
        "admission_requirements",
        "tuition_or_fees",
        "study_mode",
        "restricted_admission",
        "application_url",
        "contact_email",
        "hero_image_url",
        "summary",
        "confidence",
        "extraction_notes",
    ],
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract structured details from degree-program pages with OpenAI.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--jsonl-output", type=Path, default=DEFAULT_JSONL_OUTPUT)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--only-university", default="", help="Case-insensitive substring filter for one university.")
    parser.add_argument("--limit", type=int, default=None, help="Maximum rows to process after filtering/skipping.")
    parser.add_argument("--offset", type=int, default=0, help="Skip this many input rows after filtering.")
    parser.add_argument("--max-page-chars", type=int, default=28_000)
    parser.add_argument("--sleep", type=float, default=0.2)
    parser.add_argument("--overwrite", action="store_true", help="Reprocess URLs already present in the output CSV.")
    args = parser.parse_args()

    rows = read_csv(args.input)
    if args.only_university:
        needle = args.only_university.lower()
        rows = [row for row in rows if needle in row.get("University", "").lower()]
    if args.offset:
        rows = rows[args.offset :]
    if args.limit is not None:
        rows = rows[: args.limit]

    existing_rows = [] if args.overwrite else read_csv_if_exists(args.output)
    processed_urls = {row.get("Program URL", "") for row in existing_rows}

    client = None
    output_rows = [clean_public_row(row) for row in existing_rows if row.get("Program URL")]
    skipped = 0

    for index, source_row in enumerate(rows, start=1):
        program_url = source_row.get("Program URL", "")
        if not program_url:
            continue
        if program_url in processed_urls:
            skipped += 1
            continue

        print(f"[{index}/{len(rows)}] Fetching {program_url}", flush=True)
        page = fetch_readable_page(program_url, max_chars=args.max_page_chars)
        if not page["text"]:
            detail = empty_detail("low", ["Could not fetch readable HTML text from the program URL."])
        else:
            if client is None:
                client = make_openai_client()
            detail = extract_with_openai(client, args.model, source_row, page)

        output_row = build_output_row(source_row, detail)
        output_rows.append(output_row)
        processed_urls.add(program_url)
        append_jsonl(args.jsonl_output, {"source": source_row, "page": page, "detail": detail})
        write_csv(args.output, output_rows)
        time.sleep(args.sleep)

    write_csv(args.output, output_rows)
    print(f"Wrote {len(output_rows)} rows to {args.output}")
    if skipped:
        print(f"Skipped {skipped} already-processed URLs. Use --overwrite to reprocess.")
    return 0


def make_openai_client() -> Any:
    try:
        from openai import OpenAI
    except ImportError as error:
        raise RuntimeError("Missing dependency: run `python3 -m pip install -r scripts/requirements.txt`.") from error

    load_dotenv(Path(os.environ.get("EXTERNAL_ENV_FILE", "/home/yaro/project-env/studyInDach.env")))
    load_dotenv(PROJECT_ROOT / ".env")
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not set in the environment or project .env file.")
    return OpenAI()


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def extract_with_openai(client: Any, model: str, source_row: dict[str, str], page: dict[str, str]) -> dict[str, Any]:
    system_prompt = (
        "Extract polished, public-facing structured content about one university degree program from the supplied "
        "web page text. The CSV values will be rendered directly on a marketing page for prospective students. "
        "Use only facts present in the page text or obvious metadata supplied by the caller. Do not mention "
        "extraction, inference, page text, missing fields, confidence, or internal uncertainty in public fields. "
        "If a field is not present, use an empty string, an empty array, or Unknown. Use concise, student-friendly "
        "phrasing. Prefer the program page language for official names. For the summary, write one appealing "
        "sentence of 18-35 words without hype or unverifiable claims. "
        "For hero_image_url, choose the best absolute image URL from the provided images that appears to be the main "
        "or hero image for this degree program page. Prefer large content images over logos, icons, portraits, seals, "
        "tracking pixels, and decorative UI assets. If no suitable image is present, return an empty string."
    )
    user_payload = {
        "university": source_row.get("University", ""),
        "university_location": source_row.get("Location", ""),
        "state": source_row.get("State", ""),
        "program_url": source_row.get("Program URL", ""),
        "program_name_guess": source_row.get("Program Name Guess", ""),
        "degree_level_guess": source_row.get("Degree Level Guess", ""),
        "page_title": page.get("title", ""),
        "page_text": page.get("text", ""),
        "links": page.get("links", []),
        "images": page.get("images", []),
    }

    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "degree_program_detail",
                "strict": True,
                "schema": PROGRAM_SCHEMA,
            }
        },
    )
    return json.loads(response.output_text)


def fetch_readable_page(url: str, max_chars: int) -> dict[str, Any]:
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
            if response.status >= 400:
                return {"title": "", "text": "", "links": [], "images": [], "fetch_error": f"HTTP {response.status}"}
            content_type = response.headers.get("content-type", "").lower()
            if "html" not in content_type:
                return {"title": "", "text": "", "links": [], "images": [], "fetch_error": f"Non-HTML content type: {content_type}"}
            body = response.read(2_500_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError) as error:
        return {"title": "", "text": "", "links": [], "images": [], "fetch_error": str(error)}

    parser = ReadableHTMLParser(url)
    parser.feed(body)
    text = clean_page_text(parser.text)
    return {
        "title": clean_string(parser.title),
        "text": text[:max_chars],
        "links": parser.links[:80],
        "images": parser.images[:80],
        "fetch_error": "",
    }


class ReadableHTMLParser(HTMLParser):
    def __init__(self, base_url: str) -> None:
        super().__init__()
        self.base_url = base_url
        self.title = ""
        self.links: list[dict[str, str]] = []
        self.images: list[dict[str, str]] = []
        self._parts: list[str] = []
        self._tag_stack: list[str] = []
        self._capture_title = False
        self._current_link: str | None = None
        self._current_link_text: list[str] = []

    @property
    def text(self) -> str:
        return " ".join(self._parts)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self._tag_stack.append(tag)
        attrs_dict = {key.lower(): value or "" for key, value in attrs}
        if tag == "title":
            self._capture_title = True
        if tag == "a" and attrs_dict.get("href"):
            self._current_link = urljoin(self.base_url, attrs_dict["href"])
            self._current_link_text = []
        if tag == "img":
            image = image_from_attrs(self.base_url, attrs_dict)
            if image:
                self.images.append(image)
        if tag == "meta" and attrs_dict.get("content"):
            meta_name = (attrs_dict.get("property") or attrs_dict.get("name") or "").lower()
            if meta_name in {"og:image", "twitter:image", "twitter:image:src"}:
                self.images.append(
                    {
                        "url": urljoin(self.base_url, attrs_dict["content"]),
                        "alt": clean_string(attrs_dict.get("alt", ""))[:160],
                        "class": meta_name,
                        "width": "",
                        "height": "",
                    }
                )
        if tag in {"h1", "h2", "h3", "p", "li", "td", "th", "dt", "dd"}:
            self._parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._capture_title = False
        if tag == "a" and self._current_link:
            label = clean_string(" ".join(self._current_link_text))
            if label and is_useful_link(label, self._current_link):
                self.links.append({"text": label[:120], "url": self._current_link})
            self._current_link = None
            self._current_link_text = []
        while self._tag_stack and self._tag_stack[-1] != tag:
            self._tag_stack.pop()
        if self._tag_stack:
            self._tag_stack.pop()

    def handle_data(self, data: str) -> None:
        if any(tag in {"script", "style", "noscript", "svg"} for tag in self._tag_stack):
            return
        value = clean_string(data)
        if not value:
            return
        if self._capture_title:
            self.title = clean_string(f"{self.title} {value}")
        if self._current_link is not None:
            self._current_link_text.append(value)
        self._parts.append(value)


def is_useful_link(label: str, url: str) -> bool:
    haystack = f"{label} {url}".lower()
    useful_terms = [
        "apply",
        "application",
        "bewerbung",
        "zulassung",
        "admission",
        "deadline",
        "frist",
        "contact",
        "kontakt",
        "studienberatung",
        "module",
        "modul",
        "examination",
        "prüfung",
    ]
    return any(term in haystack for term in useful_terms) or "mailto:" in url


def image_from_attrs(base_url: str, attrs: dict[str, str]) -> dict[str, str] | None:
    src = attrs.get("src") or attrs.get("data-src") or attrs.get("data-lazy-src")
    if not src and attrs.get("srcset"):
        src = attrs["srcset"].split(",", 1)[0].strip().split(" ", 1)[0]
    if not src:
        return None

    url = urljoin(base_url, src)
    haystack = " ".join(
        [
            url,
            attrs.get("alt", ""),
            attrs.get("class", ""),
            attrs.get("id", ""),
            attrs.get("width", ""),
            attrs.get("height", ""),
        ]
    ).lower()
    if any(
        skip in haystack
        for skip in ["logo", "icon", "sprite", "avatar", "favicon", "tracking", "pixel", "matomo", "piwik", ".svg"]
    ):
        return None

    return {
        "url": url,
        "alt": clean_string(attrs.get("alt", ""))[:160],
        "class": clean_string(attrs.get("class", ""))[:160],
        "width": clean_string(attrs.get("width", "")),
        "height": clean_string(attrs.get("height", "")),
    }


def clean_page_text(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"[ \t\r\f\v]+", " ", value)
    value = re.sub(r"\n\s+", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def empty_detail(confidence: str, notes: list[str]) -> dict[str, Any]:
    return {
        "program_name": "",
        "degree_level": "Unknown",
        "academic_degree": "",
        "subject_area": "",
        "language_of_instruction": [],
        "campus_location": "",
        "duration": "",
        "ects": "",
        "start_terms": [],
        "application_deadlines": [],
        "admission_requirements": [],
        "tuition_or_fees": "",
        "study_mode": "",
        "restricted_admission": "Unknown",
        "application_url": "",
        "contact_email": "",
        "hero_image_url": "",
        "summary": "",
        "confidence": confidence,
        "extraction_notes": notes,
    }


def build_output_row(source_row: dict[str, str], detail: dict[str, Any]) -> dict[str, str]:
    row = {column: source_row.get(column, "") for column in INPUT_COLUMNS_TO_KEEP}
    row.update(
        {
            "Program Name": stringify(detail.get("program_name")),
            "Degree Level": stringify(detail.get("degree_level")),
            "Academic Degree": stringify(detail.get("academic_degree")),
            "Subject Area": stringify(detail.get("subject_area")),
            "Language of Instruction": stringify(detail.get("language_of_instruction")),
            "Campus Location": stringify(detail.get("campus_location")),
            "Duration": stringify(detail.get("duration")),
            "ECTS": stringify(detail.get("ects")),
            "Start Terms": stringify(detail.get("start_terms")),
            "Application Deadlines": stringify(detail.get("application_deadlines")),
            "Admission Requirements": stringify(detail.get("admission_requirements")),
            "Tuition or Fees": stringify(detail.get("tuition_or_fees")),
            "Study Mode": stringify(detail.get("study_mode")),
            "Restricted Admission": stringify(detail.get("restricted_admission")),
            "Application URL": stringify(detail.get("application_url")),
            "Contact Email": stringify(detail.get("contact_email")),
            "Hero Image URL": stringify(detail.get("hero_image_url")),
            "Summary": stringify(detail.get("summary")),
        }
    )
    return clean_public_row(row)


def clean_public_row(row: dict[str, str]) -> dict[str, str]:
    cleaned = {key: clean_public_value(value) for key, value in row.items()}
    if cleaned.get("Restricted Admission") not in {"Yes", "No", "Unknown", ""}:
        cleaned["Restricted Admission"] = "Unknown"
    return cleaned


def clean_public_value(value: str) -> str:
    value = clean_string(value)
    replacements = {
        "Details found under Zulassung und Einschreibung link": "See the university page for admission details.",
        "Details found under": "See the university page for details.",
        "Nicht explizit angegeben, frist- und formgerechte Bewerbung erforderlich": (
            "Submit the application by the university's current deadline."
        ),
        "Nicht explizit angegeben": "",
        "not explicitly stated": "",
        "Not explicitly stated": "",
        "not specified": "",
        "Not specified": "",
        "inferred": "",
        "Inferred": "",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = re.sub(r"\s*;\s*;", ";", value)
    value = re.sub(r"\s+\.", ".", value)
    return clean_string(value).strip("; ")


def stringify(value: Any) -> str:
    if isinstance(value, list):
        return "; ".join(str(item).strip() for item in value if str(item).strip())
    return clean_string(value)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [{key: clean_string(value) for key, value in row.items()} for row in csv.DictReader(handle)]


def read_csv_if_exists(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    return read_csv(path)


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


def append_jsonl(path: Path, row: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def clean_string(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
