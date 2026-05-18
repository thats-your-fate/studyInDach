import { getCoursesPageData } from '@/lib/study-programs'
import Section2 from '@/components/sections/courses/Section2'
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/courses/Section1'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/seo'
export const dynamic = "force-dynamic"

type CoursePageSearchParams = Record<string, string | string[] | undefined>

export function generateMetadata({
	searchParams,
}: {
	searchParams?: CoursePageSearchParams
}): Metadata {
	return {
		title: coursePageTitle(searchParams),
		description: "Browse degree programs in Germany, Austria, and Switzerland. Filter by degree level, subject, language, tuition type, and study mode.",
		alternates: {
			canonical: absoluteUrl(courseCanonicalPath(searchParams)),
		},
	}
}

export default async function Courses({
	searchParams,
}: {
	searchParams?: CoursePageSearchParams
}) {
	const { programs, universities, totalPrograms, totalMatching, page, totalPages, pageSize, filters, search, filterOptions } = await getCoursesPageData(searchParams)
	const title = coursePageTitle(searchParams).replace(" | Study in DACH", "")

	return (
		<>

			<Layout>
				<Section1 title={title} />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(programs, searchParams)) }}
				/>
				<Section2
					courses={programs}
					universities={universities}
					totalPrograms={totalPrograms}
					totalMatching={totalMatching}
					page={page}
					totalPages={totalPages}
					pageSize={pageSize}
					initialFilters={filters}
					initialSearch={search}
					filterOptions={filterOptions}
				/>
			</Layout>
		</>
	)
}

function coursePageTitle(searchParams?: CoursePageSearchParams) {
	const degreeLevel = firstParam(searchParams?.degreeLevel)
	const country = firstParam(searchParams?.country)
	const language = firstParam(searchParams?.language)
	const field = firstParam(searchParams?.studyField)

	const languagePrefix = language === "English" && !degreeLevel ? "English-taught " : ""
	const prefix = [
		degreeLevel ? `${degreeLevel} Degree Programs` : `${languagePrefix}Degree Programs`,
		field ? `in ${field}` : "",
		language && language !== "English" ? `Taught in ${language}` : "",
	].filter(Boolean).join(" ")

	const region = country || "Germany, Austria and Switzerland"
	return `${prefix} in ${region} | Study in DACH`
}

function firstParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] || "" : value || ""
}

function courseCanonicalPath(searchParams?: CoursePageSearchParams) {
	const params = new URLSearchParams()
	const allowed = ["degreeLevel", "language", "country", "studyField", "tuitionType", "page"]
	allowed.forEach((key) => {
		const value = searchParams?.[key]
		const values = Array.isArray(value) ? value : value ? [value] : []
		values.filter(Boolean).forEach((item) => params.append(key, item))
	})
	return params.toString() ? `/courses?${params.toString()}` : "/courses"
}

function itemListJsonLd(programs: Array<{ title: string; detailPath: string; universityName: string }>, searchParams?: CoursePageSearchParams) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		url: absoluteUrl(courseCanonicalPath(searchParams)),
		itemListElement: programs.map((program, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(program.detailPath),
			name: `${program.title} at ${program.universityName}`,
		})),
	}
}
