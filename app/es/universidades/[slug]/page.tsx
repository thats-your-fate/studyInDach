import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { programDetailPath } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Params = { params: { slug: string } }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.slug } })
	if (!university) return {}
	return {
		title: `${university.name} - programas de estudio | Study in DACH`,
		description: `Explora programas de estudio de ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/es/universidades/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityEsPage({ params }: Params) {
	const university = await prisma.university.findUnique({
		where: { id: params.slug },
		include: {
			programs: {
				include: { translations: { where: { locale: "es" }, take: 1 } },
				orderBy: [{ degreeLevel: "asc" }, { programName: "asc" }],
			},
		},
	})
	if (!university) notFound()

	const location = [university.location, optionLabel(university.state || "", "es")].filter(Boolean).join(", ")
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{location}</p>
							<h1>{university.name}</h1>
							<h2>{university.name} - programas de estudio</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/es/programas?university=${encodeURIComponent(university.name)}`}>Ver todos los programas</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">Sitio web de la universidad</a>}
						</div>
					</div>
					<div className="related-program-grid">
						{university.programs.map((program) => {
							const title = program.translations[0]?.localizedProgramName || program.programName
							const degree = optionLabel(program.degreeLevel || "Program", "es")
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
									}, "es")}
									className="related-program-card"
								>
									{showDegree && <span>{degree}</span>}
									<h3>{title}</h3>
									<p>{optionLabel(program.studyField || program.subjectArea || "Study program", "es")}</p>
								</Link>
							)
						})}
					</div>
				</div>
			</section>
		</Layout>
	)
}

function startsWithDegree(title: string, degree: string) {
	return normalizeText(title).startsWith(`${normalizeText(degree)} `)
}

function normalizeText(value: string) {
	return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim()
}
