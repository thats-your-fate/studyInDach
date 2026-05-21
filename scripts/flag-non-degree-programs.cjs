#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

const titlePatterns = [
	[/\b(1st|2nd|3rd|4th)\s+year\b/i, "title: yearly section"],
	[/\b[1-4]\.\s*jahr\b/i, "title: yearly section"],
	[/\bmodule\b/i, "title: module"],
	[/\bmodul\b/i, "title: module"],
	[/\bproject\b/i, "title: project"],
	[/\bprojekt\b/i, "title: project"],
	[/\bresearch\s+module\b/i, "title: research module"],
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
	[/\bmodule\b/i, "summary mentions module"],
	[/\bproject\b/i, "summary mentions project"],
	[/\byear\b/i, "summary mentions year/section"],
	[/\bcourse\s+section\b/i, "summary mentions course section"],
	[/\bmodul\b/i, "summary mentions module"],
	[/\bprojekt\b/i, "summary mentions project"],
]

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

	for (const program of programs) {
		const flags = detectFlags(program)
		if (!flags.length) continue
		flagged += 1
		const qualityFlags = mergeFlags(program.qualityFlags, flags).join("; ")
		console.log(`#${program.id} ${program.programName}`)
		console.log(`  ${qualityFlags}`)
		if (!dryRun) {
			await prisma.degreeProgram.update({
				where: { id: program.id },
				data: {
					isLikelyDegreeProgram: false,
					reviewStatus: "pending",
					qualityFlags,
				},
			})
		}
	}

	console.log(`${dryRun ? "Would flag" : "Flagged"} ${flagged} of ${programs.length} rows.`)
}

function detectFlags(program) {
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
	if (!useful(program.academicDegree) && likelyGuessedDegreeLevel(program.degreeLevel)) {
		flags.push("degree: missing academicDegree with guessed degreeLevel")
	}
	if (titles.some((title) => /\b(module|modul|project|projekt|lecture|seminar|workshop)\b/i.test(title))) {
		flags.push("title: obvious module/project wording")
	}

	return Array.from(new Set(flags))
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

function likelyGuessedDegreeLevel(value) {
	return ["Bachelor", "Master", "Doctorate", "Other"].includes(String(value || ""))
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
