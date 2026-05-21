#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const titlePatterns = [
	[/\bbachelor\s+project\b/i, "title: bachelor project"],
	[/\bmaster\s+project\b/i, "title: master project"],
	[/\b(1st|2nd|3rd|4th)\s+year\b/i, "title: yearly section"],
	[/\b[1-4]\.\s*jahr\b/i, "title: yearly section"],
	[/\bmodule\b/i, "title: module"],
	[/\bmodul\b/i, "title: module"],
	[/\bproject\b/i, "title: project"],
	[/\bprojekt\b/i, "title: project"],
	[/\bresearch\s+training\b/i, "title: research training"],
	[/\bresearch\s+module\b/i, "title: research module"],
	[/\badaptive\s+minds\s+research\s+area\b/i, "title: research area"],
	[/\blecture\b/i, "title: lecture"],
	[/\bseminar\b/i, "title: seminar"],
	[/\bworkshop\b/i, "title: workshop"],
	[/\bpublication\b/i, "title: publication"],
	[/\bpresentation\b/i, "title: presentation"],
	[/\bperformance\b/i, "title: performance"],
	[/\badaptation\s+year\b/i, "title: adaptation year"],
	[/\baccess\b/i, "title: access page"],
]

const summaryPatterns = [
	[/\bbachelor\s+project\b/i, "summary mentions bachelor project"],
	[/\bmaster\s+project\b/i, "summary mentions master project"],
	[/\bmodule\b/i, "summary mentions module"],
	[/\bproject\b/i, "summary mentions project"],
	[/\bprojekt\b/i, "summary mentions project"],
	[/\byear\b/i, "summary mentions year/section"],
	[/\b[1-4]\.\s*jahr\b/i, "summary mentions year/section"],
	[/\bcourse\s+section\b/i, "summary mentions course section"],
	[/\bmodul\b/i, "summary mentions module"],
	[/\bseminar\b/i, "summary mentions seminar"],
	[/\blecture\b/i, "summary mentions lecture"],
	[/\bpublication\b/i, "summary mentions publication"],
	[/\bpresentation\b/i, "summary mentions presentation"],
	[/\bperformance\b/i, "summary mentions performance"],
	[/\bresearch\s+training\b/i, "summary mentions research training"],
	[/\badaptive\s+minds\s+research\s+area\b/i, "summary mentions research area"],
]

const suspiciousTitlePattern = /\b(bachelor\s+project|master\s+project|project|projekt|module|modul|research\s+module|research\s+training|lecture|seminar|workshop|publication|presentation|performance|adaptation\s+year|adaptive\s+minds\s+research\s+area|1st\s+year|2nd\s+year|3rd\s+year|4th\s+year|[1-4]\.\s*jahr)\b/i
const canonicalDegreeLevels = new Set(["Bachelor", "Master", "Doctorate", "State Examination", "Certificate"])

async function main() {
	const dryRun = process.argv.includes("--dry-run")
	const programs = await prisma.degreeProgram.findMany({
		include: {
			university: true,
			translations: true,
		},
		orderBy: { id: "asc" },
	})
	let flagged = 0
	let hidden = 0

	for (const program of programs) {
		const result = detectQuality(program)
		if (!result.flags.length) continue
		flagged += 1
		if (result.hideFromPublic) hidden += 1
		const qualityFlags = mergeFlags(program.qualityFlags, result.flags).join("; ")
		console.log(`#${program.id} ${program.programName}`)
		console.log(`  ${qualityFlags}`)
		if (result.hideFromPublic) console.log("  action: hide from public catalog")
		if (!dryRun) {
			await prisma.degreeProgram.update({
				where: { id: program.id },
				data: {
					isLikelyDegreeProgram: result.hideFromPublic ? false : program.isLikelyDegreeProgram,
					reviewStatus: "pending",
					qualityFlags,
				},
			})
		}
	}

	console.log(`${dryRun ? "Would flag" : "Flagged"} ${flagged} of ${programs.length} rows.`)
	console.log(`${dryRun ? "Would hide" : "Hid"} ${hidden} rows from public catalog.`)
}

function detectQuality(program) {
	const flags = []
	const titles = [
		program.programName,
		...(program.translations || []).map((translation) => translation.localizedProgramName),
	].filter(Boolean)
	for (const title of titles) {
		for (const [pattern, label] of titlePatterns) {
			if (pattern.test(title)) flags.push(label)
		}
	}

	const summaries = [
		program.summary,
		...(program.translations || []).map((translation) => translation.summary),
	].filter(Boolean)
	for (const summary of summaries) {
		for (const [pattern, label] of summaryPatterns) {
			if (pattern.test(summary)) flags.push(label)
		}
	}

	if (isDeeplyNestedProgramUrl(program.programUrl)) {
		flags.push("url: deeply nested below likely degree page")
	}
	if (!hasDegreeValidationSignal(program, titles)) {
		flags.push("validation: missing reliable degree-program signal")
	}
	if (titles.some((title) => suspiciousTitlePattern.test(title))) {
		flags.push("title: obvious module/project wording")
	}

	const uniqueFlags = Array.from(new Set(flags))
	const hideFromPublic = shouldHideFromPublic(uniqueFlags)

	return { flags: uniqueFlags, hideFromPublic }
}

function shouldHideFromPublic(flags) {
	return flags.some((flag) =>
		flag.startsWith("title:")
		|| flag === "validation: missing reliable degree-program signal"
		|| flag.includes("course section")
		|| flag.includes("research training")
		|| flag.includes("research area")
	)
}

function hasDegreeValidationSignal(program, titles) {
	const titleLooksSuspicious = titles.some((title) => suspiciousTitlePattern.test(title))
	if (titleLooksSuspicious) return false

	return useful(program.academicDegree)
		|| canonicalDegreeLevels.has(String(program.degreeLevel || "").trim())
		|| looksLikeStudyProgramUrl(program.programUrl)
}

function isDeeplyNestedProgramUrl(value) {
	if (!value) return false
	try {
		const parsed = new URL(value)
		const segments = parsed.pathname.split("/").filter(Boolean)
		const hasDegreeHint = segments.some((segment) => /studiengang|studiengaenge|degree|program|course|bachelor|master|phd|promotion/i.test(segment))
		return hasDegreeHint && segments.length >= 6
	} catch {
		return false
	}
}

function looksLikeStudyProgramUrl(value) {
	if (!value) return false
	try {
		const parsed = new URL(value)
		const path = decodeURIComponent(parsed.pathname).toLowerCase()
		return /(studiengang|studiengaenge|studienangebot|degree-program|degree-programs|study-program|study-programs|programmes?|programs?|bachelor|master|phd|doctorate|promotion|studium\/studienangebot)/i.test(path)
			&& !/(module|modul|project|projekt|seminar|lecture|publication|presentation|performance)/i.test(path)
	} catch {
		return false
	}
}

function useful(value) {
	const text = String(value || "").trim().toLowerCase()
	return Boolean(text) && !["unknown", "n/a", "na", "null"].includes(text)
}

function mergeFlags(existing, flags) {
	return Array.from(new Set([
		...String(existing || "").split(";").map((item) => item.trim()).filter(Boolean),
		...flags,
	]))
}

main()
	.catch((error) => {
		console.error(error)
		process.exitCode = 1
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
