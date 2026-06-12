#!/usr/bin/env node
const fs = require("node:fs")
const path = require("node:path")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://studyindach.cc").replace(/\/$/, "")
const SITEMAP_FILE_BASE_URL = normalizeSitemapFileBaseUrl(process.env.SITEMAP_BASE_URL)
const PUBLIC_DIR = path.resolve(process.cwd(), parseOutDir(process.argv.slice(2)) || process.env.SITEMAP_OUT_DIR || "public")
const SITEMAP_DIR = "sitemaps"
const PROGRAM_CHUNK_SIZE = 1000

const sitemapProgramWhere = {
	isPublished: true,
	duplicateStatus: "unique",
	canonicalProgramId: null,
	OR: [
		{ isSitemapIncluded: true },
		{
			AND: [
				{ isSitemapIncluded: null },
				{ contentType: "degree_program" },
			],
		},
	],
}

const publicUniversityWhere = {
	duplicateStatus: "unique",
	canonicalUniversityId: null,
}

const publishedBlogWhere = {
	status: "published",
	publishedAt: { not: null },
	noindex: false,
}

const staticPaths = [
	"/",
	"/courses",
	"/universities",
	"/study-guide",
	"/blog",
	"/about",
	"/impressum",
	"/privacy",
	"/pt-br/cursos",
	"/pt-br/universidades",
	"/pt-br/guia-de-estudos",
	"/pt-br/guias",
	"/pt-br/sobre",
	"/pt-br/privacidade",
	"/pt-br/estudar-na-alemanha",
	"/pt-br/estudar-na-austria",
	"/pt-br/estudar-na-suica",
	"/pt-br/programas-em-ingles",
	"/pt-br/mestrado-na-alemanha",
	"/pt-br/mestrado-na-alemanha-em-ingles",
	"/pt-br/universidades-publicas-na-alemanha",
	"/pt-br/estudar-informatica-na-alemanha",
	"/pt-br/estudar-engenharia-na-alemanha",
	"/pt-br/doutorado-na-alemanha",
	"/pt-br/bacharelado-na-alemanha",
	"/pt-br/guia-de-estudos/bacharelado-mestrado-doutorado",
	"/pt-br/guia-de-estudos/custos-taxas-comprovacao-financeira",
	"/pt-br/guia-de-estudos/requisitos-de-idioma",
	"/pt-br/guia-de-estudos/prazos-de-candidatura",
	"/pt-br/guia-de-estudos/como-comparar-programas",
	"/es/programas",
	"/es/universidades",
	"/es/guia-para-estudiar",
	"/es/guias",
	"/es/sobre",
	"/es/privacidad",
	"/es/estudiar-en-alemania",
	"/es/estudiar-en-austria",
	"/es/estudiar-en-suiza",
	"/es/programas-en-ingles",
	"/es/universidades-publicas-en-alemania",
	"/es/estudiar-informatica-en-alemania",
	"/es/estudiar-ingenieria-en-alemania",
	"/es/doctorado-en-alemania",
	"/es/licenciatura-en-alemania",
	"/es/guia-para-estudiar/licenciatura-maestria-doctorado",
	"/es/guia-para-estudiar/universidades-publicas",
	"/es/guia-para-estudiar/costos-tasas-comprobacion-financiera",
	"/es/guia-para-estudiar/requisitos-de-idioma",
	"/es/guia-para-estudiar/plazos-de-postulacion",
	"/es/guia-para-estudiar/como-comparar-programas",
]

const filterPaths = [
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
]

main()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

