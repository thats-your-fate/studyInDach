import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { cleanDisplayValue, cleanProgramTitleForLocale, displayAcademicDegree, displayLanguageCombination, joinMetaSegments } from "@/lib/program-display"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getUniversityUrl, programDetailPath } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Params = {
	params: { slug: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
		studyField?: string
	}
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	const canonicalPath = getUniversityUrl(university, "es")
	return {
		title: `${university.name} - programas de estudio | Study in DACH`,
		description: `Explora programas de estudio de ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages: {
				en: absoluteUrl(getUniversityUrl(university, "en")),
				es: absoluteUrl(canonicalPath),
				"pt-BR": absoluteUrl(getUniversityUrl(university, "pt-br")),
				"x-default": absoluteUrl(getUniversityUrl(university, "en")),
			},
		},
	}
}

export default async function UniversityEsPage({ params, searchParams }: Params) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				where: { isPublished: true, isLikelyDegreeProgram: true, duplicateStatus: { not: "duplicate" }, canonicalProgramId: null },
				include: { translations: { where: { locale: "es" }, take: 1 } },
				orderBy: [{ degreeLevel: "asc" }, { programName: "asc" }],
			},
		},
	})
	if (!university) notFound()

	const location = [optionLabel(university.location || "", "es"), optionLabel(university.state || "", "es")].filter(Boolean).join(", ")
	const selectedDegree = cleanDisplayValue(searchParams?.degreeLevel)
	const selectedLanguage = cleanDisplayValue(searchParams?.languageOfInstruction)
	const selectedStudyField = cleanDisplayValue(searchParams?.studyField)
	const degreeOptions = uniqueOptions(university.programs.map((program) => program.degreeLevel))
	const languageOptions = uniqueOptions(university.programs.flatMap((program) => splitOptionValues(program.languageOfInstruction)))
	const studyFieldOptions = uniqueOptions(university.programs.map((program) => program.studyField || program.subjectArea))
	const filteredPrograms = university.programs
		.filter((program) => !selectedDegree || program.degreeLevel === selectedDegree)
		.filter((program) => !selectedLanguage || splitOptionValues(program.languageOfInstruction).includes(selectedLanguage))
		.filter((program) => !selectedStudyField || (program.studyField || program.subjectArea) === selectedStudyField)
		.slice(0, 30)

	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{location}</p>
							<h1>{university.name}</h1>
							<h2>{university.name} - programas de estudio</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/es/programas?university=${encodeURIComponent(university.name)}`}>Ver todos los programas</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">Sitio web de la universidad</a>}
						</div>
					</div>
					<ProgramFilters
						basePath={`/es/universidades/${university.id}`}
						degreeOptions={degreeOptions}
						languageOptions={languageOptions}
						studyFieldOptions={studyFieldOptions}
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
						selectedStudyField={selectedStudyField}
					/>
					<ul className="related-program-grid list-unstyled p-0 m-0">
						{filteredPrograms.map((program) => {
							const title = cleanUniversityTitle(cleanProgramTitleForLocale(program.translations[0]?.localizedProgramName || program.programName, "es"), university.name)
							const detailPath = programDetailPath({
								id: program.id,
								title,
								originalTitle: program.programName,
								degreeLevel: program.degreeLevel || "Degree program",
								universityName: university.name,
							}, "es")
							const degree = optionLabel(program.degreeLevel || "Program", "es")
							const field = optionLabel(program.studyField || program.subjectArea || "Study program", "es")
							const language = displayLanguageCombination(program.translations[0]?.languageOfInstruction || program.languageOfInstruction, "es", " / ")
							const meta = joinMetaSegments([degree, displayAcademicDegree(program.academicDegree), field, language])
							return (
								<li key={program.id}>
									<article className="related-program-card h-100">
										<h3><Link href={detailPath}>{title}</Link></h3>
										{meta && <div className="related-program-meta">{meta}</div>}
										<Link href={detailPath} className="related-program-action">Ver programa</Link>
									</article>
								</li>
							)
						})}
						{filteredPrograms.length === 0 && <li>Ningún programa coincide con estos filtros.</li>}
					</ul>
				</div>
			</section>
		</Layout>
	)
}

function ProgramFilters({
	basePath,
	degreeOptions,
	languageOptions,
	studyFieldOptions,
	selectedDegree,
	selectedLanguage,
	selectedStudyField,
}: {
	basePath: string
	degreeOptions: string[]
	languageOptions: string[]
	studyFieldOptions: string[]
	selectedDegree: string
	selectedLanguage: string
	selectedStudyField: string
}) {
	return (
		<form className="university-program-filters" method="get" action={basePath}>
			<label>
				<span>Nivel del programa</span>
				<select name="degreeLevel" defaultValue={selectedDegree}>
					<option value="">Todos</option>
					{degreeOptions.map((value) => <option value={value} key={value}>{optionLabel(value, "es")}</option>)}
				</select>
			</label>
			<label>
				<span>Idioma</span>
				<select name="languageOfInstruction" defaultValue={selectedLanguage}>
					<option value="">Todos</option>
					{languageOptions.map((value) => <option value={value} key={value}>{displayLanguageCombination(value, "es")}</option>)}
				</select>
			</label>
			<label>
				<span>Área de estudio</span>
				<select name="studyField" defaultValue={selectedStudyField}>
					<option value="">Todos</option>
					{studyFieldOptions.map((value) => <option value={value} key={value}>{optionLabel(value, "es")}</option>)}
				</select>
			</label>
			<button className="btn btn-primary" type="submit">Filtrar</button>
			{(selectedDegree || selectedLanguage || selectedStudyField) && <Link href={basePath} className="btn btn-outline-secondary">Limpiar filtros</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function splitOptionValues(value: string | null | undefined) {
	return cleanDisplayValue(value).split(/[;,/|+]+/).map((part) => cleanDisplayValue(part)).filter(Boolean)
}

function cleanUniversityTitle(title: string, universityName: string) {
	return cleanDisplayValue(title)
		.replace(new RegExp(`\\s+(at|en|de)\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
		.replace(new RegExp(`\\s+[-|–—]\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
