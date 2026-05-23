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
	reviewStatus: string
	isPublished: boolean
	isLikelyDegreeProgram: boolean
	qualityFlags: string
	duplicateStatus: string
	canonicalProgramId: number | null
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
export const publicLanguageOptions = ["English", "German", "English + German", "French", "Italian", "Spanish", "Other"]
const publicStartTermOptions = ["Winter", "Summer", "Winter / Summer", "Rolling", "Other"]
export const publicStudyFieldBuckets = [
	"Computer Science & Data",
	"Engineering & Technology",
	"Business & Economics",
	"Natural Sciences",
	"Medicine & Health",
	"Law & Public Policy",
	"Social Sciences",
	"Humanities",
	"Language & Cultural Studies",
	"Arts, Design & Media",
	"Education & Teaching",
	"Environmental & Sustainability Studies",
	"Interdisciplinary",
]
const defaultFilterOptionLimits: Partial<Record<CourseFilterKey, number>> = {
	university: 80,
	location: 80,
	state: 80,
	duration: 60,
	ects: 60,
}
export const publicProgramWhere = {
	isPublished: true,
	isLikelyDegreeProgram: true,
	duplicateStatus: "unique",
	canonicalProgramId: null,
}
export const publicUniversityWhere = {
	duplicateStatus: "unique",
	canonicalUniversityId: null,
}