async function main() {
	fs.mkdirSync(PUBLIC_DIR, { recursive: true })
	const [programs, universities, blogPosts] = await Promise.all([
		prisma.degreeProgram.findMany({
			where: sitemapProgramWhere,
			include: { university: true, translations: true },
			orderBy: { id: "asc" },
		}),
		prisma.university.findMany({ where: publicUniversityWhere, orderBy: { name: "asc" } }),
		prisma.blogPost.findMany({
			where: publishedBlogWhere,
			include: { translations: true },
			orderBy: { publishedAt: "desc" },
		}),
	])

	const now = new Date()
	const files = []
	clearGeneratedSitemaps()

	files.push(writeUrlSitemap(`${SITEMAP_DIR}/static.xml`, [
		...staticPaths.map((item) => entry(item, now)),
		...filterPaths.map((item) => entry(item, now)),
	]))
	writeUrlSitemapIfNotEmpty(files, `${SITEMAP_DIR}/blog.xml`, blogEntries(blogPosts))
	writeUrlSitemapIfNotEmpty(files, `${SITEMAP_DIR}/universities.xml`, universityEntries(universities, now))

	chunk(programEntries(programs, now), PROGRAM_CHUNK_SIZE).forEach((entries, index) => {
		writeUrlSitemapIfNotEmpty(files, `${SITEMAP_DIR}/programs-${String(index + 1).padStart(4, "0")}.xml`, entries)
	})

	writeSitemapIndex("sitemap.xml", files.map((file) => ({ loc: sitemapFileUrl(`/${file}`), lastModified: now })))
	console.log(`Generated sitemap index in ${PUBLIC_DIR} with ${files.length} child sitemaps and ${files.reduce((sum, file) => sum + countUrls(file), 0)} URLs.`)
}

function parseOutDir(args) {
	const outDirIndex = args.indexOf("--out-dir")
	if (outDirIndex !== -1) return args[outDirIndex + 1]
	const outDirValue = args.find((arg) => arg.startsWith("--out-dir="))
	if (outDirValue) return outDirValue.split("=", 2)[1]
	return ""
}

function blogEntries(blogPosts) {
	return blogPosts.flatMap((post) => {
		const alternates = blogAlternates(post.translations)
		return post.translations.map((translation) => {
			const locale = publicLocaleFromDb(translation.locale)
			if (!locale) return null
			return {
				url: absoluteUrl(blogPostPath(translation.slug, locale)),
				lastModified: translation.updatedAt,
				alternates,
			}
		}).filter(Boolean)
	})
}

function universityEntries(universities, lastModified) {
	return universities.flatMap((university) => {
		const alternates = {
			en: absoluteUrl(getUniversityUrl(university, "en")),
			"pt-BR": absoluteUrl(getUniversityUrl(university, "pt-br")),
			es: absoluteUrl(getUniversityUrl(university, "es")),
		}
		alternates["x-default"] = alternates.en
		return [
			{ url: alternates.en, lastModified, alternates },
			{ url: alternates["pt-BR"], lastModified, alternates },
			{ url: alternates.es, lastModified, alternates },
		]
	})
}

function programEntries(programs, lastModified) {
	return programs.flatMap((program) => {
		const alternates = {
			en: absoluteUrl(getProgramUrl(program, "en")),
			"pt-BR": absoluteUrl(getProgramUrl(program, "pt-br")),
			es: absoluteUrl(getProgramUrl(program, "es")),
		}
		alternates["x-default"] = alternates.en
		const entries = [{ url: alternates.en, lastModified, alternates }]
		if (program.translations.some((translation) => translation.locale === "pt")) {
			entries.push({ url: alternates["pt-BR"], lastModified, alternates })
		}
		if (program.translations.some((translation) => translation.locale === "es")) {
			entries.push({ url: alternates.es, lastModified, alternates })
		}
		return entries
	})
}

function blogAlternates(translations) {
	const alternates = {}
	translations.forEach((translation) => {
		const locale = publicLocaleFromDb(translation.locale)
		if (!locale) return
		alternates[blogHrefLang(locale)] = absoluteUrl(blogPostPath(translation.slug, locale))
	})
	if (alternates.en) alternates["x-default"] = alternates.en
	return alternates
}

function entry(pathname, lastModified) {
	return { url: absoluteUrl(pathname), lastModified }
}

function writeUrlSitemap(fileName, entries) {
	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...entries.map(renderUrl),
		"</urlset>",
		"",
	].join("\n")
	writeXmlFile(fileName, xml)
	return fileName
}

function writeUrlSitemapIfNotEmpty(files, fileName, entries) {
	if (!entries.length) return
	files.push(writeUrlSitemap(fileName, entries))
}

function writeSitemapIndex(fileName, entries) {
	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...entries.map((entry) => [
			"<sitemap>",
			`  <loc>${escapeXml(entry.loc)}</loc>`,
			`  <lastmod>${entry.lastModified.toISOString()}</lastmod>`,
			"</sitemap>",
		].join("\n")),
		"</sitemapindex>",
		"",
	].join("\n")
	writeXmlFile(fileName, xml)
}

