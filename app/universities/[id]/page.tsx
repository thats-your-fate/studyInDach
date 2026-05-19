import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type UniversityPageProps = {
	params: { id: string }
}

export async function generateMetadata({ params }: UniversityPageProps): Promise<Metadata> {
	const university = await prisma.university.findUnique({ where: { id: params.id } })
	if (!university) return {}
	return {
		title: `${university.name} Degree Programs | Study in DACH`,
		description: `Browse degree programs at ${university.name}.`,
		alternates: {
			canonical: absoluteUrl(`/universities/${university.id}`),
			languages: {
				en: absoluteUrl(`/universities/${university.id}`),
				es: absoluteUrl(`/es/universidades/${university.id}`),
				"pt-BR": absoluteUrl(`/pt-br/universidades/${university.id}`),
				"x-default": absoluteUrl(`/universities/${university.id}`),
			},
		},
	}
}

export default async function UniversityPage({ params }: UniversityPageProps) {
	const university = await prisma.university.findUnique({
		where: { id: params.id },
		include: { programs: { orderBy: { programName: "asc" }, take: 30 } },
	})

	if (!university) notFound()

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-bank-line text-green-3" />
						&nbsp; university profile
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">{university.name}</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="program-detail-section mb-4">
						<div className="section-heading">
							<p>{[university.location, university.state].filter(Boolean).join(", ") || "DACH"}</p>
							<h2>Programs at {university.name}</h2>
						</div>
						<div className="university-panel-actions">
							<Link href={`/courses?university=${encodeURIComponent(university.name)}`}>View all programs</Link>
							{university.websiteUrl && <a href={university.websiteUrl} target="_blank">University website</a>}
						</div>
					</div>
					<div className="related-program-grid">
						{university.programs.map((program) => (
							<Link key={program.id} href={`/courses?university=${encodeURIComponent(university.name)}&degreeLevel=${encodeURIComponent(program.degreeLevel || "")}`} className="related-program-card">
								<span>{program.degreeLevel || "Program"}</span>
								<h3>{program.programName}</h3>
								<p>{program.subjectArea || program.studyField || "Study program"}</p>
							</Link>
						))}
					</div>
				</div>
			</section>
		</Layout>
	)
}
