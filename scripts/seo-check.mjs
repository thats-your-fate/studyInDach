#!/usr/bin/env node

import { PrismaClient } from "@prisma/client"

const fetchBase = cleanOrigin(process.env.SEO_BASE_URL || "http://localhost:3000")
const publicOrigin = cleanOrigin(process.env.SEO_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://studyindach.cc")
const prisma = new PrismaClient()
const selectedFilterPaths = new Set([
	"/courses?degreeLevel=Bachelor",
	"/courses?degreeLevel=Master",
	"/courses?degreeLevel=Doctorate",
	"/courses?languageOfInstruction=English",
	"/courses?country=Germany",
	"/courses?country=Austria",
	"/courses?country=Switzerland",
	"/courses?studyField=Computer%20Science%20%26%20Data",
	"/pt-br/cursos?degreeLevel=Master",
	"/pt-br/cursos?languageOfInstruction=English",
	"/pt-br/cursos?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only",
	"/es/programas?degreeLevel=Master",
	"/es/programas?languageOfInstruction=English",
	"/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only",
])

const warnings = []
const badLocalizedStrings = [
	"English + German",
	"Humanities",
	"Arts, Design & Media",
	"Mestrado Mestrado",
	"Maestría Máster",
	"Unknown",
]
const suspiciousPublicRowPattern = /\b(bachelor project|master project|project|projekt|module|modul|seminar|lecture|publication|presentation|performance|research training|adaptive minds research area|1st year|2nd year|3rd year|4th year|1\. jahr|2\. jahr|3\. jahr|4\. jahr)\b/gi

async function main() {
	try {
		const sitemapXml = await fetchText("/sitemap.xml")
		const sitemapUrls = extractSitemapUrls(sitemapXml)
		const sitemapPaths = sitemapUrls.map(toPathWithSearch)
		const contactUrls = sitemapPaths.filter((path) => /^\/(contact|pt-br\/contato|es\/contacto)(\?|$)/.test(path))
		const oldUrls = sitemapPaths.filter((path) => path.startsWith("/single-courses"))
		const filterUrls = sitemapPaths.filter((path) => path.includes("?"))
		const unexpectedFilterUrls = filterUrls.filter((path) => !selectedFilterPaths.has(path))
		const englishProgramUrls = sitemapPaths.filter((path) => path.startsWith("/courses/"))
		const ptProgramUrls = sitemapPaths.filter((path) => path.startsWith("/pt-br/cursos/"))
		const esProgramUrls = sitemapPaths.filter((path) => path.startsWith("/es/programas/"))
		const englishUniversityUrls = sitemapPaths.filter((path) => path.startsWith("/universities/"))
		const ptUniversityUrls = sitemapPaths.filter((path) => path.startsWith("/pt-br/universidades/"))
		const esUniversityUrls = sitemapPaths.filter((path) => path.startsWith("/es/universidades/"))
		const englishUrls = sitemapPaths.filter((path) => !path.startsWith("/pt-br/") && !path.startsWith("/es/"))
		const ptUrls = sitemapPaths.filter((path) => path.startsWith("/pt-br/"))
		const esUrls = sitemapPaths.filter((path) => path.startsWith("/es/"))
		const mistakenPtUrls = ptUrls.filter((path) => path.startsWith("/pt-br/courses") || path.startsWith("/pt-br/contact"))
		const mistakenEsUrls = esUrls.filter((path) => path.startsWith("/es/courses") || path.startsWith("/es/contact") || path.startsWith("/es/cursos"))

		printHeader("Sitemap")
		printMetric("sitemap URL count", sitemapUrls.length)
		printMetric("localized URL count: en", englishUrls.length)
		printMetric("localized URL count: pt-BR", ptUrls.length)
		printMetric("localized URL count: es", esUrls.length)
		printMetric("English canonical program pages", englishProgramUrls.length)
		printMetric("PT-BR canonical program pages", ptProgramUrls.length)
		printMetric("Spanish canonical program pages", esProgramUrls.length)
		printList("contact URLs accidentally included", contactUrls)
		printList("non-canonical old URLs accidentally included", oldUrls)
		printList("unexpected filter URLs", unexpectedFilterUrls)
		printList("PT-BR URLs pointing to English route names", mistakenPtUrls)
		printList("Spanish URLs pointing to wrong route names", mistakenEsUrls)

		if (contactUrls.length) warn("Sitemap contains contact URLs.")
		if (oldUrls.length) warn("Sitemap contains old /single-courses URLs.")
		if (unexpectedFilterUrls.length) warn("Sitemap contains filter URLs outside the selected allowlist.")
		if (mistakenPtUrls.length) warn("Sitemap contains PT-BR URLs that point to English route names.")
		if (mistakenEsUrls.length) warn("Sitemap contains Spanish URLs that point to wrong route names.")
		requirePath(sitemapPaths, "/pt-br/cursos")
		requirePath(sitemapPaths, "/pt-br/universidades")
		requirePath(sitemapPaths, "/pt-br/guia-de-estudos")
		requirePath(sitemapPaths, "/pt-br/sobre")
		requirePath(sitemapPaths, "/es/programas")
		requirePath(sitemapPaths, "/es/universidades")
		requirePath(sitemapPaths, "/es/guia-para-estudiar")
		requirePath(sitemapPaths, "/es/sobre")
		requirePath(sitemapPaths, "/courses")

		await checkStaticPages()
		await checkContactNoindex()
		await checkProgramPages(englishProgramUrls, ptProgramUrls, esProgramUrls)
		await checkRepresentativeRawHtml(englishProgramUrls, ptProgramUrls, esProgramUrls)
		await checkLocalizedAlternateRoutes(ptProgramUrls, esProgramUrls, ptUniversityUrls, esUniversityUrls)
		await checkPtRegressionPages(ptProgramUrls)
		await checkEsRegressionPages(esProgramUrls)
		await checkOldRedirect(englishProgramUrls[0] || ptProgramUrls[0])
		await checkSitemapProgramVisibility(sitemapPaths)

		printHeader("Result")
		if (warnings.length) {
			console.log(`SEO checks completed with ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`)
			printHeader("Warnings")
			warnings.forEach((item) => console.warn(`- ${item}`))
		} else {
			console.log("SEO checks passed with no warnings.")
		}
		console.log("CI mode: warning-only. This script does not fail the process yet.")
	} finally {
		await prisma.$disconnect()
	}
}

async function checkLocalizedAlternateRoutes(ptProgramUrls, esProgramUrls, ptUniversityUrls, esUniversityUrls) {
	printHeader("Localized alternate route regressions")

	if (ptProgramUrls[0]) {
		const html = await fetchText(ptProgramUrls[0])
		const enHref = findAlternateHref(html, "en")
		const enPath = enHref ? toPathWithSearch(enHref) : ""
		const prefixSwappedPt = ptProgramUrls[0].replace(/^\/pt-br\/cursos/, "/courses")
		printMetric(`${ptProgramUrls[0]} English alternate`, enPath || "-")
		if (enPath === prefixSwappedPt) {
			fail(`${ptProgramUrls[0]} English alternate appears to reuse the PT-BR slug under /courses.`)
		}
		if (enPath && !enPath.startsWith("/courses/")) {
			fail(`${ptProgramUrls[0]} English alternate does not point to /courses/.`)
		}
	}

	if (esProgramUrls[0]) {
		const html = await fetchText(esProgramUrls[0])
		const enHref = findAlternateHref(html, "en")
		const enPath = enHref ? toPathWithSearch(enHref) : ""
		const prefixSwappedEs = esProgramUrls[0].replace(/^\/es\/programas/, "/courses")
		printMetric(`${esProgramUrls[0]} English alternate`, enPath || "-")
		if (enPath === prefixSwappedEs) {
			fail(`${esProgramUrls[0]} English alternate appears to reuse the Spanish slug under /courses.`)
		}
		if (enPath && !enPath.startsWith("/courses/")) {
			fail(`${esProgramUrls[0]} English alternate does not point to /courses/.`)
		}
	}

	if (ptUniversityUrls[0]) {
		await expectDistinctUniversityAlternates(ptUniversityUrls[0], "PT-BR")
	}
	if (esUniversityUrls[0]) {
		await expectDistinctUniversityAlternates(esUniversityUrls[0], "Spanish")
	}
}

async function expectDistinctUniversityAlternates(path, label) {
	const html = await fetchText(path)
	const en = findAlternateHref(html, "en")
	const pt = findAlternateHref(html, "pt-BR")
	const es = findAlternateHref(html, "es")
	const paths = [en, pt, es].filter(Boolean).map(toPathWithSearch)
	printMetric(`${label} university alternate en`, en ? toPathWithSearch(en) : "-")
	printMetric(`${label} university alternate pt-BR`, pt ? toPathWithSearch(pt) : "-")
	printMetric(`${label} university alternate es`, es ? toPathWithSearch(es) : "-")
	if (paths.length !== 3 || new Set(paths).size !== 3) {
		fail(`${path} must have distinct EN/PT-BR/ES university alternate URLs.`)
	}
	if (!paths.some((item) => item.startsWith("/universities/"))) fail(`${path} is missing an English university alternate.`)
	if (!paths.some((item) => item.startsWith("/pt-br/universidades/"))) fail(`${path} is missing a PT-BR university alternate.`)
	if (!paths.some((item) => item.startsWith("/es/universidades/"))) fail(`${path} is missing a Spanish university alternate.`)
}

async function checkEsRegressionPages(esProgramUrls) {
	printHeader("Spanish routing regressions")
	const esPages = ["/es/programas", "/es/universidades", "/es/guia-para-estudiar", "/es/sobre", "/es/contacto"]
	if (esProgramUrls[0]) {
		esPages.push(esProgramUrls[0])
	}

	for (const path of esPages) {
		const html = await fetchText(path)
		const body = bodyHtml(html)
		const text = visibleText(body)
		const bodyWithoutScripts = stripScriptsAndStyles(body)
		const englishCourseLinks = anchorHrefs(body, { ignoreLanguageAlternates: true }).filter((href) => href.startsWith("/courses") || href.includes("studyindach.cc/courses"))
		const englishPrivacyLinks = anchorHrefs(body, { ignoreLanguageAlternates: true }).filter((href) => href === "/privacy" || href.includes("studyindach.cc/privacy"))
		const hasHomeLabel = hasExactTextNode(bodyWithoutScripts, "Home")
		const hasLanguageLabel = hasExactTextNode(bodyWithoutScripts, "Language")
		printMetric(`${path} body /courses links`, englishCourseLinks.length)
		printMetric(`${path} body /privacy links`, englishPrivacyLinks.length)
		printMetric(`${path} visible Home`, hasHomeLabel ? "yes" : "no")
		printMetric(`${path} visible Language`, hasLanguageLabel ? "yes" : "no")
		printMetric(`${path} visible Maestría Maestría`, /\bMaestr[ií]a\s+Maestr[ií]a\b/i.test(text) ? "yes" : "no")

		if (englishCourseLinks.length) fail(`${path} contains English /courses links in body: ${englishCourseLinks.join(", ")}`)
		if (englishPrivacyLinks.length) fail(`${path} contains English /privacy links in body: ${englishPrivacyLinks.join(", ")}`)
		if (hasHomeLabel) fail(`${path} contains visible English label Home.`)
		if (hasLanguageLabel) fail(`${path} contains visible English label Language.`)
		if (/\bMaestr[ií]a\s+Maestr[ií]a\b/i.test(text)) fail(`${path} contains visible duplicate Maestría Maestría.`)
	}

	const englishFilterHtml = await fetchText("/es/programas?languageOfInstruction=English")
	const hasResults = /course-card-modern/.test(englishFilterHtml) && !/Ningún programa coincide/i.test(visibleText(bodyHtml(englishFilterHtml)))
	printMetric("/es/programas?languageOfInstruction=English has results", hasResults ? "yes" : "no")
	if (!hasResults) fail("/es/programas?languageOfInstruction=English returned zero visible results.")
}

async function checkPtRegressionPages(ptProgramUrls) {
	printHeader("PT-BR routing regressions")
	const ptPages = ["/pt-br/cursos", "/pt-br/universidades", "/pt-br/guia-de-estudos", "/pt-br/sobre", "/pt-br/contato"]
	if (ptProgramUrls[0]) {
		ptPages.push(ptProgramUrls[0])
	}

	for (const path of ptPages) {
		const html = await fetchText(path)
		const body = bodyHtml(html)
		const text = visibleText(body)
		const bodyWithoutScripts = stripScriptsAndStyles(body)
		const englishUniversityLinks = anchorHrefs(body, { ignoreLanguageAlternates: true }).filter((href) => href.startsWith("/universities") || href.includes("studyindach.cc/universities"))
		const englishPrivacyLinks = anchorHrefs(body, { ignoreLanguageAlternates: true }).filter((href) => href === "/privacy" || href.includes("studyindach.cc/privacy"))
		const hasHomeLabel = hasExactTextNode(bodyWithoutScripts, "Home")
		const hasLanguageLabel = hasExactTextNode(bodyWithoutScripts, "Language")
		printMetric(`${path} body /universities links`, englishUniversityLinks.length)
		printMetric(`${path} body /privacy links`, englishPrivacyLinks.length)
		printMetric(`${path} visible Home`, hasHomeLabel ? "yes" : "no")
		printMetric(`${path} visible Language`, hasLanguageLabel ? "yes" : "no")
		printMetric(`${path} visible Mestrado Mestrado`, /\bMestrado\s+Mestrado\b/i.test(text) ? "yes" : "no")

		if (englishUniversityLinks.length) fail(`${path} contains English /universities links in body: ${englishUniversityLinks.join(", ")}`)
		if (englishPrivacyLinks.length) fail(`${path} contains English /privacy links in body: ${englishPrivacyLinks.join(", ")}`)
		if (hasHomeLabel) fail(`${path} contains visible English label Home.`)
		if (hasLanguageLabel) fail(`${path} contains visible English label Language.`)
		if (/\bMestrado\s+Mestrado\b/i.test(text)) fail(`${path} contains visible duplicate Mestrado Mestrado.`)
	}

	if (ptProgramUrls[0]) {
		const html = await fetchText(ptProgramUrls[0])
		const anchors = anchorHrefs(bodyHtml(html), { ignoreLanguageAlternates: true })
		const hasPtUniversityLink = anchors.some((href) => href.startsWith("/pt-br/universidades") || href.includes("studyindach.cc/pt-br/universidades"))
		printMetric(`${ptProgramUrls[0]} PT university profile link`, hasPtUniversityLink ? "yes" : "no")
		if (!hasPtUniversityLink) fail(`${ptProgramUrls[0]} is missing a PT-BR university profile link.`)
	}

	const englishFilterHtml = await fetchText("/pt-br/cursos?languageOfInstruction=English")
	const hasResults = /course-card-modern/.test(englishFilterHtml) && !/Nenhum programa corresponde/i.test(visibleText(bodyHtml(englishFilterHtml)))
	printMetric("/pt-br/cursos?languageOfInstruction=English has results", hasResults ? "yes" : "no")
	if (!hasResults) fail("/pt-br/cursos?languageOfInstruction=English returned zero visible results.")
}

async function checkStaticPages() {
	printHeader("Raw HTML canonicals and hreflang")
	const ptPages = ["/pt-br/cursos", "/pt-br/universidades", "/pt-br/guia-de-estudos", "/pt-br/sobre"]
	const enPages = ["/courses", "/universities", "/study-guide", "/about"]

	for (const path of ptPages) {
		const html = await fetchText(path)
		expectCanonical(html, path, path)
		expectHreflang(html, path, "en")
		expectHreflang(html, path, "es")
		expectHreflang(html, path, "pt-BR")
		expectHreflang(html, path, "x-default")
	}

	const esPages = ["/es/programas", "/es/universidades", "/es/guia-para-estudiar", "/es/sobre"]
	for (const path of esPages) {
		const html = await fetchText(path)
		expectCanonical(html, path, path)
		expectHreflang(html, path, "en")
		expectHreflang(html, path, "es")
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
	for (const path of ["/contact", "/pt-br/contato", "/es/contacto"]) {
		const html = await fetchText(path)
		const noindex = hasNoindex(html)
		printMetric(`${path} noindex`, noindex ? "yes" : "no")
		if (!noindex) fail(`${path} is missing noindex robots meta.`)
	}
}

async function checkProgramPages(englishProgramUrls, ptProgramUrls, esProgramUrls) {
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

	const esProgramPath = esProgramUrls[0]
	if (!esProgramPath) {
		fail("No Spanish program URLs found in sitemap.")
		return
	}

	const esHtml = await fetchText(esProgramPath)
	expectCanonical(esHtml, esProgramPath, esProgramPath)
	expectHreflang(esHtml, esProgramPath, "en")
	expectHreflang(esHtml, esProgramPath, "es")
	expectHreflang(esHtml, esProgramPath, "x-default")
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

async function checkRepresentativeRawHtml(englishProgramUrls, ptProgramUrls, esProgramUrls) {
	printHeader("Representative raw HTML validation")
	const representativePages = [
		{ path: "/courses?degreeLevel=Master", locale: "en", type: "listing", indexable: true },
		{ path: "/pt-br/cursos?degreeLevel=Master", locale: "pt-br", type: "listing", indexable: true },
		{ path: "/es/programas?degreeLevel=Master", locale: "es", type: "listing", indexable: true },
		{ path: englishProgramUrls[0], locale: "en", type: "pdp", indexable: true },
		{ path: ptProgramUrls[0], locale: "pt-br", type: "pdp", indexable: true },
		{ path: esProgramUrls[0], locale: "es", type: "pdp", indexable: true },
		{ path: "/pt-br/contato?programId=12", locale: "pt-br", type: "contact", indexable: false },
		{ path: "/es/contacto?programId=12", locale: "es", type: "contact", indexable: false },
		{ path: "/pt-br/bacharelado-na-alemanha", locale: "pt-br", type: "landing", indexable: true },
		{ path: "/es/licenciatura-en-alemania", locale: "es", type: "landing", indexable: true },
	].filter((page) => page.path)

	for (const page of representativePages) {
		const html = await fetchText(page.path)
		const canonical = findLinkHref(html, "canonical")
		const noindex = hasNoindex(html)
		const jsonLdCount = jsonLdBlocks(html).length
		const bodyText = visibleText(bodyHtml(html))

		printMetric(`${page.path} canonical`, canonical || "-")
		printMetric(`${page.path} noindex`, noindex ? "yes" : "no")
		printMetric(`${page.path} JSON-LD blocks`, jsonLdCount)

		if (page.indexable) {
			if (!canonical) warn(`${page.path} is indexable but missing canonical.`)
			if (canonical && toPathWithSearch(canonical) !== page.path) {
				warn(`${page.path} is not self-canonical. Got ${canonical}.`)
			}
			if (!jsonLdCount) warn(`${page.path} is missing JSON-LD structured data.`)
			expectRepresentativeHreflang(html, page)
		} else if (!noindex) {
			warn(`${page.path} should be noindex.`)
		}

		if (page.locale === "pt-br" || page.locale === "es") {
			checkLocalizedBadStrings(page.path, bodyText, page.locale)
		}
		if (page.type === "listing" || page.type === "landing" || page.type === "pdp") {
			checkSuspiciousPublicRows(page.path, bodyText)
		}
	}
}

function expectRepresentativeHreflang(html, page) {
	for (const language of ["en", "pt-BR", "es", "x-default"]) {
		const href = findAlternateHref(html, language)
		printMetric(`${page.path} hreflang ${language}`, href ? "yes" : "no")
		if (!href) warn(`${page.path} is missing hreflang ${language}.`)
	}
}

function checkLocalizedBadStrings(path, text, locale) {
	const findings = badLocalizedStrings.filter((value) => {
		if (locale === "pt-br" && value === "Maestría Máster") return false
		if (locale === "es" && value === "Mestrado Mestrado") return false
		return new RegExp(`\\b${escapeRegex(value)}\\b`, "i").test(text)
	})
	printList(`${path} bad localized strings`, findings)
	findings.forEach((value) => warn(`${path} contains raw/bad localized string: ${value}`))
}

function checkSuspiciousPublicRows(path, text) {
	const matches = [...text.matchAll(suspiciousPublicRowPattern)]
		.map((match) => match[0])
		.slice(0, 10)
	printList(`${path} suspicious public-row terms`, matches)
	matches.forEach((value) => warn(`${path} contains suspicious public program term: ${value}`))
}

async function checkSitemapProgramVisibility(sitemapPaths) {
	printHeader("Sitemap public program visibility")
	const sitemapProgramIds = Array.from(new Set(sitemapPaths
		.filter((path) => path.startsWith("/courses/") || path.startsWith("/pt-br/cursos/") || path.startsWith("/es/programas/"))
		.map((path) => Number(path.match(/-(\d+)$/)?.[1]))
		.filter((id) => Number.isFinite(id) && id > 0)))

	if (!sitemapProgramIds.length) {
		warn("No program IDs found in sitemap program URLs.")
		return
	}

	const hiddenOrDuplicate = await findProgramsInChunks(sitemapProgramIds, {
		OR: [
			{ isPublished: false },
			{ isLikelyDegreeProgram: false },
			{ duplicateStatus: "duplicate" },
			{ canonicalProgramId: { not: null } },
		],
	}, {
		id: true,
		programName: true,
		isPublished: true,
		isLikelyDegreeProgram: true,
		duplicateStatus: true,
		canonicalProgramId: true,
	})
	const suspiciousPublic = await findProgramsInChunks(sitemapProgramIds, {
		isPublished: true,
		isLikelyDegreeProgram: true,
		duplicateStatus: { not: "duplicate" },
		canonicalProgramId: null,
		OR: [
			{ qualityFlags: { contains: "non-degree" } },
			{ qualityFlags: { contains: "module" } },
			{ qualityFlags: { contains: "project" } },
			{ programName: { contains: "Project" } },
			{ programName: { contains: "Module" } },
			{ programName: { contains: "Seminar" } },
		],
	}, { id: true, programName: true, qualityFlags: true })

	printMetric("sitemap program IDs checked", sitemapProgramIds.length)
	printList("hidden/duplicate programs in sitemap", hiddenOrDuplicate.map((program) => `#${program.id} ${program.programName}`))
	printList("published programs with suspicious flags/terms in sitemap", suspiciousPublic.map((program) => `#${program.id} ${program.programName}`))
	hiddenOrDuplicate.forEach((program) => warn(`Sitemap includes hidden/duplicate program #${program.id}: ${program.programName}`))
	suspiciousPublic.forEach((program) => warn(`Sitemap includes suspicious public program #${program.id}: ${program.programName}`))
}

async function findProgramsInChunks(ids, where, select) {
	const rows = []
	for (const idChunk of chunk(ids, 300)) {
		const result = await prisma.degreeProgram.findMany({
			where: {
				id: { in: idChunk },
				...where,
			},
			select,
			take: Math.max(0, 25 - rows.length),
		})
		rows.push(...result)
		if (rows.length >= 25) break
	}
	return rows
}

function chunk(values, size) {
	const chunks = []
	for (let index = 0; index < values.length; index += size) {
		chunks.push(values.slice(index, index + size))
	}
	return chunks
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

function bodyHtml(html) {
	return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html
}

function visibleText(html) {
	return stripScriptsAndStyles(html)
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function stripScriptsAndStyles(html) {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, " ")
		.replace(/<style[\s\S]*?<\/style>/gi, " ")
}

function hasExactTextNode(html, text) {
	const escaped = escapeRegex(text)
	return new RegExp(`>\\s*${escaped}\\s*<`, "i").test(html)
}

function anchorHrefs(html, options = {}) {
	return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
		.filter((match) => !(options.ignoreLanguageAlternates && /\bhrefLang=["']en["']/i.test(match[0])))
		.map((match) => decodeXml(match[1]))
}

function hasNoindex(html) {
	return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
		|| /<meta[^>]+content=["'][^"']*noindex[^"']*["'][^>]+name=["']robots/i.test(html)
}

function jsonLdBlocks(html) {
	return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
		.map((match) => match[1].trim())
		.filter(Boolean)
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

function warn(message) {
	warnings.push(message)
}

function fail(message) {
	warn(message)
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
	console.error("CI mode: warning-only for SEO findings, but the script itself crashed.")
	process.exitCode = 1
})
