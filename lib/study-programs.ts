import { prisma } from "@/lib/prisma"
import fs from "node:fs"
import path from "node:path"

export type ProgramCard = {
	id: number
	detailPath: string
	title: string
	degreeLevel: string
	academicDegree: string
	subjectArea: string
	duration: string
	ects: string
	languageOfInstruction: string
	country: string
	universityId: string
	universityName: string
	location: string
	state: string
	img: string
	heroImageUrl: string
	fallbackImageUrl: string
	authorImg: string
	campusLocation: string
	startTerms: string
	tuitionOrFees: string
	studyMode: string
	restrictedAdmission: string
	summary: string
	studyField: string
	secondaryStudyField: string
	internationalStudentFit: string
	onlineOrOnCampus: string
	fullTimeOrPartTime: string
	applicationDifficulty: string
	tuitionType: string
	workExperienceRequired: string
	metadataConfidence: string
}

export type UniversityFilter = {
	id: string
	name: string
	location: string
	state: string
	programCount: number
}

export type CourseFilterKey =
	| "country"
	| "degreeLevel"
	| "studyField"
	| "university"
	| "language"
	| "fullTimeOrPartTime"
	| "state"
	| "location"
	| "internationalStudentFit"
	| "tuitionType"
	| "applicationDifficulty"
	| "onlineOrOnCampus"
	| "startTerms"
	| "ects"
	| "duration"
	| "workExperienceRequired"
	| "metadataConfidence"

export type CourseFilterState = Record<CourseFilterKey, string[]>

export type CourseSearchParams = Record<string, string | string[] | undefined>

export const COURSE_PAGE_SIZE = 30

export const emptyCourseFilters: CourseFilterState = {
	country: [],
	degreeLevel: [],
	studyField: [],
	university: [],
	language: [],
	fullTimeOrPartTime: [],
	state: [],
	location: [],
	internationalStudentFit: [],
	tuitionType: [],
	applicationDifficulty: [],
	onlineOrOnCampus: [],
	startTerms: [],
	ects: [],
	duration: [],
	workExperienceRequired: [],
	metadataConfidence: [],
}

export type ProgramDetail = ProgramCard & {
	programUrl: string
	campusLocation: string
	startTerms: string
	applicationDeadlines: string
	admissionRequirements: string
	tuitionOrFees: string
	studyMode: string
	restrictedAdmission: string
	applicationUrl: string
	contactEmail: string
	summary: string
	heroImageUrl: string
	websiteUrl: string
	seoTitle: string
	seoDescription: string
	careerOutcomes: string
	skillsYouWillLearn: string
	programHighlights: string
	targetAudience: string
	bestFor: string
	relatedPrograms: ProgramCard[]
}

const filterKeys = Object.keys(emptyCourseFilters) as CourseFilterKey[]

export async function getCoursesPageData(searchParams: CourseSearchParams = {}) {
	const [programs, universities] = await Promise.all([
		prisma.degreeProgram.findMany({
			include: { university: true },
			orderBy: [{ university: { name: "asc" } }, { programName: "asc" }],
		}),
		prisma.university.findMany({
			include: { _count: { select: { programs: true } } },
			orderBy: { name: "asc" },
		}),
	])
	const allPrograms = programs.map(toProgramCard)
	const filters = parseCourseFilters(searchParams)
	const search = parseSingleParam(searchParams.q)
	const page = Math.max(1, Number.parseInt(parseSingleParam(searchParams.page) || "1", 10) || 1)
	const matchingPrograms = allPrograms.filter((program) => matchesCourseFilters(program, filters, search))
	const totalPages = Math.max(1, Math.ceil(matchingPrograms.length / COURSE_PAGE_SIZE))
	const safePage = Math.min(page, totalPages)
	const start = (safePage - 1) * COURSE_PAGE_SIZE

	return {
		programs: matchingPrograms.slice(start, start + COURSE_PAGE_SIZE),
		universities: universities
			.filter((university) => university._count.programs > 0)
			.map((university) => ({
				id: university.id,
				name: university.name,
				location: university.location || "",
				state: university.state || "",
				programCount: university._count.programs,
			})),
		totalPrograms: allPrograms.length,
		totalMatching: matchingPrograms.length,
		page: safePage,
		totalPages,
		pageSize: COURSE_PAGE_SIZE,
		filters,
		search,
		filterOptions: buildCourseFilterOptions(allPrograms, filters, search),
	}
}

