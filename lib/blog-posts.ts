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
	try {
		const files = fs.readdirSync(BLOG_IMAGE_DIR)
			.filter((file) => /\.(avif|webp|jpg|jpeg|png)$/i.test(file))
			.sort()

		if (!files.length) return null
		const file = files[Math.floor(Math.random() * files.length)]
		return `${BLOG_IMAGE_PUBLIC_DIR}/${file}`
	} catch {
		return null
	}
}

export function formatBlogDate(value: Date | null) {
	if (!value) return "Draft"
	return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(value)
}

export function paragraphsFromContent(content: string) {
	return content
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
}

export function markdownToHtml(markdown: string) {
	return paragraphsFromContent(markdown)
		.map((paragraph) => {
			if (/^#{1,3}\s/.test(paragraph)) {
				const level = Math.min(3, paragraph.match(/^#+/)?.[0].length || 2)
				return `<h${level}>${escapeHtml(paragraph.replace(/^#{1,3}\s+/, ""))}</h${level}>`
			}
			return `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
		})
		.join("\n")
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
