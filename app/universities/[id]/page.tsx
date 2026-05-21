import Layout from "@/components/layout/Layout"
import { cleanDisplayValue, displayLanguageCombination, joinMetaSegments } from "@/lib/program-display"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { programDetailPath } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type UniversityPageProps = {
	params: { id: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
	}
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.id } })
	if (!university) return {}
	return {
		title: `${university.name} Degree Programs | Study in DACH`,
		description: `Browse degree programs at ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/universities/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityPage({ params, searchParams }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.id },
		include: {
			programs: {
				where: { isPublished: true, isLikelyDegreeProgram: true },
				orderBy: { programName: "asc" },
			},
		},
	})

	if (!university) notFound()

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
						&nbsp; university profile
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{university.name}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{[university.location, university.state].filter(Boolean).join(", ") || "DACH"}</p>
							<h2>Programs at {university.name}</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/courses?university=${encodeURIComponent(university.name)}`}>View all programs</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">University website</a>}
						</div>
					</div>
					<ProgramFilters
						basePath={`/universities/${university.id}`}
						degreeOptions={degreeOptions}
						languageOptions={languageOptions}
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
						labels={{
							degree: "Degree level",
							language: "Language",
							all: "All",
							filter: "Filter",
							clear: "Clear filters",
						}}
					/>
					<div className="related-program-grid">
						{filteredPrograms.map((program) => {
							const meta = joinMetaSegments([
								program.degreeLevel || "Program",
								program.studyField || program.subjectArea || "Study program",
								displayLanguageCombination(program.languageOfInstruction, "en", " / "),
							])
							return (
								<Link
									key={program.id}
									href={programDetailPath({
										id: program.id,
										title: program.programName,
										degreeLevel: program.degreeLevel || "Degree program",
										universityName: university.name,
									})}
									className="related-program-card"
								>
									<h3>{program.programName}</h3>
									<p>{university.name}</p>
									{meta && <div className="related-program-meta">{meta}</div>}
									<span className="related-program-action">View program</span>
								</Link>
							)
						})}
						{filteredPrograms.length === 0 && <p>No programs match these filters.</p>}
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
	labels,
}: {
	basePath: string
	degreeOptions: string[]
	languageOptions: string[]
	selectedDegree: string
	selectedLanguage: string
	labels: { degree: string; language: string; all: string; filter: string; clear: string }
}) {
	return (
		<form className="university-program-filters" method="get" action={basePath}>
			<label>
				<span>{labels.degree}</span>
				<select name="degreeLevel" defaultValue={selectedDegree}>
					<option value="">{labels.all}</option>
					{degreeOptions.map((value) => <option value={value} key={value}>{value}</option>)}
				</select>
			</label>
			<label>
				<span>{labels.language}</span>
				<select name="languageOfInstruction" defaultValue={selectedLanguage}>
					<option value="">{labels.all}</option>
					{languageOptions.map((value) => <option value={value} key={value}>{displayLanguageCombination(value, "en")}</option>)}
				</select>
			</label>
			<button className="btn btn-primary" type="submit">{labels.filter}</button>
			{(selectedDegree || selectedLanguage) && <Link href={basePath} className="btn btn-outline-secondary">{labels.clear}</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function splitOptionValues(value: string | null | undefined) {
	return cleanDisplayValue(value).split(/[;,/|+]+/).map((part) => cleanDisplayValue(part)).filter(Boolean)
}