export async function getProgramDetail(id?: string) {
	const parsedId = Number(id)
	const program = await prisma.degreeProgram.findFirst({
		where: Number.isFinite(parsedId) && parsedId > 0 ? { id: parsedId } : undefined,
		include: {
			university: true,
			translations: {
				where: { locale: "en" },
				take: 1,
			},
		},
		orderBy: { id: "asc" },
	})

	if (!program) {
		return null
	}

	const relatedPrograms = await prisma.degreeProgram.findMany({
		where: {
			id: { not: program.id },
			degreeLevel: program.degreeLevel || undefined,
			studyField: program.studyField || undefined,
		},
		include: { university: true },
		orderBy: [{ university: { name: "asc" } }, { programName: "asc" }],
		take: 3,
	})

	return toProgramDetail(program, relatedPrograms.map(toProgramCard))
}

export async function getProgramDetailBySlugs(universitySlug: string, degreeSlug: string, programSlug: string) {
	const idFromSlug = Number(programSlug.match(/-(\d+)$/)?.[1])
	const where = Number.isFinite(idFromSlug) && idFromSlug > 0
		? { id: idFromSlug }
		: { slug: programSlug }

	const program = await prisma.degreeProgram.findFirst({
		where,
		include: {
			university: true,
			translations: {
				where: { locale: "en" },
				take: 1,
			},
		},
	})

	if (!program) {
		return null
	}

	const detail = await getProgramDetail(String(program.id))
	if (!detail) {
		return null
	}

	return {
		program: detail,
		canonicalPath: programDetailPath(detail),
		isCanonical: programDetailPath(detail) === `/courses/${universitySlug}/${degreeSlug}/${programSlug}`,
	}
}

export function programDetailPath(program: Pick<ProgramCard, "id" | "title" | "degreeLevel" | "universityName">) {
	return `/courses/${slugify(program.universityName, "university")}/${slugify(program.degreeLevel, "degree")}/${slugify(program.title, "program")}-${program.id}`
}

function toProgramCard(program: any): ProgramCard {
	const universityCountry = inferCountry(program.university.state, program.university.location, program.campusLocation)

	return {
		id: program.id,
		detailPath: programDetailPath({
			id: program.id,
			title: program.programName,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName: program.university.name,
		}),
		title: program.programName,
		degreeLevel: program.degreeLevel || "Degree program",
		academicDegree: program.academicDegree || "",
		subjectArea: program.subjectArea || "Study program",
		duration: program.duration || "",
		ects: program.ects || "",
		languageOfInstruction: program.languageOfInstruction || "",
		country: universityCountry,
		universityId: program.universityId,
		universityName: program.university.name,
		location: program.university.location || "",
		state: program.university.state || "",
		img: program.image || "img-1.png",
		heroImageUrl: program.heroImageUrl || "",
		fallbackImageUrl: fallbackImageForProgram(program.id),
		authorImg: program.authorImage || "author-1.png",
		campusLocation: program.campusLocation || program.university.location || "",
		startTerms: program.startTerms || "",
		tuitionOrFees: program.tuitionOrFees || "",
		studyMode: program.studyMode || "",
		restrictedAdmission: program.restrictedAdmission || "",
		summary: program.summary || "",
		studyField: program.studyField || "",
		secondaryStudyField: program.secondaryStudyField || "",
		internationalStudentFit: program.internationalStudentFit || "",
		onlineOrOnCampus: program.onlineOrOnCampus || "",
		fullTimeOrPartTime: program.fullTimeOrPartTime || "",
		applicationDifficulty: program.applicationDifficulty || "",
		tuitionType: program.tuitionType || "",
		workExperienceRequired: program.workExperienceRequired || "",
		metadataConfidence: program.metadataConfidence || "",
	}
}

function slugify(value: string, fallback: string) {
	const slug = String(value || "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-")
	return slug || fallback
}

const fallbackImageUrls = loadFallbackImageUrls()

