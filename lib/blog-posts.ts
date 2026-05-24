import { prisma } from "@/lib/prisma"
import type { PublicLocale } from "@/lib/i18n"
import fs from "fs"
import path from "path"

const BLOG_IMAGE_DIR = path.join(process.cwd(), "public", "assets", "imgs", "study-dach-pics")
const BLOG_IMAGE_PUBLIC_DIR = "/assets/imgs/study-dach-pics"

export const publishedBlogWhere = {
	status: "published" as const,
	publishedAt: { not: null },
}

export function blogIndexPath(locale: PublicLocale = "en") {
	if (locale === "pt-br") return "/pt-br/guias"
	if (locale === "es") return "/es/guias"
	return "/blog"
}

export function blogPostPath(slug: string, locale: PublicLocale = "en") {
	return `${blogIndexPath(locale)}/${slug}`
}

export function blogHrefLang(locale: string) {
	if (locale === "pt-br") return "pt-BR"
	if (locale === "es") return "es"
	return "en"
}

export function blogSchemaLanguage(locale: string) {
	if (locale === "pt-br") return "pt-BR"
	if (locale === "es") return "es"
	return "en"
}

export function blogPostLanguageAlternates(translations: Array<{ locale: string; slug: string }>) {
	const alternates: Record<string, string> = {}
	translations.forEach((translation) => {
		const locale = blogLocale(translation.locale)
		alternates[blogHrefLang(locale)] = blogPostPath(translation.slug, locale)
	})
	if (alternates.en) alternates["x-default"] = alternates.en
	return alternates
}

export function slugifyBlogTitle(title: string) {
	const slug = title
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 90)

	return slug || "blog-post"
}

export async function uniqueBlogSlug(title: string, locale: string, currentTranslationId?: number) {
	const baseSlug = slugifyBlogTitle(title)
	let slug = baseSlug
	let suffix = 2

	while (await prisma.blogPostTranslation.findFirst({
		where: {
			locale,
			slug,
			...(currentTranslationId ? { id: { not: currentTranslationId } } : {}),
		},
		select: { id: true },
	})) {
		slug = `${baseSlug}-${suffix}`
		suffix += 1
	}

	return slug
}

export function randomStudyCoverImage() {
	const images = studyCoverImages()
	if (!images.length) return null
	return images[Math.floor(Math.random() * images.length)]
}

export function studyCoverImages() {
	try {
		const files = fs.readdirSync(BLOG_IMAGE_DIR)
			.filter((file) => /\.(avif|webp|jpg|jpeg|png)$/i.test(file))
			.sort()

		return files.map((file) => `${BLOG_IMAGE_PUBLIC_DIR}/${file}`)
	} catch {
		return []
	}
}

export function formatBlogDate(value: Date | null, locale: PublicLocale = "en") {
	if (!value) return "Draft"
	const formatterLocale = locale === "pt-br" ? "pt-BR" : locale === "es" ? "es" : "en"
	return new Intl.DateTimeFormat(formatterLocale, { dateStyle: "long" }).format(value)
}

export function paragraphsFromContent(content: string) {
	return content
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
}

export function markdownToHtml(markdown: string) {
	const lines = markdown.replace(/\r\n/g, "\n").split("\n")
	const html: string[] = []
	let paragraph: string[] = []
	let unorderedList: string[] = []
	let orderedList: string[] = []
	let quote: string[] = []

	const flushParagraph = () => {
		if (!paragraph.length) return
		html.push(`<p>${renderInlineMarkdown(paragraph.join("\n")).replace(/\n/g, "<br />")}</p>`)
		paragraph = []
	}
	const flushUnorderedList = () => {
		if (!unorderedList.length) return
		html.push(`<ul>${unorderedList.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`)
		unorderedList = []
	}
	const flushOrderedList = () => {
		if (!orderedList.length) return
		html.push(`<ol>${orderedList.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`)
		orderedList = []
	}
	const flushQuote = () => {
		if (!quote.length) return
		html.push(`<blockquote>${renderInlineMarkdown(quote.join("\n")).replace(/\n/g, "<br />")}</blockquote>`)
		quote = []
	}
	const flushAll = () => {
		flushParagraph()
		flushUnorderedList()
		flushOrderedList()
		flushQuote()
	}

	for (const rawLine of lines) {
		const line = rawLine.trimEnd()
		if (!line.trim()) {
			flushAll()
			continue
		}

		const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/)
		if (heading) {
			flushAll()
			const level = Math.min(6, heading[1].length)
			html.push(`<h${level}>${renderInlineMarkdown(heading[2].trim())}</h${level}>`)
			continue
		}

		const unordered = line.match(/^\s*[-*]\s+(.+)$/)
		if (unordered) {
			flushParagraph()
			flushOrderedList()
			flushQuote()
			unorderedList.push(unordered[1].trim())
			continue
		}

		const ordered = line.match(/^\s*\d+\.\s+(.+)$/)
		if (ordered) {
			flushParagraph()
			flushUnorderedList()
			flushQuote()
			orderedList.push(ordered[1].trim())
			continue
		}

		const quoted = line.match(/^\s*>\s?(.+)$/)
		if (quoted) {
			flushParagraph()
			flushUnorderedList()
			flushOrderedList()
			quote.push(quoted[1].trim())
			continue
		}

		flushUnorderedList()
		flushOrderedList()
		flushQuote()
		paragraph.push(line.trim())
	}

	flushAll()
	return html.join("\n")
}

export function readingMinutes(content: string) {
	const words = content.trim().split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.ceil(words / 220))
}

export function blogLocale(value: string | null | undefined): PublicLocale {
	return value === "pt-br" || value === "es" ? value : "en"
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
}

function renderInlineMarkdown(value: string) {
	let html = escapeHtml(value)
	html = html.replace(/`([^`]+)`/g, "<code>$1</code>")
	html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
	html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
	html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>")
	html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
	html = html.replace(/(^|[^_])_([^_]+)_/g, "$1<em>$2</em>")
	return html
}
