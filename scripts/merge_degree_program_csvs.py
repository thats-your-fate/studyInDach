#!/usr/bin/env python3
"""Merge structured degree-program CSV files and dedupe by Program URL."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path
from typing import Any


def main() -> int:
    parser = argparse.ArgumentParser(description="Merge degree_program_structured CSV files.")
    parser.add_argument("--inputs", nargs="+", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--dedupe-column",
        default="Program URL",
        help="Column used as primary duplicate key. Defaults to Program URL.",
    )
    args = parser.parse_args()

    rows, fieldnames, skipped_duplicates = merge_csvs(args.inputs, args.dedupe_column)
    write_csv(args.output, rows, fieldnames)

    print(f"Inputs: {', '.join(str(path) for path in args.inputs)}")
    print(f"Wrote {len(rows)} rows to {args.output}")
    print(f"Skipped {skipped_duplicates} duplicate rows")
    return 0


def merge_csvs(paths: list[Path], dedupe_column: str) -> tuple[list[dict[str, str]], list[str], int]:
    fieldnames: list[str] | None = None
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    skipped_duplicates = 0

    for path in paths:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if not reader.fieldnames:
                raise ValueError(f"CSV has no header: {path}")
            if fieldnames is None:
                fieldnames = reader.fieldnames
            elif reader.fieldnames != fieldnames:
                raise ValueError(f"Column mismatch in {path}")

            for row in reader:
                key = duplicate_key(row, dedupe_column)
                if key in seen:
                    skipped_duplicates += 1
                    continue
                seen.add(key)
                rows.append({column: clean_string(row.get(column)) for column in fieldnames})

    if fieldnames is None:
        raise ValueError("No input files provided")
    return rows, fieldnames, skipped_duplicates


def duplicate_key(row: dict[str, Any], dedupe_column: str) -> str:
    primary = clean_string(row.get(dedupe_column)).lower()
    if primary:
        return f"{dedupe_column}:{primary}"
    fallback_parts = [
        clean_string(row.get("University ID")),
        clean_string(row.get("Program Name")),
        clean_string(row.get("Degree Level")),
        clean_string(row.get("Academic Degree")),
    ]
    return "fallback:" + "|".join(fallback_parts).lower()


def write_csv(path: Path, rows: list[dict[str, str]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(f"{path.suffix}.tmp")
    with tmp_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    tmp_path.replace(path)


def clean_string(value: Any) -> str:
    return " ".join(str(value or "").split()).strip()


if __name__ == "__main__":
    raise SystemExit(main())
