import { prisma } from "@/lib/prisma"
import { dbTranslationLocale, localePrefix, type PublicLocale } from "@/lib/i18n"
import fs from "node:fs"
import path from "node:path"

export type ProgramCard = {
	id: number
	detailPath: string
	title: string
	originalTitle: string
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
	availableTranslationLocales: string[]
	relatedPrograms: ProgramCard[]
}

const filterKeys = Object.keys(emptyCourseFilters) as CourseFilterKey[]

export async function getCoursesPageData(searchParams: CourseSearchParams = {}, locale: PublicLocale = "en") {
	const translationLocale = dbTranslationLocale(locale)
	const [programs, universities] = await Promise.all([
		prisma.degreeProgram.findMany({
			include: {
				university: true,
				translations: {
					where: { locale: translationLocale },
					take: 1,
				},
			},
			orderBy: [{ university: { name: "asc" } }, { programName: "asc" }],
		}),
		prisma.university.findMany({
			include: { _count: { select: { programs: true } } },
			orderBy: { name: "asc" },
		}),
	])
	const allPrograms = programs.map((program) => toProgramCard(program, "en"))
	const displayPrograms = new Map(programs.map((program) => [program.id, toProgramCard(program, locale)]))
	const filters = parseCourseFilters(searchParams)
	const search = parseSingleParam(searchParams.q)
	const page = Math.max(1, Number.parseInt(parseSingleParam(searchParams.page) || "1", 10) || 1)
	const matchingPrograms = allPrograms.filter((program) =>
		matchesCourseFilters(program, filters, "")
		&& matchesSearch(displayPrograms.get(program.id) || program, search),
	)
	const totalPages = Math.max(1, Math.ceil(matchingPrograms.length / COURSE_PAGE_SIZE))
	const safePage = Math.min(page, totalPages)
	const start = (safePage - 1) * COURSE_PAGE_SIZE

	return {
		programs: matchingPrograms
			.slice(start, start + COURSE_PAGE_SIZE)
			.map((program) => displayPrograms.get(program.id) || program),
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

export async function getProgramDetail(id?: string, locale: PublicLocale = "en") {
	const parsedId = Number(id)
	const translationLocale = dbTranslationLocale(locale)
	const program = await prisma.degreeProgram.findFirst({
		where: Number.isFinite(parsedId) && parsedId > 0 ? { id: parsedId } : undefined,
		include: {
			university: true,
			translations: {
				where: { locale: { in: ["en", "pt", translationLocale] } },
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
		include: {
			university: true,
			translations: {
				where: { locale: translationLocale },
				take: 1,
			},
		},
		orderBy: [{ university: { name: "asc" } }, { programName: "asc" }],
		take: 3,
	})

	return toProgramDetail(program, relatedPrograms.map((related) => toProgramCard(related, locale)), locale)
}

export async function getProgramDetailBySlugs(universitySlug: string, degreeSlug: string, programSlug: string, locale: PublicLocale = "en") {
	const idFromSlug = Number(programSlug.match(/-(\d+)$/)?.[1])
	const where = Number.isFinite(idFromSlug) && idFromSlug > 0
		? { id: idFromSlug }
		: { slug: programSlug }

	const program = await prisma.degreeProgram.findFirst({
		where,
		include: {
			university: true,
			translations: {
				where: { locale: { in: ["en", "pt", dbTranslationLocale(locale)] } },
			},
		},
	})

	if (!program) {
		return null
	}

	const detail = await getProgramDetail(String(program.id), locale)
	if (!detail) {
		return null
	}

	const canonicalPath = programDetailPath(detail, locale)

	return {
		program: detail,
		canonicalPath,
		isCanonical: canonicalPath === `${localePrefix(locale)}/courses/${universitySlug}/${degreeSlug}/${programSlug}`
			|| canonicalPath === `${localePrefix(locale)}/cursos/${universitySlug}/${degreeSlug}/${programSlug}`
			|| canonicalPath === `${localePrefix(locale)}/programas/${universitySlug}/${degreeSlug}/${programSlug}`,
	}
}

export function programDetailPath(program: Pick<ProgramCard, "id" | "title" | "degreeLevel" | "universityName"> & { originalTitle?: string }, locale: PublicLocale = "en") {
	const basePath = locale === "pt-br" ? "/pt-br/cursos" : locale === "es" ? "/es/programas" : "/courses"
	const programSlugTitle = locale === "pt-br" ? cleanPtProgramTitle(program.title) : locale === "es" ? program.title : program.originalTitle || program.title
	return `${basePath}/${slugify(program.universityName, "university")}/${slugify(program.degreeLevel, "degree")}/${slugify(programSlugTitle, "program")}-${program.id}`
}

export async function getProgramPathByLocale(programId: number, locale: PublicLocale) {
	const program = await prisma.degreeProgram.findUnique({
		where: { id: programId },
		include: {
			university: true,
			translations: { where: { locale: dbTranslationLocale(locale) }, take: 1 },
		},
	})
	if (!program) return ""
	return programDetailPath({
		id: program.id,
		title: program.translations[0]?.localizedProgramName || program.programName,
		originalTitle: program.programName,
		degreeLevel: program.degreeLevel || "Degree program",
		universityName: program.university.name,
	}, locale)
}

function toProgramCard(program: any, locale: PublicLocale = "en"): ProgramCard {
	const universityCountry = inferCountry(program.university.state, program.university.location, program.campusLocation)
	const translation = translationForLocale(program.translations, locale)
	const originalTitle = program.programName || ""
	const localizedTitle = cleanLocalizedProgramTitle(translation?.localizedProgramName || originalTitle, locale)

	return {
		id: program.id,
		detailPath: programDetailPath({
			id: program.id,
			title: localizedTitle,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName: program.university.name,
			originalTitle,
		}, locale),
		title: localizedTitle,
		originalTitle,
		degreeLevel: program.degreeLevel || "Degree program",
		academicDegree: program.academicDegree || "",
		subjectArea: translation?.subjectArea || program.subjectArea || "Study program",
		duration: translation?.duration || program.duration || "",
		ects: program.ects || "",
		languageOfInstruction: translation?.languageOfInstruction || program.languageOfInstruction || "",
		country: universityCountry,
		universityId: program.universityId,
		universityName: program.university.name,
		location: program.university.location || "",
		state: program.university.state || "",
		img: program.image || "img-1.png",
		heroImageUrl: program.heroImageUrl || "",
		fallbackImageUrl: fallbackImageForProgram(program.id),
		authorImg: program.authorImage || "author-1.png",
		campusLocation: translation?.campusLocation || program.campusLocation || program.university.location || "",
		startTerms: translation?.startTerms || program.startTerms || "",
		tuitionOrFees: translation?.tuitionOrFees || program.tuitionOrFees || "",
		studyMode: translation?.studyMode || program.studyMode || "",
		restrictedAdmission: translation?.restrictedAdmission || program.restrictedAdmission || "",
		summary: translation?.summary || program.summary || "",
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

function toProgramDetail(program: any, relatedPrograms: ProgramCard[] = [], locale: PublicLocale = "en"): ProgramDetail {
	const translation = translationForLocale(program.translations, locale)
	const originalTitle = program.programName || ""
	const localizedTitle = cleanLocalizedProgramTitle(translation?.localizedProgramName || originalTitle, locale)
	const card = toProgramCard(program, locale)

	return {
		...card,
		title: localizedTitle,
		originalTitle,
		programUrl: program.programUrl,
		campusLocation: translation?.campusLocation || program.campusLocation || program.university.location || "",
		startTerms: translation?.startTerms || program.startTerms || "",
		applicationDeadlines: translation?.applicationDeadlines || program.applicationDeadlines || "",
		admissionRequirements: translation?.admissionRequirements || program.admissionRequirements || "",
		tuitionOrFees: translation?.tuitionOrFees || program.tuitionOrFees || "",
		studyMode: translation?.studyMode || program.studyMode || "",
		restrictedAdmission: translation?.restrictedAdmission || program.restrictedAdmission || "",
		applicationUrl: program.applicationUrl || "",
		contactEmail: program.contactEmail || "",
		summary: translation?.summary || program.summary || "",
		heroImageUrl: program.heroImageUrl || "",
		websiteUrl: program.university.websiteUrl || "",
		seoTitle: translation?.seoTitle || "",
		seoDescription: translation?.seoDescription || "",
		careerOutcomes: translation?.careerOutcomes || "",
		skillsYouWillLearn: translation?.skillsYouWillLearn || "",
		programHighlights: translation?.programHighlights || "",
		targetAudience: translation?.targetAudience || "",
		bestFor: translation?.bestFor || "",
		availableTranslationLocales: Array.from(new Set((program.translations || []).map((item: { locale: string }) => item.locale))),
		relatedPrograms,
	}
}

function translationForLocale(translations: any[] | undefined, locale: PublicLocale) {
	const preferred = dbTranslationLocale(locale)
	return translations?.find((translation) => translation.locale === preferred)
		|| translations?.find((translation) => translation.locale === "en")
		|| translations?.[0]
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
		const rawValue = key === "language"
			? [searchParams.language, searchParams.languageOfInstruction].flatMap((value) => Array.isArray(value) ? value : value ? [value] : [])
			: searchParams[key]
		filters[key] = parseMultiParam(rawValue).map((value) => normalizeCourseFilterParam(key, value)).filter(Boolean)
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

function normalizeCourseFilterParam(key: CourseFilterKey, value: string) {
	if (key === "language") {
		return normalizeLanguage(value)
	}
	if (key === "startTerms") {
		return normalizeStartTerm(value)
	}
	return value
}

function splitValues(value: string) {
	return value
		.split(/[;,/|+]+/)
		.map((item) => item.trim())
		.filter(Boolean)
}

function normalizeLanguage(value: string) {
	const normalized = normalize(value).replace("oe", "o")
	const aliases: Record<string, string> = {
		deutsch: "German",
		allemand: "German",
		german: "German",
		aleman: "German",
		englisch: "English",
		anglais: "English",
		english: "English",
		ingles: "English",
		franzosisch: "French",
		franzoesisch: "French",
		french: "French",
		francais: "French",
		alemao: "German",
		italian: "Italian",
		italiano: "Italian",
		spanish: "Spanish",
		spanisch: "Spanish",
	}
	return aliases[normalized] || value.replace(/\s*\(.*?\)\s*/g, "").trim()
}

function cleanLocalizedProgramTitle(value: string, locale: PublicLocale) {
	return locale === "pt-br" ? cleanPtProgramTitle(value) : value
}

function cleanPtProgramTitle(value: string) {
	return value.replace(/^Mestre em\s+/i, "Mestrado em ")
}

function normalizeStartTerm(value: string) {
	const normalized = normalize(value)
	if (!normalized || /^\d+$/.test(normalized) || /^\d{1,2}\s+\d{1,2}\s*\d{0,4}$/.test(normalized)) {
		return ""
	}
	const hasWinter =
		normalized.includes("winter")
		|| normalized.includes("fall")
		|| normalized.includes("autumn")
		|| normalized.includes("automne")
		|| normalized.includes("herbst")
		|| normalized.includes("inverno")
		|| normalized.includes("september")
		|| normalized.includes("october")
		|| normalized.includes("oktober")
		|| normalized.includes("november")
	const hasSummer =
		normalized.includes("summer")
		|| normalized.includes("sommer")
		|| normalized.includes("verao")
		|| normalized.includes("spring")
		|| normalized.includes("printemps")
		|| normalized.includes("march")
		|| normalized.includes("maerz")
		|| normalized.includes("marz")
		|| normalized.includes("april")
	if (hasWinter && hasSummer) {
		return "Winter / Summer"
	}
	if (hasWinter) {
		return "Winter"
	}
	if (hasSummer) {
		return "Summer"
	}
	if (normalized.includes("rolling") || normalized.includes("month") || normalized.includes("anytime") || normalized.includes("various")) {
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
	return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => {
		const normalized = normalize(value || "")
		return Boolean(normalized) && !["unknown", "n a", "na", "null", "undefined"].includes(normalized)
	})))
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
