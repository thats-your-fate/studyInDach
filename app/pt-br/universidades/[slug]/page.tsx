import Layout from "@/components/layout/Layout"
import CourseCard from "@/components/sections/courses/CourseCard"
import { optionLabel } from "@/lib/i18n"
import { cleanDisplayValue, cleanProgramTitleForLocale, displayLanguageCombination } from "@/lib/program-display"
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
	params: { slug: string }
	searchParams?: {
		degreeLevel?: string
		languageOfInstruction?: string
		studyField?: string
	}
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	const enPath = await getLocalizedUniversityUrl(university.id, "en")
	const ptPath = await getLocalizedUniversityUrl(university.id, "pt-br")
	const esPath = await getLocalizedUniversityUrl(university.id, "es")
	const canonicalPath = ptPath || getUniversityUrl(university, "pt-br")
	return {
		title: `${university.name} - programas de estudo | Study in DACH`,
		description: `Explore programas de estudo na ${university.name}.`,
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

export default async function UniversityPtPage({ params, searchParams }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				where: publicProgramWhere,
				orderBy: { programName: "asc" },
				include: {
					translations: { where: { locale: "pt" }, take: 1 },
				},
			},
		},
	})

	if (!university) notFound()

	const location = formatLocation(university.location, university.state, null, "pt-br") || "DACH"
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
						studyFieldOptions={studyFieldOptions}
						selectedDegree={selectedDegree}
						selectedLanguage={selectedLanguage}
						selectedStudyField={selectedStudyField}
					/>
					<div className="row g-4">
						{filteredPrograms.map((program) => (
							<div className="col-12 col-md-6 col-xl-4" key={program.id}>
								<CourseCard course={toUniversityProgramCard(program, university.name)} locale="pt-br" variant="compact" />
							</div>
						))}
						{filteredPrograms.length === 0 && <div className="col-12">Nenhum programa corresponde a estes filtros.</div>}
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
			<label>
				<span>Área de estudo</span>
				<select name="studyField" defaultValue={selectedStudyField}>
					<option value="">Todos</option>
					{studyFieldOptions.map((value) => <option value={value} key={value}>{optionLabel(value, "pt-br")}</option>)}
				</select>
			</label>
			<button className="btn btn-primary" type="submit">Filtrar</button>
			{(selectedDegree || selectedLanguage || selectedStudyField) && <Link href={basePath} className="btn btn-outline-secondary">Limpar filtros</Link>}
		</form>
	)
}

function uniqueOptions(values: Array<string | null | undefined>) {
	return Array.from(new Set(values.map((value) => cleanDisplayValue(value)).filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function cleanUniversityTitle(title: string, universityName: string) {
	return cleanDisplayValue(title)
		.replace(new RegExp(`\\s+(at|na|no|pela|pelo)\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
		.replace(new RegExp(`\\s+[-|–—]\\s+${escapeRegExp(universityName)}\\s*$`, "i"), "")
}

function toUniversityProgramCard(program: any, universityName: string): ProgramCard {
	const translation = program.translations[0]
	const title = cleanUniversityTitle(cleanProgramTitleForLocale(translation?.localizedProgramName || program.programName, "pt-br"), universityName)
	return {
		id: program.id,
		detailPath: programDetailPath({
			id: program.id,
			title,
			originalTitle: program.programName,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName,
		}, "pt-br"),
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
