import { dbTranslationLocale, type PublicLocale } from "@/lib/i18n"
import { getLocalizedStaticUrl } from "@/lib/localized-static-urls"
import { prisma } from "@/lib/prisma"
import { getProgramUrl, getUniversityUrl } from "@/lib/study-programs"
import { blogHrefLang, blogPostPath } from "@/lib/blog-posts"

export { getLocalizedStaticUrl }

export async function getLocalizedProgramUrl(programId: number, locale: PublicLocale) {
	const program = await prisma.degreeProgram.findUnique({
		where: { id: programId },
		include: {
			university: true,
			translations: { where: { locale: dbTranslationLocale(locale) }, take: 1 },
		},
	})
	if (!program) return ""
	return getProgramUrl(program, locale)
}

export async function getLocalizedUniversityUrl(universityId: string, locale: PublicLocale) {
	const university = await prisma.university.findUnique({ where: { id: universityId } })
	if (!university) return ""
	return getUniversityUrl(university, locale)
}

export async function getLocalizedBlogPostUrl(translationKey: string, locale: PublicLocale) {
	const post = await prisma.blogPost.findUnique({
		where: { translationKey },
		select: {
			translations: {
				where: { locale },
				select: { slug: true },
				take: 1,
			},
		},
	})
	const slug = post?.translations[0]?.slug
	return slug ? blogPostPath(slug, locale) : ""
}

export async function localizedBlogPostAlternates(translationKey: string) {
	const post = await prisma.blogPost.findUnique({
		where: { translationKey },
		select: {
			translations: {
				select: { locale: true, slug: true },
			},
		},
	})
	const alternates: Record<string, string> = {}
	post?.translations.forEach((translation) => {
		const locale = publicLocaleFromDb(translation.locale)
		if (!locale) return
		alternates[blogHrefLang(locale)] = blogPostPath(translation.slug, locale)
	})
	if (alternates.en) alternates["x-default"] = alternates.en
	return alternates
}

function publicLocaleFromDb(locale: string): PublicLocale | null {
	if (locale === "pt-br" || locale === "pt") return "pt-br"
	if (locale === "es") return "es"
	if (locale === "en") return "en"
	return null
}
