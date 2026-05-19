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
						<p>This placeholder legal notice should be replaced with the required operator information before public launch.</p>
						<p>Email: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
