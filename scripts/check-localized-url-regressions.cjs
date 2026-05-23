const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

main()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(async () => {
		await prisma.$disconnect()
	})

async function main() {
	const programs = await prisma.degreeProgram.findMany({
		where: {
			isPublished: true,
			isLikelyDegreeProgram: true,
			duplicateStatus: "unique",
			canonicalProgramId: null,
		},
		include: { university: true, translations: true },
		orderBy: { id: "asc" },
	})
	const publicDuplicateLeakCount = await prisma.degreeProgram.count({
		where: {
			isPublished: true,
			isLikelyDegreeProgram: true,
			duplicateStatus: { not: "unique" },
			canonicalProgramId: { not: null },
		},
	})

	const failures = []
	for (const program of programs) {
		const en = programUrl(program, "en")
		const pt = programUrl(program, "pt-br")
		const es = programUrl(program, "es")

		if (en.includes("mestrado-")) {
			failures.push(`EN URL contains "mestrado-" for program ${program.id}: ${en}`)
		}
		if (en.includes("master-en-matematicas")) {
			failures.push(`EN URL contains "master-en-matematicas" for program ${program.id}: ${en}`)
		}
		if (en === es) {
			failures.push(`PT-BR PDP alternates would use same English/Español href for program ${program.id}: ${en}`)
		}
		if (pt === es) {
			failures.push(`ES page alternates would use same Português/Español href for program ${program.id}: ${pt}`)
		}
	}

	if (failures.length) {
		console.error(`Localized URL regression check failed with ${failures.length} issue(s):`)
		failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`))
		if (failures.length > 50) console.error(`...and ${failures.length - 50} more.`)
		process.exit(1)
	}

	console.log(`Canonical public filter excludes ${publicDuplicateLeakCount} duplicate program row(s) with canonical assignments.`)
	console.log(`Localized URL regression check passed for ${programs.length} public programs.`)
}

function programUrl(program, locale) {
	const basePath = locale === "pt-br" ? "/pt-br/cursos" : locale === "es" ? "/es/programas" : "/courses"
	const translationLocale = locale === "pt-br" ? "pt" : locale
	const translation = program.translations.find((item) => item.locale === translationLocale)
	const localizedTitle = locale === "en"
		? program.programName
		: translation?.localizedProgramName || program.programName
	const programSlugTitle = locale === "pt-br" ? cleanPtProgramTitle(localizedTitle) : localizedTitle
	return `${basePath}/${slugify(program.university.name, "university")}/${slugify(program.degreeLevel || "Degree program", "degree")}/${slugify(programSlugTitle, "program")}-${program.id}`
}

function slugify(value, fallback) {
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

function cleanPtProgramTitle(value) {
	return String(value || "").replace(/^Mestre em\s+/i, "Mestrado em ")
}
