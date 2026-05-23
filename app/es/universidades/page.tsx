import Layout from "@/components/layout/Layout"
import { optionLabel } from "@/lib/i18n"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { publicProgramWhere, publicUniversityWhere } from "@/lib/study-programs"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Universidades en Alemania, Austria y Suiza | Study in DACH",
	description: "Explora universidades con programas registrados en Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/es/universidades"),
		languages: {
			en: absoluteUrl("/universities"),
			es: absoluteUrl("/es/universidades"),
			"pt-BR": absoluteUrl("/pt-br/universidades"),
			"x-default": absoluteUrl("/universities"),
		},
	},
}

export default async function UniversitiesEs() {
	const universities = await prisma.university.findMany({
		where: publicUniversityWhere,
		orderBy: [{ state: "asc" }, { name: "asc" }],
		include: { _count: { select: { programs: { where: publicProgramWhere } } } },
	})

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white"><i className="ri-git-repository-line text-green-3" />&nbsp; índice de universidades</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Universidades</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-4">
						{universities.map((university) => (
							<div className="col-lg-4 col-md-6" key={university.id}>
								<div className="program-info-card h-100">
									<i className="ri-bank-line" />
									<div>
										<span>{[optionLabel(university.location || "", "es"), optionLabel(university.state || "", "es")].filter(Boolean).join(", ") || "DACH"}</span>
										<strong>{university.name}</strong>
										<p className="mb-0 mt-2">{university._count.programs} programas en la base de datos</p>
										<Link href={`/es/universidades/${university.id}`} className="d-inline-block mt-3">Ver perfil de la universidad</Link>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		</Layout>
	)
}
