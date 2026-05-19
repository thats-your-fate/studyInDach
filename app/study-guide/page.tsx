import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "Study Guide | Study in DACH",
	description: "Practical notes for comparing degree programs, costs, language requirements, and official university information.",
	alternates: {
		canonical: absoluteUrl("/study-guide"),
		languages: {
			en: absoluteUrl("/study-guide"),
			es: absoluteUrl("/es/guia-para-estudiar"),
			"pt-BR": absoluteUrl("/pt-br/guia-de-estudos"),
			"x-default": absoluteUrl("/study-guide"),
		},
	},
}

const guideItems = [
	{
		title: "Check official deadlines",
		body: "Application dates vary by university, degree type, applicant background, and country. Always verify deadlines on the official program page.",
	},
	{
		title: "Understand language requirements",
		body: "English-taught programs may still require German for internships, daily life, or specific modules. Read the official admission requirements carefully.",
	},
	{
		title: "Compare real costs",
		body: "Tuition, semester fees, living costs, insurance, and visa proof-of-funds requirements are separate items. Treat missing fee data as unknown, not free.",
	},
]

export default function StudyGuide() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; study guide
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">Study Guide</h1>
				</div>
			</section>
			<section className="py-120 bg-white">
				<div className="container">
					<div className="row g-5 align-items-start">
						<div className="col-lg-5">
							<span className="btn-text text-primary">Study planning notes</span>
							<h2 className="my-3 text-anime-style-3">Use Study in DACH for discovery, then verify officially</h2>
							<p>Our filters help you shortlist programs across Germany, Austria, and Switzerland. Final application decisions should always be based on the university website.</p>
							<Link href="/courses" className="btn btn-primary mt-3 hover-up">Browse programs</Link>
						</div>
						<div className="col-lg-7">
							<div className="program-info-grid">
								{guideItems.map((item) => (
									<div className="program-summary-card" key={item.title}>
										<h3>{item.title}</h3>
										<p>{item.body}</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
