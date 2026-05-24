import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { cleanDisplayValue, displayLanguageCombination } from "@/lib/program-display"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getLocalizedUniversityUrl } from "@/lib/localized-urls"
import { getUniversityUrl, normalizeCourseFilterParam, normalizeLanguageBuckets, normalizeStudyFields, programDetailPath, publicProgramWhere, type ProgramCard } from "@/lib/study-programs"
import { formatLocation } from "@/lib/university-display"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type UniversityPageProps = {
	params: { id: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
		studyField?: string
	}
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.id } })
	if (!university) return {}
	const enPath = await getLocalizedUniversityUrl(university.id, "en")
	const ptPath = await getLocalizedUniversityUrl(university.id, "pt-br")
	const esPath = await getLocalizedUniversityUrl(university.id, "es")
	const canonicalPath = enPath || getUniversityUrl(university, "en")
	return {
		title: `${university.name} Degree Programs | Study in DACH`,
		description: `Browse degree programs at ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(canonicalPath),
			languages: {
				en: absoluteUrl(enPath),
				es: absoluteUrl(esPath),
				"pt-BR": absoluteUrl(ptPath),
				"x-default": absoluteUrl(enPath),
			},
		},
	}
}

export default async function UniversityPage({ params, searchParams }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.id },
		include: {
			programs: {
				where: publicProgramWhere,
				orderBy: { programName: "asc" },
			},
		},
	})

	if (!university) notFound()

	const selectedDegree = cleanDisplayValue(searchParams?.degreeLevel)
	const selectedLanguage = normalizeCourseFilterParam("language", cleanDisplayValue(searchParams?.languageOfInstruction))
	const selectedStudyField = normalizeCourseFilterParam("studyField", cleanDisplayValue(searchParams?.studyField))
	const degreeOptions = uniqueOptions(university.programs.map((program) => program.degreeLevel))
	const languageOptions = uniqueOptions(university.programs.flatMap((program) => normalizeLanguageBuckets(program.languageOfInstruction)))
	const studyFieldOptions = uniqueOptions(university.programs.flatMap((program) => normalizeStudyFields([program.studyField, program.secondaryStudyField, program.subjectArea])))
	const filteredPrograms = university.programs
		.filter((program) => !selectedDegree || program.degreeLevel === selectedDegree)
		.filter((program) => !selectedLanguage || normalizeLanguageBuckets(program.languageOfInstruction).includes(selectedLanguage))
		.filter((program) => !selectedStudyField || normalizeStudyFields([program.studyField, program.secondaryStudyField, program.subjectArea]).includes(selectedStudyField))
		.slice(0, 30)
	const languageLinks = await universityLanguageLinks(university.id)

	return (
		<Layout languageLinks={languageLinks}>
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
							<p>{formatLocation(university.location, university.state, null, "en") || "DACH"}</p>
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
						studyFieldOptions={studyFieldOptions}
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
						selectedStudyField={selectedStudyField}
						labels={{
							degree: "Degree level",
							language: "Language",
							studyField: "Study field",
							all: "All",
							filter: "Filter",
							clear: "Clear filters",
						}}
					/>
					<div className="row g-4">
						{filteredPrograms.map((program) => (
							<div className="col-12 col-md-6 col-xl-4" key={program.id}>
								<CourseCard course={toUniversityProgramCard(program, university.name)} locale="en" variant="compact" />
							</div>
						))}
						{filteredPrograms.length === 0 && <div className="col-12">No programs match these filters.</div>}
					</div>
				</div>
			</section>
		</Layout>
	)
}

async function universityLanguageLinks(universityId: string) {
	return {
		en: await getLocalizedUniversityUrl(universityId, "en") || "/universities",
		"pt-br": await getLocalizedUniversityUrl(universityId, "pt-br") || "/pt-br/universidades",
		es: await getLocalizedUniversityUrl(universityId, "es") || "/es/universidades",
	}
}

function ProgramFilters({
	basePath,
	degreeOptions,
	languageOptions,
	studyFieldOptions,
	selectedDegree,
	selectedLanguage,
	selectedStudyField,
	labels,
}: {
	basePath: string
	degreeOptions: string[]
	languageOptions: string[]
	studyFieldOptions: string[]
	selectedDegree: string
	selectedLanguage: string
	selectedStudyField: string
	labels: { degree: string; language: string; studyField: string; all: string; filter: string; clear: string }
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
			<label>
				<span>{labels.studyField}</span>
				<select name="studyField" defaultValue={selectedStudyField}>
					<option value="">{labels.all}</option>
					{studyFieldOptions.map((value) => <option value={value} key={value}>{value}</option>)}
				</select>
			</label>
			<button className="btn btn-primary" type="submit">{labels.filter}</button>
			{(selectedDegree || selectedLanguage || selectedStudyField) && <Link href={basePath} className="btn btn-outline-secondary">{labels.clear}</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function cleanUniversityTitle(title: string, universityName: string) {
	return cleanDisplayValue(title)
		.replace(new RegExp(`\\s+(at|by)\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
		.replace(new RegExp(`\\s+[-|–—]\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
}

function toUniversityProgramCard(program: any, universityName: string): ProgramCard {
	const title = cleanUniversityTitle(program.programName, universityName)
	return {
		id: program.id,
		detailPath: programDetailPath({
			id: program.id,
			title,
			originalTitle: program.programName,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName,
		}),
		title,
		originalTitle: program.programName || "",
		degreeLevel: program.degreeLevel || "",
		academicDegree: program.academicDegree || "",
		subjectArea: program.subjectArea || "",
		duration: program.duration || "",
		ects: program.ects || "",
		languageOfInstruction: program.languageOfInstruction || "",
		country: "",
		universityId: program.universityId || "",
		universityName,
		location: "",
		state: "",
		img: "",
		heroImageUrl: program.heroImageUrl || "",
		fallbackImageUrl: "",
		authorImg: "",
		campusLocation: program.campusLocation || "",
		startTerms: program.startTerms || "",
		tuitionOrFees: program.tuitionOrFees || "",
		studyMode: program.studyMode || "",
		restrictedAdmission: program.restrictedAdmission || "",
		summary: "",
		studyField: program.studyField || "",
		secondaryStudyField: program.secondaryStudyField || "",
		internationalStudentFit: program.internationalStudentFit || "",
		onlineOrOnCampus: program.onlineOrOnCampus || "",
		fullTimeOrPartTime: program.fullTimeOrPartTime || "",
		applicationDifficulty: program.applicationDifficulty || "",
		tuitionType: program.tuitionType || "",
		workExperienceRequired: program.workExperienceRequired || "",
		metadataConfidence: program.metadataConfidence || "",
		reviewStatus: program.reviewStatus || "pending",
		isPublished: program.isPublished ?? true,
			isLikelyDegreeProgram: program.isLikelyDegreeProgram ?? true,
			qualityFlags: program.qualityFlags || "",
			contentType: program.contentType || "degree_program",
			isSitemapIncluded: program.isSitemapIncluded ?? null,
			publicCatalogPriority: program.publicCatalogPriority || 0,
			reviewNotes: program.reviewNotes || "",
			duplicateStatus: program.duplicateStatus || "unique",
			canonicalProgramId: program.canonicalProgramId || null,
		}
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
