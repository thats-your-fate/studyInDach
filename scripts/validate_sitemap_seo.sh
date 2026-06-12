#!/usr/bin/env bash
set -euo pipefail

SITEMAP_URL="${SITEMAP_URL:-https://studyindach.cc/sitemap.xml}"
CANONICAL_ORIGIN="${CANONICAL_ORIGIN:-https://studyindach.cc}"
SAMPLE_SIZE="${SAMPLE_SIZE:-25}"

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "Missing required command: $1" >&2
		exit 2
	fi
}

require_cmd python3

export SITEMAP_URL CANONICAL_ORIGIN SAMPLE_SIZE

python3 <<'PY'
import datetime
import html.parser
import os
import re
import sys
import urllib.parse
import urllib.request
from collections import Counter

sitemap_url = os.environ["SITEMAP_URL"]
canonical_origin = os.environ["CANONICAL_ORIGIN"].rstrip("/")
sample_size = int(os.environ["SAMPLE_SIZE"])

failures = Counter()
failure_details = []
visited_sitemaps = set()


class LocParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_loc = False
        self.locs = []

    def handle_starttag(self, tag, attrs):
        if tag.lower().endswith("loc"):
            self.in_loc = True

    def handle_endtag(self, tag):
        if tag.lower().endswith("loc"):
            self.in_loc = False

    def handle_data(self, data):
        if self.in_loc:
            value = data.strip()
            if value:
                self.locs.append(value)


def record(kind, message):
    failures[kind] += 1
    failure_details.append(f"[{kind}] {message}")


def fetch(url, accept="*/*"):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "StudyInDachSitemapValidator/1.0",
            "Accept": accept,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return response.status, response.headers, response.read()
    except Exception as exc:
        record("fetch_error", f"{url}: {exc}")
        return None, {}, b""


def parse_locs(xml_bytes, url):
    parser = LocParser()
    try:
        parser.feed(xml_bytes.decode("utf-8", errors="replace"))
    except Exception as exc:
        record("xml_parse", f"{url}: {exc}")
    return parser.locs


def validate_lastmods(xml_bytes, url):
    text = xml_bytes.decode("utf-8", errors="replace")
    for value in re.findall(r"<lastmod>([^<]+)</lastmod>", text):
        if not is_valid_lastmod(value.strip()):
            record("invalid_lastmod", f"{url}: {value.strip()}")


def is_valid_lastmod(value):
    if not value:
        return False
    try:
        if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            datetime.date.fromisoformat(value)
            return True
        datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
        return True
    except ValueError:
        return False


def collect_urls(url):
    if url in visited_sitemaps:
        return []
    visited_sitemaps.add(url)

    status, headers, body = fetch(url, "application/xml,text/xml;q=0.9,*/*;q=0.1")
    if status != 200:
        record("sitemap_http", f"{url}: HTTP {status}")
        return []

    content_type = headers.get("content-type", "").lower()
    if "xml" not in content_type and "text/plain" not in content_type and "octet-stream" not in content_type:
        record("sitemap_content_type", f"{url}: {headers.get('content-type', '')}")
    if b"localhost" in body:
        record("localhost", f"{url}: sitemap XML contains localhost")

    locs = parse_locs(body, url)
    validate_lastmods(body, url)
    sitemap_locs = [loc for loc in locs if urllib.parse.urlparse(loc).path.endswith(".xml")]
    page_locs = [loc for loc in locs if loc not in sitemap_locs]
    if b"<urlset" in body and not page_locs:
        record("empty_sitemap", f"{url}: sitemap URL set contains no page URLs")

    urls = []
    for loc in sitemap_locs:
        loc_url = urllib.parse.urlparse(loc)
        if f"{loc_url.scheme}://{loc_url.netloc}" != canonical_origin:
            record("non_canonical_sitemap", loc)
            continue
        if not loc_url.path.startswith("/sitemaps/"):
            record("bad_sitemap_path", loc)
            continue
        urls.extend(collect_urls(loc))
    urls.extend(page_locs)
    return urls


def validate_url_list(urls):
    clean = []
    seen = set()
    for url in urls:
        if url in seen:
            continue
        seen.add(url)
        parsed = urllib.parse.urlparse(url)
        if f"{parsed.scheme}://{parsed.netloc}" != canonical_origin:
            record("non_canonical_host", url)
            continue
        if parsed.fragment:
            record("fragment_url", url)
            continue
        if parsed.path.startswith("/admin"):
            record("admin_url", url)
            continue
        clean.append(url)
    return clean


def sample_urls(urls):
    return urls[:sample_size]


def validate_page(url):
    status, headers, body = fetch(url, "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1")
    if status != 200:
        record("page_http", f"{url}: HTTP {status}")
        return
    if not body.strip():
        record("empty_body", url)


all_urls = collect_urls(sitemap_url)
clean_urls = validate_url_list(all_urls)
for url in sample_urls(clean_urls):
    validate_page(url)

print("Sitemap SEO validation summary")
print(f"  sitemap: {sitemap_url}")
print(f"  total URLs: {len(set(all_urls))}")
print(f"  valid canonical URLs: {len(clean_urls)}")
print(f"  sampled URLs: {min(len(clean_urls), sample_size)}")
if failures:
    print("  failures by type:")
    for kind, count in sorted(failures.items()):
        print(f"    {kind}: {count}")
    print("  failure details:")
    for detail in failure_details[:50]:
        print(f"    {detail}")
    if len(failure_details) > 50:
        print(f"    ... {len(failure_details) - 50} more")
    sys.exit(1)

print("  failures by type: none")
PY
