#!/usr/bin/env python3
"""
Localize degree_program_structured.csv into SEO/user-facing locale CSVs.

The source CSV remains canonical. This script keeps official fields such as
Program Name, URLs, ECTS, email, and degree abbreviations intact, and adds a
Localized Program Name column for each target locale.

Setup:
  python3 -m pip install -r scripts/requirements.txt
  export OPENAI_API_KEY=...
  # or put OPENAI_API_KEY=... in .env at the project root

Examples:
  python3 scripts/localize_degree_program_csv_with_openai.py --limit 5
  python3 scripts/localize_degree_program_csv_with_openai.py --locales en es pt
  python3 scripts/localize_degree_program_csv_with_openai.py --overwrite
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "degree_program_structured.csv"
DEFAULT_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
DEFAULT_LOCALES = ["en", "es", "pt"]

LOCALE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "pt": "Portuguese",
}

LOCALE_STYLE_GUIDE = {
    "en": {
        "language": "English",
        "yes": "Yes",
        "no": "No",
        "unknown": "Unknown",
        "full_time": "Full Time",
        "part_time": "Part Time",
        "online": "Online",
        "german": "German",
        "english": "English",
        "winter": "Winter semester",
        "summer": "Summer semester",
    },
    "es": {
        "language": "Spanish",
        "yes": "Sí",
        "no": "No",
        "unknown": "No especificado",
        "full_time": "Tiempo completo",
        "part_time": "Tiempo parcial",
        "online": "En línea",
        "german": "Alemán",
        "english": "Inglés",
        "winter": "Semestre de invierno",
        "summer": "Semestre de verano",
    },
    "pt": {
        "language": "Portuguese",
        "yes": "Sim",
        "no": "Não",
        "unknown": "Não especificado",
        "full_time": "Tempo integral",
        "part_time": "Tempo parcial",
        "online": "Online",
        "german": "Alemão",
        "english": "Inglês",
        "winter": "Semestre de inverno",
        "summer": "Semestre de verão",
    },
}

STUDY_FIELDS = [
    "Natural Sciences",
    "Engineering & Technology",
    "Computer Science & Data",
    "Business & Economics",
    "Law & Public Policy",
    "Medicine & Health",
    "Education & Teaching",
    "Humanities",
    "Social Sciences",
    "Arts & Design",
    "Architecture & Built Environment",
    "Language & Cultural Studies",
    "Religion & Theology",
    "Environmental & Sustainability Studies",
    "Mathematics & Statistics",
    "Interdisciplinary",
    "Other",
]

INTERNATIONAL_STUDENT_FIT = ["High", "Medium", "Low", "Unknown"]
ONLINE_OR_ON_CAMPUS = ["Online", "On Campus", "Hybrid", "Unknown"]
FULL_TIME_OR_PART_TIME = ["Full Time", "Part Time", "Both", "Unknown"]
APPLICATION_DIFFICULTY = ["Open Admission", "Restricted Admission", "Aptitude Assessment", "Competitive", "Unknown"]
TUITION_TYPE = ["No Tuition / Semester Fee Only", "Tuition Fee", "Module Fee", "Unknown"]
WORK_EXPERIENCE_REQUIRED = ["Yes", "No", "Unknown"]
METADATA_CONFIDENCE = ["High", "Medium", "Low"]

TRANSLATABLE_COLUMNS = [
    "Subject Area",
    "Language of Instruction",
    "Campus Location",
    "Duration",
    "Start Terms",
    "Application Deadlines",
    "Admission Requirements",
    "Tuition or Fees",
    "Study Mode",
    "Restricted Admission",
    "Summary",
]

LOCALIZED_SCHEMA: dict[str, Any] = {
    "type": "object",
    "additionalProperties": False,
    "properties": {
        "localized_program_name": {"type": "string"},
        "subject_area": {"type": "string"},
        "language_of_instruction": {"type": "string"},
        "campus_location": {"type": "string"},
        "duration": {"type": "string"},
        "start_terms": {"type": "string"},
        "application_deadlines": {"type": "string"},
        "admission_requirements": {"type": "string"},
        "tuition_or_fees": {"type": "string"},
        "study_mode": {"type": "string"},
        "restricted_admission": {"type": "string"},
        "summary": {"type": "string"},
        "study_field": {"type": "string", "enum": STUDY_FIELDS},
        "secondary_study_field": {"type": "string", "enum": STUDY_FIELDS},
        "seo_title": {"type": "string"},
        "seo_description": {"type": "string"},
        "seo_keywords": {"type": "array", "items": {"type": "string"}},
        "search_intent_tags": {"type": "array", "items": {"type": "string"}},
        "career_outcomes": {"type": "array", "items": {"type": "string"}},
        "skills_you_will_learn": {"type": "array", "items": {"type": "string"}},
        "program_highlights": {"type": "array", "items": {"type": "string"}},
        "target_audience": {"type": "string"},
        "best_for": {"type": "string"},
        "international_student_fit": {"type": "string", "enum": INTERNATIONAL_STUDENT_FIT},
        "online_or_on_campus": {"type": "string", "enum": ONLINE_OR_ON_CAMPUS},
        "full_time_or_part_time": {"type": "string", "enum": FULL_TIME_OR_PART_TIME},
        "application_difficulty": {"type": "string", "enum": APPLICATION_DIFFICULTY},
        "tuition_type": {"type": "string", "enum": TUITION_TYPE},
        "work_experience_required": {"type": "string", "enum": WORK_EXPERIENCE_REQUIRED},
        "metadata_confidence": {"type": "string", "enum": METADATA_CONFIDENCE},
        "metadata_notes": {"type": "string"},
    },
    "required": [
        "localized_program_name",
        "subject_area",
        "language_of_instruction",
        "campus_location",
        "duration",
        "start_terms",
        "application_deadlines",
        "admission_requirements",
        "tuition_or_fees",
        "study_mode",
        "restricted_admission",
        "summary",
        "study_field",
        "secondary_study_field",
        "seo_title",
        "seo_description",
        "seo_keywords",
        "search_intent_tags",
        "career_outcomes",
        "skills_you_will_learn",
        "program_highlights",
        "target_audience",
        "best_for",
        "international_student_fit",
        "online_or_on_campus",
        "full_time_or_part_time",
        "application_difficulty",
        "tuition_type",
        "work_experience_required",
        "metadata_confidence",
        "metadata_notes",
    ],
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Localize structured degree-program CSV rows with OpenAI.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--locales", nargs="+", default=DEFAULT_LOCALES, choices=sorted(LOCALE_NAMES))
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--sleep", type=float, default=0.1)
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    source_rows = read_csv(args.input)
    if args.offset:
        source_rows = source_rows[args.offset :]
    if args.limit is not None:
        source_rows = source_rows[: args.limit]

    client = make_openai_client()
    for locale in args.locales:
        output_path = localized_output_path(args.input, locale)
        output_rows = [] if args.overwrite else read_csv_if_exists(output_path)
        processed_urls = {row.get("Program URL", "") for row in output_rows}
        pending_rows = [row for row in source_rows if row.get("Program URL", "") and row.get("Program URL", "") not in processed_urls]
        batch_size = max(1, args.batch_size)

        for start in range(0, len(pending_rows), batch_size):
            batch = pending_rows[start : start + batch_size]
            end = min(start + len(batch), len(pending_rows))
            names = ", ".join(row.get("Program Name", "") for row in batch[:3])
            if len(batch) > 3:
                names += ", ..."
            print(f"[{locale} {end}/{len(pending_rows)} pending] {names}", flush=True)
            localized_by_url = localize_rows(client, args.model, locale, batch)
            for row in batch:
                program_url = row.get("Program URL", "")
                localized = localized_by_url.get(program_url)
                if not localized:
                    print(f"Warning: missing localized row for {program_url}", file=sys.stderr)
                    continue
                output_rows.append(build_output_row(row, locale, localized))
                processed_urls.add(program_url)
            write_csv(output_path, output_rows, localized_fieldnames(row))
            time.sleep(args.sleep)

        write_csv(output_path, output_rows, localized_fieldnames(source_rows[0] if source_rows else {}))
        print(f"Wrote {len(output_rows)} rows to {output_path}")

    return 0


def make_openai_client() -> Any:
    try:
        from openai import OpenAI
    except ImportError as error:
        raise RuntimeError("Missing dependency: run `python3 -m pip install -r scripts/requirements.txt`.") from error

    load_dotenv(PROJECT_ROOT / ".env")
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not set in the environment or project .env file.")
    return OpenAI()


def localize_row(client: Any, model: str, locale: str, row: dict[str, str]) -> dict[str, str]:
    return localize_rows(client, model, locale, [row]).get(row.get("Program URL", ""), {})


def localize_rows(client: Any, model: str, locale: str, rows: list[dict[str, str]]) -> dict[str, dict[str, str]]:
    language = LOCALE_NAMES[locale]
    style = LOCALE_STYLE_GUIDE[locale]
    system_prompt = (
        f"Localize structured university degree-program marketing content into {language}. "
        "Return polished, public-facing copy for prospective international students. "
        "Translate the program title into a natural SEO-friendly localized title, but do not invent a new official "
        "degree name. Preserve degree abbreviations and credentials such as B.A., B.Sc., M.A., M.Sc., M.Ed., ECTS, "
        "URLs, emails, university names, and numbers. Keep empty fields empty. Keep summaries concise and factual. "
        "Do not add facts that are not present. Avoid bilingual artifacts: outside official names, degree "
        "abbreviations, university names, URLs, emails, and legal terms that should remain official, every public "
        f"text field must read naturally in {language}. Normalize enum-like values instead of mixing German and "
        f"English source terms. Use these conventions: Yes={style['yes']}, No={style['no']}, "
        f"Unknown={style['unknown']}, German={style['german']}, English={style['english']}, "
        f"Full-time={style['full_time']}, Part-time={style['part_time']}, Online={style['online']}, "
        f"Winter semester={style['winter']}, Summer semester={style['summer']}. "
        "If the source contains duplicated concepts in multiple languages, output one clean localized version only. "
        "Use semicolon-separated lists where the source is list-like. Also produce an SEO and filtering metadata "
        "layer. Controlled metadata must use exactly one of the allowed enum values. SEO fields should support "
        "long-tail search pages but must not invent rankings, scholarships, visa benefits, salaries, accreditation, "
        "guaranteed employment, or facts absent from the row. Career outcomes and skills may be generic possibilities "
        "based on the subject area, phrased carefully rather than as promises. Keep SEO titles under 70 characters "
        "where possible and SEO descriptions under 160 characters where possible."
    )
    payload = [
        {
            "official_program_name": row.get("Program Name", ""),
            "degree_level": row.get("Degree Level", ""),
            "academic_degree": row.get("Academic Degree", ""),
            "university": row.get("University", ""),
            "location": row.get("Location", ""),
            "state": row.get("State", ""),
            "program_url": row.get("Program URL", ""),
            "fields": {column: row.get(column, "") for column in TRANSLATABLE_COLUMNS},
        }
        for row in rows
    ]
    localized_item_schema = dict(LOCALIZED_SCHEMA)
    localized_item_schema["properties"] = {
        "program_url": {"type": "string"},
        **LOCALIZED_SCHEMA["properties"],
    }
    localized_item_schema["required"] = ["program_url", *LOCALIZED_SCHEMA["required"]]
    batch_schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "rows": {
                "type": "array",
                "items": localized_item_schema,
            }
        },
        "required": ["rows"],
    }

    response = client.responses.create(
        model=model,
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        text={
            "format": {
                "type": "json_schema",
                "name": "localized_degree_program_batch",
                "strict": True,
                "schema": batch_schema,
            }
        },
    )
    parsed = json.loads(response.output_text)
    return {
        clean_string(item.get("program_url")): item
        for item in parsed.get("rows", [])
        if clean_string(item.get("program_url"))
    }


def build_output_row(source: dict[str, str], locale: str, localized: dict[str, str]) -> dict[str, str]:
    output = dict(source)
    output["Locale"] = locale
    output["Localized Program Name"] = clean_localized_value(locale, "Localized Program Name", localized.get("localized_program_name"))
    output["Subject Area"] = clean_localized_value(locale, "Subject Area", localized.get("subject_area"))
    output["Language of Instruction"] = clean_localized_value(locale, "Language of Instruction", localized.get("language_of_instruction"))
    output["Campus Location"] = clean_localized_value(locale, "Campus Location", localized.get("campus_location"))
    output["Duration"] = clean_localized_value(locale, "Duration", localized.get("duration"))
    output["Start Terms"] = clean_localized_value(locale, "Start Terms", localized.get("start_terms"))
    output["Application Deadlines"] = clean_localized_value(locale, "Application Deadlines", localized.get("application_deadlines"))
    output["Admission Requirements"] = clean_localized_value(locale, "Admission Requirements", localized.get("admission_requirements"))
    output["Tuition or Fees"] = clean_localized_value(locale, "Tuition or Fees", localized.get("tuition_or_fees"))
    output["Study Mode"] = clean_localized_value(locale, "Study Mode", localized.get("study_mode"))
    output["Restricted Admission"] = clean_localized_value(locale, "Restricted Admission", localized.get("restricted_admission"))
    output["Summary"] = clean_localized_value(locale, "Summary", localized.get("summary"))
    output["Study Field"] = clean_enum(localized.get("study_field"), STUDY_FIELDS, "Other")
    output["Secondary Study Field"] = clean_enum(localized.get("secondary_study_field"), STUDY_FIELDS, "Other")
    output["SEO Title"] = clean_localized_value(locale, "SEO Title", localized.get("seo_title"))
    output["SEO Description"] = clean_localized_value(locale, "SEO Description", localized.get("seo_description"))
    output["SEO Keywords"] = stringify_list(localized.get("seo_keywords"))
    output["Search Intent Tags"] = stringify_list(localized.get("search_intent_tags"))
    output["Career Outcomes"] = stringify_list(localized.get("career_outcomes"))
    output["Skills You Will Learn"] = stringify_list(localized.get("skills_you_will_learn"))
    output["Program Highlights"] = stringify_list(localized.get("program_highlights"))
    output["Target Audience"] = clean_localized_value(locale, "Target Audience", localized.get("target_audience"))
    output["Best For"] = clean_localized_value(locale, "Best For", localized.get("best_for"))
    output["International Student Fit"] = clean_enum(localized.get("international_student_fit"), INTERNATIONAL_STUDENT_FIT, "Unknown")
    output["Online or On Campus"] = clean_enum(localized.get("online_or_on_campus"), ONLINE_OR_ON_CAMPUS, "Unknown")
    output["Full Time or Part Time"] = clean_enum(localized.get("full_time_or_part_time"), FULL_TIME_OR_PART_TIME, "Unknown")
    output["Application Difficulty"] = clean_enum(localized.get("application_difficulty"), APPLICATION_DIFFICULTY, "Unknown")
    output["Tuition Type"] = clean_enum(localized.get("tuition_type"), TUITION_TYPE, "Unknown")
    output["Work Experience Required"] = clean_enum(localized.get("work_experience_required"), WORK_EXPERIENCE_REQUIRED, "Unknown")
    output["Metadata Confidence"] = clean_enum(localized.get("metadata_confidence"), METADATA_CONFIDENCE, "Low")
    output["Metadata Notes"] = clean_string(localized.get("metadata_notes"))
    return output


def clean_localized_value(locale: str, column: str, value: Any) -> str:
    value = clean_string(value)
    if not value:
        return ""

    style = LOCALE_STYLE_GUIDE[locale]
    enumish_columns = {"Language of Instruction", "Study Mode", "Start Terms", "Restricted Admission"}
    if column in enumish_columns:
        replacements = {
            "Yes": style["yes"],
            "No": style["no"],
            "Unknown": style["unknown"],
            "Not specified": style["unknown"],
            "German": style["german"],
            "Deutsch": style["german"],
            "English": style["english"],
            "Englisch": style["english"],
            "Full-time": style["full_time"],
            "full-time": style["full_time"],
            "Vollzeit": style["full_time"],
            "Vollzeitstudium": style["full_time"],
            "Part-time": style["part_time"],
            "part-time": style["part_time"],
            "Teilzeit": style["part_time"],
            "Teilzeitstudium": style["part_time"],
            "Online": style["online"],
            "online": style["online"],
            "Wintersemester": style["winter"],
            "Winter semester": style["winter"],
            "winter semester": style["winter"],
            "Sommersemester": style["summer"],
            "Summer semester": style["summer"],
            "summer semester": style["summer"],
        }

        for source, replacement in replacements.items():
            value = replace_tokenish(value, source, replacement)

    if column == "Restricted Admission":
        lowered = value.lower()
        if lowered in {"yes", "ja", "sí", "si", "sim"}:
            return style["yes"]
        if lowered in {"no", "nein", "não", "nao"}:
            return style["no"]
        if lowered in {"unknown", "unbekannt", "no especificado", "não especificado", "nao especificado"}:
            return style["unknown"]

    value = value.replace(" ;", ";").replace("; ", "; ")
    return clean_string(value).strip("; ")


def replace_tokenish(value: str, source: str, replacement: str) -> str:
    if source not in value:
        return value
    pieces = [piece.strip() for piece in value.split(";")]
    replaced_pieces = [replacement if piece == source else piece.replace(source, replacement) for piece in pieces]
    return "; ".join(piece for piece in replaced_pieces if piece)


def stringify_list(value: Any) -> str:
    if isinstance(value, list):
        return "; ".join(clean_string(item) for item in value if clean_string(item))
    return clean_string(value)


def clean_enum(value: Any, allowed: list[str], fallback: str) -> str:
    value = clean_string(value)
    return value if value in allowed else fallback


def localized_fieldnames(row: dict[str, str]) -> list[str]:
    fieldnames = list(row.keys())
    metadata_columns = [
        "Study Field",
        "Secondary Study Field",
        "SEO Title",
        "SEO Description",
        "SEO Keywords",
        "Search Intent Tags",
        "Career Outcomes",
        "Skills You Will Learn",
        "Program Highlights",
        "Target Audience",
        "Best For",
        "International Student Fit",
        "Online or On Campus",
        "Full Time or Part Time",
        "Application Difficulty",
        "Tuition Type",
        "Work Experience Required",
        "Metadata Confidence",
        "Metadata Notes",
    ]
    if "Locale" not in fieldnames:
        fieldnames.insert(0, "Locale")
    if "Localized Program Name" not in fieldnames:
        program_index = fieldnames.index("Program Name") if "Program Name" in fieldnames else len(fieldnames) - 1
        fieldnames.insert(program_index + 1, "Localized Program Name")
    for column in metadata_columns:
        if column not in fieldnames:
            fieldnames.append(column)
    return fieldnames


def localized_output_path(input_path: Path, locale: str) -> Path:
    return input_path.with_name(f"{input_path.stem}.{locale}{input_path.suffix}")


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [{key: clean_string(value) for key, value in row.items()} for row in csv.DictReader(handle)]


def read_csv_if_exists(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    return read_csv(path)


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


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


def clean_string(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1)
