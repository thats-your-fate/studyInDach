#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const { spawnSync } = require("node:child_process")
const { loadExternalEnv } = require("./load-external-env.cjs")

loadExternalEnv()

const args = new Set(process.argv.slice(2))
const onlyIfPlesk = args.has("--if-plesk")
const optional = args.has("--optional")
const MAX_SITEMAP_URLS = 50000
const MAX_SITEMAP_BYTES = 50 * 1024 * 1024

const canonicalBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://studyindach.cc")
const outputDir = resolveOutputDir()
const sitemapBaseUrl = normalizeSitemapBaseUrl(process.env.SITEMAP_BASE_URL, canonicalBaseUrl)

try {
	main()
} catch (error) {
	if (!optional) throw error
	console.warn(`[sitemap:publish] skipped: ${error instanceof Error ? error.message : error}`)
}

function main() {
	if (!outputDir) {
		if (onlyIfPlesk) {
			console.log("[sitemap:publish] no Plesk public document root found; skipping")
			return
		}
		throw new Error(
			"Could not find a sitemap output directory. Set SITEMAP_OUTPUT_DIR or run from the app root.",
		)
	}

	fs.mkdirSync(outputDir, { recursive: true })

	const result = spawnSync(process.execPath, ["scripts/generate-sitemaps.cjs", "--out-dir", outputDir], {
		cwd: process.cwd(),
		env: {
			...process.env,
			NEXT_PUBLIC_SITE_URL: canonicalBaseUrl,
			SITEMAP_BASE_URL: sitemapBaseUrl,
		},
		stdio: "inherit",
	})

	if (result.error) throw result.error
	if (result.status !== 0) throw new Error(`Sitemap generation failed with exit code ${result.status}`)
	validateGeneratedSitemaps(outputDir)

	fs.writeFileSync(
		path.join(outputDir, "robots.txt"),
		[
			"User-agent: *",
			"Allow: /",
			`Sitemap: ${new URL("/sitemap.xml", sitemapBaseUrl).toString()}`,
			"",
		].join("\n"),
		"utf8",
	)

	console.log(`Published sitemap XML files to ${outputDir}`)
	console.log(`Sitemap index: ${new URL("/sitemap.xml", sitemapBaseUrl).toString()}`)
}

function resolveOutputDir() {
	if (process.env.SITEMAP_OUTPUT_DIR) return path.resolve(process.env.SITEMAP_OUTPUT_DIR)
	if (!onlyIfPlesk) return path.join(process.cwd(), "public")

	const cwd = process.cwd()
	const hostname = new URL(canonicalBaseUrl).hostname.replace(/^www\./, "")
	const candidates = []
	let current = cwd

	for (let depth = 0; depth < 6; depth += 1) {
		const base = path.basename(current)
		const parent = path.dirname(current)

		if (base === "httpdocs") candidates.push(path.join(current, "public"))
		if (base === hostname) candidates.push(path.join(current, "httpdocs", "public"))

		if (parent === current) break
		current = parent
	}

	return dedupe(candidates).find((candidate) => looksLikePleskPublicDir(candidate, hostname))
}

function looksLikePleskPublicDir(candidate, hostname) {
	const normalized = path.normalize(candidate)
	const parts = normalized.split(path.sep).filter(Boolean)
	return (
		parts.includes("vhosts") &&
		parts.includes(hostname) &&
		path.basename(normalized) === "public" &&
		path.basename(path.dirname(normalized)) === "httpdocs" &&
		fs.existsSync(normalized) &&
		fs.statSync(normalized).isDirectory()
	)
}

function normalizeBaseUrl(value, fallback) {
	try {
		const url = new URL(value || fallback)
		url.pathname = url.pathname.replace(/\/+$/, "")
		url.search = ""
		url.hash = ""
		return url.toString().replace(/\/$/, "")
	} catch {
		return fallback
	}
}

function normalizeSitemapBaseUrl(value, fallback) {
	const normalized = normalizeBaseUrl(value, fallback)
	try {
		const url = new URL(normalized)
		const canonicalUrl = new URL(canonicalBaseUrl)
		if (url.protocol !== "https:" || url.hostname !== canonicalUrl.hostname) return canonicalBaseUrl
		return normalized
	} catch {
		return canonicalBaseUrl
	}
}

function validateGeneratedSitemaps(dir) {
	const indexPath = path.join(dir, "sitemap.xml")
	if (!fs.existsSync(indexPath)) throw new Error("Generated sitemap index is missing")
	const indexXml = fs.readFileSync(indexPath, "utf8")
	validateSitemapIndexXml(indexXml)
	for (const loc of extractSitemapLocs(indexXml)) {
		const url = new URL(loc)
		const filePath = path.join(dir, url.pathname.replace(/^\/+/, ""))
		if (!fs.existsSync(filePath)) throw new Error(`Sitemap index references missing file: ${url.pathname}`)
		validateUrlSetXml(fs.readFileSync(filePath, "utf8"), url)
	}
}

function validateSitemapIndexXml(xml) {
	const locs = extractSitemapLocs(xml)
	if (locs.length === 0) throw new Error("Sitemap index does not contain child sitemap <loc> entries")
	for (const loc of locs) {
		const url = new URL(loc)
		if (url.origin !== canonicalBaseUrl) throw new Error(`Sitemap index contains non-canonical child URL: ${loc}`)
		if (!url.pathname.startsWith("/sitemaps/") || !url.pathname.endsWith(".xml")) {
			throw new Error(`Sitemap index child URL is not under /sitemaps/: ${loc}`)
		}
	}
}

function validateUrlSetXml(xml, sourceUrl) {
	const byteLength = Buffer.byteLength(xml, "utf8")
	if (byteLength > MAX_SITEMAP_BYTES) throw new Error(`${sourceUrl} is larger than 50 MB uncompressed`)
	if (!/<urlset\b/i.test(xml)) throw new Error(`${sourceUrl} is not a sitemap URL set`)

	const locs = extractLocs(xml)
	if (locs.length === 0) throw new Error(`${sourceUrl} does not contain any sitemap URL entries`)
	if (locs.length > MAX_SITEMAP_URLS) throw new Error(`${sourceUrl} contains ${locs.length} URLs, above the 50,000 sitemap limit`)

	for (const loc of locs) {
		const url = new URL(loc)
		if (url.origin !== canonicalBaseUrl) throw new Error(`${sourceUrl} contains non-canonical URL: ${loc}`)
		if (url.hash) throw new Error(`${sourceUrl} contains URL with hash: ${loc}`)
		if (/^\/admin(?:\/|$)/.test(url.pathname)) throw new Error(`${sourceUrl} contains admin URL: ${loc}`)
	}
	for (const lastmod of extractLastmods(xml)) {
		if (!isValidSitemapLastmod(lastmod)) throw new Error(`${sourceUrl} contains invalid lastmod date: ${lastmod}`)
	}
}

function extractLocs(xml) {
	return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]).trim())
}

function extractSitemapLocs(xml) {
	return extractLocs(xml).filter((loc) => new URL(loc).pathname.endsWith(".xml"))
}

function extractLastmods(xml) {
	return [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => decodeXml(match[1]).trim())
}

function isValidSitemapLastmod(value) {
	if (!value) return false
	const date = new Date(value)
	return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(value)
}

function decodeXml(value) {
	return value
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&apos;/g, "'")
}

function dedupe(values) {
	return [...new Set(values)]
}
