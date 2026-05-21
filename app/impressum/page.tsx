import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Impressum | Study in DACH",
	alternates: {
		canonical: absoluteUrl("/impressum"),
	},
}

export default function ImpressumPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Legal notice</p>
							<h1>Impressum</h1>
						</div>
						<div className="program-summary-grid">
							<div className="program-summary-card">
								<h3>Operator</h3>
								<p>Study in DACH is operated as an independent study-discovery project.</p>
								<p>Email: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
							</div>
							<div className="program-summary-card">
								<h3>Responsible contact</h3>
								<p>For legal notices, privacy requests, data corrections, or questions about program listings, contact the operator by email.</p>
								<p><a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
							</div>
							<div className="program-summary-card">
								<h3>Platform purpose</h3>
								<p>Study in DACH is an independent discovery platform for degree programs in Germany, Austria, and Switzerland.</p>
								<p>We are not an official university website and do not represent the universities listed on this platform.</p>
							</div>
							<div className="program-summary-card">
								<h3>External links</h3>
								<p>Program pages link to official university websites and other public sources. We do not control external websites and are not responsible for their current content.</p>
							</div>
						</div>
						<div className="university-panel mt-5">
							<p className="mb-0">Program information is collected from public university sources and may be incomplete or outdated. Study in DACH provides orientation and discovery only. Always verify deadlines, fees, admission requirements, and application details on the official university website.</p>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}
