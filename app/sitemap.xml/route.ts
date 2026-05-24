import { blogPostPath, publishedBlogWhere } from "@/lib/blog-posts"
import { getLocalizedProgramUrl, getLocalizedUniversityUrl, localizedBlogPostAlternates } from "@/lib/localized-urls"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getProgramUrl, getUniversityUrl, publicUniversityWhere, sitemapProgramWhere } from "@/lib/study-programs"

type SitemapEntry = {
	url: string
	lastModified?: Date
	alternates?: Record<string, string>
}

export const dynamic = "force-dynamic"

export async function GET() {
	const entries = await sitemapEntries()
	return new Response(renderSitemap(entries), {
		status: 200,
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
			"X-Content-Type-Options": "nosniff",
		},
	})
}

async function sitemapEntries(): Promise<SitemapEntry[]> {
	const [programs, universities, blogPosts] = await Promise.all([
		prisma.degreeProgram.findMany({
			where: sitemapProgramWhere,
			include: { university: true, translations: true },
			orderBy: { id: "asc" },
		}),
		prisma.university.findMany({ where: publicUniversityWhere, orderBy: { name: "asc" } }),
		prisma.blogPost.findMany({ where: { ...publishedBlogWhere, noindex: false }, include: { translations: true }, orderBy: { publishedAt: "desc" } }),
	])
	const now = new Date()
	const main = [
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
	].map((path) => ({
		url: absoluteUrl(path),
		lastModified: now,
	}))
	const filters = [
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
	].map((path) => ({ url: absoluteUrl(path), lastModified: now }))
	const blogAlternateGroups = await Promise.all(blogPosts.map(async (post) => {
		const alternates = await localizedBlogPostAlternates(post.translationKey)
		return absoluteAlternates(alternates)
	}))
	const blogUrls = blogPosts.flatMap((post, index) => post.translations.map((translation) => {
		const locale = translation.locale === "pt-br" || translation.locale === "es" ? translation.locale : "en"
		return {
			url: absoluteUrl(blogPostPath(translation.slug, locale)),
			lastModified: translation.updatedAt,
			alternates: blogAlternateGroups[index],
		}
	}))
	const universityAlternateGroups = await Promise.all(universities.map(async (university) => {
		const en = absoluteUrl(await getLocalizedUniversityUrl(university.id, "en") || getUniversityUrl(university, "en"))
		const pt = absoluteUrl(await getLocalizedUniversityUrl(university.id, "pt-br") || getUniversityUrl(university, "pt-br"))
		const es = absoluteUrl(await getLocalizedUniversityUrl(university.id, "es") || getUniversityUrl(university, "es"))
		return { en, "pt-BR": pt, es, "x-default": en }
	}))
	const universityUrls = universities.map((university, index) => ({
		url: universityAlternateGroups[index].en,
		lastModified: now,
		alternates: universityAlternateGroups[index],
	}))
	const translatedUniversityUrls = universities.map((university, index) => ({
		url: universityAlternateGroups[index]["pt-BR"],
		lastModified: now,
		alternates: universityAlternateGroups[index],
	}))
	const spanishUniversityUrls = universities.map((university, index) => ({
		url: universityAlternateGroups[index].es,
		lastModified: now,
		alternates: universityAlternateGroups[index],
	}))
	const programAlternateGroups = await Promise.all(programs.map(async (program) => {
		const en = absoluteUrl(await getLocalizedProgramUrl(program.id, "en") || getProgramUrl(program, "en"))
		const pt = absoluteUrl(await getLocalizedProgramUrl(program.id, "pt-br") || getProgramUrl(program, "pt-br"))
		const es = absoluteUrl(await getLocalizedProgramUrl(program.id, "es") || getProgramUrl(program, "es"))
		return { en, "pt-BR": pt, es, "x-default": en }
	}))
	const programUrls = programs.map((program, index) => ({
		url: programAlternateGroups[index].en,
		lastModified: now,
		alternates: programAlternateGroups[index],
	}))
	const translatedProgramUrls = programs
		.filter((program) => program.translations.some((translation) => translation.locale === "pt"))
		.map((program) => {
			const index = programs.findIndex((item) => item.id === program.id)
			return {
				url: programAlternateGroups[index]["pt-BR"],
				lastModified: now,
				alternates: programAlternateGroups[index],
			}
		})
	const spanishProgramUrls = programs
		.filter((program) => program.translations.some((translation) => translation.locale === "es"))
		.map((program) => {
			const index = programs.findIndex((item) => item.id === program.id)
			return {
				url: programAlternateGroups[index].es,
				lastModified: now,
				alternates: programAlternateGroups[index],
			}
		})

	return [...main, ...filters, ...blogUrls, ...universityUrls, ...translatedUniversityUrls, ...spanishUniversityUrls, ...programUrls, ...translatedProgramUrls, ...spanishProgramUrls]
}

function absoluteAlternates(alternates: Record<string, string>) {
	return Object.fromEntries(Object.entries(alternates).map(([key, value]) => [key, absoluteUrl(value)]))
}

function renderSitemap(entries: SitemapEntry[]) {
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		...entries.map(renderUrl),
		"</urlset>",
	].join("\n")
}

function renderUrl(entry: SitemapEntry) {
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

function escapeXml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}
