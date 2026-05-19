import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/single-courses/Section1"
import Section2 from "@/components/sections/single-courses/Section2"
import { optionLabel } from "@/lib/i18n"
import { absoluteUrl } from "@/lib/seo"
import { getProgramDetailBySlugs, getProgramPathByLocale, programDetailPath, type ProgramDetail } from "@/lib/study-programs"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type ProgramSeoParams = {
	params: { university: string; degree: string; program: string }
}

export async function generateMetadata({ params }: ProgramSeoParams): Promise<Metadata> {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program, "es")
	if (!result) return {}

	const { program, canonicalPath } = result
	const title = program.seoTitle || `${program.title} en ${program.universityName}`
	const description = program.seoDescription || program.summary || `Conoce ${program.title} en ${program.universityName}.`
	const languages: Record<string, string> = {
		en: absoluteUrl(programDetailPath(program, "en")),
		es: absoluteUrl(canonicalPath),
		"x-default": absoluteUrl(programDetailPath(program, "en")),
	}
	if (program.availableTranslationLocales.includes("pt")) {
		languages["pt-BR"] = absoluteUrl(await getProgramPathByLocale(program.id, "pt-br") || programDetailPath(program, "pt-br"))
	}

	return {
		title,
		description,
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages,
		},
		openGraph: {
			title,
			description,
			url: absoluteUrl(canonicalPath),
			type: "website",
			images: program.heroImageUrl ? [{ url: program.heroImageUrl }] : undefined,
		},
	}
}

export default async function ProgramSeoPage({ params }: ProgramSeoParams) {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program, "es")
	if (!result) notFound()
	if (!result.isCanonical) redirect(result.canonicalPath)

	return (
		<Layout>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(programJsonLd(result.program, result.canonicalPath)) }}
			/>
			<Section1 program={result.program} />
			<Section2 program={result.program} locale="es" />
		</Layout>
	)
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
			address: [program.location, program.state, optionLabel(program.country, "es")].filter(Boolean).join(", "),
		},
		educationalCredentialAwarded: program.academicDegree || program.degreeLevel,
		timeToComplete: program.duration || undefined,
		inLanguage: program.languageOfInstruction || undefined,
	}
}
