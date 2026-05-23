import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { optionLabel } from "@/lib/i18n"
import { cleanDisplayValue, cleanProgramTitleForLocale, displayLanguageCombination } from "@/lib/program-display"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getLocalizedUniversityUrl } from "@/lib/localized-urls"
import { getUniversityUrl, normalizeCourseFilterParam, normalizeLanguageBuckets, normalizeStudyFields, programDetailPath, publicProgramWhere, type ProgramCard } from "@/lib/study-programs"
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
	const enPath = await getLocalizedUniversityUrl(university.id, "en")
	const ptPath = await getLocalizedUniversityUrl(university.id, "pt-br")
	const esPath = await getLocalizedUniversityUrl(university.id, "es")
	const canonicalPath = esPath || getUniversityUrl(university, "es")
	return {
		title: `${university.name} - programas de estudio | Study in DACH`,
		description: `Explora programas de estudio de ${university.name}.`,
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

export default async function UniversityEsPage({ params, searchParams }: Params) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				where: publicProgramWhere,
				include: { translations: { where: { locale: "es" }, take: 1 } },
				orderBy: [{ degreeLevel: "asc" }, { programName: "asc" }],
			},
		},
	})
	if (!university) notFound()

	const location = [optionLabel(university.location || "", "es"), optionLabel(university.state || "", "es")].filter(Boolean).join(", ")
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
					<div className="row g-4">
						{filteredPrograms.map((program) => (
							<div className="col-12 col-md-6 col-xl-4" key={program.id}>
								<CourseCard course={toUniversityProgramCard(program, university.name)} locale="es" variant="compact" />
							</div>
						))}
						{filteredPrograms.length === 0 && <div className="col-12">Ningún programa coincide con estos filtros.</div>}
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

function cleanUniversityTitle(title: string, universityName: string) {
	return cleanDisplayValue(title)
		.replace(new RegExp(`\\s+(at|en|de)\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
		.replace(new RegExp(`\\s+[-|–—]\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
}

function toUniversityProgramCard(program: any, universityName: string): ProgramCard {
	const translation = program.translations[0]
	const title = cleanUniversityTitle(cleanProgramTitleForLocale(translation?.localizedProgramName || program.programName, "es"), universityName)
	return {
		id: program.id,
		detailPath: programDetailPath({
			id: program.id,
			title,
			originalTitle: program.programName,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName,
		}, "es"),
		title,
		originalTitle: program.programName || "",
		degreeLevel: program.degreeLevel || "",
		academicDegree: program.academicDegree || "",
		subjectArea: translation?.subjectArea || program.subjectArea || "",
		duration: translation?.duration || program.duration || "",
		ects: program.ects || "",
		languageOfInstruction: translation?.languageOfInstruction || program.languageOfInstruction || "",
		country: "",
		universityId: program.universityId || "",
		universityName,
		location: "",
		state: "",
		img: "",
		heroImageUrl: program.heroImageUrl || "",
		fallbackImageUrl: "",
		authorImg: "",
		campusLocation: translation?.campusLocation || program.campusLocation || "",
		startTerms: translation?.startTerms || program.startTerms || "",
		tuitionOrFees: translation?.tuitionOrFees || program.tuitionOrFees || "",
		studyMode: translation?.studyMode || program.studyMode || "",
		restrictedAdmission: translation?.restrictedAdmission || program.restrictedAdmission || "",
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
		duplicateStatus: program.duplicateStatus || "unique",
		canonicalProgramId: program.canonicalProgramId || null,
	}
}

function escapeRegExp(value: string) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
