const fs = require("fs")
const path = require("path")
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
const root = path.resolve(__dirname, "..")
const supportedLocales = (process.env.SEED_LOCALES || "en,es,pt")
	.split(",")
	.map((locale) => locale.trim())
	.filter(Boolean)
const csvPath = resolveCsvPath()
const localizedCsvPaths = supportedLocales.map((locale) => ({
	locale,
	path: localizedCsvPath(csvPath, locale),
}))

const courseImages = Array.from({ length: 18 }, (_, index) => `img-${index + 1}.png`)
const authorImages = Array.from({ length: 18 }, (_, index) => `author-${index + 1}.png`)

function parseCsv(text) {
	const rows = []
	let row = []
	let cell = ""
	let inQuotes = false

	for (let index = 0; index < text.length; index += 1) {
		const char = text[index]
		const next = text[index + 1]

		if (char === '"' && inQuotes && next === '"') {
			cell += '"'
			index += 1
			continue
		}

		if (char === '"') {
			inQuotes = !inQuotes
			continue
		}

		if (char === "," && !inQuotes) {
			row.push(cell)
			cell = ""
			continue
		}

		if ((char === "\n" || char === "\r") && !inQuotes) {
			if (char === "\r" && next === "\n") {
				index += 1
			}
			row.push(cell)
			if (row.some((value) => value.trim())) {
				rows.push(row)
			}
			row = []
			cell = ""
			continue
		}

		cell += char
	}

	if (cell || row.length) {
		row.push(cell)
		rows.push(row)
	}

	const [headers, ...dataRows] = rows
	return dataRows.map((dataRow) =>
		Object.fromEntries(headers.map((header, index) => [header.trim(), clean(dataRow[index] || "")])),
	)
}

function clean(value) {
	return String(value || "").replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim()
}

function slugify(value, fallback) {
	const slug = clean(value)
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
	return slug || fallback
}

async function main() {
	if (!fs.existsSync(csvPath)) {
		throw new Error(`Missing CSV: ${csvPath}`)
	}

	console.log(`Seeding base programs from ${path.relative(root, csvPath)}`)
	const rows = parseCsv(fs.readFileSync(csvPath, "utf8")).filter(
		(row) => row["University ID"] && row["Program URL"] && row["Program Name"],
	)

	for (const [index, row] of rows.entries()) {
		const universityId = row["University ID"]
		await prisma.university.upsert({
			where: { id: universityId },
			update: {
				name: row["University"],
				location: row["Location"] || null,
				state: row["State"] || null,
				websiteUrl: row["Website URL"] || null,
			},
			create: {
				id: universityId,
				name: row["University"],
				location: row["Location"] || null,
				state: row["State"] || null,
				websiteUrl: row["Website URL"] || null,
			},
		})

		const imageIndex = index % courseImages.length
		const slug = `${slugify(row["University"], universityId)}-${slugify(row["Program Name"], `program-${index + 1}`)}-${shortHash(row["Program URL"])}`

		const program = await prisma.degreeProgram.upsert({
			where: { programUrl: row["Program URL"] },
			update: {
				slug,
				programName: row["Program Name"],
				degreeLevel: row["Degree Level"] || null,
				academicDegree: row["Academic Degree"] || null,
				subjectArea: row["Subject Area"] || null,
				languageOfInstruction: row["Language of Instruction"] || null,
				campusLocation: row["Campus Location"] || null,
				duration: row["Duration"] || null,
				ects: row["ECTS"] || null,
				startTerms: row["Start Terms"] || null,
				applicationDeadlines: row["Application Deadlines"] || null,
				admissionRequirements: row["Admission Requirements"] || null,
				tuitionOrFees: row["Tuition or Fees"] || null,
				studyMode: row["Study Mode"] || null,
				restrictedAdmission: row["Restricted Admission"] || null,
				applicationUrl: row["Application URL"] || null,
				contactEmail: row["Contact Email"] || null,
				summary: row["Summary"] || null,
				heroImageUrl: row["Hero Image URL"] || null,
				studyField: row["Study Field"] || null,
				secondaryStudyField: row["Secondary Study Field"] || null,
				internationalStudentFit: row["International Student Fit"] || null,
				onlineOrOnCampus: row["Online or On Campus"] || null,
				fullTimeOrPartTime: row["Full Time or Part Time"] || null,
				applicationDifficulty: row["Application Difficulty"] || null,
				tuitionType: row["Tuition Type"] || null,
				workExperienceRequired: row["Work Experience Required"] || null,
				metadataConfidence: row["Metadata Confidence"] || null,
				image: courseImages[imageIndex],
				authorImage: authorImages[imageIndex],
				universityId,
			},
			create: {
				slug,
				programUrl: row["Program URL"],
				programName: row["Program Name"],
				degreeLevel: row["Degree Level"] || null,
				academicDegree: row["Academic Degree"] || null,
				subjectArea: row["Subject Area"] || null,
				languageOfInstruction: row["Language of Instruction"] || null,
				campusLocation: row["Campus Location"] || null,
				duration: row["Duration"] || null,
				ects: row["ECTS"] || null,
				startTerms: row["Start Terms"] || null,
				applicationDeadlines: row["Application Deadlines"] || null,
				admissionRequirements: row["Admission Requirements"] || null,
				tuitionOrFees: row["Tuition or Fees"] || null,
				studyMode: row["Study Mode"] || null,
				restrictedAdmission: row["Restricted Admission"] || null,
				applicationUrl: row["Application URL"] || null,
				contactEmail: row["Contact Email"] || null,
				summary: row["Summary"] || null,
				heroImageUrl: row["Hero Image URL"] || null,
				studyField: row["Study Field"] || null,
				secondaryStudyField: row["Secondary Study Field"] || null,
				internationalStudentFit: row["International Student Fit"] || null,
				onlineOrOnCampus: row["Online or On Campus"] || null,
				fullTimeOrPartTime: row["Full Time or Part Time"] || null,
				applicationDifficulty: row["Application Difficulty"] || null,
				tuitionType: row["Tuition Type"] || null,
				workExperienceRequired: row["Work Experience Required"] || null,
				metadataConfidence: row["Metadata Confidence"] || null,
				image: courseImages[imageIndex],
				authorImage: authorImages[imageIndex],
				universityId,
			},
		})

		await upsertProgramTranslation(program.id, "en", row)
	}

	let translationUpsertCount = rows.length
	for (const localizedCsv of localizedCsvPaths) {
		if (!fs.existsSync(localizedCsv.path)) {
			continue
		}
		const localizedRows = parseCsv(fs.readFileSync(localizedCsv.path, "utf8")).filter(
			(row) => row["Program URL"] && (row["Localized Program Name"] || row["Program Name"]),
		)
		for (const row of localizedRows) {
			const program = await prisma.degreeProgram.findUnique({
				where: { programUrl: row["Program URL"] },
				select: { id: true },
			})
			if (!program) {
				continue
			}
			if (localizedCsv.locale === "en") {
				await prisma.degreeProgram.update({
					where: { id: program.id },
					data: programMetadataData(row),
				})
			}
			await upsertProgramTranslation(program.id, localizedCsv.locale, row)
			translationUpsertCount += 1
		}
		console.log(`Seeded ${localizedRows.length} ${localizedCsv.locale} translations from ${path.relative(root, localizedCsv.path)}`)
	}

	console.log(`Seeded ${rows.length} degree programs and ${translationUpsertCount} translation upserts from CSV`)
}

