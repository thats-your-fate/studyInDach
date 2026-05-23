import { dbTranslationLocale, type PublicLocale } from "@/lib/i18n"
import { getLocalizedStaticUrl } from "@/lib/localized-static-urls"
import { prisma } from "@/lib/prisma"
import { getProgramUrl, getUniversityUrl } from "@/lib/study-programs"

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
