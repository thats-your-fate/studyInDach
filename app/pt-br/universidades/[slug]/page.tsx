import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { programDetailPath } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type UniversityPageProps = {
	params: { slug: string }
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	return {
		title: `${university.name} - programas de estudo | Study in DACH`,
		description: `Explore programas de estudo na ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/pt-br/universidades/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityPtPage({ params }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				orderBy: { programName: "asc" },
				take: 30,
				include: {
					translations: { where: { locale: "pt" }, take: 1 },
				},
			},
		},
	})

	if (!university) notFound()

	const location = [university.location, optionLabel(university.state || "", "pt-br")].filter(Boolean).join(", ") || "DACH"

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-bank-line text-green-3" />
						&nbsp; perfil da universidade
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{university.name}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{location}</p>
							<h2>{university.name} - programas de estudo</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/pt-br/cursos?university=${encodeURIComponent(university.name)}`}>Ver todos os programas</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">Site da universidade</a>}
						</div>
					</div>
					<div className="related-program-grid">
						{university.programs.map((program) => {
							const title = cleanPtProgramTitle(program.translations[0]?.localizedProgramName || program.programName)
							const degree = optionLabel(program.degreeLevel || "Program", "pt-br")
							const showDegree = !startsWithDegree(title, degree)
							return (
								<Link
									key={program.id}
									href={programDetailPath({
										id: program.id,
										title,
										originalTitle: program.programName,
										degreeLevel: program.degreeLevel || "Degree program",
										universityName: university.name,
									}, "pt-br")}
									className="related-program-card"
								>
									{showDegree && <span>{degree}</span>}
									<h3>{title}</h3>
									<p>{optionLabel(program.studyField || program.subjectArea || "Study program", "pt-br")}</p>
								</Link>
							)
						})}
					</div>
				</div>
			</section>
		</Layout>
	)
}

function cleanPtProgramTitle(value: string) {
	return value.replace(/^Mestre em\s+/i, "Mestrado em ")
}

function startsWithDegree(title: string, degree: string) {
	return normalizeText(title).startsWith(`${normalizeText(degree)} `)
}

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
}
