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
	const universities = await prisma.university.findMany({
		where: {
			duplicateStatus: "unique",
			canonicalUniversityId: null,
		},
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
	const blogPosts = await prisma.blogPost.findMany({
		where: {
			status: "published",
			publishedAt: { not: null },
			noindex: false,
		},
		include: { translations: true },
		orderBy: { id: "asc" },
	})

	const failures = []
	for (const program of programs) {
		const en = programUrl(program, "en")
		const pt = programUrl(program, "pt-br")
		const es = programUrl(program, "es")
		const enSlug = terminalSlug(en)
		const ptSlug = terminalSlug(pt)
		const esSlug = terminalSlug(es)
		const ptTranslation = program.translations.find((item) => item.locale === "pt")?.localizedProgramName || ""
		const esTranslation = program.translations.find((item) => item.locale === "es")?.localizedProgramName || ""
		const expectedEnSlug = `${slugify(program.programName, "program")}-${program.id}`
		const expectedPtSlug = `${slugify(cleanPtProgramTitle(ptTranslation || program.programName), "program")}-${program.id}`
		const expectedEsSlug = `${slugify(esTranslation || program.programName, "program")}-${program.id}`

		if (en.includes("mestrado-")) {
			failures.push(`EN URL contains "mestrado-" for program ${program.id}: ${en}`)
		}
		if (en.includes("master-en-matematicas")) {
			failures.push(`EN URL contains "master-en-matematicas" for program ${program.id}: ${en}`)
		}
		if (!en.startsWith("/courses/")) {
			failures.push(`EN PDP URL is not on /courses for program ${program.id}: ${en}`)
		}
		if (!pt.startsWith("/pt-br/cursos/")) {
			failures.push(`PT-BR PDP URL is not on /pt-br/cursos for program ${program.id}: ${pt}`)
		}
		if (!es.startsWith("/es/programas/")) {
			failures.push(`ES PDP URL is not on /es/programas for program ${program.id}: ${es}`)
		}
		if (enSlug !== expectedEnSlug) {
			failures.push(`EN PDP URL does not use English/base slug for program ${program.id}: expected ${expectedEnSlug}, got ${enSlug}`)
		}
		if (ptSlug !== expectedPtSlug) {
			failures.push(`PT-BR PDP URL does not use PT-BR slug for program ${program.id}: expected ${expectedPtSlug}, got ${ptSlug}`)
		}
		if (esSlug !== expectedEsSlug) {
			failures.push(`ES PDP URL does not use ES slug for program ${program.id}: expected ${expectedEsSlug}, got ${esSlug}`)
		}
		if (ptTranslation && expectedPtSlug !== expectedEnSlug && enSlug === expectedPtSlug) {
			failures.push(`/pt-br/cursos alternate would link English to Portuguese slug for program ${program.id}: ${en}`)
		}
		if (esTranslation && expectedEsSlug !== expectedEnSlug && enSlug === expectedEsSlug) {
			failures.push(`/es/programas alternate would link English to Spanish slug for program ${program.id}: ${en}`)
		}
		if (en === es) {
			failures.push(`Page alternates would use same English/Español href for program ${program.id}: ${en}`)
		}
		if (pt === es) {
			failures.push(`ES page alternates would use same Português/Español href for program ${program.id}: ${pt}`)
		}
	}
	for (const university of universities) {
		const en = universityUrl(university, "en")
		const pt = universityUrl(university, "pt-br")
		const es = universityUrl(university, "es")
		if (en === es) {
			failures.push(`University alternates would use same English/Español href for ${university.id}: ${en}`)
		}
		if (pt === es) {
			failures.push(`University alternates would use same Português/Español href for ${university.id}: ${pt}`)
		}
		if (!en.startsWith("/universities/") || !pt.startsWith("/pt-br/universidades/") || !es.startsWith("/es/universidades/")) {
			failures.push(`University localized route prefixes are wrong for ${university.id}: ${en} | ${pt} | ${es}`)
		}
	}

	const sourcePathGroups = new Map()
	for (const program of programs) {
		if (!program.programUrl) continue
		const sourcePath = normalizeSourcePath(program.programUrl)
		if (!sourcePath || sourcePath === "/") continue
		const key = [
			program.universityId,
			normalizeName(program.degreeLevel || ""),
			sourcePath,
		].join("|")
		const group = sourcePathGroups.get(key) || []
		group.push(program)
		sourcePathGroups.set(key, group)
	}
	for (const [key, group] of sourcePathGroups.entries()) {
		if (group.length <= 1) continue
		failures.push(`Public duplicate source-path group ${key}: ${group.map((program) => `${program.id} ${program.programName}`).join(" | ")}`)
	}
	for (const post of blogPosts) {
		const enTranslation = post.translations.find((translation) => translation.locale === "en")
		const ptTranslation = post.translations.find((translation) => translation.locale === "pt-br")
		const esTranslation = post.translations.find((translation) => translation.locale === "es")
		const en = enTranslation ? blogPostUrl(enTranslation, "en") : "/blog"
		const pt = ptTranslation ? blogPostUrl(ptTranslation, "pt-br") : "/pt-br/guias"
		const es = esTranslation ? blogPostUrl(esTranslation, "es") : "/es/guias"
		if (ptTranslation && enTranslation && (!en.startsWith("/blog/") || en === "/blog")) {
			failures.push(`PT-BR blog post English link does not point to equivalent post for ${post.translationKey}: ${en}`)
		}
		if (esTranslation && ptTranslation && (!pt.startsWith("/pt-br/guias/") || pt === "/pt-br/guias")) {
			failures.push(`ES blog post Portuguese link does not point to equivalent post for ${post.translationKey}: ${pt}`)
		}
		if (enTranslation && esTranslation && en === es) {
			failures.push(`Blog post English and Spanish hrefs are identical for ${post.translationKey}: ${en}`)
		}
	}

	if (failures.length) {
		console.error(`Localized URL regression check failed with ${failures.length} issue(s):`)
		failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`))
		if (failures.length > 50) console.error(`...and ${failures.length - 50} more.`)
		process.exit(1)
	}

	console.log(`Canonical public filter excludes ${publicDuplicateLeakCount} duplicate program row(s) with canonical assignments.`)
	console.log(`Localized URL regression check passed for ${programs.length} public programs, ${universities.length} public universities, and ${blogPosts.length} published blog post(s).`)
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

function terminalSlug(url) {
	return String(url || "").split("/").filter(Boolean).pop() || ""
}

function universityUrl(university, locale) {
	if (locale === "pt-br") return `/pt-br/universidades/${university.id}`
	if (locale === "es") return `/es/universidades/${university.id}`
	return `/universities/${university.id}`
}

function blogPostUrl(translation, locale) {
	if (locale === "pt-br") return `/pt-br/guias/${translation.slug}`
	if (locale === "es") return `/es/guias/${translation.slug}`
	return `/blog/${translation.slug}`
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

function normalizeName(value) {
	return String(value || "")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.replace(/\s+/g, " ")
}

function normalizeSourcePath(value) {
	try {
		const raw = String(value || "").trim()
		const parsed = raw.startsWith("http") ? new URL(raw) : new URL(raw, "https://example.invalid")
		return normalizeLanguageVariantPath(parsed.pathname)
	} catch {
		return normalizeLanguageVariantPath(value)
	}
}

function normalizeLanguageVariantPath(value) {
	return `/${value}`
		.toLowerCase()
		.replace(/\/+/g, "/")
		.replace(/\/(en|de|es|pt|pt-br|fr|it)(?=\/|$)/g, "")
		.replace(/\/(english|deutsch|german|spanish|espanol|portuguese|portugues)(?=\/|$)/g, "")
		.replace(/\/index\.(html?|php)$/g, "")
		.replace(/[?#].*$/g, "")
		.replace(/\/+$/g, "")
		.replace(/^\/?/, "/")
}

function cleanPtProgramTitle(value) {
	return String(value || "").replace(/^Mestre em\s+/i, "Mestrado em ")
}