async function upsertProgramTranslation(programId, locale, row) {
	await prisma.degreeProgramTranslation.upsert({
		where: {
			programId_locale: {
				programId,
				locale,
			},
		},
		update: translationData(row),
		create: {
			programId,
			locale,
			...translationData(row),
		},
	})
}

function translationData(row) {
	return {
		localizedProgramName: row["Localized Program Name"] || row["Program Name"],
		subjectArea: row["Subject Area"] || null,
		languageOfInstruction: row["Language of Instruction"] || null,
		campusLocation: row["Campus Location"] || null,
		duration: row["Duration"] || null,
		startTerms: row["Start Terms"] || null,
		applicationDeadlines: row["Application Deadlines"] || null,
		admissionRequirements: row["Admission Requirements"] || null,
		tuitionOrFees: row["Tuition or Fees"] || null,
		studyMode: row["Study Mode"] || null,
		restrictedAdmission: row["Restricted Admission"] || null,
		summary: row["Summary"] || null,
		seoTitle: row["SEO Title"] || null,
		seoDescription: row["SEO Description"] || null,
		seoKeywords: row["SEO Keywords"] || null,
		searchIntentTags: row["Search Intent Tags"] || null,
		careerOutcomes: row["Career Outcomes"] || null,
		skillsYouWillLearn: row["Skills You Will Learn"] || null,
		programHighlights: row["Program Highlights"] || null,
		targetAudience: row["Target Audience"] || null,
		bestFor: row["Best For"] || null,
		metadataNotes: row["Metadata Notes"] || null,
	}
}

function programMetadataData(row) {
	return {
		studyField: row["Study Field"] || null,
		secondaryStudyField: row["Secondary Study Field"] || null,
		internationalStudentFit: row["International Student Fit"] || null,
		onlineOrOnCampus: row["Online or On Campus"] || null,
		fullTimeOrPartTime: row["Full Time or Part Time"] || null,
		applicationDifficulty: row["Application Difficulty"] || null,
		tuitionType: row["Tuition Type"] || null,
		workExperienceRequired: row["Work Experience Required"] || null,
		metadataConfidence: row["Metadata Confidence"] || null,
	}
}

function shortHash(value) {
	let hash = 0
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0
	}
	return hash.toString(36)
}

function resolveCsvPath() {
	const explicitCsv = cliValue("--csv") || process.env.SEED_CSV
	if (explicitCsv) {
		return path.resolve(root, explicitCsv)
	}

	const dataset = cliValue("--dataset") || process.env.SEED_DATASET
	if (!dataset || dataset === "default" || dataset === "base") {
		return path.join(root, "degree_program_structured.csv")
	}

	return path.join(root, `degree_program_structured_${dataset}.csv`)
}

function localizedCsvPath(baseCsvPath, locale) {
	const extension = path.extname(baseCsvPath)
	const stem = baseCsvPath.slice(0, -extension.length)
	return `${stem}.${locale}${extension}`
}

function cliValue(name) {
	const equalsPrefix = `${name}=`
	const equalsArg = process.argv.find((arg) => arg.startsWith(equalsPrefix))
	if (equalsArg) {
		return equalsArg.slice(equalsPrefix.length)
	}

	const index = process.argv.indexOf(name)
	if (index !== -1) {
		return process.argv[index + 1]
	}

	return undefined
}

if (require.main === module) {
	main()
		.finally(async () => {
			await prisma.$disconnect()
		})
		.catch(async (error) => {
			console.error(error)
			process.exit(1)
		})
}
