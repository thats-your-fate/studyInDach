import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { programDetailPath } from "@/lib/study-programs"
import type { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [programs, universities] = await Promise.all([
		prisma.degreeProgram.findMany({ include: { university: true, translations: true }, orderBy: { id: "asc" } }),
		prisma.university.findMany({ orderBy: { name: "asc" } }),
	])
	const now = new Date()
	const main = [
		"/",
		"/courses",
		"/universities",
		"/study-guide",
		"/about",
		"/impressum",
		"/privacy",
		"/pt-br/cursos",
		"/pt-br/universidades",
		"/pt-br/guia-de-estudos",
		"/pt-br/sobre",
	].map((path) => ({
		url: absoluteUrl(path),
		lastModified: now,
	}))
	const filters = [
		"/courses?degreeLevel=Bachelor",
		"/courses?degreeLevel=Master",
		"/courses?degreeLevel=Doctorate",
		"/courses?language=English",
		"/courses?country=Germany",
		"/courses?country=Austria",
		"/courses?country=Switzerland",
		"/courses?studyField=Computer%20Science%20%26%20Data",
	].map((path) => ({ url: absoluteUrl(path), lastModified: now }))
	const universityUrls = universities.map((university) => ({
		url: absoluteUrl(`/universities/${university.id}`),
		lastModified: now,
	}))
	const programUrls = programs.map((program) => ({
		url: absoluteUrl(programDetailPath({
			id: program.id,
			title: program.programName,
			degreeLevel: program.degreeLevel || "Degree program",
			universityName: program.university.name,
		})),
		lastModified: now,
	}))
	const translatedProgramUrls = programs
		.filter((program) => program.translations.some((translation) => translation.locale === "pt"))
		.map((program) => ({
			url: absoluteUrl(programDetailPath({
				id: program.id,
				title: program.programName,
				degreeLevel: program.degreeLevel || "Degree program",
				universityName: program.university.name,
			}, "pt-br")),
			lastModified: now,
		}))
	return [...main, ...filters, ...universityUrls, ...programUrls, ...translatedProgramUrls]
}
