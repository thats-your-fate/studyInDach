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
		"/pt-br/privacidade",
		"/pt-br/estudar-na-alemanha",
		"/pt-br/mestrado-na-alemanha",
		"/pt-br/mestrado-na-alemanha-em-ingles",
		"/pt-br/universidades-publicas-na-alemanha",
		"/pt-br/estudar-informatica-na-alemanha",
		"/pt-br/estudar-engenharia-na-alemanha",
		"/pt-br/doutorado-na-alemanha",
		"/es/programas",
		"/es/universidades",
		"/es/guia-para-estudiar",
		"/es/sobre",
		"/es/privacidad",
	].map((path) => ({
		url: absoluteUrl(path),
		lastModified: now,
	}))
	const filters = [
		"/courses?degreeLevel=Bachelor",
		"/courses?degreeLevel=Master",
		"/courses?degreeLevel=Doctorate",
		"/courses?languageOfInstruction=English",
		"/courses?country=Germany",
		"/courses?country=Austria",
		"/courses?country=Switzerland",
		"/courses?studyField=Computer%20Science%20%26%20Data",
		"/pt-br/cursos?degreeLevel=Master",
		"/pt-br/cursos?languageOfInstruction=English",
		"/pt-br/cursos?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only",
		"/es/programas?degreeLevel=Master",
		"/es/programas?languageOfInstruction=English",
		"/es/programas?tuitionType=No%20Tuition%20%2F%20Semester%20Fee%20Only",
	].map((path) => ({ url: absoluteUrl(path), lastModified: now }))
	const universityUrls = universities.map((university) => ({
		url: absoluteUrl(`/universities/${university.id}`),
		lastModified: now,
	}))
	const translatedUniversityUrls = universities.map((university) => ({
		url: absoluteUrl(`/pt-br/universidades/${university.id}`),
		lastModified: now,
	}))
	const spanishUniversityUrls = universities.map((university) => ({
		url: absoluteUrl(`/es/universidades/${university.id}`),
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
				title: program.translations.find((translation) => translation.locale === "pt")?.localizedProgramName || program.programName,
				degreeLevel: program.degreeLevel || "Degree program",
				universityName: program.university.name,
			}, "pt-br")),
			lastModified: now,
		}))
	const spanishProgramUrls = programs
		.filter((program) => program.translations.some((translation) => translation.locale === "es"))
		.map((program) => ({
			url: absoluteUrl(programDetailPath({
				id: program.id,
				title: program.translations.find((translation) => translation.locale === "es")?.localizedProgramName || program.programName,
				degreeLevel: program.degreeLevel || "Degree program",
				universityName: program.university.name,
			}, "es")),
			lastModified: now,
		}))
	return [...main, ...filters, ...universityUrls, ...translatedUniversityUrls, ...spanishUniversityUrls, ...programUrls, ...translatedProgramUrls, ...spanishProgramUrls]
}
