import Layout from "@/components/layout/Layout"
import { prisma } from "@/lib/prisma"
import { absoluteUrl } from "@/lib/seo"
import { getUniversityUrl, publicProgramWhere, publicUniversityWhere } from "@/lib/study-programs"
import { formatLocation, formatUniversityProgramCount } from "@/lib/university-display"
import type { Metadata } from "next"
import Link from "next/link"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
	title: "Universities in Germany, Austria and Switzerland | Study in DACH",
	description: "Explore universities with degree programs in the Study in DACH database.",
	alternates: {
		canonical: absoluteUrl("/universities"),
		languages: {
			en: absoluteUrl("/universities"),
			es: absoluteUrl("/es/universidades"),
			"pt-BR": absoluteUrl("/pt-br/universidades"),
			"x-default": absoluteUrl("/universities"),
		},
	},
}

export default async function Universities() {
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
						&nbsp; university index
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Universities</h1>
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
										<span>{formatLocation(university.location, university.state, null, "en") || "DACH"}</span>
										<strong>{university.name}</strong>
										<p className="mb-0 mt-2">{formatUniversityProgramCount(university._count.programs, "en")}</p>
										<Link href={getUniversityUrl(university, "en")} className="d-inline-block mt-3">View university profile</Link>
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
