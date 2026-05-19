#!/usr/bin/env node

const fetchBase = cleanOrigin(process.env.SEO_BASE_URL || "http://localhost:3000")
const publicOrigin = cleanOrigin(process.env.SEO_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://studyindach.cc")
const selectedFilterPaths = new Set([
	"/courses?degreeLevel=Bachelor",
	"/courses?degreeLevel=Master",
	"/courses?degreeLevel=Doctorate",
	"/courses?language=English",
	"/courses?country=Germany",
	"/courses?country=Austria",
	"/courses?country=Switzerland",
	"/courses?studyField=Computer%20Science%20%26%20Data",
	"/pt-br/cursos?degreeLevel=Master",
	"/pt-br/cursos?language=English",
	"/pt-br/cursos?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only",
])

const failures = []

async function main() {
	const sitemapXml = await fetchText("/sitemap.xml")
	const sitemapUrls = extractSitemapUrls(sitemapXml)
	const sitemapPaths = sitemapUrls.map(toPathWithSearch)
	const contactUrls = sitemapPaths.filter((path) => /^\/(contact|pt-br\/contato)(\?|$)/.test(path))
	const oldUrls = sitemapPaths.filter((path) => path.startsWith("/single-courses"))
	const filterUrls = sitemapPaths.filter((path) => path.includes("?"))
	const unexpectedFilterUrls = filterUrls.filter((path) => !selectedFilterPaths.has(path))
	const englishProgramUrls = sitemapPaths.filter((path) => path.startsWith("/courses/"))
	const ptProgramUrls = sitemapPaths.filter((path) => path.startsWith("/pt-br/cursos/"))
	const englishUrls = sitemapPaths.filter((path) => !path.startsWith("/pt-br/"))
	const ptUrls = sitemapPaths.filter((path) => path.startsWith("/pt-br/"))
	const mistakenPtUrls = ptUrls.filter((path) => path.startsWith("/pt-br/courses") || path.startsWith("/pt-br/contact"))

	printHeader("Sitemap")
	printMetric("sitemap URL count", sitemapUrls.length)
	printMetric("localized URL count: en", englishUrls.length)
	printMetric("localized URL count: pt-BR", ptUrls.length)
	printMetric("English canonical program pages", englishProgramUrls.length)
	printMetric("PT-BR canonical program pages", ptProgramUrls.length)
	printList("contact URLs accidentally included", contactUrls)
	printList("non-canonical old URLs accidentally included", oldUrls)
	printList("unexpected filter URLs", unexpectedFilterUrls)
	printList("PT-BR URLs pointing to English route names", mistakenPtUrls)

	if (contactUrls.length) fail("Sitemap contains contact URLs.")
	if (oldUrls.length) fail("Sitemap contains old /single-courses URLs.")
	if (unexpectedFilterUrls.length) fail("Sitemap contains filter URLs outside the selected allowlist.")
	if (mistakenPtUrls.length) fail("Sitemap contains PT-BR URLs that point to English route names.")
	requirePath(sitemapPaths, "/pt-br/cursos")
	requirePath(sitemapPaths, "/pt-br/universidades")
	requirePath(sitemapPaths, "/pt-br/guia-de-estudos")
	requirePath(sitemapPaths, "/pt-br/sobre")
	requirePath(sitemapPaths, "/courses")

	await checkStaticPages()
	await checkContactNoindex()
	await checkProgramPages(englishProgramUrls, ptProgramUrls)
	await checkOldRedirect(englishProgramUrls[0] || ptProgramUrls[0])

	if (failures.length) {
		printHeader("Failures")
		failures.forEach((item) => console.error(`- ${item}`))
		process.exitCode = 1
		return
	}

	printHeader("Result")
	console.log("SEO checks passed.")
}

async function checkStaticPages() {
	printHeader("Raw HTML canonicals and hreflang")
	const ptPages = ["/pt-br/cursos", "/pt-br/universidades", "/pt-br/guia-de-estudos", "/pt-br/sobre"]
	const enPages = ["/courses", "/universities", "/study-guide", "/about"]

	for (const path of ptPages) {
		const html = await fetchText(path)
		expectCanonical(html, path, path)
		expectHreflang(html, path, "en")
		expectHreflang(html, path, "pt-BR")
		expectHreflang(html, path, "x-default")
	}

	for (const path of enPages) {
		const html = await fetchText(path)
		expectCanonical(html, path, path)
	}
}

async function checkContactNoindex() {
	printHeader("Contact noindex")
	for (const path of ["/contact", "/pt-br/contato"]) {
		const html = await fetchText(path)
		const noindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
			|| /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots/i.test(html)
		printMetric(`${path} noindex`, noindex ? "yes" : "no")
		if (!noindex) fail(`${path} is missing noindex robots meta.`)
	}
}

async function checkProgramPages(englishProgramUrls, ptProgramUrls) {
	const enProgramPath = englishProgramUrls[0]
	const ptProgramPath = ptProgramUrls[0]

	if (!enProgramPath) {
		fail("No English program URLs found in sitemap.")
	} else {
		const html = await fetchText(enProgramPath)
		expectCanonical(html, enProgramPath, enProgramPath)
	}

	if (!ptProgramPath) {
		fail("No PT-BR program URLs found in sitemap.")
		return
	}

	const html = await fetchText(ptProgramPath)
	expectCanonical(html, ptProgramPath, ptProgramPath)
	expectHreflang(html, ptProgramPath, "en")
	expectHreflang(html, ptProgramPath, "pt-BR")
	expectHreflang(html, ptProgramPath, "x-default")
}

async function checkOldRedirect(sampleProgramPath) {
	if (!sampleProgramPath) {
		fail("Cannot test /single-courses redirect without a sample program URL.")
		return
	}
	const id = sampleProgramPath.match(/-(\d+)$/)?.[1]
	if (!id) {
		fail(`Cannot extract program id from sample URL: ${sampleProgramPath}`)
		return
	}

	const response = await fetch(`${fetchBase}/single-courses?id=${id}`, { redirect: "manual" })
	const location = response.headers.get("location") || ""
	printMetric("/single-courses redirect status", response.status)
	printMetric("/single-courses redirect location", location || "-")
	if (![301, 302, 303, 307, 308].includes(response.status) || !location.includes("/courses/")) {
		fail(`/single-courses?id=${id} did not redirect to a canonical slug PDP.`)
	}
}

function expectCanonical(html, pagePath, canonicalPath) {
	const expected = `${publicOrigin}${canonicalPath}`
	const actual = findLinkHref(html, "canonical")
	printMetric(`${pagePath} canonical`, actual || "-")
	if (actual !== expected) {
		fail(`${pagePath} canonical mismatch. Expected ${expected}, got ${actual || "missing"}.`)
	}
}

function expectHreflang(html, pagePath, language) {
	const href = findAlternateHref(html, language)
	printMetric(`${pagePath} hreflang ${language}`, href ? "yes" : "no")
	if (!href) {
		fail(`${pagePath} is missing hreflang ${language}.`)
	}
}

function findLinkHref(html, rel) {
	const links = html.match(/<link\b[^>]*>/gi) || []
	const link = links.find((item) => new RegExp(`\\brel=["'][^"']*${escapeRegex(rel)}[^"']*["']`, "i").test(item))
	return link?.match(/\bhref=["']([^"']+)["']/i)?.[1] || ""
}

function findAlternateHref(html, hreflang) {
	const links = html.match(/<link\b[^>]*>/gi) || []
	const link = links.find((item) =>
		/\brel=["'][^"']*alternate[^"']*["']/i.test(item)
		&& new RegExp(`\\bhreflang=["']${escapeRegex(hreflang)}["']`, "i").test(item),
	)
	return link?.match(/\bhref=["']([^"']+)["']/i)?.[1] || ""
}

async function fetchText(path) {
	const url = path.startsWith("http") ? path : `${fetchBase}${path}`
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
	}
	return response.text()
}

function extractSitemapUrls(xml) {
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1].trim()))
}

function toPathWithSearch(url) {
	const parsed = new URL(url)
	return `${parsed.pathname}${parsed.search}`
}

function requirePath(paths, path) {
	if (!paths.includes(path)) {
		fail(`Sitemap is missing ${path}.`)
	}
}

function printHeader(value) {
	console.log(`\n${value}`)
	console.log("-".repeat(value.length))
}

function printMetric(label, value) {
	console.log(`${label}: ${value}`)
}

function printList(label, values) {
	console.log(`${label}: ${values.length ? values.join(", ") : "none"}`)
}

function fail(message) {
	failures.push(message)
}

function cleanOrigin(value) {
	return value.replace(/\/$/, "")
}

function decodeXml(value) {
	return value
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&apos;/g, "'")
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

main().catch((error) => {
	console.error(error)
	process.exitCode = 1
})
