import { prisma } from "@/lib/prisma"

export type ProgramCard = {
	id: number
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

function toProgramCard(program: any): ProgramCard {
	const universityCountry = inferCountry(program.university.state, program.university.location, program.campusLocation)

	return {
		id: program.id,
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