function fallbackImageForProgram(id: number) {
	if (!fallbackImageUrls.length) {
		return "/assets/imgs/pages/learning/page-signle-courses/img-1.png"
	}
	return fallbackImageUrls[Math.abs(id) % fallbackImageUrls.length]
}

function loadFallbackImageUrls() {
	const fallbackDir = path.join(process.cwd(), "public", "assets", "imgs", "study-dach-pics")
	try {
		return fs.readdirSync(fallbackDir)
			.filter((file) => /\.(avif|gif|jpe?g|png|webp)$/i.test(file))
			.sort((a, b) => a.localeCompare(b))
			.map((file) => `/assets/imgs/study-dach-pics/${file}`)
	} catch {
		return []
	}
}

function toProgramDetail(program: any, relatedPrograms: ProgramCard[] = []): ProgramDetail {
	const translation = program.translations?.[0]

	return {
		...toProgramCard(program),
		programUrl: program.programUrl,
		campusLocation: program.campusLocation || program.university.location || "",
		startTerms: program.startTerms || "",
		applicationDeadlines: program.applicationDeadlines || "",
		admissionRequirements: program.admissionRequirements || "",
		tuitionOrFees: program.tuitionOrFees || "",
		studyMode: program.studyMode || "",
		restrictedAdmission: program.restrictedAdmission || "",
		applicationUrl: program.applicationUrl || "",
		contactEmail: program.contactEmail || "",
		summary: program.summary || "",
		heroImageUrl: program.heroImageUrl || "",
		websiteUrl: program.university.websiteUrl || "",
		seoTitle: translation?.seoTitle || "",
		seoDescription: translation?.seoDescription || "",
		careerOutcomes: translation?.careerOutcomes || "",
		skillsYouWillLearn: translation?.skillsYouWillLearn || "",
		programHighlights: translation?.programHighlights || "",
		targetAudience: translation?.targetAudience || "",
		bestFor: translation?.bestFor || "",
		relatedPrograms,
	}
}

function inferCountry(state?: string, location?: string, campusLocation?: string) {
	const haystack = [state, location, campusLocation].filter(Boolean).join(" ").toLowerCase()
	const austriaSignals = [
		"austria",
		"vienna",
		"vorarlberg",
		"upper austria",
		"lower austria",
		"carinthia",
		"styria",
		"salzburg",
		"tyrol",
		"innsbruck",
		"graz",
		"linz",
	]
	const switzerlandSignals = [
		"switzerland",
		"lausanne",
		"lugano",
		"st. gallen",
		"zurich",
		"geneva",
		"bern",
		"basel",
		"ticino",
		"vaud",
	]

	if (austriaSignals.some((signal) => haystack.includes(signal))) {
		return "Austria"
	}
	if (switzerlandSignals.some((signal) => haystack.includes(signal))) {
		return "Switzerland"
	}
	return "Germany"
}

export function parseCourseFilters(searchParams: CourseSearchParams): CourseFilterState {
	return filterKeys.reduce((filters, key) => {
		filters[key] = parseMultiParam(searchParams[key])
		return filters
	}, { ...emptyCourseFilters })
}

function buildCourseFilterOptions(programs: ProgramCard[], filters: CourseFilterState, search: string): CourseFilterState {
	return filterKeys.reduce((result, key) => {
		const peerFilters = { ...filters, [key]: [] }
		const matchingPrograms = programs.filter((program) => matchesCourseFilters(program, peerFilters, search))
		result[key] = uniqueSorted(matchingPrograms.flatMap((program) => courseFilterValues(program, key)))
		return result
	}, { ...emptyCourseFilters })
}

function matchesCourseFilters(program: ProgramCard, filters: CourseFilterState, search: string) {
	return filterKeys.every((key) => matchesAny(courseFilterValues(program, key), filters[key])) && matchesSearch(program, search)
}

