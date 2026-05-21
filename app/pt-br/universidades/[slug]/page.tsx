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

type UniversityPageProps = {
	params: { slug: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
	}
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	return {
		title: `${university.name} - programas de estudo | Study in DACH`,
		description: `Explore programas de estudo na ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/pt-br/universidades/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityPtPage({ params, searchParams }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				where: { isPublished: true, isLikelyDegreeProgram: true },
				orderBy: { programName: "asc" },
				include: {
					translations: { where: { locale: "pt" }, take: 1 },
				},
			},
		},
	})

	if (!university) notFound()

	const location = [university.location, optionLabel(university.state || "", "pt-br")].filter(Boolean).join(", ") || "DACH"
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
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-bank-line text-green-3" />
						&nbsp; perfil da universidade
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{university.name}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{location}</p>
							<h2>{university.name} - programas de estudo</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/pt-br/cursos?university=${encodeURIComponent(university.name)}`}>Ver todos os programas</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">Site da universidade</a>}
						</div>
					</div>
					<ProgramFilters
						basePath={`/pt-br/universidades/${university.id}`}
						degreeOptions={degreeOptions}
						languageOptions={languageOptions}
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
					/>
					<div className="related-program-grid">
						{filteredPrograms.map((program) => {
							const title = cleanProgramTitleForLocale(program.translations[0]?.localizedProgramName || program.programName, "pt-br")
							const degree = optionLabel(program.degreeLevel || "Program", "pt-br")
							const field = optionLabel(program.studyField || program.subjectArea || "Study program", "pt-br")
							const language = displayLanguageCombination(program.translations[0]?.languageOfInstruction || program.languageOfInstruction, "pt-br", " / ")
							const showDegree = !titleStartsWithDegree(title, "pt-br")
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
									}, "pt-br")}
									className="related-program-card"
								>
									<h3>{title}</h3>
									<p>{university.name}</p>
									{meta && <div className="related-program-meta">{meta}</div>}
									<span className="related-program-action">Ver programa</span>
								</Link>
							)
						})}
						{filteredPrograms.length === 0 && <p>Nenhum programa corresponde a estes filtros.</p>}
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
				<span>Nível do curso</span>
				<select name="degreeLevel" defaultValue={selectedDegree}>
					<option value="">Todos</option>
					{degreeOptions.map((value) => <option value={value} key={value}>{optionLabel(value, "pt-br")}</option>)}
				</select>
			</label>
			<label>
				<span>Idioma</span>
				<select name="languageOfInstruction" defaultValue={selectedLanguage}>
					<option value="">Todos</option>
					{languageOptions.map((value) => <option value={value} key={value}>{displayLanguageCombination(value, "pt-br")}</option>)}
				</select>
			</label>
			<button className="btn btn-primary" type="submit">Filtrar</button>
			{(selectedDegree || selectedLanguage) && <Link href={basePath} className="btn btn-outline-secondary">Limpar filtros</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function splitOptionValues(value: string | null | undefined) {
	return cleanDisplayValue(value).split(/[;,/|+]+/).map((part) => cleanDisplayValue(part)).filter(Boolean)
}
