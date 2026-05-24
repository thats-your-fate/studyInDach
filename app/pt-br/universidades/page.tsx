import Layout from "@/components/layout/Layout"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getUniversityUrl, publicProgramWhere, publicUniversityWhere } from "@/lib/study-programs"
import { formatLocation, formatUniversityProgramCount } from "@/lib/university-display"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Universidades na Alemanha, Áustria e Suíça | Study in DACH",
	description: "Explore universidades com programas cadastrados no Study in DACH.",
	alternates: {
		canonical: absoluteUrl("/pt-br/universidades"),
		languages: {
			en: absoluteUrl("/universities"),
			es: absoluteUrl("/es/universidades"),
			"pt-BR": absoluteUrl("/pt-br/universidades"),
			"x-default": absoluteUrl("/universities"),
		},
	},
}

export default async function UniversitiesPt() {
	const universities = await prisma.university.findMany({
		where: publicUniversityWhere,
		orderBy: [{ state: "asc" }, { name: "asc" }],
		include: { _count: { select: { programs: { where: publicProgramWhere } } } },
	})

	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; índice de universidades
					</span>
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
										<span>{formatLocation(university.location, university.state, null, "pt-br") || "DACH"}</span>
										<strong>{university.name}</strong>
										<p className="mb-0 mt-2">{formatUniversityProgramCount(university._count.programs, "pt-br")}</p>
										<Link href={getUniversityUrl(university, "pt-br")} className="d-inline-block mt-3">Ver perfil da universidade</Link>
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