function courseFilterValues(program: ProgramCard, key: CourseFilterKey) {
	switch (key) {
		case "country":
			return [program.country]
		case "degreeLevel":
			return [program.degreeLevel]
		case "studyField":
			return [program.studyField, program.secondaryStudyField, program.subjectArea]
		case "university":
			return [program.universityName]
		case "language":
			return splitValues(program.languageOfInstruction).map(normalizeLanguage)
		case "fullTimeOrPartTime":
			return [program.fullTimeOrPartTime || normalizePace(program.studyMode)]
		case "state":
			return [program.state]
		case "location":
			return [program.location]
		case "internationalStudentFit":
			return [program.internationalStudentFit]
		case "tuitionType":
			return [program.tuitionType]
		case "applicationDifficulty":
			return [program.applicationDifficulty || normalizeAdmission(program.restrictedAdmission)]
		case "onlineOrOnCampus":
			return [program.onlineOrOnCampus || normalizeFormat(program.studyMode)]
		case "startTerms":
			return splitValues(program.startTerms).map(normalizeStartTerm)
		case "ects":
			return [program.ects]
		case "duration":
			return [program.duration]
		case "workExperienceRequired":
			return [program.workExperienceRequired]
		case "metadataConfidence":
			return [program.metadataConfidence]
	}
}

function matchesSearch(program: ProgramCard, search: string) {
	const tokens = normalize(search)
		.split(" ")
		.filter((token) => token.length > 2 && !["the", "and", "for", "with", "in", "taught"].includes(token))

	if (!tokens.length) {
		return true
	}

	const haystack = normalize([
		program.title,
		program.universityName,
		program.country,
		program.location,
		program.state,
		program.degreeLevel,
		program.academicDegree,
		program.subjectArea,
		program.studyField,
		program.secondaryStudyField,
		program.languageOfInstruction,
		program.summary,
		program.tuitionType,
		program.applicationDifficulty,
	].join(" "))

	return tokens.every((token) => haystack.includes(token) || (token.endsWith("s") && haystack.includes(token.slice(0, -1))))
}

function matchesAny(values: string[], selected: string[]) {
	return !selected.length || values.some((value) => selected.includes(value))
}

function parseSingleParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] || "" : value || ""
}

function parseMultiParam(value: string | string[] | undefined) {
	const values = Array.isArray(value) ? value : value ? [value] : []
	return uniqueSorted(values.flatMap((item) => item.split(",")).map((item) => item.trim()).filter(Boolean))
}

function splitValues(value: string) {
	return value
		.split(/[;,/|]+/)
		.map((item) => item.trim())
		.filter(Boolean)
}

function normalizeLanguage(value: string) {
	const normalized = normalize(value).replace("oe", "o")
	const aliases: Record<string, string> = {
		deutsch: "German",
		german: "German",
		englisch: "English",
		english: "English",
		franzosisch: "French",
		franzoesisch: "French",
		french: "French",
		francais: "French",
		italian: "Italian",
		italiano: "Italian",
		spanish: "Spanish",
		spanisch: "Spanish",
	}
	return aliases[normalized] || value.replace(/\s*\(.*?\)\s*/g, "").trim()
}

function normalizeStartTerm(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("winter") || normalized.includes("fall") || normalized.includes("autumn") || normalized.includes("oktober") || normalized.includes("october")) {
		return "Winter"
	}
	if (normalized.includes("summer") || normalized.includes("sommer") || normalized.includes("april")) {
		return "Summer"
	}
	if (normalized.includes("rolling") || normalized.includes("month")) {
		return "Rolling"
	}
	return value
}

function normalizePace(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("part") && normalized.includes("full")) {
		return "Both"
	}
	if (normalized.includes("part")) {
		return "Part Time"
	}
	if (normalized.includes("full") || normalized.includes("vollzeit")) {
		return "Full Time"
	}
	return ""
}

function normalizeFormat(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("hybrid")) {
		return "Hybrid"
	}
	if (normalized.includes("online")) {
		return "Online"
	}
	if (normalized.includes("campus") || normalized.includes("prasenz")) {
		return "On Campus"
	}
	return ""
}

function normalizeAdmission(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("no")) {
		return "Open Admission"
	}
	if (normalized.includes("yes")) {
		return "Restricted Admission"
	}
	return ""
}

function uniqueSorted(values: string[]) {
	return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value) && value !== "Unknown")))
		.sort((a, b) => a.localeCompare(b))
}

function normalize(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
