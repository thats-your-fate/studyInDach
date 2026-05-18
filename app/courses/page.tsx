import { getCoursesPageData } from '@/lib/study-programs'
import Section2 from '@/components/sections/courses/Section2'
import Layout from "@/components/layout/Layout"
import Section1 from '@/components/sections/courses/Section1'
import type { Metadata } from 'next'
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
	}
}

export default async function Courses({
	searchParams,
}: {
	searchParams?: CoursePageSearchParams
}) {
	const { programs, universities, totalPrograms, totalMatching, page, totalPages, pageSize, filters, search, filterOptions } = await getCoursesPageData(searchParams)

	return (
		<>

			<Layout>
				<Section1 />
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

	const prefix = [
		degreeLevel ? `${degreeLevel} Degree Programs` : "Degree Programs",
		field ? `in ${field}` : "",
		language ? `Taught in ${language}` : "",
	].filter(Boolean).join(" ")

	const region = country || "Germany, Austria and Switzerland"
	return `${prefix} in ${region} | Study in DACH`
}

function firstParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] || "" : value || ""
}
