import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/courses/Section1"
import Section2 from "@/components/sections/courses/Section2"
import { absoluteUrl } from "@/lib/seo"
import { getCoursesPageData } from "@/lib/study-programs"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

type CoursePageSearchParams = Record<string, string | string[] | undefined>

export function generateMetadata({
	searchParams,
}: {
	searchParams?: CoursePageSearchParams
}): Metadata {
	const title = coursePageTitlePt(searchParams)
	const canonicalPath = courseCanonicalPathPt(searchParams)

	return {
		title,
		description: "Explore programas de graduação, mestrado e doutorado na Alemanha, Áustria e Suíça. Filtre por nível, área, idioma, mensalidade e formato de estudo.",
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages: {
				"pt-BR": absoluteUrl(canonicalPath),
				en: absoluteUrl(courseCanonicalPathEn(searchParams)),
				"x-default": absoluteUrl(courseCanonicalPathEn(searchParams)),
			},
		},
	}
}

export default async function Cursos({
	searchParams,
}: {
	searchParams?: CoursePageSearchParams
}) {
	const { programs, universities, totalPrograms, totalMatching, page, totalPages, pageSize, filters, search, filterOptions } = await getCoursesPageData(searchParams, "pt-br")
	const title = coursePageTitlePt(searchParams).replace(" | Study in DACH", "")

	return (
		<Layout>
			<Section1 title={title} eyebrow="Programas de estudo no DACH" />
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
				locale="pt-br"
			/>
		</Layout>
	)
}

function coursePageTitlePt(searchParams?: CoursePageSearchParams) {
	const degreeLevel = firstParam(searchParams?.degreeLevel)
	const country = firstParam(searchParams?.country)
	const language = firstParam(searchParams?.language)
	const field = firstParam(searchParams?.studyField)

	const degreeLabel = degreeLevel === "Master"
		? "Programas de mestrado"
		: degreeLevel === "Bachelor"
			? "Programas de bacharelado"
			: degreeLevel === "Doctorate"
				? "Programas de doutorado"
				: language === "English"
					? "Programas em inglês"
					: "Programas de estudo"
	const fieldPart = field ? ` em ${field}` : ""
	const languagePart = language && language !== "English" ? ` em ${language}` : ""
	const region = country ? translateCountry(country) : "Alemanha, Áustria e Suíça"
	return `${degreeLabel}${fieldPart}${languagePart} na ${region} | Study in DACH`
}

function firstParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] || "" : value || ""
}

function translateCountry(country: string) {
	if (country === "Germany") return "Alemanha"
	if (country === "Austria") return "Áustria"
	if (country === "Switzerland") return "Suíça"
	return country
}

function courseCanonicalPathPt(searchParams?: CoursePageSearchParams) {
	return courseCanonicalPath(searchParams, "/pt-br/cursos")
}

function courseCanonicalPathEn(searchParams?: CoursePageSearchParams) {
	return courseCanonicalPath(searchParams, "/courses")
}

function courseCanonicalPath(searchParams: CoursePageSearchParams | undefined, pathname: string) {
	const params = new URLSearchParams()
	const allowed = ["degreeLevel", "language", "country", "studyField", "tuitionType", "page"]
	allowed.forEach((key) => {
		const value = searchParams?.[key]
		const values = Array.isArray(value) ? value : value ? [value] : []
		values.filter(Boolean).forEach((item) => params.append(key, item))
	})
	return params.toString() ? `${pathname}?${params.toString()}` : pathname
}

function itemListJsonLd(programs: Array<{ title: string; detailPath: string; universityName: string }>, searchParams?: CoursePageSearchParams) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		url: absoluteUrl(courseCanonicalPathPt(searchParams)),
		itemListElement: programs.map((program, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(program.detailPath),
			name: `${program.title} at ${program.universityName}`,
		})),
	}
}
