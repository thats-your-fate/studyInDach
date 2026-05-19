import Layout from "@/components/layout/Layout"
import Section1 from "@/components/sections/courses/Section1"
import Section2 from "@/components/sections/courses/Section2"
import { absoluteUrl } from "@/lib/seo"
import { getCoursesPageData } from "@/lib/study-programs"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

type CoursePageSearchParams = Record<string, string | string[] | undefined>

export function generateMetadata({ searchParams }: { searchParams?: CoursePageSearchParams }): Metadata {
	const title = coursePageTitleEs(searchParams)
	const canonicalPath = courseCanonicalPath(searchParams, "/es/programas")
	return {
		title,
		description: "Explora programas de licenciatura, maestría y doctorado en Alemania, Austria y Suiza. Filtra por nivel, área, idioma, matrícula y formato de estudio.",
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages: {
				en: absoluteUrl(courseCanonicalPath(searchParams, "/courses")),
				es: absoluteUrl(canonicalPath),
				"pt-BR": absoluteUrl(courseCanonicalPath(searchParams, "/pt-br/cursos")),
				"x-default": absoluteUrl(courseCanonicalPath(searchParams, "/courses")),
			},
		},
	}
}

export default async function Programas({ searchParams }: { searchParams?: CoursePageSearchParams }) {
	const { programs, universities, totalPrograms, totalMatching, page, totalPages, pageSize, filters, search, filterOptions } = await getCoursesPageData(searchParams, "es")
	const title = coursePageTitleEs(searchParams).replace(" | Study in DACH", "")

	return (
		<Layout>
			<Section1 title={title} eyebrow="Programas de estudio en DACH" />
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
				locale="es"
			/>
		</Layout>
	)
}

function coursePageTitleEs(searchParams?: CoursePageSearchParams) {
	const degreeLevel = firstParam(searchParams?.degreeLevel)
	const country = firstParam(searchParams?.country)
	const language = firstParam(searchParams?.languageOfInstruction) || firstParam(searchParams?.language)
	const field = firstParam(searchParams?.studyField)
	const degreeLabel = degreeLevel === "Master"
		? "Programas de maestría"
		: degreeLevel === "Bachelor"
			? "Programas de licenciatura"
			: degreeLevel === "Doctorate"
				? "Programas de doctorado"
				: language === "English"
					? "Programas en inglés"
					: "Programas de estudio"
	const fieldPart = field ? ` en ${field}` : ""
	const languagePart = language && language !== "English" ? ` en ${language}` : ""
	const region = country ? translateCountry(country) : "Alemania, Austria y Suiza"
	return `${degreeLabel}${fieldPart}${languagePart} en ${region} | Study in DACH`
}

function firstParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] || "" : value || ""
}

function translateCountry(country: string) {
	if (country === "Germany") return "Alemania"
	if (country === "Austria") return "Austria"
	if (country === "Switzerland") return "Suiza"
	return country
}

function courseCanonicalPath(searchParams: CoursePageSearchParams | undefined, pathname: string) {
	const params = new URLSearchParams()
	const allowed = ["degreeLevel", "country", "studyField", "tuitionType", "page"]
	allowed.forEach((key) => {
		const value = searchParams?.[key]
		const values = Array.isArray(value) ? value : value ? [value] : []
		values.filter(Boolean).forEach((item) => params.append(key, item))
	})
	const language = searchParams?.languageOfInstruction || searchParams?.language
	const languages = Array.isArray(language) ? language : language ? [language] : []
	languages.filter(Boolean).forEach((item) => params.append("languageOfInstruction", item))
	return params.toString() ? `${pathname}?${params.toString()}` : pathname
}

function itemListJsonLd(programs: Array<{ title: string; detailPath: string; universityName: string }>, searchParams?: CoursePageSearchParams) {
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		url: absoluteUrl(courseCanonicalPath(searchParams, "/es/programas")),
		itemListElement: programs.map((program, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(program.detailPath),
			name: `${program.title} at ${program.universityName}`,
		})),
	}
}
