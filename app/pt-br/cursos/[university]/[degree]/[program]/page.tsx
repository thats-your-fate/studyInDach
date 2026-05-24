import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/single-courses/Section1"
import Section2 from "@/components/sections/single-courses/Section2"
import { optionLabel } from "@/lib/i18n"
import { getLocalizedProgramUrl } from "@/lib/localized-urls"
import { absoluteUrl } from "@/lib/seo"
import { getProgramDetailBySlugs, isProgramSeoIndexable, type ProgramDetail } from "@/lib/study-programs"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type ProgramSeoParams = {
	params: { university: string; degree: string; program: string }
}

export async function generateMetadata({ params }: ProgramSeoParams): Promise<Metadata> {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program, "pt-br")

	if (!result) {
		return {}
	}

	const { program, canonicalPath } = result
	const title = program.seoTitle || `${program.title} na ${program.universityName}`
	const description = program.seoDescription || program.summary || `Conheça ${program.title} na ${program.universityName}.`
	const englishPath = await getLocalizedProgramUrl(program.id, "en")
	const ptPath = await getLocalizedProgramUrl(program.id, "pt-br")
	const esPath = await getLocalizedProgramUrl(program.id, "es")
	const localizedCanonicalPath = ptPath || canonicalPath
	const languages: Record<string, string> = {
		en: absoluteUrl(englishPath),
		"pt-BR": absoluteUrl(ptPath),
		es: absoluteUrl(esPath),
		"x-default": absoluteUrl(englishPath),
	}

	return {
		title,
		description,
		robots: isProgramSeoIndexable(program) ? undefined : { index: false, follow: true },
		alternates: {
			canonical: absoluteUrl(localizedCanonicalPath),
			languages,
		},
		openGraph: {
			title,
			description,
			url: absoluteUrl(localizedCanonicalPath),
			type: "website",
			images: program.heroImageUrl ? [{ url: program.heroImageUrl }] : undefined,
		},
	}
}

export default async function ProgramSeoPage({
	params,
}: ProgramSeoParams) {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program, "pt-br")

	if (!result) {
		notFound()
	}

	if (!result.isCanonical) {
		redirect(result.canonicalPath)
	}
	const languageLinks = await programLanguageLinks(result.program.id)

	return (
		<Layout languageLinks={languageLinks}>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(programJsonLd(result.program, result.canonicalPath)) }}
			/>
			<Section1 program={result.program} />
			<Section2 program={result.program} locale="pt-br" />
		</Layout>
	)
}

async function programLanguageLinks(programId: number) {
	return {
		en: await getLocalizedProgramUrl(programId, "en") || "/courses",
		"pt-br": await getLocalizedProgramUrl(programId, "pt-br") || "/pt-br/cursos",
		es: await getLocalizedProgramUrl(programId, "es") || "/es/programas",
	}
}

function programJsonLd(program: ProgramDetail, canonicalPath: string) {
	return {
		"@context": "https://schema.org",
		"@type": ["Course", "EducationalOccupationalProgram"],
		name: program.title,
		alternateName: program.originalTitle && program.originalTitle !== program.title ? program.originalTitle : undefined,
		description: program.summary || program.seoDescription,
		url: absoluteUrl(canonicalPath),
		provider: {
			"@type": "CollegeOrUniversity",
			name: program.universityName,
			url: program.websiteUrl || undefined,
			address: [program.location, program.state, optionLabel(program.country, "pt-br")].filter(Boolean).join(", "),
		},
		educationalCredentialAwarded: program.academicDegree || program.degreeLevel,
		timeToComplete: program.duration || undefined,
		inLanguage: program.languageOfInstruction || undefined,
	}
}
