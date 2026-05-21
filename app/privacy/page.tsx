import Layout from "@/components/layout/Layout"
import { absoluteUrl } from "@/lib/seo"
import type { Metadata } from "next"
import type { ReactNode } from "react"

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
						<p>Study in DACH is independent and is not an official university website. We collect only the information needed to operate the website, respond to inquiries, and improve the service.</p>
						<div className="program-summary-grid">
							<PrivacyCard title="Contact form inquiries">
								<p>When you submit the contact or free orientation form, we store the details you provide, such as your name, email address, country of residence, preferred study country, message, consent confirmation, selected program, locale, source page, referrer, and UTM parameters if present.</p>
								<p>We use this information to respond to your inquiry and understand which pages generate requests.</p>
							</PrivacyCard>
							<PrivacyCard title="Email contact">
								<p>If you contact us by email, we process your email address and message so we can reply. Your email provider and our email provider may process technical delivery data.</p>
							</PrivacyCard>
							<PrivacyCard title="Server logs">
								<p>The hosting provider may create server logs containing technical data such as IP address, browser information, requested URL, timestamp, and error information. These logs are used for security, debugging, and reliable website delivery.</p>
							</PrivacyCard>
							<PrivacyCard title="Analytics">
								<p>Study in DACH does not currently use an external analytics service in this codebase. If analytics are added later, this page must be updated immediately with the provider, purpose, retention period, and opt-out information.</p>
							</PrivacyCard>
							<PrivacyCard title="Legal basis and retention">
								<p>Inquiry data is processed to respond to your request and to take steps requested by you before any possible service relationship. Basic technical logs are processed for legitimate security and operational interests.</p>
								<p>We keep inquiries only as long as needed for follow-up, service administration, and reasonable record keeping, then delete or anonymize them when they are no longer needed.</p>
							</PrivacyCard>
							<PrivacyCard title="Your contact point">
								<p>For privacy questions, correction requests, or deletion requests, contact: <a href="mailto:y3591vy@gmail.com">y3591vy@gmail.com</a></p>
							</PrivacyCard>
						</div>
					</div>
				</div>
			</section>
		</Layout>
	)
}

function PrivacyCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="program-summary-card">
			<h3>{title}</h3>
			{children}
		</div>
	)
}
