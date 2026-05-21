import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { cleanDisplayValue, cleanProgramTitleForLocale, displayLanguageCombination, joinMetaSegments, titleStartsWithDegree } from "@/lib/program-display"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { programDetailPath } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Params = {
	params: { slug: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
	}
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	return {
		title: `${university.name} - programas de estudio | Study in DACH`,
		description: `Explora programas de estudio de ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/es/universidades/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityEsPage({ params, searchParams }: Params) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				where: { isPublished: true, isLikelyDegreeProgram: true },
				include: { translations: { where: { locale: "es" }, take: 1 } },
				orderBy: [{ degreeLevel: "asc" }, { programName: "asc" }],
			},
		},
	})
	if (!university) notFound()

	const location = [university.location, optionLabel(university.state || "", "es")].filter(Boolean).join(", ")
	const selectedDegree = cleanDisplayValue(searchParams?.degreeLevel)
	const selectedLanguage = cleanDisplayValue(searchParams?.languageOfInstruction)
	const degreeOptions = uniqueOptions(university.programs.map((program) => program.degreeLevel))
	const languageOptions = uniqueOptions(university.programs.flatMap((program) => splitOptionValues(program.languageOfInstruction)))
	const filteredPrograms = university.programs
		.filter((program) => !selectedDegree || program.degreeLevel === selectedDegree)
		.filter((program) => !selectedLanguage || splitOptionValues(program.languageOfInstruction).includes(selectedLanguage))
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
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
					/>
					<div className="related-program-grid">
						{filteredPrograms.map((program) => {
							const title = cleanProgramTitleForLocale(program.translations[0]?.localizedProgramName || program.programName, "es")
							const degree = optionLabel(program.degreeLevel || "Program", "es")
							const field = optionLabel(program.studyField || program.subjectArea || "Study program", "es")
							const language = displayLanguageCombination(program.translations[0]?.languageOfInstruction || program.languageOfInstruction, "es", " / ")
							const showDegree = !titleStartsWithDegree(title, "es")
							const meta = joinMetaSegments([showDegree ? degree : "", field, language])
							return (
								<Link
									key={program.id}
									href={programDetailPath({
										id: program.id,
										title,
										originalTitle: program.programName,
										degreeLevel: program.degreeLevel || "Degree program",
										universityName: university.name,
									}, "es")}
									className="related-program-card"
								>
									<h3>{title}</h3>
									<p>{university.name}</p>
									{meta && <div className="related-program-meta">{meta}</div>}
									<span className="related-program-action">Ver programa</span>
								</Link>
							)
						})}
						{filteredPrograms.length === 0 && <p>Ningún programa coincide con estos filtros.</p>}
					</div>
				</div>
			</section>
		</Layout>
	)
}

function ProgramFilters({
	basePath,
	degreeOptions,
	languageOptions,
	selectedDegree,
	selectedLanguage,
}: {
	basePath: string
	degreeOptions: string[]
	languageOptions: string[]
	selectedDegree: string
	selectedLanguage: string
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
			<button className="btn btn-primary" type="submit">Filtrar</button>
			{(selectedDegree || selectedLanguage) && <Link href={basePath} className="btn btn-outline-secondary">Limpiar filtros</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function splitOptionValues(value: string | null | undefined) {
	return cleanDisplayValue(value).split(/[;,/|+]+/).map((part) => cleanDisplayValue(part)).filter(Boolean)
}
