import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/single-courses/Section1"
import Section2 from "@/components/sections/single-courses/Section2"
import { getProgramDetailBySlugs } from "@/lib/study-programs"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

export const dynamic = "force-dynamic"

type ProgramSeoParams = {
	params: { university: string; degree: string; program: string }
}

export async function generateMetadata({ params }: ProgramSeoParams): Promise<Metadata> {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program)

	if (!result) {
		return {}
	}

	const { program, canonicalPath } = result
	const title = program.seoTitle || `${program.title} at ${program.universityName}`
	const description = program.seoDescription || program.summary || `Discover ${program.title} at ${program.universityName}.`

	return {
		title,
		description,
		alternates: {
			canonical: canonicalPath,
		},
		openGraph: {
			title,
			description,
			url: canonicalPath,
			type: "website",
			images: program.heroImageUrl ? [{ url: program.heroImageUrl }] : undefined,
		},
	}
}

export default async function ProgramSeoPage({
	params,
}: ProgramSeoParams) {
	const result = await getProgramDetailBySlugs(params.university, params.degree, params.program)

	if (!result) {
		notFound()
	}

	if (!result.isCanonical) {
		redirect(result.canonicalPath)
	}

	return (
		<Layout>
			<Section1 program={result.program} />
			<Section2 program={result.program} />
		</Layout>
	)
}
