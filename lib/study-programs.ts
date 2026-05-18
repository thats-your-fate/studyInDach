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

export async function getCoursesPageData() {
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

	return {
		programs: programs.map(toProgramCard),
		universities: universities
			.filter((university) => university._count.programs > 0)
			.map((university) => ({
				id: university.id,
				name: university.name,
				location: university.location || "",
				state: university.state || "",
				programCount: university._count.programs,
			})),
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
