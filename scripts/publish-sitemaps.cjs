#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const { spawnSync } = require("node:child_process")
const { loadExternalEnv } = require("./load-external-env.cjs")

loadExternalEnv()

const args = new Set(process.argv.slice(2))
const onlyIfPlesk = args.has("--if-plesk")
const optional = args.has("--optional")

const canonicalBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://studyindach.cc")
const outputDir = resolveOutputDir()
const sitemapBaseUrl = normalizeBaseUrl(
	process.env.SITEMAP_BASE_URL || inferSitemapBaseUrl(outputDir),
	"https://sitemap.studyindach.cc",
)

try {
	main()
} catch (error) {
	if (!optional) throw error
	console.warn(`[sitemap:publish] skipped: ${error instanceof Error ? error.message : error}`)
}

function main() {
	if (!outputDir) {
		if (onlyIfPlesk) {
			console.log("[sitemap:publish] no Plesk sitemap subdomain directory found; skipping")
			return
		}
		throw new Error(
			"Could not find a Plesk sitemap subdomain directory. Set SITEMAP_OUTPUT_DIR or run from /var/www/vhosts/studyindach.cc/httpdocs.",
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

	const cwd = process.cwd()
	const hostname = new URL(canonicalBaseUrl).hostname.replace(/^www\./, "")
	const sitemapDirName = `sitemap.${hostname}`
	const candidates = []
	let current = cwd

	for (let depth = 0; depth < 6; depth += 1) {
		const base = path.basename(current)
		const parent = path.dirname(current)

		if (base === "httpdocs") candidates.push(path.join(parent, sitemapDirName))
		if (base === hostname) candidates.push(path.join(current, sitemapDirName))
		candidates.push(path.join(parent, sitemapDirName))
		candidates.push(path.join(current, sitemapDirName))

		if (parent === current) break
		current = parent
	}

	return dedupe(candidates).find((candidate) => looksLikePleskSitemapDir(candidate))
}

function looksLikePleskSitemapDir(candidate) {
	const normalized = path.normalize(candidate)
	const parts = normalized.split(path.sep).filter(Boolean)
	return (
		parts.includes("vhosts") &&
		path.basename(normalized).startsWith("sitemap.") &&
		fs.existsSync(normalized) &&
		fs.statSync(normalized).isDirectory()
	)
}

function inferSitemapBaseUrl(dir) {
	if (!dir) return null
	const name = path.basename(path.normalize(dir))
	if (!name.startsWith("sitemap.")) return null
	return `https://${name}`
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

function dedupe(values) {
	return [...new Set(values)]
}
