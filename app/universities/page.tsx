import Layout from "@/components/layout/Layout"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Universities() {
	const universities = await prisma.university.findMany({
		orderBy: [{ state: "asc" }, { name: "asc" }],
		include: { _count: { select: { programs: true } } },
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
										<span>{[university.location, university.state].filter(Boolean).join(", ") || "DACH"}</span>
										<strong>{university.name}</strong>
										<p className="mb-0 mt-2">{university._count.programs} programs in the database</p>
										<Link href={`/universities/${university.id}`} className="d-inline-block mt-3">View university profile</Link>
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