export async function getCoursesPageData(searchParams: CourseSearchParams = {}, locale: PublicLocale = "en") {
	const translationLocale = dbTranslationLocale(locale)
	const [programs, universities] = await Promise.all([
		prisma.degreeProgram.findMany({
			where: publicProgramWhere,
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
			where: publicUniversityWhere,
			include: { _count: { select: { programs: true } } },
			orderBy: { name: "asc" },
		}),
	])
	const allPrograms = programs.map((program) => toProgramCard(program, "en"))
	const displayPrograms = new Map(programs.map((program) => [program.id, toProgramCard(program, locale)]))
	const universityCounts = new Map<string, number>()
	programs.forEach((program) => {
		universityCounts.set(program.universityId, (universityCounts.get(program.universityId) || 0) + 1)
	})
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
			.filter((university) => (universityCounts.get(university.id) || 0) > 0)
			.map((university) => ({
				id: university.id,
				name: university.name,
				location: university.location || "",
				state: university.state || "",
				programCount: universityCounts.get(university.id) || 0,
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
		where: Number.isFinite(parsedId) && parsedId > 0 ? { id: parsedId } : publicProgramWhere,
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

	const canonicalProgram = await resolveCanonicalProgram(program, translationLocale)
	if (canonicalProgram.id !== program.id) {
		return getProgramDetail(String(canonicalProgram.id), locale)
	}

	const relatedPrograms = await prisma.degreeProgram.findMany({
		where: {
			...publicProgramWhere,
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
	return getProgramUrl(program, locale)
}

export function getProgramUrl(program: {
	id: number
	title?: string | null
	programName?: string | null
	originalTitle?: string | null
	degreeLevel?: string | null
	universityName?: string | null
	university?: { name?: string | null } | null
	translations?: Array<{ locale: string; localizedProgramName?: string | null }> | null
}, locale: PublicLocale = "en") {
	const basePath = locale === "pt-br" ? "/pt-br/cursos" : locale === "es" ? "/es/programas" : "/courses"
	const translation = program.translations?.find((item) => item.locale === dbTranslationLocale(locale))
	const originalTitle = program.programName || program.originalTitle || program.title || ""
	const localizedTitle = locale === "en" ? originalTitle : translation?.localizedProgramName || program.title || originalTitle
	const programSlugTitle = locale === "pt-br" ? cleanPtProgramTitle(localizedTitle) : localizedTitle
	const universityName = program.university?.name || program.universityName || "university"
	return `${basePath}/${slugify(universityName, "university")}/${slugify(program.degreeLevel || "Degree program", "degree")}/${slugify(programSlugTitle, "program")}-${program.id}`
}

export function getUniversityUrl(university: { id?: string | null }, locale: PublicLocale = "en") {
	const slug = university.id || "university"
	if (locale === "pt-br") return `/pt-br/universidades/${slug}`
	if (locale === "es") return `/es/universidades/${slug}`
	return `/universities/${slug}`
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
	return getProgramUrl({
		id: program.id,
		programName: program.programName,
		title: program.translations[0]?.localizedProgramName || program.programName,
		degreeLevel: program.degreeLevel || "Degree program",
		university: program.university,
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
		reviewStatus: program.reviewStatus || "pending",
		isPublished: program.isPublished ?? true,
		isLikelyDegreeProgram: program.isLikelyDegreeProgram ?? true,
		qualityFlags: program.qualityFlags || "",
		duplicateStatus: program.duplicateStatus || "unique",
		canonicalProgramId: program.canonicalProgramId || null,
	}
}

async function resolveCanonicalProgram(program: any, translationLocale: string) {
	if (!program?.canonicalProgramId) {
		return program
	}

	const canonical = await prisma.degreeProgram.findUnique({
		where: { id: program.canonicalProgramId },
		include: {
			university: true,
			translations: {
				where: { locale: { in: ["en", "pt", translationLocale] } },
			},
		},
	})

	return canonical || program
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
		result[key] = limitFilterOptions(key, uniqueSorted(matchingPrograms.flatMap((program) => courseFilterValues(program, key))))
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
			return normalizeStudyFields([program.studyField, program.secondaryStudyField, program.subjectArea])
		case "university":
			return [program.universityName]
		case "language":
			return normalizeLanguageBuckets(program.languageOfInstruction)
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
			return normalizeStartTermBuckets(program.startTerms)
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

export function normalizeCourseFilterParam(key: CourseFilterKey, value: string) {
	if (key === "language") {
		return normalizePublicLanguageParam(value)
	}
	if (key === "startTerms") {
		return normalizeStartTerm(value)
	}
	if (key === "studyField") {
		return normalizeStudyField(value)
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
	return aliases[normalized] || ""
}

function normalizePublicLanguageParam(value: string) {
	const normalized = normalize(value)
	if (normalized.includes("english") && normalized.includes("german")) return "English + German"
	const language = normalizeLanguage(value)
	if (publicLanguageOptions.includes(language)) return language
	const buckets = normalizeLanguageBuckets(value)
	return buckets[0] || "Other"
}

export function normalizeLanguageBuckets(value: string | null | undefined) {
	const raw = String(value || "")
	const normalized = normalize(raw)
	if (!normalized) return []
	if (/\b(depending|chosen courses|e g|semester|modules? may|varies|various)\b/.test(normalized) && !/\b(english|englisch|ingles|anglais|german|deutsch|alemao|aleman|french|francais|italian|spanish)\b/.test(normalized)) {
		return []
	}
	const languages = uniqueInOrder(splitValues(raw).map(normalizeLanguage).filter(Boolean))
	if (!languages.length) {
		if (normalized.includes("english") || normalized.includes("englisch") || normalized.includes("ingles") || normalized.includes("anglais")) return ["English"]
		if (normalized.includes("german") || normalized.includes("deutsch") || normalized.includes("alemao") || normalized.includes("aleman")) return ["German"]
		return ["Other"]
	}
	const hasEnglish = languages.includes("English")
	const hasGerman = languages.includes("German")
	const buckets = [...languages.filter((language) => publicLanguageOptions.includes(language))]
	if (hasEnglish && hasGerman) buckets.unshift("English + German")
	return uniqueInOrder(buckets.length ? buckets : ["Other"])
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
	return "Other"
}

function normalizeStartTermBuckets(value: string) {
	const buckets = uniqueInOrder(splitValues(value).map(normalizeStartTerm).filter(Boolean))
	return buckets.length ? buckets : []
}

export function normalizeStudyFields(values: Array<string | null | undefined>) {
	return uniqueInOrder(values.map((value) => normalizeStudyField(value || "")).filter(Boolean))
}

export function normalizeStudyField(value: string) {
	const raw = String(value || "").trim()
	if (!raw) return ""
	if (publicStudyFieldBuckets.includes(raw)) return raw
	const normalized = normalize(raw)
	if (!normalized || normalized.length > 90) return ""
	if (/(computer|informatics|informatik|software|data|artificial intelligence|machine learning|cyber|information systems)/.test(normalized)) return "Computer Science & Data"
	if (/(engineering|ingenieur|mechanical|electrical|civil|mechatronic|technology|robotics|energy|materials)/.test(normalized)) return "Engineering & Technology"
	if (/(business|management|economics|finance|accounting|marketing|entrepreneurship)/.test(normalized)) return "Business & Economics"
	if (/(biology|chemistry|physics|mathematics|math|statistics|science|geology|pharmaceutical)/.test(normalized)) return "Natural Sciences"
	if (/(medicine|medical|health|psychology|nursing|rehabilitation|biomedical)/.test(normalized)) return "Medicine & Health"
	if (/(law|legal|policy|politic|public administration|governance)/.test(normalized)) return "Law & Public Policy"
	if (/(social|sociology|anthropology|communication|international relations)/.test(normalized)) return "Social Sciences"
	if (/(history|philosophy|religion|theology|literature|humanities|archaeology)/.test(normalized)) return "Humanities"
	if (/(language|linguistic|cultural|culture|english|german|romance|asian|studies)/.test(normalized)) return "Language & Cultural Studies"
	if (/(art|design|media|music|film|theatre|architecture|performance)/.test(normalized)) return "Arts, Design & Media"
	if (/(education|teaching|teacher|pedagogy|lehramt)/.test(normalized)) return "Education & Teaching"
	if (/(environment|sustainability|ecology|climate|renewable|biodiversity)/.test(normalized)) return "Environmental & Sustainability Studies"
	if (/(interdisciplinary|combined|general)/.test(normalized)) return "Interdisciplinary"
	return ""
}

function limitFilterOptions(key: CourseFilterKey, options: string[]) {
	if (key === "language") {
		return publicLanguageOptions.filter((option) => options.includes(option))
	}
	if (key === "startTerms") {
		return publicStartTermOptions.filter((option) => options.includes(option))
	}
	if (key === "studyField") {
		return publicStudyFieldBuckets.filter((option) => options.includes(option))
	}
	const limit = defaultFilterOptionLimits[key]
	return limit ? options.slice(0, limit) : options
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

function uniqueInOrder(values: string[]) {
	const seen = new Set<string>()
	return values.filter((value) => {
		const key = normalize(value)
		if (!key || seen.has(key)) return false
		seen.add(key)
		return true
	})
}

function normalize(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
