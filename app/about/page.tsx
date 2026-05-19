import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
	title: "About Study in DACH",
	description: "Learn about Study in DACH, a discovery platform for degree programs in Germany, Austria, and Switzerland.",
	alternates: {
		canonical: absoluteUrl("/about"),
		languages: {
			en: absoluteUrl("/about"),
			"pt-BR": absoluteUrl("/pt-br/sobre"),
			"x-default": absoluteUrl("/about"),
		},
	},
}

export default function About() {
	return (
		<Layout>
			<section className="elearning-about-section-1 position-relative pt-250-keep pb-120 pb-lg-150 bg-primary rounded-bottom-4 overflow-hidden">
				<div className="banner-line">
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop-reverse" />
					<div className="vertical-effect border-opacity-10 border-end border-white" />
					<div className="vertical-effect border-opacity-10 border-end border-white raindrop d-none d-lg-block" />
					<div className="vertical-effect border-opacity-10 border-end border-white d-none d-lg-block" />
				</div>
				<div className="container position-relative pt-8 text-center">
					<span className="content-top btn-text fw-bold text-white">
						<i className="ri-git-repository-line text-green-3" />
						&nbsp; about the platform
					</span>
					<h1 className="text-white ds-1 lh-sm mb-0 text-anime-style-2">About Study in DACH</h1>
				</div>
			</section>
			<section className="elearning-about-section-2 position-relative overflow-hidden pt-120 pb-120 rounded-bottom-4 bg-white z-35">
				<div className="container">
					<div className="row align-items-center g-5">
						<div className="col-lg-6">
							<img className="rounded-4" src="/assets/imgs/pages/learning/page-about/img-1.png" alt="Students researching universities" />
						</div>
						<div className="col-lg-6">
							<span className="btn-text text-primary">Germany, Austria, Switzerland</span>
							<h2 className="my-3 text-anime-style-3">A cleaner way to discover degree programs</h2>
							<p className="pb-4">Study in DACH helps international students explore degree programs using normalized fields such as country, degree level, study field, language, tuition type, study mode, admission difficulty, and start term.</p>
							<p className="pb-4">The platform combines public university sources, structured extraction, localization, and filterable metadata so students can move from broad discovery to official university pages faster.</p>
							<Link href="/courses" className="btn btn-outline-secondary mt-3 hover-up">
								<span>Browse programs</span>
							</Link>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
