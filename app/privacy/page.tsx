import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Privacy Policy | Study in DACH",
	alternates: {
		canonical: absoluteUrl("/privacy"),
		languages: {
			en: absoluteUrl("/privacy"),
			es: absoluteUrl("/es/privacidad"),
			"pt-BR": absoluteUrl("/pt-br/privacidade"),
			"x-default": absoluteUrl("/privacy"),
		},
	},
}

export default function PrivacyPage() {
	return (
		<Layout>
			<section className="position-relative pt-250-keep pb-120 bg-secondary-2">
				<div className="container">
					<div className="program-detail-section">
						<div className="section-heading">
							<p>Privacy</p>
							<h1>Privacy Policy</h1>
						</div>
						<p>This placeholder privacy policy should be replaced with the final data protection text before public launch.</p>
						<p>Contact inquiries are stored so Study in DACH can respond to submitted requests.</p>
						<p>Email: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
					</div>
				</div>
			</section>
		</Layout>
	)
}