function renderUrl(entry) {
	const alternates = Object.entries(entry.alternates || {})
		.map(([hrefLang, href]) => `  <xhtml:link rel="alternate" hreflang="${escapeXml(hrefLang)}" href="${escapeXml(href)}" />`)
	const lastModified = entry.lastModified ? [`  <lastmod>${entry.lastModified.toISOString()}</lastmod>`] : []
	return [
		"<url>",
		`  <loc>${escapeXml(entry.url)}</loc>`,
		...lastModified,
		...alternates,
		"</url>",
	].join("\n")
}

function getProgramUrl(program, locale = "en") {
	const basePath = locale === "pt-br" ? "/pt-br/cursos" : locale === "es" ? "/es/programas" : "/courses"
	const translation = program.translations?.find((item) => item.locale === dbTranslationLocale(locale))
	const originalTitle = program.programName || program.title || ""
	const localizedTitle = locale === "en" ? originalTitle : translation?.localizedProgramName || program.title || originalTitle
	const programSlugTitle = locale === "pt-br" ? cleanPtProgramTitle(localizedTitle) : localizedTitle
	const universityName = program.university?.name || program.universityName || "university"
	return `${basePath}/${slugify(universityName, "university")}/${slugify(program.degreeLevel || "Degree program", "degree")}/${slugify(programSlugTitle, "program")}-${program.id}`
}

function getUniversityUrl(university, locale = "en") {
	const slug = university.id || "university"
	if (locale === "pt-br") return `/pt-br/universidades/${slug}`
	if (locale === "es") return `/es/universidades/${slug}`
	return `/universities/${slug}`
}

function blogPostPath(slug, locale = "en") {
	if (locale === "pt-br") return `/pt-br/guias/${slug}`
	if (locale === "es") return `/es/guias/${slug}`
	return `/blog/${slug}`
}

function absoluteUrl(pathname = "/") {
	const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`
	return `${SITE_URL}${cleanPath}`
}

function sitemapFileUrl(pathname = "/") {
	const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`
	return `${SITEMAP_FILE_BASE_URL}${cleanPath}`
}

function normalizeSitemapFileBaseUrl(value) {
	try {
		const url = new URL(value || SITE_URL)
		const canonicalUrl = new URL(SITE_URL)
		if (url.protocol !== "https:" || url.hostname !== canonicalUrl.hostname) return SITE_URL
		url.pathname = url.pathname.replace(/\/+$/, "")
		url.search = ""
		url.hash = ""
		return url.toString().replace(/\/$/, "")
	} catch {
		return SITE_URL
	}
}

function dbTranslationLocale(locale) {
	if (locale === "pt-br") return "pt"
	if (locale === "es") return "es"
	return "en"
}

function publicLocaleFromDb(locale) {
	if (locale === "pt-br" || locale === "pt") return "pt-br"
	if (locale === "es") return "es"
	if (locale === "en") return "en"
	return null
}

function blogHrefLang(locale) {
	if (locale === "pt-br") return "pt-BR"
	if (locale === "es") return "es"
	return "en"
}

function slugify(value, fallback) {
	const slug = String(value || "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-")
	return slug || fallback
}

function cleanPtProgramTitle(value) {
	return String(value || "").replace(/^Mestre em\s+/i, "Mestrado em ")
}

function escapeXml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

function chunk(values, size) {
	const chunks = []
	for (let index = 0; index < values.length; index += size) {
		chunks.push(values.slice(index, index + size))
	}
	return chunks
}

function clearGeneratedSitemaps() {
	for (const file of fs.readdirSync(PUBLIC_DIR)) {
		if (/^sitemap(?:-.+)?\.xml$/.test(file)) {
			fs.unlinkSync(path.join(PUBLIC_DIR, file))
		}
	}
	const sitemapDir = path.join(PUBLIC_DIR, SITEMAP_DIR)
	if (fs.existsSync(sitemapDir)) {
		for (const file of fs.readdirSync(sitemapDir)) {
			if (/\.xml$/.test(file)) fs.unlinkSync(path.join(sitemapDir, file))
		}
	}
}

function countUrls(fileName) {
	const value = fs.readFileSync(path.join(PUBLIC_DIR, fileName), "utf8")
	return (value.match(/<url>/g) || []).length
}

function writeXmlFile(fileName, xml) {
	const targetPath = path.join(PUBLIC_DIR, fileName)
	fs.mkdirSync(path.dirname(targetPath), { recursive: true })
	fs.writeFileSync(targetPath, xml)
}
